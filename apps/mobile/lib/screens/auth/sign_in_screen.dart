import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../api/api_client.dart';
import '../../state/providers.dart';
import '../../theme.dart';
import '../../widgets/kit.dart';

/// Only same-app relative paths are allowed as a post-sign-in destination.
String _safeNext(String? next) {
  if (next == null || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return '/';
  return next;
}

class SignInScreen extends ConsumerStatefulWidget {
  const SignInScreen({super.key, this.next});
  final String? next;
  @override
  ConsumerState<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends ConsumerState<SignInScreen> {
  final _email = TextEditingController();
  final _phone = TextEditingController();
  final _password = TextEditingController();
  String _via = 'email';
  bool _show = false;
  bool _busy = false;
  String _error = '';

  @override
  void dispose() {
    _email.dispose();
    _phone.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_busy) return;
    final id = (_via == 'email' ? _email.text : _phone.text).trim();
    String err = '';
    if (id.isEmpty) {
      err = _via == 'email' ? 'Enter your email address.' : 'Enter your phone number.';
    } else if (_password.text.isEmpty) {
      err = 'Enter your password.';
    }
    if (err.isNotEmpty) {
      setState(() => _error = err);
      return;
    }
    setState(() {
      _error = '';
      _busy = true;
    });
    FocusScope.of(context).unfocus();
    try {
      final auth = ref.read(authProvider);
      if (_via == 'email') {
        await auth.login(id, _password.text);
      } else {
        await auth.loginWithPhone(id, _password.text);
      }
      if (!mounted) return;
      context.go(_safeNext(widget.next));
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _busy = false;
        _error = errorText(e, 'We couldn’t sign you in. Please try again.');
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final next = widget.next;
    final signUp = next != null ? '/signup?next=${Uri.encodeComponent(_safeNext(next))}' : '/signup';
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
                Text('Welcome back', style: RdText.serif(28)),
                const SizedBox(height: 14),
                RdSegmented<String>(
                  options: const [('email', 'Email'), ('phone', 'Phone')],
                  value: _via,
                  onChanged: (v) => setState(() {
                    _via = v;
                    _error = '';
                  }),
                ),
                const SizedBox(height: 14),
                if (_via == 'email')
                  RdField(
                    key: const ValueKey('email'),
                    label: 'Email',
                    icon: Icons.mail_outline,
                    controller: _email,
                    hint: 'you@example.com',
                    keyboardType: TextInputType.emailAddress,
                    autofillHints: const [AutofillHints.email, AutofillHints.username],
                    textInputAction: TextInputAction.next,
                  )
                else
                  RdField(
                    key: const ValueKey('phone'),
                    label: 'Phone number',
                    icon: Icons.phone_outlined,
                    controller: _phone,
                    hint: '+1 (555) 000-0000',
                    keyboardType: TextInputType.phone,
                    autofillHints: const [AutofillHints.telephoneNumber],
                    textInputAction: TextInputAction.next,
                  ),
                const SizedBox(height: 14),
                RdField(
                  label: 'Password',
                  icon: Icons.lock_outline,
                  controller: _password,
                  hint: 'Your password',
                  obscure: !_show,
                  autofillHints: const [AutofillHints.password],
                  textInputAction: TextInputAction.done,
                  onSubmitted: (_) => _submit(),
                  action: RdFieldAction(
                    icon: _show ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                    tooltip: _show ? 'Hide password' : 'Show password',
                    onPressed: () => setState(() => _show = !_show),
                  ),
                ),
                const SizedBox(height: 6),
                // No password-reset endpoint exists: route to Help, as the PWA does.
                Align(alignment: Alignment.centerRight, child: RdLink('Forgot password?', size: 13.5, onTap: () => context.push('/help'))),
                if (_error.isNotEmpty) ...[const SizedBox(height: 8), RdErrorText(_error)],
                const SizedBox(height: 10),
                RdCta(label: 'Sign in', busy: _busy, onPressed: _submit),
                const SizedBox(height: 20),
                _SwitchLink(text: 'New to Ridean?', link: 'Create an account', onTap: () => context.go(signUp)),
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
            const RdWordmark(size: 40),
            const SizedBox(height: 4),
            Text('Arrive exceptionally.', style: RdText.sans(14, color: RdColors.soft)),
          ]),
        ),
      ]),
    );
  }
}

class _SwitchLink extends StatelessWidget {
  const _SwitchLink({required this.text, required this.link, required this.onTap});
  final String text, link;
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) {
    return Wrap(alignment: WrapAlignment.center, crossAxisAlignment: WrapCrossAlignment.center, children: [
      Text('$text ', style: RdText.sans(14, color: RdColors.muted)),
      GestureDetector(onTap: onTap, child: Text(link, style: RdText.sans(14, weight: FontWeight.w600, color: RdColors.gold))),
    ]);
  }
}
