import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/data/models/booking_model.dart';
import 'package:mobile/viewmodels/booking/booking_viewmodel.dart';

const _green = Color(0xFF2E7D32);
const _red = Color(0xFFE43434);
const _lightGreen = Color(0xFFE8F5E9);
const _lightGray = Color(0xFFF5F5F5);

class BookingPage extends StatefulWidget {
  const BookingPage({super.key});

  @override
  State<BookingPage> createState() => _BookingPageState();
}

class _BookingPageState extends State<BookingPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  // TODO: if BookingViewmodel is already registered via a Binding, swap
  // this for Get.find<BookingViewmodel>().
  final BookingViewmodel _vm = Get.isRegistered<BookingViewmodel>()
      ? Get.find<BookingViewmodel>()
      : Get.put(BookingViewmodel());

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _vm.fetchMyBookings();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text(
          'My Bookings',
          style: textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w700,
            color: Colors.black87,
          ),
        ),
        centerTitle: true,
        bottom: PreferredSize(
          preferredSize: Size.fromHeight(52.h),
          child: Padding(
            padding: EdgeInsets.fromLTRB(16.w, 0, 16.w, 12.h),
            child: _CustomTabBar(controller: _tabController),
          ),
        ),
      ),
      body: Obx(() {
        if (_vm.isLoading.value && _vm.myBookings.isEmpty) {
          return const Center(child: CircularProgressIndicator(color: _green));
        }

        final active = _vm.myBookings.where((b) => !b.isPast).toList()
          ..sort((a, b) => a.bookingDate.compareTo(b.bookingDate));
        final past = _vm.myBookings.where((b) => b.isPast).toList()
          ..sort((a, b) => b.bookingDate.compareTo(a.bookingDate));

        return TabBarView(
          controller: _tabController,
          children: [
            _BookingList(
              bookings: active,
              isActive: true,
              onRefresh: _vm.fetchMyBookings,
              vm: _vm,
            ),
            _BookingList(
              bookings: past,
              isActive: false,
              onRefresh: _vm.fetchMyBookings,
              vm: _vm,
            ),
          ],
        );
      }),
    );
  }
}

/// Pill-style tab bar matching the design
class _CustomTabBar extends StatefulWidget {
  final TabController controller;
  const _CustomTabBar({required this.controller});

  @override
  State<_CustomTabBar> createState() => _CustomTabBarState();
}

class _CustomTabBarState extends State<_CustomTabBar> {
  @override
  void initState() {
    super.initState();
    widget.controller.addListener(() => setState(() {}));
  }

  @override
  Widget build(BuildContext context) {
    final activeIndex = widget.controller.index;
    return Container(
      height: 42.h,
      decoration: BoxDecoration(
        color: _lightGray,
        borderRadius: BorderRadius.circular(12),
      ),
      padding: const EdgeInsets.all(3),
      child: Row(
        children: [
          _TabItem(
            label: 'Active',
            isSelected: activeIndex == 0,
            onTap: () => widget.controller.animateTo(0),
          ),
          _TabItem(
            label: 'Past',
            isSelected: activeIndex == 1,
            onTap: () => widget.controller.animateTo(1),
          ),
        ],
      ),
    );
  }
}

class _TabItem extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _TabItem({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          decoration: BoxDecoration(
            color: isSelected ? _green : Colors.transparent,
            borderRadius: BorderRadius.circular(9),
          ),
          alignment: Alignment.center,
          child: Text(
            label,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: isSelected ? Colors.white : Colors.grey.shade600,
            ),
          ),
        ),
      ),
    );
  }
}

/// List of booking cards, backed by BookingViewmodel.myBookings.
class _BookingList extends StatelessWidget {
  final List<BookingModel> bookings;
  final bool isActive;
  final Future<void> Function() onRefresh;
  final BookingViewmodel vm;

  const _BookingList({
    required this.bookings,
    required this.isActive,
    required this.onRefresh,
    required this.vm,
  });

  @override
  Widget build(BuildContext context) {
    if (bookings.isEmpty) {
      return RefreshIndicator(
        onRefresh: onRefresh,
        child: ListView(
          children: [
            SizedBox(height: 120.h),
            Center(
              child: Text(
                isActive ? 'No upcoming bookings yet' : 'No past bookings',
                style: TextStyle(color: Colors.grey.shade500),
              ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: onRefresh,
      child: ListView.separated(
        padding: EdgeInsets.fromLTRB(16.w, 16.h, 16.w, 24.h),
        itemCount: bookings.length,
        separatorBuilder: (_, __) => SizedBox(height: 12.h),
        itemBuilder: (context, index) => _BookingCard(
          booking: bookings[index],
          isActive: isActive,
          vm: vm,
        ),
      ),
    );
  }
}

/// Individual booking card
class _BookingCard extends StatelessWidget {
  final BookingModel booking;
  final bool isActive;
  final BookingViewmodel vm;

  const _BookingCard({
    required this.booking,
    required this.isActive,
    required this.vm,
  });

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final data = booking;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade100),
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
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(16),
                ),
                child: SizedBox(
                  width: 100.w,
                  height: 90.h,
                  child: data.turfImage != null
                      ? Image.network(
                          data.turfImage!,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Container(
                            color: const Color(0xFF1a3a1a),
                            child: const Icon(Icons.sports_cricket,
                                color: Colors.white30, size: 32),
                          ),
                        )
                      : Container(
                          color: const Color(0xFF1a3a1a),
                          child: const Icon(Icons.sports_cricket,
                              color: Colors.white30, size: 32),
                        ),
                ),
              ),
              Expanded(
                child: Padding(
                  padding: EdgeInsets.fromLTRB(12.w, 10.h, 10.w, 8.h),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              data.turfName,
                              style: textTheme.bodyMedium?.copyWith(
                                fontWeight: FontWeight.w700,
                                color: Colors.black87,
                              ),
                            ),
                          ),
                          _StatusBadge(
                            status: data.displayStatus,
                            isActive: isActive,
                          ),
                        ],
                      ),
                      SizedBox(height: 3.h),
                      Text(
                        data.turfType,
                        style: textTheme.bodySmall
                            ?.copyWith(color: Colors.grey.shade500),
                      ),
                      SizedBox(height: 5.h),
                      Row(
                        children: [
                          Icon(Icons.location_on_outlined,
                              size: 12, color: Colors.grey.shade500),
                          SizedBox(width: 3.w),
                          Expanded(
                            child: Text(
                              data.turfLocation,
                              style: textTheme.bodySmall?.copyWith(
                                  color: Colors.grey.shade600, fontSize: 11),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          Divider(height: 1, color: Colors.grey.shade100),
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 8.h),
            child: Row(
              children: [
                Icon(Icons.calendar_today_outlined,
                    size: 13, color: Colors.grey.shade500),
                SizedBox(width: 5.w),
                Text(
                  data.displayDate,
                  style: textTheme.bodySmall
                      ?.copyWith(color: Colors.grey.shade700, fontSize: 11),
                ),
                Container(
                  width: 1,
                  height: 12.h,
                  color: Colors.grey.shade300,
                  margin: EdgeInsets.symmetric(horizontal: 10.w),
                ),
                Icon(Icons.access_time_outlined,
                    size: 13, color: Colors.grey.shade500),
                SizedBox(width: 5.w),
                Text(
                  data.displayTime,
                  style: textTheme.bodySmall
                      ?.copyWith(color: Colors.grey.shade700, fontSize: 11),
                ),
              ],
            ),
          ),
          Padding(
            padding: EdgeInsets.fromLTRB(12.w, 0, 12.w, 12.h),
            child: Row(
              children: isActive
                  ? [
                      Expanded(
                        child: _ActionButton(
                          label: 'View Details',
                          filled: true,
                          color: _green,
                          onTap: () {
                            // TODO: navigate to a booking-details page using data.id
                          },
                        ),
                      ),
                      SizedBox(width: 8.w),
                      Expanded(
                        child: Obx(
                          () => _ActionButton(
                            label: vm.isLoading.value ? 'Cancelling…' : 'Cancel',
                            filled: false,
                            color: _red,
                            onTap: vm.isLoading.value
                                ? () {}
                                : () => vm.cancelBooking(data.id),
                          ),
                        ),
                      ),
                    ]
                  : [
                      Expanded(
                        child: _ActionButton(
                          label: 'Rebook',
                          filled: true,
                          color: _green,
                          onTap: () {
                            // TODO: navigate back to TurfDetailsPage for data.turfId
                          },
                        ),
                      ),
                      SizedBox(width: 8.w),
                      Expanded(
                        child: _ActionButton(
                          label: 'View Receipt',
                          filled: false,
                          color: Colors.grey.shade400,
                          onTap: () {},
                        ),
                      ),
                    ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Confirmed / Played badge
class _StatusBadge extends StatelessWidget {
  final String status;
  final bool isActive;

  const _StatusBadge({required this.status, required this.isActive});

  @override
  Widget build(BuildContext context) {
    final bg = isActive ? _lightGreen : Colors.grey.shade100;
    final fg = isActive ? _green : Colors.grey.shade500;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (isActive)
            Container(
              width: 5,
              height: 5,
              margin: const EdgeInsets.only(right: 4),
              decoration: BoxDecoration(color: fg, shape: BoxShape.circle),
            ),
          Text(
            status,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w600,
              color: fg,
            ),
          ),
        ],
      ),
    );
  }
}

/// Reusable action button
class _ActionButton extends StatelessWidget {
  final String label;
  final bool filled;
  final Color color;
  final VoidCallback onTap;

  const _ActionButton({
    required this.label,
    required this.filled,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 36,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: filled ? color : Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: filled ? null : Border.all(color: color),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: filled ? Colors.white : color,
          ),
        ),
      ),
    );
  }
}