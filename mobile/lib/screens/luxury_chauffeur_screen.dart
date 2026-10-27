import 'package:flutter/material.dart';
import '../data/mock.dart';
import '../theme/tokens.dart';
import '../widgets/common.dart';
import '../widgets/hero_header.dart';
import 'booking_review_screen.dart';

class LuxuryChauffeurScreen extends StatefulWidget {
  const LuxuryChauffeurScreen({
    super.key,
    this.initialPickup = 'One Vanderbilt, Manhattan',
    this.initialDestination = 'JFK Airport, Terminal 4',
    this.initialPassengers = 1,
  });

  final String initialPickup;
  final String initialDestination;
  final int initialPassengers;

  @override
  State<LuxuryChauffeurScreen> createState() => _LuxuryChauffeurScreenState();
}

class _LuxuryChauffeurScreenState extends State<LuxuryChauffeurScreen> {
  int tripType = 0; // 0 Business, 1 Airport, 2 Event
  String selected = luxuryVehicles.first.id;
  late String pickup = widget.initialPickup;
  late String destination = widget.initialDestination;
  late int passengers = widget.initialPassengers;
  static const types = ['Business', 'Airport', 'Event'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: RColors.navy,
      body: SafeArea(
        child: Column(
          children: [
            const HeroHeader(title: 'Luxury Chauffeur', subtitle: 'Premium vehicles for business, airport & events.'),
            RSheet(
              children: [
                Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: RColors.ground,
                    border: Border.all(color: RColors.line),
                    borderRadius: BorderRadius.circular(RRadius.pill),
                  ),
                  child: Row(
                    children: List.generate(types.length, (i) {
                      final active = i == tripType;
                      return Expanded(
                        child: GestureDetector(
                          onTap: () => setState(() => tripType = i),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            decoration: BoxDecoration(
                              color: active ? RColors.navy : Colors.transparent,
                              borderRadius: BorderRadius.circular(RRadius.pill),
                            ),
                            alignment: Alignment.center,
                            child: Text(types[i],
                                style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w700,
                                    color: active ? Colors.white : RColors.muted)),
                          ),
                        ),
                      );
                    }),
                  ),
                ),
                const SizedBox(height: 14),
                RField(label: 'Pickup', value: pickup, leftDot: RColors.ok),
                const SizedBox(height: 10),
                RField(label: 'Destination', value: destination, leftDot: RColors.bad),
                const SizedBox(height: 10),
                RField(label: 'Passengers', value: '$passengers'),
                const SizedBox(height: 18),
                const Text('Select your vehicle', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: RColors.navy)),
                const SizedBox(height: 10),
                for (final v in luxuryVehicles) ...[
                  RCard(
                    selected: v.id == selected,
                    padding: const EdgeInsets.all(12),
                    onTap: () => setState(() => selected = v.id),
                    child: Row(
                      children: [
                        Container(
                          width: 46,
                          height: 46,
                          decoration: BoxDecoration(color: RColors.navy, borderRadius: BorderRadius.circular(RRadius.md)),
                          alignment: Alignment.center,
                          child: const Icon(Icons.directions_car_rounded, color: RColors.acc, size: 20),
                        ),
                        const SizedBox(width: 11),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Text(v.name, style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w700, color: RColors.navy)),
                                  if (v.badge != null) ...[
                                    const SizedBox(width: 6),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                                      decoration: BoxDecoration(color: RColors.warnBg, borderRadius: BorderRadius.circular(RRadius.pill)),
                                      child: Text(v.badge!, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: RColors.warn)),
                                    ),
                                  ],
                                  if (v.id == 'l2') ...[
                                    const SizedBox(width: 6),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                                      decoration: BoxDecoration(color: RColors.warnBg, borderRadius: BorderRadius.circular(RRadius.pill)),
                                      child: const Text('POPULAR',
                                          style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: RColors.warn)),
                                    ),
                                  ],
                                ],
                              ),
                              const SizedBox(height: 2),
                              Text('${v.seats} seats · ${v.desc}', style: const TextStyle(fontSize: 11.5, color: RColors.muted)),
                              if (v.id == 'l3')
                                const Text('Only 1 left for today',
                                    style: TextStyle(fontSize: 10.5, color: RColors.bad, fontStyle: FontStyle.italic)),
                            ],
                          ),
                        ),
                        Text('\$${v.price}', style: RFonts.display(size: 15, weight: FontWeight.w800)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 9),
                ],
                RButton(
                  label: 'Book luxury chauffeur',
                  variant: RButtonVariant.accent,
                  onPressed: () {
                    final v = luxuryVehicles.firstWhere((v) => v.id == selected);
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => BookingReviewScreen(
                          service: 'Luxury Chauffeur · ${types[tripType]}',
                          vehicleName: v.name,
                          vehicleSpec: '${v.seats} seats · ${v.desc} · $passengers passenger${passengers == 1 ? '' : 's'}',
                          priceLabel: '\$${v.price}',
                          pickup: pickup,
                          dropoff: destination,
                          tripId: 't2',
                        ),
                      ),
                    );
                  },
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
