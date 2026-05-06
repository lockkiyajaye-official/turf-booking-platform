import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/viewmodels/turf/owner_viewmodel.dart';

class OwnerBookingsPage extends StatefulWidget {
  const OwnerBookingsPage({super.key});

  @override
  State<OwnerBookingsPage> createState() => _OwnerBookingsPageState();
}

class _OwnerBookingsPageState extends State<OwnerBookingsPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    final textTheme = Theme.of(context).textTheme;
    final vm = Get.find<OwnerViewmodel>()..fetchAllBookings();

    return Scaffold(
      backgroundColor: colors.background,
      appBar: AppBar(
        backgroundColor: colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
          color: colors.textTitle,
          onPressed: () => Get.back(),
        ),
        title: Text(
          'Bookings',
          style: textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
        ),
        centerTitle: true,
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: colors.primary,
          labelColor: colors.primary,
          unselectedLabelColor: colors.textGrey,
          labelStyle: textTheme.bodySmall
              ?.copyWith(fontWeight: FontWeight.w600, fontSize: 12.sp),
          tabs: const [
            Tab(text: 'All'),
            Tab(text: 'Pending'),
            Tab(text: 'Confirmed'),
            Tab(text: 'Cancelled'),
          ],
        ),
      ),
      body: Obx(() {
        if (vm.isBookingsLoading.value && vm.allBookings.isEmpty) {
          return Center(
              child: CircularProgressIndicator(color: colors.primary));
        }

        final all = vm.allBookings.toList();
        final pending =
            all.where((b) => b['status'] == 'pending').toList();
        final confirmed =
            all.where((b) => b['status'] == 'confirmed').toList();
        final cancelled =
            all.where((b) => b['status'] == 'cancelled').toList();

        return RefreshIndicator(
          color: colors.primary,
          onRefresh: () => vm.fetchAllBookings(),
          child: TabBarView(
            controller: _tabController,
            children: [
              _BookingList(
                  bookings: all,
                  colors: colors,
                  textTheme: textTheme,
                  vm: vm),
              _BookingList(
                  bookings: pending,
                  colors: colors,
                  textTheme: textTheme,
                  vm: vm),
              _BookingList(
                  bookings: confirmed,
                  colors: colors,
                  textTheme: textTheme,
                  vm: vm),
              _BookingList(
                  bookings: cancelled,
                  colors: colors,
                  textTheme: textTheme,
                  vm: vm),
            ],
          ),
        );
      }),
    );
  }
}

// ── Booking List ─────────────────────────────────────────────
class _BookingList extends StatelessWidget {
  final List<Map<String, dynamic>> bookings;
  final AppColors colors;
  final TextTheme textTheme;
  final OwnerViewmodel vm;

  const _BookingList({
    required this.bookings,
    required this.colors,
    required this.textTheme,
    required this.vm,
  });

  @override
  Widget build(BuildContext context) {
    if (bookings.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.calendar_today_outlined,
                size: 48, color: colors.textGrey.withOpacity(0.4)),
            SizedBox(height: 12.h),
            Text(
              'No bookings here',
              style:
                  textTheme.bodyMedium?.copyWith(color: colors.textGrey),
            ),
          ],
        ),
      );
    }
    return ListView.separated(
      padding: EdgeInsets.all(16.w),
      itemCount: bookings.length,
      separatorBuilder: (_, __) => SizedBox(height: 12.h),
      itemBuilder: (context, i) => _BookingCard(
        booking: bookings[i],
        colors: colors,
        textTheme: textTheme,
        vm: vm,
      ),
    );
  }
}

// ── Booking Card ─────────────────────────────────────────────
class _BookingCard extends StatelessWidget {
  final Map<String, dynamic> booking;
  final AppColors colors;
  final TextTheme textTheme;
  final OwnerViewmodel vm;

  const _BookingCard({
    required this.booking,
    required this.colors,
    required this.textTheme,
    required this.vm,
  });

  Color _statusColor(String status) {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return const Color(0xFF059669);
      case 'pending':
        return const Color(0xFFF59E0B);
      case 'cancelled':
        return const Color(0xFFE43434);
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    final id = booking['_id'] as String? ?? booking['id'] as String? ?? '';
    final status = booking['status'] as String? ?? 'pending';
    final turfName = booking['turfName'] as String? ?? 'Unknown Turf';
    final userName = booking['userName'] as String? ?? 'User';
    final userPhone = booking['userPhone'] as String? ?? '';
    final date = booking['date'] as String? ?? '';
    final startTime = booking['startTime'] as String? ?? '';
    final endTime = booking['endTime'] as String? ?? '';
    final amount = booking['totalAmount'] ?? 0;
    final isPending = status == 'pending';

    return Container(
      padding: EdgeInsets.all(16.w),
      decoration: BoxDecoration(
        color: colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE8E8E8)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top row
          Row(
            children: [
              Expanded(
                child: Text(
                  turfName,
                  style: textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                    color: colors.textTitle,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Container(
                padding:
                    EdgeInsets.symmetric(horizontal: 10.w, vertical: 4.h),
                decoration: BoxDecoration(
                  color: _statusColor(status).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  status[0].toUpperCase() + status.substring(1),
                  style: TextStyle(
                    fontSize: 11.sp,
                    fontWeight: FontWeight.w700,
                    color: _statusColor(status),
                  ),
                ),
              ),
            ],
          ),

          SizedBox(height: 10.h),
          const Divider(height: 1, color: Color(0xFFF0F0F0)),
          SizedBox(height: 10.h),

          // Details grid
          Row(
            children: [
              _InfoItem(
                icon: Icons.person_outline,
                label: 'Customer',
                value: userName,
                colors: colors,
                textTheme: textTheme,
              ),
              SizedBox(width: 16.w),
              _InfoItem(
                icon: Icons.phone_outlined,
                label: 'Phone',
                value: userPhone.isNotEmpty ? userPhone : '—',
                colors: colors,
                textTheme: textTheme,
              ),
            ],
          ),

          SizedBox(height: 8.h),

          Row(
            children: [
              _InfoItem(
                icon: Icons.calendar_today_rounded,
                label: 'Date',
                value: date,
                colors: colors,
                textTheme: textTheme,
              ),
              SizedBox(width: 16.w),
              _InfoItem(
                icon: Icons.access_time_rounded,
                label: 'Time',
                value:
                    (startTime.isNotEmpty && endTime.isNotEmpty)
                        ? '$startTime – $endTime'
                        : '—',
                colors: colors,
                textTheme: textTheme,
              ),
            ],
          ),

          SizedBox(height: 10.h),

          // Amount + Actions
          Row(
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Total Amount',
                    style: textTheme.bodySmall
                        ?.copyWith(color: colors.textGrey, fontSize: 11.sp),
                  ),
                  Text(
                    '₹$amount',
                    style: textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w800,
                      color: colors.textTitle,
                    ),
                  ),
                ],
              ),
              const Spacer(),
              if (isPending) ...[
                OutlinedButton(
                  onPressed: () => _confirmCancel(context, id),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Color(0xFFE43434)),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8)),
                    padding: EdgeInsets.symmetric(
                        horizontal: 14.w, vertical: 8.h),
                  ),
                  child: Text(
                    'Decline',
                    style: textTheme.bodySmall?.copyWith(
                      color: const Color(0xFFE43434),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                SizedBox(width: 8.w),
                ElevatedButton(
                  onPressed: () => vm.confirmBooking(id),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF059669),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8)),
                    elevation: 0,
                    padding: EdgeInsets.symmetric(
                        horizontal: 14.w, vertical: 8.h),
                  ),
                  child: Text(
                    'Confirm',
                    style: textTheme.bodySmall?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }

  void _confirmCancel(BuildContext context, String id) {
    Get.dialog(
      AlertDialog(
        title: const Text('Cancel Booking'),
        content:
            const Text('Are you sure you want to cancel this booking?'),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: const Text('No'),
          ),
          TextButton(
            onPressed: () {
              Get.back();
              vm.cancelBooking(id);
            },
            child: const Text('Yes, Cancel',
                style: TextStyle(color: Color(0xFFE43434))),
          ),
        ],
      ),
    );
  }
}

// ── Info Item ────────────────────────────────────────────────
class _InfoItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final AppColors colors;
  final TextTheme textTheme;

  const _InfoItem({
    required this.icon,
    required this.label,
    required this.value,
    required this.colors,
    required this.textTheme,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 14, color: colors.textGrey),
          SizedBox(width: 5.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: textTheme.bodySmall?.copyWith(
                    color: colors.textGrey,
                    fontSize: 10.sp,
                  ),
                ),
                Text(
                  value,
                  style: textTheme.bodySmall?.copyWith(
                    color: colors.textTitle,
                    fontWeight: FontWeight.w600,
                    fontSize: 12.sp,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}