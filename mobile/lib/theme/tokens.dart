import 'package:flutter/material.dart';

/// Ridean design tokens — matches the web, PWA and native brand kit
/// (navy / yellow, journey-mark identity).
class RColors {
  static const navy = Color(0xFF0A1F44);
  static const navy2 = Color(0xFF12305F);
  static const navy3 = Color(0xFF1F4A8C);
  static const acc = Color(0xFFF4B000);
  static const ground = Color(0xFFF3F8FD);
  static const surface = Color(0xFFFFFFFF);
  static const line = Color(0xFFDCE6F2);
  static const muted = Color(0xFF4A5D78);
  static const mutedOnDark = Color(0xFF8FA6C8);
  static const ok = Color(0xFF0F6B45);
  static const okBg = Color(0xFFDDF3E8);
  static const warn = Color(0xFF7A4A00);
  static const warnBg = Color(0xFFFBEBCF);
  static const info = Color(0xFF0B4F8A);
  static const infoBg = Color(0xFFE8EEF8);
  static const bad = Color(0xFFA32020);
  static const badBg = Color(0xFFFBE0DE);
}

class RSpacing {
  static const xs = 4.0;
  static const sm = 8.0;
  static const md = 12.0;
  static const lg = 16.0;
  static const xl = 24.0;
  static const xxl = 32.0;
}

class RRadius {
  static const sm = 10.0;
  static const md = 14.0;
  static const lg = 20.0;
  static const xl = 28.0;
  static const pill = 999.0;
}

ThemeData rideanTheme() {
  final base = ThemeData(
    useMaterial3: true,
    scaffoldBackgroundColor: RColors.ground,
    colorScheme: ColorScheme.fromSeed(
      seedColor: RColors.navy,
      primary: RColors.navy,
      secondary: RColors.acc,
      surface: RColors.surface,
    ),
  );
  return base.copyWith(
    textTheme: base.textTheme.apply(
      bodyColor: RColors.navy,
      displayColor: RColors.navy,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: RColors.navy,
      foregroundColor: Colors.white,
      elevation: 0,
    ),
  );
}
