import 'package:get/get.dart';
import 'package:mobile/data/models/dashboard_stats_model.dart';
import 'package:mobile/data/models/booking_model.dart';
import 'package:mobile/data/services/dashboard_service.dart';
import 'package:mobile/viewmodels/auth/auth_viewmodel.dart';
import 'package:flutter/material.dart';

class DashboardViewmodel extends GetxController {
  final DashboardService _dashboardService = DashboardService();
  final AuthViewmodel _authViewmodel = Get.find<AuthViewmodel>();

  var isLoading = false.obs;
  var stats = Rxn<DashboardStatsModel>();
  var recentBookings = <BookingModel>[].obs;

  Future<void> fetchOwnerDashboard() async {
    final token = _authViewmodel.token.value;
    if (token.isEmpty) {
      Get.snackbar('Error', 'Not authenticated', backgroundColor: Colors.red.shade100);
      return;
    }

    try {
      isLoading.value = true;
      
      // Fetch stats
      final statsResponse = await _dashboardService.getStatistics(token);
      if (statsResponse['success']) {
        stats.value = DashboardStatsModel.fromJson(statsResponse['data']);
      } else {
        Get.snackbar('Error', statsResponse['message'] ?? 'Failed to fetch dashboard stats', backgroundColor: Colors.red.shade100);
      }

      // Fetch recent bookings
      final bookingsResponse = await _dashboardService.getBookings(token: token);
      if (bookingsResponse['success']) {
         final List data = bookingsResponse['data'] ?? [];
         recentBookings.value = data.map((json) => BookingModel.fromJson(json)).toList();
      }

    } catch (e) {
      Get.snackbar('Error', e.toString(), backgroundColor: Colors.red.shade100);
    } finally {
      isLoading.value = false;
    }
  }
}
