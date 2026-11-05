import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../api/models.dart';
import '../theme.dart';
import '../widgets/common.dart';

/// One search form for every service; fields adapt to the service (mirrors web-core BookingSearch).
class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key, required this.service});
  final String service; // slug
  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  late final ServiceDef def = services.firstWhere((s) => s.slug == widget.service, orElse: () => services.first);
  late final QuoteSearch s = QuoteSearch(def.key)
    ..pickupAt = def.supportsNow ? null : DateTime.now().add(const Duration(hours: 3))
    ..rentalReturnAt = DateTime.now().add(const Duration(days: 3));
  bool now = true;
  final _form = GlobalKey<FormState>();

  Future<DateTime?> _pick(DateTime? initial) async {
    final base = initial ?? DateTime.now().add(const Duration(hours: 2));
    final d = await showDatePicker(context: context, initialDate: base, firstDate: DateTime.now(), lastDate: DateTime.now().add(const Duration(days: 365)));
    if (d == null || !mounted) return null;
    final t = await showTimePicker(context: context, initialTime: TimeOfDay.fromDateTime(base));
    if (t == null) return null;
    return DateTime(d.year, d.month, d.day, t.hour, t.minute);
  }

  Widget _dateTile(String label, DateTime? v, ValueChanged<DateTime> set) => InkWell(
        onTap: () async {
          final r = await _pick(v);
          if (r != null) setState(() => set(r));
        },
        child: InputDecorator(
          decoration: InputDecoration(labelText: label, prefixIcon: const Icon(Icons.calendar_today, size: 18)),
          child: Text(v == null ? 'Choose' : DateFormat('EEE d MMM, h:mm a').format(v)),
        ),
      );

  void _submit() {
    if (!_form.currentState!.validate()) return;
    if (def.key == 'ride_now' && now) s.pickupAt = null;
    context.push('/quotes', extra: s);
  }

  @override
  Widget build(BuildContext context) {
    final rent = def.key == 'rent';
    final air = def.key == 'airport_transfer';
    const gap = SizedBox(height: 12);
    return Scaffold(
      appBar: AppBar(title: Text(def.label)),
      body: Form(
        key: _form,
        child: ListView(padding: const EdgeInsets.all(16), children: [
          Text(def.tagline, style: const TextStyle(color: RdColors.muted)),
          const SizedBox(height: 16),
          if (def.supportsNow) ...[
            SegmentedButton<bool>(segments: const [ButtonSegment(value: true, label: Text('Now')), ButtonSegment(value: false, label: Text('Schedule'))], selected: {now}, onSelectionChanged: (v) => setState(() => now = v.first)),
            gap,
          ],
          if (air) ...[
            SegmentedButton<String>(segments: const [ButtonSegment(value: 'one_way', label: Text('One way')), ButtonSegment(value: 'return', label: Text('Return'))], selected: {s.tripType}, onSelectionChanged: (v) => setState(() => s.tripType = v.first)),
            gap,
            const Text('Transfer between any two places: airport to hotel, hotel to city, or city to city.', style: TextStyle(color: RdColors.muted, fontSize: 13)),
            gap,
          ],
          TextFormField(
            decoration: InputDecoration(labelText: rent ? 'Pick-up location' : 'Pickup', hintText: 'Airport, hotel or address', prefixIcon: const Icon(Icons.place_outlined)),
            onChanged: (v) => s.pickup = v,
            validator: (v) => (v ?? '').trim().length < 3 ? 'Enter a pickup location' : null,
          ),
          gap,
          if (!rent) ...[
            TextFormField(
              decoration: InputDecoration(labelText: def.key == 'hourly' ? 'Drop-off (optional)' : 'Drop-off', hintText: 'Airport, hotel, city or address', prefixIcon: const Icon(Icons.flag_outlined)),
              onChanged: (v) => s.dropoff = v,
              validator: (v) => def.key != 'hourly' && (v ?? '').trim().length < 3 ? 'Enter a destination' : null,
            ),
            gap,
          ],
          if (rent) ...[
            CheckboxListTile(contentPadding: EdgeInsets.zero, value: s.sameReturn, onChanged: (v) => setState(() => s.sameReturn = v ?? true), title: const Text('Return to same location')),
            if (!s.sameReturn) ...[
              TextFormField(decoration: const InputDecoration(labelText: 'Return location', prefixIcon: Icon(Icons.keyboard_return)), onChanged: (v) => s.returnLocation = v, validator: (v) => (v ?? '').trim().length < 3 ? 'Enter a return location' : null),
              gap,
            ],
          ],
          if (air) ...[
            TextFormField(decoration: const InputDecoration(labelText: 'Flight number (optional)', hintText: 'e.g. BA 117', prefixIcon: Icon(Icons.flight)), onChanged: (v) => s.flightNumber = v),
            gap,
          ],
          if (!(def.supportsNow && now)) ...[
            _dateTile(rent ? 'Pick-up date & time' : 'Pickup date & time', s.pickupAt, (v) => s.pickupAt = v),
            gap,
          ],
          if (air && s.tripType == 'return') ...[_dateTile('Return date & time', s.returnAt, (v) => s.returnAt = v), gap],
          if (rent) ...[_dateTile('Drop-off date & time', s.rentalReturnAt, (v) => s.rentalReturnAt = v), gap],
          if (def.key == 'hourly') ...[Stepper2(icon: Icons.schedule, label: 'Hours', value: s.hours, min: 2, max: 12, onChanged: (v) => setState(() => s.hours = v)), gap],
          if (!rent)
            Row(children: [
              Expanded(child: Stepper2(icon: Icons.person_outline, label: 'Passengers', value: s.passengers, onChanged: (v) => setState(() => s.passengers = v))),
              const SizedBox(width: 10),
              Expanded(child: Stepper2(icon: Icons.luggage_outlined, label: 'Bags', value: s.luggage, min: 0, onChanged: (v) => setState(() => s.luggage = v))),
            ]),
          const SizedBox(height: 20),
          FilledButton(onPressed: _submit, child: Text(rent ? 'Search cars' : air ? 'Find a transfer' : 'Find a ride')),
        ]),
      ),
    );
  }
}
