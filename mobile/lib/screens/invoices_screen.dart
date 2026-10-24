import 'package:flutter/material.dart';
import '../data/mock.dart';
import '../theme/tokens.dart';
import '../widgets/common.dart';
import '../widgets/hero_header.dart';
import 'invoice_detail_screen.dart';

class InvoicesScreen extends StatelessWidget {
  const InvoicesScreen({super.key});

  Color _toneBg(String tone) {
    switch (tone) {
      case 'warn':
        return RColors.warnBg;
      case 'ok':
        return RColors.okBg;
      case 'info':
      default:
        return RColors.infoBg;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: RColors.navy,
      body: SafeArea(
        child: Column(
          children: [
            const HeroHeader(
              title: 'Invoices',
              subtitle: 'Receipts for every completed ride, transfer and rental.',
            ),
            RSheet(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        decoration: BoxDecoration(
                          color: RColors.ground,
                          border: Border.all(color: RColors.line),
                          borderRadius: BorderRadius.circular(RRadius.md),
                        ),
                        alignment: Alignment.center,
                        child: const Column(
                          children: [
                            Text('14', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: RColors.navy)),
                            SizedBox(height: 2),
                            Text('Trips this year', style: TextStyle(fontSize: 11, color: RColors.muted)),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        decoration: BoxDecoration(
                          color: RColors.ground,
                          border: Border.all(color: RColors.line),
                          borderRadius: BorderRadius.circular(RRadius.md),
                        ),
                        alignment: Alignment.center,
                        child: const Column(
                          children: [
                            Text('\$912.40', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: RColors.navy)),
                            SizedBox(height: 2),
                            Text('Total spent', style: TextStyle(fontSize: 11, color: RColors.muted)),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                for (final inv in invoices) ...[
                  RCard(
                    padding: const EdgeInsets.all(13),
                    onTap: () => Navigator.of(context)
                        .push(MaterialPageRoute(builder: (_) => InvoiceDetailScreen(invoice: inv))),
                    child: Row(
                      children: [
                        Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(color: _toneBg(inv.iconTone), borderRadius: BorderRadius.circular(12)),
                          alignment: Alignment.center,
                          child: Text(inv.icon, style: const TextStyle(fontSize: 18)),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(inv.title, style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700, color: RColors.navy)),
                              const SizedBox(height: 2),
                              Text(inv.dateRoute, style: const TextStyle(fontSize: 11, color: RColors.muted)),
                            ],
                          ),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(inv.amount, style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w800, color: RColors.navy)),
                            const SizedBox(height: 2),
                            const Text('Paid', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: RColors.ok)),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 10),
                ],
                RButton(label: 'Export all as PDF', variant: RButtonVariant.accent, onPressed: () {}),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
