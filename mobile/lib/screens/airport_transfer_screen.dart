import 'package:flutter/material.dart';
import '../theme/tokens.dart';
import '../widgets/common.dart';
import '../widgets/hero_header.dart';
import 'booking_review_screen.dart';

class AirportTransferScreen extends StatefulWidget {
  const AirportTransferScreen({
    super.key,
    this.initialPickup = '432 Park Ave, Manhattan',
    this.initialDestination = 'JFK Airport, Terminal 4',
    this.initialPassengers = 1,
    this.initialLuggage = 1,
    this.initialCarryOn = 1,
  });

  final String initialPickup;
  final String initialDestination;
  final int initialPassengers;
  final int initialLuggage;
  final int initialCarryOn;

  @override
  State<AirportTransferScreen> createState() => _AirportTransferScreenState();
}

class _AirportTransferScreenState extends State<AirportTransferScreen> {
  bool roundTrip = false;
  late String pickup = widget.initialPickup;
  late String destination = widget.initialDestination;
  late int passengers = widget.initialPassengers;
  late int luggage = widget.initialLuggage;
  late int carryOn = widget.initialCarryOn;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: RColors.navy,
      body: SafeArea(
        child: Column(
          children: [
            const HeroHeader(title: 'Airport Transfer', subtitle: 'Flight-synced pickup, with live tracking.'),
            RSheet(
              children: [
                RField(label: 'Pickup', value: pickup, leftDot: RColors.ok),
                const SizedBox(height: 10),
                RField(label: 'Drop-off', value: destination, leftDot: RColors.bad),
                const SizedBox(height: 10),
                const RField(label: 'Flight number', value: 'DL 1942'),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(child: RField(label: 'Passengers', value: '$passengers')),
                    const SizedBox(width: 10),
                    Expanded(child: RField(label: 'Checked bags', value: '$luggage')),
                    const SizedBox(width: 10),
                    Expanded(child: RField(label: 'Carry-on', value: '$carryOn')),
                  ],
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Round trip', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: RColors.navy)),
                          Text('Add a return transfer', style: TextStyle(fontSize: 12.5, color: RColors.muted)),
                        ],
                      ),
                    ),
                    Switch(
                      value: roundTrip,
                      onChanged: (v) => setState(() => roundTrip = v),
                      activeColor: RColors.navy,
                      activeTrackColor: RColors.acc,
                    ),
                  ],
                ),
                const SizedBox(height: 18),
                const Text('Business', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: RColors.navy)),
                const SizedBox(height: 4),
                const Text('Toyota Camry · meet & greet included', style: TextStyle(fontSize: 12.5, color: RColors.muted)),
                const SizedBox(height: 14),
                RButton(
                  label: 'Book transfer · \$74.00',
                  variant: RButtonVariant.accent,
                  onPressed: () => Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => BookingReviewScreen(
                        service: 'Airport Transfer',
                        vehicleName: 'Business',
                        vehicleSpec:
                            'Toyota Camry · meet & greet included · $passengers pax · $luggage bag${luggage == 1 ? '' : 's'}, $carryOn carry-on${carryOn == 1 ? '' : 's'}',
                        priceLabel: '\$74.00',
                        pickup: pickup,
                        dropoff: destination,
                        tripId: 't1',
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
