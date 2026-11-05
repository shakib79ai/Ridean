import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../api/api_client.dart';
import '../../api/models.dart';
import '../../state/providers.dart';
import '../../theme.dart';
import '../../widgets/kit.dart';

/// Board: BookingReview. Route, vehicle, promo, price and passenger details before Payment.
class BookingReviewScreen extends ConsumerStatefulWidget {
  const BookingReviewScreen({super.key, required this.quoteId});
  final String quoteId;

  @override
  ConsumerState<BookingReviewScreen> createState() => _BookingReviewScreenState();
}

final _emailRe = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$');

const _classLabels = {
  'sedan': 'Sedan',
  'xl': 'XL',
  'extra_comfort': 'Extra Comfort',
  'business': 'Business',
  'black': 'Black Car Service',
};

String _vehicleTitle(Vehicle v) => _classLabels[v.cls] ?? (v.name.isEmpty ? 'Vehicle' : v.name);

String _fmtTime(DateTime d) => DateFormat('h:mm a').format(d);

/// "Today, 6:30 PM" / "Tomorrow, 9:00 AM" / "Fri, 14 Nov, 6:30 PM".
String _fmtWhen(DateTime? d) {
  if (d == null) return 'As soon as possible';
  final now = DateTime.now();
  bool same(DateTime a, DateTime b) => a.year == b.year && a.month == b.month && a.day == b.day;
  final day = same(d, now)
      ? 'Today'
      : same(d, now.add(const Duration(days: 1)))
          ? 'Tomorrow'
          : DateFormat('EEE, d MMM').format(d);
  return '$day, ${_fmtTime(d)}';
}

String _fmtDay(DateTime? d) => d == null ? '' : DateFormat('EEE, d MMM').format(d);

class _BookingReviewScreenState extends ConsumerState<BookingReviewScreen> {
  final _first = TextEditingController();
  final _last = TextEditingController();
  final _email = TextEditingController();
  final _phone = TextEditingController();
  final _flight = TextEditingController();
  final _notes = TextEditingController();
  final _promoCtrl = TextEditingController();

  PromoResult? _promo;
  bool _promoBusy = false;
  String? _promoError;
  String? _formError;
  Timer? _clock;

  CheckoutDraft get _draft => ref.read(checkoutDraftProvider(widget.quoteId));

  @override
  void initState() {
    super.initState();
    final d = _draft;
    final user = ref.read(authProvider).user;
    _first.text = d.firstName.isNotEmpty ? d.firstName : (user?.firstName ?? '');
    _last.text = d.lastName.isNotEmpty ? d.lastName : (user?.lastName ?? '');
    _email.text = d.email.isNotEmpty ? d.email : (user?.email ?? '');
    _phone.text = d.phone.isNotEmpty ? d.phone : (user?.phone ?? '');
    _flight.text = d.flightNumber;
    _notes.text = d.notes;
    _promo = d.promo;
    // Re-check the price hold every 15 seconds.
    _clock = Timer.periodic(const Duration(seconds: 15), (_) {
      if (mounted) setState(() {});
    });
  }

  @override
  void dispose() {
    _clock?.cancel();
    for (final c in [_first, _last, _email, _phone, _flight, _notes, _promoCtrl]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _applyPromo() async {
    final code = _promoCtrl.text.trim();
    if (code.isEmpty) {
      setState(() => _promoError = 'Enter a promo code');
      return;
    }
    setState(() {
      _promoBusy = true;
      _promoError = null;
    });
    try {
      final r = await ref.read(apiProvider).applyPromo(widget.quoteId, code);
      if (!mounted) return;
      _draft.promo = r;
      setState(() {
        _promo = r;
        _promoBusy = false;
      });
    } catch (e) {
      if (!mounted) return;
      _draft.promo = null;
      setState(() {
        _promo = null;
        _promoBusy = false;
        _promoError = errorText(e);
      });
    }
  }

  void _removePromo() {
    _draft.promo = null;
    _promoCtrl.clear();
    setState(() {
      _promo = null;
      _promoError = null;
    });
  }

  void _saveDraft(Quote quote) {
    final d = _draft;
    d.firstName = _first.text.trim();
    d.lastName = _last.text.trim();
    d.email = _email.text.trim();
    d.phone = _phone.text.trim();
    d.notes = _notes.text.trim();
    d.flightNumber = quote.service == 'airport_transfer' ? _flight.text.trim() : '';
    d.promo = quote.price.supplierCollects ? null : _promo;
  }

  void _continue(Quote quote) {
    String? err;
    if (_first.text.trim().isEmpty || _last.text.trim().isEmpty) {
      err = 'Please enter the passenger’s first and last name.';
    } else if (!_emailRe.hasMatch(_email.text.trim())) {
      err = 'Please enter a valid email address.';
    } else if (_phone.text.replaceAll(RegExp(r'\D'), '').length < 6) {
      err = 'Please enter a mobile number so your chauffeur can reach you.';
    }
    setState(() => _formError = err);
    if (err != null) return;
    _saveDraft(quote);
    context.push('/checkout/${widget.quoteId}/pay');
  }

  void _searchAgain(String? service) {
    if (service != null && services.any((s) => s.key == service)) {
      context.go('/book/${serviceByKey(service).slug}');
    } else {
      context.go('/');
    }
  }

  @override
  Widget build(BuildContext context) {
    final q = ref.watch(quoteProvider(widget.quoteId));
    return q.when(
      loading: () => const RdPage(title: 'Review booking', children: [RdMap(), RdLoading()]),
      error: (e, _) => _errorPage(e),
      data: _content,
    );
  }

  Widget _errorPage(Object e) {
    final status = e is ApiException ? e.status : null;
    final gone = status == 410 || status == 404;
    return RdPage(
      title: gone ? 'Price expired' : 'Review booking',
      children: [
        RdCard(
          child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            Text(
              gone
                  ? 'This price is no longer available. Prices are held for a short time — search again to get a fresh, upfront price.'
                  : errorText(e),
              style: RdText.sans(14.5, color: RdColors.muted, height: 1.55),
            ),
            const SizedBox(height: 14),
            if (gone)
              RdCta(label: 'Search again', onPressed: () => _searchAgain(null))
            else
              RdCta(label: 'Try again', arrow: false, onPressed: () => ref.invalidate(quoteProvider(widget.quoteId))),
          ]),
        ),
      ],
    );
  }

  Widget _content(Quote quote) {
    final search = ref.watch(lastSearchProvider(quote.service));
    final currency = quote.price.currency;
    final supplierCollects = quote.price.supplierCollects;
    final promo = supplierCollects ? null : _promo;
    final total = promo != null ? promo.customerPrice : quote.price.customerPrice;
    final isAirport = quote.service == 'airport_transfer';
    final expiresAt = DateTime.tryParse(quote.expiresAt);
    final expired = expiresAt != null && expiresAt.isBefore(DateTime.now());
    final v = quote.vehicle;
    final title = _vehicleTitle(v);
    final vehicleSub = [
      if (v.name.isNotEmpty && v.name != title) v.name,
      if (v.passengers > 0) '${v.passengers} seats',
      if (quote.supplierName.isNotEmpty) quote.supplierName,
    ].join(' · ');

    return RdPage(
      title: 'Review booking',
      children: [
        const RdMap(),
        _TripCard(quote: quote, search: search),
        // Vehicle
        RdCard(
          padding: const EdgeInsets.all(14),
          child: Row(children: [
            RdThumb(v.image, width: 72, height: 50),
            const SizedBox(width: 12),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(title, maxLines: 1, overflow: TextOverflow.ellipsis, style: RdText.sans(15.5, weight: FontWeight.w600)),
                if (vehicleSub.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: 2),
                    child: Text(vehicleSub, maxLines: 2, overflow: TextOverflow.ellipsis, style: RdText.sans(12.5, color: RdColors.muted)),
                  ),
              ]),
            ),
            const SizedBox(width: 8),
            InkWell(
              borderRadius: BorderRadius.circular(8),
              onTap: () {
                if (context.canPop()) {
                  context.pop();
                } else {
                  _searchAgain(quote.service);
                }
              },
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 2),
                child: Text('Change', style: RdText.sans(13, color: RdColors.gold)),
              ),
            ),
          ]),
        ),
        // Passenger
        const RdSectionTitle('Passenger'),
        RdCard(
          child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            Row(children: [
              Expanded(
                child: RdField(
                  label: 'First name',
                  icon: Icons.person_outline_rounded,
                  controller: _first,
                  textCapitalization: TextCapitalization.words,
                  autofillHints: const [AutofillHints.givenName],
                  textInputAction: TextInputAction.next,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: RdField(
                  label: 'Last name',
                  controller: _last,
                  textCapitalization: TextCapitalization.words,
                  autofillHints: const [AutofillHints.familyName],
                  textInputAction: TextInputAction.next,
                ),
              ),
            ]),
            const SizedBox(height: 12),
            RdField(
              label: 'Email',
              icon: Icons.mail_outline_rounded,
              controller: _email,
              keyboardType: TextInputType.emailAddress,
              autofillHints: const [AutofillHints.email],
              textInputAction: TextInputAction.next,
            ),
            const SizedBox(height: 12),
            RdField(
              label: 'Mobile',
              icon: Icons.phone_outlined,
              controller: _phone,
              hint: '+1 (555) 000-0000',
              keyboardType: TextInputType.phone,
              autofillHints: const [AutofillHints.telephoneNumber],
              textInputAction: TextInputAction.next,
            ),
            if (isAirport) ...[
              const SizedBox(height: 12),
              RdField(
                label: 'Flight number (optional)',
                icon: Icons.flight_outlined,
                controller: _flight,
                hint: 'e.g. BA 117',
                maxLength: 12,
                textCapitalization: TextCapitalization.characters,
              ),
            ],
            const SizedBox(height: 12),
            RdTextArea(label: 'Note for your chauffeur (optional)', controller: _notes, hint: 'e.g. I\'ll wait by the main entrance'),
          ]),
        ),
        // Promo (not for trips the partner charges directly)
        if (!supplierCollects) _promoCard(),
        // Price — only the real numbers the API gives us
        RdCard(
          child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            RdSummaryRow('Fare (taxes and fees included)', formatMoney(quote.price.customerPrice, currency)),
            if (!supplierCollects)
              RdSummaryRow(
                promo != null ? 'Promo · ${promo.code}' : 'Promo',
                promo != null && promo.discount > 0 ? '−${formatMoney(promo.discount, currency)}' : '—',
                labelColor: RdColors.ok,
                valueColor: RdColors.ok,
              ),
            const RdDivider(vertical: 6),
            RdSummaryRow('Total', formatMoney(total, currency), bold: true),
            if (supplierCollects)
              Padding(
                padding: const EdgeInsets.only(top: 6),
                child: Text('You’ll pay ${quote.supplierName} directly when you confirm.', style: RdText.sans(12.5, color: RdColors.muted, height: 1.5)),
              ),
          ]),
        ),
        if (quote.cancellation.isNotEmpty) RdNote(quote.cancellation),
        if (expired)
          Row(crossAxisAlignment: CrossAxisAlignment.center, children: [
            const Expanded(child: RdErrorText('This price has expired.')),
            RdLink('Search again', onTap: () => _searchAgain(quote.service), size: 13),
          ]),
        if (_formError != null) RdErrorText(_formError!),
        RdCta(label: 'Continue to payment', onPressed: expired ? null : () => _continue(quote)),
      ],
    );
  }

  Widget _promoCard() {
    final promo = _promo;
    return RdCard(
      padding: const EdgeInsets.all(14),
      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        Row(children: [
          const Icon(Icons.local_offer_outlined, size: 19, color: RdColors.gold),
          const SizedBox(width: 10),
          Expanded(
            child: promo != null
                ? Text(promo.code.toUpperCase(), maxLines: 1, overflow: TextOverflow.ellipsis, style: RdText.sans(14.5))
                : TextField(
                    controller: _promoCtrl,
                    textCapitalization: TextCapitalization.characters,
                    textInputAction: TextInputAction.done,
                    onSubmitted: (_) => _applyPromo(),
                    onChanged: (_) {
                      if (_promoError != null) setState(() => _promoError = null);
                    },
                    style: RdText.sans(14.5),
                    cursorColor: RdColors.gold,
                    decoration: InputDecoration(
                      isDense: true,
                      border: InputBorder.none,
                      enabledBorder: InputBorder.none,
                      focusedBorder: InputBorder.none,
                      filled: false,
                      contentPadding: EdgeInsets.zero,
                      hintText: 'Promo code',
                      hintStyle: RdText.sans(14.5, color: RdColors.muted),
                    ),
                  ),
          ),
          const SizedBox(width: 10),
          if (promo != null)
            _TextAction(label: 'Remove', onTap: _removePromo)
          else
            _TextAction(label: _promoBusy ? 'Checking…' : 'Apply', onTap: _promoBusy ? null : _applyPromo),
        ]),
        if (_promoError != null)
          Padding(padding: const EdgeInsets.only(top: 10), child: Text(_promoError!, style: RdText.sans(13, color: const Color(0xFFFFB3AC)))),
        if (promo != null)
          Padding(padding: const EdgeInsets.only(top: 10), child: Text('Promo applied: ${promo.percentOff}% off', style: RdText.sans(13, color: RdColors.ok))),
      ]),
    );
  }
}

class _TextAction extends StatelessWidget {
  const _TextAction({required this.label, required this.onTap});
  final String label;
  final VoidCallback? onTap;
  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 2),
        child: Opacity(opacity: onTap == null ? .6 : 1, child: Text(label, style: RdText.sans(14, weight: FontWeight.w600, color: RdColors.gold))),
      ),
    );
  }
}

/// Pickup → drop-off card built from the search the user ran (a quote carries no route).
class _TripCard extends StatelessWidget {
  const _TripCard({required this.quote, required this.search});
  final Quote quote;
  final QuoteSearch? search;

  @override
  Widget build(BuildContext context) {
    final s = search;
    if (s == null || s.pickup.isEmpty) {
      final eta = quote.etaMinutes;
      final dur = quote.durationMinutes;
      final facts = [
        if (eta != null) 'Pickup in about $eta min',
        if (dur != null) 'About $dur min trip',
      ];
      return RdCard(
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('${serviceByKey(quote.service).label} · provided by', style: RdText.sans(12, color: RdColors.muted)),
          Padding(padding: const EdgeInsets.only(top: 2), child: Text(quote.supplierName, style: RdText.sans(15))),
          if (facts.isNotEmpty) Padding(padding: const EdgeInsets.only(top: 8), child: Text(facts.join(' · '), style: RdText.sans(12.5, color: RdColors.muted))),
        ]),
      );
    }

    String fromLabel;
    String? toLabel;
    String? to;
    if (s.service == 'rent') {
      fromLabel = 'Pick-up · ${_fmtDay(s.pickupAt)}';
      toLabel = 'Return · ${_fmtDay(s.rentalReturnAt)}';
      to = (!s.sameReturn && s.returnLocation.isNotEmpty) ? s.returnLocation : s.pickup;
    } else {
      final eta = quote.etaMinutes;
      final start = s.pickupAt ?? (eta != null ? DateTime.now().add(Duration(minutes: eta)) : null);
      final when = s.pickupAt != null ? _fmtWhen(s.pickupAt) : (eta != null ? 'in about $eta min' : 'As soon as possible');
      final hours = s.service == 'hourly' ? ' · ${s.hours} hours' : '';
      fromLabel = 'Pickup · $when$hours';
      if (s.dropoff.isNotEmpty) {
        final dur = quote.durationMinutes;
        final est = start != null && dur != null ? ' · est. ${_fmtTime(start.add(Duration(minutes: dur)))}' : '';
        toLabel = 'Drop-off$est';
        to = s.dropoff;
      }
    }
    final returnAt = s.returnAt;
    return RdCard(
      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        RdRouteSummary(fromLabel: fromLabel, from: s.pickup, toLabel: toLabel, to: to),
        if (s.service == 'airport_transfer' && s.tripType == 'return' && returnAt != null)
          Padding(
            padding: const EdgeInsets.only(top: 12, left: 22),
            child: Text('Return journey · ${_fmtWhen(returnAt)}', style: RdText.sans(12, color: RdColors.muted)),
          ),
      ]),
    );
  }
}
