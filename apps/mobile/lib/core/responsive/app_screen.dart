import 'package:flutter/widgets.dart';

enum DeviceType { mobile, tabletPortrait, tabletLandscape, desktop }

class AppScreen {
  static late Size size;
  static late DeviceType device;

  static late double designWidth;
  static late double designHeight;

  static late double scaleW;
  static late double scaleH;
  static late double scaleText;

  static void init(BuildContext context) {
    size = MediaQuery.of(context).size;
    final media = MediaQuery.of(context);

    final width = size.width;
    final height = size.height;

    /// Detect device type (same logic you already have)
    if (width < 600) {
      device = DeviceType.mobile;
      designWidth = 375;
      designHeight = 812;
    } else if (width < 840) {
      device = DeviceType.tabletPortrait;
      designWidth = 768;
      designHeight = 1024;
    } else if (width < 1200) {
      device = DeviceType.tabletLandscape;
      designWidth = 1024;
      designHeight = 768;
    } else {
      device = DeviceType.desktop;
      designWidth = 1440;
      designHeight = 1024;
    }

    /// Layout scaling (Display Size is auto handled by Flutter)
    scaleW = width / designWidth;
    scaleH = height / designHeight;

    /// NEW: Font size scaling
    scaleText = media.textScaler.scale(1.0).clamp(0.9, 1.3);
  }

  /// Helpers
  static bool get isMobile => device == DeviceType.mobile;
  static bool get isTabletPortrait => device == DeviceType.tabletPortrait;
  static bool get isTabletLandscape => device == DeviceType.tabletLandscape;
  static bool get isDesktop => device == DeviceType.desktop;
}
