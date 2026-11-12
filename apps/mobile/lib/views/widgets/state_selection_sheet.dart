import 'package:flutter/material.dart';
import 'package:mobile/core/constants/indian_states.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';

void showStateSelectionSheet(
  BuildContext context, {
  String? selectedState,
  required ValueChanged<String> onSelected,
}) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (_) => StateSelectionSheet(
      selectedState: selectedState,
      onSelected: onSelected,
    ),
  );
}

class StateSelectionSheet extends StatefulWidget {
  final String? selectedState;
  final ValueChanged<String> onSelected;
  final List<String>? states;

  const StateSelectionSheet({
    super.key,
    this.selectedState,
    required this.onSelected,
    this.states,
  });

  @override
  State<StateSelectionSheet> createState() => _StateSelectionSheetState();
}

class _StateSelectionSheetState extends State<StateSelectionSheet> {
  final TextEditingController _searchController = TextEditingController();
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

    final allStates = widget.states ?? kIndianStates;
    final List<String> listToFilter = [
      if (widget.selectedState != null &&
          widget.selectedState!.trim().isNotEmpty &&
          !allStates.contains(widget.selectedState!.trim()))
        widget.selectedState!.trim(),
      ...allStates,
    ];

    final filtered = listToFilter.where((st) {
      if (_filterText.isEmpty) return true;
      return st.toLowerCase().contains(_filterText.toLowerCase());
    }).toList();

    return SafeArea(
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () => Navigator.of(context).pop(),
        child: Padding(
          padding: EdgeInsets.only(
            left: 20.w,
            right: 20.w,
            bottom: 20.h + MediaQuery.of(context).viewInsets.bottom,
            top: 20.h,
          ),
          child: Center(
            child: GestureDetector(
              behavior: HitTestBehavior.opaque,
              onTap: () {}, // Prevent taps inside modal card from dismissing
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 480),
                child: Material(
                  color: colors.white,
                  borderRadius: BorderRadius.circular(24),
                  clipBehavior: Clip.antiAlias,
                  elevation: 10,
                  shadowColor: Colors.black.withValues(alpha: 0.2),
                  child: SizedBox(
                    height: MediaQuery.of(context).size.height * 0.72,
                    child: Column(
                      children: [
                        SizedBox(height: 18.h),

                        // Header Title
                        Padding(
                          padding: EdgeInsets.symmetric(horizontal: 20.w),
                          child: Row(
                            children: [
                      Container(
                        padding: EdgeInsets.all(8.w),
                        decoration: BoxDecoration(
                          color: colors.primary.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Icon(
                          Icons.map_outlined,
                          color: colors.primary,
                          size: 20.sp,
                        ),
                      ),
                      SizedBox(width: 12.w),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Select State',
                              style: textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                                color: colors.textTitle,
                              ),
                            ),
                            Text(
                              'Choose your state or union territory',
                              style: textTheme.bodySmall?.copyWith(
                                color: colors.textGrey,
                              ),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close_rounded),
                        onPressed: () => Navigator.pop(context),
                      ),
                    ],
                  ),
                ),

                SizedBox(height: 14.h),

                // Search Bar at the Top
                Padding(
                  padding: EdgeInsets.symmetric(horizontal: 20.w),
                  child: TextField(
                    controller: _searchController,
                    onChanged: (val) {
                      setState(() {
                        _filterText = val.trim();
                      });
                    },
                    style: textTheme.bodyMedium?.copyWith(
                      color: colors.textTitle,
                      fontWeight: FontWeight.w500,
                    ),
                    decoration: InputDecoration(
                      hintText: 'Search state or union territory...',
                      hintStyle: textTheme.bodySmall?.copyWith(
                        color: colors.textGrey,
                      ),
                      prefixIcon: Icon(
                        Icons.search_rounded,
                        color: colors.primary,
                        size: 22,
                      ),
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
                      contentPadding: EdgeInsets.symmetric(
                        vertical: 12.h,
                        horizontal: 14.w,
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFFE8E8E8)),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFFE8E8E8)),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: colors.primary, width: 1.5),
                      ),
                    ),
                  ),
                ),

                SizedBox(height: 12.h),
                const Divider(height: 1, color: Color(0xFFF0F0F0)),

                // States List
                Expanded(
                  child: filtered.isEmpty
                      ? Center(
                          child: Padding(
                            padding: EdgeInsets.symmetric(horizontal: 28.w),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.search_off_rounded,
                                  size: 48.sp,
                                  color: colors.textGrey.withValues(alpha: 0.5),
                                ),
                                SizedBox(height: 12.h),
                                Text(
                                  'No states found',
                                  style: textTheme.titleSmall?.copyWith(
                                    fontWeight: FontWeight.bold,
                                    color: colors.textTitle,
                                  ),
                                ),
                                SizedBox(height: 4.h),
                                Text(
                                  'No states or union territories match "$_filterText"',
                                  textAlign: TextAlign.center,
                                  style: textTheme.bodySmall?.copyWith(
                                    color: colors.textGrey,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        )
                      : ListView.separated(
                          padding: EdgeInsets.symmetric(
                            horizontal: 16.w,
                            vertical: 8.h,
                          ),
                          itemCount: filtered.length,
                          separatorBuilder: (_, __) =>
                              const Divider(height: 1, color: Color(0xFFF5F5F7)),
                          itemBuilder: (context, i) {
                            final stateName = filtered[i];
                            final isSelected = widget.selectedState != null &&
                                widget.selectedState!.trim().toLowerCase() ==
                                    stateName.trim().toLowerCase();

                            return ListTile(
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                              tileColor: isSelected
                                  ? colors.primary.withValues(alpha: 0.08)
                                  : Colors.transparent,
                              contentPadding: EdgeInsets.symmetric(
                                horizontal: 12.w,
                                vertical: 2.h,
                              ),
                              leading: CircleAvatar(
                                radius: 18.w,
                                backgroundColor: isSelected
                                    ? colors.primary.withValues(alpha: 0.15)
                                    : const Color(0xFFF2F2F7),
                                child: Icon(
                                  Icons.location_on_rounded,
                                  color: isSelected
                                      ? colors.primary
                                      : colors.textGrey,
                                  size: 18.sp,
                                ),
                              ),
                              title: Text(
                                stateName,
                                style: textTheme.bodyMedium?.copyWith(
                                  fontWeight: isSelected
                                      ? FontWeight.bold
                                      : FontWeight.w500,
                                  color: isSelected
                                      ? colors.primary
                                      : colors.textTitle,
                                ),
                              ),
                              trailing: isSelected
                                  ? Icon(
                                      Icons.check_circle_rounded,
                                      color: colors.primary,
                                      size: 22.sp,
                                    )
                                  : Icon(
                                      Icons.arrow_forward_ios_rounded,
                                      size: 14.sp,
                                      color: Colors.grey.shade300,
                                    ),
                              onTap: () {
                                widget.onSelected(stateName);
                                Navigator.pop(context);
                              },
                            );
                          },
                        ),
                ),
              ],
            ),
          ),
        ),
      ),
    ),
  ),
),
),
);
  }
}

