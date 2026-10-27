import 'package:flutter/material.dart';
import '../data/mock.dart';
import '../theme/tokens.dart';
import '../widgets/common.dart';
import '../widgets/hero_header.dart';
import 'booking_review_screen.dart';

class HourlyChauffeurScreen extends StatefulWidget {
  const HourlyChauffeurScreen({
    super.key,
    this.initialPickup = '432 Park Ave, Manhattan',
    this.initialHours = 4,
    this.initialPassengers = 1,
  });

  final String initialPickup;
  final int initialHours;
  final int initialPassengers;

  @override
  State<HourlyChauffeurScreen> createState() => _HourlyChauffeurScreenState();
}

class _HourlyChauffeurScreenState extends State<HourlyChauffeurScreen> {
  late int duration = widget.initialHours;
  String selected = chauffeurVehicles.first.id;
  late String pickup = widget.initialPickup;
  late int passengers = widget.initialPassengers;
  static const durations = [3, 4, 6, 8];

  @override
  Widget build(BuildContext context) {
    final vehicle = chauffeurVehicles.firstWhere((v) => v.id == selected);
    final estimate = duration * vehicle.pricePerHr;

    return Scaffold(
      backgroundColor: RColors.navy,
      body: SafeArea(
        child: Column(
          children: [
            const HeroHeader(title: 'Hourly Chauffeur', subtitle: 'Reserve a vehicle and driver by the hour.'),
            RSheet(
              children: [
                const Text('DURATION', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: RColors.muted)),
                const SizedBox(height: 9),
                Row(
                  children: [
                    for (final d in durations) ...[
                      Expanded(
                        child: GestureDetector(
                          onTap: () => setState(() => duration = d),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            decoration: BoxDecoration(
                              color: d == duration ? RColors.navy : RColors.ground,
                              border: Border.all(color: d == duration ? RColors.navy : RColors.line),
                              borderRadius: BorderRadius.circular(RRadius.md),
                            ),
                            alignment: Alignment.center,
                            child: Text('$d hrs',
                                style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w700,
                                    color: d == duration ? Colors.white : RColors.navy)),
                          ),
                        ),
                      ),
                      if (d != durations.last) const SizedBox(width: 8),
                    ],
                  ],
                ),
                const SizedBox(height: 18),
                RField(label: 'Pickup', value: pickup, leftDot: RColors.ok),
                const SizedBox(height: 10),
                Row(
                  children: const [
                    Expanded(child: RField(label: 'Date', value: 'Oct 22, 2026')),
                    SizedBox(width: 10),
                    Expanded(child: RField(label: 'Start time', value: '2:00 PM')),
                  ],
                ),
                const SizedBox(height: 10),
                RField(label: 'Passengers', value: '$passengers'),
                const SizedBox(height: 18),
                const Text('Choose a vehicle', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: RColors.navy)),
                const SizedBox(height: 10),
                for (final v in chauffeurVehicles) ...[
                  RCard(
                    selected: v.id == selected,
                    padding: const EdgeInsets.all(12),
                    onTap: () => setState(() => selected = v.id),
                    child: Row(
                      children: [
                        Container(
                          width: 42,
                          height: 42,
                          decoration: BoxDecoration(color: RColors.navy, borderRadius: BorderRadius.circular(RRadius.md)),
                          alignment: Alignment.center,
                          child: Icon(
                            v.id == 'c3' ? Icons.star_rounded : Icons.directions_car_rounded,
                            color: RColors.acc,
                            size: 18,
                          ),
                        ),
                        const SizedBox(width: 11),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Text(v.name, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: RColors.navy)),
                                  if (v.id == 'c2') ...[
                                    const SizedBox(width: 6),
                                    const RPill(label: 'POPULAR', tone: 'accent'),
                                  ],
                                ],
                              ),
                              Text('${v.seats} seats · ${v.desc}', style: const TextStyle(fontSize: 11.5, color: RColors.muted)),
                              if (v.id == 'c3')
                                const Text('Limited chauffeurs available in your area',
                                    style: TextStyle(fontSize: 10.5, color: RColors.bad, fontStyle: FontStyle.italic)),
                            ],
                          ),
                        ),
                        Text('\$${v.pricePerHr}/hr', style: RFonts.display(size: 14.5, weight: FontWeight.w800)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 9),
                ],
                Container(
                  padding: const EdgeInsets.all(13),
                  decoration: BoxDecoration(color: RColors.ground, border: Border.all(color: RColors.line), borderRadius: BorderRadius.circular(RRadius.md)),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('$duration hrs × \$${vehicle.pricePerHr}/hr', style: const TextStyle(fontSize: 12.5, color: RColors.muted, fontWeight: FontWeight.w600)),
                      Text('\$${estimate.toStringAsFixed(2)} est.', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: RColors.navy)),
                    ],
                  ),
                ),
                const SizedBox(height: 14),
                RButton(
                  label: 'Reserve chauffeur',
                  variant: RButtonVariant.accent,
                  onPressed: () => Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => BookingReviewScreen(
                        service: 'Hourly Chauffeur',
                        vehicleName: vehicle.name,
                        vehicleSpec: '$duration hrs · ${vehicle.seats} seats · ${vehicle.desc} · $passengers passenger${passengers == 1 ? '' : 's'}',
                        priceLabel: '\$${estimate.toStringAsFixed(2)}',
                        pickup: pickup,
                        date: 'Oct 22, 2026',
                        time: '2:00 PM',
                        tripId: 't2',
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
