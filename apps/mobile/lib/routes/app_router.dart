import 'package:get/get.dart';
import 'package:mobile/di/feature_controller.dart';
import 'package:mobile/routes/app_paths.dart';
import 'package:mobile/views/auth/login_page.dart';
import 'package:mobile/views/auth/otp_verfication_page.dart';
import 'package:mobile/views/auth/sign_up.dart';
import 'package:mobile/views/widgets/main_shell.dart';

class AppRouter {
  static List<GetPage> router = [
    GetPage(
      name: RoutePaths.login,
      page: () => const LoginPage(),
      binding: AuthBinding(), // ✅ MUST BE HERE
    ),

    GetPage(
      name: RoutePaths.signup,
      page: () => SignUp(),
    ),

    GetPage(
      name: RoutePaths.otpVerification,
      page: () => const OtpVerificationPage(),
    ),

    GetPage(
      name: RoutePaths.home,
      page: () => const MainShell(),
    ),
  ];
}