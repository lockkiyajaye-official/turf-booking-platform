import 'package:url_launcher/url_launcher.dart';

class TimeHelper {
  static const String pastSlotErrorMessage =
      'This time slot has already passed. Please select an upcoming time slot.';

  /// Parses the start hour and minute from a slot string in either
  /// 24-hour ("09:00-10:00", "14:30") or 12-hour ("09:00 AM - 10:00 AM") format.
  static (int, int)? parseSlotStartTime(String slot) {
    if (slot.trim().isEmpty) return null;

    final rawStart = slot.contains('–')
        ? slot.split('–').first
        : slot.contains('-')
            ? slot.split('-').first
            : slot;

    final trimmed = rawStart.trim().toUpperCase();
    if (trimmed.isEmpty) return null;

    final match12 = RegExp(
      r'^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$',
    ).firstMatch(trimmed);
    if (match12 != null) {
      var hour = int.tryParse(match12.group(1)!);
      final minute = int.tryParse(match12.group(2)!);
      final period = match12.group(3)!;
      if (hour == null ||
          minute == null ||
          hour < 1 ||
          hour > 12 ||
          minute < 0 ||
          minute > 59) {
        return null;
      }
      if (period == 'AM' && hour == 12) {
        hour = 0;
      } else if (period == 'PM' && hour != 12) {
        hour += 12;
      }
      return (hour, minute);
    }

    final match24 = RegExp(r'^(\d{1,2}):(\d{2})(?::\d{2})?$').firstMatch(trimmed);
    if (match24 != null) {
      final hour = int.tryParse(match24.group(1)!);
      final minute = int.tryParse(match24.group(2)!);
      if (hour == null ||
          minute == null ||
          hour < 0 ||
          hour > 23 ||
          minute < 0 ||
          minute > 59) {
        return null;
      }
      return (hour, minute);
    }

    return null;
  }

  /// Returns true if the slot's start date/time has already passed relative to [now].
  static bool isSlotInPast(
    DateTime bookingDate,
    String slot, {
    DateTime? now,
  }) {
    final parsed = parseSlotStartTime(slot);
    if (parsed == null) return false;

    final current = now ?? DateTime.now();
    final slotStart = DateTime(
      bookingDate.year,
      bookingDate.month,
      bookingDate.day,
      parsed.$1,
      parsed.$2,
    );
    return !slotStart.isAfter(current);
  }

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


