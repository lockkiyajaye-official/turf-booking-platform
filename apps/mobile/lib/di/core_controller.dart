import 'package:get/get.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:mobile/core/repository/auth_session_repository.dart';
import 'package:mobile/core/storage/local_storage.dart';
import 'package:mobile/core/storage/storage_keys.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/viewmodels/splash/auth_session_viewmodel.dart';

class CoreController {
  static Future<void> init() async {
    /// 🔹 1. Init Hive
    await Hive.initFlutter();

    /// 🔹 2. Open Boxes
    final appBox = await Hive.openBox(StorageKeys.appBox);
    final authBox = await Hive.openBox(StorageKeys.authBox);

    /// 🔹 3. Register Storage Service
    final localStorage = LocalStorageService(
      appBox: appBox,
      authBox: authBox,
    );

    Get.put<LocalStorageService>(localStorage, permanent: true);

    /// 🔹 4. Register Repository
    Get.put<AuthSessionRepository>(
      AuthSessionRepository(storage: localStorage),
      permanent: true,
    );

    /// 🔹 5. Register Theme
    Get.put<AppTheme>(
      AppTheme(storage: localStorage),
      permanent: true,
    );

    /// 🔹 6. Register Session Controller
    Get.put<AuthSessionController>(
      AuthSessionController(
        authRepository: Get.find<AuthSessionRepository>(),
      ),
      permanent: true,
    );
  }

  static void dispose() {
    Get.delete<AuthSessionController>();
    Get.delete<AppTheme>();
    Get.delete<AuthSessionRepository>();
    Get.delete<LocalStorageService>();
  }
}