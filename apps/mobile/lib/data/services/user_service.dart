import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:mobile/core/constants/app_constants.dart';

class UserService {
  static const String _base = '${AppConstants.baseUrl}/users';

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

  Future<Map<String, dynamic>> findAll(String token, {String? role}) async {
    try {
      final queryParams = role != null ? '?role=$role' : '';
      final response = await http.get(
        Uri.parse('$_base$queryParams'),
        headers: _headers(token),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> getStatistics(String token) async {
    try {
      final response = await http.get(
        Uri.parse('$_base/statistics'),
        headers: _headers(token),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> getTurfOwners(String token) async {
    try {
      final response = await http.get(
        Uri.parse('$_base/turf-owners'),
        headers: _headers(token),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> findOne(String token, String id) async {
    try {
      final response = await http.get(
        Uri.parse('$_base/$id'),
        headers: _headers(token),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> approveTurfOwner({
    required String token,
    required String id,
    String? approvalNotes,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$_base/turf-owners/$id/approve'),
        headers: _headers(token),
        body: jsonEncode({if (approvalNotes != null) 'approvalNotes': approvalNotes}),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> rejectTurfOwner({
    required String token,
    required String id,
    required String approvalNotes,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$_base/turf-owners/$id/reject'),
        headers: _headers(token),
        body: jsonEncode({'approvalNotes': approvalNotes}),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> updateUser({
    required String token,
    required String id,
    required Map<String, dynamic> data,
  }) async {
    try {
      final response = await http.patch(
        Uri.parse('$_base/$id'),
        headers: _headers(token),
        body: jsonEncode(data),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> deleteUser(String token, String id) async {
    try {
      final response = await http.delete(
        Uri.parse('$_base/$id'),
        headers: _headers(token),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }
}
