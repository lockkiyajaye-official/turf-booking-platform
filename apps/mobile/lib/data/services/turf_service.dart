import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:mobile/core/constants/app_constants.dart';

class TurfService {
  static const String _base = '${AppConstants.baseUrl}/turfs';

  Map<String, String> _headers(String? token) {
    if (token == null || token.isEmpty) {
      return {'Content-Type': 'application/json'};
    }
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

  Future<Map<String, dynamic>> createTurf({
    required String token,
    required Map<String, dynamic> data,
  }) async {
    try {
      final response = await http.post(
        Uri.parse(_base),
        headers: _headers(token),
        body: jsonEncode(data),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> findAll({
    String? token,
    String? search,
    double? minPrice,
    double? maxPrice,
    String? amenities,
  }) async {
    try {
      final queryParams = <String, String>{};
      if (search != null && search.isNotEmpty) queryParams['search'] = search;
      if (minPrice != null) queryParams['minPrice'] = minPrice.toString();
      if (maxPrice != null) queryParams['maxPrice'] = maxPrice.toString();
      if (amenities != null && amenities.isNotEmpty) queryParams['amenities'] = amenities;

      final uri = Uri.parse(_base).replace(queryParameters: queryParams);
      final response = await http.get(uri, headers: _headers(token));
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> findMyTurfs(String token) async {
    try {
      final response = await http.get(
        Uri.parse('$_base/my-turfs'),
        headers: _headers(token),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> findOne(String id) async {
    try {
      final response = await http.get(
        Uri.parse('$_base/$id'),
        headers: _headers(null),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> updateTurf({
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

  Future<Map<String, dynamic>> publishTurf(String token, String id) async {
    try {
      final response = await http.post(
        Uri.parse('$_base/$id/publish'),
        headers: _headers(token),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> unpublishTurf(String token, String id) async {
    try {
      final response = await http.post(
        Uri.parse('$_base/$id/unpublish'),
        headers: _headers(token),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> checkAvailability({
    required String id,
    required String date,
    required String startTime,
    required String endTime,
  }) async {
    try {
      final uri = Uri.parse('$_base/availability/$id').replace(queryParameters: {
        'date': date,
        'startTime': startTime,
        'endTime': endTime,
      });
      final response = await http.get(uri, headers: _headers(null));
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }
}
