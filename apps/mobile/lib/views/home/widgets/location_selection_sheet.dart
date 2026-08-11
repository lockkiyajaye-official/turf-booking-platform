import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/viewmodels/turf/turf_viewmodel.dart';

class LocationSelectionSheet extends StatefulWidget {
  const LocationSelectionSheet({super.key});

  @override
  State<LocationSelectionSheet> createState() => _LocationSelectionSheetState();
}

class _LocationSelectionSheetState extends State<LocationSelectionSheet> {
  final TextEditingController _searchController = TextEditingController();
  final TurfViewmodel _turfVm = Get.find<TurfViewmodel>();
  String _filterText = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    final textTheme = Theme.of(context).textTheme;

    // Extract unique cities & states from available turfs
    final Set<String> locationsSet = {'All Locations'};
    for (final turf in _turfVm.turfs) {
      if (turf.city != null && turf.city!.trim().isNotEmpty) {
        if (turf.state != null && turf.state!.trim().isNotEmpty && turf.city != turf.state) {
          locationsSet.add('${turf.city!.trim()}, ${turf.state!.trim()}');
        } else {
          locationsSet.add(turf.city!.trim());
        }
      } else if (turf.address.isNotEmpty) {
        // extract last segment or city-like word if available
        final parts = turf.address.split(',');
        if (parts.length > 1) {
          locationsSet.add(parts.last.trim());
        } else {
          locationsSet.add(turf.address.trim());
        }
      }
    }

    final locations = locationsSet.where((loc) {
      return loc.toLowerCase().contains(_filterText.toLowerCase());
    }).toList();

    return Material(
      color: colors.white,
      borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      clipBehavior: Clip.antiAlias,
      child: SizedBox(
        height: MediaQuery.of(context).size.height * 0.7,
        child: Column(
        children: [
          SizedBox(height: 12.h),
          // Drag handle
          Container(
            width: 40.w,
            height: 4.h,
            decoration: BoxDecoration(
              color: Colors.grey[300],
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          SizedBox(height: 16.h),

          // Header title
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 20.w),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Select Location',
                  style: textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: colors.textTitle,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded),
                  onPressed: () => Get.back(),
                ),
              ],
            ),
          ),

          SizedBox(height: 12.h),

          // Search Location
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 20.w),
            child: TextField(
              controller: _searchController,
              onChanged: (val) {
                setState(() {
                  _filterText = val.trim();
                });
              },
              decoration: InputDecoration(
                hintText: 'Search city or area...',
                prefixIcon: Icon(Icons.search_rounded, color: colors.primary),
                suffixIcon: _filterText.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear_rounded, size: 18),
                        onPressed: () {
                          _searchController.clear();
                          setState(() => _filterText = '');
                        },
                      )
                    : null,
                filled: true,
                fillColor: const Color(0xFFF7F7F9),
                contentPadding: EdgeInsets.symmetric(vertical: 12.h),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),

          SizedBox(height: 16.h),

          // Use Current Location Button
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 20.w),
            child: Obx(() {
              final isLoading = _turfVm.isLocationLoading.value;
              final isCurrent = _turfVm.isUsingCurrentLocation.value;

              return InkWell(
                onTap: isLoading
                    ? null
                    : () async {
                        await _turfVm.fetchAndSetCurrentLocation();
                        Get.back();
                      },
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 14.h),
                  decoration: BoxDecoration(
                    color: isCurrent
                        ? colors.primary.withValues(alpha: 0.1)
                        : const Color(0xFFF7F7F9),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isCurrent
                          ? colors.primary
                          : Colors.grey.withValues(alpha: 0.2),
                    ),
                  ),
                  child: Row(
                    children: [
                      isLoading
                          ? SizedBox(
                              width: 20.w,
                              height: 20.h,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: colors.primary,
                              ),
                            )
                          : Icon(
                              Icons.my_location_rounded,
                              color: colors.primary,
                              size: 22.sp,
                            ),
                      SizedBox(width: 14.w),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Use Current Location',
                              style: textTheme.bodyMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                                color: colors.primary,
                              ),
                            ),
                            SizedBox(height: 2.h),
                            Text(
                              isCurrent
                                  ? _turfVm.selectedLocationName.value
                                  : 'Using GPS to find nearby turfs',
                              style: textTheme.bodySmall?.copyWith(
                                color: colors.textGrey,
                              ),
                            ),
                          ],
                        ),
                      ),
                      if (isCurrent)
                        Icon(
                          Icons.check_circle_rounded,
                          color: colors.primary,
                          size: 20.sp,
                        ),
                    ],
                  ),
                ),
              );
            }),
          ),

          SizedBox(height: 16.h),
          const Divider(height: 1),

          // Available Cities / Locations List
          Expanded(
            child: Obx(() {
              final selectedName = _turfVm.selectedLocationName.value;

              return ListView.separated(
                padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 8.h),
                itemCount: locations.length,
                separatorBuilder: (context, index) => const Divider(height: 1),
                itemBuilder: (context, index) {
                  final locName = locations[index];
                  final isSelected =
                      !_turfVm.isUsingCurrentLocation.value &&
                      (selectedName == locName ||
                          (locName == 'All Locations' &&
                              (selectedName == 'Select Location' || selectedName == 'All Locations')));

                  return ListTile(
                    contentPadding: EdgeInsets.symmetric(vertical: 4.h),
                    leading: CircleAvatar(
                      backgroundColor: isSelected
                          ? colors.primary.withValues(alpha: 0.1)
                          : const Color(0xFFF2F2F7),
                      child: Icon(
                        locName == 'All Locations'
                            ? Icons.map_rounded
                            : Icons.location_city_rounded,
                        color: isSelected ? colors.primary : colors.textGrey,
                        size: 20.sp,
                      ),
                    ),
                    title: Text(
                      locName,
                      style: textTheme.bodyMedium?.copyWith(
                        fontWeight:
                            isSelected ? FontWeight.bold : FontWeight.w500,
                        color: isSelected ? colors.primary : colors.textTitle,
                      ),
                    ),
                    trailing: isSelected
                        ? Icon(
                            Icons.check_rounded,
                            color: colors.primary,
                            size: 20.sp,
                          )
                        : null,
                    onTap: () {
                      _turfVm.setSelectedCity(locName);
                      Get.back();
                    },
                  );
                },
              );
            }),
          ),
        ],
      ),
    ),
    );
  }
}
