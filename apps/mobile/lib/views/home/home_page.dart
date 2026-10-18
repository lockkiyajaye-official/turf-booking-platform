import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/data/models/turf_model.dart';
import 'package:mobile/viewmodels/turf/turf_viewmodel.dart';
import 'package:mobile/views/booking/booking_details_page.dart';
import 'package:mobile/views/home/all_turfs_page.dart';
import 'package:mobile/views/home/widgets/booking_card.dart';
import 'package:mobile/views/home/widgets/location_selection_sheet.dart';
import 'package:mobile/views/notifications/notificaiton_page.dart';

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
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Get.find<TurfViewmodel>().fetchAllTurfs();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Widget _buildLocationSelector(AppColors colors, TextTheme textTheme) {
    return GestureDetector(
      onTap: () {
        showModalBottomSheet(
          context: context,
          isScrollControlled: true,
          backgroundColor: Colors.transparent,
          builder: (_) => const LocationSelectionSheet(),
        );
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
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            Icon(
              Icons.location_on_rounded,
              color: colors.primary,
              size: 20.sp,
            ),
            SizedBox(width: 8.w),
            Expanded(
              child: GetX<TurfViewmodel>(
                builder: (vm) {
                  final locName = vm.selectedLocationName.value;
                  final isLocating = vm.isLocationLoading.value;
                  return Text(
                    isLocating
                        ? 'Locating...'
                        : (locName.isNotEmpty ? locName : 'Select Location'),
                    style: textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                    overflow: TextOverflow.ellipsis,
                  );
                },
              ),
            ),
            Icon(
              Icons.keyboard_arrow_down_rounded,
              color: colors.textGrey,
              size: 20.sp,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchBar(AppColors colors, TextTheme textTheme) {
    return Container(
      height: 46.h,
      padding: EdgeInsets.symmetric(horizontal: 12.w),
      decoration: BoxDecoration(
        color: colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFE8E8E8)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Icon(Icons.search, color: colors.textGrey, size: 20.sp),
          SizedBox(width: 8.w),
          Expanded(
            child: TextField(
              controller: _searchController,
              onChanged: (_) => setState(() {}),
              style: textTheme.bodyMedium,
              textAlignVertical: TextAlignVertical.center,
              decoration: InputDecoration(
                isDense: true,
                hintText: 'Search turf by name, location or sport',
                hintStyle: TextStyle(
                  color: colors.textGrey.withValues(alpha: 0.6),
                  fontSize: 14.sp,
                ),
                border: InputBorder.none,
                enabledBorder: InputBorder.none,
                focusedBorder: InputBorder.none,
                contentPadding: EdgeInsets.zero,
              ),
            ),
          ),
          ValueListenableBuilder<TextEditingValue>(
            valueListenable: _searchController,
            builder: (_, value, __) {
              if (value.text.isEmpty) return const SizedBox.shrink();
              return Padding(
                padding: EdgeInsets.only(left: 8.w),
                child: GestureDetector(
                  onTap: () {
                    _searchController.clear();
                    setState(() {});
                  },
                  child: Icon(
                    Icons.close_rounded,
                    color: colors.textGrey,
                    size: 18.sp,
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    final textTheme = Theme.of(context).textTheme;
    final isTablet = context.isTablet;
    final horizontalPad = isTablet ? 20.w : 16.w;

    return Scaffold(
      backgroundColor: colors.background,
      body: SafeArea(
        bottom: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(height: isTablet ? 12.h : 8.h),

          // ── Header (Unified row on iPad, 2 rows on mobile) ──
          if (isTablet)
            Padding(
              padding: EdgeInsets.symmetric(horizontal: horizontalPad),
              child: Row(
                children: [
                  SizedBox(
                    width: 260.w,
                    child: _buildLocationSelector(colors, textTheme),
                  ),
                  SizedBox(width: 14.w),
                  Expanded(
                    child: _buildSearchBar(colors, textTheme),
                  ),
                  SizedBox(width: 14.w),
                  _HeaderIconButton(
                    icon: Icons.notifications_outlined,
                    colors: colors,
                    onTap: () => Get.to(() => const NotificationPage()),
                  ),
                ],
              ),
            )
          else ...[
            Padding(
              padding: EdgeInsets.symmetric(horizontal: horizontalPad),
              child: Row(
                children: [
                  Expanded(
                    child: _buildLocationSelector(colors, textTheme),
                  ),
                  SizedBox(width: 12.w),
                  _HeaderIconButton(
                    icon: Icons.notifications_outlined,
                    colors: colors,
                    onTap: () => Get.to(() => const NotificationPage()),
                  ),
                ],
              ),
            ),
            SizedBox(height: 14.h),
            Padding(
              padding: EdgeInsets.symmetric(horizontal: horizontalPad),
              child: _buildSearchBar(colors, textTheme),
            ),
          ],

          SizedBox(height: 16.h),

          // ── Filter chips ────────────────────────────────────
          SizedBox(
            height: 38.h,
            child: ListView.separated(
              padding: EdgeInsets.symmetric(horizontal: horizontalPad),
              scrollDirection: Axis.horizontal,
              itemCount: _filters.length,
              separatorBuilder: (_, __) => SizedBox(width: isTablet ? 10.w : 8.w),
              itemBuilder: (context, index) {
                final selected = _selectedFilter == index;
                return GestureDetector(
                  onTap: () => setState(() => _selectedFilter = index),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    padding: EdgeInsets.symmetric(
                      horizontal: isTablet ? 18.w : 16.w,
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
                SliverToBoxAdapter(child: SizedBox(height: 16.h)),

                // Section title
                SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.symmetric(
                      horizontal: isTablet ? 20.w : 16.w,
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Nearby Turfs',
                          style: textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w700,
                            fontSize: isTablet ? 17.sp : null,
                          ),
                        ),
                        TextButton(
                          onPressed: () => Get.to(() => const AllTurfsPage()),
                          child: Text(
                            'See all',
                            style: textTheme.bodySmall?.copyWith(
                              color: colors.primary,
                              fontWeight: FontWeight.w600,
                              fontSize: isTablet ? 13.sp : null,
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

                      // Filter list by selected sport filter, search text, and location selection
                      final selectedSport = _filters[_selectedFilter];
                      final searchQuery = _searchController.text
                          .trim()
                          .toLowerCase();
                      final activeLocation = vm.selectedLocationName.value;
                      final isUsingGps = vm.isUsingCurrentLocation.value;

                      List<TurfModel> filteredTurfs = vm.turfs.where((turf) {
                        final matchesSearch =
                            searchQuery.isEmpty ||
                            turf.name.toLowerCase().contains(searchQuery) ||
                            turf.address.toLowerCase().contains(searchQuery);

                        final matchesSport =
                            selectedSport == 'All' ||
                            turf.sports.any(
                              (s) => s.toLowerCase().contains(
                                selectedSport.toLowerCase(),
                              ),
                            ) ||
                            turf.amenities.any(
                              (a) => a.toLowerCase().contains(
                                selectedSport.toLowerCase(),
                              ),
                            ) ||
                            (turf.description ?? '').toLowerCase().contains(
                              selectedSport.toLowerCase(),
                            );

                        bool matchesLocation = true;
                        if (!isUsingGps &&
                            activeLocation.isNotEmpty &&
                            activeLocation != 'Select Location' &&
                            activeLocation != 'All Locations') {
                          final locLower = activeLocation.toLowerCase();
                          final cityMatch = (turf.city ?? '')
                              .toLowerCase()
                              .contains(locLower);
                          final stateMatch = (turf.state ?? '')
                              .toLowerCase()
                              .contains(locLower);
                          final addressMatch = turf.address
                              .toLowerCase()
                              .contains(locLower);
                          matchesLocation =
                              cityMatch || stateMatch || addressMatch;
                        }

                        return matchesSearch && matchesSport && matchesLocation;
                      }).toList();

                      // If location filter resulted in empty list, fall back to showing all available turfs matching search & sport
                      if (filteredTurfs.isEmpty &&
                          !isUsingGps &&
                          activeLocation.isNotEmpty &&
                          activeLocation != 'Select Location' &&
                          activeLocation != 'All Locations') {
                        filteredTurfs = vm.turfs.where((turf) {
                          final matchesSearch =
                              searchQuery.isEmpty ||
                              turf.name.toLowerCase().contains(searchQuery) ||
                              turf.address.toLowerCase().contains(searchQuery);

                          final matchesSport =
                              selectedSport == 'All' ||
                              turf.sports.any(
                                (s) => s.toLowerCase().contains(
                                  selectedSport.toLowerCase(),
                                ),
                              ) ||
                              turf.amenities.any(
                                (a) => a.toLowerCase().contains(
                                  selectedSport.toLowerCase(),
                                ),
                              ) ||
                              (turf.description ?? '').toLowerCase().contains(
                                selectedSport.toLowerCase(),
                              );

                          return matchesSearch && matchesSport;
                        }).toList();
                      }

                      // If using GPS location, sort turfs by distance (closest first)
                      if (isUsingGps && vm.currentPosition.value != null) {
                        filteredTurfs.sort((a, b) {
                          final distA =
                              vm.getDistanceToTurf(a) ?? double.infinity;
                          final distB =
                              vm.getDistanceToTurf(b) ?? double.infinity;
                          return distA.compareTo(distB);
                        });
                      }

                      // Empty
                      if (filteredTurfs.isEmpty) {
                        return SizedBox(
                          height: 200.h,
                          child: Center(
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  Icons.sports_soccer_outlined,
                                  size: 48.sp,
                                  color: colors.textGrey,
                                ),
                                SizedBox(height: 12.h),
                                Text(
                                  'No turfs available for the selected filter.',
                                  style: textTheme.bodyMedium?.copyWith(
                                    color: colors.textGrey,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      }

                      // Cards
                      final columns = context.turfGridColumns;
                      return Padding(
                        padding: EdgeInsets.fromLTRB(
                          isTablet ? 20.w : 16.w,
                          4.h,
                          isTablet ? 20.w : 16.w,
                          24.h,
                        ),
                        child: columns > 1
                            ? GridView.builder(
                                shrinkWrap: true,
                                physics: const NeverScrollableScrollPhysics(),
                                gridDelegate:
                                    SliverGridDelegateWithFixedCrossAxisCount(
                                  crossAxisCount: columns,
                                  crossAxisSpacing: 16,
                                  mainAxisSpacing: 16,
                                  mainAxisExtent: 168,
                                ),
                                itemCount: filteredTurfs.length,
                                itemBuilder: (context, i) {
                                  final turf = filteredTurfs[i];
                                  return VenueCard(
                                    turf: turf,
                                    margin: EdgeInsets.zero,
                                    distanceKm: vm.getDistanceToTurf(turf),
                                    onBookNow: () => Get.to(
                                      () => TurfDetailsPage(turf: turf),
                                    ),
                                  );
                                },
                              )
                            : Column(
                                children: [
                                  for (final turf in filteredTurfs)
                                    Padding(
                                      padding: EdgeInsets.only(bottom: 12.h),
                                      child: VenueCard(
                                        turf: turf,
                                        distanceKm: vm.getDistanceToTurf(turf),
                                        onBookNow: () => Get.to(
                                          () => TurfDetailsPage(turf: turf),
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
        height: 46.h,
        width: 46.h,
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
        child: Icon(icon, color: colors.primary, size: 22.sp),
      ),
    );
  }
}
