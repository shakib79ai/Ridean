import 'package:flutter/material.dart';
import '../data/mock.dart';
import '../theme/tokens.dart';
import '../widgets/common.dart';
import '../widgets/hero_header.dart';
import 'add_payment_method_screen.dart';

class PaymentMethodsScreen extends StatelessWidget {
  const PaymentMethodsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: RColors.navy,
      body: SafeArea(
        child: Column(
          children: [
            const HeroHeader(title: 'Payment methods'),
            RSheet(
              children: [
                for (final m in paymentMethods) ...[
                  RCard(
                    child: Row(
                      children: [
                        Container(
                          width: 40,
                          height: 28,
                          decoration: BoxDecoration(
                            color: m.brand == 'Visa' ? const Color(0xFF1A1F71) : const Color(0xFFEB001B),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            m.brand == 'Visa' ? 'VISA' : 'MC',
                            style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: Colors.white),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('${m.brand} •••• ${m.last4}', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: RColors.navy)),
                              Text('Expires ${m.expiry}', style: const TextStyle(fontSize: 12, color: RColors.muted)),
                            ],
                          ),
                        ),
                        if (m.isDefault) const RPill(label: 'Default', tone: 'ok'),
                      ],
                    ),
                  ),
                  const SizedBox(height: 10),
                ],
                RCard(
                  child: Row(
                    children: [
                      Container(
                        width: 40,
                        height: 28,
                        decoration: BoxDecoration(color: const Color(0xFF003087), borderRadius: BorderRadius.circular(6)),
                        alignment: Alignment.center,
                        child: const Text('PP', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Colors.white)),
                      ),
                      const SizedBox(width: 12),
                      const Expanded(
                        child: Text('PayPal', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: RColors.navy)),
                      ),
                      const RPill(label: 'Not connected', tone: 'warn'),
                    ],
                  ),
                ),
                const SizedBox(height: 18),
                RButton(
                  label: '+ Add payment method',
                  variant: RButtonVariant.secondary,
                  onPressed: () => Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const AddPaymentMethodScreen()),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
