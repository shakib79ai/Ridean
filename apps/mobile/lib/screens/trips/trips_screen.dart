import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../api/models.dart';
import '../../state/providers.dart';
import '../../theme.dart';
import '../../widgets/kit.dart';

/// Board: Trips. Tab page inside AppShell (the shell draws the tab bar).
class TripsScreen extends ConsumerStatefulWidget {
  const TripsScreen({super.key});

  @override
  ConsumerState<TripsScreen> createState() => _TripsScreenState();
}

enum _Tab { upcoming, past }

bool _isUpcoming(Booking b, DateTime now) {
  if (!b.upcoming) return false;
  if (b.status == 'in_progress') return true;
  final at = parseDate(b.pickupAt);
  return at == null || !at.isBefore(now);
}

DateTime _tripTime(Booking b) => parseDate(b.pickupAt) ?? parseDate(b.createdAt) ?? DateTime.fromMillisecondsSinceEpoch(0);

class _TripsScreenState extends ConsumerState<TripsScreen> {
  _Tab _tab = _Tab.upcoming;

  Future<void> _refresh() async {
    ref.invalidate(bookingsProvider);
    try {
      await ref.read(bookingsProvider.future);
    } catch (_) {
      // The error state is shown in the list.
    }
  }

  @override
  Widget build(BuildContext context) {
    final bookings = ref.watch(bookingsProvider);
    return RdTabPage(
      onRefresh: _refresh,
      children: [
        Text('Your trips', style: RdText.serif(28)),
        RdSegmented<_Tab>(
          options: const [(_Tab.upcoming, 'Upcoming'), (_Tab.past, 'Past')],
          value: _tab,
          onChanged: (t) => setState(() => _tab = t),
        ),
        rdAsync<List<Booking>>(
          bookings,
          (all) {
            final now = DateTime.now();
            final list = _tab == _Tab.upcoming
                ? (all.where((b) => _isUpcoming(b, now)).toList()..sort((a, b) => _tripTime(a).compareTo(_tripTime(b))))
                : (all.where((b) => !_isUpcoming(b, now)).toList()..sort((a, b) => _tripTime(b).compareTo(_tripTime(a))));
            if (list.isEmpty) {
              return _tab == _Tab.upcoming
                  ? RdEmpty(
                      icon: Icons.receipt_long_outlined,
                      title: 'No upcoming trips',
                      text: 'You have no upcoming trips.',
                      action: 'Book a ride',
                      onAction: () => context.push('/book/ride'),
                    )
                  : RdEmpty(
                      icon: Icons.history_rounded,
                      title: 'No past trips',
                      text: 'Your past and cancelled trips will appear here.',
                      action: 'Book a ride',
                      onAction: () => context.push('/book/ride'),
                    );
            }
            return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: rdGap([for (final b in list) _TripCard(b)], 12));
          },
          onRetry: () => ref.invalidate(bookingsProvider),
        ),
      ],
    );
  }
}

IconData _serviceIcon(String service) {
  switch (service) {
    case 'airport_transfer':
      return Icons.flight_outlined;
    case 'rent':
      return Icons.car_rental_outlined;
    case 'hourly':
      return Icons.schedule_rounded;
    case 'luxury':
      return Icons.star_outline_rounded;
    default:
      return Icons.directions_car_outlined;
  }
}

/// Trip-card status label and colour (the Trips board shows Confirmed / Completed in green).
(String, Color) _cardStatus(String status) {
  switch (status) {
    case 'pending_payment':
      return ('Awaiting payment', RdColors.gold);
    case 'payment_authorised':
      return ('Booked', RdColors.ok);
    case 'confirmed':
      return ('Confirmed', RdColors.ok);
    case 'driver_assigned':
      return ('Chauffeur assigned', RdColors.ok);
    case 'in_progress':
      return ('In progress', RdColors.yellow);
    case 'completed':
      return ('Completed', RdColors.ok);
    case 'cancelled':
      return ('Cancelled', RdColors.bad);
    case 'failed':
      return ('Failed', RdColors.bad);
    default:
      return (status, RdColors.muted);
  }
}

String _tripTitle(Booking b) {
  final drop = b.dropoff;
  if (drop != null && drop.isNotEmpty) return drop;
  final parts = [b.vehicle.name, b.supplierName].where((s) => s.isNotEmpty).join(' · ');
  return parts.isNotEmpty ? parts : b.serviceLabel;
}

String _tripWhen(Booking b) {
  final start = parseDate(b.pickupAt);
  final end = parseDate(b.returnAt);
  if (b.service == 'rent' && start != null && end != null) {
    final n = (end.difference(start).inHours / 24).round();
    final days = n < 1 ? 1 : n;
    final f = DateFormat('d MMM');
    return '${f.format(start)} – ${f.format(end)} · $days day${days == 1 ? '' : 's'}';
  }
  return start != null ? formatDateTime(b.pickupAt) : 'Booked ${formatDate(b.createdAt)}';
}

class _TripCard extends StatelessWidget {
  const _TripCard(this.b);
  final Booking b;

  @override
  Widget build(BuildContext context) {
    final (statusLabel, statusColor) = _cardStatus(b.status);
    return RdCard(
      padding: const EdgeInsets.all(14),
      onTap: () => context.push('/bookings/${b.id}'),
      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          RdThumb(serviceByKey(b.service).image, width: 64, height: 64, radius: 12),
          const SizedBox(width: 12),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Icon(_serviceIcon(b.service), size: 15, color: RdColors.gold),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(b.serviceLabel, maxLines: 1, overflow: TextOverflow.ellipsis, style: RdText.sans(13, color: RdColors.gold)),
                ),
                const SizedBox(width: 8),
                Text(statusLabel, style: RdText.sans(12, color: statusColor, weight: FontWeight.w600)),
              ]),
              const SizedBox(height: 4),
              Text(_tripTitle(b), maxLines: 1, overflow: TextOverflow.ellipsis, style: RdText.sans(15, weight: FontWeight.w600)),
              const SizedBox(height: 2),
              Text('From ${b.pickup}', maxLines: 1, overflow: TextOverflow.ellipsis, style: RdText.sans(12.5, color: RdColors.muted)),
            ]),
          ),
        ]),
        const SizedBox(height: 12),
        const Divider(height: 1, color: RdColors.line),
        const SizedBox(height: 10),
        Row(children: [
          Expanded(child: Text(_tripWhen(b), maxLines: 1, overflow: TextOverflow.ellipsis, style: RdText.sans(13, color: RdColors.muted))),
          const SizedBox(width: 10),
          Text(b.price.display, style: RdText.sans(13, weight: FontWeight.w600)),
        ]),
      ]),
    );
  }
}
