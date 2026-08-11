/// Mirrors the JSON returned by BookingsService (bookings.service.ts).
/// Adjust field names here if your DTO/serializer differs.
class BookingModel {
  final String id;
  final String turfId;
  final String turfName;
  final String turfType;
  final String turfLocation;
  final String? turfImage;
  final DateTime bookingDate;
  final String startTime; // "19:00"
  final String endTime; // "20:00"
  final double totalPrice;
  final String status; // PENDING | CONFIRMED | CANCELLED | COMPLETED
  final String? cancellationReason;
  final DateTime? cancelledAt;
  final double refundAmount;
  final String? refundStatus;

  const BookingModel({
    required this.id,
    required this.turfId,
    required this.turfName,
    required this.turfType,
    required this.turfLocation,
    required this.turfImage,
    required this.bookingDate,
    required this.startTime,
    required this.endTime,
    required this.totalPrice,
    required this.status,
    this.cancellationReason,
    this.cancelledAt,
    this.refundAmount = 0.0,
    this.refundStatus,
  });

  factory BookingModel.fromJson(Map<String, dynamic> json) {
    final turf = (json['turf'] ?? const {}) as Map<String, dynamic>;
    final images = (turf['images'] as List?) ?? const [];

    return BookingModel(
      id: json['id'].toString(),
      turfId: (json['turfId'] ?? turf['id'] ?? '').toString(),
      turfName: (turf['name'] ?? 'Turf') as String,
      turfType: (turf['sportType'] ?? turf['type'] ?? 'Cricket Turf') as String,
      turfLocation: (turf['address'] ?? '') as String,
      turfImage: images.isNotEmpty ? images.first as String : null,
      bookingDate: DateTime.parse(json['bookingDate'] as String),
      startTime: json['startTime'] as String,
      endTime: json['endTime'] as String,
      totalPrice: _parseDouble(json['totalPrice']),
      status: json['status'] as String,
      cancellationReason: json['cancellationReason'] as String?,
      cancelledAt: json['cancelledAt'] != null ? DateTime.tryParse(json['cancelledAt'].toString()) : null,
      refundAmount: _parseDouble(json['refundAmount']),
      refundStatus: json['refundStatus'] as String?,
    );
  }

  /// Postgres `decimal`/`numeric` columns come back as JSON *strings* from
  /// TypeORM/pg (to avoid float precision loss) when read via a query, but
  /// as a plain number right after `.save()` on a freshly created entity.
  /// So the same field can arrive as either type depending on which
  /// endpoint returned it — handle both instead of a raw `as num` cast.
  static double _parseDouble(dynamic value) {
    if (value is num) return value.toDouble();
    if (value is String) return double.tryParse(value) ?? 0;
    return 0;
  }

  /// "Active" tab = still upcoming / actionable.
  /// "Past" tab = completed or the date has already gone by.
  bool get isPast {
    final now = DateTime.now();
    final endOfBookingDay =
        DateTime(bookingDate.year, bookingDate.month, bookingDate.day, 23, 59);
    final s = status.toLowerCase();
    return s == 'completed' ||
        s == 'cancelled' ||
        endOfBookingDay.isBefore(now);
  }

  String get displayStatus {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      case 'completed':
        return 'Played';
      default:
        return status;
    }
  }

  static const _months = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'
  ];

  String get displayDate =>
      '${_months[bookingDate.month - 1]} ${bookingDate.day}, ${bookingDate.year}';

  String get displayTime => '${_fmt(startTime)} – ${_fmt(endTime)}';

  static String _fmt(String hhmm) {
    final parts = hhmm.split(':');
    var h = int.parse(parts[0]);
    final suffix = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h == 0) h = 12;
    return '${h.toString().padLeft(2, '0')}:${parts[1]} $suffix';
  }
}