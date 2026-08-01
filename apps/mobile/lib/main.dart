import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/constants/app_strings.dart';
import 'package:mobile/core/responsive/app_screen.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/theme/light_theme.dart';
import 'package:mobile/di/core_controller.dart';
import 'package:mobile/di/feature_controller.dart';
import 'package:mobile/routes/app_paths.dart';
import 'package:mobile/routes/app_router.dart';
import 'package:mobile/core/storage/local_storage.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await CoreController.init();
   AuthBinding().dependencies();

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, _) {
        AppScreen.init(context);
        final media = MediaQuery.of(context);

        return MediaQuery(
          data: MediaQuery.of(context).copyWith(
            textScaler: TextScaler.linear(
              media.textScaler.scale(1.0).clamp(1.0, 1.3),
            ),
          ),
          child: GetBuilder<AppTheme>(
            builder: (appTheme) {
              return GetMaterialApp(
                debugShowCheckedModeBanner: false,
                title: AppStrings.appName,
                theme: lightTheme,
                themeMode: appTheme.themeMode,
                initialRoute: Get.find<LocalStorageService>().getToken() != null
                    ? RoutePaths.home
                    : RoutePaths.login,
                getPages: AppRouter.router,
                defaultTransition: Transition.fade,
                transitionDuration: const Duration(milliseconds: 300),
                builder: (context, child) {
                  return child ?? const SizedBox.shrink();
                },
              );
            },
          ),
        );
      },
    );
  }
}
