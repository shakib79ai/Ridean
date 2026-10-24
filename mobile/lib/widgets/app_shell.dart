import 'package:flutter/material.dart';
import '../theme/tokens.dart';
import '../screens/home_screen.dart';
import '../screens/trips_screen.dart';
import '../screens/wallet_screen.dart';
import '../screens/profile_screen.dart';

/// Bottom-tab shell: Home, Trips, Wallet, Profile — matches the web/PWA/RN
/// 4-5 tab pattern (Help folded into Profile's menu here for brevity).
class AppShell extends StatefulWidget {
  const AppShell({super.key});

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  int _index = 0;

  static const _screens = [
    HomeScreen(),
    TripsScreen(),
    WalletScreen(),
    ProfileScreen(),
  ];

  static const _tabs = [
    (icon: Icons.home_rounded, label: 'Home'),
    (icon: Icons.receipt_long_rounded, label: 'Trips'),
    (icon: Icons.credit_card_rounded, label: 'Wallet'),
    (icon: Icons.person_rounded, label: 'Profile'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: _index, children: _screens),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: RColors.surface,
          border: Border(top: BorderSide(color: RColors.line)),
        ),
        padding: const EdgeInsets.only(top: 8, bottom: 10),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: List.generate(_tabs.length, (i) {
            final active = i == _index;
            final tab = _tabs[i];
            return GestureDetector(
              onTap: () => setState(() => _index = i),
              behavior: HitTestBehavior.opaque,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    padding: active
                        ? const EdgeInsets.symmetric(horizontal: 16, vertical: 6)
                        : const EdgeInsets.only(top: 6),
                    decoration: active
                        ? BoxDecoration(color: RColors.acc, borderRadius: BorderRadius.circular(RRadius.lg))
                        : null,
                    child: Icon(
                      tab.icon,
                      size: 20,
                      color: active ? RColors.navy : RColors.mutedOnDark,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    tab.label,
                    style: TextStyle(
                      fontSize: 10.5,
                      fontWeight: FontWeight.w700,
                      color: active ? RColors.navy : RColors.mutedOnDark,
                    ),
                  ),
                ],
              ),
            );
          }),
        ),
      ),
    );
  }
}
