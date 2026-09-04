import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:mobile/core/constants/app_constants.dart';

class SupportService {
  static String get _base => '${AppConstants.baseUrl}/contact';

  Map<String, String> _headers(String token) {
    final headers = {
      'Content-Type': 'application/json',
    };
    if (token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  Map<String, dynamic> _handleResponse(http.Response response) {
    dynamic data;
    try {
      data = jsonDecode(response.body);
    } catch (_) {
      data = response.body;
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return {'success': true, 'data': data};
    }

    String errorMessage = 'Failed to process request';
    if (data is Map && data.containsKey('message')) {
      final msg = data['message'];
      errorMessage = msg is List ? msg.join('\n') : msg.toString();
    }
    return {'success': false, 'message': errorMessage};
  }

  Future<Map<String, dynamic>> submitTicket({
    required String token,
    required String name,
    required String email,
    required String subject,
    required String message,
    String? userId,
  }) async {
    try {
      final payload = {
        'name': name,
        'email': email,
        'subject': subject,
        'message': message,
        if (userId != null && userId.isNotEmpty) 'userId': userId,
      };

      final response = await http.post(
        Uri.parse(_base),
        headers: _headers(token),
        body: jsonEncode(payload),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> getMyTickets(String token) async {
    try {
      final response = await http.get(
        Uri.parse('$_base/my-tickets'),
        headers: _headers(token),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> getTicketDetail(String token, String id) async {
    try {
      final response = await http.get(
        Uri.parse('$_base/my-tickets/$id'),
        headers: _headers(token),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }
}
