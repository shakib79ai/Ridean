import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../api/models.dart';
import '../state/providers.dart';
import '../theme.dart';

const _tileImg = {
  'ride_now': 'assets/images/svc-ride.jpg',
  'airport_transfer': 'assets/images/svc-air.jpg',
  'rent': 'assets/images/svc-rent.jpg',
  'hourly': 'assets/images/seat.jpg',
  'luxury': 'assets/images/cls-black.jpg',
};

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).user;
    final t = Theme.of(context).textTheme;
    return ListView(padding: const EdgeInsets.fromLTRB(16, 12, 16, 24), children: [
      Row(children: [
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(user == null ? 'Welcome to' : 'Good to see you, ${user.firstName}', style: const TextStyle(color: RdColors.muted)),
            Text('Ridean', style: t.headlineLarge?.copyWith(color: RdColors.gold)),
          ]),
        ),
        if (user == null) OutlinedButton(onPressed: () => context.push('/signin'), child: const Text('Sign in')),
      ]),
      const SizedBox(height: 16),
      ClipRRect(
        borderRadius: BorderRadius.circular(18),
        child: Stack(children: [
          Image.asset('assets/images/hero-mobile.jpg', height: 220, width: double.infinity, fit: BoxFit.cover, alignment: const Alignment(0, -.3)),
          Positioned.fill(child: DecoratedBox(decoration: BoxDecoration(gradient: LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter, colors: [Colors.transparent, RdColors.bg.withValues(alpha: .95)])))),
          Positioned(left: 18, right: 18, bottom: 18, child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Arrive exceptionally.', style: t.headlineMedium),
            const SizedBox(height: 10),
            FilledButton(onPressed: () => context.push('/book/ride'), child: const Text('Where to?')),
          ])),
        ]),
      ),
      const SizedBox(height: 22),
      const Text('ALL SERVICES', style: TextStyle(color: RdColors.gold, letterSpacing: 2.5, fontSize: 12, fontWeight: FontWeight.w600)),
      const SizedBox(height: 10),
      GridView.count(
        crossAxisCount: 3,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        mainAxisSpacing: 10,
        crossAxisSpacing: 10,
        children: [
          for (final s in services)
            InkWell(
              onTap: () => context.push('/book/${s.slug}'),
              borderRadius: BorderRadius.circular(16),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: Stack(fit: StackFit.expand, children: [
                  Image.asset(_tileImg[s.key] ?? 'assets/images/hero-mobile.jpg', fit: BoxFit.cover),
                  DecoratedBox(decoration: BoxDecoration(gradient: LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter, colors: [Colors.transparent, RdColors.bg.withValues(alpha: .92)]))),
                  Align(alignment: Alignment.bottomLeft, child: Padding(padding: const EdgeInsets.all(10), child: Text(s.label, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)))),
                ]),
              ),
            ),
        ],
      ),
      const SizedBox(height: 22),
      Card(
        child: ListTile(
          contentPadding: const EdgeInsets.all(16),
          leading: const Icon(Icons.flight_land, color: RdColors.gold, size: 30),
          title: const Text('Meet & Greet', style: TextStyle(fontWeight: FontWeight.w600)),
          subtitle: const Text('Your chauffeur waits in arrivals with a name sign. Flight tracking and free waiting time included.'),
          onTap: () => context.push('/book/airport-transfer'),
        ),
      ),
    ]);
  }
}
