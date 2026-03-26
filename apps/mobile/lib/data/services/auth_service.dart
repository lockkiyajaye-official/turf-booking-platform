import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:mobile/core/constants/app_constants.dart';

class AuthService {
  static const String _base = '${AppConstants.baseUrl}/auth';

  Map<String, String> get _headers => {'Content-Type': 'application/json'};

  Map<String, String> _authHeaders(String token) => {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      };

  Map<String, dynamic> _handleResponse(http.Response response) {
    var data;
    try {
      data = jsonDecode(response.body);
    } catch (_) {
      data = response.body;
    }
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return {'success': true, 'data': data};
    }
    
    String errorMessage = 'Something went wrong';
    if (data is Map && data.containsKey('message')) {
      final msg = data['message'];
      if (msg is List) {
        errorMessage = msg.join('\n');
      } else {
        errorMessage = msg.toString();
      }
    } else if (data is String) {
      errorMessage = data;
    }

    return {
      'success': false,
      'message': errorMessage,
    };
  }

  // ──────────────────────────────────────────────
  // Email / Password Auth
  // ──────────────────────────────────────────────

/// POST /auth/google/token — send idToken from native Google SDK
Future<Map<String, dynamic>> loginWithGoogle({
  required String idToken,
}) async {
  try {
    final response = await http.post(
      Uri.parse('$_base/google/token'),
      headers: _headers,
      body: jsonEncode({'idToken': idToken}),
    );
    return _handleResponse(response);
  } catch (e) {
    return {'success': false, 'message': e.toString()};
  }
}

  /// POST /auth/register
  Future<Map<String, dynamic>> register({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    String role = 'user',
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$_base/register'),
        headers: _headers,
        body: jsonEncode({
          'email': email,
          'password': password,
          'firstName': firstName,
          'lastName': lastName,
          'role': role,
        }),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  /// POST /auth/login
  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$_base/login'),
        headers: _headers,
        body: jsonEncode({'email': email, 'password': password}),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  /// POST /auth/admin/login
  Future<Map<String, dynamic>> adminLogin({
    required String email,
    required String password,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$_base/admin/login'),
        headers: _headers,
        body: jsonEncode({'email': email, 'password': password}),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  // ──────────────────────────────────────────────
  // OTP — Request
  // ──────────────────────────────────────────────

  /// POST /auth/otp/phone/request
  Future<Map<String, dynamic>> requestPhoneOtp({required String phone}) async {
    try {
      final response = await http.post(
        Uri.parse('$_base/otp/phone/request'),
        headers: _headers,
        body: jsonEncode({'phone': phone}),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  /// POST /auth/otp/email/request
  Future<Map<String, dynamic>> requestEmailOtp({required String email}) async {
    try {
      final response = await http.post(
        Uri.parse('$_base/otp/email/request'),
        headers: _headers,
        body: jsonEncode({'email': email}),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  // ──────────────────────────────────────────────
  // OTP — Register
  // ──────────────────────────────────────────────

  /// POST /auth/register/phone
  Future<Map<String, dynamic>> registerWithPhoneOtp({
    required String phone,
    required String otp,
    required String firstName,
    required String lastName,
    String role = 'user',
    String? email,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$_base/register/phone'),
        headers: _headers,
        body: jsonEncode({
          'phone': phone,
          'otp': otp,
          'firstName': firstName,
          'lastName': lastName,
          'role': role,
          if (email != null) 'email': email,
        }),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  /// POST /auth/register/email
  Future<Map<String, dynamic>> registerWithEmailOtp({
    required String email,
    required String otp,
    required String firstName,
    required String lastName,
    String role = 'user',
    String? phone,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$_base/register/email'),
        headers: _headers,
        body: jsonEncode({
          'email': email,
          'otp': otp,
          'firstName': firstName,
          'lastName': lastName,
          'role': role,
          if (phone != null) 'phone': phone,
        }),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  // ──────────────────────────────────────────────
  // OTP — Login
  // ──────────────────────────────────────────────

  /// POST /auth/login/phone
  Future<Map<String, dynamic>> loginWithPhoneOtp({
    required String phone,
    required String otp,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$_base/login/phone'),
        headers: _headers,
        body: jsonEncode({'phone': phone, 'otp': otp}),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  /// POST /auth/login/email
  Future<Map<String, dynamic>> loginWithEmailOtp({
    required String email,
    required String otp,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$_base/login/email'),
        headers: _headers,
        body: jsonEncode({'email': email, 'otp': otp}),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  // ──────────────────────────────────────────────
  // Onboarding (JWT protected)
  // ──────────────────────────────────────────────

  /// POST /auth/onboarding/user  — requires JWT token
  Future<Map<String, dynamic>> completeUserOnboarding({
    required String token,
    required Map<String, dynamic> onboardingData,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$_base/onboarding/user'),
        headers: _authHeaders(token),
        body: jsonEncode(onboardingData),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  /// POST /auth/onboarding/turf-owner  — requires JWT token
  Future<Map<String, dynamic>> completeTurfOwnerOnboarding({
    required String token,
    required Map<String, dynamic> onboardingData,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$_base/onboarding/turf-owner'),
        headers: _authHeaders(token),
        body: jsonEncode(onboardingData),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  // ──────────────────────────────────────────────
  // Profile (JWT protected)
  // ──────────────────────────────────────────────

  /// GET /auth/me  — requires JWT token
  Future<Map<String, dynamic>> getProfile({required String token}) async {
    try {
      final response = await http.get(
        Uri.parse('$_base/me'),
        headers: _authHeaders(token),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  // ──────────────────────────────────────────────
  // Google OAuth
  // ──────────────────────────────────────────────

  /// Returns the URL to open in a browser / WebView for Google OAuth.
  /// After the flow, the backend redirects to your frontendUrl with ?token=...
  String get googleAuthUrl => '$_base/google';
}