import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/core/utils/helpers.dart';
import 'package:mobile/viewmodels/turf/owner_viewmodel.dart';
import 'package:mobile/views/booking/widgets/direct_booking_sheet.dart';

class OwnerBookingsPage extends StatefulWidget {
  const OwnerBookingsPage({super.key});

  @override
  State<OwnerBookingsPage> createState() => _OwnerBookingsPageState();
}

class _OwnerBookingsPageState extends State<OwnerBookingsPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final TextEditingController _searchCtrl = TextEditingController();
  final FocusNode _searchFocusNode = FocusNode();
  final ScrollController _scrollCtrl = ScrollController();
  Timer? _debounce;
  bool _isSearching = false;
  String _lastSubmittedQuery = '';

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
      _debounce?.cancel();
      final vm = Get.isRegistered<OwnerViewmodel>()
          ? Get.find<OwnerViewmodel>()
          : Get.put(OwnerViewmodel(), permanent: true);
      final status = _tabStatuses[_tabController.index];
      vm.fetchAllBookings(status: status, search: _searchCtrl.text.trim());
    });

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final vm = Get.isRegistered<OwnerViewmodel>()
          ? Get.find<OwnerViewmodel>()
          : Get.put(OwnerViewmodel(), permanent: true);
      vm.fetchAllBookings();
    });
  }

  void _onScroll() {
    if (_scrollCtrl.position.pixels >=
        _scrollCtrl.position.maxScrollExtent - 200) {
      final vm = Get.isRegistered<OwnerViewmodel>()
          ? Get.find<OwnerViewmodel>()
          : Get.put(OwnerViewmodel(), permanent: true);
      vm.loadNextPage();
    }
  }

  void _onSearchChanged(String val) {
    setState(() {}); // Updates the clear button
    final query = val.trim();
    if (query == _lastSubmittedQuery) return;

    _debounce?.cancel();
    // 650ms debounce so user can comfortably type without rapid reloads
    _debounce = Timer(const Duration(milliseconds: 650), () {
      _lastSubmittedQuery = query;
      final vm = Get.isRegistered<OwnerViewmodel>()
          ? Get.find<OwnerViewmodel>()
          : Get.put(OwnerViewmodel(), permanent: true);
      final status = _tabStatuses[_tabController.index];
      vm.fetchAllBookings(status: status, search: query);
    });
  }

  void _closeSearch(OwnerViewmodel vm) {
    _debounce?.cancel();
    final hadActiveSearch =
        _lastSubmittedQuery.isNotEmpty || _searchCtrl.text.trim().isNotEmpty;
    setState(() {
      _isSearching = false;
      _searchCtrl.clear();
      _lastSubmittedQuery = '';
    });
    // Only refetch if there was an active search filter applied
    if (hadActiveSearch) {
      final status = _tabStatuses[_tabController.index];
      vm.fetchAllBookings(status: status, search: '');
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchCtrl.dispose();
    _searchFocusNode.dispose();
    _scrollCtrl.dispose();
    _debounce?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    final textTheme = Theme.of(context).textTheme;
    final vm = Get.isRegistered<OwnerViewmodel>()
        ? Get.find<OwnerViewmodel>()
        : Get.put(OwnerViewmodel(), permanent: true);

    return PopScope(
      canPop: !_isSearching,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        if (_isSearching) {
          _closeSearch(vm);
        }
      },
      child: Scaffold(
        backgroundColor: colors.background,
        appBar: AppBar(
          backgroundColor: colors.white,
          elevation: 0,
          automaticallyImplyLeading: false,
          title: _isSearching
              ? TextField(
                  controller: _searchCtrl,
                  focusNode: _searchFocusNode,
                  autofocus: true,
                  style: textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: colors.textTitle,
                  ),
                  textInputAction: TextInputAction.search,
                  onChanged: _onSearchChanged,
                  onSubmitted: (val) {
                    _debounce?.cancel();
                    final query = val.trim();
                    _lastSubmittedQuery = query;
                    final status = _tabStatuses[_tabController.index];
                    vm.fetchAllBookings(status: status, search: query);
                  },
                  decoration: InputDecoration(
                    hintText: 'Search customer or turf...',
                    hintStyle: textTheme.bodySmall?.copyWith(
                      color: colors.textGrey,
                    ),
                    border: InputBorder.none,
                    enabledBorder: InputBorder.none,
                    focusedBorder: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(
                      vertical: 10.h,
                      horizontal: 4.w,
                    ),
                    prefixIcon: Icon(
                      Icons.search_rounded,
                      size: 20,
                      color: colors.primary,
                    ),
                    suffixIcon: _searchCtrl.text.isNotEmpty
                        ? IconButton(
                            icon: Icon(
                              Icons.clear_rounded,
                              size: 18,
                              color: colors.textGrey,
                            ),
                            onPressed: () {
                              _debounce?.cancel();
                              final hadActiveSearch =
                                  _lastSubmittedQuery.isNotEmpty;
                              _searchCtrl.clear();
                              _lastSubmittedQuery = '';
                              setState(() {});
                              if (hadActiveSearch) {
                                final status =
                                    _tabStatuses[_tabController.index];
                                vm.fetchAllBookings(status: status, search: '');
                              }
                            },
                          )
                        : null,
                  ),
                )
              : Text(
                  'Bookings',
                  style: textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
          centerTitle: !_isSearching,
          actions: [
            IconButton(
              icon: Icon(
                _isSearching ? Icons.close_rounded : Icons.search_rounded,
                color: colors.textTitle,
              ),
              tooltip: _isSearching ? 'Close search' : 'Search bookings',
              onPressed: () {
                if (_isSearching) {
                  _closeSearch(vm);
                } else {
                  setState(() {
                    _isSearching = true;
                  });
                  _searchFocusNode.requestFocus();
                }
              },
            ),
            SizedBox(width: 4.w),
          ],
          bottom: TabBar(
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
        ),
        body: Obx(() {
          if (vm.isBookingsLoading.value && vm.allBookings.isEmpty) {
            return Center(
              child: CircularProgressIndicator(color: colors.primary),
            );
          }

          final bookings = vm.allBookings.toList();

          return Stack(
            children: [
              RefreshIndicator(
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
              ),
              if (vm.isBookingsLoading.value && vm.allBookings.isNotEmpty)
                Positioned(
                  top: 0,
                  left: 0,
                  right: 0,
                  child: LinearProgressIndicator(
                    minHeight: 2.5,
                    backgroundColor: Colors.transparent,
                    color: colors.primary,
                  ),
                ),
            ],
          );
        }),
        floatingActionButton: _isSearching
            ? null
            : FloatingActionButton.extended(
                onPressed: () => showDirectBookingModal(context, vm: vm),
                backgroundColor: colors.primary,
                icon: const Icon(Icons.add_task_rounded, color: Colors.white),
                label: Text(
                  'Direct Booking',
                  style: textTheme.bodyMedium?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
      ),
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
    final isTablet = context.isTablet;
    final columns = context.bookingGridColumns;
    final horizontalPad = isTablet ? 20.w : 16.w;

    if (columns > 1) {
      return GridView.builder(
        controller: scrollController,
        padding: EdgeInsets.symmetric(
          horizontal: horizontalPad,
          vertical: 16.h,
        ),
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: columns,
          crossAxisSpacing: 16,
          mainAxisSpacing: 14,
          mainAxisExtent: 215,
        ),
        itemCount: bookings.length + (hasMore ? 1 : 0),
        itemBuilder: (context, i) {
          if (i == bookings.length) {
            return Center(
              child: isFetchingMore
                  ? CircularProgressIndicator(
                      color: colors.primary,
                      strokeWidth: 2,
                    )
                  : Text(
                      'Scroll for more',
                      style: TextStyle(color: colors.textGrey, fontSize: 12.sp),
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

    return ListView.separated(
      controller: scrollController,
      padding: EdgeInsets.all(16.w),
      // +1 for the loading footer when more data exists
      itemCount: bookings.length + (hasMore ? 1 : 0),
      separatorBuilder: (_, a) => SizedBox(height: 12.h),
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
    final isDirect =
        (booking['bookingSource'] as String? ?? 'online').toLowerCase() ==
        'direct';

    final turfObj = booking['turf'];
    final turfName =
        (turfObj is Map ? turfObj['name'] as String? : null) ??
        booking['turfName'] as String? ??
        'Unknown Turf';

    final userObj = booking['user'];
    final userName =
        (isDirect ? booking['customerName'] as String? : null) ??
        (userObj is Map ? userObj['name'] as String? : null) ??
        booking['userName'] as String? ??
        (isDirect ? 'Direct Customer' : 'Player');
    final userPhone =
        (isDirect ? booking['customerPhone'] as String? : null) ??
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
            color: Colors.black.withValues(alpha: 0.04),
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
              if (isDirect) ...[
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 3.h),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF3E8FF),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: const Color(0xFFE9D5FF)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.storefront_outlined,
                        size: 11.sp,
                        color: const Color(0xFF7E22CE),
                      ),
                      SizedBox(width: 3.w),
                      Text(
                        'Direct',
                        style: TextStyle(
                          fontSize: 10.sp,
                          fontWeight: FontWeight.w700,
                          color: const Color(0xFF7E22CE),
                        ),
                      ),
                    ],
                  ),
                ),
                SizedBox(width: 6.w),
              ],
              Container(
                padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 4.h),
                decoration: BoxDecoration(
                  color: _statusColor(status).withValues(alpha: 0.1),
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
                    ? '${TimeHelper.formatSingleTime(startTime)} – ${TimeHelper.formatSingleTime(endTime)}'
                    : (startTime.isNotEmpty
                          ? TimeHelper.formatSingleTime(startTime)
                          : '—'),
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
                  SizedBox(height: 2.h),
                  if (isDirect)
                    Text(
                      'Offline (Direct)',
                      style: TextStyle(
                        fontSize: 10.sp,
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFF7E22CE),
                      ),
                    )
                  else
                    Text(
                      'Platform Wallet',
                      style: TextStyle(
                        fontSize: 10.sp,
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFF059669),
                      ),
                    ),
                ],
              ),
              const Spacer(),
              if (status != 'cancelled') ...[
                OutlinedButton(
                  onPressed: () => _confirmCancel(context, id, isDirect),
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
                    isDirect ? 'Cancel Booking' : 'Cancel & Refund',
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

  void _confirmCancel(BuildContext context, String id, bool isDirect) {
    final reasonController = TextEditingController(
      text: 'Slot unavailable / Turf maintenance',
    );

    Get.dialog(
      AlertDialog(
        title: Text(
          isDirect ? 'Cancel Direct Booking' : 'Cancel & Refund Booking',
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              isDirect
                  ? 'Cancelling this offline booking will release the locked slot back to available for players.'
                  : 'Cancelling this booking will issue a 100% full refund back to the customer via Razorpay.',
              style: const TextStyle(fontSize: 13),
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
                  : (isDirect
                        ? 'Cancelled by Owner'
                        : 'Cancelled by Turf Owner');
              Get.back();
              vm.cancelBooking(id, reason: reason);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFE43434),
            ),
            child: Text(
              isDirect ? 'Confirm Cancel' : 'Confirm Cancel & Refund',
              style: const TextStyle(
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
