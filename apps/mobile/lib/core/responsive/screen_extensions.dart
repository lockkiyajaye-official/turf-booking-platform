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
  EdgeInsets get a => EdgeInsets.all(this.w);
  EdgeInsets get hv =>
      EdgeInsets.symmetric(horizontal: this.w, vertical: this.h);
}
