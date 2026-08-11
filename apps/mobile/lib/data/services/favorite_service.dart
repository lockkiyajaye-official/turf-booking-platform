import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:mobile/core/constants/app_constants.dart';

class FavoriteService {
  static String get _base => '${AppConstants.baseUrl}/favorites';

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

  Future<Map<String, dynamic>> getFavorites(String token) async {
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

  Future<Map<String, dynamic>> checkFavorite(String token, String turfId) async {
    try {
      final response = await http.get(
        Uri.parse('$_base/check/$turfId'),
        headers: _headers(token),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> addFavorite(String token, String turfId) async {
    try {
      final response = await http.post(
        Uri.parse('$_base/$turfId'),
        headers: _headers(token),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> removeFavorite(String token, String turfId) async {
    try {
      final response = await http.delete(
        Uri.parse('$_base/$turfId'),
        headers: _headers(token),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }
}
