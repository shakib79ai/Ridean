import 'package:flutter/material.dart';
import '../data/mock.dart';
import '../theme/tokens.dart';
import '../widgets/common.dart';
import 'booking_details_screen.dart';

class TripsScreen extends StatelessWidget {
  const TripsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: RColors.surface,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            Container(
              width: double.infinity,
              color: RColors.navy,
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
              child: const Text('Trips', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: Colors.white)),
            ),
            Expanded(
              child: ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: trips.length,
                separatorBuilder: (_, __) => const SizedBox(height: 9),
                itemBuilder: (context, i) {
                  final t = trips[i];
                  final tone = t.status == 'upcoming' ? 'warn' : (t.status == 'completed' ? 'ok' : 'bad');
                  final label = t.status[0].toUpperCase() + t.status.substring(1);
                  return Opacity(
                    opacity: t.status == 'cancelled' ? 0.6 : 1,
                    child: RCard(
                      padding: const EdgeInsets.all(14),
                      onTap: () => Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => BookingDetailsScreen(trip: t)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              RPill(label: label, tone: tone),
                              Text('${t.date} · ${t.time}', style: const TextStyle(fontSize: 11, color: RColors.muted, fontWeight: FontWeight.w700)),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text('${t.from} → ${t.to}', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: RColors.navy)),
                          const SizedBox(height: 3),
                          Text('${t.car} · ${t.distance} · ${t.price}', style: const TextStyle(fontSize: 11.5, color: RColors.muted)),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
