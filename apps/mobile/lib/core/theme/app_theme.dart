import 'package:flutter/material.dart';
import 'package:get/state_manager.dart';
import 'package:mobile/core/storage/local_storage.dart';

/// Manages the application's theme mode (light, dark, system)
class AppTheme extends GetxController {
  final LocalStorageService storage;

  ThemeMode _themeMode = ThemeMode.system; // DEFAULT

  AppTheme({required this.storage}) {
    _loadTheme();
  }

  ThemeMode get themeMode => _themeMode;

  bool get isDark {
    if (_themeMode == ThemeMode.system) {
      final brightness =
          WidgetsBinding.instance.platformDispatcher.platformBrightness;
      return brightness == Brightness.dark;
    }
    return _themeMode == ThemeMode.dark;
  }

  // ================= LOAD =================

  void _loadTheme() {
    final saved = storage.getThemeMode();
    _themeMode = saved;
  }

  // ================= SAVE =================

  void setSystem() {
    _themeMode = ThemeMode.system;
    storage.saveThemeMode(mode: ThemeMode.system);
  }

  void setLight() {
    _themeMode = ThemeMode.light;
    storage.saveThemeMode(mode: ThemeMode.light);
  }

  void setDark() {
    _themeMode = ThemeMode.dark;
    storage.saveThemeMode(mode: ThemeMode.dark);
  }

  void toggle() {
    if (_themeMode == ThemeMode.system) {
      _themeMode = isDark ? ThemeMode.light : ThemeMode.dark;
    } else {
      _themeMode = _themeMode == ThemeMode.dark
          ? ThemeMode.light
          : ThemeMode.dark;
    }

    storage.saveThemeMode(mode: _themeMode);
  }
}
