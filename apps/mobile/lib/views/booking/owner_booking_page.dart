import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/core/utils/helpers.dart';
import 'package:mobile/viewmodels/turf/owner_viewmodel.dart';
import 'package:mobile/views/booking/widgets/direct_booking_sheet.dart';
import 'package:mobile/views/booking/widgets/owner_booking_details_sheet.dart';
import 'package:url_launcher/url_launcher.dart';

class OwnerBookingsPage extends StatefulWidget {
  final String? preselectedTurfId;
  final String? preselectedTurfName;

  const OwnerBookingsPage({
    super.key,
    this.preselectedTurfId,
    this.preselectedTurfName,
  });

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

  String _selectedSource = 'all'; // 'all', 'online', 'direct'
  String? _selectedTurfId;
  String? _selectedTurfName;

  static const _tabStatuses = [
    '',
    'pending',
    'confirmed',
    'completed',
    'cancelled',
  ];

  @override
  void initState() {
    super.initState();
    _selectedTurfId = widget.preselectedTurfId;
    _selectedTurfName = widget.preselectedTurfName;

    _tabController = TabController(length: 5, vsync: this);

    // Infinite scroll
    _scrollCtrl.addListener(_onScroll);

    // Tab change → refetch with correct status
    _tabController.addListener(() {
      if (!_tabController.indexIsChanging) return;
      _debounce?.cancel();
      _fetchCurrentBookings();
    });

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final vm = Get.isRegistered<OwnerViewmodel>()
          ? Get.find<OwnerViewmodel>()
          : Get.put(OwnerViewmodel(), permanent: true);
      vm.fetchMyTurfs();
      _fetchCurrentBookings();
    });
  }

  void _fetchCurrentBookings() {
    final vm = Get.isRegistered<OwnerViewmodel>()
        ? Get.find<OwnerViewmodel>()
        : Get.put(OwnerViewmodel(), permanent: true);
    final status = _tabStatuses[_tabController.index];
    vm.fetchAllBookings(
      status: status,
      search: _searchCtrl.text.trim(),
      source: _selectedSource == 'all' ? null : _selectedSource,
      turfId: _selectedTurfId,
    );
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
      _fetchCurrentBookings();
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
      _fetchCurrentBookings();
    }
  }

  void _showTurfFilterSheet(BuildContext context, OwnerViewmodel vm) {
    final colors = Theme.of(context).extension<AppColors>()!;
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: EdgeInsets.fromLTRB(20.w, 16.h, 16.w, 8.h),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Filter by Turf',
                      style: TextStyle(
                        fontSize: 16.sp,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close_rounded),
                      onPressed: () => Get.back(),
                    ),
                  ],
                ),
              ),
              const Divider(height: 1),
              ListTile(
                leading: Icon(
                  Icons.all_inclusive_rounded,
                  color: _selectedTurfId == null ? colors.primary : Colors.grey,
                ),
                title: const Text('All My Turfs',
                    style: TextStyle(fontWeight: FontWeight.w600)),
                trailing: _selectedTurfId == null
                    ? Icon(Icons.check_rounded, color: colors.primary)
                    : null,
                onTap: () {
                  Get.back();
                  setState(() {
                    _selectedTurfId = null;
                    _selectedTurfName = null;
                  });
                  _fetchCurrentBookings();
                },
              ),
              ...vm.myTurfs.map((turf) {
                final isSelected = _selectedTurfId == turf.id;
                return ListTile(
                  leading: Icon(
                    Icons.sports_soccer_rounded,
                    color: isSelected ? colors.primary : Colors.grey,
                  ),
                  title: Text(
                    turf.name,
                    style: TextStyle(
                      fontWeight:
                          isSelected ? FontWeight.bold : FontWeight.w500,
                    ),
                  ),
                  subtitle: Text(
                    turf.city ?? turf.address,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(fontSize: 11.sp),
                  ),
                  trailing: isSelected
                      ? Icon(Icons.check_rounded, color: colors.primary)
                      : null,
                  onTap: () {
                    Get.back();
                    setState(() {
                      _selectedTurfId = turf.id;
                      _selectedTurfName = turf.name;
                    });
                    _fetchCurrentBookings();
                  },
                );
              }),
              SizedBox(height: 12.h),
            ],
          ),
        );
      },
    );
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
          automaticallyImplyLeading: Navigator.canPop(context),
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
                  decoration: InputDecoration(
                    hintText: 'Search customer name, phone, turf...',
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
                              _searchCtrl.clear();
                              _onSearchChanged('');
                            },
                          )
                        : null,
                  ),
                )
              : Text(
                  'Turf Bookings',
                  style: textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                    color: colors.textTitle,
                  ),
                ),
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
            PopupMenuButton<String>(
              icon: Stack(
                clipBehavior: Clip.none,
                children: [
                  Icon(Icons.more_vert_rounded, color: colors.textTitle),
                  if (_selectedTurfId != null || _selectedSource != 'all')
                    Positioned(
                      top: 2,
                      right: 2,
                      child: Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: colors.primary,
                          shape: BoxShape.circle,
                        ),
                      ),
                    ),
                ],
              ),
              tooltip: 'Filter options',
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
              onSelected: (value) {
                if (value == 'filter_turf') {
                  _showTurfFilterSheet(context, vm);
                } else if (value == 'source_all') {
                  setState(() => _selectedSource = 'all');
                  _fetchCurrentBookings();
                } else if (value == 'source_online') {
                  setState(() => _selectedSource = 'online');
                  _fetchCurrentBookings();
                } else if (value == 'source_direct') {
                  setState(() => _selectedSource = 'direct');
                  _fetchCurrentBookings();
                } else if (value == 'reset_filters') {
                  setState(() {
                    _selectedSource = 'all';
                    _selectedTurfId = null;
                    _selectedTurfName = null;
                  });
                  _fetchCurrentBookings();
                }
              },
              itemBuilder: (context) => [
                PopupMenuItem<String>(
                  value: 'filter_turf',
                  child: Row(
                    children: [
                      Icon(
                        Icons.stadium_outlined,
                        size: 20,
                        color: _selectedTurfId != null
                            ? colors.primary
                            : colors.textTitle,
                      ),
                      SizedBox(width: 10.w),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              'Filter by Turf',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 13.sp,
                                color: colors.textTitle,
                              ),
                            ),
                            Text(
                              _selectedTurfName ?? 'All My Turfs',
                              style: TextStyle(
                                fontSize: 11.sp,
                                color: _selectedTurfId != null
                                    ? colors.primary
                                    : colors.textGrey,
                                fontWeight: _selectedTurfId != null
                                    ? FontWeight.w600
                                    : FontWeight.normal,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                      Icon(
                        Icons.chevron_right_rounded,
                        size: 18,
                        color: colors.textGrey,
                      ),
                    ],
                  ),
                ),
                const PopupMenuDivider(),
                PopupMenuItem<String>(
                  enabled: false,
                  height: 24,
                  child: Text(
                    'BOOKING SOURCE',
                    style: TextStyle(
                      fontSize: 10.sp,
                      fontWeight: FontWeight.w800,
                      color: colors.textGrey,
                      letterSpacing: 0.6,
                    ),
                  ),
                ),
                CheckedPopupMenuItem<String>(
                  value: 'source_all',
                  checked: _selectedSource == 'all',
                  child:
                      const Text('All Sources', style: TextStyle(fontSize: 13)),
                ),
                CheckedPopupMenuItem<String>(
                  value: 'source_online',
                  checked: _selectedSource == 'online',
                  child: Row(
                    children: [
                      const Icon(Icons.language_rounded,
                          size: 16, color: Color(0xFF2563EB)),
                      SizedBox(width: 8.w),
                      const Text('Online App', style: TextStyle(fontSize: 13)),
                    ],
                  ),
                ),
                CheckedPopupMenuItem<String>(
                  value: 'source_direct',
                  checked: _selectedSource == 'direct',
                  child: Row(
                    children: [
                      const Icon(Icons.storefront_outlined,
                          size: 16, color: Color(0xFF7E22CE)),
                      SizedBox(width: 8.w),
                      const Text('Direct Walk-in',
                          style: TextStyle(fontSize: 13)),
                    ],
                  ),
                ),
                if (_selectedTurfId != null || _selectedSource != 'all') ...[
                  const PopupMenuDivider(),
                  PopupMenuItem<String>(
                    value: 'reset_filters',
                    child: Row(
                      children: const [
                        Icon(Icons.restart_alt_rounded,
                            size: 18, color: Color(0xFFDC2626)),
                        SizedBox(width: 8),
                        Text(
                          'Reset All Filters',
                          style: TextStyle(
                            color: Color(0xFFDC2626),
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
            SizedBox(width: 4.w),
          ],
          bottom: TabBar(
            controller: _tabController,
            isScrollable: true,
            tabAlignment: TabAlignment.start,
            indicatorColor: colors.primary,
            labelColor: colors.primary,
            unselectedLabelColor: colors.textGrey,
            labelStyle: textTheme.bodySmall?.copyWith(
              fontWeight: FontWeight.w700,
              fontSize: 12.sp,
            ),
            tabs: const [
              Tab(text: 'All Bookings'),
              Tab(text: 'Pending'),
              Tab(text: 'Confirmed'),
              Tab(text: 'Completed'),
              Tab(text: 'Cancelled'),
            ],
          ),
        ),
        body: Column(
          children: [
            // Active filter banner (if any filter is selected from 3 dots menu)
            if (_selectedTurfId != null || _selectedSource != 'all')
              Container(
                width: double.infinity,
                padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 7.h),
                decoration: BoxDecoration(
                  color: colors.primary.withValues(alpha: 0.08),
                  border: Border(
                    bottom: BorderSide(
                      color: colors.primary.withValues(alpha: 0.2),
                    ),
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      Icons.filter_list_rounded,
                      size: 14.sp,
                      color: colors.primary,
                    ),
                    SizedBox(width: 6.w),
                    Expanded(
                      child: Text(
                        'Filtered: ${_selectedTurfName ?? "All Turfs"} • ${_selectedSource == "all" ? "All Sources" : (_selectedSource == "online" ? "Online App" : "Direct Walk-in")}',
                        style: TextStyle(
                          fontSize: 11.sp,
                          fontWeight: FontWeight.w600,
                          color: colors.primary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    InkWell(
                      onTap: () {
                        setState(() {
                          _selectedSource = 'all';
                          _selectedTurfId = null;
                          _selectedTurfName = null;
                        });
                        _fetchCurrentBookings();
                      },
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            'Clear',
                            style: TextStyle(
                              fontSize: 11.sp,
                              fontWeight: FontWeight.bold,
                              color: const Color(0xFFDC2626),
                            ),
                          ),
                          SizedBox(width: 2.w),
                          const Icon(
                            Icons.close_rounded,
                            size: 14,
                            color: Color(0xFFDC2626),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

            // ── Booking List Content ──
            Expanded(
              child: Obx(() {
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
                      onRefresh: () async {
                        _fetchCurrentBookings();
                      },
                      child: TabBarView(
                        controller: _tabController,
                        children: List.generate(5, (i) {
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
            ),
          ],
        ),
        floatingActionButton: _isSearching
            ? null
            : FloatingActionButton.extended(
                onPressed: () async {
                  await showDirectBookingModal(context, vm: vm);
                  _fetchCurrentBookings();
                },
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
              'No bookings found',
              style: textTheme.bodyMedium?.copyWith(
                color: colors.textGrey,
                fontWeight: FontWeight.w600,
              ),
            ),
            SizedBox(height: 4.h),
            Text(
              'Try clearing filters or search term',
              style: textTheme.bodySmall?.copyWith(
                color: colors.textGrey.withValues(alpha: 0.7),
              ),
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
          mainAxisExtent: 245,
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
      itemCount: bookings.length + (hasMore ? 1 : 0),
      separatorBuilder: (_, a) => SizedBox(height: 12.h),
      itemBuilder: (context, i) {
        if (i == bookings.length) {
          return Padding(
            padding: EdgeInsets.symmetric(vertical: 16.h),
            child: Center(
              child: isFetchingMore
                  ? CircularProgressIndicator(
                      color: colors.primary,
                      strokeWidth: 2,
                    )
                  : Text(
                      'All bookings loaded',
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
        return const Color(0xFFD97706);
      case 'completed':
        return const Color(0xFF2563EB);
      case 'cancelled':
        return const Color(0xFFDC2626);
      default:
        return Colors.grey;
    }
  }

  Future<void> _makeCall(String phone) async {
    final clean = phone.trim();
    if (clean.isEmpty) return;
    try {
      final uri = Uri(scheme: 'tel', path: clean);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri);
      }
    } catch (_) {}
  }

  Future<void> _sendWhatsAppConfirmation({
    required String phone,
    required String bookingId,
    required String turfName,
    String? customerName,
    required String date,
    required String time,
    required dynamic amount,
    String? address,
    String? status,
  }) async {
    final message = WhatsAppHelper.buildConfirmationMessage(
      bookingId: bookingId,
      turfName: turfName,
      customerName: customerName,
      date: date,
      time: time,
      amount: amount,
      address: address,
      status: status,
    );

    final launched = await WhatsAppHelper.sendConfirmationMessage(
      phone: phone,
      message: message,
    );

    if (!launched) {
      Get.snackbar(
        'WhatsApp Not Reachable',
        'Unable to open WhatsApp for $phone. Please check if WhatsApp is installed.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.black87,
        colorText: Colors.white,
      );
    }
  }

  void _confirmCancel(BuildContext context, String id, bool isDirect) {
    final reasonController = TextEditingController(
      text: 'Slot unavailable / Turf maintenance',
    );

    Get.dialog(
      AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(
          isDirect ? 'Cancel Direct Booking' : 'Cancel & Refund Booking',
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 17),
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
              backgroundColor: const Color(0xFFDC2626),
              foregroundColor: Colors.white,
            ),
            child: Text(
              isDirect ? 'Confirm Cancel' : 'Confirm Cancel & Refund',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
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
    final turfAddress =
        (turfObj is Map ? turfObj['address'] as String? : null) ??
        booking['turfAddress'] as String? ??
        '';

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
    final formattedTime = (startTime.isNotEmpty && endTime.isNotEmpty)
        ? '${TimeHelper.formatSingleTime(startTime)} – ${TimeHelper.formatSingleTime(endTime)}'
        : (startTime.isNotEmpty ? TimeHelper.formatSingleTime(startTime) : '—');
    final amount = booking['totalPrice'] ??
        booking['totalAmount'] ??
        booking['price'] ??
        0;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => showOwnerBookingDetailsSheet(
          context,
          booking: booking,
          vm: vm,
        ),
        borderRadius: BorderRadius.circular(14),
        child: Container(
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
                      padding:
                          EdgeInsets.symmetric(horizontal: 8.w, vertical: 3.h),
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
                    padding:
                        EdgeInsets.symmetric(horizontal: 10.w, vertical: 4.h),
                    decoration: BoxDecoration(
                      color: _statusColor(status).withValues(alpha: 0.12),
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
                  Expanded(
                    child: _InfoItem(
                      icon: Icons.person_outline,
                      label: 'Customer',
                      value: userName,
                      colors: colors,
                      textTheme: textTheme,
                    ),
                  ),
                  SizedBox(width: 12.w),
                  Expanded(
                    child: Row(
                      children: [
                        Expanded(
                          child: _InfoItem(
                            icon: Icons.phone_outlined,
                            label: 'Phone',
                            value: userPhone.isNotEmpty ? userPhone : '—',
                            colors: colors,
                            textTheme: textTheme,
                          ),
                        ),
                        if (userPhone.isNotEmpty) ...[
                          IconButton(
                            icon: Icon(
                              Icons.phone_in_talk_rounded,
                              size: 18.sp,
                              color: const Color(0xFF059669),
                            ),
                            tooltip: 'Call Customer',
                            padding: EdgeInsets.zero,
                            constraints: const BoxConstraints(),
                            onPressed: () => _makeCall(userPhone),
                          ),
                          SizedBox(width: 8.w),
                          IconButton(
                            icon: Icon(
                              Icons.chat_rounded,
                              size: 18.sp,
                              color: const Color(0xFF25D366),
                            ),
                            tooltip: 'Send WhatsApp Confirmation',
                            padding: EdgeInsets.zero,
                            constraints: const BoxConstraints(),
                            onPressed: () => _sendWhatsAppConfirmation(
                              phone: userPhone,
                              bookingId: id,
                              turfName: turfName,
                              customerName: userName,
                              date: date,
                              time: formattedTime,
                              amount: amount,
                              address: turfAddress,
                              status: status,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ],
              ),

              SizedBox(height: 8.h),

              Row(
                children: [
                  Expanded(
                    child: _InfoItem(
                      icon: Icons.calendar_today_rounded,
                      label: 'Date',
                      value: date,
                      colors: colors,
                      textTheme: textTheme,
                    ),
                  ),
                  SizedBox(width: 12.w),
                  Expanded(
                    child: _InfoItem(
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
                  ),
                ],
              ),

              SizedBox(height: 12.h),

              // Amount + Booking Management Action Buttons
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

                  // Actions based on status
                  if (status == 'pending') ...[
                    OutlinedButton(
                      onPressed: () => _confirmCancel(context, id, isDirect),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Color(0xFFDC2626)),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        padding: EdgeInsets.symmetric(
                          horizontal: 10.w,
                          vertical: 6.h,
                        ),
                      ),
                      child: Text(
                        'Cancel',
                        style: TextStyle(
                          color: const Color(0xFFDC2626),
                          fontWeight: FontWeight.w700,
                          fontSize: 11.sp,
                        ),
                      ),
                    ),
                    SizedBox(width: 8.w),
                    ElevatedButton(
                      onPressed: () => vm.confirmBooking(id),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF059669),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        padding: EdgeInsets.symmetric(
                          horizontal: 12.w,
                          vertical: 6.h,
                        ),
                      ),
                      child: Text(
                        'Confirm',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 11.sp,
                        ),
                      ),
                    ),
                  ] else if (status == 'confirmed') ...[
                    OutlinedButton(
                      onPressed: () => _confirmCancel(context, id, isDirect),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Color(0xFFDC2626)),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        padding: EdgeInsets.symmetric(
                          horizontal: 10.w,
                          vertical: 6.h,
                        ),
                      ),
                      child: Text(
                        isDirect ? 'Cancel' : 'Cancel & Refund',
                        style: TextStyle(
                          color: const Color(0xFFDC2626),
                          fontWeight: FontWeight.w700,
                          fontSize: 11.sp,
                        ),
                      ),
                    ),
                    if (userPhone.isNotEmpty) ...[
                      SizedBox(width: 8.w),
                      IconButton(
                        onPressed: () => _sendWhatsAppConfirmation(
                          phone: userPhone,
                          bookingId: id,
                          turfName: turfName,
                          customerName: userName,
                          date: date,
                          time: formattedTime,
                          amount: amount,
                          address: turfAddress,
                          status: status,
                        ),
                        icon: const Icon(Icons.chat_rounded, size: 16),
                        tooltip: 'Send WhatsApp Confirmation',
                        constraints: const BoxConstraints(),
                        style: IconButton.styleFrom(
                          backgroundColor: const Color(0xFF25D366),
                          foregroundColor: Colors.white,
                          padding: EdgeInsets.symmetric(
                            horizontal: 9.w,
                            vertical: 7.h,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                      ),
                    ],
                    SizedBox(width: 8.w),
                    ElevatedButton(
                      onPressed: () => vm.completeBooking(id),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF2563EB),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        padding: EdgeInsets.symmetric(
                          horizontal: 12.w,
                          vertical: 6.h,
                        ),
                      ),
                      child: Text(
                        'Complete',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 11.sp,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Info item helper ─────────────────────────────────────────
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
    return Row(
      children: [
        Icon(icon, size: 14, color: colors.textGrey),
        SizedBox(width: 6.w),
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
                  fontWeight: FontWeight.w600,
                  color: colors.textTitle,
                  fontSize: 12.sp,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ],
    );
  }
}
