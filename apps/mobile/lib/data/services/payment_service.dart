import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:mobile/core/constants/app_constants.dart';

class PaymentService {
  static const String _base = '${AppConstants.baseUrl}/payments';

  Map<String, String> _headers(String token) {
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

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

  Future<Map<String, dynamic>> createOrder({
    required String token,
    required Map<String, dynamic> data,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$_base/create'),
        headers: _headers(token),
        body: jsonEncode(data),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> verify({
    required String token,
    required Map<String, dynamic> data,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$_base/verify'),
        headers: _headers(token),
        body: jsonEncode(data),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> history(String token) async {
    try {
      final response = await http.get(
        Uri.parse('$_base/history'),
        headers: _headers(token),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  // Turf Owner Specific
  Future<Map<String, dynamic>> ownerSummary(String token) async {
    try {
      final response = await http.get(
        Uri.parse('$_base/owner/summary'),
        headers: _headers(token),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> requestPayout({
    required String token,
    required double amount,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$_base/owner/payouts'),
        headers: _headers(token),
        body: jsonEncode({'amount': amount}),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  // Admin Specific
  Future<Map<String, dynamic>> adminSummary(String token) async {
    try {
      final response = await http.get(
        Uri.parse('$_base/admin/summary'),
        headers: _headers(token),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> getAdminPayouts(String token, {String? status}) async {
    try {
      final queryParams = status != null ? '?status=$status' : '';
      final response = await http.get(
        Uri.parse('$_base/admin/payouts$queryParams'),
        headers: _headers(token),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> updatePayoutStatus({
    required String token,
    required String payoutId,
    required String status,
    String? notes,
  }) async {
    try {
      final response = await http.patch(
        Uri.parse('$_base/admin/payouts/$payoutId'),
        headers: _headers(token),
        body: jsonEncode({
          'status': status,
          if (notes != null) 'notes': notes,
        }),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }
}
