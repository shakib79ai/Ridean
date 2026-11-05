// Luxury chauffeur (board: LuxuryChauffeur). PWA: src/app/book/luxury/page.tsx
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../api/models.dart';
import '../../state/providers.dart';
import '../../theme.dart';
import '../../widgets/kit.dart';
import 'ride_screen.dart';

class LuxuryScreen extends ConsumerStatefulWidget {
  const LuxuryScreen({super.key});
  @override
  ConsumerState<LuxuryScreen> createState() => _LuxuryScreenState();
}

class _LuxuryScreenState extends ConsumerState<LuxuryScreen> with QuoteSearchMixin<LuxuryScreen> {
  final _pickup = TextEditingController();
  final _dropoff = TextEditingController();
  // The API only takes "as soon as possible" for Ride, so luxury trips are always scheduled.
  DateTime _when = defaultDateTime(24);
  String? _formError;
  bool _dirty = false;

  @override
  void initState() {
    super.initState();
    final init = ref.read(lastSearchProvider('luxury'));
    if (init != null) {
      _pickup.text = init.pickup;
      _dropoff.text = init.dropoff;
      final at = init.pickupAt;
      if (at != null && at.isAfter(DateTime.now())) _when = at;
      if (canAutoRun(init)) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted) runSearch(init);
        });
      }
    }
  }

  @override
  void dispose() {
    _pickup.dispose();
    _dropoff.dispose();
    super.dispose();
  }

  void _edited() {
    if (!_dirty) setState(() => _dirty = true);
  }

  void _submit() {
    FocusScope.of(context).unfocus();
    String? err;
    if (!validAddress(_pickup.text)) {
      err = 'Enter a pickup location';
    } else if (!validAddress(_dropoff.text)) {
      err = 'Enter a destination';
    } else if (_when.isBefore(DateTime.now())) {
      err = 'Pickup time is in the past';
    }
    setState(() => _formError = err);
    if (err != null) return;
    final s = QuoteSearch('luxury')
      ..pickup = _pickup.text.trim()
      ..dropoff = _dropoff.text.trim()
      ..pickupAt = _when;
    setState(() => _dirty = false);
    runSearch(s);
  }

  @override
  Widget build(BuildContext context) {
    final q = selectedQuote;
    final canConfirm = q != null && !_dirty && !searching;
    return RdHeroPage(
      hero: const RdHeroHeader(
        image: 'assets/images/chauffeur-door.jpg',
        title: 'Luxury chauffeur',
        subtitle: 'First-class cars, vetted professional chauffeurs.',
        height: 220,
        alignment: Alignment(0, -.4),
      ),
      children: [
        const RdCard(
          child: Column(children: [
            Row(children: [
              Expanded(child: _Perk(Icons.water_drop_outlined, 'Chilled water')),
              SizedBox(width: 12),
              Expanded(child: _Perk(Icons.wifi, 'Onboard Wi-Fi')),
            ]),
            SizedBox(height: 12),
            Row(children: [
              Expanded(child: _Perk(Icons.person_outline, 'Suited chauffeur')),
              SizedBox(width: 12),
              Expanded(child: _Perk(Icons.work_outline, 'Meet & greet')),
            ]),
          ]),
        ),
        const RdSectionTitle('Select your car'),
        QuoteOptionsCard(
          quotes: quotes,
          loading: searching,
          error: searchError,
          selectedId: selectedId,
          onSelect: selectQuote,
          idleText: 'Enter your pickup, destination and time below to see first-class cars with upfront prices.',
          title: (x) => x.vehicle.name.isEmpty ? classLabel(x.vehicle.cls) : x.vehicle.name,
          subtitle: (x) => '${x.vehicle.passengers} seats · ${classLabel(x.vehicle.cls)} · ${x.supplierName}',
        ),
        if (!searching && supplierErrors.isNotEmpty) SupplierErrorsText(supplierErrors),
        RdCard(
          child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            RdField(label: 'Pickup', icon: Icons.place_outlined, controller: _pickup, hint: 'Airport, hotel or address', onChanged: (_) => _edited(), textInputAction: TextInputAction.next),
            const SizedBox(height: 12),
            RdField(label: 'Where to?', icon: Icons.place_outlined, controller: _dropoff, hint: 'Enter a destination', onChanged: (_) => _edited(), textInputAction: TextInputAction.done),
            const SizedBox(height: 12),
            DateTimeRow(
              value: _when,
              onChanged: (d) => setState(() {
                _when = d;
                _dirty = true;
              }),
            ),
            if (_formError != null) ...[const SizedBox(height: 12), RdErrorText(_formError!)],
          ]),
        ),
        RdCta(
          label: searching ? 'Finding cars…' : (q != null && canConfirm ? 'Book ${classLabel(q.vehicle.cls)} · ${q.price.display}' : 'Find a luxury car'),
          busy: searching,
          onPressed: () {
            final sel = selectedQuote;
            if (canConfirm && sel != null) {
              confirmQuote(sel);
            } else {
              _submit();
            }
          },
        ),
      ],
    );
  }
}

class _Perk extends StatelessWidget {
  const _Perk(this.icon, this.label);
  final IconData icon;
  final String label;
  @override
  Widget build(BuildContext context) {
    return Row(children: [
      Icon(icon, size: 16, color: RdColors.gold),
      const SizedBox(width: 8),
      Flexible(child: Text(label, maxLines: 1, overflow: TextOverflow.ellipsis, style: RdText.sans(13.5))),
    ]);
  }
}
