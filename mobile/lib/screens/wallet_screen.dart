import 'package:flutter/material.dart';
import '../data/mock.dart';
import '../theme/tokens.dart';
import '../widgets/common.dart';

class WalletScreen extends StatelessWidget {
  const WalletScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: RColors.surface,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            Container(
              width: double.infinity,
              color: RColors.navy,
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
              child: const Text('Wallet', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: Colors.white)),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(17),
                      decoration: BoxDecoration(color: RColors.navy, borderRadius: BorderRadius.circular(18)),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('Ridean Credits', style: TextStyle(fontSize: 11, color: RColors.mutedOnDark, fontWeight: FontWeight.w600)),
                                  const SizedBox(height: 2),
                                  Text('\$${walletBalance.toStringAsFixed(2)}', style: const TextStyle(color: Colors.white, fontSize: 27, fontWeight: FontWeight.w800)),
                                ],
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(color: RColors.acc, borderRadius: BorderRadius.circular(RRadius.pill)),
                                child: const Text('RIDEAN+', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: RColors.navy)),
                              ),
                            ],
                          ),
                          const SizedBox(height: 11),
                          Row(
                            children: [
                              Expanded(child: _WalletAction(label: 'Add funds')),
                              const SizedBox(width: 9),
                              Expanded(child: _WalletAction(label: 'Redeem code')),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    RSectionHeader(title: 'Payment methods', action: '+ Add new', onAction: () {}),
                    const SizedBox(height: 9),
                    for (final pm in paymentMethods) ...[
                      RCard(
                        padding: const EdgeInsets.all(12),
                        child: Row(
                          children: [
                            Container(
                              width: 38,
                              height: 26,
                              decoration: BoxDecoration(color: RColors.navy, borderRadius: BorderRadius.circular(6)),
                              alignment: Alignment.center,
                              child: Text(pm.brand.substring(0, 4).toUpperCase(),
                                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 9)),
                            ),
                            const SizedBox(width: 11),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('${pm.brand} •••• ${pm.last4}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: RColors.navy)),
                                  Text('Expires ${pm.expiry}', style: const TextStyle(fontSize: 11, color: RColors.muted)),
                                ],
                              ),
                            ),
                            if (pm.isDefault) const RPill(label: 'Default', tone: 'ok') else const Icon(Icons.more_horiz, color: RColors.muted),
                          ],
                        ),
                      ),
                      const SizedBox(height: 9),
                    ],
                    const SizedBox(height: 7),
                    const Text('Recent activity', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: RColors.navy)),
                    const SizedBox(height: 9),
                    for (final a in walletActivity) ...[
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 11),
                        decoration: BoxDecoration(color: RColors.ground, border: Border.all(color: RColors.line), borderRadius: BorderRadius.circular(RRadius.md)),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(a.title, style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: RColors.navy)),
                                Text(a.date, style: const TextStyle(fontSize: 10.5, color: RColors.muted)),
                              ],
                            ),
                            Text(a.amount,
                                style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: a.positive ? RColors.ok : RColors.bad)),
                          ],
                        ),
                      ),
                      const SizedBox(height: 8),
                    ],
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _WalletAction extends StatelessWidget {
  const _WalletAction({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10),
      decoration: BoxDecoration(color: RColors.navy2, borderRadius: BorderRadius.circular(12)),
      alignment: Alignment.center,
      child: Text(label, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 12.5)),
    );
  }
}
