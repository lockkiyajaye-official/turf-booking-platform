import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/constants/app_assets.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/viewmodels/turf/turf_viewmodel.dart';
import 'package:mobile/views/home/widgets/booking_card.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final TextEditingController _searchController = TextEditingController();
  final List<String> _filters = [
    'All',
    'Football',
    'Cricket',
    'Basketball',
    'Badminton',
  ];
  int _selectedFilter = 0;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      backgroundColor: colors.background,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(height: 56.h),

          // ── Header ──────────────────────────────────────────
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.w),
            child: Row(
              children: [
                Expanded(
                  child: GestureDetector(
                    onTap: () {
                      // TODO: open location picker
                    },
                    child: Container(
                      height: 46.h,
                      padding: EdgeInsets.symmetric(horizontal: 12.w),
                      decoration: BoxDecoration(
                        color: colors.white,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: const Color(0xFFE8E8E8),
                          width: 1,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.05),
                            blurRadius: 6,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.location_on_rounded,
                              color: colors.primary, size: 20),
                          SizedBox(width: 8.w),
                          Expanded(
                            child: Text(
                              'HSR Layout, Bangalore',
                              style: textTheme.bodyMedium?.copyWith(
                                fontWeight: FontWeight.w500,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Icon(Icons.keyboard_arrow_down_rounded,
                              color: colors.textGrey, size: 20),
                        ],
                      ),
                    ),
                  ),
                ),
                SizedBox(width: 12.w),
                _HeaderIconButton(
                  icon: Icons.notifications_outlined,
                  colors: colors,
                  onTap: () {
                    // TODO: navigate to notifications
                  },
                ),
              ],
            ),
          ),

          SizedBox(height: 14.h),

          // ── Search bar ──────────────────────────────────────
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.w),
            child: Container(
              height: 48.h,
              decoration: BoxDecoration(
                color: colors.white,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFE8E8E8)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.04),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: TextField(
                controller: _searchController,
                style: textTheme.bodyMedium,
                decoration: InputDecoration(
                  hintText: 'Search turf by name, location or sport',
                  hintStyle: TextStyle(
                    color: colors.textGrey.withOpacity(0.6),
                    fontSize: 14.sp,
                  ),
                  prefixIcon:
                      Icon(Icons.search, color: colors.textGrey, size: 22),
                  suffixIcon: ValueListenableBuilder<TextEditingValue>(
                    valueListenable: _searchController,
                    builder: (_, value, __) {
                      if (value.text.isEmpty) return const SizedBox.shrink();
                      return IconButton(
                        icon: const Icon(Icons.close_rounded, size: 18),
                        color: colors.textGrey,
                        onPressed: () => _searchController.clear(),
                      );
                    },
                  ),
                  filled: true,
                  fillColor: Colors.transparent,
                  contentPadding: EdgeInsets.symmetric(vertical: 14.h),
                  border: InputBorder.none,
                  enabledBorder: InputBorder.none,
                  focusedBorder: InputBorder.none,
                ),
              ),
            ),
          ),

          SizedBox(height: 16.h),

          // ── Filter chips ────────────────────────────────────
          SizedBox(
            height: 36.h,
            child: ListView.separated(
              padding: EdgeInsets.symmetric(horizontal: 16.w),
              scrollDirection: Axis.horizontal,
              itemCount: _filters.length,
              separatorBuilder: (_, __) => SizedBox(width: 8.w),
              itemBuilder: (context, index) {
                final selected = _selectedFilter == index;
                return GestureDetector(
                  onTap: () => setState(() => _selectedFilter = index),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    padding: EdgeInsets.symmetric(
                      horizontal: 16.w,
                      vertical: 8.h,
                    ),
                    decoration: BoxDecoration(
                      color: selected ? colors.primary : colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: selected
                            ? colors.primary
                            : const Color(0xFFE8E8E8),
                      ),
                    ),
                    child: Text(
                      _filters[index],
                      style: textTheme.bodySmall?.copyWith(
                        color: selected ? Colors.white : colors.textGrey,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),

          SizedBox(height: 16.h),

          // ── Scrollable body ─────────────────────────────────
          // GetX cannot return Sliver widgets, so the turf list lives inside
          // a SliverToBoxAdapter as a plain Column. The parent CustomScrollView
          // handles all scrolling.
          Expanded(
            child: CustomScrollView(
              slivers: [
                // Banner
                SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16.w),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Image.asset(
                        AppAssets.football,
                        height: 160.h,
                        width: double.infinity,
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                ),

                SliverToBoxAdapter(child: SizedBox(height: 16.h)),

                // Section title
                SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16.w),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Nearby Turfs',
                          style: textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        TextButton(
                          onPressed: () {
                            // TODO: navigate to all turfs
                          },
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

                // Turf list
                SliverToBoxAdapter(
                  child: GetX<TurfViewmodel>(
                    init: Get.find<TurfViewmodel>()..fetchAllTurfs(),
                    builder: (vm) {
                      // Loading
                      if (vm.isLoading.value && vm.turfs.isEmpty) {
                        return SizedBox(
                          height: 200.h,
                          child: Center(
                            child: CircularProgressIndicator(
                              color: colors.primary,
                            ),
                          ),
                        );
                      }

                      // Empty
                      if (vm.turfs.isEmpty) {
                        return SizedBox(
                          height: 200.h,
                          child: Center(
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  Icons.sports_soccer_outlined,
                                  size: 48,
                                  color: colors.textGrey,
                                ),
                                SizedBox(height: 12.h),
                                Text(
                                  'No turfs available at the moment.',
                                  style: textTheme.bodyMedium
                                      ?.copyWith(color: colors.textGrey),
                                ),
                              ],
                            ),
                          ),
                        );
                      }

                      // Cards
                      return Padding(
                        padding:
                            EdgeInsets.fromLTRB(16.w, 4.h, 16.w, 24.h),
                        child: Column(
                          children: [
                            for (final turf in vm.turfs)
                              Padding(
                                padding: EdgeInsets.only(bottom: 12.h),
                                child: VenueCard(
                                  turf: turf,
                                  onBookNow: () => debugPrint(
                                    'Book Now tapped for ${turf.name}',
                                  ),
                                ),
                              ),
                          ],
                        ),
                      );
                    },
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

// ── Reusable header icon button ──────────────────────────────
class _HeaderIconButton extends StatelessWidget {
  final IconData icon;
  final AppColors colors;
  final VoidCallback onTap;

  const _HeaderIconButton({
    required this.icon,
    required this.colors,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 46,
        width: 46,
        decoration: BoxDecoration(
          color: colors.white,
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
        child: Icon(icon, color: colors.primary, size: 22),
      ),
    );
  }
}