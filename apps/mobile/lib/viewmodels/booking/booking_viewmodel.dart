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

  Future<void> fetchMyBookings() async {
    final token = _authViewmodel.token.value;
    if (token.isEmpty) {
      Get.snackbar('Error', 'Not authenticated', backgroundColor: Colors.red.shade100);
      return;
    }

    try {
      isLoading.value = true;
      final response = await _bookingService.findAll(token);

      if (response['success']) {
        final List data = response['data'] ?? [];
        myBookings.value = data.map((json) => BookingModel.fromJson(json)).toList();
      } else {
        Get.snackbar('Error', response['message'] ?? 'Failed to fetch bookings', backgroundColor: Colors.red.shade100);
      }
    } catch (e) {
      Get.snackbar('Error', e.toString(), backgroundColor: Colors.red.shade100);
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> createBooking(Map<String, dynamic> data) async {
    final token = _authViewmodel.token.value;
    if (token.isEmpty) {
      Get.snackbar('Error', 'Not authenticated', backgroundColor: Colors.red.shade100);
      return;
    }

    try {
      isLoading.value = true;
      final response = await _bookingService.createBooking(token: token, data: data);

      if (response['success']) {
        Get.snackbar('Success', 'Booking successful!', backgroundColor: Colors.green.shade100);
        await fetchMyBookings();
        Get.back();
      } else {
        Get.snackbar('Error', response['message'] ?? 'Failed to book', backgroundColor: Colors.red.shade100);
      }
    } catch (e) {
      Get.snackbar('Error', e.toString(), backgroundColor: Colors.red.shade100);
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> cancelBooking(String id) async {
    final token = _authViewmodel.token.value;
    if (token.isEmpty) return;

    try {
      isLoading.value = true;
      final response = await _bookingService.cancelBooking(token, id);

      if (response['success']) {
        Get.snackbar('Success', 'Booking cancelled', backgroundColor: Colors.green.shade100);
        await fetchMyBookings();
      } else {
        Get.snackbar('Error', response['message'] ?? 'Failed to cancel', backgroundColor: Colors.red.shade100);
      }
    } catch (e) {
      Get.snackbar('Error', e.toString(), backgroundColor: Colors.red.shade100);
    } finally {
      isLoading.value = false;
    }
  }
}
