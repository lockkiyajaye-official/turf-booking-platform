import 'package:get/get.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:mobile/core/repository/auth_session_repository.dart';
import 'package:mobile/core/storage/local_storage.dart';
import 'package:mobile/core/storage/storage_keys.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/viewmodels/splash/auth_session_viewmodel.dart';

/// Dependency Injection - Initialize all core controllers and services
class CoreController {
  /// Initialize all dependencies in the correct order
  static Future<void> init() async {
    // Initialize Hive
    await Hive.initFlutter();

    // Open the required boxes
    final appBox = await Hive.openBox(StorageKeys.appBox);
    final authBox = await Hive.openBox(StorageKeys.authBox);

    // Initialize storage service
    final localStorageService = LocalStorageService(
      appBox: appBox,
      authBox: authBox,
    );

    Get.put(AppTheme(storage: localStorageService), permanent: true);

    // Then initialize controllers
    Get.put(
      AuthSessionController(
        authRepository: AuthSessionRepository(storage: localStorageService),
      ),
      permanent: true,
    );
  }

  /// Dispose all controllers (optional, for cleanup)
  static void dispose() {
    Get.delete<AuthSessionController>();
    Get.delete<AppTheme>();
    // Get.delete<AuthRepository>();
  }
}
