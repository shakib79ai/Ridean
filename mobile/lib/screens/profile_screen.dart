import 'package:flutter/material.dart';
import '../data/mock.dart';
import '../theme/tokens.dart';
import 'sign_in_screen.dart';
import 'trips_screen.dart';
import 'wallet_screen.dart';
import 'edit_profile_screen.dart';
import 'payment_methods_screen.dart';
import 'saved_addresses_screen.dart';
import 'invoices_screen.dart';
import 'business_account_screen.dart';
import 'help_support_screen.dart';
import 'app_settings_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: RColors.surface,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            GestureDetector(
              onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const EditProfileScreen())),
              child: Container(
                width: double.infinity,
                color: RColors.navy,
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 28),
                child: Column(
                  children: [
                    CircleAvatar(
                      radius: 32,
                      backgroundColor: RColors.navy2,
                      child: Text(rUser.name.substring(0, 1),
                          style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: Colors.white)),
                    ),
                    const SizedBox(height: 10),
                    Text(rUser.name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Colors.white)),
                    const SizedBox(height: 3),
                    Text(rUser.email, style: const TextStyle(fontSize: 12, color: RColors.mutedOnDark)),
                    const SizedBox(height: 10),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                      decoration: BoxDecoration(color: RColors.navy2, borderRadius: BorderRadius.circular(RRadius.pill)),
                      child: Text('⭐ ${rUser.rating} · Member since ${rUser.memberSince}',
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: RColors.acc)),
                    ),
                  ],
                ),
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  _MenuRow(
                    label: 'Trip history',
                    subtitle: 'Past rides & receipts',
                    onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const TripsScreen())),
                  ),
                  const SizedBox(height: 9),
                  _MenuRow(
                    label: 'Payments & wallet',
                    subtitle: 'Balance & transactions',
                    onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const WalletScreen())),
                  ),
                  const SizedBox(height: 9),
                  _MenuRow(
                    label: 'Payment methods',
                    subtitle: 'Cards & billing',
                    onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const PaymentMethodsScreen())),
                  ),
                  const SizedBox(height: 9),
                  _MenuRow(
                    label: 'Saved addresses',
                    subtitle: 'Home, work & more',
                    onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const SavedAddressesScreen())),
                  ),
                  const SizedBox(height: 9),
                  _MenuRow(
                    label: 'Invoices',
                    subtitle: 'Receipts & ride history',
                    onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const InvoicesScreen())),
                  ),
                  const SizedBox(height: 9),
                  _MenuRow(
                    label: 'Business account',
                    subtitle: 'Company travel & expensing',
                    onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const BusinessAccountScreen())),
                  ),
                  const SizedBox(height: 9),
                  _MenuRow(
                    label: 'Settings',
                    subtitle: 'Notifications, language & app',
                    onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const AppSettingsScreen())),
                  ),
                  const SizedBox(height: 9),
                  _MenuRow(
                    label: 'Help & support',
                    subtitle: 'Help center & live chat',
                    onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const HelpSupportScreen())),
                  ),
                  const SizedBox(height: 18),
                  Center(
                    child: TextButton(
                      onPressed: () => Navigator.of(context).pushAndRemoveUntil(
                        MaterialPageRoute(builder: (_) => const SignInScreen()),
                        (route) => false,
                      ),
                      child: const Text('Sign out', style: TextStyle(color: RColors.bad, fontWeight: FontWeight.w700)),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MenuRow extends StatelessWidget {
  const _MenuRow({required this.label, this.subtitle, required this.onTap});

  final String label;
  final String? subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: RColors.surface,
          border: Border.all(color: RColors.line),
          borderRadius: BorderRadius.circular(RRadius.md),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w700, color: RColors.navy)),
                  if (subtitle != null) ...[
                    const SizedBox(height: 2),
                    Text(subtitle!, style: const TextStyle(fontSize: 12, color: RColors.muted)),
                  ],
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: RColors.muted),
          ],
        ),
      ),
    );
  }
}
