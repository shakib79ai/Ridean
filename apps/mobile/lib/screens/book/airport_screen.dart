// Airport transfer (board: AirportTransfer). PWA: src/app/book/airport-transfer/page.tsx
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../api/models.dart';
import '../../state/providers.dart';
import '../../theme.dart';
import '../../widgets/kit.dart';
import 'ride_screen.dart';

class AirportTransferScreen extends ConsumerStatefulWidget {
  const AirportTransferScreen({super.key});
  @override
  ConsumerState<AirportTransferScreen> createState() => _AirportTransferScreenState();
}

class _AirportTransferScreenState extends ConsumerState<AirportTransferScreen> with QuoteSearchMixin<AirportTransferScreen> {
  final _pickup = TextEditingController();
  final _dropoff = TextEditingController();
  final _flight = TextEditingController();
  String _tripType = 'one_way';
  DateTime _out = defaultDateTime(24);
  DateTime _back = defaultDateTime(24 * 8);
  int _passengers = 1;
  int _luggage = 1;
  String? _formError;

  @override
  void initState() {
    super.initState();
    final init = ref.read(lastSearchProvider('airport_transfer'));
    if (init != null) {
      _pickup.text = init.pickup;
      _dropoff.text = init.dropoff;
      _flight.text = init.flightNumber;
      _tripType = init.tripType == 'return' ? 'return' : 'one_way';
      final at = init.pickupAt;
      if (at != null && at.isAfter(DateTime.now())) _out = at;
      final ret = init.returnAt;
      if (ret != null && ret.isAfter(_out)) _back = ret;
      _passengers = init.passengers < 1 ? 1 : init.passengers;
      _luggage = init.luggage;
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
    _flight.dispose();
    super.dispose();
  }

  void _submit() {
    FocusScope.of(context).unfocus();
    String? err;
    if (!validAddress(_pickup.text)) {
      err = 'Enter a pickup location';
    } else if (!validAddress(_dropoff.text)) {
      err = 'Enter a drop-off';
    } else if (_out.isBefore(DateTime.now())) {
      err = 'Pickup time is in the past';
    } else if (_tripType == 'return' && !_back.isAfter(_out)) {
      err = 'Return must be after the outbound pickup';
    }
    setState(() => _formError = err);
    if (err != null) return;
    final s = QuoteSearch('airport_transfer')
      ..tripType = _tripType
      ..pickup = _pickup.text.trim()
      ..dropoff = _dropoff.text.trim()
      ..pickupAt = _out
      ..passengers = _passengers
      ..luggage = _luggage
      ..flightNumber = _flight.text.trim().toUpperCase()
      ..returnAt = _tripType == 'return' ? _back : null;
    runSearch(s);
  }

  Future<void> _locate() async {
    final a = await pickSavedAddress(context, ref);
    if (!mounted || a == null) return;
    setState(() => _pickup.text = a);
  }

  @override
  Widget build(BuildContext context) {
    final q = selectedQuote;
    final showResults = searching || searchError != null || quotes != null;
    return RdHeroPage(
      hero: const RdHeroHeader(
        image: 'assets/images/plane.jpg',
        title: 'Airport transfer',
        subtitle: 'Airport, hotel and city-to-city transfers.',
        height: 210,
        alignment: Alignment(0, .2),
      ),
      children: [
        BookingSearchCard(active: BookingTab.airport, children: [
          RdSegmented<String>(
            options: const [('one_way', 'One way'), ('return', 'Return')],
            value: _tripType,
            onChanged: (v) => setState(() => _tripType = v),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(color: RdColors.iconTile, borderRadius: BorderRadius.circular(12)),
            child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Padding(padding: EdgeInsets.only(top: 1), child: Icon(Icons.public, size: 17, color: RdColors.gold)),
              const SizedBox(width: 10),
              Expanded(
                child: Text('Transfer between any two places: airport to hotel, hotel to city, or city to city.', style: RdText.sans(13, color: RdColors.soft, height: 1.5)),
              ),
            ]),
          ),
          RdField(
            label: 'Pickup',
            icon: Icons.place_outlined,
            controller: _pickup,
            hint: 'Airport, hotel or address',
            textInputAction: TextInputAction.next,
            action: RdFieldAction(icon: Icons.my_location, tooltip: 'Use a saved place', onPressed: _locate),
          ),
          RdField(
            label: 'Drop-off',
            icon: Icons.place_outlined,
            controller: _dropoff,
            hint: 'Airport, hotel, city or address',
            textInputAction: TextInputAction.next,
            action: RdFieldAction(
              icon: Icons.swap_vert,
              tooltip: 'Swap pickup and drop-off',
              onPressed: () => setState(() {
                final t = _pickup.text;
                _pickup.text = _dropoff.text;
                _dropoff.text = t;
              }),
            ),
          ),
          RdField(
            label: 'Flight number (optional)',
            icon: Icons.flight_land,
            controller: _flight,
            hint: 'e.g. BA 117 — for airport pickups',
            maxLength: 12,
            textCapitalization: TextCapitalization.characters,
            textInputAction: TextInputAction.done,
          ),
          DateTimeRow(value: _out, onChanged: (d) => setState(() => _out = d), dateLabel: 'Pickup date', timeLabel: 'Pickup time'),
          if (_tripType == 'return') ...[
            Padding(
              padding: const EdgeInsets.only(top: 2),
              child: Text('RETURN JOURNEY', style: RdText.sans(12.5, weight: FontWeight.w600, color: RdColors.gold, letterSpacing: .8)),
            ),
            DateTimeRow(value: _back, onChanged: (d) => setState(() => _back = d), dateLabel: 'Return date', timeLabel: 'Return time'),
          ],
        ]),
        RdCard(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
          child: Column(children: [
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 12),
              child: RdStepperRow(label: 'Passengers', subtitle: 'Including you', value: _passengers, min: 1, max: 14, onChanged: (v) => setState(() => _passengers = v)),
            ),
            const Divider(height: 1, color: RdColors.line),
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 12),
              child: RdStepperRow(label: 'Luggage', subtitle: 'Large suitcases', value: _luggage, min: 0, max: 12, onChanged: (v) => setState(() => _luggage = v)),
            ),
          ]),
        ),
        RdCard(
          padding: const EdgeInsets.all(14),
          child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Icon(Icons.verified_user_outlined, size: 20, color: RdColors.gold),
            const SizedBox(width: 12),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('Flight tracking included', style: RdText.sans(14.5, weight: FontWeight.w600)),
                const SizedBox(height: 3),
                Text('Add your flight number and your chauffeur adjusts to delays. Included waiting time is shown on each quote.',
                    style: RdText.sans(12.5, color: RdColors.muted, height: 1.45)),
              ]),
            ),
          ]),
        ),
        if (_formError != null) RdErrorText(_formError!),
        RdCta(label: searching ? 'Finding transfers…' : 'Find a transfer', busy: searching, onPressed: _submit),
        if (showResults) ...[
          const RdSectionTitle('Choose your transfer'),
          QuoteOptionsCard(quotes: quotes, loading: searching, error: searchError, selectedId: selectedId, onSelect: selectQuote, idleText: ''),
          if (!searching && supplierErrors.isNotEmpty) SupplierErrorsText(supplierErrors),
          if (q != null && !searching) ...[
            const PaymentHintRow(),
            RdCta(label: 'Confirm ${classLabel(q.vehicle.cls)} · ${q.price.display}', onPressed: () => confirmQuote(q)),
          ],
        ],
      ],
    );
  }
}
