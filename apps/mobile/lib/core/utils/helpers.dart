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

