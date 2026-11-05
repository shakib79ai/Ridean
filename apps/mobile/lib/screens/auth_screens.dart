import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../state/providers.dart';
import '../theme.dart';

class SignInScreen extends ConsumerStatefulWidget {
  const SignInScreen({super.key, this.next});
  final String? next;
  @override
  ConsumerState<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends ConsumerState<SignInScreen> {
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _busy = false;
  String? _error;

  Future<void> _submit() async {
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await ref.read(authProvider).login(_email.text.trim(), _password.text);
      if (mounted) context.go(widget.next ?? '/');
    } catch (e) {
      setState(() => _error = '$e');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(),
        body: ListView(padding: const EdgeInsets.all(20), children: [
          Text('Welcome back', style: Theme.of(context).textTheme.headlineLarge),
          const SizedBox(height: 20),
          TextField(controller: _email, keyboardType: TextInputType.emailAddress, autofillHints: const [AutofillHints.email], decoration: const InputDecoration(labelText: 'Email')),
          const SizedBox(height: 12),
          TextField(controller: _password, obscureText: true, autofillHints: const [AutofillHints.password], decoration: const InputDecoration(labelText: 'Password'), onSubmitted: (_) => _submit()),
          if (_error != null) Padding(padding: const EdgeInsets.only(top: 12), child: Text(_error!, style: const TextStyle(color: RdColors.bad))),
          const SizedBox(height: 20),
          FilledButton(onPressed: _busy ? null : _submit, child: Text(_busy ? 'Signing in…' : 'Sign in')),
          TextButton(onPressed: () => context.pushReplacement('/signup${widget.next != null ? '?next=${Uri.encodeComponent(widget.next!)}' : ''}'), child: const Text('New to Ridean? Create an account')),
        ]),
      );
}

class SignUpScreen extends ConsumerStatefulWidget {
  const SignUpScreen({super.key, this.next});
  final String? next;
  @override
  ConsumerState<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends ConsumerState<SignUpScreen> {
  final _f = {for (final k in ['firstName', 'lastName', 'email', 'phone', 'password']) k: TextEditingController()};
  bool _busy = false;
  String? _error;

  Future<void> _submit() async {
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await ref.read(authProvider).register({for (final e in _f.entries) if (e.value.text.trim().isNotEmpty) e.key: e.key == 'password' ? e.value.text : e.value.text.trim()});
      if (mounted) context.go(widget.next ?? '/');
    } catch (e) {
      setState(() => _error = '$e');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(),
        body: ListView(padding: const EdgeInsets.all(20), children: [
          Text('Create your account', style: Theme.of(context).textTheme.headlineLarge),
          const SizedBox(height: 20),
          Row(children: [
            Expanded(child: TextField(controller: _f['firstName'], decoration: const InputDecoration(labelText: 'First name'))),
            const SizedBox(width: 10),
            Expanded(child: TextField(controller: _f['lastName'], decoration: const InputDecoration(labelText: 'Last name'))),
          ]),
          const SizedBox(height: 12),
          TextField(controller: _f['email'], keyboardType: TextInputType.emailAddress, decoration: const InputDecoration(labelText: 'Email')),
          const SizedBox(height: 12),
          TextField(controller: _f['phone'], keyboardType: TextInputType.phone, decoration: const InputDecoration(labelText: 'Mobile number')),
          const SizedBox(height: 12),
          TextField(controller: _f['password'], obscureText: true, decoration: const InputDecoration(labelText: 'Password (min 8 characters)')),
          if (_error != null) Padding(padding: const EdgeInsets.only(top: 12), child: Text(_error!, style: const TextStyle(color: RdColors.bad))),
          const SizedBox(height: 20),
          FilledButton(onPressed: _busy ? null : _submit, child: Text(_busy ? 'Creating…' : 'Create account')),
        ]),
      );
}
