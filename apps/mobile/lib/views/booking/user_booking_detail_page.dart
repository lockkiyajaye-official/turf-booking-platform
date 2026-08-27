import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/data/models/booking_model.dart';
import 'package:mobile/data/models/turf_model.dart';
import 'package:mobile/data/services/booking_service.dart';
import 'package:mobile/data/services/turf_service.dart';
import 'package:mobile/viewmodels/auth/auth_viewmodel.dart';
import 'package:mobile/viewmodels/booking/booking_viewmodel.dart';
import 'package:mobile/views/booking/booking_details_page.dart';
import 'package:mobile/views/booking/booking_cancelled_page.dart';

class UserBookingDetailPage extends StatefulWidget {
  final BookingModel booking;

  const UserBookingDetailPage({super.key, required this.booking});

  @override
  State<UserBookingDetailPage> createState() => _UserBookingDetailPageState();
}

class _UserBookingDetailPageState extends State<UserBookingDetailPage> {
  late BookingModel _booking;
  bool _isLoading = false;
  bool _isRebooking = false;

  final BookingService _bookingService = BookingService();
  final TurfService _turfService = TurfService();
  final AuthViewmodel _authVm = Get.find<AuthViewmodel>();

  @override
  void initState() {
    super.initState();
    _booking = widget.booking;
    _fetchBookingDetails();
  }

  Future<void> _fetchBookingDetails() async {
    setState(() => _isLoading = true);
    final res = await _bookingService.findOne(_authVm.token.value, _booking.id);
    if (res['success'] == true && res['data'] != null) {
      try {
        final updated = BookingModel.fromJson(res['data']);
        setState(() {
          _booking = updated;
          _isLoading = false;
        });
        return;
      } catch (_) {}
    }
    setState(() => _isLoading = false);
  }

  Future<void> _handleCancelBooking() async {
    final vm = Get.isRegistered<BookingViewmodel>()
        ? Get.find<BookingViewmodel>()
        : Get.put(BookingViewmodel());

    String selectedReason = 'Schedule clash / Change of plans';
    final customReasonController = TextEditingController();

    Get.bottomSheet(
      StatefulBuilder(
        builder: (context, setModalState) {
          final colors = Theme.of(context).extension<AppColors>()!;
          final textTheme = Theme.of(context).textTheme;

          return Container(
            padding: EdgeInsets.all(20.w),
            decoration: BoxDecoration(
              color: colors.white,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
            ),
            child: SafeArea(
              child: FutureBuilder<Map<String, dynamic>?>(
                future: vm.getCancellationPreview(_booking.id),
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return SizedBox(
                      height: 220.h,
                      child: Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            CircularProgressIndicator(color: colors.primary),
                            SizedBox(height: 12.h),
                            Text(
                              'Calculating refund eligibility...',
                              style: textTheme.bodySmall?.copyWith(color: colors.textGrey),
                            ),
                          ],
                        ),
                      ),
                    );
                  }

                  final preview = snapshot.data;
                  final refundAmount = (preview?['refundAmount'] ?? 0.0).toDouble();
                  final refundPercentage = preview?['refundPercentage'] ?? 0;
                  final ruleApplied = preview?['ruleApplied'] ?? '';

                  return SingleChildScrollView(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Cancel Booking',
                              style: textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                                color: colors.textTitle,
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.close),
                              onPressed: () => Get.back(),
                            ),
                          ],
                        ),
                        SizedBox(height: 8.h),

                        // Refund policy breakdown card
                        Container(
                          width: double.infinity,
                          padding: EdgeInsets.all(12.w),
                          decoration: BoxDecoration(
                            color: colors.background,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.grey.shade300),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text('Refund Eligibility:', style: textTheme.bodySmall?.copyWith(color: colors.textGrey)),
                                  Text('$refundPercentage% Refund', style: textTheme.bodySmall?.copyWith(fontWeight: FontWeight.bold, color: Colors.red)),
                                ],
                              ),
                              SizedBox(height: 4.h),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text('Estimated Refund:', style: textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.bold)),
                                  Text('₹${refundAmount.toStringAsFixed(2)}', style: textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold, color: Colors.green.shade700)),
                                ],
                              ),
                              SizedBox(height: 6.h),
                              Text(
                                ruleApplied,
                                style: textTheme.bodySmall?.copyWith(color: colors.textGrey, fontStyle: FontStyle.italic),
                              ),
                              if (refundAmount > 0) ...[
                                SizedBox(height: 6.h),
                                Text(
                                  '✓ Refund will be processed automatically back to your original payment method via Razorpay.',
                                  style: textTheme.bodySmall?.copyWith(color: Colors.blue.shade800, fontSize: 10.sp),
                                ),
                              ],
                            ],
                          ),
                        ),
                        SizedBox(height: 16.h),

                        Text(
                          'Select Reason for Cancellation *',
                          style: textTheme.bodySmall?.copyWith(fontWeight: FontWeight.bold, color: colors.textTitle),
                        ),
                        SizedBox(height: 8.h),

                        DropdownButtonFormField<String>(
                          isExpanded: true,
                          value: selectedReason,
                          decoration: InputDecoration(
                            contentPadding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 10.h),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          items: const [
                            DropdownMenuItem(value: 'Schedule clash / Change of plans', child: Text('Schedule clash / Change of plans', overflow: TextOverflow.ellipsis)),
                            DropdownMenuItem(value: 'Booked wrong date or time slot', child: Text('Booked wrong date or time slot', overflow: TextOverflow.ellipsis)),
                            DropdownMenuItem(value: 'Health or weather condition', child: Text('Health or weather condition', overflow: TextOverflow.ellipsis)),
                            DropdownMenuItem(value: 'Other', child: Text('Other', overflow: TextOverflow.ellipsis)),
                          ],
                          onChanged: (val) {
                            if (val != null) setModalState(() => selectedReason = val);
                          },
                        ),

                        if (selectedReason == 'Other') ...[
                          SizedBox(height: 10.h),
                          TextField(
                            controller: customReasonController,
                            decoration: InputDecoration(
                              hintText: 'Describe cancellation reason...',
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                          ),
                        ],
                        SizedBox(height: 20.h),

                        Row(
                          children: [
                            Expanded(
                              child: OutlinedButton(
                                onPressed: () => Get.back(),
                                style: OutlinedButton.styleFrom(
                                  padding: EdgeInsets.symmetric(vertical: 12.h),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                ),
                                child: const Text('Keep Booking'),
                              ),
                            ),
                            SizedBox(width: 12.w),
                            Expanded(
                              child: ElevatedButton(
                                onPressed: () async {
                                  final reason = selectedReason == 'Other'
                                      ? (customReasonController.text.trim().isNotEmpty ? customReasonController.text.trim() : 'User cancelled booking')
                                      : selectedReason;

                                  Get.back();
                                  final success = await vm.cancelBooking(_booking.id, reason: reason);
                                  if (success) {
                                    final updatedBooking = vm.myBookings.firstWhere(
                                      (b) => b.id == _booking.id,
                                      orElse: () => _booking,
                                    );
                                    Get.off(() => BookingCancelledPage(
                                      bookingId: _booking.id,
                                      turfName: _booking.turfName,
                                      reason: reason,
                                      refundAmount: updatedBooking.refundAmount,
                                      refundStatus: updatedBooking.refundStatus,
                                    ));
                                  }
                                },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.red,
                                  padding: EdgeInsets.symmetric(vertical: 12.h),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                ),
                                child: const Text('Confirm Cancel', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
          );
        },
      ),
      isScrollControlled: true,
    );
  }

  Future<void> _handleRebook() async {
    setState(() => _isRebooking = true);
    final res = await _turfService.findOne(_booking.turfId);
    setState(() => _isRebooking = false);

    if (res['success'] == true && res['data'] != null) {
      try {
        final turf = TurfModel.fromJson(res['data']);
        Get.to(() => TurfDetailsPage(turf: turf));
        return;
      } catch (_) {}
    }

    Get.snackbar(
      'Error',
      'Could not load turf details for rebooking.',
      snackPosition: SnackPosition.BOTTOM,
    );
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      backgroundColor: colors.background,
      appBar: AppBar(
        backgroundColor: colors.white,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded, color: colors.textTitle, size: 18.sp),
          onPressed: () => Get.back(),
        ),
        title: Text(
          'Booking Details',
          style: textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w700,
            color: colors.textTitle,
          ),
        ),
        centerTitle: true,
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator(color: colors.primary))
          : RefreshIndicator(
              color: colors.primary,
              onRefresh: _fetchBookingDetails,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: EdgeInsets.all(16.w),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Turf Overview Card
                    _buildOverviewCard(colors, textTheme),
                    SizedBox(height: 16.h),

                    // Booking Information
                    _buildSectionCard(
                      colors: colors,
                      textTheme: textTheme,
                      title: 'Booking Details',
                      children: [
                        _buildDetailRow('Booking ID', '#${_booking.id}', textTheme, colors),
                        _buildDetailRow('Date', _booking.displayDate, textTheme, colors),
                        _buildDetailRow('Time Slot', _booking.displayTime, textTheme, colors),
                        _buildDetailRow('Category / Type', _booking.turfType, textTheme, colors),
                        _buildDetailRow(
                          'Status',
                          _booking.displayStatus,
                          textTheme,
                          colors,
                          valueColor: _getStatusColor(_booking.status),
                          isBold: true,
                        ),
                      ],
                    ),
                    SizedBox(height: 16.h),

                    // Venue / Location Information
                    _buildSectionCard(
                      colors: colors,
                      textTheme: textTheme,
                      title: 'Venue Location',
                      children: [
                        Row(
                          children: [
                            Icon(Icons.location_on_outlined, color: colors.primary, size: 20),
                            SizedBox(width: 8.w),
                            Expanded(
                              child: Text(
                                _booking.turfLocation.isNotEmpty
                                    ? _booking.turfLocation
                                    : 'Location details available at venue',
                                style: textTheme.bodyMedium?.copyWith(color: colors.textTitle),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    SizedBox(height: 16.h),

                    // Payment Summary
                    _buildSectionCard(
                      colors: colors,
                      textTheme: textTheme,
                      title: 'Payment Summary',
                      children: [
                        _buildDetailRow('Slot Price', '₹${_booking.totalPrice.toStringAsFixed(2)}', textTheme, colors),
                        _buildDetailRow('Taxes & Charges', '₹0.00', textTheme, colors),
                        const Divider(),
                        _buildDetailRow(
                          'Total Paid',
                          '₹${_booking.totalPrice.toStringAsFixed(2)}',
                          textTheme,
                          colors,
                          isBold: true,
                          valueColor: colors.primary,
                        ),
                      ],
                    ),
                    SizedBox(height: 24.h),

                    // Cancellation Info (if cancelled)
                    if (_booking.status.toLowerCase() == 'cancelled') ...[
                      _buildSectionCard(
                        colors: colors,
                        textTheme: textTheme,
                        title: 'Cancellation Summary',
                        children: [
                          if (_booking.cancellationReason != null && _booking.cancellationReason!.isNotEmpty)
                            _buildDetailRow('Reason', _booking.cancellationReason!, textTheme, colors),
                          _buildDetailRow(
                            'Refund Status',
                            _booking.refundAmount > 0
                                ? '₹${_booking.refundAmount.toStringAsFixed(2)} Refunded via Razorpay'
                                : 'Non-refundable',
                            textTheme,
                            colors,
                            valueColor: _booking.refundAmount > 0 ? Colors.green.shade700 : colors.textGrey,
                            isBold: true,
                          ),
                        ],
                      ),
                      SizedBox(height: 16.h),
                    ],

                    // Action Buttons
                    if (!_booking.isPast && _booking.status.toLowerCase() != 'cancelled') ...[
                      SizedBox(
                        width: double.infinity,
                        height: 48.h,
                        child: OutlinedButton(
                          onPressed: _handleCancelBooking,
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: Colors.red),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: Text(
                            'Cancel Booking',
                            style: textTheme.titleMedium?.copyWith(
                              color: Colors.red,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                      SizedBox(height: 12.h),
                    ],

                    SizedBox(
                      width: double.infinity,
                      height: 48.h,
                      child: ElevatedButton(
                        onPressed: _isRebooking ? null : _handleRebook,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: colors.primary,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: _isRebooking
                            ? const CircularProgressIndicator(color: Colors.white)
                            : Text(
                                'Rebook Turf',
                                style: textTheme.titleMedium?.copyWith(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                      ),
                    ),
                    SizedBox(height: 24.h),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildOverviewCard(AppColors colors, TextTheme textTheme) {
    return Container(
      decoration: BoxDecoration(
        color: colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        children: [
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
            child: SizedBox(
              height: 150.h,
              width: double.infinity,
              child: _booking.turfImage != null
                  ? Image.network(
                      _booking.turfImage!,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => _buildFallbackImage(),
                    )
                  : _buildFallbackImage(),
            ),
          ),
          Padding(
            padding: EdgeInsets.all(16.w),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _booking.turfName,
                        style: textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: colors.textTitle,
                        ),
                      ),
                      SizedBox(height: 4.h),
                      Text(
                        _booking.turfType,
                        style: textTheme.bodySmall?.copyWith(color: colors.textGrey),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 6.h),
                  decoration: BoxDecoration(
                    color: _getStatusColor(_booking.status).withOpacity(0.12),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    _booking.displayStatus,
                    style: textTheme.bodySmall?.copyWith(
                      color: _getStatusColor(_booking.status),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFallbackImage() {
    return Container(
      color: const Color(0xFF1a3a1a),
      child: const Center(
        child: Icon(Icons.sports_cricket, color: Colors.white54, size: 48),
      ),
    );
  }

  Widget _buildSectionCard({
    required AppColors colors,
    required TextTheme textTheme,
    required String title,
    required List<Widget> children,
  }) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(16.w),
      decoration: BoxDecoration(
        color: colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.bold,
              color: colors.textTitle,
            ),
          ),
          SizedBox(height: 12.h),
          ...children,
        ],
      ),
    );
  }

  Widget _buildDetailRow(
    String label,
    String value,
    TextTheme textTheme,
    AppColors colors, {
    Color? valueColor,
    bool isBold = false,
  }) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 6.h),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Flexible(
            child: Text(
              label,
              style: textTheme.bodyMedium?.copyWith(color: colors.textGrey),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          SizedBox(width: 12.w),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: textTheme.bodyMedium?.copyWith(
                color: valueColor ?? colors.textTitle,
                fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'CONFIRMED':
        return const Color(0xFF2E7D32);
      case 'PENDING':
        return Colors.orange;
      case 'CANCELLED':
        return const Color(0xFFE43434);
      case 'COMPLETED':
        return Colors.blue;
      default:
        return Colors.grey;
    }
  }
}
