import 'package:flutter/material.dart';
import '../theme/tokens.dart';
import '../widgets/common.dart';
import '../widgets/hero_header.dart';

class LegalPrivacyScreen extends StatelessWidget {
  const LegalPrivacyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: RColors.navy,
      body: SafeArea(
        child: Column(
          children: [
            const HeroHeader(title: 'Legal & privacy'),
            RSheet(
              children: const [
                _Section(
                  title: 'Terms of Service',
                  entries: [
                    _Entry('Use of the Service', 'By booking a ride, rental or chauffeur through Ridean, you agree to arrive on time for pickup and to treat drivers and vehicles with respect. Ridean connects riders with independent drivers and supplier partners and is not itself the carrier.'),
                    _Entry('Payments', 'Fares, booking fees, and applicable taxes are charged to your selected payment method at the time of booking or completion of trip, as shown in your Booking details.'),
                    _Entry('Cancellations', 'You may cancel a booking from Booking details. Cancellations made within 1 hour of pickup may incur a cancellation fee.'),
                  ],
                ),
                SizedBox(height: 18),
                _Section(
                  title: 'Privacy Policy',
                  entries: [
                    _Entry('Data we collect', 'We collect the information you provide (name, email, phone, payment details) and trip data (pickup/drop-off locations, timestamps) needed to provide the service.'),
                    _Entry('How we use it', 'Your data is used to process bookings, process payments, provide customer support, and improve the safety and reliability of the platform.'),
                    _Entry('Sharing with drivers & suppliers', 'We share the minimum information drivers and supplier partners need to fulfill your booking, such as your name and pickup location.'),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _Entry {
  final String heading;
  final String body;
  const _Entry(this.heading, this.body);
}

class _Section extends StatelessWidget {
  const _Section({required this.title, required this.entries});

  final String title;
  final List<_Entry> entries;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: RColors.navy)),
        const SizedBox(height: 10),
        for (final e in entries) ...[
          Text(e.heading, style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700, color: RColors.navy)),
          const SizedBox(height: 4),
          Text(e.body, style: const TextStyle(fontSize: 12.5, color: RColors.muted, height: 1.4)),
          const SizedBox(height: 12),
        ],
      ],
    );
  }
}
