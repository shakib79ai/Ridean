import 'package:flutter/material.dart';
import '../data/mock.dart';
import '../theme/tokens.dart';
import '../widgets/common.dart';
import '../widgets/hero_header.dart';
import '../widgets/app_shell.dart';
import 'create_account_screen.dart';

class SignInScreen extends StatelessWidget {
  const SignInScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: RColors.navy,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: const BoxDecoration(color: RColors.navy2, shape: BoxShape.circle),
                    alignment: Alignment.center,
                    child: const Icon(Icons.close, color: Colors.white, size: 18),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                    decoration: BoxDecoration(color: RColors.navy2, borderRadius: BorderRadius.circular(RRadius.pill)),
                    child: const Text('Settings', style: TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.w700)),
                  ),
                ],
              ),
            ),
            Expanded(
              child: Container(
                margin: const EdgeInsets.only(top: 16),
                width: double.infinity,
                decoration: const BoxDecoration(
                  color: RColors.surface,
                  borderRadius: BorderRadius.only(topLeft: Radius.circular(20), topRight: Radius.circular(20)),
                ),
                padding: const EdgeInsets.fromLTRB(24, 28, 24, 24),
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const RideanMark(size: 28),
                          const SizedBox(width: 9),
                          RichText(
                            text: const TextSpan(
                              style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: RColors.navy),
                              children: [
                                TextSpan(text: 'Ride'),
                                TextSpan(text: 'an', style: TextStyle(color: RColors.acc)),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      const Text('Mobility, on your terms.', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600, color: RColors.muted)),
                      const SizedBox(height: 18),
                      const Text('WELCOME BACK', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w800, color: RColors.navy)),
                      const SizedBox(height: 4),
                      const Text('Enter your email to enjoy the best experience.', style: TextStyle(fontSize: 13, color: RColors.muted)),
                      const SizedBox(height: 16),
                      RField(label: 'Email', value: rUser.email),
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
                      const RDivider(label: 'or log in with'),
                      const SizedBox(height: 16),
                      Row(
                        children: const [
                          Expanded(child: _SocialBtn(label: 'Apple')),
                          SizedBox(width: 10),
                          Expanded(child: _SocialBtn(label: 'Google')),
                        ],
                      ),
                      const SizedBox(height: 16),
                      const RDivider(label: "Don't have an account?"),
                      const SizedBox(height: 16),
                      RButton(
                        label: 'Create account',
                        variant: RButtonVariant.secondary,
                        onPressed: () => Navigator.of(context).push(
                          MaterialPageRoute(builder: (_) => const CreateAccountScreen()),
                        ),
                      ),
                      const SizedBox(height: 14),
                      const Text(
                        'See our policies for privacy, analytics and accessibility. (Imprint)',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 10.5, color: RColors.mutedOnDark),
                      ),
                    ],
                  ),
                ),
              ),
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
