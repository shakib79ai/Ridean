import 'package:flutter/material.dart';
import '../theme/tokens.dart';
import '../widgets/common.dart';
import '../widgets/hero_header.dart';

class _Faq {
  final String q;
  final String a;
  const _Faq(this.q, this.a);
}

const _faqs = <_Faq>[
  _Faq('How do I cancel a booking?', 'Open Trips, tap the booking, then "Cancel booking". A fee may apply within 1 hour of pickup.'),
  _Faq('How does Ridean+ pricing work?', 'Members get member pricing and priority pickups for a flat monthly fee, billed to your default payment method.'),
  _Faq('What if my driver is late?', 'You\'ll get live ETA updates, and can contact your driver directly from Booking details.'),
  _Faq('Can I add a note for the driver?', 'Yes — from Booking details, choose "Edit booking" to add special requests like a baby seat or extra luggage.'),
  _Faq('How do refunds work?', 'Refunds to your original payment method typically appear within 3–5 business days.'),
];

class HelpSupportScreen extends StatefulWidget {
  const HelpSupportScreen({super.key});

  @override
  State<HelpSupportScreen> createState() => _HelpSupportScreenState();
}

class _HelpSupportScreenState extends State<HelpSupportScreen> {
  int? _expanded;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: RColors.navy,
      body: SafeArea(
        child: Column(
          children: [
            const HeroHeader(title: 'Help & support'),
            RSheet(
              children: [
                const RSectionHeader(title: 'Frequently asked'),
                for (int i = 0; i < _faqs.length; i++) ...[
                  GestureDetector(
                    onTap: () => setState(() => _expanded = _expanded == i ? null : i),
                    child: RCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(_faqs[i].q, style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700, color: RColors.navy)),
                              ),
                              Icon(_expanded == i ? Icons.expand_less : Icons.expand_more, color: RColors.muted),
                            ],
                          ),
                          if (_expanded == i) ...[
                            const SizedBox(height: 8),
                            Text(_faqs[i].a, style: const TextStyle(fontSize: 12.5, color: RColors.muted)),
                          ],
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                ],
                const SizedBox(height: 10),
                RCard(
                  padding: EdgeInsets.zero,
                  child: Column(
                    children: [
                      _row(Icons.chat_bubble_outline, 'Contact support chat'),
                      Container(height: 1, color: RColors.line),
                      _row(Icons.call_outlined, 'Call support · 1-800-RIDEAN'),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _row(IconData icon, String label) {
    return InkWell(
      onTap: () {},
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          children: [
            Icon(icon, size: 18, color: RColors.navy),
            const SizedBox(width: 12),
            Expanded(child: Text(label, style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w600, color: RColors.navy))),
            const Icon(Icons.chevron_right, size: 18, color: RColors.mutedOnDark),
          ],
        ),
      ),
    );
  }
}
