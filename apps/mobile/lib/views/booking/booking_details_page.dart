import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:get/get.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/data/models/amentity_item.dart';
import 'package:mobile/data/models/day_item.dart';
import 'package:mobile/data/models/turf_model.dart';
import 'package:mobile/data/services/booking_service.dart';
import 'package:mobile/viewmodels/auth/auth_viewmodel.dart';
import 'package:mobile/views/home/widgets/amentity_chip.dart';
import 'package:mobile/views/widgets/my_buttons.dart';

class TurfDetailsPage extends StatefulWidget {
  final TurfModel turf;

  const TurfDetailsPage({super.key, required this.turf});

  @override
  State<TurfDetailsPage> createState() => _TurfDetailsPageState();
}

class _TurfDetailsPageState extends State<TurfDetailsPage> {
  int _playerCount = 10;
  int _selectedDayIndex = 0;
  int _selectedSlotIndex = 1;
  int _currentImageIndex = 0;
  bool _isBooking = false;

  late final List<String> _imageUrls;
  late final Razorpay _razorpay;

  final BookingService _bookingService = BookingService();
  final AuthViewmodel _authViewmodel = Get.find<AuthViewmodel>();

  // Note: this page needs the created booking's id + backend-computed price
  // back before opening Razorpay, which BookingViewmodel.createBooking()
  // doesn't return (it snackbars + navigates back instead) — so this page
  // calls BookingService directly, same as BookingViewmodel does, rather
  // than going through the viewmodel.
  String get _token => _authViewmodel.token.value;

  // Holds the PENDING booking id + price returned by createBooking, until payment confirms it.
  String? _pendingBookingId;
  num? _pendingBookingAmount;

    final String _razorpayKeyId =
      '${dotenv.env['RAZORPAY']}'; // RAZORPAY_KEY_ID only — never put the secret in the app

  // Real, upcoming dates (today + next 6 days) instead of hardcoded ones —
  // the old hardcoded "January 2026" days were disconnected from reality,
  // so whatever got sent to checkAvailability/createBooking almost never
  // matched an actual bookable date.
  late final List<DateTime> _dayDates = List.generate(
    7,
    (i) => DateTime.now().add(Duration(days: i)),
  );

  static const _weekdayAbbr = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  static const _monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'
  ];

  late final List<DayItem> _days = _dayDates
      .map((d) => DayItem(
            day: _weekdayAbbr[d.weekday - 1],
            date: d.day.toString().padLeft(2, '0'),
          ))
      .toList();

  late final List<String> _slots;
  late final List<AmenityItem> _amenities;

  IconData _getIconForAmenity(String name) {
    switch (name.toLowerCase()) {
      case 'washrooms':
      case 'washroom':
        return Icons.bathtub_outlined;
      case 'parking':
        return Icons.local_parking_outlined;
      case 'cctv & safety':
      case 'cctv':
        return Icons.videocam_outlined;
      case 'night lights':
      case 'lights':
        return Icons.lightbulb_outline;
      case 'water':
        return Icons.water_drop_outlined;
      default:
        return Icons.check_circle_outline;
    }
  }

  @override
  void initState() {
    super.initState();

    _razorpay = Razorpay();
    _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _onPaymentSuccess);
    _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _onPaymentError);
    _razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, _onExternalWallet);

    _imageUrls = widget.turf.images.isNotEmpty
        ? widget.turf.images
        : ['https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&q=80'];
    // NOTE: this must match the "HH:mm-HH:mm" format the backend stores in
    // Turf.availableSlots and checks against in checkAvailability(). The
    // old fallback list ("9:00AM" etc.) didn't match that format, so
    // createBooking always failed with "Slot not in available slots".
    _slots = widget.turf.availableSlots.isNotEmpty
        ? widget.turf.availableSlots
        : [
            '09:00-10:00',
            '10:00-11:00',
            '11:00-12:00',
            '12:00-13:00',
            '13:00-14:00',
            '14:00-15:00',
            '15:00-16:00',
            '18:00-19:00',
          ];

    _amenities = widget.turf.amenities.isNotEmpty
        ? widget.turf.amenities
              .map((a) => AmenityItem(icon: _getIconForAmenity(a), label: a))
              .toList()
        : [
            AmenityItem(icon: Icons.bathtub_outlined, label: 'Washrooms'),
            AmenityItem(icon: Icons.lightbulb_outline, label: 'Night Lights'),
            AmenityItem(icon: Icons.local_parking_outlined, label: 'Parking'),
            AmenityItem(icon: Icons.videocam_outlined, label: 'CCTV & Safety'),
          ];
  }

  @override
  void dispose() {
    _razorpay.clear(); // removes all listeners
    super.dispose();
  }

  /// "August 2026" normally, or "Aug – Sep 2026" if the 7-day strip
  /// crosses a month boundary.
  String _visibleMonthLabel() {
    final first = _dayDates.first;
    final last = _dayDates.last;
    if (first.month == last.month) {
      return '${_monthNames[first.month - 1]} ${first.year}';
    }
    return '${_monthNames[first.month - 1].substring(0, 3)} – '
        '${_monthNames[last.month - 1].substring(0, 3)} ${last.year}';
  }

  String _formatSlot(String slot) {
    final match = RegExp(r'^(\d{2}):(\d{2})-(\d{2}):(\d{2})$').firstMatch(slot.trim());
    if (match == null) return slot;

    int startHour = int.parse(match.group(1)!);
    int endHour = int.parse(match.group(3)!);

    String formatHour(int hour) {
      final suffix = hour >= 12 ? 'PM' : 'AM';
      int displayHour = hour % 12;
      if (displayHour == 0) displayHour = 12;
      return '$displayHour $suffix';
    }

    return '${formatHour(startHour)} - ${formatHour(endHour)}';
  }

  /// Raw "HH:mm" pair for the currently selected slot, as the backend expects it.
  (String, String) _selectedSlotRaw() {
    final slot = _slots[_selectedSlotIndex].trim();
    final parts = slot.split('-');
    if (parts.length == 2) {
      return (parts[0].trim(), parts[1].trim());
    }
    // Slot didn't come in "HH:mm-HH:mm" — surface this loudly rather than
    // silently sending a bad pair that the backend will just reject anyway.
    throw FormatException('Unrecognized slot format: "$slot"');
  }

  /// yyyy-MM-dd for the currently selected day chip, using the real
  /// DateTime it was generated from (not a hardcoded month/year).
  String _selectedDateIso() {
    final d = _dayDates[_selectedDayIndex];
    return '${d.year.toString().padLeft(4, '0')}-'
        '${d.month.toString().padLeft(2, '0')}-'
        '${d.day.toString().padLeft(2, '0')}';
  }

  /// Step 1: create PENDING booking via API, real row + real price back.
  /// Step 2: open Razorpay for that amount. Booking only CONFIRMED after
  /// payment success (see _onPaymentSuccess).
  Future<void> _startBookingFlow() async {
    if (_isBooking) return;
    if (_token.isEmpty) {
      Get.snackbar('Error', 'Not authenticated', backgroundColor: Colors.red.shade100);
      return;
    }
    setState(() => _isBooking = true);

    final String startTime;
    final String endTime;
    try {
      (startTime, endTime) = _selectedSlotRaw();
    } on FormatException catch (e) {
      setState(() => _isBooking = false);
      _showMessage(e.message);
      return;
    }

    final result = await _bookingService.createBooking(
      token: _token,
      data: {
        'turfId': widget.turf.id,
        'bookingDate': _selectedDateIso(),
        'startTime': startTime,
        'endTime': endTime,
      },
    );

    if (mounted) setState(() => _isBooking = false);

    if (result['success'] != true) {
      _showMessage(result['message'] ?? 'Could not create booking.');
      return;
    }

    final booking = result['data'] as Map<String, dynamic>;
    _pendingBookingId = booking['id'].toString();
    _pendingBookingAmount = _parseNum(booking['totalPrice']);
    _openCheckout();
  }

  /// Same reasoning as BookingModel._parseDouble — totalPrice can arrive as
  /// a JSON number or a string depending on which backend path returned it.
  num _parseNum(dynamic value) {
    if (value is num) return value;
    if (value is String) return num.tryParse(value) ?? 0;
    return 0;
  }

  void _openCheckout() {
    var options = {
      'key': _razorpayKeyId,
      // Backend-computed price, not a locally guessed amount.
      'amount': ((_pendingBookingAmount ?? 0) * 100).toInt(), // paise
      'name': widget.turf.name,
      'description':
          'Booking for ${_days[_selectedDayIndex].day} ${_days[_selectedDayIndex].date} - ${_formatSlot(_slots[_selectedSlotIndex])}',
      'notes': {'bookingId': _pendingBookingId},
      'prefill': {
        'contact': '', // TODO: pass user's phone number
        'email': '', // TODO: pass user's email
      },
      'theme': {'color': '#0DAA6C'},
    };

    try {
      _razorpay.open(options);
    } catch (e) {
      debugPrint('Razorpay open error: $e');
      _showMessage('Could not open payment screen.');
    }
  }

  Future<void> _onPaymentSuccess(PaymentSuccessResponse response) async {
    // TODO: verify payment signature server-side (RAZORPAY_KEY_SECRET)
    // before trusting this and confirming booking.
    final id = _pendingBookingId;
    if (id == null) return;

    final result = await _bookingService.updateStatus(
      token: _token,
      id: id,
      status: 'CONFIRMED',
    );

    if (!mounted) return;
    if (result['success'] == true) {
      _showMessage('Booking confirmed! Payment ID: ${response.paymentId}', isError: false);
      // e.g. Navigator.pushReplacement(context, ...BookingConfirmationPage...)
    } else {
      // Show the backend's actual message — a generic string here just
      // hides the real cause (validation error, wrong route, auth, etc).
     
    }
  }

  void _onPaymentError(PaymentFailureResponse response) {
    // Leave PENDING or cancel, don't confirm.
    final id = _pendingBookingId;
    if (id != null) {
      _bookingService.cancelBooking(_token, id);
    }
    _showMessage('Payment failed: ${response.message ?? 'Unknown error'}');
  }

  void _onExternalWallet(ExternalWalletResponse response) {
    _showMessage('External wallet selected: ${response.walletName}');
  }

  void _showMessage(String message, {bool isError = true}) {
    Get.snackbar(
      isError ? 'Error' : 'Success',
      message,
      backgroundColor: isError ? Colors.red.shade100 : Colors.green.shade100,
    );
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final primaryGreen = const Color(
      0xFF0DAA6C,
    ); // Matching screenshot green exactly

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        leading: IconButton(
          icon: const Icon(
            Icons.arrow_back_ios_new,
            color: Colors.black,
            size: 20,
          ),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Turf Details',
          style: textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w700,
            color: const Color(0xFF1C1C1E),
            fontSize: 16.sp,
          ),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 16.w),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(height: 8.h),

              // ── Image carousel ─────────────────────────
              Stack(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: SizedBox(
                      height: 260.h,
                      child: PageView.builder(
                        itemCount: _imageUrls.length,
                        onPageChanged: (i) =>
                            setState(() => _currentImageIndex = i),
                        itemBuilder: (context, index) {
                          return Image.network(
                            _imageUrls[index],
                            fit: BoxFit.cover,
                            width: double.infinity,
                            errorBuilder: (_, __, ___) => Container(
                              color: Colors.grey[200],
                              child: const Icon(
                                Icons.sports_soccer,
                                size: 48,
                                color: Colors.grey,
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                  ),
                  // Dot indicators
                  Positioned(
                    bottom: 16.h,
                    left: 0,
                    right: 0,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(
                        _imageUrls.length,
                        (i) => Container(
                          margin: EdgeInsets.symmetric(horizontal: 4.w),
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: _currentImageIndex == i
                                ? Colors.white
                                : Colors.white.withOpacity(0.4),
                            shape: BoxShape.circle,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),

              SizedBox(height: 16.h),

              // ── Turf Title & Subtitle ─────────────────
              Text(
                widget.turf.name,
                style: textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w700,
                  fontSize: 20.sp,
                  color: const Color(0xFF454555), // Dark bluish grey
                ),
              ),
              SizedBox(height: 4.h),
              Text(
                widget.turf.description?.isNotEmpty == true
                    ? widget.turf.description!
                    : 'Cricket Turf',
                style: textTheme.bodyMedium?.copyWith(
                  color: Colors.grey[700],
                  fontSize: 13.sp,
                  fontWeight: FontWeight.w500,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              SizedBox(height: 8.h),

              // Rating + Location
              Row(
                children: [
                  const Icon(Icons.star, color: Color(0xFFFFC107), size: 14),
                  SizedBox(width: 4.w),
                  Text(
                    '${widget.turf.rating ?? 0.0} (${widget.turf.totalReviews})',
                    style: textTheme.bodySmall?.copyWith(
                      color: Colors.grey[600],
                      fontSize: 11.sp,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
              SizedBox(height: 4.h),
              Text(
                widget.turf.address,
                style: textTheme.bodySmall?.copyWith(
                  color: Colors.grey[600],
                  fontSize: 12.sp,
                  letterSpacing: -0.2,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),

              SizedBox(height: 24.h),

              // ── Amenities ─────────────────────────
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Amenities',
                    style: textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: const Color(0xFF454555),
                      fontSize: 14.sp,
                    ),
                  ),
                  Row(
                    children: [
                      Icon(
                        Icons.location_on_outlined,
                        color: primaryGreen,
                        size: 16,
                      ),
                      SizedBox(width: 4.w),
                      Text(
                        'View on Map',
                        style: textTheme.bodySmall?.copyWith(
                          color: primaryGreen,
                          fontWeight: FontWeight.w600,
                          fontSize: 12.sp,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              SizedBox(height: 16.h),
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: _amenities
                      .map(
                        (a) => Padding(
                          padding: EdgeInsets.only(right: 12.w),
                          child: AmenityChip(item: a),
                        ),
                      )
                      .toList(),
                ),
              ),

              SizedBox(height: 24.h),

              // ── Number of players ─────────────────
              Container(
                padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
                decoration: BoxDecoration(
                  color: Colors.white,
                  border: Border.all(
                    color: primaryGreen.withOpacity(0.35),
                    width: 1.2,
                  ),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Number of Players',
                          style: textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                            color: const Color(0xFF454555),
                            fontSize: 13.sp,
                          ),
                        ),
                        SizedBox(height: 2.h),
                        Text(
                          'Max 14 players allowed',
                          style: textTheme.bodySmall?.copyWith(
                            color: Colors.grey[500],
                            fontSize: 10.sp,
                          ),
                        ),
                      ],
                    ),
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: primaryGreen, width: 1.5),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          GestureDetector(
                            onTap: () {
                              if (_playerCount > 1)
                                setState(() => _playerCount--);
                            },
                            child: Container(
                              padding: EdgeInsets.symmetric(
                                horizontal: 8.w,
                                vertical: 4.h,
                              ),
                              decoration: BoxDecoration(color: primaryGreen),
                              child: const Icon(
                                Icons.remove,
                                color: Colors.white,
                                size: 14,
                              ),
                            ),
                          ),
                          Container(
                            padding: EdgeInsets.symmetric(horizontal: 14.w),
                            child: Text(
                              '$_playerCount',
                              style: TextStyle(
                                color: primaryGreen,
                                fontWeight: FontWeight.bold,
                                fontSize: 13.sp,
                              ),
                            ),
                          ),
                          GestureDetector(
                            onTap: () {
                              if (_playerCount < 14)
                                setState(() => _playerCount++);
                            },
                            child: Container(
                              padding: EdgeInsets.symmetric(
                                horizontal: 8.w,
                                vertical: 4.h,
                              ),
                              decoration: BoxDecoration(color: primaryGreen),
                              child: const Icon(
                                Icons.add,
                                color: Colors.white,
                                size: 14,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              SizedBox(height: 24.h),

              // ── Select Date ───────────────────────
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Select Date',
                    style: textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: const Color(0xFF454555),
                      fontSize: 13.sp,
                    ),
                  ),
                  Row(
                    children: [
                      Text(
                        _visibleMonthLabel(),
                        style: textTheme.bodySmall?.copyWith(
                          color: primaryGreen,
                          fontWeight: FontWeight.w600,
                          fontSize: 12.sp,
                        ),
                      ),
                      SizedBox(width: 4.w),
                      Icon(
                        Icons.keyboard_arrow_down,
                        color: primaryGreen,
                        size: 18,
                      ),
                    ],
                  ),
                ],
              ),
              SizedBox(height: 16.h),

              // Days List
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: _days.asMap().entries.map((e) {
                  int i = e.key;
                  var day = e.value;
                  bool isSelected = _selectedDayIndex == i;
                  return GestureDetector(
                    onTap: () => setState(() => _selectedDayIndex = i),
                    child: Container(
                      width: 44.w,
                      height: 50.h,
                      decoration: BoxDecoration(
                        color: isSelected ? primaryGreen : Colors.white,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: isSelected
                              ? primaryGreen
                              : primaryGreen.withOpacity(0.4),
                          width: 1.2,
                        ),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            day.day,
                            style: TextStyle(
                              fontSize: 10.sp,
                              fontWeight: isSelected
                                  ? FontWeight.w600
                                  : FontWeight.w500,
                              color: isSelected ? Colors.white : primaryGreen,
                            ),
                          ),
                          Text(
                            day.date,
                            style: TextStyle(
                              fontSize: 13.sp,
                              fontWeight: FontWeight.bold,
                              color: isSelected ? Colors.white : primaryGreen,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ),

              SizedBox(height: 16.h),
              Divider(color: Colors.grey[200], thickness: 1, height: 1),
              SizedBox(height: 20.h),

              // ── Slots Available ─────────────────
              Text(
                'Slots Available',
                style: textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: const Color(0xFF454555),
                  fontSize: 13.sp,
                ),
              ),
              SizedBox(height: 16.h),
              Wrap(
                spacing: 12.w,
                runSpacing: 12.h,
                children: _slots.asMap().entries.map((e) {
                  int i = e.key;
                  var slot = e.value;
                  bool isSelected = _selectedSlotIndex == i;
                  return GestureDetector(
                    onTap: () => setState(() => _selectedSlotIndex = i),
                    child: Container(
                      padding: EdgeInsets.symmetric(
                        horizontal: 16.w,
                        vertical: 8.h,
                      ),
                      decoration: BoxDecoration(
                        color: isSelected ? primaryGreen : Colors.white,
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(
                          color: isSelected
                              ? primaryGreen
                              : primaryGreen.withOpacity(0.4),
                        ),
                      ),
                      child: Text(
                        _formatSlot(slot),
                        style: TextStyle(
                          color: isSelected ? Colors.white : Colors.grey[700],
                          fontSize: 11.sp,
                          fontWeight: isSelected
                              ? FontWeight.w600
                              : FontWeight.w500,
                          letterSpacing: -0.2,
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),

              SizedBox(height: 32.h),

              // ── Continue Button ─────────────────
              SizedBox(
                width: double.infinity,
                height: 48.h,
                child: MyButtons(
                  text: _isBooking ? "Booking…" : "Continue",
                  height: 48.h, // Ignored since Parent forces height
                  width: double.infinity, // Ignored since Parent forces width
                  onTap: _isBooking ? () {} : _startBookingFlow,
                  textStyle: textTheme.bodyMedium!.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w600,
                  ),
                  backgroundColor: const Color(
                    0xFFE33A3A,
                  ), // Match the red from screenshot
                ),
              ),

              SizedBox(height: 40.h),
            ],
          ),
        ),
      ),
    );
  }
}