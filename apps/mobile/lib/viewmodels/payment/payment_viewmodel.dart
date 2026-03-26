import 'package:get/get.dart';
import 'package:mobile/data/models/payment_model.dart';
import 'package:mobile/data/services/payment_service.dart';
import 'package:mobile/viewmodels/auth/auth_viewmodel.dart';
import 'package:flutter/material.dart';

class PaymentViewmodel extends GetxController {
  final PaymentService _paymentService = PaymentService();
  final AuthViewmodel _authViewmodel = Get.find<AuthViewmodel>();

  var isLoading = false.obs;
  var paymentHistory = <PaymentModel>[].obs;
  
  // Owner stats
  var ownerSummary = <String, dynamic>{}.obs;

  Future<void> fetchPaymentHistory() async {
    final token = _authViewmodel.token.value;
    if (token.isEmpty) {
      Get.snackbar('Error', 'Not authenticated', backgroundColor: Colors.red.shade100);
      return;
    }

    try {
      isLoading.value = true;
      final response = await _paymentService.history(token);

      if (response['success']) {
        final List data = response['data'] ?? [];
        paymentHistory.value = data.map((json) => PaymentModel.fromJson(json)).toList();
      } else {
        Get.snackbar('Error', response['message'] ?? 'Failed to fetch payment history', backgroundColor: Colors.red.shade100);
      }
    } catch (e) {
      Get.snackbar('Error', e.toString(), backgroundColor: Colors.red.shade100);
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> fetchOwnerSummary() async {
    final token = _authViewmodel.token.value;
    if (token.isEmpty) return;

    try {
      isLoading.value = true;
      final response = await _paymentService.ownerSummary(token);

      if (response['success']) {
        ownerSummary.value = Map<String, dynamic>.from(response['data'] ?? {});
      } else {
        Get.snackbar('Error', response['message'] ?? 'Failed to load summary', backgroundColor: Colors.red.shade100);
      }
    } catch (e) {
      Get.snackbar('Error', e.toString(), backgroundColor: Colors.red.shade100);
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> requestPayout(double amount) async {
    final token = _authViewmodel.token.value;
    if (token.isEmpty) return;

    try {
      isLoading.value = true;
      final response = await _paymentService.requestPayout(token: token, amount: amount);

      if (response['success']) {
        Get.snackbar('Success', 'Payout requested successfully', backgroundColor: Colors.green.shade100);
        await fetchOwnerSummary();
      } else {
        Get.snackbar('Error', response['message'] ?? 'Failed to request payout', backgroundColor: Colors.red.shade100);
      }
    } catch (e) {
      Get.snackbar('Error', e.toString(), backgroundColor: Colors.red.shade100);
    } finally {
      isLoading.value = false;
    }
  }
}
