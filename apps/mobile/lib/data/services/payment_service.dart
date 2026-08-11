import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:mobile/core/constants/app_constants.dart';

class PaymentService {
  static String get _base => '${AppConstants.baseUrl}/payments';

  Map<String, String> _headers(String token) {
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
        errorMessage = msg.join(', ');
      } else if (msg is String) {
        errorMessage = msg;
      }
    }
    return {'success': false, 'message': errorMessage};
  }

  /// Fetch user payment history
  Future<Map<String, dynamic>> history(String token) async {
    try {
      final res = await http.get(
        Uri.parse('$_base/history'),
        headers: _headers(token),
      );
      return _handleResponse(res);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  /// Alias for owner finance summary
  Future<Map<String, dynamic>> ownerSummary(String token) async {
    return getOwnerSummary(token);
  }

  /// Fetch owner finance summary (wallet balance, revenue, payout history)
  Future<Map<String, dynamic>> getOwnerSummary(String token) async {
    try {
      final res = await http.get(
        Uri.parse('$_base/owner/summary'),
        headers: _headers(token),
      );
      return _handleResponse(res);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  /// Request payout for owner
  Future<Map<String, dynamic>> requestPayout(
      String token, double amount) async {
    try {
      final res = await http.post(
        Uri.parse('$_base/owner/payouts'),
        headers: _headers(token),
        body: jsonEncode({'amount': amount}),
      );
      return _handleResponse(res);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  /// Create Razorpay payment order
  Future<Map<String, dynamic>> createOrder({
    required String token,
    required String turfId,
    required String bookingDate,
    required String startTime,
    required String endTime,
  }) async {
    try {
      final res = await http.post(
        Uri.parse('$_base/create'),
        headers: _headers(token),
        body: jsonEncode({
          'turfId': turfId,
          'bookingDate': bookingDate,
          'startTime': startTime,
          'endTime': endTime,
        }),
      );
      return _handleResponse(res);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  /// Verify Razorpay payment and confirm booking
  Future<Map<String, dynamic>> verifyPayment({
    required String token,
    required String bookingId,
    required String razorpayOrderId,
    required String razorpayPaymentId,
    required String razorpaySignature,
  }) async {
    try {
      final res = await http.post(
        Uri.parse('$_base/verify'),
        headers: _headers(token),
        body: jsonEncode({
          'bookingId': bookingId,
          'razorpay_order_id': razorpayOrderId,
          'razorpay_payment_id': razorpayPaymentId,
          'razorpay_signature': razorpaySignature,
        }),
      );
      return _handleResponse(res);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }
}
