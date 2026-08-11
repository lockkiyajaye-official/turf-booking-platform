import 'package:flutter/material.dart';

import 'package:hive/hive.dart';
import 'storage_keys.dart';

///
/// Handles app local persistence via any key-value storage backend
/// (Hive, SharedPreferences, SecureStorage, etc.) without exposing
/// the underlying implementation to the caller. Used to store tokens,
/// theme mode and small state information.
///
class LocalStorageService {
  final Box appBox;
  final Box authBox;

  LocalStorageService({required this.appBox, required this.authBox});

  // ================= AUTH =================

  void saveToken({required String token}) {
    authBox.put(StorageKeys.token, token);
  }

  String? getToken() {
    return authBox.get(StorageKeys.token);
  }

  void clearToken() {
    authBox.delete(StorageKeys.token);
  }

  // ================= THEME =================

  void saveThemeMode({required ThemeMode mode}) {
    appBox.put(StorageKeys.themeMode, mode.name);
  }

  ThemeMode getThemeMode() {
    /* final modeName = appBox.get(
      StorageKeys.themeMode,
      defaultValue: ThemeMode.system.name,
    );*/
    return ThemeMode.light;
    //uncomment when we get dart theme ui
    /*
    return ThemeMode.values.firstWhere(
      (mode) => mode.name == modeName,
      orElse: () => ThemeMode.system,
    );
    */
  }

  void saveBusinessId(int id) {
    authBox.put(StorageKeys.businessId, id);
  }

  int? getBusinessId() {
    return authBox.get(StorageKeys.businessId);
  }

  void saveUserId(int id) {
    authBox.put(StorageKeys.userId, id);
  }

  int? getUserId() {
    return authBox.get(StorageKeys.userId);
  }

  void saveUserNamwe(String name) {
    authBox.put(StorageKeys.doctorName, name);
  }

  String getUserName() {
    return authBox.get(StorageKeys.doctorName, defaultValue: 'N/A');
  }

  void saveCountry(String country) {
    authBox.put(StorageKeys.country, country);
  }

  String getCountryCode() {
    return authBox.get(StorageKeys.country, defaultValue: 'N/A');
  }

  void saveCurrencyCode(String currencyCode) {
    authBox.put(StorageKeys.currencyCode, currencyCode);
  }

  String getCurrencyCode() {
    return authBox.get(StorageKeys.currencyCode, defaultValue: 'N/A');
  } // ================= PHONE NUMBER =================

  void savePhoneNumber(String phoneNumber) {
    authBox.put(StorageKeys.phoneNumber, phoneNumber);
  }

  String? getPhoneNumber() {
    return authBox.get(StorageKeys.phoneNumber, defaultValue: "+919746298851");
  }

  void clearPhoneNumber() {
    authBox.delete(StorageKeys.phoneNumber);
  } // ================= DOCTOR VERIFICATION STATUS =================

  bool getIsOnboardingCompleted() {
    return authBox.get(StorageKeys.isOnboardingCompleted, defaultValue: false);
  }

  void clearOnboardingCompleted() {
    authBox.delete(StorageKeys.isOnboardingCompleted);
  } // ================= ONBOARDING REQUIRED =================

  void saveOnboardingRequired(bool value) {
    authBox.put(StorageKeys.isOnboardingRequired, value);
  }

  bool getOnboardingRequired() {
    return authBox.get(StorageKeys.isOnboardingRequired, defaultValue: false);
  }

  void clearOnboardingRequired() {
    authBox.delete(StorageKeys.isOnboardingRequired);
  }

  void clearOnboardingSteps() {
    authBox.delete(StorageKeys.onboardingSteps);
  }
  // ================= FIRST TIME USER =================

  bool isFirstTimeUser() {
    return authBox.get(StorageKeys.kFirstTimeUser, defaultValue: true);
  }

  void markFirstTimeCompleted() {
    authBox.put(StorageKeys.kFirstTimeUser, false);
  }

  // ================= COMMON =================

  void clearAll() {
    clearToken();
    clearPhoneNumber();
    clearOnboardingCompleted();
    clearOnboardingSteps();

    authBox.delete(StorageKeys.businessId);
    authBox.delete(StorageKeys.userId);

    authBox.delete(StorageKeys.doctorName);
    authBox.delete(StorageKeys.country);
    authBox.delete(StorageKeys.currencyCode);
    appBox.delete(StorageKeys.searchHistory);
  }

  // ================= SEARCH HISTORY =================

  void saveSearchHistory(List<String> history) {
    appBox.put(StorageKeys.searchHistory, history);
  }

  List<String> getSearchHistory() {
    final List? history = appBox.get(StorageKeys.searchHistory);
    return history?.cast<String>() ?? [];
  }
}
