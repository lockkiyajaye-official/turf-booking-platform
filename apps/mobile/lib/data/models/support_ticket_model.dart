import 'package:flutter/material.dart';

class SupportTicketModel {
  final String id;
  final String name;
  final String email;
  final String subject;
  final String message;
  final String status;
  final String? adminResponse;
  final DateTime? respondedAt;
  final String? respondedBy;
  final DateTime createdAt;
  final DateTime? updatedAt;

  SupportTicketModel({
    required this.id,
    required this.name,
    required this.email,
    required this.subject,
    required this.message,
    required this.status,
    this.adminResponse,
    this.respondedAt,
    this.respondedBy,
    required this.createdAt,
    this.updatedAt,
  });

  factory SupportTicketModel.fromJson(Map<String, dynamic> json) {
    DateTime? parseDate(dynamic date) {
      if (date == null) return null;
      try {
        return DateTime.parse(date.toString()).toLocal();
      } catch (_) {
        return null;
      }
    }

    return SupportTicketModel(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      subject: json['subject']?.toString() ?? '',
      message: json['message']?.toString() ?? '',
      status: json['status']?.toString().toLowerCase() ?? 'pending',
      adminResponse: json['adminResponse'] as String?,
      respondedAt: parseDate(json['respondedAt']),
      respondedBy: json['respondedBy'] as String?,
      createdAt: parseDate(json['createdAt']) ?? DateTime.now(),
      updatedAt: parseDate(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'subject': subject,
      'message': message,
      'status': status,
      'adminResponse': adminResponse,
      'respondedAt': respondedAt?.toIso8601String(),
      'respondedBy': respondedBy,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  bool get hasAdminResponse =>
      adminResponse != null && adminResponse!.trim().isNotEmpty;

  bool get isResolved => status == 'resolved';
  bool get isPending => status == 'pending';
  bool get isInProgress => status == 'in_progress';
  bool get isClosed => status == 'closed';

  String get statusText {
    switch (status) {
      case 'resolved':
        return 'Resolved';
      case 'in_progress':
        return 'In Progress';
      case 'closed':
        return 'Closed';
      case 'pending':
      default:
        return 'Pending Review';
    }
  }

  Color get statusColor {
    switch (status) {
      case 'resolved':
        return const Color(0xFF16A34A);
      case 'in_progress':
        return const Color(0xFF2563EB);
      case 'closed':
        return const Color(0xFF6B7280);
      case 'pending':
      default:
        return const Color(0xFFD97706);
    }
  }

  Color get statusBgColor {
    switch (status) {
      case 'resolved':
        return const Color(0xFFDCFCE7);
      case 'in_progress':
        return const Color(0xFFDBEAFE);
      case 'closed':
        return const Color(0xFFF3F4F6);
      case 'pending':
      default:
        return const Color(0xFFFEF3C7);
    }
  }

  static String _formatDate(DateTime dt) {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ];
    final month = months[dt.month - 1];
    final day = dt.day;
    final year = dt.year;
    final hour = dt.hour == 0 ? 12 : (dt.hour > 12 ? dt.hour - 12 : dt.hour);
    final minute = dt.minute.toString().padLeft(2, '0');
    final period = dt.hour >= 12 ? 'PM' : 'AM';
    return '$month $day, $year • $hour:$minute $period';
  }

  String get formattedCreatedAt => _formatDate(createdAt);

  String get formattedRespondedAt =>
      respondedAt != null ? _formatDate(respondedAt!) : '';
}
