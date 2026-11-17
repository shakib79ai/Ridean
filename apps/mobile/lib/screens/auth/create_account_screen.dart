import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../api/api_client.dart';
import '../../state/providers.dart';
import '../../theme.dart';
import '../../widgets/kit.dart';

final _emailRe = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$');

/// Only same-app relative paths are allowed as a post-sign-up destination.
String _safeNext(String? next) {
  if (next == null || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return '/';
  return next;
}

class CreateAccountScreen extends ConsumerStatefulWidget {
  const CreateAccountScreen({super.key, this.next});
  final String? next;
  @override
  ConsumerState<CreateAccountScreen> createState() => _CreateAccountScreenState();
}

class _CreateAccountScreenState extends ConsumerState<CreateAccountScreen> {
  final _first = TextEditingController();
  final _last = TextEditingController();
  final _email = TextEditingController();
  final _phone = TextEditingController();
  final _password = TextEditingController();
  bool _terms = false;
  bool _show = false;
  bool _busy = false;
  bool _termsInvalid = false;
  String _error = '';

  @override
  void dispose() {
    _first.dispose();
    _last.dispose();
    _email.dispose();
    _phone.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_busy) return;
    final first = _first.text.trim();
    final last = _last.text.trim();
    final email = _email.text.trim();
    final phone = _phone.text.trim();
    String err = '';
    if (first.isEmpty || last.isEmpty) {
      err = 'Please enter your first and last name.';
    } else if (!_emailRe.hasMatch(email)) {
      err = 'Please enter a valid email address.';
    } else if (phone.isNotEmpty && phone.replaceAll(RegExp(r'\D'), '').length < 6) {
      err = 'Please check your phone number.';
    } else if (_password.text.length < 8) {
      err = 'Your password needs at least 8 characters.';
    } else if (!_terms) {
      err = 'Please agree to the Terms and Privacy policy to continue.';
    }
    if (err.isNotEmpty) {
      setState(() {
        _error = err;
        _termsInvalid = !_terms;
      });
      return;
    }
    setState(() {
      _error = '';
      _termsInvalid = false;
      _busy = true;
    });
    FocusScope.of(context).unfocus();
    try {
      await ref.read(authProvider).register(email: email, password: _password.text, firstName: first, lastName: last, phone: phone.isEmpty ? null : phone);
      if (!mounted) return;
      context.go(_safeNext(widget.next));
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _busy = false;
        _error = errorText(e, 'We couldn’t create your account. Please try again.');
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final next = widget.next;
    final signIn = next != null ? '/signin?next=${Uri.encodeComponent(_safeNext(next))}' : '/signin';
    final linkStyle = RdText.sans(13, color: RdColors.gold);
    return Scaffold(
      backgroundColor: RdColors.bg,
      body: AutofillGroup(
        child: ListView(
          padding: EdgeInsets.only(bottom: 24 + MediaQuery.of(context).padding.bottom),
          children: [
            const _AuthHero(),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                Text('Create your account', style: RdText.serif(28)),
                const SizedBox(height: 14),
                Row(children: [
                  Expanded(
                    child: RdField(
                      label: 'First name',
                      icon: Icons.person_outline,
                      controller: _first,
                      hint: 'First name',
                      textCapitalization: TextCapitalization.words,
                      autofillHints: const [AutofillHints.givenName],
                      textInputAction: TextInputAction.next,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: RdField(
                      label: 'Last name',
                      icon: Icons.person_outline,
                      controller: _last,
                      hint: 'Last name',
                      textCapitalization: TextCapitalization.words,
                      autofillHints: const [AutofillHints.familyName],
                      textInputAction: TextInputAction.next,
                    ),
                  ),
                ]),
                const SizedBox(height: 14),
                RdField(
                  label: 'Email',
                  icon: Icons.mail_outline,
                  controller: _email,
                  hint: 'you@example.com',
                  keyboardType: TextInputType.emailAddress,
                  autofillHints: const [AutofillHints.email],
                  textInputAction: TextInputAction.next,
                ),
                const SizedBox(height: 14),
                RdField(
                  label: 'Phone',
                  icon: Icons.phone_outlined,
                  controller: _phone,
                  hint: '+1 (555) 000-0000',
                  keyboardType: TextInputType.phone,
                  autofillHints: const [AutofillHints.telephoneNumber],
                  textInputAction: TextInputAction.next,
                  maxLength: 32,
                ),
                const SizedBox(height: 14),
                RdField(
                  label: 'Password',
                  icon: Icons.lock_outline,
                  controller: _password,
                  hint: 'At least 8 characters',
                  obscure: !_show,
                  autofillHints: const [AutofillHints.newPassword],
                  textInputAction: TextInputAction.done,
                  onSubmitted: (_) => _submit(),
                  action: RdFieldAction(
                    icon: _show ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                    tooltip: _show ? 'Hide password' : 'Show password',
                    onPressed: () => setState(() => _show = !_show),
                  ),
                ),
                const SizedBox(height: 10),
                Row(crossAxisAlignment: CrossAxisAlignment.center, children: [
                  SizedBox(
                    width: 24,
                    height: 24,
                    child: Checkbox(
                      value: _terms,
                      onChanged: (v) => setState(() {
                        _terms = v ?? false;
                        _termsInvalid = false;
                      }),
                      activeColor: RdColors.yellow,
                      checkColor: RdColors.ink,
                      side: BorderSide(color: _termsInvalid ? RdColors.bad : RdColors.muted, width: 1.5),
                      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      visualDensity: VisualDensity.compact,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Wrap(crossAxisAlignment: WrapCrossAlignment.center, children: [
                      GestureDetector(
                        onTap: () => setState(() {
                          _terms = !_terms;
                          _termsInvalid = false;
                        }),
                        child: Text('I agree to the ', style: RdText.sans(13, color: _termsInvalid ? const Color(0xFFFFB3AC) : RdColors.muted)),
                      ),
                      GestureDetector(onTap: () => context.push('/legal?section=terms'), child: Text('Terms', style: linkStyle)),
                      Text(' and ', style: RdText.sans(13, color: _termsInvalid ? const Color(0xFFFFB3AC) : RdColors.muted)),
                      GestureDetector(onTap: () => context.push('/legal?section=privacy'), child: Text('Privacy policy', style: linkStyle)),
                    ]),
                  ),
                ]),
                if (_error.isNotEmpty) ...[const SizedBox(height: 12), RdErrorText(_error)],
                const SizedBox(height: 14),
                RdCta(label: 'Create account', busy: _busy, onPressed: _submit),
                const SizedBox(height: 20),
                Wrap(alignment: WrapAlignment.center, crossAxisAlignment: WrapCrossAlignment.center, children: [
                  Text('Already have an account? ', style: RdText.sans(14, color: RdColors.muted)),
                  GestureDetector(onTap: () => context.go(signIn), child: Text('Sign in', style: RdText.sans(14, weight: FontWeight.w600, color: RdColors.gold))),
                ]),
              ]),
            ),
          ],
        ),
      ),
    );
  }
}

/// Hero photo, gradient, gold wordmark and tagline at the top of the auth boards.
class _AuthHero extends StatelessWidget {
  const _AuthHero();
  @override
  Widget build(BuildContext context) {
    final top = MediaQuery.of(context).padding.top;
    return SizedBox(
      height: 250 + top,
      child: Stack(fit: StackFit.expand, children: [
        Image.asset('assets/images/hero.jpg', fit: BoxFit.cover, alignment: const Alignment(0, -.2)),
        const DecoratedBox(
          decoration: BoxDecoration(
            gradient: LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter, colors: [Color(0x59071A14), RdColors.bg]),
          ),
        ),
        Positioned(top: top + 12, left: 16, child: const RdBackButton(onPhoto: true)),
        Positioned(
          left: 24,
          right: 24,
          bottom: 20,
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const RdWordmark(size: 40, withSlogan: true),
            const SizedBox(height: 4),
            Text('Arrive exceptionally.', style: RdText.sans(14, color: RdColors.soft)),
          ]),
        ),
      ]),
    );
  }
}
