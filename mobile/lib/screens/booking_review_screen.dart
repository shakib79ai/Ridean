import 'package:flutter/material.dart';
import '../data/mock.dart';
import '../theme/tokens.dart';
import '../widgets/common.dart';
import '../widgets/hero_header.dart';
import 'payment_screen.dart';

/// Shared "review before you book" step. Every booking flow (Ride Now,
/// Airport Transfer, Hourly/Luxury Chauffeur, Compare Rentals) now routes
/// here after a vehicle is chosen. The rider-details section is a real,
/// editable form (pre-filled from the signed-in user); "Confirm booking"
/// moves on to [PaymentScreen].
class BookingReviewScreen extends StatefulWidget {
  const BookingReviewScreen({
    super.key,
    required this.service,
    required this.vehicleName,
    required this.vehicleSpec,
    required this.priceLabel,
    required this.pickup,
    required this.tripId,
    this.dropoff,
    this.date,
    this.time,
  });

  final String service;
  final String vehicleName;
  final String vehicleSpec;
  final String priceLabel;
  final String pickup;
  final String? dropoff;
  final String? date;
  final String? time;
  final String tripId;

  @override
  State<BookingReviewScreen> createState() => _BookingReviewScreenState();
}

class _BookingReviewScreenState extends State<BookingReviewScreen> {
  late final TextEditingController _nameCtrl = TextEditingController(text: rUser.name);
  late final TextEditingController _emailCtrl = TextEditingController(text: rUser.email);
  late final TextEditingController _phoneCtrl = TextEditingController(text: rUser.phone);

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _phoneCtrl.dispose();
    super.dispose();
  }

  InputDecoration _decoration(String label) {
    return InputDecoration(
      labelText: label.toUpperCase(),
      labelStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: RColors.muted),
      filled: true,
      fillColor: RColors.ground,
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(RRadius.md), borderSide: BorderSide(color: RColors.line)),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(RRadius.md), borderSide: BorderSide(color: RColors.line)),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(RRadius.md), borderSide: const BorderSide(color: RColors.navy)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: RColors.navy,
      body: SafeArea(
        child: Column(
          children: [
            const HeroHeader(title: 'Review booking', subtitle: 'Check the details before you confirm.'),
            RSheet(
              children: [
                RCard(
                  dark: true,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(color: RColors.warnBg, borderRadius: BorderRadius.circular(RRadius.pill)),
                        child: Text(widget.service, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: RColors.warn)),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Container(width: 10, height: 10, decoration: const BoxDecoration(color: RColors.ok, shape: BoxShape.circle)),
                          const SizedBox(width: 9),
                          Expanded(child: Text(widget.pickup, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 14.5))),
                        ],
                      ),
                      if (widget.dropoff != null) ...[
                        Padding(
                          padding: const EdgeInsets.only(left: 4),
                          child: Container(width: 2, height: 16, color: RColors.navy2),
                        ),
                        Row(
                          children: [
                            Container(width: 10, height: 10, decoration: const BoxDecoration(color: RColors.bad, shape: BoxShape.circle)),
                            const SizedBox(width: 9),
                            Expanded(child: Text(widget.dropoff!, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 14.5))),
                          ],
                        ),
                      ],
                      if (widget.date != null || widget.time != null) ...[
                        const SizedBox(height: 10),
                        Text(
                          [widget.date, widget.time].where((v) => v != null).join(' · '),
                          style: const TextStyle(fontSize: 12.5, color: RColors.mutedOnDark, fontWeight: FontWeight.w600),
                        ),
                      ],
                    ],
                  ),
                ),
                const Text('RIDER DETAILS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: RColors.muted, letterSpacing: 0.4)),
                const SizedBox(height: 10),
                TextField(controller: _nameCtrl, decoration: _decoration('Full name')),
                const SizedBox(height: 10),
                TextField(controller: _emailCtrl, keyboardType: TextInputType.emailAddress, decoration: _decoration('Email')),
                const SizedBox(height: 10),
                TextField(controller: _phoneCtrl, keyboardType: TextInputType.phone, decoration: _decoration('Phone')),
                RCard(
                  child: Row(
                    children: [
                      Container(
                        width: 42,
                        height: 42,
                        decoration: BoxDecoration(color: RColors.navy, borderRadius: BorderRadius.circular(RRadius.md)),
                        alignment: Alignment.center,
                        child: const Icon(Icons.directions_car_rounded, color: RColors.acc, size: 20),
                      ),
                      const SizedBox(width: 11),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(widget.vehicleName, style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w700, color: RColors.navy)),
                            Text(widget.vehicleSpec, style: const TextStyle(fontSize: 11.5, color: RColors.muted)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.all(13),
                  decoration: BoxDecoration(color: RColors.ground, border: Border.all(color: RColors.line), borderRadius: BorderRadius.circular(RRadius.md)),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Total', style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700, color: RColors.muted)),
                      Text(widget.priceLabel, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: RColors.navy)),
                    ],
                  ),
                ),
                const SizedBox(height: 4),
                RButton(
                  label: 'Confirm booking',
                  variant: RButtonVariant.accent,
                  onPressed: () => Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => PaymentScreen(
                        tripId: widget.tripId,
                        priceLabel: widget.priceLabel,
                      ),
                    ),
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
