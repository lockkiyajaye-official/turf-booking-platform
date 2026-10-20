import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/data/services/auth_service.dart';
import 'package:mobile/core/storage/local_storage.dart';
import 'package:mobile/core/constants/app_constants.dart';
import 'package:mobile/routes/app_paths.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';
import 'dart:async';

class AuthViewmodel extends GetxController {
  final AuthService _authService = AuthService();

  // ──────────────────────────────────────────────
  // Google Sign-In (v7 singleton API)
  // ──────────────────────────────────────────────
  final GoogleSignIn _googleSignIn = GoogleSignIn.instance;
  bool _googleSignInInitialized = false;
  StreamSubscription<GoogleSignInAuthenticationEvent>? _googleAuthSubscription;
  GoogleSignInAccount? _googleAccount;
  GoogleSignInAccount? get googleAccount => _googleAccount;

  Future<void> _ensureGoogleInitialized() async {
    final serverClientId = AppConstants.googleServerClientId;
    print(
      '[Google] ensuring initialized with serverClientId: "$serverClientId" (alreadyInit=$_googleSignInInitialized)',
    );
    if (_googleSignInInitialized) return;
    print(
      '[Google] initializing GoogleSignIn with serverClientId: "$serverClientId"',
    );
    await _googleSignIn.initialize(
      serverClientId: serverClientId.isNotEmpty ? serverClientId : null,
    );
    _googleSignInInitialized = true;
    _googleAuthSubscription = _googleSignIn.authenticationEvents.listen((
      event,
    ) {
      _googleAccount = switch (event) {
        GoogleSignInAuthenticationEventSignIn() => event.user,
        GoogleSignInAuthenticationEventSignOut() => null,
      };
    });
  }

  // ──────────────────────────────────────────────
  // Text Controllers
  // ──────────────────────────────────────────────
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  final firstNameController = TextEditingController();
  final lastNameController = TextEditingController();
  final phoneController = TextEditingController();
  final otpController = TextEditingController();

  // ──────────────────────────────────────────────
  // Observable State
  // ──────────────────────────────────────────────
  var isLoading = false.obs;
  var isGoogleLoading = false.obs;
  var isAppleLoading = false.obs;
  var isSendingOtp = false.obs;
  var selectedRole = 'user'.obs;
  var otpSent = false.obs;
  var token = ''.obs;
  var currentUser = <String, dynamic>{}.obs;

  bool get isGuest => token.value.isEmpty;

  void enterGuestMode() {
    Get.offAllNamed(RoutePaths.home);
  }

  // ──────────────────────────────────────────────
  // Helpers
  // ──────────────────────────────────────────────
  void _showError(String message) => Get.snackbar(
    'Error',
    message,
    backgroundColor: Colors.red.shade100,
    snackPosition: SnackPosition.BOTTOM,
  );

  void _showSuccess(String message) => Get.snackbar(
    'Success',
    message,
    backgroundColor: Colors.green.shade100,
    snackPosition: SnackPosition.BOTTOM,
  );

  void _saveSession(Map<String, dynamic> data) {
    token.value = data['token'] ?? '';
    currentUser.value = Map<String, dynamic>.from(data['user'] ?? {});

    final role = currentUser['role'];
    if (role != null) {
      Get.find<LocalStorageService>().saveUserRole(role.toString());
    }

    if (token.value.isNotEmpty) {
      Get.find<LocalStorageService>().saveToken(token: token.value);
    }
  }

  @override
  void onInit() {
    super.onInit();
    final storedToken = Get.find<LocalStorageService>().getToken();
    final storedRole = Get.find<LocalStorageService>().getUserRole();
    if (storedRole != null && storedRole.isNotEmpty) {
      currentUser.value = {'role': storedRole};
    }
    if (storedToken != null && storedToken.isNotEmpty) {
      token.value = storedToken;
      fetchProfile();
    }
    // Pre-initialize Google Sign-In in the background
    _ensureGoogleInitialized();
  }

  // ──────────────────────────────────────────────
  // Email / Password Auth
  // ──────────────────────────────────────────────

  Future<void> register() async {
    final email = emailController.text.trim();
    final password = passwordController.text.trim();
    final firstName = firstNameController.text.trim();
    final lastName = lastNameController.text.trim();

    if (email.isEmpty ||
        password.isEmpty ||
        firstName.isEmpty ||
        lastName.isEmpty) {
      _showError('All fields are required');
      return;
    }

    try {
      isLoading.value = true;
      final response = await _authService.register(
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
        role: selectedRole.value,
      );

      if (response['success']) {
        _saveSession(response['data']);
        _showSuccess('Account created successfully!');
        Get.offAllNamed(RoutePaths.home);
      } else {
        _showError(response['message'] ?? 'Registration failed');
      }
    } catch (e) {
      _showError(e.toString());
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> login() async {
    final email = emailController.text.trim();
    final password = passwordController.text.trim();

    if (email.isEmpty || password.isEmpty) {
      _showError('All fields are required');
      return;
    }

    try {
      isLoading.value = true;
      final response = await _authService.login(
        email: email,
        password: password,
      );

      if (response['success']) {
        _saveSession(response['data']);
        Get.offAllNamed(RoutePaths.home);
      } else {
        _showError(response['message'] ?? 'Login failed');
      }
    } catch (e) {
      _showError(e.toString());
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> adminLogin() async {
    final email = emailController.text.trim();
    final password = passwordController.text.trim();

    if (email.isEmpty || password.isEmpty) {
      _showError('All fields are required');
      return;
    }

    try {
      isLoading.value = true;
      final response = await _authService.adminLogin(
        email: email,
        password: password,
      );

      if (response['success']) {
        _saveSession(response['data']);
        Get.toNamed('/admin/dashboard');
      } else {
        _showError(response['message'] ?? 'Admin login failed');
      }
    } catch (e) {
      _showError(e.toString());
    } finally {
      isLoading.value = false;
    }
  }

  // ──────────────────────────────────────────────
  // Google Sign-In (v7 Native)
  // ──────────────────────────────────────────────
  Future<void> loginWithGoogle() async {
    try {
      isGoogleLoading.value = true;
      isLoading.value = true;
      print('[Google] start');
      print(
        '[Google] serverClientId from env: "${AppConstants.googleServerClientId}"',
      );

      await _ensureGoogleInitialized();
      print('[Google] initialized');

      final supported = _googleSignIn.supportsAuthenticate();
      print('[Google] supportsAuthenticate: $supported');
      if (!supported) {
        _showError('Google Sign-In is not supported on this platform');
        return;
      }

      print('[Google] calling _googleSignIn.authenticate()...');
      final account = await _googleSignIn.authenticate();
      _googleAccount = account;
      print('[Google] authenticated account email: ${account.email}');

      // Extract idToken directly from authentication
      final auth = account.authentication;
      final idToken = auth.idToken;
      print('[Google] idToken available: ${idToken != null && idToken.isNotEmpty}');

      // Safely attempt authorizeServer without failing whole sign-in
      String? serverAuthCode;
      try {
        print('[Google] requesting server authorization...');
        final serverAuth = await account.authorizationClient.authorizeServer([
          'openid',
          'email',
          'profile',
        ]);
        serverAuthCode = serverAuth?.serverAuthCode;
        print('[Google] serverAuthCode: $serverAuthCode');
      } catch (authErr) {
        print('[Google] authorizeServer bypass / note: $authErr');
      }

      if ((serverAuthCode == null || serverAuthCode.isEmpty) &&
          (idToken == null || idToken.isEmpty)) {
        _showError('Google Sign-In failed: could not retrieve credentials');
        return;
      }

      print(
        '[Google] sending credentials to backend at ${AppConstants.baseUrl}/auth/google/token...',
      );
      final response = await _authService.loginWithGoogle(
        idToken: idToken,
        serverAuthCode: serverAuthCode,
      );
      print('[Google] backend response: $response');

      if (response['success'] == true && response['data'] != null) {
        _saveSession(response['data']);
        Get.offAllNamed(RoutePaths.home);
      } else {
        _showError(response['message'] ?? 'Google login failed');
      }
    } on GoogleSignInException catch (e) {
      print(
        '[Google] GoogleSignInException: code=${e.code}, description="${e.description}"',
      );
      if (e.code == GoogleSignInExceptionCode.canceled) {
        print('[Google] User dismissed sign-in prompt.');
        return;
      }
      final desc = e.description ?? '';
      final lower = desc.toLowerCase();
      if (lower.contains('cancel') || lower.contains('interrupted')) {
        print('[Google] User cancelled sign-in.');
        return;
      }
      _showError(
        'Google Sign-In error: ${desc.isNotEmpty ? desc : e.code.name}',
      );
    } catch (e) {
      print('[Google] generic error: $e');
      final errStr = e.toString().toLowerCase();
      if (errStr.contains('cancel') ||
          errStr.contains('12501') ||
          errStr.contains('interrupted')) {
        print('[Google] User cancelled sign-in.');
        return;
      }
      _showError('Google Sign-In error: ${e.toString()}');
    } finally {
      isGoogleLoading.value = false;
      isLoading.value = false;
      print('[Google] done, isLoading=false');
    }
  }

  // ──────────────────────────────────────────────
  // Apple Sign-In
  // ──────────────────────────────────────────────
  Future<void> loginWithApple() async {
    try {
      isAppleLoading.value = true;
      isLoading.value = true;
      print('[Apple] start sign-in');

      final credential = await SignInWithApple.getAppleIDCredential(
        scopes: [
          AppleIDAuthorizationScopes.email,
          AppleIDAuthorizationScopes.fullName,
        ],
      );

      final identityToken = credential.identityToken;
      print(
        '[Apple] received credential. IdentityToken present: ${identityToken != null && identityToken.isNotEmpty}',
      );

      if (identityToken == null || identityToken.isEmpty) {
        _showError('Apple Sign-In failed: could not retrieve identity token');
        return;
      }

      final response = await _authService.loginWithApple(
        identityToken: identityToken,
        authorizationCode: credential.authorizationCode,
        firstName: credential.givenName,
        lastName: credential.familyName,
      );
      print('[Apple] backend response: $response');

      if (response['success'] == true && response['data'] != null) {
        _saveSession(response['data']);
        Get.offAllNamed(RoutePaths.home);
      } else {
        _showError(response['message'] ?? 'Apple login failed');
      }
    } on SignInWithAppleAuthorizationException catch (e) {
      print(
        '[Apple] SignInWithAppleAuthorizationException: code=${e.code}, message="${e.message}"',
      );
      if (e.code == AuthorizationErrorCode.canceled) {
        print('[Apple] User dismissed sign-in.');
        return;
      }
      _showError('Apple Sign-In failed: ${e.message}');
    } catch (e) {
      print('[Apple] error: $e');
      final errStr = e.toString().toLowerCase();
      if (errStr.contains('cancel') || errStr.contains('cancelled')) {
        print('[Apple] User cancelled sign-in.');
        return;
      }
      _showError('Apple Sign-In error: ${e.toString()}');
    } finally {
      isAppleLoading.value = false;
      isLoading.value = false;
      print('[Apple] done, isLoading=false');
    }
  }

  // ──────────────────────────────────────────────
  // OTP — Registration Flow
  // ──────────────────────────────────────────────

  Future<void> requestRegistrationOtp() async {
    final email = emailController.text.trim();
    final password = passwordController.text.trim();
    final firstName = firstNameController.text.trim();
    final lastName = lastNameController.text.trim();
    final phone = phoneController.text.trim();
    final normalizedPhone = phone.startsWith('+') ? phone : '+91$phone';

    if (firstName.isEmpty || lastName.isEmpty) {
      _showError('Please enter your first and last name');
      return;
    }

    if (password.length < 6) {
      _showError('Password must be at least 6 characters');
      return;
    }

    final hasEmail = email.isNotEmpty;
    final hasPhone = phone.isNotEmpty;

    if (!hasEmail && !hasPhone) {
      _showError('Please enter your email or phone number');
      return;
    }

    if (hasEmail && !GetUtils.isEmail(email)) {
      _showError('Please enter a valid email address');
      return;
    }

    if (hasPhone && phone.length < 10) {
      _showError('Please enter a valid phone number');
      return;
    }

    try {
      isSendingOtp.value = true;
      isLoading.value = true;

      Map<String, dynamic> response;
      if (hasEmail) {
        response = await _authService.requestEmailOtp(email: email);
      } else {
        response = await _authService.requestPhoneOtp(phone: normalizedPhone);
      }

      if (response['success']) {
        otpSent.value = true;
        final dest = hasEmail ? email : phone;
        _showSuccess('OTP sent to $dest');
        Get.toNamed(RoutePaths.otpVerification);
      } else {
        _showError(response['message'] ?? 'Failed to send OTP');
      }
    } catch (e) {
      _showError(e.toString());
    } finally {
      isSendingOtp.value = false;
      isLoading.value = false;
    }
  }

  Future<void> verifyOtpAndRegister(String otp) async {
    final email = emailController.text.trim();
    final rawPhone = phoneController.text.trim();
    final phone = rawPhone.startsWith('+') ? rawPhone : '+91$rawPhone';
    final firstName = firstNameController.text.trim();
    final lastName = lastNameController.text.trim();
    final hasEmail = email.isNotEmpty;

    try {
      isLoading.value = true;

      Map<String, dynamic> response;
      if (hasEmail) {
        response = await _authService.registerWithEmailOtp(
          email: email,
          otp: otp,
          firstName: firstName,
          lastName: lastName,
          role: selectedRole.value,
          phone: rawPhone.isNotEmpty ? phone : null,
        );
      } else {
        response = await _authService.registerWithPhoneOtp(
          phone: phone,
          otp: otp,
          firstName: firstName,
          lastName: lastName,
          role: selectedRole.value,
        );
      }

      if (response['success']) {
        _saveSession(response['data']);
        _showSuccess('Account created successfully!');
        Get.offAllNamed(RoutePaths.home);
      } else {
        _showError(response['message'] ?? 'Invalid or expired OTP');
      }
    } catch (e) {
      _showError(e.toString());
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> resendOtp() async {
    final email = emailController.text.trim();
    final phone = phoneController.text.trim();

    try {
      isSendingOtp.value = true;
      isLoading.value = true;

      Map<String, dynamic> response;
      if (email.isNotEmpty) {
        response = await _authService.requestEmailOtp(email: email);
      } else if (phone.isNotEmpty) {
        response = await _authService.requestPhoneOtp(phone: phone);
      } else {
        _showError('No email or phone found. Please go back and try again.');
        return;
      }

      if (response['success']) {
        final dest = email.isNotEmpty ? email : phone;
        _showSuccess('A new OTP has been sent to $dest');
      } else {
        _showError(response['message'] ?? 'Failed to resend OTP');
      }
    } catch (e) {
      _showError(e.toString());
    } finally {
      isSendingOtp.value = false;
      isLoading.value = false;
    }
  }

  // ──────────────────────────────────────────────
  // OTP — Login
  // ──────────────────────────────────────────────

  Future<void> requestPhoneOtp() async {
    final phone = phoneController.text.trim();
    if (phone.isEmpty) {
      _showError('Phone number is required');
      return;
    }

    try {
      isSendingOtp.value = true;
      isLoading.value = true;
      final response = await _authService.requestPhoneOtp(phone: phone);

      if (response['success']) {
        otpSent.value = true;
        _showSuccess('OTP sent to $phone');
      } else {
        _showError(response['message'] ?? 'Failed to send OTP');
      }
    } catch (e) {
      _showError(e.toString());
    } finally {
      isSendingOtp.value = false;
      isLoading.value = false;
    }
  }

  Future<void> requestEmailOtp() async {
    final email = emailController.text.trim();
    if (email.isEmpty) {
      _showError('Email is required');
      return;
    }

    try {
      isSendingOtp.value = true;
      isLoading.value = true;
      final response = await _authService.requestEmailOtp(email: email);

      if (response['success']) {
        otpSent.value = true;
        _showSuccess('OTP sent to $email');
      } else {
        _showError(response['message'] ?? 'Failed to send OTP');
      }
    } catch (e) {
      _showError(e.toString());
    } finally {
      isSendingOtp.value = false;
      isLoading.value = false;
    }
  }

  Future<void> loginWithPhoneOtp() async {
    final phone = phoneController.text.trim();
    final otp = otpController.text.trim();

    if (phone.isEmpty || otp.isEmpty) {
      _showError('Phone and OTP are required');
      return;
    }

    try {
      isLoading.value = true;
      final response = await _authService.loginWithPhoneOtp(
        phone: phone,
        otp: otp,
      );

      if (response['success']) {
        _saveSession(response['data']);
        Get.offAllNamed(RoutePaths.home);
      } else {
        _showError(response['message'] ?? 'Login failed');
      }
    } catch (e) {
      _showError(e.toString());
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> loginWithEmailOtp() async {
    final email = emailController.text.trim();
    final otp = otpController.text.trim();

    if (email.isEmpty || otp.isEmpty) {
      _showError('Email and OTP are required');
      return;
    }

    try {
      isLoading.value = true;
      final response = await _authService.loginWithEmailOtp(
        email: email,
        otp: otp,
      );

      if (response['success']) {
        _saveSession(response['data']);
        Get.offAllNamed(RoutePaths.home);
      } else {
        _showError(response['message'] ?? 'Login failed');
      }
    } catch (e) {
      _showError(e.toString());
    } finally {
      isLoading.value = false;
    }
  }

  // ──────────────────────────────────────────────
  // OTP — Direct Register
  // ──────────────────────────────────────────────

  Future<void> registerWithPhoneOtp() async {
    final phone = phoneController.text.trim();
    final otp = otpController.text.trim();
    final firstName = firstNameController.text.trim();
    final lastName = lastNameController.text.trim();
    final email = emailController.text.trim();

    if (phone.isEmpty || otp.isEmpty || firstName.isEmpty || lastName.isEmpty) {
      _showError('Phone, OTP, first name and last name are required');
      return;
    }

    try {
      isLoading.value = true;
      final response = await _authService.registerWithPhoneOtp(
        phone: phone,
        otp: otp,
        firstName: firstName,
        lastName: lastName,
        role: selectedRole.value,
        email: email.isNotEmpty ? email : null,
      );

      if (response['success']) {
        _saveSession(response['data']);
        _showSuccess('Account created successfully!');
        Get.offAllNamed(RoutePaths.home);
      } else {
        _showError(response['message'] ?? 'Registration failed');
      }
    } catch (e) {
      _showError(e.toString());
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> registerWithEmailOtp() async {
    final email = emailController.text.trim();
    final otp = otpController.text.trim();
    final firstName = firstNameController.text.trim();
    final lastName = lastNameController.text.trim();
    final phone = phoneController.text.trim();

    if (email.isEmpty || otp.isEmpty || firstName.isEmpty || lastName.isEmpty) {
      _showError('Email, OTP, first name and last name are required');
      return;
    }

    try {
      isLoading.value = true;
      final response = await _authService.registerWithEmailOtp(
        email: email,
        otp: otp,
        firstName: firstName,
        lastName: lastName,
        role: selectedRole.value,
        phone: phone.isNotEmpty ? phone : null,
      );

      if (response['success']) {
        _saveSession(response['data']);
        _showSuccess('Account created successfully!');
        Get.offAllNamed(RoutePaths.home);
      } else {
        _showError(response['message'] ?? 'Registration failed');
      }
    } catch (e) {
      _showError(e.toString());
    } finally {
      isLoading.value = false;
    }
  }

  // ──────────────────────────────────────────────
  // Onboarding
  // ──────────────────────────────────────────────

  Future<void> completeUserOnboarding(Map<String, dynamic> data) async {
    if (token.value.isEmpty) {
      _showError('Not authenticated');
      return;
    }

    try {
      isLoading.value = true;
      final response = await _authService.completeUserOnboarding(
        token: token.value,
        onboardingData: data,
      );

      if (response['success']) {
        currentUser.value = Map<String, dynamic>.from(response['data'] ?? {});
        _showSuccess('Profile completed');
        Get.toNamed(RoutePaths.home);
      } else {
        _showError(response['message'] ?? 'Onboarding failed');
      }
    } catch (e) {
      _showError(e.toString());
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> completeTurfOwnerOnboarding(Map<String, dynamic> data) async {
    if (token.value.isEmpty) {
      _showError('Not authenticated');
      return;
    }

    try {
      isLoading.value = true;
      final response = await _authService.completeTurfOwnerOnboarding(
        token: token.value,
        onboardingData: data,
      );

      if (response['success']) {
        currentUser.value = Map<String, dynamic>.from(response['data'] ?? {});
        _showSuccess('Turf owner profile completed');
        Get.toNamed(RoutePaths.home);
      } else {
        _showError(response['message'] ?? 'Onboarding failed');
      }
    } catch (e) {
      _showError(e.toString());
    } finally {
      isLoading.value = false;
    }
  }

  // ──────────────────────────────────────────────
  // Profile
  // ──────────────────────────────────────────────

  Future<void> fetchProfile() async {
    if (token.value.isEmpty) {
      _showError('Not authenticated');
      return;
    }

    try {
      isLoading.value = true;
      final response = await _authService.getProfile(token: token.value);

      if (response['success']) {
        currentUser.value = Map<String, dynamic>.from(response['data'] ?? {});
        final role = currentUser['role'];
        if (role != null) {
          Get.find<LocalStorageService>().saveUserRole(role.toString());
        }
      } else {
        _showError(response['message'] ?? 'Failed to fetch profile');
      }
    } catch (e) {
      _showError(e.toString());
    } finally {
      isLoading.value = false;
    }
  }

  Future<bool> updateProfile(Map<String, dynamic> data) async {
    if (token.value.isEmpty) {
      _showError('Not authenticated');
      return false;
    }

    try {
      isLoading.value = true;
      final response = await _authService.updateProfile(
        token: token.value,
        data: data,
      );

      if (response['success'] == true) {
        currentUser.value = Map<String, dynamic>.from(response['data'] ?? {});
        _showSuccess('Profile updated successfully');
        return true;
      } else {
        _showError(response['message'] ?? 'Failed to update profile');
        return false;
      }
    } catch (e) {
      _showError(e.toString());
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  Future<bool> updateNotifications(Map<String, dynamic> data) async {
    if (token.value.isEmpty) {
      _showError('Not authenticated');
      return false;
    }

    try {
      isLoading.value = true;
      final response = await _authService.updateNotifications(
        token: token.value,
        data: data,
      );

      if (response['success'] == true) {
        currentUser.value = Map<String, dynamic>.from(response['data'] ?? {});
        _showSuccess('Notification settings updated');
        return true;
      } else {
        _showError(response['message'] ?? 'Failed to update settings');
        return false;
      }
    } catch (e) {
      _showError(e.toString());
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  // ──────────────────────────────────────────────
  // Google OAuth callback (kept for compatibility)
  // ──────────────────────────────────────────────

  void handleGoogleCallback(String googleToken) {
    if (googleToken.isEmpty) {
      _showError('Google authentication failed');
      return;
    }
    token.value = googleToken;
    Get.find<LocalStorageService>().saveToken(token: googleToken);
    Get.offAllNamed(RoutePaths.home);
  }

  // ──────────────────────────────────────────────
  // Logout
  // ──────────────────────────────────────────────

  void logout() {
    token.value = '';
    currentUser.clear();
    otpSent.value = false;
    isSendingOtp.value = false;
    isGoogleLoading.value = false;
    _googleAccount = null;
    _clearControllers();
    Get.find<LocalStorageService>().clearAll();
    Get.offAllNamed(RoutePaths.login);
  }

  // ──────────────────────────────────────────────
  // Account Deletion
  // ──────────────────────────────────────────────

  Future<bool> deleteAccount({String? reason}) async {
    final t = token.value;
    if (t.isEmpty) {
      _showError('No active session found');
      return false;
    }

    try {
      isLoading.value = true;
      final response = await _authService.deleteAccount(
        token: t,
        reason: reason,
      );

      if (response['success'] == true) {
        logout();
        _showSuccess(
          'Your account and all associated data have been permanently deleted.',
        );
        return true;
      } else {
        _showError(response['message'] ?? 'Failed to delete account');
        return false;
      }
    } catch (e) {
      _showError('Error deleting account: $e');
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  // ──────────────────────────────────────────────
  // Lifecycle
  // ──────────────────────────────────────────────

  void _clearControllers() {
    emailController.clear();
    passwordController.clear();
    firstNameController.clear();
    lastNameController.clear();
    phoneController.clear();
    otpController.clear();
    isSendingOtp.value = false;
    isGoogleLoading.value = false;
  }

  @override
  void onClose() {
    _googleAuthSubscription?.cancel();
    emailController.dispose();
    passwordController.dispose();
    firstNameController.dispose();
    lastNameController.dispose();
    phoneController.dispose();
    otpController.dispose();
    super.onClose();
  }
}
