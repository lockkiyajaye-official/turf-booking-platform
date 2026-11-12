import 'package:flutter/material.dart';
import 'package:mobile/core/theme/app_colors.dart';

class LoadingSpinner extends StatelessWidget {
  final double size;
  final double strokeWidth;
  final Color? color;
  final String? text;
  final TextStyle? textStyle;
  final double spacing;

  const LoadingSpinner({
    super.key,
    this.size = 20.0,
    this.strokeWidth = 2.5,
    this.color,
    this.text,
    this.textStyle,
    this.spacing = 10.0,
  });

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>();
    final effectiveColor =
        color ?? colors?.primary ?? Theme.of(context).primaryColor;

    final spinner = SizedBox(
      height: size,
      width: size,
      child: CircularProgressIndicator(
        strokeWidth: strokeWidth,
        strokeCap: StrokeCap.round,
        valueColor: AlwaysStoppedAnimation<Color>(effectiveColor),
      ),
    );

    if (text == null || text!.isEmpty) {
      return Center(child: spinner);
    }

    return Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        spinner,
        SizedBox(width: spacing),
        Text(
          text!,
          style:
              textStyle ??
              TextStyle(
                color: effectiveColor,
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
        ),
      ],
    );
  }
}
