import 'package:flutter/material.dart';
import 'app_colors.dart';

class AppColorSchemes {
  AppColorSchemes._(); // no instance

  ///Light theme colors
  static const AppColors light = AppColors(
    textPrimary: Color.fromRGBO(17, 20, 24, 1),
    textSecondary: Color.fromRGBO(97, 114, 137, 1),
    textThird: Color.fromRGBO(255, 255, 255, 1),
    textMuted: Color.fromRGBO(156, 163, 175, 1),
    textHint: Color.fromRGBO(154, 166, 183, 1),
    textTitle: Color.fromRGBO(15, 23, 42, 1),
    textLabel: Color.fromRGBO(51, 65, 85, 1),
    textGrey: Color.fromRGBO(140, 140, 140, 1),
    textGrey2: Color.fromRGBO(103, 103, 103, 1),

    primary: Color.fromRGBO(236, 33, 86, 1),

    success: Color.fromRGBO(22, 163, 74, 1),
    warning: Color.fromRGBO(245, 158, 11, 1),
    error: Color.fromRGBO(220, 38, 38, 1),
    errorSoft: Color.fromRGBO(254, 242, 242, 0.5),
    info: Color.fromRGBO(37, 99, 235, 1),

    background: Color.fromRGBO(255, 255, 255, 1),
    surfacePrimary: Color.fromRGBO(246, 247, 248, 1),
    surfaceSecondary: Color.fromRGBO(255, 255, 255, 1),

    surfaceAlt: Color.fromRGBO(249, 250, 251, 1),
    divider: Color.fromRGBO(229, 231, 235, 1),
    borderSecondary: Color.fromRGBO(241, 245, 249, 1),
    outline: Color.fromRGBO(219, 224, 230, 1),

    successBg: Color.fromRGBO(231, 246, 237, 1),
    warningBg: Color.fromRGBO(255, 247, 230, 1),
    errorBg: Color.fromRGBO(253, 236, 236, 1),
    infoBg: Color.fromRGBO(239, 246, 255, 1),
    extractionSymptoms: Color.fromRGBO(255, 247, 237, 1),
    snackBarBackground: Color.fromRGBO(17, 20, 24, 1),
    surfaceSubtle: Color.fromRGBO(243, 244, 246, 1),
    primaryButton: Color.fromRGBO(17, 20, 24, 1),
    cheifComplaint: Color.fromRGBO(254, 242, 242, 1),

    shadow: Color.fromRGBO(0, 0, 0, 0.05),

    // 🔴 RED palette
    red50: Color.fromRGBO(255, 241, 242, 1),
    red100: Color.fromRGBO(255, 228, 230, 1),
    red200: Color.fromRGBO(254, 205, 211, 1),
    red600: Color.fromRGBO(225, 29, 72, 1),
    red800: Color.fromRGBO(159, 18, 57, 1),

    // 🔵 INDIGO palette
    indigo50: Color.fromRGBO(238, 242, 255, 1),
    indigo100: Color.fromRGBO(224, 231, 255, 1),
    indigo200: Color.fromRGBO(199, 210, 254, 1),
    indigo600: Color.fromRGBO(79, 70, 229, 1),
    indigo800: Color.fromRGBO(55, 48, 163, 1),

    // 🟠 ORANGE palette
    orange50: Color.fromRGBO(255, 247, 237, 1),
    orange100: Color.fromRGBO(255, 237, 213, 1),
    orange600: Color.fromRGBO(234, 88, 12, 1),
    orange800: Color.fromRGBO(154, 52, 18, 1),

    // 🟦 BLUE palette
    blue50: Color.fromRGBO(239, 246, 255, 1),
    blue100: Color.fromRGBO(219, 234, 254, 1),
    blue400: Color.fromRGBO(96, 165, 250, 1),
    blue800: Color.fromRGBO(30, 58, 138, 1),

    // 🟢 GREEN palette
    green50: Color.fromRGBO(236, 253, 245, 1),
    green100: Color.fromRGBO(209, 250, 229, 1),
    green600: Color.fromRGBO(5, 150, 105, 1),
    green800: Color.fromRGBO(6, 78, 59, 1),

    white: Colors.white,
    verified: Color.fromRGBO(16, 185, 129, 1),
  );

  /// Dark theme colors
  static const AppColors dark = AppColors(
    textPrimary: Color.fromRGBO(229, 231, 235, 1),
    textSecondary: Color.fromRGBO(156, 163, 175, 1),
    textThird: Color.fromRGBO(255, 255, 255, 1),
    textMuted: Color.fromRGBO(107, 114, 128, 1),
    textHint: Color.fromRGBO(107, 114, 128, 1),
    textTitle: Color.fromRGBO(15, 23, 42, 1),
    textLabel: Color.fromRGBO(51, 65, 85, 1),
    textGrey: Color.fromRGBO(127, 127, 127, 1),
    textGrey2: Color.fromRGBO(103, 103, 103, 1),

    primary: Color.fromRGBO(236, 33, 86, 1),

    success: Color.fromRGBO(74, 222, 128, 1),
    warning: Color.fromRGBO(251, 191, 36, 1),
    error: Color.fromRGBO(248, 113, 113, 1),
    errorSoft: Color.fromRGBO(254, 242, 242, 0.5),
    info: Color.fromRGBO(96, 165, 250, 1),

    background: Color.fromRGBO(11, 15, 20, 1),
    surfacePrimary: Color.fromRGBO(17, 24, 39, 1),
    surfaceSecondary: Color.fromRGBO(255, 255, 255, 1),
    surfaceAlt: Color.fromRGBO(249, 250, 251, 1),
    divider: Color.fromRGBO(31, 41, 55, 1),
    borderSecondary: Color.fromRGBO(241, 245, 249, 1),
    outline: Color.fromRGBO(219, 224, 230, 1),

    successBg: Color.fromRGBO(5, 46, 22, 1),
    warningBg: Color.fromRGBO(58, 42, 0, 1),
    errorBg: Color.fromRGBO(63, 29, 29, 1),
    infoBg: Color.fromRGBO(10, 26, 51, 1),
    extractionSymptoms: Color.fromRGBO(31, 19, 11, 1),
    cheifComplaint: Color.fromRGBO(254, 242, 242, 1),

    snackBarBackground: Color.fromRGBO(17, 20, 24, 1),
    surfaceSubtle: Color.fromRGBO(243, 244, 246, 1),
    primaryButton: Color.fromRGBO(17, 20, 24, 1),

    shadow: Color.fromRGBO(0, 0, 0, 0.05),

    // 🔴 RED palette
    red50: Color.fromRGBO(255, 241, 242, 1),
    red100: Color.fromRGBO(255, 228, 230, 1),
    red200: Color.fromRGBO(254, 205, 211, 1),
    red600: Color.fromRGBO(225, 29, 72, 1),
    red800: Color.fromRGBO(159, 18, 57, 1),

    // 🔵 INDIGO palette
    indigo50: Color.fromRGBO(238, 242, 255, 1),
    indigo100: Color.fromRGBO(224, 231, 255, 1),
    indigo200: Color.fromRGBO(199, 210, 254, 1),
    indigo600: Color.fromRGBO(79, 70, 229, 1),
    indigo800: Color.fromRGBO(55, 48, 163, 1),

    // 🟠 ORANGE palette
    orange50: Color.fromRGBO(255, 247, 237, 1),
    orange100: Color.fromRGBO(255, 237, 213, 1),
    orange600: Color.fromRGBO(234, 88, 12, 1),
    orange800: Color.fromRGBO(154, 52, 18, 1),

    // 🟦 BLUE palette
    blue50: Color.fromRGBO(239, 246, 255, 1),
    blue100: Color.fromRGBO(219, 234, 254, 1),
    blue400: Color.fromRGBO(96, 165, 250, 1),
    blue800: Color.fromRGBO(30, 58, 138, 1),

    // 🟢 GREEN palette
    green50: Color.fromRGBO(236, 253, 245, 1),
    green100: Color.fromRGBO(209, 250, 229, 1),
    green600: Color.fromRGBO(5, 150, 105, 1),
    green800: Color.fromRGBO(6, 78, 59, 1),

    white: Colors.white,
    verified: Color.fromRGBO(16, 185, 129, 1),
  );
}
