import 'package:flutter/material.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';

class FilterChip extends StatelessWidget {
  final String label;
  final AppColors colors;
  final TextTheme textTheme;

  const FilterChip({
    super.key,
    required this.label,
    required this.colors,
    required this.textTheme,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 32.h,
      padding: EdgeInsets.symmetric(horizontal: 14.w),
      decoration: BoxDecoration(
        color: colors.primary,
        border: Border.all(width: 1, color: const Color(0xFFE8E8E8)),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Center(
        child: Text(
          label,
          style: textTheme.bodyMedium?.copyWith(color: colors.white),
        ),
      ),
    );
  }
}
