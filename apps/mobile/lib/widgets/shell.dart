import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class AppShell extends StatelessWidget {
  const AppShell({super.key, required this.location, required this.child});
  final String location;
  final Widget child;

  static const _tabs = ['/', '/trips', '/wallet', '/account'];

  @override
  Widget build(BuildContext context) {
    final idx = _tabs.lastIndexWhere((t) => t == '/' ? location == '/' : location.startsWith(t)).clamp(0, 3);
    return Scaffold(
      body: SafeArea(bottom: false, child: child),
      bottomNavigationBar: NavigationBar(
        selectedIndex: idx,
        onDestinationSelected: (i) => context.go(_tabs[i]),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.receipt_long_outlined), selectedIcon: Icon(Icons.receipt_long), label: 'Trips'),
          NavigationDestination(icon: Icon(Icons.account_balance_wallet_outlined), selectedIcon: Icon(Icons.account_balance_wallet), label: 'Wallet'),
          NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Account'),
        ],
      ),
    );
  }
}
