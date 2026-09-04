import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:mobile/core/constants/app_constants.dart';
import 'package:mobile/data/models/review_model.dart';

class ReviewService {
  static String get _base => '${AppConstants.baseUrl}/reviews';

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
    dynamic data;
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

  Future<Map<String, dynamic>> getTurfReviews(
    String turfId, {
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final uri = Uri.parse('$_base/$turfId').replace(queryParameters: {
        'page': page.toString(),
        'limit': limit.toString(),
      });
      final res = await http.get(uri, headers: _headers(null));
      final parsed = _handleResponse(res);
      if (parsed['success'] == true && parsed['data'] != null) {
        final payload = parsed['data'] is Map && parsed['data']['data'] != null
            ? parsed['data']['data']
            : parsed['data'];
        return {
          'success': true,
          'data': TurfReviewsData.fromJson(
            payload is Map<String, dynamic> ? payload : {},
          ),
        };
      }
      return parsed;
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> getMyReview(String token, String turfId) async {
    try {
      final uri = Uri.parse('$_base/$turfId/my');
      final res = await http.get(uri, headers: _headers(token));
      final parsed = _handleResponse(res);
      if (parsed['success'] == true && parsed['data'] != null) {
        final payload = parsed['data'] is Map && parsed['data']['data'] != null
            ? parsed['data']['data']
            : parsed['data'];
        if (payload != null && payload is Map<String, dynamic>) {
          return {
            'success': true,
            'data': ReviewModel.fromJson(payload),
          };
        }
        return {'success': true, 'data': null};
      }
      return parsed;
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> submitReview({
    required String token,
    required String turfId,
    required int rating,
    String? comment,
    String? bookingId,
  }) async {
    try {
      final uri = Uri.parse('$_base/$turfId');
      final body = <String, dynamic>{
        'rating': rating,
        if (comment != null && comment.trim().isNotEmpty)
          'comment': comment.trim(),
        if (bookingId != null && bookingId.isNotEmpty)
          'bookingId': bookingId,
      };

      final res = await http.post(
        uri,
        headers: _headers(token),
        body: jsonEncode(body),
      );
      return _handleResponse(res);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> deleteReview({
    required String token,
    required String turfId,
  }) async {
    try {
      final uri = Uri.parse('$_base/$turfId');
      final res = await http.delete(uri, headers: _headers(token));
      return _handleResponse(res);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }
}
