import 'package:get/get.dart';
import 'package:mobile/data/models/booking_model.dart';
import 'package:mobile/data/services/booking_service.dart';
import 'package:mobile/viewmodels/auth/auth_viewmodel.dart';
import 'package:flutter/material.dart';

class BookingViewmodel extends GetxController {
  final BookingService _bookingService = BookingService();
  final AuthViewmodel _authViewmodel = Get.find<AuthViewmodel>();

  var isLoading = false.obs;
  var myBookings = <BookingModel>[].obs;
  var selectedBooking = Rxn<BookingModel>();

  // Pagination state
  var bookingsPage = 1.obs;
  var bookingsHasMore = true.obs;
  var isFetchingMoreBookings = false.obs;

  Future<void> fetchMyBookings() async {
    final token = _authViewmodel.token.value;
    if (token.isEmpty) {
      return;
    }

    try {
      isLoading.value = true;
      bookingsPage.value = 1;
      bookingsHasMore.value = true;
      final response = await _bookingService.findAll(token, page: 1, limit: 10);

      if (response['success']) {
        final raw = response['data'];
        final List data = raw is List
            ? raw
            : (raw is Map && raw['items'] is List ? raw['items'] : []);
        myBookings.value = data
            .map((json) => BookingModel.fromJson(json))
            .toList();
        if (raw is Map && raw.containsKey('hasMore')) {
          bookingsHasMore.value = raw['hasMore'] == true;
        } else {
          bookingsHasMore.value = data.length >= 10;
        }
      } else {
        Get.snackbar(
          'Error',
          response['message'] ?? 'Failed to fetch bookings',
          backgroundColor: Colors.red.shade100,
        );
      }
    } catch (e) {
      Get.snackbar('Error', e.toString(), backgroundColor: Colors.red.shade100);
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> loadNextPage() async {
    if (!bookingsHasMore.value || isFetchingMoreBookings.value) return;
    final token = _authViewmodel.token.value;
    if (token.isEmpty) return;

    try {
      isFetchingMoreBookings.value = true;
      final nextPage = bookingsPage.value + 1;
      final response = await _bookingService.findAll(token, page: nextPage, limit: 10);

      if (response['success']) {
        final raw = response['data'];
        final List data = raw is List
            ? raw
            : (raw is Map && raw['items'] is List ? raw['items'] : []);
        final newBookings = data.map((json) => BookingModel.fromJson(json)).toList();

        final existingIds = myBookings.map((b) => b.id).toSet();
        final fresh = newBookings.where((b) => !existingIds.contains(b.id)).toList();
        myBookings.addAll(fresh);

        bookingsPage.value = nextPage;
        if (raw is Map && raw.containsKey('hasMore')) {
          bookingsHasMore.value = raw['hasMore'] == true;
        } else {
          bookingsHasMore.value = data.length >= 10;
        }
      }
    } catch (e) {
      debugPrint('Error loading next bookings page: $e');
    } finally {
      isFetchingMoreBookings.value = false;
    }
  }

  Future<void> createBooking(Map<String, dynamic> data) async {
    final token = _authViewmodel.token.value;
    if (token.isEmpty) {
      Get.snackbar(
        'Error',
        'Not authenticated',
        backgroundColor: Colors.red.shade100,
      );
      return;
    }

    try {
      isLoading.value = true;
      final response = await _bookingService.createBooking(
        token: token,
        data: data,
      );

      if (response['success']) {
        Get.snackbar(
          'Success',
          'Booking successful!',
          backgroundColor: Colors.green.shade100,
        );
        await fetchMyBookings();
        Get.back();
      } else {
        Get.snackbar(
          'Error',
          response['message'] ?? 'Failed to book',
          backgroundColor: Colors.red.shade100,
        );
      }
    } catch (e) {
      Get.snackbar('Error', e.toString(), backgroundColor: Colors.red.shade100);
    } finally {
      isLoading.value = false;
    }
  }

  Future<Map<String, dynamic>?> getCancellationPreview(String id) async {
    final token = _authViewmodel.token.value;
    if (token.isEmpty) return null;

    try {
      final response = await _bookingService.getCancellationPreview(token, id);
      if (response['success'] == true) {
        return response['data'] as Map<String, dynamic>;
      } else {
        debugPrint('getCancellationPreview error: ${response['message']}');
        return null;
      }
    } catch (e) {
      debugPrint('getCancellationPreview exception: $e');
      return null;
    }
  }

  Future<bool> cancelBooking(String id, {String? reason}) async {
    final token = _authViewmodel.token.value;
    if (token.isEmpty) return false;

    try {
      isLoading.value = true;
      final response = await _bookingService.cancelBooking(
        token,
        id,
        reason: reason,
      );

      if (response['success'] == true) {
        await fetchMyBookings();
        return true;
      } else {
        debugPrint('cancelBooking error: ${response['message']}');
        return false;
      }
    } catch (e) {
      debugPrint('cancelBooking exception: $e');
      return false;
    } finally {
      isLoading.value = false;
    }
  }
}
