import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../api/api_client.dart';
import '../../api/models.dart';
import '../../state/providers.dart';
import '../../theme.dart';
import '../../widgets/kit.dart';

/// App version (pubspec.yaml `version: 2.0.0+1`).
const _appVersion = '2.0.0';

const _languages = <(String, String, String)>[
  ('en-US', 'English (US)', 'EN'),
  ('en-GB', 'English (UK)', 'EN'),
  ('es', 'Español', 'ES'),
  ('fr', 'Français', 'FR'),
  ('de', 'Deutsch', 'DE'),
  ('bn', 'বাংলা', 'BN'),
];

const _currencies = <(String, String)>[
  ('USD', 'US Dollar'),
  ('EUR', 'Euro'),
  ('GBP', 'British Pound'),
  ('CAD', 'Canadian Dollar'),
];

String _languageLabel(String v) {
  for (final l in _languages) {
    if (l.$1 == v) return l.$2;
  }
  return v;
}

String _languageShort(String v) {
  for (final l in _languages) {
    if (l.$1 == v) return l.$3;
  }
  return v.length >= 2 ? v.substring(0, 2).toUpperCase() : v.toUpperCase();
}

String _currencyLabel(String v) {
  for (final c in _currencies) {
    if (c.$1 == v) return c.$2;
  }
  return v;
}

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});
  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  /// Local copy used for optimistic updates; null until the first change.
  UserSettings? _local;

  UserSettings _merge(UserSettings s, String group, Map<String, dynamic> patch) {
    final raw = Map<String, dynamic>.from(s.raw);
    final g = raw[group];
    final next = g is Map ? Map<String, dynamic>.from(g) : <String, dynamic>{};
    next.addAll(patch);
    raw[group] = next;
    return UserSettings(raw);
  }

  Future<void> _update(UserSettings current, String group, Map<String, dynamic> patch) async {
    final prev = current;
    setState(() => _local = _merge(current, group, patch));
    try {
      final saved = await ref.read(apiProvider).updateSettings({group: patch});
      if (!mounted) return;
      setState(() => _local = saved);
      showRdToast(context, 'Saved');
    } catch (e) {
      if (!mounted) return;
      setState(() => _local = prev);
      showRdToast(context, errorText(e, 'Couldn’t save — please try again'));
    }
  }

  Future<void> _pickLanguage(UserSettings s) async {
    final current = s.pref('language', 'en-US');
    final options = [
      if (!_languages.any((l) => l.$1 == current)) (current, current),
      for (final l in _languages) (l.$1, l.$2),
    ];
    final v = await _showPicker(context, title: 'Language', options: options, value: current);
    if (v == null || v == current || !mounted) return;
    await _update(s, 'preferences', {'language': v});
  }

  Future<void> _pickCurrency(UserSettings s) async {
    final current = s.pref('currency', 'USD');
    final options = [
      if (!_currencies.any((c) => c.$1 == current)) (current, current),
      for (final c in _currencies) (c.$1, '${c.$1} · ${c.$2}'),
    ];
    final v = await _showPicker(context, title: 'Currency', options: options, value: current);
    if (v == null || v == current || !mounted) return;
    await _update(s, 'preferences', {'currency': v});
  }

  Future<void> _pickAppearance(UserSettings s) async {
    // The app ships a single (dark) theme, so Dark is the only real choice.
    final current = s.pref('appearance', 'dark');
    final v = await _showPicker(
      context,
      title: 'Appearance',
      options: const [('dark', 'Dark')],
      value: 'dark',
      note: 'Ridean is designed for dark mode — it’s the only theme for now.',
    );
    if (v == null || v == current || !mounted) return;
    await _update(s, 'preferences', {'appearance': v});
  }

  Future<void> _changePassword() async {
    final ok = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: RdColors.card,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => const _ChangePasswordSheet(),
    );
    if (ok == true && mounted) showRdToast(context, 'Password changed');
  }

  Future<void> _deleteAccount() async {
    final ok = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: RdColors.card,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => const _DeleteAccountSheet(),
    );
    if (ok != true || !mounted) return;
    final auth = ref.read(authProvider);
    showRdToast(context, 'Your account has been deleted');
    context.go('/');
    await auth.logout();
  }

  void _about() {
    showDialog<void>(
      context: context,
      builder: (c) => AlertDialog(
        title: Text('About Ridean', style: RdText.serif(20)),
        content: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Version $_appVersion', style: RdText.sans(14, weight: FontWeight.w600)),
          const SizedBox(height: 8),
          Text('Rides, airport transfers, chauffeurs and car rental.\nRidean is operated by Best My Flight Inc., 1088 Liberty Ave, Brooklyn, NY 11208.',
              style: RdText.sans(13.5, color: RdColors.muted, height: 1.45)),
        ]),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(c);
              context.push('/legal');
            },
            child: Text('Legal & privacy', style: RdText.sans(14, color: RdColors.muted)),
          ),
          TextButton(onPressed: () => Navigator.pop(c), child: Text('OK', style: RdText.sans(14, weight: FontWeight.w600, color: RdColors.gold))),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final async = ref.watch(settingsProvider);
    final s = _local ?? async.valueOrNull;
    final loadingOrError = s == null
        ? (async.hasError ? RdError(async.error ?? 'error', onRetry: () => ref.invalidate(settingsProvider)) : const RdLoading(height: 200))
        : null;

    return RdPage(
      title: 'Settings',
      children: [
        const RdSectionTitle('Notifications'),
        if (s == null)
          loadingOrError ?? const SizedBox.shrink()
        else
          RdListGroup(children: [
            RdToggleRow(
              title: 'Trip updates',
              subtitle: 'Chauffeur arrival and trip status',
              value: s.flag('notifications', 'tripUpdates', true),
              onChanged: (v) => _update(s, 'notifications', {'tripUpdates': v}),
            ),
            RdToggleRow(
              title: 'Flight alerts',
              subtitle: 'Delays affecting your transfer',
              value: s.flag('notifications', 'flightAlerts', true),
              onChanged: (v) => _update(s, 'notifications', {'flightAlerts': v}),
            ),
            RdToggleRow(
              title: 'Offers & news',
              subtitle: 'Promotions from Ridean',
              value: s.flag('notifications', 'offers'),
              onChanged: (v) => _update(s, 'notifications', {'offers': v}),
            ),
          ]),
        Text('Notifications are delivered once email/SMS sending is enabled.', style: RdText.sans(12.5, color: RdColors.muted, height: 1.5)),
        const RdSectionTitle('Preferences'),
        if (s != null)
          RdListGroup(children: [
            RdListTile(
              icon: Icons.language,
              title: 'Language',
              subtitle: _languageLabel(s.pref('language', 'en-US')),
              trailingText: _languageShort(s.pref('language', 'en-US')),
              onTap: () => _pickLanguage(s),
            ),
            RdListTile(
              icon: Icons.sell_outlined,
              title: 'Currency',
              subtitle: _currencyLabel(s.pref('currency', 'USD')),
              trailingText: s.pref('currency', 'USD'),
              onTap: () => _pickCurrency(s),
            ),
            RdListTile(
              icon: Icons.dark_mode_outlined,
              title: 'Appearance',
              subtitle: 'Dark',
              onTap: () => _pickAppearance(s),
            ),
          ]),
        const RdSectionTitle('Security'),
        RdListGroup(children: [
          RdListTile(icon: Icons.lock_outline, title: 'Change password', subtitle: 'Use at least 8 characters', onTap: _changePassword),
        ]),
        RdListGroup(children: [
          RdListTile(icon: Icons.help_outline, title: 'About Ridean', subtitle: 'Version $_appVersion', onTap: _about),
          RdListTile(icon: Icons.logout, title: 'Delete account', subtitle: 'Permanently remove your data', danger: true, onTap: _deleteAccount),
        ]),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Bottom sheets

Future<String?> _showPicker(BuildContext context, {required String title, required List<(String, String)> options, required String value, String? note}) {
  return showModalBottomSheet<String>(
    context: context,
    isScrollControlled: true,
    backgroundColor: RdColors.card,
    shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
    builder: (c) => _SheetFrame(
      title: title,
      children: [
        for (final o in options)
          InkWell(
            borderRadius: BorderRadius.circular(12),
            onTap: () => Navigator.pop(c, o.$1),
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 13, horizontal: 4),
              child: Row(children: [
                Expanded(child: Text(o.$2, style: RdText.sans(15, weight: o.$1 == value ? FontWeight.w600 : FontWeight.w400))),
                RdRadio(selected: o.$1 == value),
              ]),
            ),
          ),
        if (note != null) Padding(padding: const EdgeInsets.only(top: 8), child: RdNote(note, icon: Icons.info_outline)),
      ],
    ),
  );
}

/// Handle + serif title + content, padded above the keyboard.
class _SheetFrame extends StatelessWidget {
  const _SheetFrame({required this.title, required this.children});
  final String title;
  final List<Widget> children;
  @override
  Widget build(BuildContext context) {
    final mq = MediaQuery.of(context);
    return Padding(
      padding: EdgeInsets.only(bottom: mq.viewInsets.bottom),
      child: SafeArea(
        top: false,
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 10, 20, 20),
          child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: RdColors.line, borderRadius: BorderRadius.circular(2)))),
            const SizedBox(height: 14),
            Text(title, style: RdText.serif(21)),
            const SizedBox(height: 12),
            ...children,
          ]),
        ),
      ),
    );
  }
}

class _ChangePasswordSheet extends ConsumerStatefulWidget {
  const _ChangePasswordSheet();
  @override
  ConsumerState<_ChangePasswordSheet> createState() => _ChangePasswordSheetState();
}

class _ChangePasswordSheetState extends ConsumerState<_ChangePasswordSheet> {
  final _current = TextEditingController();
  final _next = TextEditingController();
  final _confirm = TextEditingController();
  bool _busy = false;
  String _error = '';

  @override
  void dispose() {
    _current.dispose();
    _next.dispose();
    _confirm.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_busy) return;
    if (_current.text.isEmpty) {
      setState(() => _error = 'Enter your current password.');
      return;
    }
    if (_next.text.length < 8) {
      setState(() => _error = 'Your new password must be at least 8 characters.');
      return;
    }
    if (_next.text != _confirm.text) {
      setState(() => _error = 'The new passwords don’t match.');
      return;
    }
    setState(() {
      _error = '';
      _busy = true;
    });
    try {
      await ref.read(apiProvider).changePassword(_current.text, _next.text);
      if (!mounted) return;
      Navigator.pop(context, true);
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = errorText(e);
        _busy = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return _SheetFrame(title: 'Change password', children: [
      RdField(label: 'Current password', icon: Icons.lock_outline, controller: _current, obscure: true, autofillHints: const [AutofillHints.password], textInputAction: TextInputAction.next),
      const SizedBox(height: 10),
      RdField(label: 'New password', icon: Icons.lock_outline, controller: _next, obscure: true, hint: 'At least 8 characters', autofillHints: const [AutofillHints.newPassword], textInputAction: TextInputAction.next),
      const SizedBox(height: 10),
      RdField(label: 'Confirm new password', icon: Icons.lock_outline, controller: _confirm, obscure: true, autofillHints: const [AutofillHints.newPassword], textInputAction: TextInputAction.done, onSubmitted: (_) => _submit()),
      if (_error.isNotEmpty) ...[const SizedBox(height: 12), RdErrorText(_error)],
      const SizedBox(height: 16),
      RdCta(label: 'Update password', arrow: false, busy: _busy, onPressed: _submit),
    ]);
  }
}

class _DeleteAccountSheet extends ConsumerStatefulWidget {
  const _DeleteAccountSheet();
  @override
  ConsumerState<_DeleteAccountSheet> createState() => _DeleteAccountSheetState();
}

class _DeleteAccountSheetState extends ConsumerState<_DeleteAccountSheet> {
  final _password = TextEditingController();
  bool _busy = false;
  String _error = '';

  @override
  void dispose() {
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_busy) return;
    if (_password.text.isEmpty) {
      setState(() => _error = 'Enter your password to confirm.');
      return;
    }
    setState(() {
      _error = '';
      _busy = true;
    });
    try {
      await ref.read(apiProvider).deleteAccount(_password.text);
      if (!mounted) return;
      Navigator.pop(context, true);
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = errorText(e);
        _busy = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return _SheetFrame(title: 'Delete account', children: [
      Text(
        'This signs you out and removes your personal details. Upcoming trips must be cancelled or completed first. Enter your password to confirm.',
        style: RdText.sans(13.5, color: RdColors.soft, height: 1.5),
      ),
      const SizedBox(height: 14),
      RdField(label: 'Password', icon: Icons.lock_outline, controller: _password, obscure: true, autofillHints: const [AutofillHints.password], textInputAction: TextInputAction.done, onSubmitted: (_) => _submit()),
      if (_error.isNotEmpty) ...[const SizedBox(height: 12), RdErrorText(_error)],
      const SizedBox(height: 16),
      Row(children: [
        Expanded(child: RdOutlineButton(label: 'Cancel', height: 50, onPressed: _busy ? null : () => Navigator.pop(context, false))),
        const SizedBox(width: 10),
        Expanded(child: RdOutlineButton(label: 'Delete my account', danger: true, height: 50, busy: _busy, onPressed: _submit)),
      ]),
    ]);
  }
}
