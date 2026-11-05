import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Emerald & Pure Gold — mirrors packages/shared/src/tokens.ts
class RdColors {
  static const bg = Color(0xFF071A14);
  static const surface = Color(0xFF0F2E25);
  static const surface2 = Color(0xFF14382D);
  static const line = Color(0x29A0C8B9);
  static const cream = Color(0xFFF3EEDF);
  static const muted = Color(0xFF9FB3AA);
  static const gold = Color(0xFFD9A94F);
  static const yellow = Color(0xFFFCCB2C);
  static const ok = Color(0xFF4CC38A);
  static const bad = Color(0xFFE5645A);
}

ThemeData buildTheme() {
  final base = ThemeData.dark(useMaterial3: true);
  final text = GoogleFonts.interTextTheme(base.textTheme).apply(bodyColor: RdColors.cream, displayColor: RdColors.cream);
  return base.copyWith(
    scaffoldBackgroundColor: RdColors.bg,
    colorScheme: const ColorScheme.dark(primary: RdColors.yellow, secondary: RdColors.gold, surface: RdColors.surface, onPrimary: Color(0xFF0A1F18)),
    textTheme: text.copyWith(
      headlineLarge: GoogleFonts.playfairDisplay(fontSize: 32, fontWeight: FontWeight.w600, color: RdColors.cream),
      headlineMedium: GoogleFonts.playfairDisplay(fontSize: 26, fontWeight: FontWeight.w600, color: RdColors.cream),
      titleLarge: GoogleFonts.playfairDisplay(fontSize: 20, fontWeight: FontWeight.w600, color: RdColors.cream),
    ),
    appBarTheme: const AppBarTheme(backgroundColor: RdColors.bg, elevation: 0, foregroundColor: RdColors.cream),
    cardTheme: CardThemeData(color: RdColors.surface, elevation: 0, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: const BorderSide(color: RdColors.line))),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: const Color(0xFF01201A),
      labelStyle: const TextStyle(color: RdColors.muted),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: RdColors.line)),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: RdColors.line)),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: RdColors.gold)),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: RdColors.yellow,
        foregroundColor: const Color(0xFF0A1F18),
        minimumSize: const Size.fromHeight(52),
        textStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(foregroundColor: RdColors.gold, side: const BorderSide(color: RdColors.gold), minimumSize: const Size(0, 44), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: const Color(0xF0071A14),
      indicatorColor: RdColors.surface2,
      labelTextStyle: WidgetStateProperty.resolveWith((s) => TextStyle(fontSize: 12, color: s.contains(WidgetState.selected) ? RdColors.yellow : RdColors.muted)),
      iconTheme: WidgetStateProperty.resolveWith((s) => IconThemeData(color: s.contains(WidgetState.selected) ? RdColors.yellow : RdColors.muted)),
    ),
    dividerColor: RdColors.line,
  );
}
