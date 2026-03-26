import 'package:get/get.dart';
import 'package:mobile/data/models/turf_model.dart';
import 'package:mobile/data/services/turf_service.dart';
import 'package:mobile/viewmodels/auth/auth_viewmodel.dart';
import 'package:flutter/material.dart';

class TurfViewmodel extends GetxController {
  final TurfService _turfService = TurfService();
  final AuthViewmodel _authViewmodel = Get.find<AuthViewmodel>();

  var isLoading = false.obs;
  var turfs = <TurfModel>[].obs;
  var myTurfs = <TurfModel>[].obs;
  var selectedTurf = Rxn<TurfModel>();

  // Fetch all available turfs (e.g. for User Home)
  Future<void> fetchAllTurfs({String? search}) async {
    try {
      isLoading.value = true;
      final token = _authViewmodel.token.value;
      final response = await _turfService.findAll(
        token: token.isNotEmpty ? token : null,
        search: search,
      );

      if (response['success']) {
        final List data = response['data'] ?? [];
        turfs.value = data.map((json) => TurfModel.fromJson(json)).toList();
      } else {
        Get.snackbar('Error', response['message'] ?? 'Failed to fetch turfs', backgroundColor: Colors.red.shade100);
      }
    } catch (e) {
      Get.snackbar('Error', e.toString(), backgroundColor: Colors.red.shade100);
    } finally {
      isLoading.value = false;
    }
  }

  // Fetch owner's turfs (e.g. for Turf Owner Dashboard)
  Future<void> fetchMyTurfs() async {
    final token = _authViewmodel.token.value;
    if (token.isEmpty) return;

    try {
      isLoading.value = true;
      final response = await _turfService.findMyTurfs(token);

      if (response['success']) {
        final List data = response['data'] ?? [];
        myTurfs.value = data.map((json) => TurfModel.fromJson(json)).toList();
      } else {
        Get.snackbar('Error', response['message'] ?? 'Failed to fetch your turfs', backgroundColor: Colors.red.shade100);
      }
    } catch (e) {
      Get.snackbar('Error', e.toString(), backgroundColor: Colors.red.shade100);
    } finally {
      isLoading.value = false;
    }
  }

  // Find single turf
  Future<void> fetchTurfDetails(String id) async {
    try {
      isLoading.value = true;
      final response = await _turfService.findOne(id);

      if (response['success']) {
        selectedTurf.value = TurfModel.fromJson(response['data']);
      } else {
        Get.snackbar('Error', response['message'] ?? 'Failed to fetch turf details', backgroundColor: Colors.red.shade100);
      }
    } catch (e) {
      Get.snackbar('Error', e.toString(), backgroundColor: Colors.red.shade100);
    } finally {
      isLoading.value = false;
    }
  }

  // Create new turf
  Future<void> createTurf(Map<String, dynamic> data) async {
    final token = _authViewmodel.token.value;
    if (token.isEmpty) {
      Get.snackbar('Error', 'Not authenticated', backgroundColor: Colors.red.shade100);
      return;
    }

    try {
      isLoading.value = true;
      final response = await _turfService.createTurf(token: token, data: data);

      if (response['success']) {
        Get.snackbar('Success', 'Turf created successfully', backgroundColor: Colors.green.shade100);
        await fetchMyTurfs();
        Get.back(); // go back after creation
      } else {
        Get.snackbar('Error', response['message'] ?? 'Failed to create turf', backgroundColor: Colors.red.shade100);
      }
    } catch (e) {
      Get.snackbar('Error', e.toString(), backgroundColor: Colors.red.shade100);
    } finally {
      isLoading.value = false;
    }
  }
}
