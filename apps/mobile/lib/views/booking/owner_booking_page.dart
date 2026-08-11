import 'dart:async';
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
  final TextEditingController _searchCtrl = TextEditingController();
  final ScrollController _scrollCtrl = ScrollController();
  Timer? _debounce;

  static const _tabStatuses = ['', 'pending', 'confirmed', 'cancelled'];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);

    // Infinite scroll
    _scrollCtrl.addListener(_onScroll);

    // Tab change → refetch with correct status
    _tabController.addListener(() {
      if (!_tabController.indexIsChanging) return;
      final vm = Get.find<OwnerViewmodel>();
      final status = _tabStatuses[_tabController.index];
      vm.fetchAllBookings(status: status, search: _searchCtrl.text.trim());
    });

    WidgetsBinding.instance.addPostFrameCallback((_) {
      Get.find<OwnerViewmodel>().fetchAllBookings();
    });
  }

  void _onScroll() {
    if (_scrollCtrl.position.pixels >=
        _scrollCtrl.position.maxScrollExtent - 200) {
      Get.find<OwnerViewmodel>().loadNextPage();
    }
  }

  void _onSearchChanged(String val) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 400), () {
      final vm = Get.find<OwnerViewmodel>();
      final status = _tabStatuses[_tabController.index];
      vm.fetchAllBookings(status: status, search: val.trim());
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchCtrl.dispose();
    _scrollCtrl.dispose();
    _debounce?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    final textTheme = Theme.of(context).textTheme;
    final vm = Get.find<OwnerViewmodel>();

    return Scaffold(
      backgroundColor: colors.background,
      appBar: AppBar(
        backgroundColor: colors.white,
        elevation: 0,
        automaticallyImplyLeading: false,
        title: Text(
          'Bookings',
          style: textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
        ),
        centerTitle: true,
        bottom: PreferredSize(
          preferredSize: Size.fromHeight(100.h),
          child: Column(
            children: [
              // Search bar
              Padding(
                padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
                child: TextField(
                  controller: _searchCtrl,
                  onChanged: _onSearchChanged,
                  decoration: InputDecoration(
                    hintText: 'Search customer or turf...',
                    hintStyle: textTheme.bodySmall?.copyWith(
                      color: colors.textGrey,
                    ),
                    prefixIcon: Icon(
                      Icons.search_rounded,
                      size: 18,
                      color: colors.textGrey,
                    ),
                    filled: true,
                    fillColor: colors.background,
                    contentPadding: EdgeInsets.symmetric(
                      vertical: 0,
                      horizontal: 12.w,
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: colors.borderSecondary),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: colors.borderSecondary),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: colors.primary, width: 1.5),
                    ),
                  ),
                ),
              ),
              // Status tabs
              TabBar(
                controller: _tabController,
                indicatorColor: colors.primary,
                labelColor: colors.primary,
                unselectedLabelColor: colors.textGrey,
                labelStyle: textTheme.bodySmall?.copyWith(
                  fontWeight: FontWeight.w600,
                  fontSize: 12.sp,
                ),
                tabs: const [
                  Tab(text: 'All'),
                  Tab(text: 'Pending'),
                  Tab(text: 'Confirmed'),
                  Tab(text: 'Cancelled'),
                ],
              ),
            ],
          ),
        ),
      ),
      body: Obx(() {
        if (vm.isBookingsLoading.value && vm.allBookings.isEmpty) {
          return Center(
            child: CircularProgressIndicator(color: colors.primary),
          );
        }

        final bookings = vm.allBookings.toList();

        return RefreshIndicator(
          color: colors.primary,
          onRefresh: () {
            final status = _tabStatuses[_tabController.index];
            return vm.fetchAllBookings(
              status: status,
              search: _searchCtrl.text.trim(),
            );
          },
          child: TabBarView(
            controller: _tabController,
            // Each tab shows the same list — filtering is done server-side.
            // Only the "All" tab attaches the scroll controller; the other
            // tabs each reload via the tab-change listener.
            children: List.generate(4, (i) {
              return _BookingList(
                bookings: bookings,
                colors: colors,
                textTheme: textTheme,
                vm: vm,
                scrollController: i == _tabController.index
                    ? _scrollCtrl
                    : null,
              );
            }),
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
  final ScrollController? scrollController;

  const _BookingList({
    required this.bookings,
    required this.colors,
    required this.textTheme,
    required this.vm,
    this.scrollController,
  });

  @override
  Widget build(BuildContext context) {
    if (bookings.isEmpty && !vm.isBookingsLoading.value) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.calendar_today_outlined,
              size: 48,
              color: colors.textGrey.withValues(alpha: 0.4),
            ),
            SizedBox(height: 12.h),
            Text(
              'No bookings here',
              style: textTheme.bodyMedium?.copyWith(color: colors.textGrey),
            ),
          ],
        ),
      );
    }

    final hasMore = vm.bookingsHasMore.value;
    final isFetchingMore = vm.isFetchingMore.value;

    return ListView.separated(
      controller: scrollController,
      padding: EdgeInsets.all(16.w),
      // +1 for the loading footer when more data exists
      itemCount: bookings.length + (hasMore ? 1 : 0),
      separatorBuilder: (_, _a) => SizedBox(height: 12.h),
      itemBuilder: (context, i) {
        if (i == bookings.length) {
          // Loading footer
          return Padding(
            padding: EdgeInsets.symmetric(vertical: 16.h),
            child: Center(
              child: isFetchingMore
                  ? CircularProgressIndicator(
                      color: colors.primary,
                      strokeWidth: 2,
                    )
                  : Text(
                      'Scroll for more',
                      style: TextStyle(color: colors.textGrey, fontSize: 12.sp),
                    ),
            ),
          );
        }
        return _BookingCard(
          booking: bookings[i],
          colors: colors,
          textTheme: textTheme,
          vm: vm,
        );
      },
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
    final status = (booking['status'] as String? ?? 'pending').toLowerCase();

    final turfObj = booking['turf'];
    final turfName =
        (turfObj is Map ? turfObj['name'] as String? : null) ??
        booking['turfName'] as String? ??
        'Unknown Turf';

    final userObj = booking['user'];
    final userName =
        (userObj is Map ? userObj['name'] as String? : null) ??
        booking['userName'] as String? ??
        'Player';
    final userPhone =
        (userObj is Map
            ? (userObj['phone'] ?? userObj['contactPhone']) as String?
            : null) ??
        booking['userPhone'] as String? ??
        '';

    final rawDate = booking['bookingDate'] ?? booking['date'];
    String date = '';
    if (rawDate != null) {
      date = rawDate.toString().split('T').first;
    }

    final startTime = booking['startTime'] as String? ?? '';
    final endTime = booking['endTime'] as String? ?? '';
    final amount =
        booking['totalPrice'] ??
        booking['totalAmount'] ??
        booking['price'] ??
        0;

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
                padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 4.h),
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
                value: (startTime.isNotEmpty && endTime.isNotEmpty)
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
                    style: textTheme.bodySmall?.copyWith(
                      color: colors.textGrey,
                      fontSize: 11.sp,
                    ),
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
              if (status != 'cancelled') ...[
                OutlinedButton(
                  onPressed: () => _confirmCancel(context, id),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Color(0xFFE43434)),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    padding: EdgeInsets.symmetric(
                      horizontal: 14.w,
                      vertical: 8.h,
                    ),
                  ),
                  child: Text(
                    'Cancel & Refund',
                    style: textTheme.bodySmall?.copyWith(
                      color: const Color(0xFFE43434),
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
    final reasonController = TextEditingController(
      text: 'Slot unavailable / Turf maintenance',
    );

    Get.dialog(
      AlertDialog(
        title: const Text('Cancel & Refund Booking'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Cancelling this booking will issue a 100% full refund back to the customer via Razorpay.',
              style: TextStyle(fontSize: 13),
            ),
            const SizedBox(height: 12),
            const Text(
              'Reason for Cancellation:',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
            ),
            const SizedBox(height: 6),
            TextField(
              controller: reasonController,
              decoration: const InputDecoration(
                hintText: 'Enter reason...',
                border: OutlineInputBorder(),
                contentPadding: EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 8,
                ),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: const Text('Keep Booking'),
          ),
          ElevatedButton(
            onPressed: () {
              final reason = reasonController.text.trim().isNotEmpty
                  ? reasonController.text.trim()
                  : 'Cancelled by Turf Owner';
              Get.back();
              vm.cancelBooking(id, reason: reason);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFE43434),
            ),
            child: const Text(
              'Confirm Cancel & Refund',
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
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
