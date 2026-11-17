// Hourly chauffeur (board: HourlyChauffeur). PWA: src/app/book/hourly/page.tsx
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../api/api_client.dart';
import '../../api/models.dart';
import '../../state/providers.dart';
import '../../theme.dart';
import '../../widgets/chauffeur.dart';
import '../../widgets/kit.dart';
import 'ride_screen.dart';

class HourlyScreen extends ConsumerStatefulWidget {
  const HourlyScreen({super.key});
  @override
  ConsumerState<HourlyScreen> createState() => _HourlyScreenState();
}

class _HourlyScreenState extends ConsumerState<HourlyScreen> with QuoteSearchMixin<HourlyScreen> {
  final _pickup = TextEditingController();
  final _notes = TextEditingController();
  int _hours = 3;
  String _cls = 'business_sedan';
  DateTime _start = defaultDateTime(24);
  String _keptDropoff = '';
  String? _formError;
  bool _dirty = false;

  @override
  void initState() {
    super.initState();
    final init = ref.read(lastSearchProvider('hourly'));
    if (init != null) {
      _pickup.text = init.pickup;
      _hours = init.hours.clamp(hourlyMinHours, hourlyMaxHours);
      _keptDropoff = init.dropoff;
      final at = init.pickupAt;
      if (at != null && at.isAfter(DateTime.now())) _start = at;
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
    _notes.dispose();
    super.dispose();
  }

  void _submit([int? hours]) {
    FocusScope.of(context).unfocus();
    final h = hours ?? _hours;
    String? err;
    if (!validAddress(_pickup.text)) {
      err = 'Enter a start location';
    } else if (_start.isBefore(DateTime.now())) {
      err = 'Start time is in the past';
    }
    setState(() => _formError = err);
    if (err != null) return;
    final s = QuoteSearch('hourly')
      ..pickup = _pickup.text.trim()
      ..pickupAt = _start
      ..hours = h
      // Keep a final drop-off from an earlier search (this screen has no field for it).
      ..dropoff = _keptDropoff;
    setState(() => _dirty = false);
    runSearch(s);
  }

  void _pickHours(int h) {
    setState(() => _hours = h);
    // Prices depend on the hours, so refresh them when prices are already showing.
    if (lastRun != null) _submit(h);
  }

  void _pickClass(String key) {
    setState(() => _cls = key);
    final best = bestQuoteByClass(quotes)[key];
    if (best != null) selectQuote(best.id);
    final min = minHoursFor(key);
    if (_hours < min) _pickHours(min);
  }

  @override
  Widget build(BuildContext context) {
    final shownHours = lastRun?.hours ?? _hours;
    // Always price the chosen class (cheapest supplier for it).
    final q = bestQuoteByClass(quotes)[_cls];
    final c = chauffeurClass(_cls);
    final billed = billedHours(_cls, shownHours);
    final currency = q?.price.currency ?? 'USD';
    final perHour = q != null ? (q.price.customerPrice / billed).round() : (c?.hourlyRate ?? 0);
    final canConfirm = q != null && !_dirty && !searching && lastRun?.hours == _hours;
    return RdHeroPage(
      hero: const RdHeroHeader(
        image: 'assets/images/seat.jpg',
        title: 'Hourly chauffeur',
        subtitle: 'Your time. Our chauffeur.',
        height: 200,
        alignment: Alignment(0, -.2),
      ),
      children: [
        const RdSectionTitle('How long?'),
        HoursStepper(value: _hours, min: minHoursFor(_cls), onChanged: _pickHours, disabled: searching),
        RdCard(
          child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            RdField(
              label: 'Start location',
              icon: Icons.place_outlined,
              controller: _pickup,
              hint: 'Hotel, office or address',
              onChanged: (_) {
                if (!_dirty) setState(() => _dirty = true);
              },
            ),
            const SizedBox(height: 12),
            DateTimeRow(
              value: _start,
              timeLabel: 'Start time',
              onChanged: (d) => setState(() {
                _start = d;
                _dirty = true;
              }),
            ),
            const SizedBox(height: 12),
            RdTextArea(label: 'Notes for your chauffeur', controller: _notes, hint: 'Stops, meeting points, preferences'),
            if (_formError != null) ...[const SizedBox(height: 12), RdErrorText(_formError!)],
            const SizedBox(height: 14),
            RdCta(
              label: searching ? 'Searching…' : (quotes != null && !_dirty && lastRun?.hours == _hours ? 'Search again' : 'Search'),
              busy: searching,
              onPressed: _submit,
            ),
          ]),
        ),
        if (quotes != null || searching) ...[
        const RdSectionTitle('Choose your car'),
        if (searchError != null) RdErrorText(errorText(searchError!, 'We could not load prices. Please try again.')),
        if (searching) const Center(child: Padding(padding: EdgeInsets.all(24), child: CircularProgressIndicator(color: RdColors.yellow))) else ClassPickerList(hourly: true, quotes: quotes, value: _cls, hours: shownHours, onPick: _pickClass),
        if (!searching && supplierErrors.isNotEmpty) SupplierErrorsText(supplierErrors),
        if (q != null && !searching) RdCard(
          child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            Text('YOUR BOOKING', style: RdText.eyebrow),
            const SizedBox(height: 4),
            RdSummaryRow('Vehicle', c?.label ?? classLabel(_cls), valueColor: RdColors.cream),
            RdSummaryRow('Hourly rate', '${formatMoney(perHour, currency).replaceAll(RegExp(r'\.00$'), '')} × $billed h', valueColor: RdColors.cream),
            RdSummaryRow('Miles included', '${billed * hourlyIncludedMiles} miles', valueColor: RdColors.cream),
            const Divider(color: RdColors.line, height: 20),
            Text('Total · $billed hours', style: RdText.sans(12.5, color: RdColors.muted)),
            const SizedBox(height: 2),
            Text(q.price.display, style: RdText.serif(30)),
            const SizedBox(height: 14),
            RdCta(
              label: canConfirm ? 'Continue' : 'Search again to update the price',
              onPressed: canConfirm ? () => confirmQuote(q, notes: _notes.text) : null,
            ),
            const SizedBox(height: 10),
            Text('Free cancellation until 24 h before pickup.', textAlign: TextAlign.center, style: RdText.sans(12, color: RdColors.muted)),
          ]),
        ),
        ],
      ],
    );
  }
}
