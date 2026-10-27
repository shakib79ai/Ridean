import 'package:flutter/material.dart';
import '../theme/tokens.dart';

enum RButtonVariant { primary, accent, secondary, ghost }

class RButton extends StatelessWidget {
  const RButton({
    super.key,
    required this.label,
    this.onPressed,
    this.variant = RButtonVariant.primary,
  });

  final String label;
  final VoidCallback? onPressed;
  final RButtonVariant variant;

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color fg;
    BoxBorder? border;
    List<BoxShadow>? shadow;
    switch (variant) {
      case RButtonVariant.primary:
        bg = RColors.navy;
        fg = Colors.white;
        break;
      case RButtonVariant.accent:
        bg = RColors.acc;
        fg = RColors.navy;
        border = Border.all(color: RColors.navy.withOpacity(0.12));
        shadow = RShadows.gold;
        break;
      case RButtonVariant.secondary:
        bg = RColors.surface;
        fg = RColors.navy;
        border = Border.all(color: RColors.line);
        break;
      case RButtonVariant.ghost:
        bg = Colors.transparent;
        fg = RColors.navy;
        break;
    }
    return GestureDetector(
      onTap: onPressed,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 16),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(RRadius.md),
          border: border,
          boxShadow: shadow,
        ),
        child: Text(label, style: RFonts.body(size: 15.5, weight: FontWeight.w700, color: fg)),
      ),
    );
  }
}

class RCard extends StatelessWidget {
  const RCard({
    super.key,
    required this.child,
    this.dark = false,
    this.selected = false,
    this.padding = const EdgeInsets.all(16),
    this.onTap,
  });

  final Widget child;
  final bool dark;
  final bool selected;
  final EdgeInsets padding;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: padding,
        decoration: BoxDecoration(
          color: dark ? RColors.navy : RColors.surface,
          borderRadius: BorderRadius.circular(RRadius.lg),
          border: Border.all(
            color: selected ? RColors.acc : (dark ? RColors.navy2 : RColors.line),
            width: selected ? 2 : 1,
          ),
          boxShadow: dark ? null : RShadows.card,
        ),
        child: child,
      ),
    );
  }
}

class RPill extends StatelessWidget {
  const RPill({super.key, required this.label, this.tone = 'info'});

  final String label;
  final String tone;

  @override
  Widget build(BuildContext context) {
    final map = {
      'ok': (RColors.okBg, RColors.ok),
      'warn': (RColors.warnBg, RColors.warn),
      'info': (RColors.infoBg, RColors.info),
      'bad': (RColors.badBg, RColors.bad),
      'accent': (RColors.acc, RColors.navy),
      'chip': (RColors.chipTrack, RColors.navy),
    };
    final (bg, fg) = map[tone] ?? map['info']!;
    final bold = tone == 'accent' ? FontWeight.w800 : FontWeight.w700;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(RRadius.pill)),
      child: Text(label, style: RFonts.body(size: 11, weight: bold, color: fg)),
    );
  }
}

class RField extends StatelessWidget {
  const RField({
    super.key,
    required this.label,
    this.value,
    this.placeholder,
    this.onTap,
    this.leftDot,
    this.icon,
  });

  final String label;
  final String? value;
  final String? placeholder;
  final VoidCallback? onTap;
  final Color? leftDot;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: RColors.surface,
          borderRadius: BorderRadius.circular(RRadius.md),
          border: Border.all(color: RColors.line),
        ),
        child: Row(
          children: [
            if (icon != null) ...[
              Icon(icon, size: 19, color: RColors.navy),
              const SizedBox(width: 10),
            ] else if (leftDot != null) ...[
              Container(
                width: 10,
                height: 10,
                decoration: BoxDecoration(color: leftDot, shape: BoxShape.circle),
              ),
              const SizedBox(width: 12),
            ],
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label.toUpperCase(),
                    style: RFonts.body(size: 11, weight: FontWeight.w600, color: RColors.muted),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    value ?? placeholder ?? '',
                    style: RFonts.body(
                      size: 15,
                      weight: value != null ? FontWeight.w600 : FontWeight.w500,
                      color: value != null ? RColors.navy : RColors.placeholder,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Pill-shaped segmented control (e.g. "Ride now / Schedule",
/// "One way / Round trip") matching the reference mockups' toggle style.
class RSegmented extends StatelessWidget {
  const RSegmented({
    super.key,
    required this.options,
    required this.selectedIndex,
    required this.onChanged,
    this.activeColor = RColors.navy,
    this.activeLabelColor = Colors.white,
  });

  final List<String> options;
  final int selectedIndex;
  final ValueChanged<int> onChanged;
  final Color activeColor;
  final Color activeLabelColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: RColors.chipTrack,
        borderRadius: BorderRadius.circular(RRadius.md),
      ),
      child: Row(
        children: [
          for (int i = 0; i < options.length; i++) ...[
            Expanded(
              child: GestureDetector(
                onTap: () => onChanged(i),
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 9),
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: i == selectedIndex ? activeColor : Colors.transparent,
                    borderRadius: BorderRadius.circular(RRadius.sm),
                  ),
                  child: Text(
                    options[i],
                    style: RFonts.body(
                      size: 13,
                      weight: FontWeight.w700,
                      color: i == selectedIndex ? activeLabelColor : RColors.navy,
                    ),
                  ),
                ),
              ),
            ),
            if (i != options.length - 1) const SizedBox(width: 4),
          ],
        ],
      ),
    );
  }
}

class RSectionHeader extends StatelessWidget {
  const RSectionHeader({super.key, required this.title, this.action, this.onAction});

  final String title;
  final String? action;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(title, style: RFonts.display(size: 16, weight: FontWeight.w800)),
        if (action != null)
          GestureDetector(
            onTap: onAction,
            child: Text(action!, style: RFonts.body(size: 13, weight: FontWeight.w700, color: RColors.info)),
          ),
      ],
    );
  }
}

class RDivider extends StatelessWidget {
  const RDivider({super.key, required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const Expanded(child: Divider(color: RColors.line, height: 1)),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 10),
          child: Text(label, style: RFonts.body(size: 11, weight: FontWeight.w600, color: RColors.mutedOnDark)),
        ),
        const Expanded(child: Divider(color: RColors.line, height: 1)),
      ],
    );
  }
}
