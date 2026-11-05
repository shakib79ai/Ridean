import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../api/api_client.dart';
import '../../api/models.dart';
import '../../state/providers.dart';
import '../../theme.dart';
import '../../widgets/kit.dart';

/// Board: EditBooking. Sends only the fields that changed.
class EditBookingScreen extends ConsumerStatefulWidget {
  const EditBookingScreen({super.key, required this.id});
  final String id;

  @override
  ConsumerState<EditBookingScreen> createState() => _EditBookingScreenState();
}

class _EditBookingScreenState extends ConsumerState<EditBookingScreen> {
  final _flight = TextEditingController();
  final _notes = TextEditingController();
  bool _loaded = false;

  // Initial values (to work out what changed)
  DateTime? _initPickup;
  String _initFlight = '';
  int _initPassengers = 1;
  int _initLuggage = 0;
  String _initNotes = '';

  DateTime? _pickupAt;
  int _passengers = 1;
  int _luggage = 0;
  bool _busy = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _flight.addListener(_changed);
    _notes.addListener(_changed);
  }

  void _changed() {
    // Ignore the programmatic fill in _initFrom (it runs during build).
    if (!mounted || !_loaded) return;
    setState(() => _error = null);
  }

  @override
  void dispose() {
    _flight.dispose();
    _notes.dispose();
    super.dispose();
  }

  void _initFrom(Booking b) {
    _initPickup = parseDate(b.pickupAt);
    _initFlight = b.flightNumber ?? '';
    _initPassengers = b.passengers ?? 1;
    _initLuggage = b.luggage ?? 0;
    _initNotes = b.notes ?? '';
    _pickupAt = _initPickup;
    _passengers = _initPassengers;
    _luggage = _initLuggage;
    _flight.text = _initFlight;
    _notes.text = _initNotes;
    _loaded = true;
  }

  void _discard() {
    _flight.text = _initFlight;
    _notes.text = _initNotes;
    setState(() {
      _pickupAt = _initPickup;
      _passengers = _initPassengers;
      _luggage = _initLuggage;
      _error = null;
    });
  }

  Map<String, dynamic> _changes() {
    final c = <String, dynamic>{};
    final p = _pickupAt;
    if (p != null && p != _initPickup) c['pickupAt'] = p.toUtc().toIso8601String();
    if (_flight.text.trim() != _initFlight.trim()) c['flightNumber'] = _flight.text.trim().toUpperCase();
    if (_passengers != _initPassengers) c['passengers'] = _passengers;
    if (_luggage != _initLuggage) c['luggage'] = _luggage;
    if (_notes.text.trim() != _initNotes.trim()) c['notes'] = _notes.text.trim();
    return c;
  }

  Future<void> _save(Booking b, Map<String, dynamic> changes) async {
    if (changes.isEmpty || _busy) return;
    final p = _pickupAt;
    if (changes.containsKey('pickupAt') && p != null && p.isBefore(DateTime.now())) {
      setState(() => _error = 'Please choose a pickup time in the future.');
      return;
    }
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await ref.read(apiProvider).updateBooking(b.id, changes);
      if (!mounted) return;
      ref.invalidate(bookingProvider(widget.id));
      ref.invalidate(bookingsProvider);
      showRdToast(context, 'Booking updated');
      if (context.canPop()) {
        context.pop();
      } else {
        context.go('/bookings/${b.id}');
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = errorText(e);
        _busy = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final booking = ref.watch(bookingProvider(widget.id));
    return booking.when(
      loading: () => const RdPage(title: 'Edit booking', children: [RdLoading()]),
      error: (e, _) => RdPage(title: 'Edit booking', children: [RdError(e, onRetry: () => ref.invalidate(bookingProvider(widget.id)))]),
      data: (b) {
        if (!_loaded) _initFrom(b);
        return _content(b);
      },
    );
  }

  Widget _content(Booking b) {
    final pickup = parseDate(b.pickupAt);
    final statusOk = b.editable;
    final timeOk = pickup == null || pickup.difference(DateTime.now()) > const Duration(hours: 1);
    final locked = !statusOk || !timeOk;
    final lockReason = !statusOk ? 'This booking can’t be changed any more.' : 'Changes close 1 hour before pickup — please contact support.';
    final rent = b.service == 'rent';
    final airport = b.service == 'airport_transfer';
    final showFlight = airport || (b.flightNumber ?? '').isNotEmpty;
    final showWhen = pickup != null;
    final changes = _changes();
    final dirty = changes.isNotEmpty;
    final dropoff = b.dropoff;
    final maxPassengers = b.vehicle.passengers > 0 ? (b.vehicle.passengers > _passengers ? b.vehicle.passengers : _passengers) : 8;
    final maxLuggage = b.vehicle.bags > 0 ? (b.vehicle.bags > _luggage ? b.vehicle.bags : _luggage) : 8;
    final disabled = locked || _busy;

    return RdPage(
      title: 'Edit booking',
      subtitle: '${b.serviceLabel} · ${b.reference}',
      children: [
        if (locked) RdErrorText(lockReason),
        RdCard(
          child: AbsorbPointer(
            absorbing: disabled,
            child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
              Opacity(
                opacity: .8,
                child: RdField(label: rent ? 'Pick-up location' : 'Pickup', icon: Icons.place_outlined, value: b.pickup),
              ),
              if (dropoff != null && dropoff.isNotEmpty) ...[
                const SizedBox(height: 12),
                Opacity(
                  opacity: .8,
                  child: RdField(
                    label: rent ? 'Return location' : (airport ? 'Airport' : 'Drop-off'),
                    icon: airport ? Icons.flight_outlined : Icons.place_outlined,
                    value: dropoff,
                  ),
                ),
              ],
              const SizedBox(height: 8),
              Text('To change the route, cancel and book again.', style: RdText.sans(12.5, color: RdColors.muted)),
              if (showFlight) ...[
                const SizedBox(height: 12),
                RdField(
                  label: 'Flight number',
                  icon: Icons.flight_land_outlined,
                  controller: _flight,
                  hint: 'e.g. BA 117',
                  maxLength: 12,
                  textCapitalization: TextCapitalization.characters,
                  enabled: !disabled,
                ),
              ],
              if (showWhen) ...[
                const SizedBox(height: 12),
                Row(children: [
                  Expanded(
                    child: RdDateField(
                      label: 'Date',
                      value: _pickupAt,
                      onChanged: (d) => setState(() {
                        _pickupAt = d;
                        _error = null;
                      }),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: RdTimeField(
                      label: 'Time',
                      value: _pickupAt,
                      onChanged: (d) => setState(() {
                        _pickupAt = d;
                        _error = null;
                      }),
                    ),
                  ),
                ]),
              ],
            ]),
          ),
        ),
        RdCard(
          padding: const EdgeInsets.all(14),
          child: AbsorbPointer(
            absorbing: disabled,
            child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
              if (!rent) ...[
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  child: RdStepperRow(
                    label: 'Passengers',
                    value: _passengers,
                    min: 1,
                    max: maxPassengers,
                    onChanged: (v) => setState(() => _passengers = v),
                  ),
                ),
                const Divider(height: 1, color: RdColors.line),
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  child: RdStepperRow(
                    label: 'Luggage',
                    value: _luggage,
                    min: 0,
                    max: maxLuggage,
                    onChanged: (v) => setState(() => _luggage = v),
                  ),
                ),
                const Divider(height: 1, color: RdColors.line),
                const SizedBox(height: 12),
              ],
              RdTextArea(label: 'Note for your chauffeur', controller: _notes, hint: 'e.g. I\'ll wait by the main entrance'),
            ]),
          ),
        ),
        const RdNote('Changes are free up to 1 hour before pickup'),
        if (_error != null) RdErrorText(_error!),
        RdCta(
          label: _busy ? 'Saving…' : 'Save changes',
          arrow: false,
          busy: _busy,
          onPressed: (!dirty || locked) ? null : () => _save(b, changes),
        ),
        if (dirty && !_busy)
          Center(
            child: TextButton(
              onPressed: _discard,
              child: Text('Discard changes', style: RdText.sans(14, color: RdColors.muted)),
            ),
          ),
      ],
    );
  }
}
