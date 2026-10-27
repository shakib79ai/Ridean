import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Ridean design tokens — matches the web, PWA and native brand kit
/// (navy / gold, journey-mark identity), refreshed to the Bricolage
/// Grotesque + DM Sans type system and richer navy/gold palette used on
/// the current reference mockups.
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
  static const placeholder = Color(0xFF6B7D96);
  static const chipTrack = Color(0xFFE8F0FA);
  static const ok = Color(0xFF0F6B45);
  static const okBg = Color(0xFFDDF3E8);
  static const warn = Color(0xFF7A4A00);
  static const warnBg = Color(0xFFFBEBCF);
  static const info = Color(0xFF0B4F8A);
  static const infoBg = Color(0xFFE8EEF8);
  static const bad = Color(0xFFA32020);
  static const badBg = Color(0xFFFBE0DE);

  // Per-tier vehicle accent colors (used on ride/chauffeur option cards).
  static const tierSedan = Color(0xFFF4B000);
  static const tierXl = Color(0xFFD68A00);
  static const tierComfort = Color(0xFF93A8D6);
  static const tierBusiness = Color(0xFF1F4A8C);
  static const tierBlack = Color(0xFF161616);
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

/// Shadows used across the brand's cards and primary CTA.
class RShadows {
  static List<BoxShadow> card = [
    BoxShadow(color: RColors.navy.withOpacity(0.08), blurRadius: 16, offset: const Offset(0, 8)),
  ];
  static List<BoxShadow> floating = [
    BoxShadow(color: RColors.navy.withOpacity(0.12), blurRadius: 24, offset: const Offset(0, 10)),
  ];
  static List<BoxShadow> gold = [
    BoxShadow(color: RColors.acc.withOpacity(0.38), blurRadius: 16, offset: const Offset(0, 6)),
  ];
  static List<BoxShadow> markGlow = [
    BoxShadow(color: RColors.acc.withOpacity(0.35), blurRadius: 12, offset: const Offset(0, 4)),
  ];
}

/// Text style helpers for the two-family type system: Bricolage Grotesque
/// for display/headings/prices, DM Sans for body and UI copy.
class RFonts {
  static TextStyle display({
    double size = 28,
    FontWeight weight = FontWeight.w800,
    Color color = RColors.navy,
    double? height,
    double letterSpacing = -0.02,
  }) =>
      GoogleFonts.bricolageGrotesque(
        fontSize: size,
        fontWeight: weight,
        color: color,
        height: height,
        letterSpacing: letterSpacing * size,
      );

  static TextStyle body({
    double size = 14,
    FontWeight weight = FontWeight.w500,
    Color color = RColors.navy,
    double? height,
  }) =>
      GoogleFonts.dmSans(fontSize: size, fontWeight: weight, color: color, height: height);
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
  final dmSansTheme = GoogleFonts.dmSansTextTheme(base.textTheme);
  return base.copyWith(
    textTheme: dmSansTheme.apply(
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
