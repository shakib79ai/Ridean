import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../api/models.dart';
import '../../state/providers.dart';
import '../../theme.dart';
import '../../widgets/kit.dart';

/// Board: TripDetail ("Trip receipt"). Booking + invoice for a past trip.
class TripReceiptScreen extends ConsumerWidget {
  const TripReceiptScreen({super.key, required this.id});
  final String id;

  static const _paidStatuses = ['payment_authorised', 'confirmed', 'driver_assigned', 'in_progress', 'completed'];

  String _lineAmount(int amount, String currency) => amount < 0 ? '−${formatMoney(-amount, currency)}' : formatMoney(amount, currency);

  void _bookAgain(BuildContext context, WidgetRef ref, Booking b) {
    if (!services.any((s) => s.key == b.service)) {
      context.go('/');
      return;
    }
    // Start the booking screen from this trip's route.
    final s = QuoteSearch(b.service)
      ..pickup = b.pickup
      ..dropoff = b.service == 'rent' ? '' : (b.dropoff ?? '')
      ..passengers = (b.passengers ?? 0) > 0 ? (b.passengers ?? 1) : 1
      ..luggage = b.luggage ?? 1;
    if (b.service == 'airport_transfer' && (b.flightNumber ?? '').isNotEmpty) s.flightNumber = b.flightNumber ?? '';
    ref.read(lastSearchProvider(b.service).notifier).state = s;
    context.push('/book/${serviceByKey(b.service).slug}');
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final booking = ref.watch(bookingProvider(id));
    return booking.when(
      loading: () => const RdPage(title: 'Trip receipt', children: [RdMap(height: 170), RdLoading()]),
      error: (e, _) => RdPage(title: 'Trip receipt', children: [RdError(e, onRetry: () => ref.invalidate(bookingProvider(id)))]),
      data: (b) => _content(context, ref, b),
    );
  }

  Widget _content(BuildContext context, WidgetRef ref, Booking b) {
    final invoiceA = ref.watch(invoiceProvider(id));
    final invoice = invoiceA.valueOrNull;
    final invoiceLoading = invoiceA.isLoading && !invoiceA.hasValue && !invoiceA.hasError;
    final dropoff = b.dropoff;
    final rent = b.service == 'rent';
    final paid = _paidStatuses.contains(b.status);

    return RdPage(
      title: 'Trip receipt',
      subtitle: formatDateTime(b.pickupAt ?? b.createdAt),
      onRefresh: () async {
        ref.invalidate(bookingProvider(id));
        ref.invalidate(invoiceProvider(id));
      },
      children: [
        const RdMap(height: 170),
        RdCard(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 0),
          child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            _PlaceRow(
              title: b.pickup,
              subtitle: '${rent ? 'Pick-up' : 'Pickup'} · ${b.pickupAt != null ? formatTime(b.pickupAt) : formatDate(b.createdAt)}',
            ),
            if (dropoff != null && dropoff.isNotEmpty) ...[
              const Divider(height: 1, color: RdColors.line),
              _PlaceRow(
                title: dropoff,
                subtitle: '${rent ? 'Return' : 'Drop-off'}${b.returnAt != null ? ' · ${formatDateTime(b.returnAt)}' : ''}',
              ),
            ],
          ]),
        ),
        if (invoiceLoading)
          const RdLoading(height: 120)
        else if (invoice != null)
          _invoiceCard(invoice)
        else
          _bookingCard(b, paid),
        if (invoice == null && !invoiceLoading && paid)
          const RdNote('Your invoice will be available here once it has been issued.', icon: Icons.description_outlined),
        Row(children: [
          if (invoice != null) ...[
            Expanded(
              child: RdOutlineButton(label: 'Get invoice', icon: Icons.description_outlined, onPressed: () => context.push('/account/invoices/${b.id}')),
            ),
            const SizedBox(width: 10),
          ],
          Expanded(child: RdOutlineButton(label: 'Get help', icon: Icons.help_outline_rounded, onPressed: () => context.push('/help'))),
        ]),
        RdCta(label: 'Book again', onPressed: () => _bookAgain(context, ref, b)),
      ],
    );
  }

  Widget _invoiceCard(Invoice i) {
    return RdCard(
      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        if (i.description.isNotEmpty)
          Padding(padding: const EdgeInsets.only(bottom: 4), child: Text(i.description, style: RdText.sans(13, color: RdColors.muted))),
        for (final l in i.lines)
          RdSummaryRow(l.label, _lineAmount(l.amount, i.currency),
              labelColor: l.amount < 0 ? RdColors.ok : null, valueColor: l.amount < 0 ? RdColors.ok : null),
        const RdDivider(vertical: 6),
        RdSummaryRow(i.paidWith.isNotEmpty ? 'Total · ${i.paidWith}' : 'Total', formatMoney(i.total, i.currency), bold: true),
      ]),
    );
  }

  /// Fallback while no invoice exists yet: the real amounts stored on the booking.
  Widget _bookingCard(Booking b, bool paid) {
    final currency = b.price.currency;
    final tip = b.tip ?? 0;
    final discount = b.discount ?? 0;
    final fare = b.price.customerPrice - tip + discount;
    final promoCode = b.promoCode;
    return RdCard(
      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        RdSummaryRow('Fare', formatMoney(fare, currency)),
        if (discount > 0)
          RdSummaryRow(promoCode != null && promoCode.isNotEmpty ? 'Promo · $promoCode' : 'Promo', '−${formatMoney(discount, currency)}',
              labelColor: RdColors.ok, valueColor: RdColors.ok),
        if (tip > 0) RdSummaryRow('Tip', formatMoney(tip, currency)),
        const RdDivider(vertical: 6),
        RdSummaryRow(paid ? 'Total · ${b.paymentLabel}' : 'Total', b.price.display, bold: true),
      ]),
    );
  }
}

class _PlaceRow extends StatelessWidget {
  const _PlaceRow({required this.title, required this.subtitle});
  final String title;
  final String subtitle;
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 2),
      child: Row(children: [
        const RdIconTile(Icons.place_outlined),
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
