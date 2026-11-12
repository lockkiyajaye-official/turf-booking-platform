import 'package:flutter/material.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/views/widgets/loading_spinner.dart';

class SocialLogin extends StatelessWidget {
  final String text;
  final String? asset;
  final IconData? icon;
  final VoidCallback? onTap;
  final bool isLoading;
  final String? loadingText;
  final Color? backgroundColor;
  final Color? textColor;
  final Color? iconColor;
  final Color? borderColor;
  final double? width;

  const SocialLogin({
    super.key,
    required this.text,
    this.asset,
    this.icon,
    this.onTap,
    this.isLoading = false,
    this.loadingText = "Signing in...",
    this.backgroundColor,
    this.textColor,
    this.iconColor,
    this.borderColor,
    this.width,
  }) : assert(
         asset != null || icon != null,
         'Either asset or icon must be provided',
       );

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    final textTheme = Theme.of(context).textTheme;
    return Center(
      child: GestureDetector(
        onTap: isLoading ? null : onTap,
        child: Container(
          width: width,
          height: 50.h,
          padding: EdgeInsets.symmetric(horizontal: 24.w),
          decoration: BoxDecoration(
            color: backgroundColor ?? colors.background,
            borderRadius: BorderRadius.circular(8.r),
            border: Border.all(
              color: borderColor ?? Colors.grey.shade300,
              width: 1,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.05),
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: isLoading
              ? LoadingSpinner(
                  size: 20.h,
                  strokeWidth: 2.2,
                  color: textColor ?? colors.textTitle,
                  text: loadingText,
                  textStyle: textTheme.bodyMedium?.copyWith(
                    color: textColor ?? colors.textTitle,
                    fontWeight: FontWeight.w500,
                  ),
                  spacing: 12.w,
                )
              : Row(
                  mainAxisSize: width == null
                      ? MainAxisSize.min
                      : MainAxisSize.max,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    if (asset != null)
                      Image.asset(asset!, height: 24.h, width: 24.w)
                    else if (icon != null)
                      Icon(
                        icon,
                        size: 24.h,
                        color: iconColor ?? colors.textTitle,
                      ),
                    SizedBox(width: 12.w),
                    Text(
                      text,
                      style: textTheme.bodyMedium?.copyWith(
                        color: textColor ?? colors.textTitle,
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
