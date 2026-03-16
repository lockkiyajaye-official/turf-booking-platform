import 'package:get/get.dart';
import 'package:mobile/core/model/verficatin_response.dart';
import 'package:mobile/core/repository/auth_session_repository.dart';

/// Controller that manages the application's authentication session state.
///
/// This controller handles the entire authentication lifecycle including:
/// - App initialization and token validation
/// - Login state management
/// - Logout operations
/// - Session persistence
/// - Error handling and retry logic
///
/// The controller works in conjunction with the splash screen to determine
/// whether the user should be directed to login or the main app.
class AuthSessionController extends GetxController {
  final AuthSessionRepository authRepository;


  // Reactive state variables
  final _initialized = false.obs;
  // final Rx<Failure?> _failure = Rx<Failure?>(null);
  final Rx<Future<void> Function()?> _onRetry = Rx<Future<void> Function()?>(
    null,
  );

  final _showDialogFromLogin = false.obs;

  // Public getters for accessing state
  bool get initialized => _initialized.value;
  // Failure? get failure => _failure.value;
  Future<void> Function()? get onRetry => _onRetry.value;

  bool get showDialogFromLogin => _showDialogFromLogin.value;

  AuthSessionController({
    required this.authRepository,

  });

  /// Initializes the authentication session on app startup.
  ///
  /// This is the primary bootstrap method called during the splash screen.
  /// It performs the following steps:
  /// 1. Waits for 3 seconds (splash screen display time)
  /// 2. Checks if a token exists in local storage
  /// 3. If token exists, validates it with the server
  /// 4. Sets appropriate state based on validation result
  ///
  /// Possible outcomes:
  /// - No token found → UnauthenticatedFailure (user needs to login)
  /// - Token found but invalid → TokenExpiryFailure (user needs to re-login)
  /// - Token found and valid → Success (proceed to main app)
  /// - Validation failed → Network/Server/Timeout failure (offer retry)
  Future<void> init(void Function(String) route) async {
    // Show splash screen for minimum duration
    await Future.delayed(Duration(seconds: 3));

    // final bool isFirstTimeUser = authRepository.isFirstTimeUser();

    // final String? doctorId = isFirstTimeUser
    //     ? null
    //     : authRepository.getUserId()?.toString();
    // print('erjerjk');

    //  APP OPEN ANALYTICS — HERE

    // Check if authentication token exists in local storage
    final token = authRepository.getSavedToken();
 
    // Case 1: No token found → User is not authenticated
    if (token == null) {
      // _failure.value = const UnauthenticatedFailure();
      _initialized.value = true;
      _onRetry.value = null; // No retry needed for unauthenticated state
     
      }
      return;
    }

   


    // Case 2: Token exists → Validate with server
  //   final result = await authRepository.validateToken(
  //     request: CheckTokenRequest(token: token),
  //   );

  //   await result.fold(
  //     (failure) {
  //       _failure.value = failure;

  //       // Set retry logic only for transient failures (network, server issues)
  //       // Token expiry or authentication failures should not be retried
  //       if (failure is NetworkFailure ||
  //           failure is TimeoutFailure ||
  //           failure is ServerFailure ||
  //           failure is UnknownFailure) {
  //         _onRetry.value = () async =>
  //             await init(route); // Allow retry of initialization
  //       } else {
  //         _onRetry.value =
  //             null; // No retry for TokenExpiryFailure or UnauthenticatedFailure
  //       }
  //     },
  //     (success) {
  //       print('ernernern');
  //       // Token is valid - user can proceed to main app
  //       _failure.value = null;
  //       _onRetry.value = null;
  //     },
  //   );

  //   // Mark initialization as complete
  //   _initialized.value = true;
  // }




  /// Marks the user as logged in and saves session data.
  ///
  /// Called after successful OTP verification or login. This method:
  /// 1. Saves the authentication token
  /// 2. Saves user ID
  /// 3. Saves business/clinic information if available
  /// 4. Saves doctor role and name
  /// 5. Updates state to reflect successful authentication
  ///
  /// [response] - Contains the authentication token, user details, and business info
  ///              returned from the login/OTP verification API
  Future<void> markLoggedIn({required VerifyOtpResponse response}) async {
    // Save authentication token for future API calls
    authRepository.saveToken(token: response.token!);

    // Save user ID
    authRepository.saveUserId(id:0);

 

    
  
  

      // Save the doctor's name for display purposes
      authRepository.saveUserName(name: "response.user?.name ");

      ///  Save country
    //   if (response.user?.businesses[0].country != null) {
    //     authRepository.saveCountry(code: response.user!.businesses[0].country);
    //   }

    //   /// Save currency code
    //   if (response.user?.businesses[0].currencyCode != null) {
    //     authRepository.saveCurrencyCode(
    //       code: response.user!.businesses[0].currencyCode,
    //     );
    //   }
    // }

    // Update state to reflect successful login
    // _failure.value = null;
    _initialized.value = true;
    _onRetry.value = null;
  }

  /// Logs out the current user and clears session data.
  ///
  /// This method:
  /// 1. Clears the authentication token from local storage
  /// 2. Sets state to UnauthenticatedFailure (triggers navigation to login)
  /// 3. Keeps initialized=true to prevent re-running init()
  ///
  /// Note: This only clears the token. Other session data (user ID, business ID)
  /// remains in storage but will be overwritten on next login.
  Future<void> logout() async {
    // Clear the authentication token
    authRepository.clearAll();

    // Set state to unauthenticated
    // _failure.value = const UnauthenticatedFailure();
    _initialized.value = true; // Keep initialized to prevent re-bootstrapping
    _onRetry.value = null;
  }

}
