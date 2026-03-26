import 'package:mobile/data/models/turf_model.dart';
import 'package:mobile/data/models/user_model.dart';

class BookingModel {
  final String id;
  final String userId;
  final UserModel? user;
  final String turfId;
  final TurfModel? turf;
  final DateTime bookingDate;
  final String startTime;
  final String endTime;
  final double totalPrice;
  final String status;
  final String? notes;
  final DateTime createdAt;

  BookingModel({
    required this.id,
    required this.userId,
    this.user,
    required this.turfId,
    this.turf,
    required this.bookingDate,
    required this.startTime,
    required this.endTime,
    required this.totalPrice,
    required this.status,
    this.notes,
    required this.createdAt,
  });

  factory BookingModel.fromJson(Map<String, dynamic> json) {
    return BookingModel(
      id: json['id'] ?? '',
      userId: json['userId'] ?? '',
      user: json['user'] != null ? UserModel.fromJson(json['user']) : null,
      turfId: json['turfId'] ?? '',
      turf: json['turf'] != null ? TurfModel.fromJson(json['turf']) : null,
      bookingDate: json['bookingDate'] != null ? DateTime.parse(json['bookingDate']) : DateTime.now(),
      startTime: json['startTime'] ?? '',
      endTime: json['endTime'] ?? '',
      totalPrice: json['totalPrice'] != null ? double.tryParse(json['totalPrice'].toString()) ?? 0.0 : 0.0,
      status: json['status'] ?? 'pending',
      notes: json['notes'],
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'turfId': turfId,
      'bookingDate': bookingDate.toIso8601String(),
      'startTime': startTime,
      'endTime': endTime,
      'totalPrice': totalPrice,
      'status': status,
      'notes': notes,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
