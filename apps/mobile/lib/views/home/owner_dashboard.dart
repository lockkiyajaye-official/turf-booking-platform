import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/viewmodels/auth/auth_viewmodel.dart';
import 'package:mobile/viewmodels/turf/owner_viewmodel.dart';
import 'package:mobile/views/booking/add_turf_page.dart';
import 'package:mobile/views/booking/my_turf_page.dart';
import 'package:mobile/views/booking/owner_booking_page.dart';
import 'package:mobile/views/booking/owner_finances_page.dart';
import 'package:mobile/views/notifications/notificaiton_page.dart';

class OwnerDashboardPage extends StatelessWidget {
  const OwnerDashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    final textTheme = Theme.of(context).textTheme;
    final authVm = Get.find<AuthViewmodel>();
    final vm = Get.find<OwnerViewmodel>()..loadDashboard();

    return Scaffold(
      backgroundColor: colors.background,
      body: SafeArea(
        child: RefreshIndicator(
          color: colors.primary,
          onRefresh: () async => vm.loadDashboard(),
          child: CustomScrollView(
            slivers: [
              // ── Header ──────────────────────────────────────
              SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.fromLTRB(20.w, 20.h, 20.w, 0),
                  child: Row(
                    children: [
                      Expanded(
                        child: Obx(() {
                          final first =
                              authVm.currentUser['firstName'] as String? ?? '';
                          return Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Welcome back,',
                                style: textTheme.bodySmall?.copyWith(
                                    color: colors.textGrey),
                              ),
                              Text(
                                first.isEmpty ? 'Owner' : first,
                                style: textTheme.titleLarge?.copyWith(
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ],
                          );
                        }),
                      ),
                      _NotifBadge(colors: colors),
                    ],
                  ),
                ),
              ),

              SliverToBoxAdapter(child: SizedBox(height: 24.h)),

              // ── Stats row ────────────────────────────────────
              SliverToBoxAdapter(
                child: Obx(() {
                  if (vm.isLoading.value) {
                    return SizedBox(
                      height: 110.h,
                      child: Center(
                          child:
                              CircularProgressIndicator(color: colors.primary)),
                    );
                  }
                  final stats = vm.stats;
                  return Padding(
                    padding: EdgeInsets.symmetric(horizontal: 20.w),
                    child: Row(
                      children: [
                        _StatCard(
                          label: 'My Turfs',
                          value: '${stats['totalTurfs'] ?? 0}',
                          icon: Icons.sports_soccer_rounded,
                          color: const Color(0xFF4F46E5),
                          colors: colors,
                          textTheme: textTheme,
                        ),
                        SizedBox(width: 12.w),
                        _StatCard(
                          label: 'Bookings',
                          value: '${stats['totalBookings'] ?? 0}',
                          icon: Icons.calendar_today_rounded,
                          color: const Color(0xFFE43434),
                          colors: colors,
                          textTheme: textTheme,
                        ),
                        SizedBox(width: 12.w),
                        _StatCard(
                          label: 'Revenue',
                          value: '₹${stats['totalRevenue'] ?? 0}',
                          icon: Icons.currency_rupee_rounded,
                          color: const Color(0xFF059669),
                          colors: colors,
                          textTheme: textTheme,
                        ),
                      ],
                    ),
                  );
                }),
              ),

              SliverToBoxAdapter(child: SizedBox(height: 24.h)),

              // ── Quick Actions ────────────────────────────────
              SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.symmetric(horizontal: 20.w),
                  child: Text(
                    'Quick Actions',
                    style: textTheme.titleMedium
                        ?.copyWith(fontWeight: FontWeight.w700),
                  ),
                ),
              ),

              SliverToBoxAdapter(child: SizedBox(height: 12.h)),

              SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.symmetric(horizontal: 20.w),
                  child: Row(
                    children: [
                      Expanded(
                        child: _ActionTile(
                          icon: Icons.add_circle_outline_rounded,
                          label: 'Add Turf',
                          colors: colors,
                          textTheme: textTheme,
                          onTap: () => Get.to(() => const AddTurfPage()),
                        ),
                      ),
                      SizedBox(width: 12.w),
                      Expanded(
                        child: _ActionTile(
                          icon: Icons.list_alt_rounded,
                          label: 'My Turfs',
                          colors: colors,
                          textTheme: textTheme,
                          onTap: () => Get.to(() => const MyTurfsPage()),
                        ),
                      ),
                      SizedBox(width: 12.w),
                      Expanded(
                        child: _ActionTile(
                          icon: Icons.book_online_rounded,
                          label: 'Bookings',
                          colors: colors,
                          textTheme: textTheme,
                          onTap: () => Get.to(() => const OwnerBookingsPage()),
                        ),
                      ),
                      SizedBox(width: 12.w),
                      Expanded(
                        child: _ActionTile(
                          icon: Icons.payments_outlined,
                          label: 'Finances',
                          colors: colors,
                          textTheme: textTheme,
                          onTap: () => Get.to(() => const OwnerFinancesPage()),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              SliverToBoxAdapter(child: SizedBox(height: 24.h)),

              // ── Recent Bookings ──────────────────────────────
              SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.symmetric(horizontal: 20.w),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Recent Bookings',
                        style: textTheme.titleMedium
                            ?.copyWith(fontWeight: FontWeight.w700),
                      ),
                      TextButton(
                        onPressed: () => Get.to(() => const OwnerBookingsPage()),
                        child: Text(
                          'See all',
                          style: textTheme.bodySmall?.copyWith(
                            color: colors.primary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              SliverToBoxAdapter(child: SizedBox(height: 8.h)),

              Obx(() {
                if (vm.isLoading.value) {
                  return SliverToBoxAdapter(
                    child: SizedBox(
                      height: 120.h,
                      child: Center(
                        child:
                            CircularProgressIndicator(color: colors.primary),
                      ),
                    ),
                  );
                }
                if (vm.recentBookings.isEmpty) {
                  return SliverToBoxAdapter(
                    child: SizedBox(
                      height: 120.h,
                      child: Center(
                        child: Text(
                          'No bookings yet',
                          style: textTheme.bodyMedium
                              ?.copyWith(color: colors.textGrey),
                        ),
                      ),
                    ),
                  );
                }
                return SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, i) {
                      final booking = vm.recentBookings[i];
                      return Padding(
                        padding: EdgeInsets.fromLTRB(20.w, 0, 20.w, 10.h),
                        child: _BookingRow(
                          booking: booking,
                          colors: colors,
                          textTheme: textTheme,
                        ),
                      );
                    },
                    childCount: vm.recentBookings.length > 5
                        ? 5
                        : vm.recentBookings.length,
                  ),
                );
              }),

              SliverToBoxAdapter(child: SizedBox(height: 32.h)),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Stat Card ────────────────────────────────────────────────
class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;
  final AppColors colors;
  final TextTheme textTheme;

  const _StatCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
    required this.colors,
    required this.textTheme,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: EdgeInsets.all(14.w),
        decoration: BoxDecoration(
          color: colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFE8E8E8)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(icon, color: color, size: 18),
            ),
            SizedBox(height: 10.h),
            Text(
              value,
              style: textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w800,
                color: colors.textTitle,
              ),
            ),
            SizedBox(height: 2.h),
            Text(
              label,
              style: textTheme.bodySmall?.copyWith(
                color: colors.textGrey,
                fontSize: 11.sp,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Action Tile ──────────────────────────────────────────────
class _ActionTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final AppColors colors;
  final TextTheme textTheme;
  final VoidCallback onTap;

  const _ActionTile({
    required this.icon,
    required this.label,
    required this.colors,
    required this.textTheme,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.symmetric(vertical: 16.h),
        decoration: BoxDecoration(
          color: colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFE8E8E8)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          children: [
            Icon(icon, color: colors.primary, size: 26),
            SizedBox(height: 6.h),
            Text(
              label,
              style: textTheme.bodySmall?.copyWith(
                fontWeight: FontWeight.w600,
                color: colors.textTitle,
                fontSize: 11.sp,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

// ── Booking Row ──────────────────────────────────────────────
class _BookingRow extends StatelessWidget {
  final Map<String, dynamic> booking;
  final AppColors colors;
  final TextTheme textTheme;

  const _BookingRow({
    required this.booking,
    required this.colors,
    required this.textTheme,
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
    final status = (booking['status'] as String? ?? 'pending').toLowerCase();

    final turfObj = booking['turf'];
    final turfName = (turfObj is Map ? turfObj['name'] as String? : null) ??
        booking['turfName'] as String? ??
        'Unknown Turf';

    final userObj = booking['user'];
    final userName = (userObj is Map ? userObj['name'] as String? : null) ??
        booking['userName'] as String? ??
        'Player';

    final rawDate = booking['bookingDate'] ?? booking['date'];
    String date = '';
    if (rawDate != null) {
      date = rawDate.toString().split('T').first;
    }

    final amount = booking['totalPrice'] ?? booking['totalAmount'] ?? booking['price'] ?? 0;

    return Container(
      padding: EdgeInsets.all(14.w),
      decoration: BoxDecoration(
        color: colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE8E8E8)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: colors.primary.withOpacity(0.08),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(Icons.sports_soccer_rounded,
                color: colors.primary, size: 20),
          ),
          SizedBox(width: 12.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  turfName,
                  style: textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                    color: colors.textTitle,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                SizedBox(height: 2.h),
                Text(
                  '$userName • $date',
                  style: textTheme.bodySmall
                      ?.copyWith(color: colors.textGrey, fontSize: 12.sp),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '₹$amount',
                style: textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                  color: colors.textTitle,
                ),
              ),
              SizedBox(height: 4.h),
              Container(
                padding:
                    EdgeInsets.symmetric(horizontal: 8.w, vertical: 3.h),
                decoration: BoxDecoration(
                  color: _statusColor(status).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  status[0].toUpperCase() + status.substring(1),
                  style: TextStyle(
                    fontSize: 11.sp,
                    fontWeight: FontWeight.w600,
                    color: _statusColor(status),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ── Notif Badge ──────────────────────────────────────────────
class _NotifBadge extends StatelessWidget {
  final AppColors colors;
  const _NotifBadge({required this.colors});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => Get.to(() => NotificationPage()),
      child: Container(
        height: 42,
        width: 42,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: const Color(0xFFE8E8E8)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Icon(Icons.notifications_outlined,
            color: colors.primary, size: 22),
      ),
    );
  }
}