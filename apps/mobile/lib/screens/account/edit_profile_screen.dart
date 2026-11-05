// Edit profile — board "EditProfile". Mirrors apps/pwa/src/app/account/edit/page.tsx.
// PATCH /me accepts firstName, lastName and phone only, so the email field is read-only.
// Left out (no backend): "Change photo" — there is no avatar upload endpoint.
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../api/api_client.dart';
import '../../state/providers.dart';
import '../../theme.dart';
import '../../widgets/kit.dart';

class EditProfileScreen extends ConsumerStatefulWidget {
  const EditProfileScreen({super.key});
  @override
  ConsumerState<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends ConsumerState<EditProfileScreen> {
  final _first = TextEditingController();
  final _last = TextEditingController();
  final _phone = TextEditingController();
  bool? _receipts;
  bool? _quiet;
  bool _busy = false;
  String _error = '';

  @override
  void initState() {
    super.initState();
    final u = ref.read(authProvider).user;
    if (u != null) {
      _first.text = u.firstName;
      _last.text = u.lastName;
      _phone.text = u.phone ?? '';
    }
  }

  @override
  void dispose() {
    _first.dispose();
    _last.dispose();
    _phone.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final first = _first.text.trim();
    final last = _last.text.trim();
    final phone = _phone.text.trim();
    if (first.isEmpty || last.isEmpty) {
      setState(() => _error = 'Please enter your first and last name.');
      return;
    }
    setState(() {
      _error = '';
      _busy = true;
    });
    final api = ref.read(apiProvider);
    final s = ref.read(settingsProvider).valueOrNull;
    try {
      final u = await api.updateMe(firstName: first, lastName: last, phone: phone.isEmpty ? null : phone);
      if (s != null) {
        final prevReceipts = s.flag('ride', 'receiptsByEmail', true);
        final prevQuiet = s.flag('ride', 'quietRide');
        final r = _receipts ?? prevReceipts;
        final q = _quiet ?? prevQuiet;
        if (r != prevReceipts || q != prevQuiet) {
          await api.updateSettings({
            'ride': {'receiptsByEmail': r, 'quietRide': q},
          });
        }
      }
      if (!mounted) return;
      ref.read(authProvider).setUser(u);
      ref.invalidate(settingsProvider);
      showRdToast(context, 'Profile saved');
      if (context.canPop()) {
        context.pop();
      } else {
        context.go('/account');
      }
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
    final user = ref.watch(authProvider).user;
    final settings = ref.watch(settingsProvider);
    final s = settings.valueOrNull;

    Widget toggles;
    if (s != null) {
      final receipts = _receipts ?? s.flag('ride', 'receiptsByEmail', true);
      final quiet = _quiet ?? s.flag('ride', 'quietRide');
      toggles = RdListGroup(children: [
        RdToggleRow(title: 'Ride receipts by email', value: receipts, onChanged: _busy ? null : (v) => setState(() => _receipts = v)),
        RdToggleRow(title: 'Quiet ride by default', subtitle: 'Chauffeur keeps conversation to a minimum', value: quiet, onChanged: _busy ? null : (v) => setState(() => _quiet = v)),
      ]);
    } else if (settings.hasError) {
      toggles = RdError(settings.error!, onRetry: () => ref.invalidate(settingsProvider));
    } else {
      toggles = const RdLoading(height: 130);
    }

    return RdPage(
      title: 'Edit profile',
      onBack: () {
        if (context.canPop()) {
          context.pop();
        } else {
          context.go('/account');
        }
      },
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 6),
          child: Center(child: RdAvatar(user?.initials ?? '', size: 88)),
        ),
        RdCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: rdGap([
              RdField(
                label: 'First name',
                icon: Icons.person_outline_rounded,
                controller: _first,
                textCapitalization: TextCapitalization.words,
                autofillHints: const [AutofillHints.givenName],
                textInputAction: TextInputAction.next,
              ),
              RdField(
                label: 'Last name',
                icon: Icons.person_outline_rounded,
                controller: _last,
                textCapitalization: TextCapitalization.words,
                autofillHints: const [AutofillHints.familyName],
                textInputAction: TextInputAction.next,
              ),
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Opacity(opacity: .6, child: RdField(label: 'Email', icon: Icons.mail_outline_rounded, value: user?.email ?? '')),
                const SizedBox(height: 6),
                Text('Contact support to change your email', style: RdText.sans(12, color: RdColors.muted)),
              ]),
              RdField(
                label: 'Phone',
                icon: Icons.phone_outlined,
                controller: _phone,
                hint: '+1 212 555 0100',
                keyboardType: TextInputType.phone,
                autofillHints: const [AutofillHints.telephoneNumber],
                textInputAction: TextInputAction.done,
                onSubmitted: (_) => _save(),
              ),
            ], 12),
          ),
        ),
        toggles,
        if (_error.isNotEmpty) RdErrorText(_error),
        RdCta(label: 'Save changes', arrow: false, busy: _busy, onPressed: user == null ? null : _save),
      ],
    );
  }
}
