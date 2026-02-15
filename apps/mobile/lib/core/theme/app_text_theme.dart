import 'package:flutter/material.dart';
import 'package:mobile/core/theme/app_font_size.dart';

class AppTextTheme {
  static TextTheme base = TextTheme(
    displayLarge: TextStyle(
      fontFamily: 'Manrope',
      fontWeight: FontWeight.w800,
      fontSize: AppFontSizes.displayMd,
      height: 45 / 36,
      letterSpacing: -0.9,
    ),
    // Greeting heading
    headlineMedium: TextStyle(
      fontFamily: 'Manrope',
      fontWeight: FontWeight.w700,
      fontSize: AppFontSizes.xxl, // 26.sp
      height: 32.5 / 26,
      letterSpacing: -0.65,
    ),

    headlineSmall: TextStyle(
      fontFamily: 'Manrope',
      fontWeight: FontWeight.w700,
      fontSize: AppFontSizes.xl2, // 24.sp
      height: 32 / 24, // = ~1.3333
      letterSpacing: 0,
    ),

    // Patient name
    titleMedium: TextStyle(
      fontFamily: 'Manrope',
      fontWeight: FontWeight.w700,
      fontSize: AppFontSizes.lg, // 18.sp
      height: 22.5 / 18,
    ),
    //app title
    titleLarge: TextStyle(
      fontFamily: 'Manrope',
      fontWeight: FontWeight.w700,
      fontSize: AppFontSizes.xl, // 20.sp
      height: 28 / 20, // = 1.4
      letterSpacing: -0.5,
    ),

    headlineLarge: TextStyle(
      fontFamily: 'Manrope',
      fontWeight: FontWeight.w800,
      fontSize: AppFontSizes.xxxl, //30
      height: 36 / 30,
      letterSpacing: -0.75,
    ),

    // Patient subtitle
    bodySmall: TextStyle(
      fontFamily: 'Manrope',
      fontWeight: FontWeight.w500,
      fontSize: AppFontSizes.sm, // 14.sp
      height: 20 / 14,
    ),

    // PRIMARY BUTTON / ACTION TEXT
    labelMedium: TextStyle(
      fontFamily: 'Manrope',
      fontWeight: FontWeight.w700,
      fontSize: AppFontSizes.md, // 16
      height: 24 / 16,
    ),

    // Action text (View Details)
    labelLarge: TextStyle(
      fontFamily: 'Manrope',
      fontWeight: FontWeight.w600,
      fontSize: AppFontSizes.sm, // 14.sp
      height: 20 / 14,
    ),

    // Status text
    labelSmall: TextStyle(
      fontFamily: 'Manrope',
      fontWeight: FontWeight.w700,
      fontSize: AppFontSizes.xs, // 12.sp
      height: 16 / 12,
      letterSpacing: 0.3,
    ),

    displaySmall: TextStyle(
      fontFamily: 'Manrope',
      fontWeight: FontWeight.w400,
      fontSize: AppFontSizes.xs, //12.sp
      height: 18 / 12, // = 1.5
      letterSpacing: 0,
    ),

    // Progress count
    bodyMedium: TextStyle(
      fontFamily: 'Manrope',
      fontWeight: FontWeight.w700,
      fontSize: AppFontSizes.sm, // 14.sp
      height: 21 / 14,
    ),

    bodyLarge: TextStyle(
      fontFamily: 'Manrope',
      fontWeight: FontWeight.w500,
      fontSize: AppFontSizes.md, // 16
      height: 24 / 16,
    ),
    titleSmall: TextStyle(
      fontFamily: 'Manrope',
      fontWeight: FontWeight.w300,
      fontSize: AppFontSizes.xxs,
      height: 1.0, // 100%
      letterSpacing: 0,
    ),
  );
}
