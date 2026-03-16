import 'package:flutter/material.dart';

import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_color_schemas.dart';
import 'package:mobile/core/theme/app_text_theme.dart';

/// Light theme configuration for the application
final ThemeData lightTheme = ThemeData(
  brightness: Brightness.light,
  useMaterial3: true,

  colorScheme: ColorScheme.light(
    primary: AppColorSchemes.light.primary,
    onPrimary: AppColorSchemes.light.textThird,
    secondary: AppColorSchemes.light.primary,
    onSecondary: AppColorSchemes.light.textThird,
    error: AppColorSchemes.light.error,
    onError: AppColorSchemes.light.textThird,
    surface: AppColorSchemes.light.surfacePrimary,
    onSurface: AppColorSchemes.light.textPrimary,
    background: AppColorSchemes.light.background,
    onBackground: AppColorSchemes.light.textPrimary,
    outline: AppColorSchemes.light.outline,
    shadow: AppColorSchemes.light.shadow,
  ),

  scaffoldBackgroundColor: AppColorSchemes.light.background,
  appBarTheme: AppBarTheme(
    backgroundColor: AppColorSchemes.light.background,
    foregroundColor: AppColorSchemes.light.textPrimary,
    elevation: 0,
  ),
  elevatedButtonTheme: ElevatedButtonThemeData(
    style: ButtonStyle(
      backgroundColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.disabled)) {
          return AppColorSchemes.light.textMuted;
        }
        return AppColorSchemes.light.primaryButton;
      }),
      foregroundColor: WidgetStateProperty.all(AppColorSchemes.light.textThird),
      padding: WidgetStateProperty.all(EdgeInsets.symmetric(horizontal: 20.w)),
      shape: WidgetStateProperty.all(
        RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),

      elevation: WidgetStateProperty.all(0),
    ),
  ),

  extensions: const [AppColorSchemes.light],
  textTheme: AppTextTheme.base,
);
