import 'package:url_launcher/url_launcher.dart';

class TimeHelper {
  /// Converts any time string (e.g. "14:00 - 15:00", "09:00-10:00", "14:00")
  /// into a standard 12-hour formatted string (e.g. "02:00 PM - 03:00 PM", "02:00 PM").
  static String formatTo12Hour(String timeStr) {
    if (timeStr.trim().isEmpty) return timeStr;
    final trimmed = timeStr.trim();

    // If it contains a hyphen, format both sides
    if (trimmed.contains('-') || trimmed.contains('–')) {
      final delimiter = trimmed.contains('–') ? '–' : '-';
      final parts = trimmed.split(delimiter);
      if (parts.length == 2) {
        final start = formatSingleTime(parts[0].trim());
        final end = formatSingleTime(parts[1].trim());
        return '$start - $end';
      }
    }

    return formatSingleTime(trimmed);
  }

  /// Formats a single time like "14:00", "9:30", or "14:00:00" into 12-hour format ("02:00 PM").
  /// If it already contains AM/PM, it returns it cleaned up.
  static String formatSingleTime(String time) {
    final t = time.trim();
    if (t.isEmpty) return t;

    final upper = t.toUpperCase();
    if (upper.contains('AM') || upper.contains('PM')) {
      return t;
    }

    final match = RegExp(r'^(\d{1,2}):(\d{2})(?::\d{2})?$').firstMatch(t);
    if (match != null) {
      final hour = int.tryParse(match.group(1)!);
      final minute = match.group(2)!;
      if (hour != null) {
        final suffix = hour >= 12 ? 'PM' : 'AM';
        int displayHour = hour % 12;
        if (displayHour == 0) displayHour = 12;
        final hStr = displayHour.toString().padLeft(2, '0');
        return '$hStr:$minute $suffix';
      }
    }

    return t;
  }
}

class WhatsAppHelper {
  /// Cleans phone and formats it for WhatsApp URL (adds 91 country code if 10-digit).
  static String formatPhoneNumber(String phone) {
    var digits = phone.replaceAll(RegExp(r'[^0-9]'), '');
    if (digits.startsWith('0')) {
      digits = digits.substring(1);
    }
    if (digits.length == 10) {
      digits = '91$digits';
    }
    return digits;
  }

  /// Builds a clean, professional booking confirmation message for WhatsApp.
  static String buildConfirmationMessage({
    required String bookingId,
    required String turfName,
    String? customerName,
    required String date,
    required String time,
    required dynamic amount,
    String? address,
    String? status,
  }) {
    final cleanId = bookingId.length > 8
        ? bookingId.substring(0, 8).toUpperCase()
        : bookingId.toUpperCase();
    final statusText = (status ?? 'Confirmed').toUpperCase();

    final buffer = StringBuffer();
    buffer.writeln('🏟️ *BOOKING CONFIRMATION*');
    buffer.writeln('────────────────────────');
    if (customerName != null && customerName.trim().isNotEmpty) {
      buffer.writeln('Hello *$customerName*, your booking is confirmed! ✅\n');
    } else {
      buffer.writeln('Hello, your turf booking is confirmed! ✅\n');
    }
    buffer.writeln('📋 *Booking ID:* #$cleanId');
    buffer.writeln('🏟️ *Turf:* $turfName');
    if (address != null &&
        address.trim().isNotEmpty &&
        address != 'Address N/A') {
      buffer.writeln('📍 *Location:* $address');
    }
    buffer.writeln('📅 *Date:* $date');
    buffer.writeln('⏰ *Time:* $time');
    buffer.writeln('💰 *Amount:* ₹$amount');
    buffer.writeln('⚡ *Status:* $statusText');
    buffer.writeln('────────────────────────');
    buffer.writeln('Please arrive 10 minutes before your slot time.');
    buffer.writeln('Have a great game! ⚽🏏');

    return buffer.toString();
  }

  /// Opens WhatsApp chat with the customer prefilled with confirmation details.
  static Future<bool> sendConfirmationMessage({
    required String phone,
    required String message,
  }) async {
    final cleanPhone = formatPhoneNumber(phone);
    if (cleanPhone.isEmpty) return false;

    final urlStr =
        'https://wa.me/$cleanPhone?text=${Uri.encodeComponent(message)}';
    final uri = Uri.parse(urlStr);

    try {
      if (await canLaunchUrl(uri)) {
        return await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        return await launchUrl(uri);
      }
    } catch (_) {
      return false;
    }
  }
}


