import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:mobile/core/constants/app_constants.dart';

class NotificationService {
  static String get _base => '${AppConstants.baseUrl}/notifications';

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

    String errorMessage = 'Failed to process request';
    if (data is Map && data.containsKey('message')) {
      final msg = data['message'];
      errorMessage = msg is List ? msg.join('\n') : msg.toString();
    }
    return {'success': false, 'message': errorMessage};
  }

  Future<Map<String, dynamic>> getNotifications(String token) async {
    try {
      final response = await http.get(
        Uri.parse(_base),
        headers: _headers(token),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> markAsRead(String token, String id) async {
    try {
      final response = await http.patch(
        Uri.parse('$_base/$id/read'),
        headers: _headers(token),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> markAllAsRead(String token) async {
    try {
      final response = await http.patch(
        Uri.parse('$_base/read-all'),
        headers: _headers(token),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }
}
