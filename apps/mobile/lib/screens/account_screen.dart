import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../state/providers.dart';
import '../theme.dart';

class AccountScreen extends ConsumerWidget {
  const AccountScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);
    final u = auth.user;
    if (u == null) return const SizedBox.shrink();
    return ListView(padding: const EdgeInsets.all(16), children: [
      Text('Account', style: Theme.of(context).textTheme.headlineLarge),
      const SizedBox(height: 12),
      Card(
        child: ListTile(
          contentPadding: const EdgeInsets.all(16),
          leading: CircleAvatar(backgroundColor: RdColors.surface2, child: Text(u.firstName.isNotEmpty ? u.firstName[0] : '?', style: const TextStyle(color: RdColors.gold))),
          title: Text('${u.firstName} ${u.lastName}', style: const TextStyle(fontWeight: FontWeight.w600)),
          subtitle: Text('${u.email}${u.phone != null ? '\n${u.phone}' : ''}'),
        ),
      ),
      const SizedBox(height: 12),
      ListTile(leading: const Icon(Icons.help_outline), title: const Text('Help centre'), onTap: () => launchUrl(Uri.parse('https://ridean.com/help'))),
      ListTile(leading: const Icon(Icons.description_outlined), title: const Text('Terms & privacy'), onTap: () => launchUrl(Uri.parse('https://ridean.com/legal'))),
      const SizedBox(height: 12),
      OutlinedButton(
        onPressed: () async {
          await ref.read(authProvider).logout();
          if (context.mounted) context.go('/');
        },
        child: const Text('Sign out'),
      ),
    ]);
  }
}
