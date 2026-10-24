import 'package:flutter/material.dart';
import '../theme/tokens.dart';
import '../widgets/common.dart';
import '../widgets/hero_header.dart';

class AddPaymentMethodScreen extends StatefulWidget {
  const AddPaymentMethodScreen({super.key});

  @override
  State<AddPaymentMethodScreen> createState() => _AddPaymentMethodScreenState();
}

class _AddPaymentMethodScreenState extends State<AddPaymentMethodScreen> {
  bool _card = true;
  bool _paypalConnected = false;

  void _saveCard() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Card saved.')),
    );
    Navigator.of(context).maybePop();
  }

  void _connectPaypal() {
    setState(() => _paypalConnected = true);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: RColors.navy,
      body: SafeArea(
        child: Column(
          children: [
            const HeroHeader(title: 'Add payment method'),
            RSheet(
              children: [
                Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(color: RColors.ground, borderRadius: BorderRadius.circular(RRadius.pill)),
                  child: Row(
                    children: [
                      Expanded(child: _segment('Card', _card, () => setState(() => _card = true))),
                      Expanded(child: _segment('PayPal', !_card, () => setState(() => _card = false))),
                    ],
                  ),
                ),
                if (_card) ..._cardForm() else ..._paypalPanel(),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _segment(String label, bool active, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: active ? RColors.navy : Colors.transparent,
          borderRadius: BorderRadius.circular(RRadius.pill),
        ),
        child: Text(label, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: active ? Colors.white : RColors.muted)),
      ),
    );
  }

  List<Widget> _cardForm() {
    return [
      const RField(label: 'Card number', placeholder: '1234 5678 9012 3456'),
      Row(
        children: const [
          Expanded(child: RField(label: 'Expiry', placeholder: 'MM/YY')),
          SizedBox(width: 10),
          Expanded(child: RField(label: 'CVV', placeholder: '123')),
        ],
      ),
      const SizedBox(height: 10),
      const RField(label: 'Name on card', placeholder: 'Full name'),
      const RField(label: 'Billing ZIP', placeholder: '10001'),
      RButton(label: 'Save card', variant: RButtonVariant.accent, onPressed: _saveCard),
    ];
  }

  List<Widget> _paypalPanel() {
    return [
      RCard(
        child: Column(
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(color: const Color(0xFF003087), borderRadius: BorderRadius.circular(14)),
              alignment: Alignment.center,
              child: const Text('PP', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Colors.white)),
            ),
            const SizedBox(height: 14),
            Text(
              _paypalConnected ? 'PayPal connected' : 'Connect your PayPal account',
              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: RColors.navy),
            ),
            const SizedBox(height: 4),
            Text(
              _paypalConnected ? rUserPaypalEmailPlaceholder : "You'll be redirected to PayPal to sign in securely.",
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 12.5, color: RColors.muted),
            ),
          ],
        ),
      ),
      const SizedBox(height: 14),
      RButton(
        label: _paypalConnected ? 'Connected' : 'Connect PayPal',
        variant: _paypalConnected ? RButtonVariant.secondary : RButtonVariant.accent,
        onPressed: _paypalConnected ? null : _connectPaypal,
      ),
    ];
  }
}

const rUserPaypalEmailPlaceholder = 'shakib.ai.engineer@gmail.com';
