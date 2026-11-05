import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../api/models.dart';
import '../state/providers.dart';
import '../theme.dart';
import '../widgets/common.dart';

class TripsScreen extends ConsumerWidget {
  const TripsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final trips = ref.watch(bookingsProvider);
    return RefreshIndicator(
      onRefresh: () async => ref.invalidate(bookingsProvider),
      child: trips.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => ErrorView(e, onRetry: () => ref.invalidate(bookingsProvider)),
        data: (list) => ListView(padding: const EdgeInsets.all(16), children: [
          Text('Your trips', style: Theme.of(context).textTheme.headlineLarge),
          const SizedBox(height: 12),
          if (list.isEmpty) ...[
            const Text('No trips yet.', style: TextStyle(color: RdColors.muted)),
            const SizedBox(height: 12),
            FilledButton(onPressed: () => context.go('/'), child: const Text('Book a ride')),
          ],
          for (final b in list)
            Card(
              margin: const EdgeInsets.only(bottom: 10),
              child: ListTile(
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                title: Text('${serviceByKey(b.service).label} · ${b.reference}', style: const TextStyle(fontWeight: FontWeight.w600)),
                subtitle: Text('${formatWhen(b.pickupAt ?? b.createdAt)}\n${b.pickup}', maxLines: 2, overflow: TextOverflow.ellipsis),
                trailing: Column(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.end, children: [Text(b.price.display), const SizedBox(height: 4), StatusChip(b.status, b.statusLabel)]),
                onTap: () => context.push('/bookings/${b.id}'),
              ),
            ),
        ]),
      ),
    );
  }
}
