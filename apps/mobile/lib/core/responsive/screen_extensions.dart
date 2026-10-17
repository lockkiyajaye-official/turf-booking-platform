import 'package:flutter/material.dart';
import 'package:mobile/core/responsive/app_screen.dart';

extension ScreenWidth on num {
  double get w => this * AppScreen.scaleW;
}

extension ScreenHeight on num {
  double get h => this * AppScreen.scaleH;
}

extension ScreenText on num {
  double get sp => this * AppScreen.scaleText;
}

extension ScreenRadius on num {
  double get r => this * AppScreen.scaleW;
}

extension ScreenEdgeInsets on num {
  EdgeInsets get a => EdgeInsets.all(w);
  EdgeInsets get hv => EdgeInsets.symmetric(horizontal: w, vertical: h);
}

extension ResponsiveContext on BuildContext {
  /// Number of columns for turf cards
  int get turfGridColumns {
    final w = MediaQuery.sizeOf(this).width;
    if (w >= 1150) return 3;
    if (w >= 600) return 2;
    return 1;
  }

  /// Number of columns for booking cards
  int get bookingGridColumns {
    final w = MediaQuery.sizeOf(this).width;
    if (w >= 1150) return 3;
    if (w >= 600) return 2;
    return 1;
  }

  /// Number of columns for profile menu items
  int get menuGridColumns => MediaQuery.sizeOf(this).width >= 600 ? 2 : 1;
}
