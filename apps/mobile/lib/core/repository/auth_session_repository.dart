import 'package:flutter/widgets.dart';
import 'package:mobile/core/storage/local_storage.dart';


/// Repository that manages authentication session data and token validation.
///
/// This repository acts as the single source of truth for authentication-related
/// operations, combining API calls for token validation with local storage
/// operations for persisting session data. It manages:
/// - Authentication tokens
/// - User/doctor information (ID, name, role)
/// - Business context (business ID)
///
/// The repository abstracts away the details of where data is stored (local storage)
/// and how validation is performed (API calls), providing a clean interface for
/// the application to manage user sessions.
class AuthSessionRepository {
  // final SplashApiService api;
  final LocalStorageService storage;

  AuthSessionRepository({required this.storage});

  /// Retrieves the saved authentication token from local storage.
  ///
  /// Returns:
  /// - The stored token string if it exists
  /// - null if no token has been saved
  String? getSavedToken() {
    return storage.getToken();
  }

  /// Validates the authentication token with the backend server.
  ///
  /// Makes an API call to check if the current token is still valid and active.
  /// This is typically called during app startup to verify the user's session.
  ///
  /// [request] - Contains the token and other data needed for validation





  // Future<Either<Failure, bool>> validateToken({
  //   required CheckTokenRequest request,
  // }) async {
  //   // Call the API to validate the token
  //   final response = await api.validateToken(request: request);

  //   return response.fold((failure) => Left(failure), (success) {
  //     if (!success) {
  //       // Token validation request succeeded, but server says token is invalid
  //       return Left(TokenExpiryFailure());
  //     }
  //     // Token is valid
  //     return Right(true);
  //   });
  // }

  /// Saves the authentication token to local storage.
  ///
  /// This is typically called after successful login or token refresh.
  /// The token is persisted locally to maintain the user's session across
  /// app restarts.
  ///
  /// [token] - The JWT or authentication token to save
  void saveToken({required String token}) {
    storage.saveToken(token: token);
  }

  /// Saves the business/clinic ID to local storage.
  ///
  /// The business ID represents which clinic or healthcare organization
  /// the user is currently working with. This is used for filtering
  /// patient data and other business-specific operations.
  ///
  /// [id] - The unique identifier for the business/clinic
  void saveBusinessId({required int id}) {
    storage.saveBusinessId(id);
  }

  /// Saves the user/doctor ID to local storage.
  ///
  /// This is the unique identifier for the currently logged-in doctor/user.
  /// Used throughout the app to associate actions with the correct user.
  ///
  /// [id] - The unique identifier for the user/doctor
  void saveUserId({required int id}) {
    storage.saveUserId(id);
  }

  /// Retrieves the saved business/clinic ID from local storage.
  ///
  /// Returns:
  /// - The stored business ID if it exists
  /// - null if no business ID has been saved
  int? getBusinessId() {
    debugPrint("The Stored Business id is this : ${storage.getBusinessId()}");
    return storage.getBusinessId();
  }

  /// Retrieves the saved user/doctor ID from local storage.
  ///
  /// Returns:
  /// - The stored user ID if it exists
  /// - null if no user ID has been saved
  int? getUserId() {
    return storage.getUserId();
  }

  /// Saves the doctor's role ID to local storage.
  ///
  /// The role ID determines the doctor's permissions and access level
  /// within the system (e.g., consultant, resident, admin).
  ///
  /// [id] - The unique identifier for the doctor's role


  /// Retrieves the saved doctor role ID from local storage.
  ///
  /// Returns:
  /// - The stored role ID if it exists
  /// - null if no role ID has been saved
 

  /// Saves the doctor's name to local storage.
  ///
  /// The doctor's name is used for display purposes throughout the app
  /// (e.g., in headers, signatures on prescriptions).
  ///
  /// [name] - The full name of the doctor
  void saveUserName({required String name}) {
    return storage.saveUserNamwe(name);
  }

  /// Retrieves the saved doctor name from local storage.
  ///
  /// Returns the stored doctor name. Assumes a name has been previously saved.
  String getUserName() {
    return storage.getUserName();
  }

  /// Clears the authentication token from local storage.
  ///
  /// This is typically called during logout to invalidate the user's session.
  /// Note: This only clears the token, not other session data like user ID
  /// or business ID. For complete logout, additional data may need to be cleared.
  void clearAll() {
    storage.clearAll();
    storage.clearOnboardingRequired();
  }

  /// NEW — save country code (ex: "AE")
  void saveCountry({required String code}) {
    storage.saveCountry(code);
  }

  /// NEW — get country code
  String getCountryCode() {
    return storage.getCountryCode();
  }

  /// NEW — save currency code (ex: "AED")
  void saveCurrencyCode({required String code}) {
    storage.saveCurrencyCode(code);
  }

  /// NEW — get currency code
  String getCurrencyCode() {
    return storage.getCurrencyCode();
  }

  /// ================= PHONE NUMBER =================

  /// Saves the user's phone number to local storage.
  ///
  /// Typically called after successful login / OTP verification.
  ///
  /// [phoneNumber] - Phone number without country code
  void savePhoneNumber({required String phoneNumber}) {
    storage.savePhoneNumber(phoneNumber);
  }

  /// Retrieves the saved phone number from local storage.
  ///
  /// Returns:
  /// - The stored phone number if it exists
  /// - null if no phone number has been saved
  String? getPhoneNumber() {
    return storage.getPhoneNumber();
  }

  /// Clears the saved phone number from local storage.
  ///
  /// Usually called during logout or session reset.
  void clearPhoneNumber() {
    storage.clearPhoneNumber();
  }

  // ================= DOCTOR VERIFICATION STATUS =================

  /// Saves the doctor's verification status to local storage.
  ///
  /// Called after verification API success or status fetch.

  /// Retrieves the saved doctor verification status.
  ///
  /// Returns:
  /// - DoctorVerificationStatus if saved
  /// - null if not available

  /// Clears stored doctor verification status.
  ///
  /// Usually called during logout or session reset.

  // ================= ONBOARDING =================

  /// Marks doctor onboarding as completed.
  ///

  /// Returns whether onboarding is completed.
  ///
  /// Defaults to false if not set.
  bool isOnboardingCompleted() {
    return storage.getIsOnboardingCompleted();
  }

  /// Clears onboarding completion flag.
  ///
  /// Called during logout / session reset.
  void clearOnboardingCompleted() {
    storage.clearOnboardingCompleted();
  }

  // ================= ONBOARDING REQUIRED =================

  void saveOnboardingRequired({required bool value}) {
    storage.saveOnboardingRequired(value);
  }

  bool getOnboardingRequired() {
    return storage.getOnboardingRequired();
  }

  void clearOnboardingRequired() {
    storage.clearOnboardingRequired();
  }

  // ================= ONBOARDING STATUS =================
  // ================= ONBOARDING (LIST-BASED) =================



  /// Get completed onboarding steps


  /// Clear onboarding steps (logout / reset)
  void clearOnboardingSteps() {
    storage.clearOnboardingSteps();
  }

  ///
  ///
  ///FOR FIREBASE APP OPEN ANALYTICS
  bool isFirstTimeUser() {
    return storage.isFirstTimeUser();
  }

  Future<void> markFirstTimeCompleted() async {
    storage.markFirstTimeCompleted();
  }
}
