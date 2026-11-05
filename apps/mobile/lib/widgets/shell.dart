import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../theme.dart';

class _Tab {
  final String path, label;
  final IconData icon, activeIcon;
  const _Tab(this.path, this.label, this.icon, this.activeIcon);
}

const _tabs = [
  _Tab('/', 'Home', Icons.home_outlined, Icons.home_rounded),
  _Tab('/trips', 'Trips', Icons.receipt_long_outlined, Icons.receipt_long),
  _Tab('/wallet', 'Wallet', Icons.account_balance_wallet_outlined, Icons.account_balance_wallet),
  _Tab('/account', 'Account', Icons.person_outline_rounded, Icons.person_rounded),
];

/// Bottom tab shell for Home, Trips, Wallet and Account.
/// iOS: flat bar with yellow active icon/label. Android: Material 3 bar with a gold pill indicator.
class AppShell extends StatelessWidget {
  const AppShell({super.key, required this.location, required this.child});
  final String location;
  final Widget child;

  int get _index {
    for (var i = _tabs.length - 1; i > 0; i--) {
      if (location.startsWith(_tabs[i].path)) return i;
    }
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    final i = _index;
    return Scaffold(
      backgroundColor: RdColors.bg,
      body: child,
      bottomNavigationBar: isCupertino(context) ? _IosTabBar(index: i) : _AndroidTabBar(index: i),
    );
  }
}

class _IosTabBar extends StatelessWidget {
  const _IosTabBar({required this.index});
  final int index;
  @override
  Widget build(BuildContext context) {
    final bottom = MediaQuery.of(context).padding.bottom;
    return Container(
      padding: EdgeInsets.fromLTRB(8, 0, 8, bottom > 0 ? bottom : 12),
      decoration: const BoxDecoration(color: Color(0xFF06140F), border: Border(top: BorderSide(color: RdColors.line))),
      child: Row(children: [
        for (var k = 0; k < _tabs.length; k++)
          Expanded(
            child: Semantics(
              selected: k == index,
              button: true,
              label: _tabs[k].label,
              excludeSemantics: true,
              child: InkResponse(
                onTap: () => context.go(_tabs[k].path),
                child: Padding(
                  padding: const EdgeInsets.only(top: 10, bottom: 4),
                  child: Column(mainAxisSize: MainAxisSize.min, children: [
                    Icon(k == index ? _tabs[k].activeIcon : _tabs[k].icon, size: 24, color: k == index ? RdColors.yellow : RdColors.cream),
                    const SizedBox(height: 4),
                    Text(_tabs[k].label,
                        style: RdText.sans(11.5, weight: k == index ? FontWeight.w700 : FontWeight.w500, color: k == index ? RdColors.yellow : RdColors.cream)),
                  ]),
                ),
              ),
            ),
          ),
      ]),
    );
  }
}

class _AndroidTabBar extends StatelessWidget {
  const _AndroidTabBar({required this.index});
  final int index;
  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: const BoxDecoration(border: Border(top: BorderSide(color: RdColors.line))),
      child: NavigationBarTheme(
        data: NavigationBarThemeData(
          backgroundColor: const Color(0xFF06140F),
          surfaceTintColor: Colors.transparent,
          indicatorColor: const Color(0x2EF6C428),
          height: 72,
          labelTextStyle: WidgetStateProperty.resolveWith((s) => RdText.sans(12,
              weight: s.contains(WidgetState.selected) ? FontWeight.w700 : FontWeight.w500, color: s.contains(WidgetState.selected) ? RdColors.yellow : RdColors.cream)),
          iconTheme: WidgetStateProperty.resolveWith((s) => IconThemeData(size: 24, color: s.contains(WidgetState.selected) ? RdColors.yellow : RdColors.cream)),
        ),
        child: NavigationBar(
          selectedIndex: index,
          onDestinationSelected: (k) => context.go(_tabs[k].path),
          destinations: [
            for (final t in _tabs) NavigationDestination(icon: Icon(t.icon), selectedIcon: Icon(t.activeIcon), label: t.label),
          ],
        ),
      ),
    );
  }
}
