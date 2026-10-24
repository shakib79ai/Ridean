import 'package:flutter/material.dart';
import '../theme/tokens.dart';
import '../widgets/common.dart';
import '../widgets/hero_header.dart';
import 'legal_privacy_screen.dart';
import 'sign_in_screen.dart';

class AppSettingsScreen extends StatefulWidget {
  const AppSettingsScreen({super.key});

  @override
  State<AppSettingsScreen> createState() => _AppSettingsScreenState();
}

class _AppSettingsScreenState extends State<AppSettingsScreen> {
  bool _rideUpdates = true;
  bool _promotions = false;
  bool _darkMode = false;

  Future<void> _confirmDelete() async {
    final confirmed = await showModalBottomSheet<bool>(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        decoration: const BoxDecoration(
          color: RColors.surface,
          borderRadius: BorderRadius.only(topLeft: Radius.circular(20), topRight: Radius.circular(20)),
        ),
        padding: const EdgeInsets.fromLTRB(20, 24, 20, 28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Delete your account?', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: RColors.navy)),
            const SizedBox(height: 8),
            const Text('This permanently removes your profile, trip history, and saved payment methods.',
                style: TextStyle(fontSize: 13, color: RColors.muted)),
            const SizedBox(height: 18),
            RButton(label: 'Delete account', variant: RButtonVariant.primary, onPressed: () => Navigator.of(ctx).pop(true)),
            const SizedBox(height: 10),
            RButton(label: 'Cancel', variant: RButtonVariant.secondary, onPressed: () => Navigator.of(ctx).pop(false)),
          ],
        ),
      ),
    );
    if (confirmed == true && mounted) {
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const SignInScreen()),
        (route) => false,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: RColors.navy,
      body: SafeArea(
        child: Column(
          children: [
            const HeroHeader(title: 'Settings'),
            RSheet(
              children: [
                const RSectionHeader(title: 'Notifications'),
                _toggleRow('Ride updates', 'Pickup, driver arrival & trip status', _rideUpdates, (v) => setState(() => _rideUpdates = v)),
                _toggleRow('Promotions', 'Offers, Ridean+ and partner deals', _promotions, (v) => setState(() => _promotions = v)),
                const SizedBox(height: 8),
                const RSectionHeader(title: 'Appearance'),
                InkWell(
                  onTap: () {},
                  child: RCard(
                    child: Row(
                      children: const [
                        Expanded(child: Text('Language', style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w600, color: RColors.navy))),
                        Text('English', style: TextStyle(fontSize: 13, color: RColors.muted)),
                        SizedBox(width: 6),
                        Icon(Icons.chevron_right, size: 18, color: RColors.mutedOnDark),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                _toggleRow('Dark mode', 'Use a dark app theme', _darkMode, (v) => setState(() => _darkMode = v)),
                const SizedBox(height: 8),
                InkWell(
                  onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const LegalPrivacyScreen())),
                  child: RCard(
                    child: Row(
                      children: const [
                        Expanded(child: Text('Privacy policy', style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w600, color: RColors.navy))),
                        Icon(Icons.chevron_right, size: 18, color: RColors.mutedOnDark),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 18),
                Center(
                  child: TextButton(
                    onPressed: () => Navigator.of(context).pushAndRemoveUntil(
                      MaterialPageRoute(builder: (_) => const SignInScreen()),
                      (route) => false,
                    ),
                    child: const Text('Sign out', style: TextStyle(color: RColors.navy, fontWeight: FontWeight.w700)),
                  ),
                ),
                Center(
                  child: TextButton(
                    onPressed: _confirmDelete,
                    child: const Text('Delete account', style: TextStyle(color: RColors.bad, fontWeight: FontWeight.w700)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _toggleRow(String title, String sub, bool value, ValueChanged<bool> onChanged) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: RCard(
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700, color: RColors.navy)),
                  Text(sub, style: const TextStyle(fontSize: 11.5, color: RColors.muted)),
                ],
              ),
            ),
            Switch(value: value, activeColor: RColors.acc, onChanged: onChanged),
          ],
        ),
      ),
    );
  }
}
