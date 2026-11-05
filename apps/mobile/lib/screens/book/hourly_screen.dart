// Hourly chauffeur (board: HourlyChauffeur). PWA: src/app/book/hourly/page.tsx
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../api/models.dart';
import '../../state/providers.dart';
import '../../theme.dart';
import '../../widgets/kit.dart';
import 'ride_screen.dart';

const _hourOptions = [2, 3, 4, 6, 8, 10];

class HourlyScreen extends ConsumerStatefulWidget {
  const HourlyScreen({super.key});
  @override
  ConsumerState<HourlyScreen> createState() => _HourlyScreenState();
}

class _HourlyScreenState extends ConsumerState<HourlyScreen> with QuoteSearchMixin<HourlyScreen> {
  final _pickup = TextEditingController();
  final _notes = TextEditingController();
  int _hours = 3;
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
      _hours = _hourOptions.contains(init.hours) ? init.hours : 3;
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

  @override
  Widget build(BuildContext context) {
    final q = selectedQuote;
    final shownHours = lastRun?.hours ?? _hours;
    final canConfirm = q != null && !_dirty && !searching;
    String perHour(Quote x) => '${formatMoney((x.price.customerPrice / shownHours).round(), x.price.currency)}/h';
    return RdHeroPage(
      hero: const RdHeroHeader(
        image: 'assets/images/seat.jpg',
        title: 'Hourly chauffeur',
        subtitle: 'Your time. Our chauffeur.',
        height: 200,
        alignment: Alignment(0, -.2),
      ),
      children: [
        const RdSectionTitle('How many hours?'),
        IgnorePointer(
          ignoring: searching,
          child: RdChips<int>(options: [for (final h in _hourOptions) (h, '$h h')], value: _hours, onChanged: _pickHours),
        ),
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
          ]),
        ),
        const RdSectionTitle('Vehicle class'),
        QuoteOptionsCard(
          quotes: quotes,
          loading: searching,
          error: searchError,
          selectedId: selectedId,
          onSelect: selectQuote,
          idleText: 'Choose how many hours, your start location and time to see prices for a dedicated chauffeur.',
          subtitle: (x) => '${x.vehicle.name} · ${x.supplierName}',
          amount: perHour,
          meta: (x) => 'Up to ${x.vehicle.passengers}',
        ),
        if (!searching && supplierErrors.isNotEmpty) SupplierErrorsText(supplierErrors),
        RdCard(
          child: Row(children: [
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('${q != null ? '${classLabel(q.vehicle.cls)} · ' : ''}Estimated total · $shownHours hours',
                    maxLines: 2, overflow: TextOverflow.ellipsis, style: RdText.sans(12.5, color: RdColors.muted)),
                const SizedBox(height: 2),
                Text(searching ? '…' : (q != null ? q.price.display : '—'), style: RdText.serif(28)),
              ]),
            ),
            const SizedBox(width: 12),
            const RdBadge('Free waiting'),
          ]),
        ),
        RdCta(
          label: searching ? 'Finding chauffeurs…' : (canConfirm ? 'Continue' : 'See prices'),
          busy: searching,
          onPressed: () {
            final sel = selectedQuote;
            if (canConfirm && sel != null) {
              confirmQuote(sel, notes: _notes.text);
            } else {
              _submit();
            }
          },
        ),
      ],
    );
  }
}
