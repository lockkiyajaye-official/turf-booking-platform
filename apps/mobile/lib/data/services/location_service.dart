import 'dart:math';
import 'package:flutter/material.dart';
import 'package:geocoding/geocoding.dart';
import 'package:geolocator/geolocator.dart';
import 'package:get/get.dart';

class LocationService {
  /// Calculate distance between two lat/lng points in kilometers using Haversine formula
  static double calculateDistanceKm(
    double lat1,
    double lon1,
    double lat2,
    double lon2,
  ) {
    const double earthRadiusKm = 6371.0;
    double dLat = _degreesToRadians(lat2 - lat1);
    double dLon = _degreesToRadians(lon2 - lon1);

    double a = sin(dLat / 2) * sin(dLat / 2) +
        cos(_degreesToRadians(lat1)) *
            cos(_degreesToRadians(lat2)) *
            sin(dLon / 2) *
            sin(dLon / 2);

    double c = 2 * atan2(sqrt(a), sqrt(1 - a));
    return earthRadiusKm * c;
  }

  static double _degreesToRadians(double degrees) {
    return degrees * pi / 180.0;
  }

  /// Request permission & fetch current Position
  Future<Position?> getCurrentPosition() async {
    bool serviceEnabled;
    LocationPermission permission;

    // Test if location services are enabled.
    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      Get.snackbar(
        'Location Disabled',
        'Please enable location services on your device.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.orange.shade100,
      );
      return null;
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        Get.snackbar(
          'Permission Denied',
          'Location permission was denied.',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.red.shade100,
        );
        return null;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      Get.snackbar(
        'Permission Denied',
        'Location permissions are permanently denied. Please enable them in device settings.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.red.shade100,
      );
      return null;
    }

    // When permission granted, return position
    return await Geolocator.getCurrentPosition(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
      ),
    );
  }

  /// Get place name from coordinates (e.g. "Itanagar, Arunachal Pradesh")
  Future<String?> getAddressFromCoordinates(double lat, double lng) async {
    try {
      List<Placemark> placemarks = await placemarkFromCoordinates(lat, lng);
      if (placemarks.isNotEmpty) {
        final place = placemarks.first;
        final city = place.locality?.isNotEmpty == true
            ? place.locality
            : (place.subAdministrativeArea?.isNotEmpty == true
                ? place.subAdministrativeArea
                : place.administrativeArea);
        final state = place.administrativeArea;

        if (city != null && state != null && city != state) {
          return '$city, $state';
        } else if (city != null) {
          return city;
        } else if (state != null) {
          return state;
        }
      }
    } catch (_) {
      // Fallback if reverse geocoding fails
    }
    return null;
  }
}
