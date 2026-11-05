import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../api/api_client.dart';
import '../../api/models.dart';
import '../../state/providers.dart';
import '../../theme.dart';
import '../../widgets/kit.dart';

const _supportEmail = 'support@ridean.com';

class _Doc {
  const _Doc(this.id, this.title, this.subtitle, this.icon, this.text);
  final String id, title;
  final String? subtitle;
  final IconData icon;
  final String text;
}

const _docs = <_Doc>[
  _Doc('terms', 'Terms of service', 'Updated 1 Oct 2026', Icons.description_outlined, 'These terms govern your use of Ridean websites and apps, operated by Best My Flight Inc.'),
  _Doc('privacy', 'Privacy policy', 'How we use your data', Icons.shield_outlined,
      'We collect only what we need to arrange your trips — pickup and drop-off, contact details and payment tokens — and never sell your data.'),
  _Doc('cookies', 'Cookie policy', null, Icons.description_outlined, 'Essential cookies keep you signed in. Analytics cookies are optional and off until you allow them.'),
  _Doc('conduct', 'Chauffeur code of conduct', null, Icons.description_outlined,
      'Chauffeurs are licensed professionals from partners we vet, and are expected to be punctual, courteous and discreet on every trip.'),
];

/// (settings key, title, subtitle, default)
const _choices = <(String, String, String, bool)>[
  ('shareLocation', 'Share location during trips', 'Helps set your pickup point and keep your trip on time', true),
  ('personalisedOffers', 'Personalised offers', 'Use trip history to tailor promotions', false),
  ('analytics', 'Crash reports', 'Help us fix problems faster', false),
];

class LegalScreen extends ConsumerStatefulWidget {
  const LegalScreen({super.key, this.section});
  final String? section;
  @override
  ConsumerState<LegalScreen> createState() => _LegalScreenState();
}

class _LegalScreenState extends ConsumerState<LegalScreen> {
  String? _openDoc;
  UserSettings? _local;
  bool _saving = false;
  bool _exporting = false;
  String _exportError = '';

  @override
  void initState() {
    super.initState();
    final s = widget.section;
    if (s != null && _docs.any((d) => d.id == s)) _openDoc = s;
  }

  Future<void> _change(UserSettings current, String key, bool value) async {
    final prev = current;
    final g = current.raw['privacy'];
    final privacy = <String, dynamic>{
      for (final c in _choices) c.$1: current.flag('privacy', c.$1, c.$4),
      if (g is Map) ...Map<String, dynamic>.from(g),
      key: value,
    };
    final raw = Map<String, dynamic>.from(current.raw)..['privacy'] = privacy;
    setState(() {
      _local = UserSettings(raw);
      _saving = true;
    });
    try {
      final saved = await ref.read(apiProvider).updateSettings({'privacy': privacy});
      if (!mounted) return;
      setState(() {
        _local = saved;
        _saving = false;
      });
      showRdToast(context, 'Saved');
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _local = prev;
        _saving = false;
      });
      showRdToast(context, errorText(e, 'Could not save — please try again'));
    }
  }

  Future<void> _export() async {
    if (_exporting) return;
    setState(() {
      _exporting = true;
      _exportError = '';
    });
    try {
      final data = await ref.read(apiProvider).exportData();
      final json = const JsonEncoder.withIndent('  ').convert(data);
      await Clipboard.setData(ClipboardData(text: json));
      if (!mounted) return;
      setState(() => _exporting = false);
      showRdToast(context, 'Your data (JSON) was copied');
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _exporting = false;
        _exportError = errorText(e, 'We couldn’t prepare your data. Please try again.');
      });
    }
  }

  Future<void> _copyEmail() async {
    try {
      await Clipboard.setData(const ClipboardData(text: _supportEmail));
      if (!mounted) return;
      showRdToast(context, 'Email address copied');
    } catch (_) {
      if (!mounted) return;
      showRdToast(context, 'Couldn’t copy — please try again');
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final signedIn = auth.user != null;
    AsyncValue<UserSettings>? settingsAsync;
    UserSettings? settings;
    if (signedIn) {
      settingsAsync = ref.watch(settingsProvider);
      settings = _local ?? settingsAsync.valueOrNull;
    }
    final s = settings;
    final disabled = !signedIn || s == null || _saving;

    final docRows = <Widget>[];
    for (var i = 0; i < _docs.length; i++) {
      final d = _docs[i];
      final open = _openDoc == d.id;
      if (i > 0) docRows.add(const Divider(height: 1, color: RdColors.line));
      docRows.add(Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        RdListTile(
          icon: d.icon,
          title: d.title,
          subtitle: d.subtitle,
          trailing: AnimatedRotation(turns: open ? .25 : 0, duration: const Duration(milliseconds: 200), child: const Icon(Icons.chevron_right, color: RdColors.muted, size: 20)),
          onTap: () => setState(() => _openDoc = open ? null : d.id),
        ),
        if (open)
          Padding(
            padding: const EdgeInsets.fromLTRB(54, 0, 2, 14),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(d.text, style: RdText.sans(13.5, color: const Color(0xFFC9D2CB), height: 1.55)),
              const SizedBox(height: 8),
              Wrap(crossAxisAlignment: WrapCrossAlignment.center, spacing: 6, children: [
                Text('Questions?', style: RdText.sans(12.5, color: RdColors.muted)),
                Text(_supportEmail, style: RdText.sans(12.5)),
                RdLink('Copy', size: 12, onTap: _copyEmail),
              ]),
            ]),
          ),
      ]));
    }

    final choiceRows = <Widget>[];
    for (var i = 0; i < _choices.length; i++) {
      final c = _choices[i];
      if (i > 0) choiceRows.add(const Divider(height: 1, color: RdColors.line));
      choiceRows.add(RdToggleRow(
        title: c.$2,
        subtitle: c.$3,
        value: s == null ? c.$4 : s.flag('privacy', c.$1, c.$4),
        onChanged: disabled || s == null ? null : (v) => _change(s, c.$1, v),
      ));
    }

    final loadError = settingsAsync != null && settingsAsync.hasError && _local == null ? settingsAsync.error : null;

    return RdPage(
      title: 'Legal & privacy',
      children: [
        RdCard(padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2), child: Column(children: docRows)),
        RdSectionTitle(
          'Your data',
          action: auth.ready && !signedIn ? 'Sign in to manage' : null,
          onAction: () => context.push('/signin?next=${Uri.encodeComponent('/legal')}'),
        ),
        if (loadError != null) RdError(loadError, onRetry: () => ref.invalidate(settingsProvider)),
        Opacity(
          opacity: signedIn ? 1 : .6,
          child: RdCard(padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2), child: Column(children: choiceRows)),
        ),
        RdListGroup(children: [
          signedIn
              ? RdListTile(
                  icon: Icons.download_rounded,
                  title: 'Download my data',
                  subtitle: _exporting ? 'Preparing your data…' : 'Copy your account data (JSON)',
                  onTap: _exporting ? null : _export,
                  trailing: _exporting ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: RdColors.gold)) : null,
                )
              : RdListTile(
                  icon: Icons.download_rounded,
                  title: 'Download my data',
                  subtitle: 'Sign in to get a copy of your data',
                  onTap: () => context.push('/signin?next=${Uri.encodeComponent('/legal')}'),
                ),
        ]),
        if (_exportError.isNotEmpty) RdErrorText(_exportError),
        Text('Ridean is operated by Best My Flight Inc., 1088 Liberty Ave, Brooklyn, NY 11208.', style: RdText.sans(12, color: RdColors.muted, height: 1.5)),
      ],
    );
  }
}
