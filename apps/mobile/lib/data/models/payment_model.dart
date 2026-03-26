import 'package:mobile/data/models/turf_model.dart';
import 'package:mobile/data/models/user_model.dart';
import 'package:mobile/data/models/booking_model.dart';

class PaymentModel {
  final String id;
  final String userId;
  final UserModel? user;
  final String turfId;
  final TurfModel? turf;
  final String bookingId;
  final BookingModel? booking;
  final double amount;
  final String currency;
  final String status;
  final DateTime createdAt;

  PaymentModel({
    required this.id,
    required this.userId,
    this.user,
    required this.turfId,
    this.turf,
    required this.bookingId,
    this.booking,
    required this.amount,
    required this.currency,
    required this.status,
    required this.createdAt,
  });

  factory PaymentModel.fromJson(Map<String, dynamic> json) {
    return PaymentModel(
      id: json['id'] ?? '',
      userId: json['userId'] ?? '',
      user: json['user'] != null ? UserModel.fromJson(json['user']) : null,
      turfId: json['turfId'] ?? '',
      turf: json['turf'] != null ? TurfModel.fromJson(json['turf']) : null,
      bookingId: json['bookingId'] ?? '',
      booking: json['booking'] != null ? BookingModel.fromJson(json['booking']) : null,
      amount: json['amount'] != null ? double.tryParse(json['amount'].toString()) ?? 0.0 : 0.0,
      currency: json['currency'] ?? 'INR',
      status: json['status'] ?? 'created',
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'turfId': turfId,
      'bookingId': bookingId,
      'amount': amount,
      'currency': currency,
      'status': status,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
