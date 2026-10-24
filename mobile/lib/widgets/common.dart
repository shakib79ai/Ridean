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
    switch (variant) {
      case RButtonVariant.primary:
        bg = RColors.navy;
        fg = Colors.white;
        break;
      case RButtonVariant.accent:
        bg = RColors.acc;
        fg = RColors.navy;
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
        padding: const EdgeInsets.symmetric(vertical: 15),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(RRadius.md),
          border: border,
        ),
        child: Text(
          label,
          style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: fg),
        ),
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
          boxShadow: dark
              ? null
              : [
                  BoxShadow(
                    color: RColors.navy.withOpacity(0.08),
                    blurRadius: 16,
                    offset: const Offset(0, 8),
                  ),
                ],
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
    };
    final (bg, fg) = map[tone] ?? map['info']!;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(RRadius.pill)),
      child: Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: fg)),
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
  });

  final String label;
  final String? value;
  final String? placeholder;
  final VoidCallback? onTap;
  final Color? leftDot;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        decoration: BoxDecoration(
          color: RColors.ground,
          borderRadius: BorderRadius.circular(RRadius.md),
          border: Border.all(color: RColors.line),
        ),
        child: Row(
          children: [
            if (leftDot != null) ...[
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
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: RColors.muted),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    value ?? placeholder ?? '',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: value != null ? FontWeight.w600 : FontWeight.w500,
                      color: value != null ? RColors.navy : RColors.muted,
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
        Text(title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: RColors.navy)),
        if (action != null)
          GestureDetector(
            onTap: onAction,
            child: Text(action!, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: RColors.info)),
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
          child: Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: RColors.mutedOnDark)),
        ),
        const Expanded(child: Divider(color: RColors.line, height: 1)),
      ],
    );
  }
}
