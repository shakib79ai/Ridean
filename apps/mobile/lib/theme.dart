import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Emerald & Pure Gold — the exact tokens used by the Ridean App design boards.
class RdColors {
  static const bg = Color(0xFF071A14); // page background, field background
  static const card = Color(0xFF0E2A22); // cards, chips
  static const surface = card;
  static const line = Color(0xFF1F4537); // borders and dividers
  static const cream = Color(0xFFF3EEDF); // primary text
  static const soft = Color(0xFFD7DED6); // secondary text on photos
  static const muted = Color(0xFF9FB2A6); // secondary text, labels
  static const gold = Color(0xFFD9A94F); // accents, selected borders, links
  static const yellow = Color(0xFFF6C428); // selected chips, toggles, radios
  static const ctaTop = Color(0xFFFFD43B);
  static const ctaBottom = Color(0xFFF2B705);
  static const ink = Color(0xFF0A1F18); // text on yellow
  static const segOn = Color(0xFF1E5442); // selected segment
  static const optOn = Color(0xFF12352B); // selected option row
  static const iconTile = Color(0xFF12352B); // rounded square behind list icons
  static const toggleOff = Color(0xFF2A3D36);
  static const ok = Color(0xFF4CC38A);
  static const bad = Color(0xFFE5645A);
  static const goldSoft = Color(0x24D9A94F); // rgba(217,169,79,.14) — badges
  static const mapBg = Color(0xFF0B241D);
  static const mapRoad = Color(0xFF123A2A);
}

/// Font helpers. Headings use Playfair Display, everything else Inter.
class RdText {
  static TextStyle serif(double size, {FontWeight weight = FontWeight.w600, Color color = RdColors.cream, double? height}) =>
      GoogleFonts.playfairDisplay(fontSize: size, fontWeight: weight, color: color, height: height);
  static TextStyle sans(double size, {FontWeight weight = FontWeight.w400, Color color = RdColors.cream, double? height, double? letterSpacing}) =>
      GoogleFonts.inter(fontSize: size, fontWeight: weight, color: color, height: height, letterSpacing: letterSpacing);
  static TextStyle label = GoogleFonts.inter(fontSize: 11.5, color: RdColors.muted);
  static TextStyle eyebrow = GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: RdColors.gold, letterSpacing: 2.2);
}

/// iOS boards use a round back button, plain tab bar and Cupertino switches;
/// Android boards use a bare arrow, a Material 3 tab indicator and Material switches.
bool isCupertino(BuildContext context) {
  final p = Theme.of(context).platform;
  return p == TargetPlatform.iOS || p == TargetPlatform.macOS;
}

bool get isWebBuild => kIsWeb;

ThemeData buildTheme() {
  final base = ThemeData.dark(useMaterial3: true);
  final text = GoogleFonts.interTextTheme(base.textTheme).apply(bodyColor: RdColors.cream, displayColor: RdColors.cream);
  return base.copyWith(
    scaffoldBackgroundColor: RdColors.bg,
    canvasColor: RdColors.bg,
    colorScheme: const ColorScheme.dark(
      primary: RdColors.yellow,
      secondary: RdColors.gold,
      surface: RdColors.card,
      onPrimary: RdColors.ink,
      error: RdColors.bad,
    ),
    textTheme: text.copyWith(
      headlineLarge: GoogleFonts.playfairDisplay(fontSize: 30, fontWeight: FontWeight.w600, color: RdColors.cream),
      headlineMedium: GoogleFonts.playfairDisplay(fontSize: 26, fontWeight: FontWeight.w600, color: RdColors.cream),
      titleLarge: GoogleFonts.playfairDisplay(fontSize: 19, fontWeight: FontWeight.w600, color: RdColors.cream),
    ),
    textSelectionTheme: const TextSelectionThemeData(cursorColor: RdColors.gold, selectionColor: Color(0x55D9A94F), selectionHandleColor: RdColors.gold),
    appBarTheme: const AppBarTheme(backgroundColor: RdColors.bg, elevation: 0, foregroundColor: RdColors.cream, surfaceTintColor: Colors.transparent),
    dialogTheme: DialogThemeData(backgroundColor: RdColors.card, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18), side: const BorderSide(color: RdColors.line))),
    bottomSheetTheme: const BottomSheetThemeData(backgroundColor: RdColors.card, surfaceTintColor: Colors.transparent),
    snackBarTheme: SnackBarThemeData(
      backgroundColor: RdColors.cream,
      contentTextStyle: GoogleFonts.inter(color: RdColors.ink, fontWeight: FontWeight.w600, fontSize: 13.5),
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    ),
    progressIndicatorTheme: const ProgressIndicatorThemeData(color: RdColors.gold),
    dividerColor: RdColors.line,
    dividerTheme: const DividerThemeData(color: RdColors.line, thickness: 1, space: 1),
    datePickerTheme: const DatePickerThemeData(backgroundColor: RdColors.card, surfaceTintColor: Colors.transparent),
    timePickerTheme: const TimePickerThemeData(backgroundColor: RdColors.card),
  );
}
