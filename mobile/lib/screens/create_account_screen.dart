import 'package:flutter/material.dart';
import '../theme/tokens.dart';
import '../widgets/common.dart';
import '../widgets/hero_header.dart';
import '../widgets/app_shell.dart';

class CreateAccountScreen extends StatelessWidget {
  const CreateAccountScreen({super.key});

  static const benefits = [
    'Easily manage all your bookings',
    'Faster bookings with saved details',
    "Streamlined pickup with driver's license verification",
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: RColors.navy,
      body: SafeArea(
        child: Column(
          children: [
            const HeroHeader(title: ''),
            RSheet(
              children: [
                const Text('CREATE AN ACCOUNT', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w800, color: RColors.navy)),
                const SizedBox(height: 4),
                for (final b in benefits) ...[
                  Row(
                    children: [
                      Container(
                        width: 22,
                        height: 22,
                        decoration: const BoxDecoration(color: RColors.acc, shape: BoxShape.circle),
                        alignment: Alignment.center,
                        child: const Icon(Icons.check, size: 13, color: RColors.navy),
                      ),
                      const SizedBox(width: 10),
                      Expanded(child: Text(b, style: const TextStyle(fontSize: 13, color: RColors.navy))),
                    ],
                  ),
                  const SizedBox(height: 4),
                ],
                const SizedBox(height: 8),
                const RField(label: 'Email', placeholder: 'you@example.com'),
                const SizedBox(height: 16),
                RButton(
                  label: 'Continue',
                  variant: RButtonVariant.accent,
                  onPressed: () => Navigator.of(context).pushAndRemoveUntil(
                    MaterialPageRoute(builder: (_) => const AppShell()),
                    (route) => false,
                  ),
                ),
                const SizedBox(height: 16),
                const RDivider(label: 'or continue with'),
                const SizedBox(height: 16),
                Row(
                  children: const [
                    Expanded(child: _SocialBtn(label: 'Apple')),
                    SizedBox(width: 10),
                    Expanded(child: _SocialBtn(label: 'Google')),
                  ],
                ),
                const SizedBox(height: 16),
                const RDivider(label: 'Already have an account?'),
                const SizedBox(height: 16),
                RButton(
                  label: 'Log in',
                  variant: RButtonVariant.secondary,
                  onPressed: () => Navigator.of(context).maybePop(),
                ),
                const SizedBox(height: 14),
                const Text(
                  'See our policies for privacy, analytics and accessibility. (Imprint)',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 10.5, color: RColors.mutedOnDark),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _SocialBtn extends StatelessWidget {
  const _SocialBtn({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12),
      decoration: BoxDecoration(border: Border.all(color: RColors.line), borderRadius: BorderRadius.circular(RRadius.md)),
      alignment: Alignment.center,
      child: Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: RColors.navy)),
    );
  }
}
