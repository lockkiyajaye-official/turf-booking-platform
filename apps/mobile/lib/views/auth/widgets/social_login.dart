import 'package:flutter/material.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';

class SocialLogin extends StatelessWidget {
  final String text;
  final String asset;
  final VoidCallback? onTap;
  const SocialLogin({
    super.key,
    required this.text,
    required this.asset,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
      final colors = Theme.of(context).extension<AppColors>()!;
    final textTheme = Theme.of(context).textTheme;
    return Center(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          height: 50.h,
          padding: EdgeInsets.symmetric(horizontal: 24.w),
          decoration: BoxDecoration(
            color: colors.background,
            borderRadius: BorderRadius.circular(8.r),
            border: Border.all(color: Colors.grey.shade300, width: 1),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Image.asset(asset, height: 24.h, width: 24.w),
              SizedBox(width: 12.w),
              Text(
                text,
                style: textTheme.bodyMedium?.copyWith(
                  color: colors.textTitle,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
