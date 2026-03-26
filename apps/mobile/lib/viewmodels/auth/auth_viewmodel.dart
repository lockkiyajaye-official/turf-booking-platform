import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/data/services/auth_service.dart';
import 'package:mobile/core/storage/local_storage.dart';

class AuthViewmodel extends GetxController {
  final AuthService _authService = AuthService();

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
  var selectedRole = 'user'.obs; // 'user' | 'turf_owner'
  var otpSent = false.obs;
  var token = ''.obs;
  var currentUser = <String, dynamic>{}.obs;

  // ──────────────────────────────────────────────
  // Helpers
  // ──────────────────────────────────────────────
  void _showError(String message) =>
      Get.snackbar('Error', message, backgroundColor: Colors.red.shade100);

  void _showSuccess(String message) =>
      Get.snackbar('Success', message, backgroundColor: Colors.green.shade100);

  void _saveSession(Map<String, dynamic> data) {
    token.value = data['token'] ?? '';
    currentUser.value =
        Map<String, dynamic>.from(data['user'] ?? {});
    
    // Save to local storage
    if (token.value.isNotEmpty) {
      Get.find<LocalStorageService>().saveToken(token: token.value);
    }
  }

  @override
  void onInit() {
    super.onInit();
    final storedToken = Get.find<LocalStorageService>().getToken();
    if (storedToken != null && storedToken.isNotEmpty) {
      token.value = storedToken;
      fetchProfile(); // Silently pull user data
    }
  }

  // ──────────────────────────────────────────────
  // Email / Password Auth
  // ──────────────────────────────────────────────

  Future<void> register() async {
    final email = emailController.text.trim();
    final password = passwordController.text.trim();
    final firstName = firstNameController.text.trim();
    final lastName = lastNameController.text.trim();

    if (email.isEmpty || password.isEmpty || firstName.isEmpty || lastName.isEmpty) {
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
        Get.offAllNamed('/home');
      } else {
        _showError(response['message']);
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
      final response =
          await _authService.login(email: email, password: password);

      if (response['success']) {
        _saveSession(response['data']);
        _showSuccess('Login successful');
        Get.toNamed('/home');
      } else {
        _showError(response['message']);
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
      final response =
          await _authService.adminLogin(email: email, password: password);

      if (response['success']) {
        _saveSession(response['data']);
        _showSuccess('Admin login successful');
        Get.toNamed('/admin/dashboard');
      } else {
        _showError(response['message']);
      }
    } catch (e) {
      _showError(e.toString());
    } finally {
      isLoading.value = false;
    }
  }

  // ──────────────────────────────────────────────
  // OTP — Request
  // ──────────────────────────────────────────────

  Future<void> requestPhoneOtp() async {
    final phone = phoneController.text.trim();
    if (phone.isEmpty) {
      _showError('Phone number is required');
      return;
    }

    try {
      isLoading.value = true;
      final response = await _authService.requestPhoneOtp(phone: phone);

      if (response['success']) {
        otpSent.value = true;
        _showSuccess('OTP sent to $phone');
      } else {
        _showError(response['message']);
      }
    } catch (e) {
      _showError(e.toString());
    } finally {
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
      isLoading.value = true;
      final response = await _authService.requestEmailOtp(email: email);

      if (response['success']) {
        otpSent.value = true;
        _showSuccess('OTP sent to $email');
      } else {
        _showError(response['message']);
      }
    } catch (e) {
      _showError(e.toString());
    } finally {
      isLoading.value = false;
    }
  }

  // ──────────────────────────────────────────────
  // OTP — Register
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
        Get.offAllNamed('/home');
      } else {
        _showError(response['message']);
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
        Get.offAllNamed('/home');
      } else {
        _showError(response['message']);
      }
    } catch (e) {
      _showError(e.toString());
    } finally {
      isLoading.value = false;
    }
  }

  // ──────────────────────────────────────────────
  // OTP — Login
  // ──────────────────────────────────────────────

  Future<void> loginWithPhoneOtp() async {
    final phone = phoneController.text.trim();
    final otp = otpController.text.trim();

    if (phone.isEmpty || otp.isEmpty) {
      _showError('Phone and OTP are required');
      return;
    }

    try {
      isLoading.value = true;
      final response =
          await _authService.loginWithPhoneOtp(phone: phone, otp: otp);

      if (response['success']) {
        _saveSession(response['data']);
        _showSuccess('Login successful');
        Get.toNamed('/home');
      } else {
        _showError(response['message']);
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
      final response =
          await _authService.loginWithEmailOtp(email: email, otp: otp);

      if (response['success']) {
        _saveSession(response['data']);
        _showSuccess('Login successful');
        Get.toNamed('/home');
      } else {
        _showError(response['message']);
      }
    } catch (e) {
      _showError(e.toString());
    } finally {
      isLoading.value = false;
    }
  }

  // ──────────────────────────────────────────────
  // Onboarding (JWT protected)
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
        Get.toNamed('/home');
      } else {
        _showError(response['message']);
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
        Get.toNamed('/home');
      } else {
        _showError(response['message']);
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
      } else {
        _showError(response['message']);
      }
    } catch (e) {
      _showError(e.toString());
    } finally {
      isLoading.value = false;
    }
  }

  // ──────────────────────────────────────────────
  // Google OAuth
  // ──────────────────────────────────────────────

  /// Call this with the token extracted from the Google callback redirect URL.
  /// e.g. parse `?token=...` from the deep-link / WebView redirect.
  void handleGoogleCallback(String googleToken) {
    if (googleToken.isEmpty) {
      _showError('Google authentication failed');
      return;
    }
    token.value = googleToken;
    _showSuccess('Signed in with Google');
    Get.toNamed('/home');
  }

  // ──────────────────────────────────────────────
  // Logout
  // ──────────────────────────────────────────────

  void logout() {
    token.value = '';
    currentUser.clear();
    otpSent.value = false;
    _clearControllers();
    Get.find<LocalStorageService>().clearToken();
    Get.offAllNamed('/login');
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
  }

  @override
  void onClose() {
    emailController.dispose();
    passwordController.dispose();
    firstNameController.dispose();
    lastNameController.dispose();
    phoneController.dispose();
    otpController.dispose();
    super.onClose();
  }
}