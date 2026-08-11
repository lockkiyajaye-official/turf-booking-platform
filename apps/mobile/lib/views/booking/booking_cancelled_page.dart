import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/views/widgets/main_shell.dart';

class BookingCancelledPage extends StatefulWidget {
  final String bookingId;
  final String turfName;
  final String reason;
  final double refundAmount;
  final String? refundStatus;

  const BookingCancelledPage({
    super.key,
    required this.bookingId,
    required this.turfName,
    required this.reason,
    required this.refundAmount,
    this.refundStatus,
  });

  @override
  State<BookingCancelledPage> createState() => _BookingCancelledPageState();
}

class _BookingCancelledPageState extends State<BookingCancelledPage>
    with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );

    _scaleAnimation = CurvedAnimation(
      parent: _animController,
      curve: Curves.elasticOut,
    );

    _fadeAnimation = CurvedAnimation(
      parent: _animController,
      curve: Curves.easeIn,
    );

    _animController.forward();
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  void _goBackToBookings() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (Navigator.canPop(context)) {
        Get.back();
      } else {
        Get.offAll(() => const MainShell(initialIndex: 2));
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    final textTheme = Theme.of(context).textTheme;

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (!didPop) {
          _goBackToBookings();
        }
      },
      child: Scaffold(
        backgroundColor: colors.background,
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.black87),
            onPressed: _goBackToBookings,
          ),
          title: Text(
            'Cancellation',
            style: textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: colors.textTitle,
            ),
          ),
          centerTitle: true,
        ),
        body: SafeArea(
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 16.h),
            child: Column(
              children: [
                Expanded(
                  child: SingleChildScrollView(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        SizedBox(height: 20.h),
                        // Animated Cancel Icon Container
                        ScaleTransition(
                          scale: _scaleAnimation,
                          child: Container(
                            width: 96.w,
                            height: 96.w,
                            decoration: BoxDecoration(
                              color: Colors.red.shade50,
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.red.withValues(alpha: 0.15),
                                  blurRadius: 20,
                                  spreadRadius: 4,
                                ),
                              ],
                            ),
                            child: Center(
                              child: Container(
                                width: 66.w,
                                height: 66.w,
                                decoration: const BoxDecoration(
                                  color: Color(0xFFE43434),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(
                                  Icons.close_rounded,
                                  color: Colors.white,
                                  size: 40,
                                ),
                              ),
                            ),
                          ),
                        ),
                        SizedBox(height: 24.h),

                        FadeTransition(
                          opacity: _fadeAnimation,
                          child: Column(
                            children: [
                              Text(
                                'Booking Cancelled',
                                style: textTheme.headlineSmall?.copyWith(
                                  fontWeight: FontWeight.w800,
                                  color: colors.textTitle,
                                ),
                              ),
                              SizedBox(height: 8.h),
                              Text(
                                'Your booking has been cancelled as requested.',
                                textAlign: TextAlign.center,
                                style: textTheme.bodyMedium?.copyWith(
                                  color: colors.textGrey,
                                ),
                              ),
                              SizedBox(height: 24.h),

                              // Cancellation Summary Card
                              Container(
                                width: double.infinity,
                                padding: EdgeInsets.all(16.w),
                                decoration: BoxDecoration(
                                  color: colors.white,
                                  borderRadius: BorderRadius.circular(20),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withValues(alpha: 0.04),
                                      blurRadius: 12,
                                      offset: const Offset(0, 4),
                                    ),
                                  ],
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      widget.turfName,
                                      style: textTheme.titleMedium?.copyWith(
                                        fontWeight: FontWeight.bold,
                                        color: colors.textTitle,
                                      ),
                                    ),
                                    SizedBox(height: 2.h),
                                    Text(
                                      'ID: #${widget.bookingId.length > 8 ? widget.bookingId.substring(0, 8) : widget.bookingId}',
                                      style: textTheme.bodySmall?.copyWith(color: colors.textGrey),
                                    ),
                                    SizedBox(height: 14.h),
                                    const Divider(),
                                    SizedBox(height: 10.h),

                                    _buildInfoRow('Reason', widget.reason, textTheme, colors),
                                    _buildInfoRow(
                                      'Refund Status',
                                      widget.refundAmount > 0
                                          ? '₹${widget.refundAmount.toStringAsFixed(2)} Refund Processed'
                                          : 'Non-refundable',
                                      textTheme,
                                      colors,
                                      valueColor: widget.refundAmount > 0
                                          ? Colors.green.shade700
                                          : colors.textGrey,
                                      isBold: true,
                                    ),
                                    if (widget.refundAmount > 0) ...[
                                      SizedBox(height: 10.h),
                                      Container(
                                        padding: EdgeInsets.all(10.w),
                                        decoration: BoxDecoration(
                                          color: Colors.blue.shade50,
                                          borderRadius: BorderRadius.circular(10),
                                        ),
                                        child: Row(
                                          children: [
                                            Icon(Icons.info_outline, color: Colors.blue.shade800, size: 18),
                                            SizedBox(width: 8.w),
                                            Expanded(
                                              child: Text(
                                                'Refund will be credited back to your original payment method via Razorpay.',
                                                style: textTheme.bodySmall?.copyWith(
                                                  color: Colors.blue.shade900,
                                                  fontSize: 11.sp,
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                // Go to My Bookings Button
                SizedBox(
                  width: double.infinity,
                  height: 50.h,
                  child: ElevatedButton(
                    onPressed: _goBackToBookings,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF2E7D32),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                      elevation: 2,
                    ),
                    child: Text(
                      'Go to My Bookings',
                      style: textTheme.titleSmall?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildInfoRow(
    String label,
    String value,
    TextTheme textTheme,
    AppColors colors, {
    Color? valueColor,
    bool isBold = false,
  }) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 5.h),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: textTheme.bodyMedium?.copyWith(color: colors.textGrey)),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: textTheme.bodyMedium?.copyWith(
                color: valueColor ?? colors.textTitle,
                fontWeight: isBold ? FontWeight.bold : FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
