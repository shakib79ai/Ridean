import 'package:flutter/material.dart';
import '../data/mock.dart';
import '../theme/tokens.dart';
import '../widgets/common.dart';
import '../widgets/hero_header.dart';
import 'trip_status_screen.dart';

/// Payment step shown after [BookingReviewScreen] confirms the trip details,
/// before the booking is actually placed. Lets the rider pick a saved card
/// (or start adding a new one) and shows the final charge total.
class PaymentScreen extends StatefulWidget {
  const PaymentScreen({super.key, required this.tripId, required this.priceLabel});

  final String tripId;
  final String priceLabel;

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  late String _selectedId = paymentMethods.firstWhere((p) => p.isDefault, orElse: () => paymentMethods.first).id;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: RColors.navy,
      body: SafeArea(
        child: Column(
          children: [
            const HeroHeader(title: 'Payment', subtitle: 'Choose how you want to pay.'),
            RSheet(
              children: [
                const Text('PAYMENT METHOD', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: RColors.muted, letterSpacing: 0.4)),
                const SizedBox(height: 10),
                for (final p in paymentMethods) ...[
                  RCard(
                    selected: _selectedId == p.id,
                    padding: const EdgeInsets.all(14),
                    onTap: () => setState(() => _selectedId = p.id),
                    child: Row(
                      children: [
                        Container(
                          width: 40,
                          height: 28,
                          decoration: BoxDecoration(color: RColors.navy, borderRadius: BorderRadius.circular(6)),
                          alignment: Alignment.center,
                          child: Text(
                            p.brand == 'Visa' ? 'VISA' : 'MC',
                            style: const TextStyle(color: RColors.acc, fontSize: 10.5, fontWeight: FontWeight.w800),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('${p.brand} •••• ${p.last4}', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: RColors.navy)),
                              Text('Expires ${p.expiry}', style: const TextStyle(fontSize: 11.5, color: RColors.muted)),
                            ],
                          ),
                        ),
                        Icon(
                          _selectedId == p.id ? Icons.radio_button_checked : Icons.radio_button_off,
                          color: _selectedId == p.id ? RColors.navy : RColors.line,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 10),
                ],
                GestureDetector(
                  onTap: () => ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Add-card flow isn\'t wired up in this mockup yet.')),
                  ),
                  child: Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(RRadius.lg),
                      border: Border.all(color: RColors.line, style: BorderStyle.solid),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.add_circle_outline, color: RColors.navy3),
                        SizedBox(width: 10),
                        Text('Add new card', style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700, color: RColors.navy3)),
                      ],
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.all(13),
                  decoration: BoxDecoration(color: RColors.ground, border: Border.all(color: RColors.line), borderRadius: BorderRadius.circular(RRadius.md)),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Amount to charge', style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700, color: RColors.muted)),
                      Text(widget.priceLabel, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: RColors.navy)),
                    ],
                  ),
                ),
                const SizedBox(height: 4),
                RButton(
                  label: 'Pay & confirm',
                  variant: RButtonVariant.accent,
                  onPressed: () => Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => TripStatusScreen(tripId: widget.tripId)),
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
