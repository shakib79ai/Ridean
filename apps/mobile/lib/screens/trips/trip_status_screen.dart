import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../api/api_client.dart';
import '../../api/models.dart';
import '../../state/providers.dart';
import '../../theme.dart';
import '../../widgets/kit.dart';

/// Board: TripStatus. Live status, chauffeur, timeline, share and cancel.
class TripStatusScreen extends ConsumerStatefulWidget {
  const TripStatusScreen({super.key, required this.id});
  final String id;

  @override
  ConsumerState<TripStatusScreen> createState() => _TripStatusScreenState();
}

const _liveStatuses = ['pending_payment', 'payment_authorised', 'confirmed', 'driver_assigned', 'in_progress'];
const _cancellable = ['pending_payment', 'payment_authorised', 'confirmed', 'driver_assigned'];

const _classLabels = {
  'sedan': 'Sedan',
  'xl': 'XL',
  'extra_comfort': 'Extra Comfort',
  'business': 'Business',
  'black': 'Black Car Service',
};

String _headline(String status, LiveStatus? live) {
  switch (status) {
    case 'pending_payment':
      return 'Awaiting payment';
    case 'payment_authorised':
      return 'Confirming your booking';
    case 'confirmed':
      return 'Booking confirmed';
    case 'driver_assigned':
      return live?.etaMinutes != null ? 'Your chauffeur is on the way' : 'Chauffeur assigned';
    case 'in_progress':
      return 'Trip in progress';
    case 'completed':
      return 'Trip complete';
    case 'cancelled':
      return 'Booking cancelled';
    case 'failed':
      return 'Booking not confirmed';
    default:
      return 'Trip status';
  }
}

String _stateLabel(String status) {
  switch (status) {
    case 'cancelled':
      return 'Cancelled';
    case 'failed':
      return 'Not confirmed';
    case 'completed':
      return 'Completed';
    case 'pending_payment':
      return 'Awaiting payment';
    default:
      return 'Active';
  }
}

Color _stateColor(String status) {
  switch (status) {
    case 'cancelled':
    case 'failed':
      return RdColors.bad;
    case 'pending_payment':
    case 'payment_authorised':
      return RdColors.yellow;
    case 'completed':
      return RdColors.soft;
    default:
      return RdColors.ok;
  }
}

/// Where the car marker sits on the decorative route (no GPS feed — just the trip stage).
double? _carProgress(String status) {
  switch (status) {
    case 'driver_assigned':
      return .35;
    case 'in_progress':
      return .7;
    default:
      return null;
  }
}

class _TripStatusScreenState extends ConsumerState<TripStatusScreen> {
  Timer? _timer;
  bool _cancelling = false;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 15), (_) => _tick());
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  String? _currentStatus() {
    final b = ref.read(bookingProvider(widget.id)).valueOrNull;
    final live = ref.read(liveStatusProvider(widget.id)).valueOrNull;
    if (b != null && (b.status == 'cancelled' || b.status == 'failed')) return b.status;
    return live?.status ?? b?.status;
  }

  void _tick() {
    if (!mounted) return;
    final s = _currentStatus();
    if (s != null && !_liveStatuses.contains(s)) {
      // Finished — stop polling.
      _timer?.cancel();
      _timer = null;
      return;
    }
    ref.invalidate(liveStatusProvider(widget.id));
  }

  Future<void> _refresh() async {
    ref.invalidate(bookingProvider(widget.id));
    ref.invalidate(liveStatusProvider(widget.id));
    try {
      await ref.read(liveStatusProvider(widget.id).future);
    } catch (_) {}
  }

  Future<void> _call(String phone) async {
    final ok = await launchUrl(Uri(scheme: 'tel', path: phone.replaceAll(RegExp(r'[^\d+]'), '')));
    if (!ok && mounted) showRdToast(context, 'We couldn’t start a call.');
  }

  Future<void> _share(Booking b, LiveStatus? live) async {
    final driver = live?.driver;
    final vehicle = (driver?.vehicle ?? '').isNotEmpty ? driver?.vehicle : (b.vehicle.name.isNotEmpty ? b.vehicle.name : null);
    final lines = [
      'Ridean trip ${b.reference}',
      'Pickup: ${b.pickup}',
      if ((b.dropoff ?? '').isNotEmpty) 'Drop-off: ${b.dropoff}',
      'Time: ${formatDateTime(b.pickupAt)}',
      if (vehicle != null) 'Vehicle: $vehicle',
      if ((driver?.plate ?? '').isNotEmpty) 'Plate: ${driver?.plate}',
      if ((driver?.name ?? '').isNotEmpty) 'Chauffeur: ${driver?.name}',
    ];
    try {
      await Clipboard.setData(ClipboardData(text: lines.join('\n')));
      if (!mounted) return;
      showRdToast(context, 'Trip details copied');
    } catch (_) {
      if (!mounted) return;
      showRdToast(context, 'Couldn’t copy the trip details');
    }
  }

  Future<void> _cancel(Booking b) async {
    final ok = await rdConfirm(
      context,
      title: 'Cancel this trip?',
      message: 'Refunds follow the cancellation policy you accepted when booking.',
      confirm: 'Yes, cancel',
      cancel: 'Keep booking',
      danger: true,
    );
    if (!ok || !mounted) return;
    setState(() => _cancelling = true);
    try {
      await ref.read(apiProvider).cancelBooking(b.id);
      if (!mounted) return;
      ref.invalidate(bookingProvider(widget.id));
      ref.invalidate(liveStatusProvider(widget.id));
      ref.invalidate(bookingsProvider);
      showRdToast(context, 'Booking cancelled');
    } catch (e) {
      if (!mounted) return;
      showRdToast(context, errorText(e));
    } finally {
      if (mounted) setState(() => _cancelling = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final bookingA = ref.watch(bookingProvider(widget.id));
    final liveA = ref.watch(liveStatusProvider(widget.id));
    return bookingA.when(
      loading: () => const RdPage(title: 'Trip status', children: [RdMap(height: 230), RdLoading()]),
      error: (e, _) => RdPage(title: 'Trip status', children: [RdError(e, onRetry: () => ref.invalidate(bookingProvider(widget.id)))]),
      data: (b) {
        if (liveA.isLoading && !liveA.hasValue && !liveA.hasError) {
          return const RdPage(title: 'Trip status', children: [RdMap(height: 230), RdLoading()]);
        }
        return _content(b, liveA.valueOrNull, liveA.hasError);
      },
    );
  }

  Widget _content(Booking b, LiveStatus? live, bool statusError) {
    final status = (b.status == 'cancelled' || b.status == 'failed') ? b.status : (live?.status ?? b.status);
    final driver = live?.driver;
    final driverName = driver?.name;
    final driverPhone = driver?.phone;
    final hasDriver = driver != null && ((driverName ?? '').isNotEmpty || (driverPhone ?? '').isNotEmpty);
    final canCancel = _cancellable.contains(b.status) && _cancellable.contains(status);
    final messaging = live?.messaging ?? false;
    final isLive = _liveStatuses.contains(status);

    return RdPage(
      title: _headline(status, live),
      subtitle: 'Ref. ${b.reference}',
      onRefresh: _refresh,
      children: [
        RdMap(height: 230, car: _carProgress(status)),
        if (hasDriver)
          _chauffeurCard(b, driver, live)
        else if (isLive)
          RdCard(
            child: Text(
              'Your chauffeur’s details will appear here once ${b.supplierName.isNotEmpty ? b.supplierName : 'the partner'} assigns one.',
              style: RdText.sans(14, color: const Color(0xFFC9D2CB), height: 1.5),
            ),
          ),
        if (hasDriver && ((driverPhone ?? '').isNotEmpty || messaging))
          Row(children: [
            if (driverPhone != null && driverPhone.isNotEmpty)
              Expanded(child: RdOutlineButton(label: 'Call', icon: Icons.phone_outlined, onPressed: () => _call(driverPhone))),
            if ((driverPhone ?? '').isNotEmpty && messaging) const SizedBox(width: 10),
            if (messaging)
              Expanded(
                child: RdOutlineButton(label: 'Message', icon: Icons.chat_bubble_outline_rounded, onPressed: () => context.push('/bookings/${b.id}/chauffeur')),
              ),
          ]),
        if (statusError) const RdErrorText('We couldn’t refresh the trip status.'),
        if (live != null) _timeline(status, live),
        Row(children: [
          Expanded(child: RdOutlineButton(label: 'Share trip', icon: Icons.near_me_outlined, onPressed: () => _share(b, live))),
          if (canCancel) ...[
            const SizedBox(width: 10),
            Expanded(child: RdOutlineButton(label: 'Cancel trip', danger: true, busy: _cancelling, onPressed: () => _cancel(b))),
          ],
        ]),
      ],
    );
  }

  Widget _chauffeurCard(Booking b, Driver driver, LiveStatus? live) {
    final rating = driver.rating;
    final phone = driver.phone;
    final eta = live?.etaMinutes;
    final vehicleName = (driver.vehicle ?? '').isNotEmpty ? driver.vehicle : (b.vehicle.name.isNotEmpty ? b.vehicle.name : null);
    final plate = driver.plate;
    final classLabel = _classLabels[b.vehicle.cls] ?? b.vehicle.name;
    return RdCard(
      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        Row(children: [
          RdAvatar(driver.initials, size: 52),
          const SizedBox(width: 12),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(driver.name ?? 'Your chauffeur', maxLines: 2, overflow: TextOverflow.ellipsis, style: RdText.sans(16, weight: FontWeight.w600)),
              if (rating != null)
                Padding(
                  padding: const EdgeInsets.only(top: 3),
                  child: Row(children: [
                    const Icon(Icons.star_border_rounded, size: 14, color: RdColors.yellow),
                    const SizedBox(width: 5),
                    Text(rating.toStringAsFixed(2), style: RdText.sans(12.5, color: RdColors.muted)),
                  ]),
                ),
              if (phone != null && phone.isNotEmpty)
                Padding(padding: const EdgeInsets.only(top: 3), child: Text(phone, style: RdText.sans(12.5, color: const Color(0xFFC9D2CB)))),
            ]),
          ),
          if (eta != null) ...[
            const SizedBox(width: 10),
            Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
              Text('$eta min', style: RdText.serif(26, color: RdColors.yellow)),
              Text('away', style: RdText.sans(11.5, color: RdColors.muted)),
            ]),
          ],
        ]),
        if (vehicleName != null || (plate ?? '').isNotEmpty) ...[
          const SizedBox(height: 14),
          const Divider(height: 1, color: RdColors.line),
          const SizedBox(height: 14),
          Row(children: [
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                if (vehicleName != null) Text(vehicleName, style: RdText.sans(14.5)),
                if (classLabel.isNotEmpty) Padding(padding: const EdgeInsets.only(top: 2), child: Text(classLabel, style: RdText.sans(12.5, color: RdColors.muted))),
              ]),
            ),
            if (plate != null && plate.isNotEmpty) ...[
              const SizedBox(width: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(color: RdColors.cream, borderRadius: BorderRadius.circular(8)),
                child: Text(plate, style: RdText.sans(14, weight: FontWeight.w700, color: RdColors.ink, letterSpacing: .84)),
              ),
            ],
          ]),
        ],
      ]),
    );
  }

  Widget _timeline(String status, LiveStatus live) {
    // The next step still to happen gets the ETA.
    TripEvent? nextUp;
    for (final e in live.events) {
      if (!e.done && const ['on_the_way', 'arrived', 'in_progress'].contains(e.key)) {
        nextUp = e;
        break;
      }
    }
    final eta = live.etaMinutes;
    return RdCard(
      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        Padding(
          padding: const EdgeInsets.only(bottom: 4),
          child: Text.rich(TextSpan(style: RdText.sans(12, color: RdColors.muted), children: [
            const TextSpan(text: 'Trip status · '),
            TextSpan(text: _stateLabel(status), style: RdText.sans(12, color: _stateColor(status))),
          ])),
        ),
        for (final ev in live.events)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 7),
            child: Row(children: [
              Container(
                width: 22,
                height: 22,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: ev.done ? (ev.key == 'cancelled' ? RdColors.bad : RdColors.yellow) : RdColors.iconTile,
                ),
                child: ev.done ? const Icon(Icons.check_rounded, size: 14, color: RdColors.ink) : null,
              ),
              const SizedBox(width: 12),
              Expanded(child: Text(ev.label, style: RdText.sans(14.5, color: ev.done ? RdColors.cream : RdColors.muted))),
              const SizedBox(width: 8),
              Text(
                ev.done && ev.at != null
                    ? formatTime(ev.at)
                    : (identical(ev, nextUp) && eta != null ? 'ETA ${formatTime(DateTime.now().add(Duration(minutes: eta)).toIso8601String())}' : ''),
                style: RdText.sans(12.5, color: RdColors.muted),
              ),
            ]),
          ),
      ]),
    );
  }
}
