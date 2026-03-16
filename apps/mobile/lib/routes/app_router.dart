import 'package:get/get.dart';
import 'package:mobile/routes/app_paths.dart';
import 'package:mobile/views/auth/login_page.dart';
import 'package:mobile/views/auth/otp_verfication_page.dart';
import 'package:mobile/views/auth/sign_up.dart';

class AppRouter {
  static List<GetPage> router = [
    // GetPage(
    //   name: RoutePaths.splash,
    //   page: () => const SplashScreen(),
    // ),
    GetPage(name: RoutePaths.login, page: () => LoginPage()),

    GetPage(name: RoutePaths.signup, page: () => SignUp()),
    GetPage(
      name: RoutePaths.otpVerification,
      page: () => const OtpVerificationPage(),
    ),

    // GetPage(
    //   name: RoutePaths.whatsapp,
    //   page: () => const WhatsappScreen(),
    // ),

    // GetPage(
    //   name: RoutePaths.home,
    //   page: () {
    //     final expired = Get.parameters['expired'] == 'true';
    //     return HomePage(showDialogOnStart: expired);
    //   },
    // ),

    // Add all other routes here...
  ];
}
