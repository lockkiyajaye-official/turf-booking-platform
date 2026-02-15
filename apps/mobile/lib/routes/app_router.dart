import 'package:get/get.dart';

class AppRouter {
  static List<GetPage> routes = [
//     /// Splash
//     GetPage(
//       name: RoutePaths.splash,
//       page: () => const SplashScreen(),
//     ),

//     /// Login
//     GetPage(
//       name: RoutePaths.login,
//       page: () => LoginPage(),
//     ),

//     /// WhatsApp (opened ONLY from Login button)
//     GetPage(
//       name: RoutePaths.whatsapp,
//       page: () => const WhatsappScreen(),
//     ),

//     /// Home
//     GetPage(
//       name: RoutePaths.home,
//       page: () {
//         final expired = Get.parameters['expired'] == 'true';
//         return HomePage(showDialogOnStart: expired);
//       },
//     ),

//     /// Errors
//     GetPage(
//       name: RoutePaths.noInternet,
//       page: () {
//         final authController = Get.find<AuthSessionController>();
//         return NoInternetPage(onRetry: authController.onRetry);
//       },
//     ),

//     GetPage(
//       name: RoutePaths.timeout,
//       page: () {
//         final authController = Get.find<AuthSessionController>();
//         return TimeoutPage(onRetry: authController.onRetry);
//       },
//     ),

//     GetPage(
//       name: RoutePaths.serverUnavailable,
//       page: () {
//         final authController = Get.find<AuthSessionController>();
//         return ServerUnavailablePage(onRetry: authController.onRetry);
//       },
//     ),

//     GetPage(
//       name: RoutePaths.unexpectedError,
//       page: () {
//         final authController = Get.find<AuthSessionController>();
//         return UnexpectedErrorPage(onRetry: authController.onRetry);
//       },
//     ),

//     /// Onboarding
//     GetPage(
//       name: RoutePaths.doctorOnboarding,
//       page: () => const OnboardingEntryPage(),
//     ),
    
//     GetPage(
//       name: RoutePaths.doctorProfileSetup,
//       page: () => const ProfileSetupPage(),
//     ),
    
//     GetPage(
//       name: RoutePaths.doctorClinicDetails,
//       page: () => const ClinicDetailsPage(),
//     ),
    
//     GetPage(
//       name: RoutePaths.startFreeTrial,
//       page: () => const StartFreeTrialPage(),
//     ),
    
//     GetPage(
//       name: RoutePaths.doctorVerification,
//       page: () => const DoctorVerificationPage(),
//     ),
    
//     GetPage(
//       name: RoutePaths.doctorAvailabilitySetup,
//       page: () => const AvailabilitySetupPage(),
//     ),

//     /// Verification result pages
//     GetPage(
//       name: RoutePaths.verificationReview,
//       page: () => const VerificationReviewPage(),
//     ),
    
//     GetPage(
//       name: RoutePaths.verificationSuccess,
//       page: () => const VerificationSuccessPage(),
//     ),
    
//     GetPage(
//       name: RoutePaths.verificationFailed,
//       page: () => const VerificationFailedPage(),
//     ),

//     /// Onboarding Required Page
//     GetPage(
//       name: RoutePaths.onboardingRequired,
//       page: () => OnboardingRequiredPage(),
//     ),

//     /// ---------------- Feature Pages ----------------
//     GetPage(
//       name: RoutePaths.patientHistory,
//       page: () => const PatientHistoryPage(),
//     ),

//     GetPage(
//       name: RoutePaths.bookAppointment,
//       page: () => const BookAppointmentPage(),
//     ),

//     GetPage(
//       name: RoutePaths.consultation,
//       page: () => const ConsultationPage(),
//     ),

//     GetPage(
//       name: RoutePaths.doctorNotes,
//       page: () => const DoctorNotes(),
//     ),

//     GetPage(
//       name: RoutePaths.emrPreview,
//       page: () => const EmrPreviewPage(),
//     ),

//     /// New Record Route
//     GetPage(
//       name: RoutePaths.newRecord,
//       page: () {
//         final args = Get.arguments as Map<String, dynamic>;
//         final medicineService = Get.find<MedicineService>();

//         return NewRecord(
//           appointmentId: args['appointmentId'],
//           businessId: args['businessId'],
//           doctorId: args['doctorId'],
//           medicineService: medicineService,
//         );
//       },
//     ),

//     // =========== SUBSCRIPTION ==============
//     GetPage(
//       name: RoutePaths.mySubscription,
//       page: () => MySubscriptionPage(),
//     ),
    
//     GetPage(
//       name: RoutePaths.profile,
//       page: () => const ProfilePage(),
//     ),
  ];
// }

// /// GetX Middleware for handling authentication and redirects
// class AuthMiddleware extends GetMiddleware {
//   @override
//   int? get priority => 1;

//   @override
//   RouteSettings? redirect(String? route) {
//     final authController = Get.find<AuthSessionController>();
//     final failure = authController.failure;

//     // 1️⃣ App not initialized → Splash
//     if (!authController.initialized) {
//       return route == RoutePaths.splash ? null : RouteSettings(name: RoutePaths.splash);
//     }

//     // 2️⃣ Network / server errors
//     if (failure is NetworkFailure && route != RoutePaths.noInternet) {
//       return RouteSettings(name: RoutePaths.noInternet);
//     }

//     if (failure is TimeoutFailure && route != RoutePaths.timeout) {
//       return RouteSettings(name: RoutePaths.timeout);
//     }

//     if (failure is ServerFailure && route != RoutePaths.serverUnavailable) {
//       return RouteSettings(name: RoutePaths.serverUnavailable);
//     }

//     if (failure is UnknownFailure && route != RoutePaths.unexpectedError) {
//       return RouteSettings(name: RoutePaths.unexpectedError);
//     }

//     // 3️⃣ Not logged in → Login
//     if (failure is UnauthenticatedFailure || failure is TokenExpiryFailure) {
//       if (route == RoutePaths.login || route == RoutePaths.whatsapp) {
//         return null;
//       }
//       return RouteSettings(name: RoutePaths.login);
//     }

//     return null;
//   }
// }

// enum AppFlow { splash, unauthenticated, onboarding, verification, home, error }

// class AppFlowResolver {
//   static AppFlow resolve(AuthSessionController authController) {
//     if (!authController.initialized) {
//       return AppFlow.splash;
//     }

//     final failure = authController.failure;

//     if (failure is NetworkFailure ||
//         failure is TimeoutFailure ||
//         failure is ServerFailure ||
//         failure is UnknownFailure) {
//       return AppFlow.error;
//     }

//     if (failure is UnauthenticatedFailure || failure is TokenExpiryFailure) {
//       return AppFlow.unauthenticated;
//     }

//     if (authController.doctorVerificationStatus != null) {
//       return AppFlow.verification;
//     }

//     if (authController.onboardingStatus != OnboardingStatus.completed) {
//       return AppFlow.onboarding;
//     }

//     return AppFlow.home;
//   }
}