import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';

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

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
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
      body: TabBarView(
        controller: _tabController,
        children: const [
          _BookingList(isActive: true),
          _BookingList(isActive: false),
        ],
      ),
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

/// List of booking cards
class _BookingList extends StatelessWidget {
  final bool isActive;
  const _BookingList({required this.isActive});

  @override
  Widget build(BuildContext context) {
    // Replace with real data from your viewmodel
    final items = isActive
        ? [
            _BookingData(
                name: 'Grandfield',
                type: 'Cricket Turf',
                location: 'HSR Layout, Koramangala',
                date: 'December 20, 2025',
                time: '07:00 PM – 08:00 PM',
                status: 'Confirmed'),
            _BookingData(
                name: 'Pro Field',
                type: 'Cricket Turf',
                location: 'HSR Layout, Koramangala',
                date: 'December 24, 2025',
                time: '07:00 PM – 08:00 PM',
                status: 'Confirmed'),
            _BookingData(
                name: 'Win Field',
                type: 'Cricket Turf',
                location: 'HSR Layout, Koramangala',
                date: 'December 26, 2025',
                time: '07:00 PM – 08:00 PM',
                status: 'Confirmed'),
          ]
        : [
            _BookingData(
                name: 'Kick Arena',
                type: 'Cricket Turf',
                location: 'HSR Layout, Koramangala',
                date: 'December 14, 2025',
                time: '07:00 PM – 08:00 PM',
                status: 'Played'),
            _BookingData(
                name: 'Pro Arena',
                type: 'Cricket Turf',
                location: 'HSR Layout, Koramangala',
                date: 'December 13, 2025',
                time: '07:00 PM – 08:00 PM',
                status: 'Played'),
            _BookingData(
                name: 'Win Arena',
                type: 'Cricket Turf',
                location: 'HSR Layout, Koramangala',
                date: 'December 17, 2025',
                time: '07:00 PM – 08:00 PM',
                status: 'Played'),
          ];

    return ListView.separated(
      padding: EdgeInsets.fromLTRB(16.w, 16.h, 16.w, 24.h),
      itemCount: items.length,
      separatorBuilder: (_, __) => SizedBox(height: 12.h),
      itemBuilder: (context, index) => _BookingCard(
        data: items[index],
        isActive: isActive,
      ),
    );
  }
}

class _BookingData {
  final String name, type, location, date, time, status;
  const _BookingData({
    required this.name,
    required this.type,
    required this.location,
    required this.date,
    required this.time,
    required this.status,
  });
}

/// Individual booking card
class _BookingCard extends StatelessWidget {
  final _BookingData data;
  final bool isActive;

  const _BookingCard({required this.data, required this.isActive});

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

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
          // ── TOP: image + info ──
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Venue image
              ClipRRect(
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(16),
                  bottomLeft: Radius.circular(0),
                ),
                child: Stack(
                  children: [
                    // Replace with real Image.network/asset
                    Container(
                      width: 100.w,
                      height: 90.h,
                      color: const Color(0xFF1a3a1a),
                      child: const Icon(Icons.sports_cricket,
                          color: Colors.white30, size: 32),
                    ),
                    // Subtle overlay so image edge blends into card
                    Positioned(
                      right: 0,
                      top: 0,
                      bottom: 0,
                      child: Container(
                        width: 20.w,
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              Colors.white.withOpacity(0),
                              Colors.white.withOpacity(0.08),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // Info
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
                              data.name,
                              style: textTheme.bodyMedium?.copyWith(
                                fontWeight: FontWeight.w700,
                                color: Colors.black87,
                              ),
                            ),
                          ),
                          _StatusBadge(status: data.status, isActive: isActive),
                        ],
                      ),
                      SizedBox(height: 3.h),
                      Text(
                        data.type,
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
                              data.location,
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

          // ── DIVIDER ──
          Divider(height: 1, color: Colors.grey.shade100),

          // ── META: date + time ──
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 8.h),
            child: Row(
              children: [
                Icon(Icons.calendar_today_outlined,
                    size: 13, color: Colors.grey.shade500),
                SizedBox(width: 5.w),
                Text(
                  data.date,
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
                  data.time,
                  style: textTheme.bodySmall
                      ?.copyWith(color: Colors.grey.shade700, fontSize: 11),
                ),
              ],
            ),
          ),

          // ── ACTIONS ──
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
                          onTap: () {},
                        ),
                      ),
                      SizedBox(width: 8.w),
                      Expanded(
                        child: _ActionButton(
                          label: 'Cancel',
                          filled: false,
                          color: _red,
                          onTap: () {},
                        ),
                      ),
                    ]
                  : [
                      Expanded(
                        child: _ActionButton(
                          label: 'Rebook',
                          filled: true,
                          color: _green,
                          onTap: () {},
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