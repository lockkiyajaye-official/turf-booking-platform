import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/core/theme/text_style.dart';

class MyTextField extends StatelessWidget {
  final double height;
  final double? width; // Made optional — uses parent constraints when null
  final TextInputType type;
  final Color fillColor;
  final String hintText;
  final TextEditingController? controller;
  final bool obscureText;
  final String? Function(String?)? validator;
  final List<TextInputFormatter>? inputFormatters;
  final Widget? prefixIcon;
  final Widget? suffixIcon;
  final FocusNode? focusNode;
  final Function(String)? onChanged;
  final bool showSearchIcon;
  final TextStyle? hintStyle;
  final Color? borderColor; // Added to support custom border color
  final bool readOnly; // Added for tap-only fields
  final VoidCallback? onTap; // Added for tap callbacks

  const MyTextField({
    super.key,
    required this.height,
    this.width, // No longer required
    required this.type,
    required this.fillColor,
    required this.hintText,
    this.controller,
    this.obscureText = false,
    this.validator,
    this.prefixIcon,
    this.suffixIcon,
    this.focusNode,
    this.onChanged,
    this.hintStyle,
    this.inputFormatters,
    this.showSearchIcon = false,
    this.borderColor, // New
    this.readOnly = false, // New
    this.onTap, // New
  });

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;

    final effectiveBorderColor =
        borderColor ?? colors.textMuted.withOpacity(0.5);

    return SizedBox(
      height: height,
      width: width, // null = expands to fill parent (Expanded/Row)
      child: TextFormField(
        style: AppTextStyles.manrope(
          fontSize: 16,
          fontWeight: FontWeight.w500,
          color: colors.textPrimary,
        ),
        controller: controller,
        focusNode: focusNode,
        inputFormatters: inputFormatters,
        keyboardType: type,
        obscureText: obscureText,
        validator: validator,
        onChanged: onChanged,
        readOnly: readOnly,
        onTap: onTap,
        maxLength: type == TextInputType.number ? 1 : null,
        decoration: InputDecoration(
          counterText: "",
          hintText: hintText,
          hintStyle:
              hintStyle ??
              TextStyle(
                color: colors.textMuted.withOpacity(0.5),
                fontSize: 16,
              ),
          filled: true,
          fillColor: fillColor,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 14,
          ),
          prefixIcon: showSearchIcon
              ? Icon(Icons.search, color: colors.textMuted)
              : prefixIcon,
          suffixIcon: suffixIcon,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: BorderSide(color: effectiveBorderColor),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: BorderSide(color: effectiveBorderColor),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: Colors.blue, width: 2),
          ),
          errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: BorderSide(color: colors.error ?? Colors.red),
          ),
          focusedErrorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide:
                BorderSide(color: colors.error ?? Colors.red, width: 2),
          ),
        ),
      ),
    );
  }
}