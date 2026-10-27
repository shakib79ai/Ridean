import 'package:flutter/material.dart';
import '../theme/tokens.dart';

/// The canonical Ridean brand mark — a yellow rounded-square badge with a
/// rotated navy chevron and a soft shadow echo behind it, matching the real
/// SVG mark used on web/PWA/admin and on the Home mockup board. Approximated
/// here with a rotated built-in icon (rather than a hand-rolled CustomPainter
/// polygon) so it stays guaranteed-valid Dart without a local SDK to compile
/// against.
class RideanMark extends StatelessWidget {
  const RideanMark({super.key, this.size = 34});

  final double size;

  @override
  Widget build(BuildContext context) {
    final iconSize = size * 0.6;
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: RColors.acc,
        borderRadius: BorderRadius.circular(size * 0.33),
        boxShadow: RShadows.markGlow,
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          Transform.translate(
            offset: Offset(size * 0.05, size * 0.045),
            child: Transform.rotate(
              angle: -0.44,
              child: Icon(
                Icons.double_arrow_rounded,
                size: iconSize,
                color: RColors.navy.withOpacity(0.22),
              ),
            ),
          ),
          Transform.rotate(
            angle: -0.44,
            child: Icon(
              Icons.double_arrow_rounded,
              size: iconSize,
              color: RColors.navy,
            ),
          ),
        ],
      ),
    );
  }
}

/// Thin alternating checkered-flag strip used below the status bar on every
/// booking-flow screen, matching the web/PWA/RN brand pattern.
class CheckeredFlag extends StatelessWidget {
  const CheckeredFlag({super.key, this.columns = 24, this.height = 10});

  final int columns;
  final double height;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: height,
      child: Row(
        children: List.generate(columns, (i) {
          return Expanded(
            child: Container(
              color: i.isEven ? RColors.navy : RColors.acc,
            ),
          );
        }),
      ),
    );
  }
}

/// Navy, checkered-flag-topped header used by every booking-flow screen so
/// they read as part of the same Home-tab family.
class HeroHeader extends StatelessWidget {
  const HeroHeader({
    super.key,
    required this.title,
    this.subtitle,
    this.showBack = true,
    this.onBack,
  });

  final String title;
  final String? subtitle;
  final bool showBack;
  final VoidCallback? onBack;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const CheckeredFlag(),
        Container(
          color: RColors.navy,
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  if (showBack)
                    GestureDetector(
                      onTap: onBack ?? () => Navigator.of(context).maybePop(),
                      child: Container(
                        width: 36,
                        height: 36,
                        decoration: const BoxDecoration(
                          color: RColors.navy2,
                          shape: BoxShape.circle,
                        ),
                        alignment: Alignment.center,
                        child: const Icon(
                          Icons.chevron_left,
                          color: Colors.white,
                          size: 22,
                        ),
                      ),
                    ),
                  if (showBack) const SizedBox(width: 12),
                  Text(
                    title,
                    style: RFonts.display(size: 22, weight: FontWeight.w800, color: Colors.white),
                  ),
                ],
              ),
              if (subtitle != null)
                Padding(
                  padding: EdgeInsets.only(top: 6, left: showBack ? 48 : 0),
                  child: Text(
                    subtitle!,
                    style: RFonts.body(size: 12, weight: FontWeight.w500, color: RColors.mutedOnDark),
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }
}

/// White, rounded-top content sheet that wraps body content below a
/// [HeroHeader], matching the web/PWA pattern.
class RSheet extends StatelessWidget {
  const RSheet({super.key, required this.children, this.gap = 16});

  final List<Widget> children;
  final double gap;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        width: double.infinity,
        decoration: const BoxDecoration(
          color: RColors.surface,
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(24),
            topRight: Radius.circular(24),
          ),
        ),
        transform: Matrix4.translationValues(0, -13, 0),
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              for (final c in children) ...[c, SizedBox(height: gap)],
            ],
          ),
        ),
      ),
    );
  }
}
