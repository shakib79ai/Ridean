// Ridean App design kit — every screen is built from these widgets so it matches the
// "Ridean App — Emerald & Pure Gold" boards (390pt wide, 20pt side padding, 14pt gaps).
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../api/api_client.dart';
import '../theme.dart';

// ---------------------------------------------------------------------------
// Page scaffolds

/// A standard inner page: back header + scrolling column of sections.
/// [bottom] is pinned under the scroll view (e.g. a CTA) and respects the safe area.
class RdPage extends StatelessWidget {
  const RdPage({
    super.key,
    required this.title,
    this.subtitle,
    required this.children,
    this.trailing,
    this.bottom,
    this.onBack,
    this.gap = 14,
    this.onRefresh,
    this.scroll = true,
  });
  final String title;
  final String? subtitle;
  final List<Widget> children;
  final Widget? trailing;
  final Widget? bottom;
  final VoidCallback? onBack;
  final double gap;
  final Future<void> Function()? onRefresh;
  final bool scroll;

  @override
  Widget build(BuildContext context) {
    final body = scroll
        ? ListView(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
            children: rdGap(children, gap),
          )
        : Padding(padding: const EdgeInsets.fromLTRB(20, 0, 20, 0), child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: rdGap(children, gap)));
    return Scaffold(
      backgroundColor: RdColors.bg,
      body: SafeArea(
        bottom: bottom == null,
        child: Column(children: [
          RdBackHeader(title: title, subtitle: subtitle, trailing: trailing, onBack: onBack),
          Expanded(child: onRefresh == null ? body : RefreshIndicator(color: RdColors.gold, backgroundColor: RdColors.card, onRefresh: onRefresh!, child: body)),
          if (bottom != null)
            Container(
              padding: EdgeInsets.fromLTRB(20, 10, 20, 10 + MediaQuery.of(context).padding.bottom),
              decoration: const BoxDecoration(color: RdColors.bg, border: Border(top: BorderSide(color: RdColors.line))),
              child: bottom,
            ),
        ]),
      ),
    );
  }
}

/// Inserts vertical gaps between children.
List<Widget> rdGap(List<Widget> children, [double gap = 14]) {
  final out = <Widget>[];
  for (var i = 0; i < children.length; i++) {
    if (i > 0) out.add(SizedBox(height: gap));
    out.add(children[i]);
  }
  return out;
}

/// Back button + serif page title. iOS: round bordered button with a chevron; Android: bare arrow.
class RdBackHeader extends StatelessWidget {
  const RdBackHeader({super.key, required this.title, this.subtitle, this.trailing, this.onBack});
  final String title;
  final String? subtitle;
  final Widget? trailing;
  final VoidCallback? onBack;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 6, 20, 14),
      child: Row(children: [
        RdBackButton(onPressed: onBack),
        const SizedBox(width: 12),
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
            Text(title, maxLines: 2, overflow: TextOverflow.ellipsis, style: RdText.serif(24, height: 1.15)),
            if (subtitle != null) Padding(padding: const EdgeInsets.only(top: 2), child: Text(subtitle!, style: RdText.sans(13, color: RdColors.muted))),
          ]),
        ),
        if (trailing != null) trailing!,
      ]),
    );
  }
}

class RdBackButton extends StatelessWidget {
  const RdBackButton({super.key, this.onPressed, this.onPhoto = false});
  final VoidCallback? onPressed;

  /// Translucent dark circle used over hero photos.
  final bool onPhoto;

  void _back(BuildContext context) {
    if (onPressed != null) return onPressed!();
    if (context.canPop()) {
      context.pop();
    } else {
      context.go('/');
    }
  }

  @override
  Widget build(BuildContext context) {
    final ios = isCupertino(context);
    if (!ios && !onPhoto) {
      return SizedBox(
        width: 40,
        height: 40,
        child: IconButton(padding: EdgeInsets.zero, onPressed: () => _back(context), icon: const Icon(Icons.arrow_back, color: RdColors.cream, size: 24), tooltip: 'Back'),
      );
    }
    return Semantics(
      button: true,
      label: 'Back',
      child: GestureDetector(
        onTap: () => _back(context),
        child: Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: onPhoto ? const Color(0x9906140F) : RdColors.card,
            border: onPhoto ? null : Border.all(color: RdColors.line),
          ),
          child: Icon(ios ? Icons.chevron_left : Icons.arrow_back, color: RdColors.cream, size: ios ? 22 : 20),
        ),
      ),
    );
  }
}

/// Gold gradient "Ridean" wordmark used on tab pages.
class RdWordmark extends StatelessWidget {
  const RdWordmark({super.key, this.size = 30});
  final double size;
  @override
  Widget build(BuildContext context) {
    return ShaderMask(
      blendMode: BlendMode.srcIn,
      shaderCallback: (r) => const LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [Color(0xFFF8DD8A), Color(0xFFE2B04A), Color(0xFFB9842A)],
        stops: [0, .55, 1],
      ).createShader(r),
      child: Text('Ridean', style: RdText.serif(size, weight: FontWeight.w700)),
    );
  }
}

/// Header of the four tab pages: wordmark on the left, an icon action on the right.
class RdBrandHeader extends StatelessWidget {
  const RdBrandHeader({super.key, this.icon = Icons.notifications_none_rounded, this.onAction, this.actionLabel = 'Notifications'});
  final IconData icon;
  final VoidCallback? onAction;
  final String actionLabel;
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 8, 12, 14),
      child: Row(children: [
        const RdWordmark(),
        const Spacer(),
        if (onAction != null) IconButton(onPressed: onAction, tooltip: actionLabel, icon: Icon(icon, color: RdColors.cream, size: 24)),
      ]),
    );
  }
}

/// Tab page body: brand header + scroll view with 20pt padding and room for the tab bar.
class RdTabPage extends StatelessWidget {
  const RdTabPage({super.key, required this.children, this.header, this.onRefresh, this.gap = 14});
  final List<Widget> children;
  final Widget? header;
  final Future<void> Function()? onRefresh;
  final double gap;
  @override
  Widget build(BuildContext context) {
    final list = ListView(padding: const EdgeInsets.fromLTRB(20, 0, 20, 28), children: rdGap(children, gap));
    return SafeArea(
      bottom: false,
      child: Column(children: [
        header ?? const RdBrandHeader(),
        Expanded(child: onRefresh == null ? list : RefreshIndicator(color: RdColors.gold, backgroundColor: RdColors.card, onRefresh: onRefresh!, child: list)),
      ]),
    );
  }
}

/// Photo header used by Airport transfer, Hourly and Luxury: image, gradient, back button, title.
class RdHeroHeader extends StatelessWidget {
  const RdHeroHeader({super.key, required this.image, required this.title, this.subtitle, this.height = 200, this.alignment = Alignment.center, this.onBack});
  final String image;
  final String title;
  final String? subtitle;
  final double height;
  final Alignment alignment;
  final VoidCallback? onBack;
  @override
  Widget build(BuildContext context) {
    final top = MediaQuery.of(context).padding.top;
    return SizedBox(
      height: height + top,
      child: Stack(fit: StackFit.expand, children: [
        Image.asset(image, fit: BoxFit.cover, alignment: alignment),
        const DecoratedBox(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [Color(0x40071A14), Color(0x26071A14), RdColors.bg],
              stops: [0, .4, 1],
            ),
          ),
        ),
        Positioned(top: top + 12, left: 16, child: RdBackButton(onPhoto: true, onPressed: onBack)),
        Positioned(
          left: 20,
          right: 20,
          bottom: 18,
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(title, style: RdText.serif(30, height: 1.08)),
            if (subtitle != null) Padding(padding: const EdgeInsets.only(top: 6), child: Text(subtitle!, style: RdText.sans(14, color: RdColors.soft))),
          ]),
        ),
      ]),
    );
  }
}

/// Scaffold for hero pages: hero on top, then padded sections, optional pinned bottom.
class RdHeroPage extends StatelessWidget {
  const RdHeroPage({super.key, required this.hero, required this.children, this.bottom, this.gap = 14});
  final Widget hero;
  final List<Widget> children;
  final Widget? bottom;
  final double gap;
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: RdColors.bg,
      body: Column(children: [
        Expanded(
          child: ListView(padding: EdgeInsets.zero, children: [
            hero,
            Padding(
              padding: EdgeInsets.fromLTRB(20, 0, 20, bottom == null ? 24 + MediaQuery.of(context).padding.bottom : 24),
              child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: rdGap(children, gap)),
            ),
          ]),
        ),
        if (bottom != null)
          Container(
            padding: EdgeInsets.fromLTRB(20, 10, 20, 10 + MediaQuery.of(context).padding.bottom),
            decoration: const BoxDecoration(color: RdColors.bg, border: Border(top: BorderSide(color: RdColors.line))),
            child: bottom,
          ),
      ]),
    );
  }
}

// ---------------------------------------------------------------------------
// Surfaces and text

/// #0E2A22 card with a 1px #1F4537 border and 16pt radius.
class RdCard extends StatelessWidget {
  const RdCard({super.key, required this.child, this.padding = const EdgeInsets.all(16), this.onTap, this.color = RdColors.card, this.borderColor = RdColors.line, this.radius = 16});
  final Widget child;
  final EdgeInsetsGeometry padding;
  final VoidCallback? onTap;
  final Color color;
  final Color borderColor;
  final double radius;
  @override
  Widget build(BuildContext context) {
    final box = Container(
      padding: padding,
      decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(radius), border: Border.all(color: borderColor)),
      child: child,
    );
    if (onTap == null) return box;
    return Material(
      color: Colors.transparent,
      child: InkWell(borderRadius: BorderRadius.circular(radius), onTap: onTap, child: box),
    );
  }
}

/// Serif section heading (19pt) with an optional gold action on the right.
class RdSectionTitle extends StatelessWidget {
  const RdSectionTitle(this.text, {super.key, this.action, this.onAction});
  final String text;
  final String? action;
  final VoidCallback? onAction;
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 4),
      child: Row(crossAxisAlignment: CrossAxisAlignment.end, children: [
        Expanded(child: Text(text, style: RdText.serif(19))),
        if (action != null) GestureDetector(onTap: onAction, child: Text(action!, style: RdText.sans(13, color: RdColors.gold, weight: FontWeight.w500))),
      ]),
    );
  }
}

/// Uppercase gold eyebrow label ("CHOOSE YOUR CLASS").
class RdEyebrow extends StatelessWidget {
  const RdEyebrow(this.text, {super.key});
  final String text;
  @override
  Widget build(BuildContext context) => Text(text.toUpperCase(), style: RdText.eyebrow);
}

/// Small muted line with a leading icon (security notes, cancellation notes).
class RdNote extends StatelessWidget {
  const RdNote(this.text, {super.key, this.icon = Icons.verified_user_outlined, this.center = false, this.color = RdColors.muted});
  final String text;
  final IconData icon;
  final bool center;
  final Color color;
  @override
  Widget build(BuildContext context) {
    return Row(mainAxisAlignment: center ? MainAxisAlignment.center : MainAxisAlignment.start, crossAxisAlignment: CrossAxisAlignment.start, children: [
      Padding(padding: const EdgeInsets.only(top: 1), child: Icon(icon, size: 14, color: RdColors.gold)),
      const SizedBox(width: 7),
      Flexible(child: Text(text, style: RdText.sans(12.5, color: color, height: 1.35))),
    ]);
  }
}

/// Label / value row used in price breakdowns and detail cards.
class RdSummaryRow extends StatelessWidget {
  const RdSummaryRow(this.label, this.value, {super.key, this.bold = false, this.valueColor, this.labelColor});
  final String label;
  final String value;
  final bool bold;
  final Color? valueColor;
  final Color? labelColor;
  @override
  Widget build(BuildContext context) {
    final size = bold ? 16.0 : 14.0;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Expanded(child: Text(label, style: RdText.sans(size, color: labelColor ?? (bold ? RdColors.cream : RdColors.muted), weight: bold ? FontWeight.w600 : FontWeight.w400))),
        const SizedBox(width: 12),
        Flexible(
          child: Text(value,
              textAlign: TextAlign.right, style: RdText.sans(size, color: valueColor ?? (bold ? RdColors.cream : RdColors.muted), weight: bold ? FontWeight.w700 : FontWeight.w400)),
        ),
      ]),
    );
  }
}

/// Thin divider inside cards.
class RdDivider extends StatelessWidget {
  const RdDivider({super.key, this.vertical = 8});
  final double vertical;
  @override
  Widget build(BuildContext context) => Padding(padding: EdgeInsets.symmetric(vertical: vertical), child: const Divider(height: 1, color: RdColors.line));
}

/// Gold-tinted rounded badge ("Free waiting", "Ridean+ Gold", "Default").
class RdBadge extends StatelessWidget {
  const RdBadge(this.text, {super.key, this.icon, this.color = RdColors.gold, this.background = RdColors.goldSoft});
  final String text;
  final IconData? icon;
  final Color color;
  final Color background;
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
      decoration: BoxDecoration(color: background, borderRadius: BorderRadius.circular(999)),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        if (icon != null) ...[Icon(icon, size: 12, color: color), const SizedBox(width: 5)],
        Text(text, style: RdText.sans(11.5, color: color, weight: FontWeight.w600)),
      ]),
    );
  }
}

/// Booking status text colour: confirmed/completed green, cancelled red, otherwise gold.
Color statusColor(String status) {
  switch (status) {
    case 'confirmed':
    case 'driver_assigned':
    case 'in_progress':
    case 'completed':
      return RdColors.ok;
    case 'cancelled':
    case 'failed':
      return RdColors.bad;
    default:
      return RdColors.gold;
  }
}

/// Status as small coloured semibold text (as in the trip cards).
class RdStatusText extends StatelessWidget {
  const RdStatusText(this.label, this.status, {super.key});
  final String label;
  final String status;
  @override
  Widget build(BuildContext context) => Text(label, style: RdText.sans(12, color: statusColor(status), weight: FontWeight.w600));
}

/// Gold gradient initials avatar.
class RdAvatar extends StatelessWidget {
  const RdAvatar(this.initials, {super.key, this.size = 62});
  final String initials;
  final double size;
  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      alignment: Alignment.center,
      decoration: const BoxDecoration(shape: BoxShape.circle, gradient: LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: [Color(0xFFE2B04A), Color(0xFF9C6F1F)])),
      child: Text(initials.isEmpty ? '•' : initials, style: RdText.serif(size * .39, weight: FontWeight.w700, color: RdColors.ink)),
    );
  }
}

/// 38×38 rounded square holding a gold icon (list rows, activity rows).
class RdIconTile extends StatelessWidget {
  const RdIconTile(this.icon, {super.key, this.color = RdColors.gold, this.size = 38});
  final IconData icon;
  final Color color;
  final double size;
  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(color: RdColors.iconTile, borderRadius: BorderRadius.circular(size * .29)),
      child: Icon(icon, size: size * .47, color: color),
    );
  }
}

/// Rounded photo thumbnail.
class RdThumb extends StatelessWidget {
  const RdThumb(this.asset, {super.key, this.width = 78, this.height = 52, this.radius = 10});
  final String asset;
  final double width, height, radius;
  @override
  Widget build(BuildContext context) =>
      ClipRRect(borderRadius: BorderRadius.circular(radius), child: Image.asset(asset, width: width, height: height, fit: BoxFit.cover));
}

// ---------------------------------------------------------------------------
// Lists

/// Card that stacks rows separated by hairlines (Profile menu, Settings groups).
class RdListGroup extends StatelessWidget {
  const RdListGroup({super.key, required this.children});
  final List<Widget> children;
  @override
  Widget build(BuildContext context) {
    final rows = <Widget>[];
    for (var i = 0; i < children.length; i++) {
      if (i > 0) rows.add(const Divider(height: 1, color: RdColors.line));
      rows.add(children[i]);
    }
    return RdCard(padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2), child: Column(children: rows));
  }
}

/// Menu row: icon tile, title, optional subtitle, optional trailing text, chevron.
class RdListTile extends StatelessWidget {
  const RdListTile({super.key, this.icon, required this.title, this.subtitle, this.trailingText, this.trailing, this.onTap, this.danger = false, this.chevron = true});
  final IconData? icon;
  final String title;
  final String? subtitle;
  final String? trailingText;
  final Widget? trailing;
  final VoidCallback? onTap;
  final bool danger;
  final bool chevron;
  @override
  Widget build(BuildContext context) {
    final color = danger ? RdColors.bad : RdColors.cream;
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 2),
        child: Row(children: [
          if (icon != null) ...[RdIconTile(icon!, color: danger ? RdColors.bad : RdColors.gold), const SizedBox(width: 14)],
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(title, style: RdText.sans(15, weight: FontWeight.w500, color: color)),
              if (subtitle != null) Padding(padding: const EdgeInsets.only(top: 2), child: Text(subtitle!, style: RdText.sans(12.5, color: RdColors.muted))),
            ]),
          ),
          if (trailingText != null) Padding(padding: const EdgeInsets.only(left: 8), child: Text(trailingText!, style: RdText.sans(13, color: RdColors.muted))),
          if (trailing != null) Padding(padding: const EdgeInsets.only(left: 8), child: trailing!),
          if (chevron && onTap != null && trailing == null) const Padding(padding: EdgeInsets.only(left: 6), child: Icon(Icons.chevron_right, color: RdColors.muted, size: 20)),
        ]),
      ),
    );
  }
}

/// Settings row with a switch on the right.
class RdToggleRow extends StatelessWidget {
  const RdToggleRow({super.key, required this.title, this.subtitle, required this.value, required this.onChanged, this.icon});
  final String title;
  final String? subtitle;
  final bool value;
  final ValueChanged<bool>? onChanged;
  final IconData? icon;
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 2),
      child: Row(children: [
        if (icon != null) ...[RdIconTile(icon!), const SizedBox(width: 14)],
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(title, style: RdText.sans(15, weight: FontWeight.w500)),
            if (subtitle != null) Padding(padding: const EdgeInsets.only(top: 2), child: Text(subtitle!, style: RdText.sans(12.5, color: RdColors.muted))),
          ]),
        ),
        const SizedBox(width: 10),
        RdToggle(value: value, onChanged: onChanged),
      ]),
    );
  }
}

// ---------------------------------------------------------------------------
// Inputs

/// Bordered field with a leading icon and a small label above the value (the design's location/date fields).
/// Set [onTap] + [readOnly] for pickers. [action] renders a square button on the right edge (locate, swap).
class RdField extends StatelessWidget {
  const RdField({
    super.key,
    required this.label,
    this.icon,
    this.controller,
    this.hint,
    this.keyboardType,
    this.obscure = false,
    this.readOnly = false,
    this.onTap,
    this.action,
    this.trailing,
    this.value,
    this.onChanged,
    this.textInputAction,
    this.onSubmitted,
    this.autofillHints,
    this.textCapitalization = TextCapitalization.none,
    this.enabled = true,
    this.maxLength,
  });
  final String label;
  final IconData? icon;
  final TextEditingController? controller;
  final String? hint;
  final TextInputType? keyboardType;
  final bool obscure;
  final bool readOnly;
  final VoidCallback? onTap;
  final Widget? action;
  final Widget? trailing;

  /// Display text for read-only picker fields (used instead of [controller]).
  final String? value;
  final ValueChanged<String>? onChanged;
  final TextInputAction? textInputAction;
  final ValueChanged<String>? onSubmitted;
  final Iterable<String>? autofillHints;
  final TextCapitalization textCapitalization;
  final bool enabled;
  final int? maxLength;

  @override
  Widget build(BuildContext context) {
    final valueStyle = RdText.sans(14.5);
    final Widget input = value != null
        ? Padding(
            padding: const EdgeInsets.only(top: 2),
            child: Text(value!.isEmpty ? (hint ?? '') : value!, maxLines: 1, overflow: TextOverflow.ellipsis, style: value!.isEmpty ? RdText.sans(14.5, color: RdColors.muted) : valueStyle),
          )
        : TextField(
            controller: controller,
            readOnly: readOnly,
            onTap: onTap,
            enabled: enabled,
            obscureText: obscure,
            keyboardType: keyboardType,
            onChanged: onChanged,
            textInputAction: textInputAction,
            onSubmitted: onSubmitted,
            autofillHints: autofillHints,
            textCapitalization: textCapitalization,
            maxLength: maxLength,
            style: valueStyle,
            cursorColor: RdColors.gold,
            decoration: InputDecoration(
              isDense: true,
              counterText: '',
              border: InputBorder.none,
              enabledBorder: InputBorder.none,
              focusedBorder: InputBorder.none,
              filled: false,
              contentPadding: const EdgeInsets.only(top: 3),
              hintText: hint,
              hintStyle: RdText.sans(14.5, color: RdColors.muted),
            ),
          );
    final content = Container(
      constraints: const BoxConstraints(minHeight: 58),
      decoration: BoxDecoration(color: RdColors.bg, borderRadius: BorderRadius.circular(12), border: Border.all(color: RdColors.line)),
      child: Row(children: [
          if (icon != null) SizedBox(width: 46, child: Icon(icon, size: 19, color: RdColors.cream)) else const SizedBox(width: 14),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(0, 8, 8, 8),
              child: Column(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(label, style: RdText.label),
                input,
              ]),
            ),
          ),
          if (trailing != null) Padding(padding: const EdgeInsets.only(right: 10), child: trailing),
          if (action != null) Container(width: 48, height: 56, decoration: const BoxDecoration(border: Border(left: BorderSide(color: RdColors.line))), child: Center(child: action)),
        ]),
    );
    if (value != null && onTap != null) {
      return Material(color: Colors.transparent, child: InkWell(borderRadius: BorderRadius.circular(12), onTap: onTap, child: content));
    }
    return content;
  }
}

/// Square icon button for [RdField.action].
class RdFieldAction extends StatelessWidget {
  const RdFieldAction({super.key, required this.icon, required this.onPressed, required this.tooltip});
  final IconData icon;
  final VoidCallback onPressed;
  final String tooltip;
  @override
  Widget build(BuildContext context) => IconButton(onPressed: onPressed, tooltip: tooltip, icon: Icon(icon, size: 20, color: RdColors.cream));
}

/// Date picker field. Shows "Fri, 14 Nov" style text.
class RdDateField extends StatelessWidget {
  const RdDateField({super.key, required this.label, required this.value, required this.onChanged, this.first, this.last, this.hint = 'Select date'});
  final String label;
  final DateTime? value;
  final ValueChanged<DateTime> onChanged;
  final DateTime? first, last;
  final String hint;
  @override
  Widget build(BuildContext context) {
    final v = value;
    return RdField(
      label: label,
      icon: Icons.calendar_today_outlined,
      hint: hint,
      value: v == null ? '' : MaterialLocalizations.of(context).formatShortMonthDay(v),
      onTap: () async {
        final now = DateTime.now();
        final d = await showDatePicker(
          context: context,
          initialDate: v ?? now,
          firstDate: first ?? DateTime(now.year, now.month, now.day),
          lastDate: last ?? now.add(const Duration(days: 365)),
        );
        if (d != null) onChanged(DateTime(d.year, d.month, d.day, v?.hour ?? 9, v?.minute ?? 0));
      },
    );
  }
}

/// Time picker field; keeps the date part of [value].
class RdTimeField extends StatelessWidget {
  const RdTimeField({super.key, required this.label, required this.value, required this.onChanged, this.hint = 'Select time'});
  final String label;
  final DateTime? value;
  final ValueChanged<DateTime> onChanged;
  final String hint;
  @override
  Widget build(BuildContext context) {
    final v = value;
    return RdField(
      label: label,
      icon: Icons.schedule,
      hint: hint,
      value: v == null ? '' : MaterialLocalizations.of(context).formatTimeOfDay(TimeOfDay.fromDateTime(v)),
      onTap: () async {
        final t = await showTimePicker(context: context, initialTime: v == null ? const TimeOfDay(hour: 9, minute: 0) : TimeOfDay.fromDateTime(v));
        if (t != null) {
          final base = v ?? DateTime.now().add(const Duration(days: 1));
          onChanged(DateTime(base.year, base.month, base.day, t.hour, t.minute));
        }
      },
    );
  }
}

/// Plain labelled text input (forms such as Edit profile, Add card, Sign in).
class RdInput extends StatelessWidget {
  const RdInput({
    super.key,
    required this.label,
    required this.controller,
    this.hint,
    this.keyboardType,
    this.obscure = false,
    this.validator,
    this.suffix,
    this.maxLines = 1,
    this.autofillHints,
    this.textInputAction,
    this.onSubmitted,
    this.textCapitalization = TextCapitalization.none,
    this.enabled = true,
    this.onChanged,
    this.maxLength,
  });
  final String label;
  final TextEditingController controller;
  final String? hint;
  final TextInputType? keyboardType;
  final bool obscure;
  final FormFieldValidator<String>? validator;
  final Widget? suffix;
  final int maxLines;
  final Iterable<String>? autofillHints;
  final TextInputAction? textInputAction;
  final ValueChanged<String>? onSubmitted;
  final TextCapitalization textCapitalization;
  final bool enabled;
  final ValueChanged<String>? onChanged;
  final int? maxLength;
  @override
  Widget build(BuildContext context) {
    OutlineInputBorder b(Color c) => OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: c));
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(label, style: RdText.sans(12, color: RdColors.muted)),
      const SizedBox(height: 6),
      TextFormField(
        controller: controller,
        keyboardType: keyboardType,
        obscureText: obscure,
        validator: validator,
        maxLines: obscure ? 1 : maxLines,
        autofillHints: autofillHints,
        textInputAction: textInputAction,
        onFieldSubmitted: onSubmitted,
        textCapitalization: textCapitalization,
        enabled: enabled,
        onChanged: onChanged,
        maxLength: maxLength,
        style: RdText.sans(14.5, color: enabled ? RdColors.cream : RdColors.muted),
        cursorColor: RdColors.gold,
        decoration: InputDecoration(
          counterText: '',
          hintText: hint,
          hintStyle: RdText.sans(14.5, color: RdColors.muted),
          filled: true,
          fillColor: RdColors.bg,
          isDense: true,
          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 15),
          suffixIcon: suffix,
          border: b(RdColors.line),
          enabledBorder: b(RdColors.line),
          disabledBorder: b(RdColors.line),
          focusedBorder: b(RdColors.gold),
          errorBorder: b(RdColors.bad),
          focusedErrorBorder: b(RdColors.bad),
          errorStyle: RdText.sans(12, color: RdColors.bad),
        ),
      ),
    ]);
  }
}

/// Multi-line notes box with label.
class RdTextArea extends StatelessWidget {
  const RdTextArea({super.key, required this.label, required this.controller, this.hint, this.lines = 2});
  final String label;
  final TextEditingController controller;
  final String? hint;
  final int lines;
  @override
  Widget build(BuildContext context) => RdInput(label: label, controller: controller, hint: hint, maxLines: lines, textCapitalization: TextCapitalization.sentences);
}

/// Two-or-more option segmented control (Now / Schedule, Upcoming / Past).
class RdSegmented<T> extends StatelessWidget {
  const RdSegmented({super.key, required this.options, required this.value, required this.onChanged});
  final List<(T, String)> options;
  final T value;
  final ValueChanged<T> onChanged;
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(color: RdColors.bg, borderRadius: BorderRadius.circular(12), border: Border.all(color: RdColors.line)),
      child: Row(children: [
        for (final o in options)
          Expanded(
            child: Semantics(
              selected: o.$1 == value,
              button: true,
              child: GestureDetector(
                behavior: HitTestBehavior.opaque,
                onTap: () => onChanged(o.$1),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 180),
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  alignment: Alignment.center,
                  decoration: BoxDecoration(color: o.$1 == value ? RdColors.segOn : Colors.transparent, borderRadius: BorderRadius.circular(9)),
                  child: Text(o.$2,
                      style: RdText.sans(14, color: o.$1 == value ? RdColors.cream : RdColors.muted, weight: o.$1 == value ? FontWeight.w600 : FontWeight.w400)),
                ),
              ),
            ),
          ),
      ]),
    );
  }
}

/// Single pill chip; selected = solid yellow.
class RdChip extends StatelessWidget {
  const RdChip({super.key, required this.label, required this.selected, required this.onTap});
  final String label;
  final bool selected;
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) {
    return Semantics(
      selected: selected,
      button: true,
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 160),
          padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 9),
          decoration: BoxDecoration(
            color: selected ? RdColors.yellow : RdColors.card,
            borderRadius: BorderRadius.circular(999),
            border: Border.all(color: selected ? RdColors.yellow : RdColors.line),
          ),
          child: Text(label, style: RdText.sans(13.5, color: selected ? RdColors.ink : RdColors.cream, weight: selected ? FontWeight.w600 : FontWeight.w400)),
        ),
      ),
    );
  }
}

/// Wrap of single-select chips.
class RdChips<T> extends StatelessWidget {
  const RdChips({super.key, required this.options, required this.value, required this.onChanged});
  final List<(T, String)> options;
  final T value;
  final ValueChanged<T> onChanged;
  @override
  Widget build(BuildContext context) {
    return Wrap(spacing: 8, runSpacing: 8, children: [
      for (final o in options) RdChip(label: o.$2, selected: o.$1 == value, onTap: () => onChanged(o.$1)),
    ]);
  }
}

/// Platform switch: Cupertino on iOS, Material on Android — both gold when on.
class RdToggle extends StatelessWidget {
  const RdToggle({super.key, required this.value, required this.onChanged});
  final bool value;
  final ValueChanged<bool>? onChanged;
  @override
  Widget build(BuildContext context) {
    if (isCupertino(context)) {
      return CupertinoSwitch(value: value, onChanged: onChanged, activeTrackColor: RdColors.yellow, inactiveTrackColor: RdColors.toggleOff, thumbColor: value ? RdColors.ink : RdColors.cream);
    }
    return Switch(
      value: value,
      onChanged: onChanged,
      thumbColor: WidgetStateProperty.resolveWith((s) => s.contains(WidgetState.selected) ? RdColors.ink : RdColors.cream),
      trackColor: WidgetStateProperty.resolveWith((s) => s.contains(WidgetState.selected) ? RdColors.yellow : RdColors.toggleOff),
      trackOutlineColor: WidgetStateProperty.all(Colors.transparent),
    );
  }
}

/// − value + stepper with a label (passengers, luggage).
class RdStepperRow extends StatelessWidget {
  const RdStepperRow({super.key, required this.label, this.subtitle, required this.value, required this.onChanged, this.min = 0, this.max = 12, this.icon});
  final String label;
  final String? subtitle;
  final int value;
  final ValueChanged<int> onChanged;
  final int min, max;
  final IconData? icon;
  @override
  Widget build(BuildContext context) {
    Widget btn(IconData i, bool enabled, VoidCallback f) => GestureDetector(
          onTap: enabled ? f : null,
          child: Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: RdColors.line)),
            child: Icon(i, size: 18, color: enabled ? RdColors.cream : RdColors.line),
          ),
        );
    return Row(children: [
      if (icon != null) ...[Icon(icon, size: 19, color: RdColors.gold), const SizedBox(width: 12)],
      Expanded(
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(label, style: RdText.sans(15, weight: FontWeight.w500)),
          if (subtitle != null) Text(subtitle!, style: RdText.sans(12.5, color: RdColors.muted)),
        ]),
      ),
      btn(Icons.remove, value > min, () => onChanged(value - 1)),
      SizedBox(width: 36, child: Text('$value', textAlign: TextAlign.center, style: RdText.sans(16, weight: FontWeight.w600))),
      btn(Icons.add, value < max, () => onChanged(value + 1)),
    ]);
  }
}

/// Radio circle (gold ring + dot when selected).
class RdRadio extends StatelessWidget {
  const RdRadio({super.key, required this.selected});
  final bool selected;
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 20,
      height: 20,
      alignment: Alignment.center,
      decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: selected ? RdColors.yellow : RdColors.muted, width: 2)),
      child: selected ? Container(width: 10, height: 10, decoration: const BoxDecoration(shape: BoxShape.circle, color: RdColors.yellow)) : null,
    );
  }
}

/// Selectable vehicle / option row: thumbnail, title, subtitle, price and meta on the right.
/// Put several inside `RdCard(padding: EdgeInsets.all(8), child: Column(...))` with 6pt gaps.
class RdOptionRow extends StatelessWidget {
  const RdOptionRow({super.key, this.image, required this.title, this.subtitle, this.price, this.meta, required this.selected, required this.onTap, this.badge});
  final String? image;
  final String title;
  final String? subtitle;
  final String? price;
  final String? meta;
  final bool selected;
  final VoidCallback onTap;
  final String? badge;
  @override
  Widget build(BuildContext context) {
    return Semantics(
      selected: selected,
      button: true,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 160),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          decoration: BoxDecoration(
            color: selected ? RdColors.optOn : RdColors.bg,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: selected ? RdColors.gold : Colors.transparent),
          ),
          child: Row(children: [
            if (image != null) ...[RdThumb(image!), const SizedBox(width: 12)],
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Row(children: [
                  Flexible(child: Text(title, maxLines: 1, overflow: TextOverflow.ellipsis, style: RdText.sans(15.5, weight: FontWeight.w600))),
                  if (badge != null) ...[const SizedBox(width: 6), RdBadge(badge!)],
                ]),
                if (subtitle != null) Padding(padding: const EdgeInsets.only(top: 2), child: Text(subtitle!, maxLines: 2, overflow: TextOverflow.ellipsis, style: RdText.sans(12.5, color: RdColors.muted))),
              ]),
            ),
            if (price != null || meta != null)
              Padding(
                padding: const EdgeInsets.only(left: 8),
                child: Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                  if (price != null) Text(price!, style: RdText.sans(16, weight: FontWeight.w600)),
                  if (meta != null) Padding(padding: const EdgeInsets.only(top: 2), child: Text(meta!, style: RdText.sans(12, color: RdColors.muted))),
                ]),
              ),
          ]),
        ),
      ),
    );
  }
}

/// Payment method choice (radio on the right).
class RdPayOption extends StatelessWidget {
  const RdPayOption({super.key, required this.icon, required this.title, this.subtitle, required this.selected, required this.onTap, this.enabled = true});
  final IconData icon;
  final String title;
  final String? subtitle;
  final bool selected;
  final VoidCallback onTap;
  final bool enabled;
  @override
  Widget build(BuildContext context) {
    return Opacity(
      opacity: enabled ? 1 : .5,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: enabled ? onTap : null,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 160),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: selected ? RdColors.optOn : RdColors.bg,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: selected ? RdColors.gold : RdColors.line),
          ),
          child: Row(children: [
            RdIconTile(icon, size: 36),
            const SizedBox(width: 14),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(title, style: RdText.sans(15, weight: FontWeight.w500)),
                if (subtitle != null) Padding(padding: const EdgeInsets.only(top: 2), child: Text(subtitle!, style: RdText.sans(12.5, color: RdColors.muted))),
              ]),
            ),
            RdRadio(selected: selected),
          ]),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Buttons

/// Yellow gradient call-to-action (54pt tall) with an optional trailing arrow.
class RdCta extends StatelessWidget {
  const RdCta({super.key, required this.label, required this.onPressed, this.busy = false, this.arrow = true, this.icon});
  final String label;
  final VoidCallback? onPressed;
  final bool busy;
  final bool arrow;
  final IconData? icon;
  @override
  Widget build(BuildContext context) {
    final enabled = onPressed != null && !busy;
    return Semantics(
      button: true,
      enabled: enabled,
      label: label,
      excludeSemantics: true,
      child: Opacity(
        opacity: onPressed == null && !busy ? .55 : 1,
        child: Material(
          color: Colors.transparent,
          child: Ink(
            height: 54,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              gradient: const LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter, colors: [RdColors.ctaTop, RdColors.ctaBottom]),
            ),
            child: InkWell(
              borderRadius: BorderRadius.circular(12),
              onTap: enabled ? onPressed : null,
              child: Center(
                child: busy
                    ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2.4, color: RdColors.ink))
                    : Row(mainAxisSize: MainAxisSize.min, children: [
                        if (icon != null) ...[Icon(icon, size: 19, color: RdColors.ink), const SizedBox(width: 8)],
                        Flexible(child: Text(label, maxLines: 1, overflow: TextOverflow.ellipsis, style: RdText.sans(17, weight: FontWeight.w600, color: RdColors.ink))),
                        if (arrow) ...[const SizedBox(width: 10), const Icon(Icons.arrow_forward, size: 20, color: RdColors.ink)],
                      ]),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// Outlined secondary button (Call, Message, Share trip, Sign out). [danger] makes it red.
class RdOutlineButton extends StatelessWidget {
  const RdOutlineButton({super.key, required this.label, required this.onPressed, this.icon, this.danger = false, this.height = 48, this.busy = false});
  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final bool danger;
  final double height;
  final bool busy;
  @override
  Widget build(BuildContext context) {
    final color = danger ? RdColors.bad : RdColors.gold;
    return SizedBox(
      height: height,
      child: OutlinedButton(
        onPressed: busy ? null : onPressed,
        style: OutlinedButton.styleFrom(
          foregroundColor: color,
          side: BorderSide(color: danger ? const Color(0x99E5645A) : const Color(0x99D9A94F)),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          padding: const EdgeInsets.symmetric(horizontal: 12),
        ),
        child: busy
            ? SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: color))
            : Row(mainAxisSize: MainAxisSize.min, children: [
                if (icon != null) ...[Icon(icon, size: 18, color: color), const SizedBox(width: 8)],
                Flexible(child: Text(label, maxLines: 1, overflow: TextOverflow.ellipsis, style: RdText.sans(14.5, weight: FontWeight.w600, color: color))),
              ]),
      ),
    );
  }
}

/// Gold text link button.
class RdLink extends StatelessWidget {
  const RdLink(this.label, {super.key, required this.onTap, this.size = 14, this.icon});
  final String label;
  final VoidCallback? onTap;
  final double size;
  final IconData? icon;
  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 2),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          if (icon != null) ...[Icon(icon, size: size + 3, color: RdColors.gold), const SizedBox(width: 6)],
          Text(label, style: RdText.sans(size, weight: FontWeight.w600, color: RdColors.gold)),
        ]),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Map

/// Decorative map with a gold route, as drawn in the design. [car] (0–1) places a car marker on the route.
class RdMap extends StatelessWidget {
  const RdMap({super.key, this.height = 150, this.car, this.showRoute = true});
  final double height;
  final double? car;
  final bool showRoute;
  @override
  Widget build(BuildContext context) {
    return Container(
      height: height,
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(color: const Color(0xFF0A2019), borderRadius: BorderRadius.circular(16), border: Border.all(color: RdColors.line)),
      child: CustomPaint(painter: _MapPainter(car: car, showRoute: showRoute), size: Size.infinite),
    );
  }
}

class _MapPainter extends CustomPainter {
  _MapPainter({this.car, this.showRoute = true});
  final double? car;
  final bool showRoute;

  @override
  void paint(Canvas canvas, Size size) {
    // Design viewBox is 350×150, scaled with "slice".
    final s = (size.width / 350) > (size.height / 150) ? size.width / 350 : size.height / 150;
    final dx = (size.width - 350 * s) / 2, dy = (size.height - 150 * s) / 2;
    Offset p(double x, double y) => Offset(dx + x * s, dy + y * s);
    canvas.drawRect(Offset.zero & size, Paint()..color = const Color(0xFF0A2019));
    final wide = Paint()
      ..color = const Color(0xFF143A2E)
      ..strokeWidth = 10 * s
      ..style = PaintingStyle.stroke;
    final thin = Paint()
      ..color = const Color(0xFF10302A)
      ..strokeWidth = 5 * s
      ..style = PaintingStyle.stroke;
    for (final l in const [
      [-10.0, 45.0, 360.0, 33.0],
      [-10.0, 112.0, 360.0, 128.0],
      [90.0, -10.0, 120.0, 160.0],
      [250.0, -10.0, 230.0, 160.0],
    ]) {
      canvas.drawLine(p(l[0], l[1]), p(l[2], l[3]), wide);
    }
    for (final l in const [
      [-10.0, 78.0, 360.0, 75.0],
      [170.0, -10.0, 180.0, 160.0],
      [310.0, -10.0, 300.0, 160.0],
      [30.0, -10.0, 50.0, 160.0],
    ]) {
      canvas.drawLine(p(l[0], l[1]), p(l[2], l[3]), thin);
    }
    final block = Paint()..color = const Color(0xFF123A2A);
    canvas.drawRRect(RRect.fromRectAndRadius(Rect.fromPoints(p(135, 87), p(175, 115)), Radius.circular(4 * s)), block);
    canvas.drawRRect(RRect.fromRectAndRadius(Rect.fromPoints(p(190, 15), p(226, 49)), Radius.circular(4 * s)), block);
    if (!showRoute) return;
    final route = Path()
      ..moveTo(p(70, 108).dx, p(70, 108).dy)
      ..cubicTo(p(140, 102).dx, p(140, 102).dy, p(150, 63).dx, p(150, 63).dy, p(200, 54).dx, p(200, 54).dy)
      ..cubicTo(p(250, 45).dx, p(250, 45).dy, p(270, 36).dx, p(270, 36).dy, p(285, 30).dx, p(285, 30).dy);
    canvas.drawPath(
        route,
        Paint()
          ..color = RdColors.gold
          ..strokeWidth = 4 * s
          ..style = PaintingStyle.stroke
          ..strokeCap = StrokeCap.round);
    canvas.drawCircle(p(70, 108), 8 * s, Paint()..color = RdColors.bg);
    canvas.drawCircle(
        p(70, 108),
        8 * s,
        Paint()
          ..color = RdColors.gold
          ..style = PaintingStyle.stroke
          ..strokeWidth = 4 * s);
    canvas.drawCircle(p(285, 30), 9 * s, Paint()..color = RdColors.yellow);
    canvas.drawCircle(p(285, 30), 3.5 * s, Paint()..color = RdColors.bg);
    if (car != null) {
      final metric = route.computeMetrics().first;
      final t = metric.getTangentForOffset(metric.length * car!.clamp(0.0, 1.0));
      if (t != null) {
        canvas.drawCircle(t.position, 13 * s, Paint()..color = const Color(0x55F6C428));
        canvas.drawCircle(t.position, 8 * s, Paint()..color = RdColors.yellow);
        canvas.drawCircle(t.position, 3 * s, Paint()..color = RdColors.bg);
      }
    }
  }

  @override
  bool shouldRepaint(covariant _MapPainter old) => old.car != car || old.showRoute != showRoute;
}

/// Pickup → drop-off timeline (ring, line, square) used on review, details and receipt cards.
class RdRouteSummary extends StatelessWidget {
  const RdRouteSummary({super.key, required this.fromLabel, required this.from, this.toLabel, this.to});
  final String fromLabel;
  final String from;
  final String? toLabel;
  final String? to;
  @override
  Widget build(BuildContext context) {
    final hasTo = to != null && to!.isNotEmpty;
    return IntrinsicHeight(
      child: Row(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        Padding(
          padding: const EdgeInsets.only(top: 5),
          child: Column(children: [
            Container(width: 10, height: 10, decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: RdColors.gold, width: 2.5))),
            if (hasTo) ...[
              Expanded(child: Container(width: 2, margin: const EdgeInsets.symmetric(vertical: 4), color: RdColors.line)),
              Container(width: 10, height: 10, decoration: BoxDecoration(color: RdColors.yellow, borderRadius: BorderRadius.circular(2))),
              const SizedBox(height: 6),
            ],
          ]),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(fromLabel, style: RdText.sans(12, color: RdColors.muted)),
            Padding(padding: const EdgeInsets.only(top: 2), child: Text(from, style: RdText.sans(15))),
            if (hasTo) ...[
              const SizedBox(height: 14),
              Text(toLabel ?? 'Drop-off', style: RdText.sans(12, color: RdColors.muted)),
              Padding(padding: const EdgeInsets.only(top: 2), child: Text(to!, style: RdText.sans(15))),
            ],
          ]),
        ),
      ]),
    );
  }
}

// ---------------------------------------------------------------------------
// States

class RdLoading extends StatelessWidget {
  const RdLoading({super.key, this.height = 160});
  final double height;
  @override
  Widget build(BuildContext context) => SizedBox(height: height, child: const Center(child: CircularProgressIndicator(color: RdColors.gold, strokeWidth: 2.4)));
}

/// Error card with an optional retry button.
class RdError extends StatelessWidget {
  const RdError(this.error, {super.key, this.onRetry});
  final Object error;
  final VoidCallback? onRetry;
  @override
  Widget build(BuildContext context) {
    return RdCard(
      child: Column(children: [
        const Icon(Icons.error_outline, color: RdColors.bad, size: 26),
        const SizedBox(height: 8),
        Text(errorText(error), textAlign: TextAlign.center, style: RdText.sans(14, color: RdColors.cream)),
        if (onRetry != null) ...[const SizedBox(height: 10), RdLink('Try again', onTap: onRetry)],
      ]),
    );
  }
}

/// Inline red error line under a form.
class RdErrorText extends StatelessWidget {
  const RdErrorText(this.message, {super.key});
  final String message;
  @override
  Widget build(BuildContext context) => Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Padding(padding: EdgeInsets.only(top: 1), child: Icon(Icons.error_outline, size: 16, color: RdColors.bad)),
        const SizedBox(width: 8),
        Expanded(child: Text(message, style: RdText.sans(13, color: RdColors.bad))),
      ]);
}

/// Empty state card: icon, title, text and optional CTA.
class RdEmpty extends StatelessWidget {
  const RdEmpty({super.key, required this.icon, required this.title, this.text, this.action, this.onAction});
  final IconData icon;
  final String title;
  final String? text;
  final String? action;
  final VoidCallback? onAction;
  @override
  Widget build(BuildContext context) {
    return RdCard(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 26),
      child: Column(children: [
        RdIconTile(icon, size: 48),
        const SizedBox(height: 12),
        Text(title, textAlign: TextAlign.center, style: RdText.serif(19)),
        if (text != null) Padding(padding: const EdgeInsets.only(top: 6), child: Text(text!, textAlign: TextAlign.center, style: RdText.sans(13.5, color: RdColors.muted, height: 1.4))),
        if (action != null) ...[const SizedBox(height: 16), RdCta(label: action!, onPressed: onAction, arrow: false)],
      ]),
    );
  }
}

/// Renders an AsyncValue with the kit's loading and error states.
Widget rdAsync<T>(AsyncValue<T> value, Widget Function(T data) data, {VoidCallback? onRetry, double loadingHeight = 160}) {
  return value.when(
    data: data,
    loading: () => RdLoading(height: loadingHeight),
    error: (e, _) => RdError(e, onRetry: onRetry),
  );
}

/// Cream toast at the bottom of the screen (the design's .rd-toast).
void showRdToast(BuildContext context, String message) {
  final m = ScaffoldMessenger.maybeOf(context);
  if (m == null) return;
  m.hideCurrentSnackBar();
  m.showSnackBar(SnackBar(content: Text(message, textAlign: TextAlign.center), duration: const Duration(milliseconds: 2200), margin: const EdgeInsets.fromLTRB(40, 0, 40, 96)));
}

/// Confirmation dialog — Cupertino on iOS, Material on Android. Returns true when confirmed.
Future<bool> rdConfirm(BuildContext context, {required String title, required String message, String confirm = 'Confirm', String cancel = 'Not now', bool danger = false}) async {
  final ios = isCupertino(context);
  final r = await showDialog<bool>(
    context: context,
    builder: (c) => ios
        ? CupertinoAlertDialog(
            title: Text(title),
            content: Text(message),
            actions: [
              CupertinoDialogAction(onPressed: () => Navigator.pop(c, false), child: Text(cancel)),
              CupertinoDialogAction(isDestructiveAction: danger, isDefaultAction: !danger, onPressed: () => Navigator.pop(c, true), child: Text(confirm)),
            ],
          )
        : AlertDialog(
            title: Text(title, style: RdText.serif(20)),
            content: Text(message, style: RdText.sans(14, color: RdColors.muted, height: 1.4)),
            actions: [
              TextButton(onPressed: () => Navigator.pop(c, false), child: Text(cancel, style: RdText.sans(14, color: RdColors.muted))),
              TextButton(onPressed: () => Navigator.pop(c, true), child: Text(confirm, style: RdText.sans(14, weight: FontWeight.w600, color: danger ? RdColors.bad : RdColors.gold))),
            ],
          ),
  );
  return r ?? false;
}
