import 'package:flutter/material.dart';

@immutable
class AppColors extends ThemeExtension<AppColors> {
  final Color textPrimary;
  final Color textSecondary;
  final Color textThird;
  final Color textMuted;
  final Color textHint;
  final Color textTitle;
  final Color textLabel;
  final Color textGrey;
  final Color textGrey2;

  final Color primary;

  final Color success;
  final Color warning;
  final Color error;
  final Color errorSoft;
  final Color info;

  final Color background;
  final Color surfacePrimary;
  final Color surfaceSecondary;
  final Color surfaceAlt;
  final Color divider;
  final Color borderSecondary;

  final Color outline;

  final Color successBg;
  final Color warningBg;
  final Color errorBg;
  final Color infoBg;
  final Color extractionSymptoms;
  final Color snackBarBackground;
  final Color surfaceSubtle;
  final Color primaryButton;
  final Color cheifComplaint;

  final Color shadow;

  final Color red50;
  final Color red100;
  final Color red200;
  final Color red600;
  final Color red800;

  final Color indigo50;
  final Color indigo100;
  final Color indigo200;
  final Color indigo600;
  final Color indigo800;

  final Color orange50;
  final Color orange100;
  final Color orange600;
  final Color orange800;

  final Color blue50;
  final Color blue100;
  final Color blue400;
  final Color blue800;

  final Color green50;
  final Color green100;
  final Color green600;
  final Color green800;

  final Color white;

  final Color verified;


  const AppColors({
    required this.textPrimary,
    required this.textSecondary,
    required this.textThird,
    required this.textMuted,
    required this.textHint,
    required this.textGrey,
    required this.textGrey2,
    required this.primary,
    required this.success,
    required this.warning,
    required this.error,
    required this.errorSoft,
    required this.info,
    required this.background,
    required this.surfacePrimary,
    required this.surfaceSecondary,
    required this.surfaceAlt,
    required this.divider,
    required this.borderSecondary,
    required this.outline,
    required this.successBg,
    required this.warningBg,
    required this.errorBg,
    required this.infoBg,
    required this.snackBarBackground,
    required this.surfaceSubtle,
    required this.textTitle,
    required this.textLabel,
    required this.primaryButton,
    required this.extractionSymptoms,
    required this.cheifComplaint,

    required this.shadow,

    required this.red50,
    required this.red100,
    required this.red200,
    required this.red600,
    required this.red800,

    required this.indigo50,
    required this.indigo100,
    required this.indigo200,
    required this.indigo600,
    required this.indigo800,

    required this.orange50,
    required this.orange100,
    required this.orange600,
    required this.orange800,

    required this.blue50,
    required this.blue100,
    required this.blue400,
    required this.blue800,

    required this.green50,
    required this.green100,
    required this.green600,
    required this.green800,

    required this.white,
    required this.verified
  });

  @override
  AppColors copyWith({
    Color? textPrimary,
    Color? textSecondary,
    Color? textThird,
    Color? textMuted,
    Color? textHint,
    Color? textGrey,
    Color? textGrey2,
    Color? primary,
    Color? success,
    Color? warning,
    Color? error,
    Color? errorSoft,
    Color? info,
    Color? background,
    Color? surfacePrimary,
    Color? surfaceSecondary,
    Color? surfaceAlt,
    Color? divider,
    Color? borderSecondary,
    Color? outline,
    Color? successBg,
    Color? warningBg,
    Color? errorBg,
    Color? infoBg,
    Color? snackBarBackground,
    Color? surfaceSubtle,
    Color? textTitle,
    Color? textLabel,
    Color? primaryButton,
    Color? extractionSymptoms,
    Color? cheifComplaint,

    Color? shadow,

    Color? red50,
    Color? red100,
    Color? red200,
    Color? red600,
    Color? red800,

    Color? indigo50,
    Color? indigo100,
    Color? indigo200,
    Color? indigo600,
    Color? indigo800,

    Color? orange50,
    Color? orange100,
    Color? orange600,
    Color? orange800,

    Color? blue50,
    Color? blue100,
    Color? blue400,
    Color? blue800,

    Color? green50,
    Color? green100,
    Color? green600,
    Color? green800,

    Color? white,
    Color? verified,
  }) {
    return AppColors(
      textPrimary: textPrimary ?? this.textPrimary,
      textSecondary: textSecondary ?? this.textSecondary,
      textThird: textThird ?? this.textThird,
      textMuted: textMuted ?? this.textMuted,
      textHint: textHint ?? this.textHint,
      textTitle: textTitle ?? this.textTitle,
      textLabel: textLabel ?? this.textLabel,
      textGrey: textGrey ?? this.textGrey,
      textGrey2: textGrey2 ?? this.textGrey2,
      primary: primary ?? this.primary,
      success: success ?? this.success,
      warning: warning ?? this.warning,
      error: error ?? this.error,
      errorSoft: errorSoft ?? this.errorSoft,
      info: info ?? this.info,
      background: background ?? this.background,
      surfacePrimary: surfacePrimary ?? this.surfacePrimary,
      surfaceSecondary: surfaceSecondary ?? this.surfaceSecondary,
      surfaceAlt: surfaceAlt ?? this.surfaceAlt,
      divider: divider ?? this.divider,
      borderSecondary: borderSecondary ?? this.borderSecondary,
      outline: outline ?? this.outline,
      successBg: successBg ?? this.successBg,
      warningBg: warningBg ?? this.warningBg,
      errorBg: errorBg ?? this.errorBg,
      infoBg: infoBg ?? this.infoBg,
      snackBarBackground: snackBarBackground ?? this.snackBarBackground,
      surfaceSubtle: surfaceSubtle ?? this.surfaceSubtle,
      primaryButton: primaryButton ?? this.primaryButton,
      extractionSymptoms: extractionSymptoms ?? this.extractionSymptoms,
      cheifComplaint: cheifComplaint ?? this.cheifComplaint,

      shadow: shadow ?? this.shadow,

      red50: red50 ?? this.red50,
      red100: red100 ?? this.red100,
      red200: red200 ?? this.red200,
      red600: red600 ?? this.red600,
      red800: red800 ?? this.red800,

      indigo50: indigo50 ?? this.indigo50,
      indigo100: indigo100 ?? this.indigo100,
      indigo200: indigo200 ?? this.indigo200,
      indigo600: indigo600 ?? this.indigo600,
      indigo800: indigo800 ?? this.indigo800,

      orange50: orange50 ?? this.orange50,
      orange100: orange100 ?? this.orange100,
      orange600: orange600 ?? this.orange600,
      orange800: orange800 ?? this.orange800,

      blue50: blue50 ?? this.blue50,
      blue100: blue100 ?? this.blue100,
      blue400: blue400 ?? this.blue400,
      blue800: blue800 ?? this.blue800,

      green50: green50 ?? this.green50,
      green100: green100 ?? this.green100,
      green600: green600 ?? this.green600,
      green800: green800 ?? this.green800,

      white: white ?? this.white,
      verified: verified ?? this.verified,
    );
  }

  @override
  AppColors lerp(ThemeExtension<AppColors>? other, double t) {
    if (other is! AppColors) return this;
    return AppColors(
      textPrimary: Color.lerp(textPrimary, other.textPrimary, t)!,
      textSecondary: Color.lerp(textSecondary, other.textSecondary, t)!,
      textThird: Color.lerp(textThird, other.textThird, t)!,
      textMuted: Color.lerp(textMuted, other.textMuted, t)!,
      textHint: Color.lerp(textHint, other.textHint, t)!,
      textTitle: Color.lerp(textTitle, other.textTitle, t)!,
      textLabel: Color.lerp(textLabel, other.textLabel, t)!,
      textGrey: Color.lerp(textGrey, other.textGrey, t)!,
      textGrey2: Color.lerp(textGrey2, other.textGrey2, t)!,
      primary: Color.lerp(primary, other.primary, t)!,
      success: Color.lerp(success, other.success, t)!,
      warning: Color.lerp(warning, other.warning, t)!,
      error: Color.lerp(error, other.error, t)!,
      errorSoft: Color.lerp(errorSoft, other.errorSoft, t)!,
      info: Color.lerp(info, other.info, t)!,
      background: Color.lerp(background, other.background, t)!,
      surfacePrimary: Color.lerp(surfacePrimary, other.surfacePrimary, t)!,
      surfaceSecondary: Color.lerp(
        surfaceSecondary,
        other.surfaceSecondary,
        t,
      )!,
      surfaceAlt: Color.lerp(surfaceAlt, other.surfaceAlt, t)!,
      divider: Color.lerp(divider, other.divider, t)!,
      borderSecondary: Color.lerp(borderSecondary, other.borderSecondary, t)!,
      outline: Color.lerp(outline, other.outline, t)!,
      successBg: Color.lerp(successBg, other.successBg, t)!,
      warningBg: Color.lerp(warningBg, other.warningBg, t)!,
      errorBg: Color.lerp(errorBg, other.errorBg, t)!,
      infoBg: Color.lerp(infoBg, other.infoBg, t)!,
      extractionSymptoms: Color.lerp(
        extractionSymptoms,
        other.extractionSymptoms,
        t,
      )!,
      snackBarBackground: Color.lerp(
        snackBarBackground,
        other.snackBarBackground,
        t,
      )!,
      surfaceSubtle: Color.lerp(surfaceSubtle, other.surfaceSubtle, t)!,
      primaryButton: Color.lerp(primaryButton, other.primaryButton, t)!,
      cheifComplaint: Color.lerp(cheifComplaint, other.cheifComplaint, t)!,

      shadow: Color.lerp(shadow, other.shadow, t)!,

      red50: Color.lerp(red50, other.red50, t)!,
      red100: Color.lerp(red100, other.red100, t)!,
      red200: Color.lerp(red200, other.red200, t)!,
      red600: Color.lerp(red600, other.red600, t)!,
      red800: Color.lerp(red800, other.red800, t)!,

      indigo50: Color.lerp(indigo50, other.indigo50, t)!,
      indigo100: Color.lerp(indigo100, other.indigo100, t)!,
      indigo200: Color.lerp(indigo200, other.indigo200, t)!,
      indigo600: Color.lerp(indigo600, other.indigo600, t)!,
      indigo800: Color.lerp(indigo800, other.indigo800, t)!,

      orange50: Color.lerp(orange50, other.orange50, t)!,
      orange100: Color.lerp(orange100, other.orange100, t)!,
      orange600: Color.lerp(orange600, other.orange600, t)!,
      orange800: Color.lerp(orange800, other.orange800, t)!,

      blue50: Color.lerp(blue50, other.blue50, t)!,
      blue100: Color.lerp(blue100, other.blue100, t)!,
      blue400: Color.lerp(blue400, other.blue400, t)!,
      blue800: Color.lerp(blue800, other.blue800, t)!,

      green50: Color.lerp(green50, other.green50, t)!,
      green100: Color.lerp(green100, other.green100, t)!,
      green600: Color.lerp(green600, other.green600, t)!,
      green800: Color.lerp(green800, other.green800, t)!,

      white: Color.lerp(white, other.white, t)!,
      verified: Color.lerp(verified, other.verified, t)!,
    );
  }
}
