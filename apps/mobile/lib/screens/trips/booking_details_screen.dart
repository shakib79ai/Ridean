import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../api/api_client.dart';
import '../../api/models.dart';
import '../../state/providers.dart';
import '../../theme.dart';
import '../../widgets/kit.dart';

/// Board: BookingDetails.
class BookingDetailsScreen extends ConsumerStatefulWidget {
  const BookingDetailsScreen({super.key, required this.id});
  final String id;

  @override
  ConsumerState<BookingDetailsScreen> createState() => _BookingDetailsScreenState();
}

const _liveStatuses = ['pending_payment', 'payment_authorised', 'confirmed', 'driver_assigned', 'in_progress'];
const _paidStatuses = ['payment_authorised', 'confirmed', 'driver_assigned', 'in_progress', 'completed'];

/// Status pill: label + tone (ok / warn / bad / info).
(String, Color, bool) _pill(String status) {
  switch (status) {
    case 'pending_payment':
      return ('Awaiting payment', RdColors.yellow, false);
    case 'payment_authorised':
      return ('Confirming', RdColors.yellow, false);
    case 'confirmed':
      return ('Confirmed', RdColors.ok, true);
    case 'driver_assigned':
      return ('Chauffeur assigned', RdColors.ok, true);
    case 'in_progress':
      return ('On trip', RdColors.ok, true);
    case 'completed':
      return ('Completed', RdColors.soft, false);
    case 'cancelled':
      return ('Cancelled', RdColors.bad, false);
    case 'failed':
      return ('Not confirmed', RdColors.bad, false);
    default:
      return (status, RdColors.soft, false);
  }
}

class _BookingDetailsScreenState extends ConsumerState<BookingDetailsScreen> {
  Timer? _poll;
  bool _cancelling = false;

  @override
  void initState() {
    super.initState();
    // Keep the live status fresh while the trip is still moving.
    _poll = Timer.periodic(const Duration(seconds: 15), (_) {
      if (!mounted) return;
      final s = ref.read(liveStatusProvider(widget.id)).valueOrNull?.status ?? ref.read(bookingProvider(widget.id)).valueOrNull?.status;
      if (s != null && _liveStatuses.contains(s)) ref.invalidate(liveStatusProvider(widget.id));
    });
  }

  @override
  void dispose() {
    _poll?.cancel();
    super.dispose();
  }

  Future<void> _refresh() async {
    ref.invalidate(bookingProvider(widget.id));
    ref.invalidate(liveStatusProvider(widget.id));
    try {
      await ref.read(bookingProvider(widget.id).future);
    } catch (_) {}
  }

  Future<void> _cancel(Booking b) async {
    final ok = await rdConfirm(
      context,
      title: 'Cancel this booking?',
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

  Future<void> _call(String phone) async {
    final ok = await launchUrl(Uri(scheme: 'tel', path: phone.replaceAll(RegExp(r'[^\d+]'), '')));
    if (!ok && mounted) showRdToast(context, 'We couldn’t start a call.');
  }

  @override
  Widget build(BuildContext context) {
    final booking = ref.watch(bookingProvider(widget.id));
    final live = ref.watch(liveStatusProvider(widget.id)).valueOrNull;
    return booking.when(
      loading: () => const RdPage(title: 'Booking details', children: [RdLoading()]),
      error: (e, _) => RdPage(title: 'Booking details', children: [RdError(e, onRetry: () => ref.invalidate(bookingProvider(widget.id)))]),
      data: (b) => _content(b, live),
    );
  }

  Widget _content(Booking b, LiveStatus? live) {
    final currency = b.price.currency;
    final st = (b.status == 'cancelled' || b.status == 'failed') ? b.status : (live?.status ?? b.status);
    final tip = b.tip ?? 0;
    final discount = b.discount ?? 0;
    final fare = b.price.customerPrice - tip + discount;
    final paid = _paidStatuses.contains(b.status);
    final completed = b.status == 'completed' || st == 'completed';
    final driver = live?.driver;
    final driverName = driver?.name;
    final driverPhone = driver?.phone;
    final hasDriver = driver != null && ((driverName ?? '').isNotEmpty || (driverPhone ?? '').isNotEmpty);
    final pickupAt = parseDate(b.pickupAt);
    final canEdit = b.editable && pickupAt != null && pickupAt.difference(DateTime.now()) > const Duration(hours: 1);
    final canCancel = b.cancellable;
    final upcoming = _liveStatuses.contains(st) && (st == 'in_progress' || pickupAt == null || !pickupAt.isBefore(DateTime.now()));
    final rent = b.service == 'rent';
    final airportDrop = b.service == 'airport_transfer';
    final via = paid ? b.paymentLabel : null;
    final totalLabel = paid ? (b.paymentMethod == 'supplier' ? 'Total paid to ${b.supplierName}' : 'Total paid${via != null ? ' · $via' : ''}') : 'Total';
    final (pillLabel, pillColor, pillCheck) = _pill(st);
    final flight = b.flightNumber;
    final dropoff = b.dropoff;
    final returnAt = b.returnAt;

    return RdPage(
      title: 'Booking details',
      subtitle: 'Ref. ${b.reference}',
      onRefresh: _refresh,
      children: [
        if (b.status == 'failed') RdErrorText('${b.supplierName} could not confirm this booking. You have not been charged.'),
        // Photo header
        SizedBox(
          height: 150,
          child: ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: Stack(fit: StackFit.expand, children: [
              Image.asset(serviceByKey(b.service).image, fit: BoxFit.cover),
              const DecoratedBox(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [Color(0x40071A14), Color(0x26071A14), RdColors.bg],
                    stops: [0, .4, 1],
                  ),
                ),
              ),
              Positioned(
                left: 20,
                right: 20,
                bottom: 18,
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(b.serviceLabel, maxLines: 1, overflow: TextOverflow.ellipsis, style: RdText.serif(30, height: 1.08)),
                  const SizedBox(height: 6),
                  Text(formatDateTime(b.pickupAt), style: RdText.sans(14, color: RdColors.soft)),
                ]),
              ),
            ]),
          ),
        ),
        // Route + status
        RdCard(
          child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Wrap(alignment: WrapAlignment.spaceBetween, crossAxisAlignment: WrapCrossAlignment.center, spacing: 10, runSpacing: 6, children: [
                RdBadge(pillLabel, icon: pillCheck ? Icons.check_rounded : null, color: pillColor, background: pillColor.withValues(alpha: .14)),
                if (flight != null && flight.isNotEmpty) Text('Flight $flight', style: RdText.sans(12.5, color: RdColors.muted)),
              ]),
            ),
            _PlaceRow(
              icon: Icons.place_outlined,
              title: b.pickup,
              subtitle: '${rent ? 'Pick-up' : 'Pickup'} · ${pickupAt != null ? formatTime(b.pickupAt) : 'As soon as possible'}',
            ),
            if (dropoff != null && dropoff.isNotEmpty) ...[
              const Divider(height: 1, color: RdColors.line),
              _PlaceRow(
                icon: airportDrop ? Icons.flight_outlined : Icons.place_outlined,
                title: dropoff,
                subtitle: '${rent ? 'Return' : 'Drop-off'}${returnAt != null ? ' · ${formatDateTime(returnAt)}' : ''}',
              ),
            ],
          ]),
        ),
        if (upcoming)
          RdListGroup(children: [
            RdListTile(
              icon: Icons.route_outlined,
              title: 'Track trip',
              subtitle: 'Trip status and chauffeur details',
              onTap: () => context.push('/bookings/${b.id}/status'),
            ),
          ]),
        if (hasDriver) _driverCard(b, driver, live),
        // Price — what was actually charged
        RdCard(
          child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            RdSummaryRow('Fare', formatMoney(fare, currency)),
            if (discount > 0)
              RdSummaryRow('Promo${(b.promoCode ?? '').isNotEmpty ? ' · ${b.promoCode}' : ''}', '−${formatMoney(discount, currency)}',
                  labelColor: RdColors.ok, valueColor: RdColors.ok),
            if (tip > 0) RdSummaryRow('Tip', formatMoney(tip, currency)),
            const RdDivider(vertical: 6),
            RdSummaryRow(totalLabel, b.price.display, bold: true),
          ]),
        ),
        if (canEdit || paid)
          Row(children: [
            if (canEdit)
              Expanded(
                child: RdOutlineButton(label: 'Edit booking', icon: Icons.edit_outlined, onPressed: () => context.push('/bookings/${b.id}/edit')),
              ),
            if (canEdit && paid) const SizedBox(width: 10),
            if (paid)
              Expanded(
                child: completed
                    ? RdOutlineButton(label: 'Receipt', icon: Icons.receipt_long_outlined, onPressed: () => context.push('/bookings/${b.id}/receipt'))
                    : RdOutlineButton(label: 'Invoice', icon: Icons.description_outlined, onPressed: () => context.push('/account/invoices/${b.id}')),
              ),
          ]),
        if (canCancel)
          Center(
            child: TextButton(
              onPressed: _cancelling ? null : () => _cancel(b),
              child: _cancelling
                  ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: RdColors.bad))
                  : Text('Cancel booking', style: RdText.sans(14.5, weight: FontWeight.w600, color: RdColors.bad)),
            ),
          ),
      ],
    );
  }

  Widget _driverCard(Booking b, Driver driver, LiveStatus? live) {
    final rating = driver.rating;
    final meta = [
      if (rating != null) '★ ${rating.toStringAsFixed(2)}',
      if ((driver.vehicle ?? '').isNotEmpty) driver.vehicle!,
      if ((driver.plate ?? '').isNotEmpty) driver.plate!,
    ].join(' · ');
    final phone = driver.phone;
    return RdCard(
      padding: const EdgeInsets.all(14),
      child: Row(children: [
        RdAvatar(driver.initials, size: 44),
        const SizedBox(width: 12),
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(driver.name ?? 'Your chauffeur', maxLines: 1, overflow: TextOverflow.ellipsis, style: RdText.sans(15, weight: FontWeight.w600)),
            if (meta.isNotEmpty) Padding(padding: const EdgeInsets.only(top: 2), child: Text(meta, style: RdText.sans(12.5, color: RdColors.muted))),
            if (phone != null && phone.isNotEmpty)
              Padding(padding: const EdgeInsets.only(top: 2), child: Text(phone, style: RdText.sans(12.5, color: const Color(0xFFC9D2CB)))),
          ]),
        ),
        if (phone != null && phone.isNotEmpty) ...[
          const SizedBox(width: 8),
          _RoundIcon(icon: Icons.phone_outlined, tooltip: 'Call chauffeur', onTap: () => _call(phone)),
        ],
        if (live != null && live.messaging) ...[
          const SizedBox(width: 8),
          _RoundIcon(icon: Icons.chat_bubble_outline_rounded, tooltip: 'Message chauffeur', onTap: () => context.push('/bookings/${b.id}/chauffeur')),
        ],
      ]),
    );
  }
}

class _PlaceRow extends StatelessWidget {
  const _PlaceRow({required this.icon, required this.title, required this.subtitle});
  final IconData icon;
  final String title;
  final String subtitle;
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 2),
      child: Row(children: [
        RdIconTile(icon),
        const SizedBox(width: 14),
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(title, style: RdText.sans(15, weight: FontWeight.w500)),
            Padding(padding: const EdgeInsets.only(top: 2), child: Text(subtitle, style: RdText.sans(12.5, color: RdColors.muted))),
          ]),
        ),
      ]),
    );
  }
}

class _RoundIcon extends StatelessWidget {
  const _RoundIcon({required this.icon, required this.tooltip, required this.onTap});
  final IconData icon;
  final String tooltip;
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: tooltip,
      child: Material(
        color: RdColors.iconTile,
        shape: const CircleBorder(),
        child: InkWell(
          customBorder: const CircleBorder(),
          onTap: onTap,
          child: SizedBox(width: 40, height: 40, child: Icon(icon, size: 18, color: RdColors.gold)),
        ),
      ),
    );
  }
}
