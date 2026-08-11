import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/data/models/booking_model.dart';
import 'package:mobile/data/services/booking_service.dart';
import 'package:mobile/viewmodels/auth/auth_viewmodel.dart';

class CancellationPage extends StatefulWidget {
  const CancellationPage({super.key});

  @override
  State<CancellationPage> createState() => _CancellationPageState();
}

class _CancellationPageState extends State<CancellationPage> {
  final BookingService _bookingService = BookingService();
  final AuthViewmodel _authVm = Get.find<AuthViewmodel>();

  bool _isLoading = true;
  List<BookingModel> _bookings = [];
  int _selectedTab = 0; // 0 = Upcoming, 1 = Cancelled, 2 = Completed

  @override
  void initState() {
    super.initState();
    _fetchBookings();
  }

  Future<void> _fetchBookings() async {
    setState(() => _isLoading = true);
    final result = await _bookingService.findAll(_authVm.token.value);
    if (mounted) {
      setState(() {
        _isLoading = false;
        if (result['success'] == true && result['data'] is List) {
          _bookings = (result['data'] as List)
              .map((json) => BookingModel.fromJson(json))
              .toList();
        }
      });
    }
  }

  Future<void> _cancelBooking(BookingModel booking) async {
    final confirm = await Get.dialog<bool>(
      AlertDialog(
        title: const Text('Cancel Booking'),
        content: Text(
          'Are you sure you want to cancel booking for ${booking.turfName}?',
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(result: false),
            child: const Text('No, Keep'),
          ),
          TextButton(
            onPressed: () => Get.back(result: true),
            child: const Text(
              'Yes, Cancel',
              style: TextStyle(color: Colors.red),
            ),
          ),
        ],
      ),
    );

    if (confirm == true) {
      final res = await _bookingService.updateStatus(
        token: _authVm.token.value,
        id: booking.id,
        status: 'CANCELLED',
      );

      if (res['success'] == true) {
        Get.snackbar(
          'Cancelled',
          'Booking cancelled successfully',
          snackPosition: SnackPosition.BOTTOM,
        );
        _fetchBookings();
      } else {
        Get.snackbar(
          'Error',
          res['message'] ?? 'Failed to cancel booking',
          snackPosition: SnackPosition.BOTTOM,
        );
      }
    }
  }

  List<BookingModel> get _filteredBookings {
    if (_selectedTab == 0) {
      return _bookings
          .where((b) => b.status == 'CONFIRMED' || b.status == 'PENDING')
          .toList();
    } else if (_selectedTab == 1) {
      return _bookings.where((b) => b.status == 'CANCELLED').toList();
    } else {
      return _bookings.where((b) => b.status == 'COMPLETED').toList();
    }
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
        centerTitle: true,
        leading: IconButton(
          icon: Icon(
            Icons.arrow_back_ios_new,
            color: colors.textTitle,
            size: 20,
          ),
          onPressed: () => Get.back(),
        ),
        title: Text(
          'Manage Bookings',
          style: textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w700,
            color: colors.textTitle,
          ),
        ),
      ),
      body: Column(
        children: [
          // Filter Tabs
          Container(
            color: colors.white,
            padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
            child: Row(
              children: [
                _buildTab('Upcoming', 0, colors, textTheme),
                SizedBox(width: 8.w),
                _buildTab('Cancelled', 1, colors, textTheme),
                SizedBox(width: 8.w),
                _buildTab('Completed', 2, colors, textTheme),
              ],
            ),
          ),
          Expanded(
            child: _isLoading
                ? Center(
                    child: CircularProgressIndicator(color: colors.primary),
                  )
                : _filteredBookings.isEmpty
                ? Center(
                    child: Text(
                      'No bookings found',
                      style: textTheme.bodyMedium?.copyWith(
                        color: colors.textGrey,
                      ),
                    ),
                  )
                : RefreshIndicator(
                    onRefresh: _fetchBookings,
                    color: colors.primary,
                    child: ListView.builder(
                      padding: EdgeInsets.all(16.w),
                      itemCount: _filteredBookings.length,
                      itemBuilder: (context, index) {
                        final b = _filteredBookings[index];
                        final isUpcoming =
                            b.status == 'CONFIRMED' || b.status == 'PENDING';
                        return Container(
                          margin: EdgeInsets.only(bottom: 12.h),
                          padding: EdgeInsets.all(16.w),
                          decoration: BoxDecoration(
                            color: colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: const Color(0xFFE8E8E8)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Text(
                                      b.turfName,
                                      style: textTheme.titleSmall?.copyWith(
                                        fontWeight: FontWeight.w700,
                                        color: colors.textTitle,
                                      ),
                                    ),
                                  ),
                                  Container(
                                    padding: EdgeInsets.symmetric(
                                      horizontal: 8.w,
                                      vertical: 4.h,
                                    ),
                                    decoration: BoxDecoration(
                                      color: isUpcoming
                                          ? Colors.green.shade50
                                          : Colors.red.shade50,
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      b.displayStatus.toUpperCase(),
                                      style: TextStyle(
                                        fontSize: 10.sp,
                                        fontWeight: FontWeight.bold,
                                        color: isUpcoming
                                            ? Colors.green.shade700
                                            : Colors.red.shade700,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              SizedBox(height: 8.h),
                              Text(
                                'Date: ${b.displayDate} • ${b.displayTime}',
                                style: textTheme.bodySmall?.copyWith(
                                  color: colors.textGrey,
                                ),
                              ),
                              SizedBox(height: 4.h),
                              Text(
                                'Total: ₹${b.totalPrice}',
                                style: textTheme.bodyMedium?.copyWith(
                                  fontWeight: FontWeight.w700,
                                  color: colors.primary,
                                ),
                              ),
                              if (isUpcoming) ...[
                                SizedBox(height: 12.h),
                                Row(
                                  children: [
                                    Expanded(
                                      child: OutlinedButton(
                                        onPressed: () => _cancelBooking(b),
                                        style: OutlinedButton.styleFrom(
                                          side: BorderSide(color: colors.error),
                                          shape: RoundedRectangleBorder(
                                            borderRadius: BorderRadius.circular(
                                              8,
                                            ),
                                          ),
                                        ),
                                        child: Text(
                                          'Cancel Booking',
                                          style: TextStyle(
                                            color: colors.error,
                                            fontSize: 12.sp,
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ],
                          ),
                        );
                      },
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildTab(
    String label,
    int index,
    AppColors colors,
    TextTheme textTheme,
  ) {
    final selected = _selectedTab == index;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _selectedTab = index),
        child: Container(
          padding: EdgeInsets.symmetric(vertical: 8.h),
          decoration: BoxDecoration(
            color: selected ? colors.primary : colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: selected ? colors.primary : const Color(0xFFE8E8E8),
            ),
          ),
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: textTheme.bodySmall?.copyWith(
              color: selected ? Colors.white : colors.textGrey,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ),
    );
  }
}
