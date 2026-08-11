import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/views/widgets/main_shell.dart';

class BookingConfirmationPage extends StatefulWidget {
  final String bookingId;
  final String turfName;
  final String bookingDate;
  final String timeSlot;
  final double totalPrice;
  final String? turfImage;

  const BookingConfirmationPage({
    super.key,
    required this.bookingId,
    required this.turfName,
    required this.bookingDate,
    required this.timeSlot,
    required this.totalPrice,
    this.turfImage,
  });

  @override
  State<BookingConfirmationPage> createState() => _BookingConfirmationPageState();
}

class _BookingConfirmationPageState extends State<BookingConfirmationPage>
    with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
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
            'Confirmation',
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
                        // Animated Checkmark Icon Container
                        ScaleTransition(
                          scale: _scaleAnimation,
                          child: Container(
                            width: 100.w,
                            height: 100.w,
                            decoration: BoxDecoration(
                              color: const Color(0xFFE8F5E9),
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.green.withValues(alpha: 0.2),
                                  blurRadius: 20,
                                  spreadRadius: 4,
                                ),
                              ],
                            ),
                            child: Center(
                              child: Container(
                                width: 70.w,
                                height: 70.w,
                                decoration: const BoxDecoration(
                                  color: Color(0xFF2E7D32),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(
                                  Icons.check_rounded,
                                  color: Colors.white,
                                  size: 44,
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
                                'Booking Confirmed!',
                                style: textTheme.headlineSmall?.copyWith(
                                  fontWeight: FontWeight.w800,
                                  color: colors.textTitle,
                                ),
                              ),
                              SizedBox(height: 8.h),
                              Text(
                                'Your match slot has been successfully reserved.',
                                textAlign: TextAlign.center,
                                style: textTheme.bodyMedium?.copyWith(
                                  color: colors.textGrey,
                                ),
                              ),
                              SizedBox(height: 24.h),

                              // Booking Details Card
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
                                    Row(
                                      children: [
                                        if (widget.turfImage != null && widget.turfImage!.isNotEmpty) ...[
                                          ClipRRect(
                                            borderRadius: BorderRadius.circular(12),
                                            child: Image.network(
                                              widget.turfImage!,
                                              width: 54.w,
                                              height: 54.w,
                                              fit: BoxFit.cover,
                                              errorBuilder: (_, __, ___) => Container(
                                                width: 54.w,
                                                height: 54.w,
                                                color: Colors.green.shade100,
                                                child: const Icon(Icons.sports_cricket, color: Colors.green),
                                              ),
                                            ),
                                          ),
                                          SizedBox(width: 12.w),
                                        ],
                                        Expanded(
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
                                            ],
                                          ),
                                        ),
                                      ],
                                    ),
                                    SizedBox(height: 16.h),
                                    const Divider(),
                                    SizedBox(height: 12.h),

                                    _buildInfoRow('Date', widget.bookingDate, textTheme, colors),
                                    _buildInfoRow('Time Slot', widget.timeSlot, textTheme, colors),
                                    _buildInfoRow('Payment Method', 'Razorpay Online', textTheme, colors),
                                    _buildInfoRow(
                                      'Amount Paid',
                                      '₹${widget.totalPrice.toStringAsFixed(2)}',
                                      textTheme,
                                      colors,
                                      valueColor: const Color(0xFF2E7D32),
                                      isBold: true,
                                    ),
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

                // Bottom Buttons
                Column(
                  children: [
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
          Text(
            value,
            style: textTheme.bodyMedium?.copyWith(
              color: valueColor ?? colors.textTitle,
              fontWeight: isBold ? FontWeight.bold : FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}
