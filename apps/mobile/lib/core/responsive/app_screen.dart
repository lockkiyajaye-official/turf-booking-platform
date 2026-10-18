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
    final isLandscape = width > height;
    final shortestSide = size.shortestSide;

    /// Detect device type accurately based on shortest side and orientation
    if (shortestSide < 600) {
      device = DeviceType.mobile;
      designWidth = isLandscape ? 812 : 375;
      designHeight = isLandscape ? 375 : 812;
    } else if (shortestSide < 1000) {
      if (isLandscape) {
        device = DeviceType.tabletLandscape;
        designWidth = 1024;
        designHeight = 768;
      } else {
        device = DeviceType.tabletPortrait;
        designWidth = 768;
        designHeight = 1024;
      }
    } else {
      if (isLandscape) {
        device = DeviceType.tabletLandscape;
        designWidth = 1366;
        designHeight = 1024;
      } else {
        device = DeviceType.tabletPortrait;
        designWidth = 1024;
        designHeight = 1366;
      }
    }

    /// Layout scaling
    scaleW = width / designWidth;
    scaleH = height / designHeight;

    /// Font size scaling
    scaleText = media.textScaler.scale(1.0).clamp(0.9, 1.3);
  }

  /// Helpers
  static bool get isMobile => device == DeviceType.mobile;
  static bool get isTabletPortrait => device == DeviceType.tabletPortrait;
  static bool get isTabletLandscape => device == DeviceType.tabletLandscape;
  static bool get isDesktop => device == DeviceType.desktop;
  static bool get isTablet =>
      device == DeviceType.tabletPortrait ||
      device == DeviceType.tabletLandscape ||
      device == DeviceType.desktop;
}
