import 'package:flutter/material.dart';
import '../data/mock.dart';
import '../theme/tokens.dart';
import '../widgets/common.dart';
import '../widgets/hero_header.dart';
import 'booking_review_screen.dart';

class RideNowScreen extends StatefulWidget {
  const RideNowScreen({
    super.key,
    this.initialPickup = 'Current location',
    this.initialDestination,
    this.initialPassengers = 1,
  });

  final String initialPickup;
  final String? initialDestination;
  final int initialPassengers;

  @override
  State<RideNowScreen> createState() => _RideNowScreenState();
}

class _RideNowScreenState extends State<RideNowScreen> {
  String selected = vehicleCategories.first.id;
  late String pickup = widget.initialPickup;
  late String? destination = widget.initialDestination;
  late int passengers = widget.initialPassengers;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: RColors.navy,
      body: SafeArea(
        child: Column(
          children: [
            const HeroHeader(title: 'Ride Now'),
            RSheet(
              children: [
                RField(label: 'Pickup', value: pickup, leftDot: RColors.ok),
                const SizedBox(height: 10),
                RField(label: 'Destination', value: destination, placeholder: 'Where to?', leftDot: RColors.bad),
                const SizedBox(height: 10),
                RField(label: 'Passengers', value: '$passengers'),
                const SizedBox(height: 18),
                const Text('Choose a ride', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: RColors.navy)),
                const SizedBox(height: 10),
                for (final v in vehicleCategories) ...[
                  RCard(
                    selected: v.id == selected,
                    padding: const EdgeInsets.all(12),
                    onTap: () => setState(() => selected = v.id),
                    child: Row(
                      children: [
                        Text(_icon(v.id), style: const TextStyle(fontSize: 22)),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Text(v.name, style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w700, color: RColors.navy)),
                                  if (v.id == 'comfort') ...[
                                    const SizedBox(width: 6),
                                    const RPill(label: 'POPULAR', tone: 'accent'),
                                  ],
                                ],
                              ),
                              Text('${v.eta} away · ${v.seats} seats · ${v.desc}',
                                  style: const TextStyle(fontSize: 11.5, color: RColors.muted)),
                              if (v.id == 'black')
                                const Text('Limited availability right now',
                                    style: TextStyle(fontSize: 10.5, color: RColors.bad, fontStyle: FontStyle.italic)),
                            ],
                          ),
                        ),
                        Text(v.price, style: RFonts.display(size: 15, weight: FontWeight.w800)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 9),
                ],
                RButton(
                  label: 'Confirm ${vehicleCategories.firstWhere((v) => v.id == selected).name}',
                  variant: RButtonVariant.accent,
                  onPressed: () {
                    final v = vehicleCategories.firstWhere((v) => v.id == selected);
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => BookingReviewScreen(
                          service: 'Ride Now',
                          vehicleName: v.name,
                          vehicleSpec: '${v.seats} seats · ${v.eta} away · ${v.desc} · $passengers passenger${passengers == 1 ? '' : 's'}',
                          priceLabel: v.price,
                          pickup: pickup,
                          dropoff: destination ?? 'SoHo, Manhattan',
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

  String _icon(String id) {
    switch (id) {
      case 'xl':
        return '🚙';
      case 'comfort':
        return '🚖';
      case 'business':
        return '🚘';
      case 'black':
        return '🖤';
      default:
        return '🚗';
    }
  }
}
