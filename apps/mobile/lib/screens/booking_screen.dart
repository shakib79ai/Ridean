import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../api/models.dart';
import '../state/providers.dart';
import '../theme.dart';
import '../widgets/common.dart';

class BookingScreen extends ConsumerStatefulWidget {
  const BookingScreen({super.key, required this.id});
  final String id;
  @override
  ConsumerState<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends ConsumerState<BookingScreen> {
  Timer? _poll;

  @override
  void initState() {
    super.initState();
    // While the supplier is confirming, refresh every 3s.
    _poll = Timer.periodic(const Duration(seconds: 3), (_) {
      final b = ref.read(bookingProvider(widget.id)).valueOrNull;
      if (b == null || b.status == 'payment_authorised' || b.status == 'pending_payment') ref.invalidate(bookingProvider(widget.id));
    });
  }

  @override
  void dispose() {
    _poll?.cancel();
    super.dispose();
  }

  Future<void> _cancel(Booking b) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (c) => AlertDialog(title: const Text('Cancel this booking?'), content: Text(b.reference), actions: [
        TextButton(onPressed: () => Navigator.pop(c, false), child: const Text('Keep')),
        TextButton(onPressed: () => Navigator.pop(c, true), child: const Text('Cancel booking')),
      ]),
    );
    if (ok != true) return;
    try {
      await ref.read(apiProvider).cancelBooking(b.id);
      ref.invalidate(bookingProvider(widget.id));
      ref.invalidate(bookingsProvider);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final b = ref.watch(bookingProvider(widget.id));
    return Scaffold(
      appBar: AppBar(title: const Text('Booking')),
      body: b.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => ErrorView(e, onRetry: () => ref.invalidate(bookingProvider(widget.id))),
        data: (b) => ListView(padding: const EdgeInsets.all(16), children: [
          Row(children: [Expanded(child: Text(b.reference, style: Theme.of(context).textTheme.headlineMedium)), StatusChip(b.status, b.statusLabel)]),
          const SizedBox(height: 4),
          Text('${serviceByKey(b.service).label} · ${b.supplierName}', style: const TextStyle(color: RdColors.muted)),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                _row(Icons.schedule, formatWhen(b.pickupAt)),
                _row(Icons.place_outlined, b.pickup),
                if (b.dropoff != null) _row(Icons.flag_outlined, b.dropoff!),
                if (b.flightNumber != null) _row(Icons.flight, b.flightNumber!),
                _row(Icons.directions_car_outlined, b.vehicle.name),
                const Divider(height: 24),
                Row(children: [const Expanded(child: Text('Total')), Text(b.price.display, style: Theme.of(context).textTheme.titleLarge)]),
              ]),
            ),
          ),
          if (b.cancellable) ...[const SizedBox(height: 16), OutlinedButton(onPressed: () => _cancel(b), child: const Text('Cancel booking'))],
        ]),
      ),
    );
  }

  Widget _row(IconData i, String t) => Padding(padding: const EdgeInsets.only(bottom: 10), child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [Icon(i, size: 18, color: RdColors.gold), const SizedBox(width: 10), Expanded(child: Text(t))]));
}
