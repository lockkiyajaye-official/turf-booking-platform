import 'package:dot_loader/dot_loader.dart';
import 'package:flutter/material.dart';
import 'package:mobile/core/theme/app_colors.dart';

class MyButtons extends StatelessWidget {
  final String text;
  final double height;
  final double width;
  final VoidCallback? onTap;
  final TextStyle? textStyle;
  final Color backgroundColor;
  final Widget? prefix;
  final Widget? suffix;
  final bool isLoading;

  const MyButtons({
    super.key,
    required this.text,
    required this.height,
    required this.width,
    required this.onTap,
    required this.textStyle,
    required this.backgroundColor,
    this.prefix,
    this.suffix,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    
    return SizedBox(
      height: height,
      width: width,
      child: ElevatedButton(
        onPressed: isLoading ? null : onTap,
        style: ElevatedButton.styleFrom(
          backgroundColor: backgroundColor,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          elevation: 0,
          disabledBackgroundColor: backgroundColor,
        ),
        child: isLoading
            ? SizedBox(
                height: 21,
                child: DotedLoader(
                  count: 4,
                  color: textStyle?.color ?? Colors.white,
                ),
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (prefix != null) ...[prefix!, const SizedBox(width: 8)],
                  Text(text, style: textStyle, textAlign: TextAlign.center),
                  if (suffix != null) ...[const SizedBox(width: 8), suffix!],
                ],
              ),
      ),
    );
  }
}

class MyOutlinedButton extends StatelessWidget {
  final String text;
  final VoidCallback? onTap;
  final Widget? prefix;
  final Widget? suffix;
  final bool showBorder;
  final double? height;
  final double? width;
  final TextStyle? textStyle;
  final Color? borderColor;
  final Color? textColor;
  final double borderRadius;
  final double borderWidth;
  final EdgeInsetsGeometry? padding;
  final bool isLoading;

  const MyOutlinedButton({
    super.key,
    required this.text,
    this.onTap,
    this.prefix,
    this.suffix,
    this.showBorder = true,
    this.height,
    this.width,
    this.textStyle,
    this.borderColor,
    this.textColor,
    this.borderRadius = 12,
    this.borderWidth = 1.8,
    this.padding,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    final effectiveBorderColor = borderColor ?? colors.primary;
    final effectiveTextColor = textColor ?? colors.primary;

    return SizedBox(
      height: height ?? 52,
      width: width ?? double.infinity,
      child: OutlinedButton(
        onPressed: isLoading ? null : onTap,
        style: OutlinedButton.styleFrom(
          side: showBorder
              ? BorderSide(color: effectiveBorderColor, width: borderWidth)
              : BorderSide.none,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(borderRadius),
          ),
          padding: padding ?? const EdgeInsets.symmetric(horizontal: 24),
          backgroundColor: Colors.transparent,
          foregroundColor: effectiveTextColor,
        ),
        child: isLoading
            ? SizedBox(
                height: 21,
                child: DotedLoader(
                  count: 4,
                  color: effectiveTextColor,
                ),
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (prefix != null) ...[prefix!, const SizedBox(width: 10)],
                  Text(
                    text,
                    style:
                        textStyle ??
                        Theme.of(context).textTheme.bodyLarge?.copyWith(
                          color: effectiveTextColor,
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                  if (suffix != null) ...[const SizedBox(width: 10), suffix!],
                ],
              ),
      ),
    );
  }
}