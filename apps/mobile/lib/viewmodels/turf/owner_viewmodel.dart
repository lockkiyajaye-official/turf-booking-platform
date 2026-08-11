import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/storage/local_storage.dart';
import 'package:mobile/data/services/booking_service.dart';
import 'package:mobile/data/services/payment_service.dart';
import 'package:mobile/data/services/turf_service.dart';
import 'package:mobile/data/models/turf_model.dart';

class OwnerViewmodel extends GetxController {
  final TurfService _turfService = TurfService();
  final BookingService _bookingService = BookingService();
  final PaymentService _paymentService = PaymentService();

  var isLoading = false.obs;
  var isBookingsLoading = false.obs;
  var isTurfsLoading = false.obs;
  var isFinancesLoading = false.obs;

  var myTurfs = <TurfModel>[].obs;
  var allBookings = <Map<String, dynamic>>[].obs;
  var recentBookings = <Map<String, dynamic>>[].obs;
  var stats = <String, dynamic>{}.obs;

  // Finances
  var walletBalance = 0.0.obs;
  var totalEarnings = 0.0.obs;
  var payoutHistory = <Map<String, dynamic>>[].obs;

  String get _token => Get.find<LocalStorageService>().getToken() ?? '';

  void _showError(String msg) => Get.snackbar(
        'Error', msg,
        backgroundColor: Colors.red.shade100,
        snackPosition: SnackPosition.BOTTOM,
      );

  void _showSuccess(String msg) => Get.snackbar(
        'Success', msg,
        backgroundColor: Colors.green.shade100,
        snackPosition: SnackPosition.BOTTOM,
      );

  // ── Dashboard ────────────────────────────────────────────
  Future<void> loadDashboard() async {
    try {
      isLoading.value = true;
      await Future.wait([fetchMyTurfs(), fetchAllBookings()]);
      _computeStats();
    } finally {
      isLoading.value = false;
    }
  }

  void _computeStats() {
    final totalRevenue = allBookings
        .where((b) => (b['status'] as String? ?? '').toLowerCase() == 'confirmed')
        .fold<num>(0, (sum, b) => sum + (b['totalPrice'] as num? ?? b['totalAmount'] as num? ?? b['price'] as num? ?? 0));

    stats.value = {
      'totalTurfs': myTurfs.length,
      'totalBookings': allBookings.length,
      'totalRevenue': totalRevenue,
    };

    recentBookings.value = allBookings.take(10).toList();
  }

  // ── Turfs ────────────────────────────────────────────────
  Future<void> fetchMyTurfs() async {
    try {
      isTurfsLoading.value = true;
      final res = await _turfService.findMyTurfs(_token);
      if (res['success']) {
        final data = res['data'];
        List<dynamic> list = [];
        if (data is List) {
          list = data;
        } else if (data is Map && data['turfs'] is List) {
          list = data['turfs'];
        }
        myTurfs.value =
            list.map((e) => TurfModel.fromJson(e as Map<String, dynamic>)).toList();
      }
    } catch (_) {
    } finally {
      isTurfsLoading.value = false;
    }
  }

  Future<void> publishTurf(String id) async {
    try {
      final res = await _turfService.publishTurf(_token, id);
      if (res['success']) {
        _showSuccess('Turf published successfully');
        await fetchMyTurfs();
      } else {
        _showError(res['message'] ?? 'Failed to publish');
      }
    } catch (e) {
      _showError(e.toString());
    }
  }

  Future<void> unpublishTurf(String id) async {
    try {
      final res = await _turfService.unpublishTurf(_token, id);
      if (res['success']) {
        _showSuccess('Turf unpublished');
        await fetchMyTurfs();
      } else {
        _showError(res['message'] ?? 'Failed to unpublish');
      }
    } catch (e) {
      _showError(e.toString());
    }
  }

  // ── Bookings ─────────────────────────────────────────────
  Future<void> fetchAllBookings() async {
    try {
      isBookingsLoading.value = true;
      final res = await _bookingService.findAll(_token);
      if (res['success']) {
        final data = res['data'];
        List<dynamic> list = [];
        if (data is List) {
          list = data;
        } else if (data is Map && data['bookings'] is List) {
          list = data['bookings'];
        }
        allBookings.value = list.cast<Map<String, dynamic>>();
      }
    } catch (_) {
    } finally {
      isBookingsLoading.value = false;
    }
  }

  Future<void> confirmBooking(String id) async {
    try {
      final res = await _bookingService.updateStatus(
          token: _token, id: id, status: 'confirmed');
      if (res['success']) {
        _showSuccess('Booking confirmed');
        await fetchAllBookings();
        _computeStats();
      } else {
        _showError(res['message'] ?? 'Failed to confirm');
      }
    } catch (e) {
      _showError(e.toString());
    }
  }

  Future<void> cancelBooking(String id) async {
    try {
      final res = await _bookingService.cancelBooking(_token, id);
      if (res['success']) {
        _showSuccess('Booking cancelled');
        await fetchAllBookings();
        _computeStats();
      } else {
        _showError(res['message'] ?? 'Failed to cancel');
      }
    } catch (e) {
      _showError(e.toString());
    }
  }

  // ── Finances & Payouts ────────────────────────────────────
  Future<void> fetchFinancesSummary() async {
    try {
      isFinancesLoading.value = true;
      final res = await _paymentService.getOwnerSummary(_token);
      if (res['success']) {
        final data = res['data'] ?? {};
        walletBalance.value = double.tryParse((data['walletBalance'] ?? 0).toString()) ?? 0.0;
        totalEarnings.value = double.tryParse((data['totalEarnings'] ?? 0).toString()) ?? 0.0;
        final list = data['payouts'] ?? data['history'] ?? [];
        if (list is List) {
          payoutHistory.value = list.cast<Map<String, dynamic>>();
        }
      }
    } catch (_) {
    } finally {
      isFinancesLoading.value = false;
    }
  }

  Future<bool> requestPayout(double amount) async {
    try {
      isFinancesLoading.value = true;
      final res = await _paymentService.requestPayout(_token, amount);
      if (res['success']) {
        _showSuccess('Payout request submitted successfully');
        await fetchFinancesSummary();
        return true;
      } else {
        _showError(res['message'] ?? 'Failed to request payout');
        return false;
      }
    } catch (e) {
      _showError(e.toString());
      return false;
    } finally {
      isFinancesLoading.value = false;
    }
  }
}