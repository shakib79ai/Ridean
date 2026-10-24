import 'package:flutter/material.dart';
import '../data/mock.dart';
import '../theme/tokens.dart';
import '../widgets/common.dart';
import '../widgets/hero_header.dart';
import '../widgets/app_shell.dart';

/// Simple "trip confirmed" status screen shown after booking any service.
class TripStatusScreen extends StatelessWidget {
  const TripStatusScreen({super.key, required this.tripId});

  final String tripId;

  @override
  Widget build(BuildContext context) {
    final trip = trips.firstWhere((t) => t.id == tripId, orElse: () => trips.first);

    return Scaffold(
      backgroundColor: RColors.navy,
      body: SafeArea(
        child: Column(
          children: [
            const HeroHeader(title: 'Trip confirmed', showBack: false),
            RSheet(
              children: [
                Container(
                  width: 72,
                  height: 72,
                  decoration: const BoxDecoration(color: RColors.okBg, shape: BoxShape.circle),
                  alignment: Alignment.center,
                  child: const Icon(Icons.check_rounded, color: RColors.ok, size: 36),
                ),
                const SizedBox(height: 4),
                const Text("You're all set!", style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: RColors.navy)),
                const SizedBox(height: 4),
                Text('${trip.mode} · ${trip.date} · ${trip.time}', style: const TextStyle(fontSize: 13, color: RColors.muted)),
                const SizedBox(height: 14),
                RCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('${trip.from} → ${trip.to}', style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w700, color: RColors.navy)),
                      const SizedBox(height: 4),
                      Text('${trip.car} · ${trip.price}', style: const TextStyle(fontSize: 12.5, color: RColors.muted)),
                    ],
                  ),
                ),
                const SizedBox(height: 18),
                RButton(
                  label: 'Back to home',
                  variant: RButtonVariant.accent,
                  onPressed: () => Navigator.of(context).pushAndRemoveUntil(
                    MaterialPageRoute(builder: (_) => const AppShell()),
                    (route) => false,
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
