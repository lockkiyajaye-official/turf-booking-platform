import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/data/models/turf_model.dart';
import 'package:mobile/data/services/favorite_service.dart';
import 'package:mobile/viewmodels/auth/auth_viewmodel.dart';

class FavoriteViewmodel extends GetxController {
  final FavoriteService _favoriteService = FavoriteService();

  var isLoading = false.obs;
  var favoriteTurfs = <TurfModel>[].obs;
  var favoriteTurfIds = <String>{}.obs;

  @override
  void onInit() {
    super.onInit();
    fetchFavorites();
  }

  Future<void> fetchFavorites() async {
    final authVm = Get.find<AuthViewmodel>();
    final token = authVm.token.value;
    if (token.isEmpty) return;

    try {
      isLoading.value = true;
      final result = await _favoriteService.getFavorites(token);
      if (result['success'] == true && result['data'] is List) {
        final list = (result['data'] as List)
            .map((json) => TurfModel.fromJson(json))
            .toList();
        favoriteTurfs.assignAll(list);
        favoriteTurfIds.assignAll(list.map((t) => t.id));
      }
    } catch (_) {
    } finally {
      isLoading.value = false;
    }
  }

  bool isFavorite(String turfId) {
    return favoriteTurfIds.contains(turfId);
  }

  Future<bool> toggleFavorite(TurfModel turf) async {
    final authVm = Get.find<AuthViewmodel>();
    final token = authVm.token.value;
    if (token.isEmpty) {
      Get.snackbar(
        'Authentication Required',
        'Please login to save favorite venues',
        snackPosition: SnackPosition.BOTTOM,
      );
      return false;
    }

    final turfId = turf.id;
    final currentlyFavorite = isFavorite(turfId);

    // Optimistic UI update
    if (currentlyFavorite) {
      favoriteTurfIds.remove(turfId);
      favoriteTurfs.removeWhere((t) => t.id == turfId);
    } else {
      favoriteTurfIds.add(turfId);
      if (!favoriteTurfs.any((t) => t.id == turfId)) {
        favoriteTurfs.add(turf);
      }
    }

    try {
      final response = currentlyFavorite
          ? await _favoriteService.removeFavorite(token, turfId)
          : await _favoriteService.addFavorite(token, turfId);

      if (response['success'] == true) {
        Get.snackbar(
          currentlyFavorite ? 'Removed' : 'Added to Favorites',
          currentlyFavorite
              ? '${turf.name} removed from your favorites'
              : '${turf.name} added to your favorites',
          snackPosition: SnackPosition.BOTTOM,
          duration: const Duration(seconds: 2),
        );
        return true;
      } else {
        // Revert on failure
        if (currentlyFavorite) {
          favoriteTurfIds.add(turfId);
          if (!favoriteTurfs.any((t) => t.id == turfId)) {
            favoriteTurfs.add(turf);
          }
        } else {
          favoriteTurfIds.remove(turfId);
          favoriteTurfs.removeWhere((t) => t.id == turfId);
        }
        Get.snackbar(
          'Error',
          response['message'] ?? 'Failed to update favorite',
          snackPosition: SnackPosition.BOTTOM,
        );
        return false;
      }
    } catch (e) {
      // Revert on failure
      if (currentlyFavorite) {
        favoriteTurfIds.add(turfId);
        if (!favoriteTurfs.any((t) => t.id == turfId)) {
          favoriteTurfs.add(turf);
        }
      } else {
        favoriteTurfIds.remove(turfId);
        favoriteTurfs.removeWhere((t) => t.id == turfId);
      }
      Get.snackbar(
        'Error',
        e.toString(),
        snackPosition: SnackPosition.BOTTOM,
      );
      return false;
    }
  }
}
