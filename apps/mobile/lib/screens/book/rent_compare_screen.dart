// Compare rentals (board: CarRentalCompare). PWA: src/app/book/rent/page.tsx (results part).
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../api/models.dart';
import '../../theme.dart';
import '../../widgets/kit.dart';
import 'ride_screen.dart';

/// Filter chips → Ridean vehicle classes (rental partners' ACRISS codes are mapped to these by the API).
const _filters = <(String, String, List<String>)>[
  ('all', 'All', []),
  ('economy', 'Economy', ['sedan', 'extra_comfort']),
  ('suv', 'SUV', ['xl']),
  ('lux', 'Luxury', ['business', 'black']),
];

class RentCompareScreen extends ConsumerStatefulWidget {
  const RentCompareScreen({super.key, required this.search});
  final QuoteSearch search;
  @override
  ConsumerState<RentCompareScreen> createState() => _RentCompareScreenState();
}

class _RentCompareScreenState extends ConsumerState<RentCompareScreen> with QuoteSearchMixin<RentCompareScreen> {
  String _filter = 'all';
  bool _byPrice = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _run();
    });
  }

  void _run() => runSearch(widget.search);

  int get _days {
    final a = widget.search.pickupAt, b = widget.search.rentalReturnAt;
    if (a == null || b == null) return 1;
    final d = (b.difference(a).inMinutes / (60 * 24)).ceil();
    return d < 1 ? 1 : d;
  }

  String get _subtitle {
    final a = widget.search.pickupAt, b = widget.search.rentalReturnAt;
    final parts = <String>[];
    if (widget.search.pickup.isNotEmpty) parts.add(widget.search.pickup);
    if (a != null && b != null) {
      final sameMonth = a.year == b.year && a.month == b.month;
      parts.add(sameMonth ? '${a.day}–${DateFormat('d MMM').format(b)}' : '${DateFormat('d MMM').format(a)} – ${DateFormat('d MMM').format(b)}');
    }
    final n = _days;
    parts.add('$n ${n == 1 ? 'day' : 'days'}');
    return parts.join(' · ');
  }

  List<Quote> get _shown {
    final classes = _filters.firstWhere((f) => f.$1 == _filter).$3;
    final list = (quotes ?? const <Quote>[]).where((q) => classes.isEmpty || classes.contains(q.vehicle.cls)).toList();
    list.sort((a, b) => _byPrice ? a.price.customerPrice.compareTo(b.price.customerPrice) : b.vehicle.passengers.compareTo(a.vehicle.passengers));
    return list;
  }

  @override
  Widget build(BuildContext context) {
    final shown = _shown;
    final all = quotes;
    final err = searchError;
    final heading = searching
        ? 'Searching…'
        : all != null
            ? '${shown.length} ${shown.length == 1 ? 'car' : 'cars'} · ${_byPrice ? 'best prices' : 'most seats'}'
            : 'Compare rental cars';
    final List<Widget> results;
    if (searching) {
      results = [for (var i = 0; i < 3; i++) Container(height: 160, decoration: BoxDecoration(color: RdColors.card, borderRadius: BorderRadius.circular(16), border: Border.all(color: RdColors.line)))];
    } else if (err != null) {
      results = [RdError(err, onRetry: _run)];
    } else if (all == null) {
      results = const [RdLoading()];
    } else if (all.isEmpty) {
      results = [
        RdEmpty(
          icon: Icons.car_rental,
          title: 'No cars available',
          text: 'No cars are available for these dates. Try different dates or a nearby location.',
          action: 'Change search',
          onAction: () => Navigator.of(context).maybePop(),
        ),
      ];
    } else if (shown.isEmpty) {
      results = [const RdEmpty(icon: Icons.filter_alt_outlined, title: 'Nothing in this category', text: 'No cars in this category for your dates. Try another category.')];
    } else {
      results = [for (final q in shown) _RentalCard(q: q, days: _days, place: widget.search.pickup, onSelect: () => confirmQuote(q))];
    }
    return RdPage(
      title: 'Compare rentals',
      subtitle: _subtitle,
      onRefresh: () async => _run(),
      children: [
        RdSectionTitle(heading, action: 'Sort: ${_byPrice ? 'Price' : 'Seats'}', onAction: () => setState(() => _byPrice = !_byPrice)),
        RdChips<String>(options: [for (final f in _filters) (f.$1, f.$2)], value: _filter, onChanged: (v) => setState(() => _filter = v)),
        ...results,
        if (!searching && supplierErrors.isNotEmpty) SupplierErrorsText(supplierErrors),
      ],
    );
  }
}

class _RentalCard extends StatelessWidget {
  const _RentalCard({required this.q, required this.days, required this.place, required this.onSelect});
  final Quote q;
  final int days;
  final String place;
  final VoidCallback onSelect;

  @override
  Widget build(BuildContext context) {
    final details = [classLabel(q.vehicle.cls), '${q.vehicle.passengers} seats', '${q.vehicle.bags} bags', ...q.inclusions.take(1)].join(' · ');
    final perDay = formatMoney((q.price.customerPrice / days).round(), q.price.currency);
    return RdCard(
      padding: const EdgeInsets.all(14),
      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          RdThumb(q.vehicle.image, width: 96, height: 72, radius: 12),
          const SizedBox(width: 12),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(q.vehicle.name.isEmpty ? classLabel(q.vehicle.cls) : q.vehicle.name, style: RdText.sans(15.5, weight: FontWeight.w600)),
              const SizedBox(height: 2),
              Text(place.isEmpty ? q.supplierName : '${q.supplierName} · $place', maxLines: 1, overflow: TextOverflow.ellipsis, style: RdText.sans(12.5, color: RdColors.gold)),
              const SizedBox(height: 4),
              Text(details, style: RdText.sans(12, color: RdColors.muted, height: 1.35)),
              if (q.cancellation.isNotEmpty) Padding(padding: const EdgeInsets.only(top: 2), child: Text(q.cancellation, style: RdText.sans(12, color: RdColors.muted, height: 1.35))),
            ]),
          ),
        ]),
        const RdDivider(vertical: 12),
        Row(children: [
          Expanded(
            child: Text.rich(
              TextSpan(children: [
                TextSpan(text: perDay, style: RdText.serif(21)),
                TextSpan(text: '/day · ${q.price.display} for $days ${days == 1 ? 'day' : 'days'}', style: RdText.sans(12.5, color: RdColors.muted)),
              ]),
            ),
          ),
          const SizedBox(width: 12),
          _SelectButton(onTap: onSelect),
        ]),
      ]),
    );
  }
}

class _SelectButton extends StatelessWidget {
  const _SelectButton({required this.onTap});
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      child: Material(
        color: Colors.transparent,
        child: Ink(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(10),
            gradient: const LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter, colors: [RdColors.ctaTop, RdColors.ctaBottom]),
          ),
          child: InkWell(
            borderRadius: BorderRadius.circular(10),
            onTap: onTap,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 9),
              child: Text('Select', style: RdText.sans(14, weight: FontWeight.w600, color: RdColors.ink)),
            ),
          ),
        ),
      ),
    );
  }
}
