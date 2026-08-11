import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/viewmodels/turf/turf_viewmodel.dart';
import 'package:mobile/views/booking/booking_details_page.dart';
import 'package:mobile/views/home/widgets/booking_card.dart';

class AllTurfsPage extends StatefulWidget {
  const AllTurfsPage({super.key});

  @override
  State<AllTurfsPage> createState() => _AllTurfsPageState();
}

class _AllTurfsPageState extends State<AllTurfsPage> {
  final TextEditingController _searchController = TextEditingController();
  final TurfViewmodel _turfVm = Get.find<TurfViewmodel>();

  final List<String> _filters = [
    'All',
    'Football',
    'Cricket',
    'Basketball',
    'Badminton',
  ];
  int _selectedFilter = 0;
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _turfVm.fetchAllTurfs();
    });
  }

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
      appBar: AppBar(
        backgroundColor: colors.background,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded, color: colors.textTitle, size: 20.sp),
          onPressed: () => Get.back(),
        ),
        title: Text(
          'All Venues',
          style: textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
            color: colors.textTitle,
          ),
        ),
        centerTitle: true,
      ),
      body: Column(
        children: [
          // ── Search & Filter Section ──────────────────────────────
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
            child: Container(
              height: 48.h,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: colors.textGrey.withOpacity(0.15),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.04),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: TextField(
                controller: _searchController,
                onChanged: (val) {
                  setState(() {
                    _searchQuery = val.trim().toLowerCase();
                  });
                },
                decoration: InputDecoration(
                  hintText: 'Search by venue name or location...',
                  hintStyle: textTheme.bodyMedium?.copyWith(
                    color: colors.textGrey.withValues(alpha: 0.6),
                  ),
                  prefixIcon: Icon(Icons.search_rounded, color: colors.primary),
                  suffixIcon: _searchQuery.isNotEmpty
                      ? IconButton(
                          icon: Icon(Icons.clear_rounded, color: colors.textGrey),
                          onPressed: () {
                            _searchController.clear();
                            setState(() {
                              _searchQuery = '';
                            });
                          },
                        )
                      : null,
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.symmetric(vertical: 12.h),
                ),
              ),
            ),
          ),

          // ── Sport Category Filter Chips ────────────────────────
          SizedBox(
            height: 44.h,
            child: ListView.separated(
              padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 4.h),
              scrollDirection: Axis.horizontal,
              itemCount: _filters.length,
              separatorBuilder: (_, __) => SizedBox(width: 8.w),
              itemBuilder: (context, index) {
                final isSelected = _selectedFilter == index;
                return ChoiceChip(
                  label: Text(_filters[index]),
                  selected: isSelected,
                  onSelected: (selected) {
                    if (selected) {
                      setState(() {
                        _selectedFilter = index;
                      });
                    }
                  },
                  selectedColor: const Color(0xFFE43434),
                  backgroundColor: colors.background,
                  labelStyle: TextStyle(
                    color: isSelected ? Colors.white : colors.textGrey,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                    fontSize: 13.sp,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                    side: BorderSide(
                      color: isSelected
                          ? const Color(0xFFE43434)
                          : colors.textGrey.withOpacity(0.2),
                    ),
                  ),
                  showCheckmark: false,
                );
              },
            ),
          ),

          SizedBox(height: 8.h),

          // ── Turfs List ──────────────────────────────────────────
          Expanded(
            child: Obx(() {
              if (_turfVm.isLoading.value && _turfVm.turfs.isEmpty) {
                return Center(
                  child: CircularProgressIndicator(color: colors.primary),
                );
              }

              // Filter list by sport category and search query
              final selectedSport = _filters[_selectedFilter];
              final filteredTurfs = _turfVm.turfs.where((turf) {
                final matchesSearch = _searchQuery.isEmpty ||
                    turf.name.toLowerCase().contains(_searchQuery) ||
                    turf.address.toLowerCase().contains(_searchQuery);

                final matchesSport = selectedSport == 'All' ||
                    turf.sports.any((s) =>
                        s.toLowerCase().contains(selectedSport.toLowerCase())) ||
                    turf.amenities.any((a) =>
                        a.toLowerCase().contains(selectedSport.toLowerCase())) ||
                    (turf.description ?? '')
                        .toLowerCase()
                        .contains(selectedSport.toLowerCase());

                return matchesSearch && matchesSport;
              }).toList();

              if (filteredTurfs.isEmpty) {
                return RefreshIndicator(
                  color: colors.primary,
                  onRefresh: () => _turfVm.fetchAllTurfs(),
                  child: ListView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    children: [
                      SizedBox(height: 100.h),
                      Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.sports_soccer_outlined,
                              size: 56.sp,
                              color: colors.textGrey.withOpacity(0.5),
                            ),
                            SizedBox(height: 12.h),
                            Text(
                              'No venues found',
                              style: textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                                color: colors.textTitle,
                              ),
                            ),
                            SizedBox(height: 4.h),
                            Text(
                              'Try adjusting your search or sport filter',
                              style: textTheme.bodySmall?.copyWith(
                                color: colors.textGrey,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              }

              return RefreshIndicator(
                color: colors.primary,
                onRefresh: () => _turfVm.fetchAllTurfs(),
                child: ListView.builder(
                  padding: EdgeInsets.fromLTRB(16.w, 4.h, 16.w, 24.h),
                  itemCount: filteredTurfs.length,
                  itemBuilder: (context, index) {
                    final turf = filteredTurfs[index];
                    return Padding(
                      padding: EdgeInsets.only(bottom: 12.h),
                      child: VenueCard(
                        turf: turf,
                        onBookNow: () => Get.to(
                          () => TurfDetailsPage(turf: turf),
                        ),
                      ),
                    );
                  },
                ),
              );
            }),
          ),
        ],
      ),
    );
  }
}
