// Ride (board: RideNow) plus the booking helpers shared by every booking screen
// (service tabs, quote search state, quote list, payment hint, saved-place picker).
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../api/api_client.dart';
import '../../api/models.dart';
import '../../state/providers.dart';
import '../../theme.dart';
import '../../widgets/kit.dart';

// ---------------------------------------------------------------------------
// Shared booking helpers

/// The API needs at least 2 characters per address.
bool validAddress(String s) => s.trim().length >= 2;

/// Now + [hoursAhead], rounded up to the next quarter hour.
DateTime defaultDateTime([int hoursAhead = 24]) {
  final d = DateTime.now().add(Duration(hours: hoursAhead));
  final add = (15 - d.minute % 15) % 15;
  return DateTime(d.year, d.month, d.day, d.hour, d.minute).add(Duration(minutes: add));
}

/// A saved search can be re-run automatically when its addresses are set and its time is not in the past.
bool canAutoRun(QuoteSearch? s) {
  if (s == null || !validAddress(s.pickup)) return false;
  if (s.service == 'rent') {
    final a = s.pickupAt, b = s.rentalReturnAt;
    return a != null && b != null && a.isAfter(DateTime.now()) && b.isAfter(a);
  }
  if (s.service != 'hourly' && !validAddress(s.dropoff)) return false;
  final at = s.pickupAt;
  if (at == null) return s.service == 'ride_now';
  return at.isAfter(DateTime.now());
}

const _classLabels = {
  'sedan': 'Sedan',
  'xl': 'XL',
  'extra_comfort': 'Extra Comfort',
  'business': 'Business',
  'black': 'Black Car Service',
};

/// "extra_comfort" → "Extra Comfort" (VEHICLE_CLASSES labels, otherwise a tidied key).
String classLabel(String cls) {
  final known = _classLabels[cls];
  if (known != null) return known;
  final s = cls.replaceAll('_', ' ').trim();
  return s.isEmpty ? 'Car' : s[0].toUpperCase() + s.substring(1);
}

/// ETA, trip time or capacity — shown under the price.
String quoteMeta(Quote q) {
  final eta = q.etaMinutes;
  if (eta != null) return '$eta min';
  final dur = q.durationMinutes;
  if (dur != null) return '~$dur min trip';
  return 'Up to ${q.vehicle.passengers}';
}

/// Search + results state for a booking screen: loading, supplier errors, selection, checkout hand-off.
mixin QuoteSearchMixin<T extends ConsumerStatefulWidget> on ConsumerState<T> {
  /// null = no search has run yet.
  List<Quote>? quotes;
  List<String> supplierErrors = const [];
  Object? searchError;
  bool searching = false;
  String? selectedId;
  QuoteSearch? lastRun;
  int _seq = 0;

  Quote? get selectedQuote {
    final list = quotes;
    final id = selectedId;
    if (list == null || id == null) return null;
    for (final q in list) {
      if (q.id == id) return q;
    }
    return null;
  }

  void selectQuote(String id) => setState(() => selectedId = id);

  Future<void> runSearch(QuoteSearch s) async {
    final id = ++_seq;
    final snapshot = s.copy();
    ref.read(lastSearchProvider(snapshot.service).notifier).state = snapshot;
    setState(() {
      lastRun = snapshot;
      searching = true;
      searchError = null;
      supplierErrors = const [];
    });
    try {
      final r = await ref.read(apiProvider).searchQuotes(snapshot);
      if (!mounted || id != _seq) return;
      setState(() {
        quotes = r.quotes;
        supplierErrors = r.errors;
        selectedId = r.quotes.isEmpty ? null : r.quotes.first.id;
        searching = false;
      });
    } catch (e) {
      if (!mounted || id != _seq) return;
      setState(() {
        quotes = const [];
        selectedId = null;
        searchError = e;
        searching = false;
      });
    }
  }

  /// Saves the trip extras for checkout and opens /checkout/<quoteId>.
  void confirmQuote(Quote q, {String? notes}) {
    final draft = ref.read(checkoutDraftProvider(q.id));
    final last = lastRun;
    if (last != null && last.flightNumber.isNotEmpty) draft.flightNumber = last.flightNumber;
    final n = notes?.trim() ?? '';
    if (n.isNotEmpty) draft.notes = n;
    context.push('/checkout/${q.id}');
  }
}

/// Lets the user pick one of their saved places for a pickup (the app has no device-location access).
Future<String?> pickSavedAddress(BuildContext context, WidgetRef ref) async {
  if (ref.read(authProvider).user == null) {
    showRdToast(context, 'Please type your pickup address');
    return null;
  }
  List<SavedAddress> list;
  try {
    list = await ref.read(apiProvider).addresses();
  } catch (_) {
    list = const [];
  }
  if (!context.mounted) return null;
  if (list.isEmpty) {
    showRdToast(context, 'No saved places yet — please type your pickup');
    return null;
  }
  return showModalBottomSheet<String>(
    context: context,
    backgroundColor: RdColors.card,
    shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
    builder: (c) => SafeArea(
      child: ConstrainedBox(
        constraints: BoxConstraints(maxHeight: MediaQuery.of(c).size.height * .6),
        child: ListView(shrinkWrap: true, padding: const EdgeInsets.fromLTRB(20, 18, 20, 12), children: [
          Text('Saved places', style: RdText.serif(19)),
          const SizedBox(height: 6),
          for (final a in list)
            RdListTile(icon: Icons.place_outlined, title: a.label.isEmpty ? a.address : a.label, subtitle: a.label.isEmpty ? null : a.address, onTap: () => Navigator.pop(c, a.address)),
        ]),
      ),
    ),
  );
}

enum BookingTab { ride, airport, rent }

const _tabRoutes = {BookingTab.ride: '/book/ride', BookingTab.airport: '/book/airport-transfer', BookingTab.rent: '/book/rent'};

/// Ride / Airport transfer / Rent a car tabs. Default action swaps to that booking screen.
class BookingTabs extends StatelessWidget {
  const BookingTabs({super.key, required this.active, this.onSelect, this.fontSize = 13});
  final BookingTab active;
  final ValueChanged<BookingTab>? onSelect;
  final double fontSize;

  static const _items = [
    (BookingTab.ride, 'Ride'),
    (BookingTab.airport, 'Airport transfer'),
    (BookingTab.rent, 'Rent a car'),
  ];

  Widget _icon(BookingTab t, Color c) {
    switch (t) {
      case BookingTab.ride:
        return Icon(Icons.directions_car_outlined, size: 18, color: c);
      case BookingTab.airport:
        return Transform.rotate(angle: 0.785, child: Icon(Icons.flight, size: 18, color: c));
      case BookingTab.rent:
        return Icon(Icons.car_rental, size: 18, color: c);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8),
      decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: RdColors.line))),
      child: Row(children: [
        for (final it in _items)
          Expanded(
            child: Semantics(
              selected: it.$1 == active,
              button: true,
              child: InkWell(
                onTap: () {
                  final f = onSelect;
                  if (f != null) {
                    f(it.$1);
                  } else if (it.$1 != active) {
                    context.pushReplacement(_tabRoutes[it.$1]!);
                  }
                },
                child: Container(
                  padding: const EdgeInsets.fromLTRB(2, 14, 2, 11),
                  decoration: BoxDecoration(border: Border(bottom: BorderSide(color: it.$1 == active ? RdColors.yellow : Colors.transparent, width: 2.5))),
                  child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                    _icon(it.$1, it.$1 == active ? RdColors.yellow : RdColors.cream),
                    const SizedBox(width: 6),
                    Flexible(
                      child: Text(it.$2,
                          maxLines: 1, overflow: TextOverflow.ellipsis, softWrap: false, style: RdText.sans(fontSize, color: it.$1 == active ? RdColors.yellow : RdColors.cream)),
                    ),
                  ]),
                ),
              ),
            ),
          ),
      ]),
    );
  }
}

/// Search card with the service tabs across its top edge.
class BookingSearchCard extends StatelessWidget {
  const BookingSearchCard({super.key, required this.active, required this.children});
  final BookingTab active;
  final List<Widget> children;
  @override
  Widget build(BuildContext context) {
    return RdCard(
      padding: EdgeInsets.zero,
      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        BookingTabs(active: active),
        Padding(padding: const EdgeInsets.fromLTRB(16, 14, 16, 16), child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: rdGap(children, 12))),
      ]),
    );
  }
}

/// Date + time pickers side by side.
class DateTimeRow extends StatelessWidget {
  const DateTimeRow({super.key, required this.value, required this.onChanged, this.dateLabel = 'Date', this.timeLabel = 'Time'});
  final DateTime value;
  final ValueChanged<DateTime> onChanged;
  final String dateLabel, timeLabel;
  @override
  Widget build(BuildContext context) {
    return Row(children: [
      Expanded(child: RdDateField(label: dateLabel, value: value, onChanged: onChanged)),
      const SizedBox(width: 10),
      Expanded(child: RdTimeField(label: timeLabel, value: value, onChanged: onChanged)),
    ]);
  }
}

/// "Hertz didn’t respond · SIXT didn’t respond".
class SupplierErrorsText extends StatelessWidget {
  const SupplierErrorsText(this.errors, {super.key});
  final List<String> errors;
  @override
  Widget build(BuildContext context) {
    if (errors.isEmpty) return const SizedBox.shrink();
    return Text(errors.map((s) => '$s didn’t respond').join(' · '), style: RdText.sans(12, color: RdColors.muted, height: 1.5));
  }
}

/// The design's option list: skeletons, error, idle / empty text and the selectable rows.
class QuoteOptionsCard extends StatelessWidget {
  const QuoteOptionsCard({
    super.key,
    required this.quotes,
    required this.loading,
    required this.error,
    required this.selectedId,
    required this.onSelect,
    required this.idleText,
    this.title,
    this.subtitle,
    this.amount,
    this.meta,
  });
  final List<Quote>? quotes;
  final bool loading;
  final Object? error;
  final String? selectedId;
  final ValueChanged<String> onSelect;
  final String idleText;
  final String Function(Quote)? title, subtitle, amount, meta;

  @override
  Widget build(BuildContext context) {
    Widget muted(String t) => Padding(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 16), child: Text(t, style: RdText.sans(14, color: RdColors.muted, height: 1.5)));
    final list = quotes;
    final err = error;
    List<Widget> body;
    if (loading) {
      body = [for (var i = 0; i < 3; i++) Container(height: 72, decoration: BoxDecoration(color: RdColors.bg, borderRadius: BorderRadius.circular(14)))];
    } else if (err != null) {
      body = [Padding(padding: const EdgeInsets.all(8), child: RdErrorText(errorText(err, 'We could not load prices. Please try again.')))];
    } else if (list == null) {
      body = [muted(idleText)];
    } else if (list.isEmpty) {
      body = [muted('No cars are available for this trip right now. Try a different time or location.')];
    } else {
      body = [
        for (final q in list)
          RdOptionRow(
            image: q.vehicle.image,
            title: title?.call(q) ?? classLabel(q.vehicle.cls),
            subtitle: subtitle?.call(q) ?? '${q.vehicle.passengers} seats · ${q.vehicle.name} · ${q.supplierName}',
            price: amount?.call(q) ?? q.price.display,
            meta: meta?.call(q) ?? quoteMeta(q),
            selected: q.id == selectedId,
            onTap: () => onSelect(q.id),
          ),
      ];
    }
    return RdCard(padding: const EdgeInsets.all(8), child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: rdGap(body, 6)));
  }
}

/// "Visa •••• 4242 · Change" — only when the user is signed in and has a saved card.
class PaymentHintRow extends ConsumerWidget {
  const PaymentHintRow({super.key});
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (ref.watch(authProvider).user == null) return const SizedBox.shrink();
    final cards = ref.watch(paymentMethodsProvider).valueOrNull;
    if (cards == null || cards.isEmpty) return const SizedBox.shrink();
    final card = cards.firstWhere((c) => c.isDefault, orElse: () => cards.first);
    return InkWell(
      onTap: () => context.push('/account/payment-methods'),
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 2, vertical: 6),
        child: Row(children: [
          const Icon(Icons.credit_card, size: 20, color: RdColors.gold),
          const SizedBox(width: 12),
          Expanded(child: Text(card.label, maxLines: 1, overflow: TextOverflow.ellipsis, style: RdText.sans(14.5))),
          Text('Change', style: RdText.sans(13, color: RdColors.gold)),
        ]),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Ride screen

class RideScreen extends ConsumerStatefulWidget {
  const RideScreen({super.key});
  @override
  ConsumerState<RideScreen> createState() => _RideScreenState();
}

class _RideScreenState extends ConsumerState<RideScreen> with QuoteSearchMixin<RideScreen> {
  final _pickup = TextEditingController();
  final _dropoff = TextEditingController();
  bool _now = true;
  DateTime _when = defaultDateTime(1);
  int _passengers = 1;
  String? _formError;

  /// Form edited since the prices on screen were fetched → the CTA searches again.
  bool _dirty = false;

  @override
  void initState() {
    super.initState();
    final init = ref.read(lastSearchProvider('ride_now'));
    if (init != null) {
      _pickup.text = init.pickup;
      _dropoff.text = init.dropoff;
      final at = init.pickupAt;
      _now = at == null;
      if (at != null) _when = at;
      _passengers = init.passengers;
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
    String? err;
    if (!validAddress(_pickup.text)) {
      err = 'Enter a pickup location';
    } else if (!validAddress(_dropoff.text)) {
      err = 'Enter a destination';
    } else if (!_now && _when.isBefore(DateTime.now())) {
      err = 'Pickup time is in the past';
    }
    setState(() => _formError = err);
    if (err != null) return;
    final s = QuoteSearch('ride_now')
      ..pickup = _pickup.text.trim()
      ..dropoff = _dropoff.text.trim()
      ..passengers = _passengers
      ..pickupAt = _now ? null : _when;
    setState(() => _dirty = false);
    runSearch(s);
  }

  Future<void> _locate() async {
    final a = await pickSavedAddress(context, ref);
    if (!mounted || a == null) return;
    setState(() {
      _pickup.text = a;
      _dirty = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    final q = selectedQuote;
    final canConfirm = q != null && !_dirty && !searching;
    final list = quotes;
    return RdPage(
      title: 'Ride',
      subtitle: 'Premium rides for every occasion.',
      children: [
        const RdMap(height: 190),
        BookingSearchCard(active: BookingTab.ride, children: [
          RdSegmented<bool>(
            options: const [(true, 'Now'), (false, 'Schedule')],
            value: _now,
            onChanged: (v) => setState(() {
              _now = v;
              _dirty = true;
              if (!v && _when.isBefore(DateTime.now())) _when = defaultDateTime(1);
            }),
          ),
          if (!_now)
            DateTimeRow(
              value: _when,
              onChanged: (d) => setState(() {
                _when = d;
                _dirty = true;
              }),
            ),
          RdField(
            label: 'Pickup',
            icon: Icons.place_outlined,
            controller: _pickup,
            hint: 'Airport, hotel or address',
            onChanged: (_) => _edited(),
            textInputAction: TextInputAction.next,
            action: RdFieldAction(icon: Icons.my_location, tooltip: 'Use a saved place', onPressed: _locate),
          ),
          RdField(
            label: 'Where to?',
            icon: Icons.place_outlined,
            controller: _dropoff,
            hint: 'Enter a destination',
            onChanged: (_) => _edited(),
            textInputAction: TextInputAction.search,
            onSubmitted: (_) => _submit(),
            action: RdFieldAction(
              icon: Icons.swap_vert,
              tooltip: 'Swap pickup and destination',
              onPressed: () => setState(() {
                final t = _pickup.text;
                _pickup.text = _dropoff.text;
                _dropoff.text = t;
                _dirty = true;
              }),
            ),
          ),
          if (_formError != null) RdErrorText(_formError!),
        ]),
        const RdSectionTitle('Choose your ride'),
        QuoteOptionsCard(
          quotes: list,
          loading: searching,
          error: searchError,
          selectedId: selectedId,
          onSelect: selectQuote,
          idleText: 'Enter your pickup and destination to see upfront prices from our partners.',
        ),
        if (!searching && supplierErrors.isNotEmpty) SupplierErrorsText(supplierErrors),
        const PaymentHintRow(),
        RdCta(
          label: searching ? 'Finding rides…' : (q != null && canConfirm ? 'Confirm ${classLabel(q.vehicle.cls)} · ${q.price.display}' : 'See prices'),
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
        if (_dirty && list != null && list.isNotEmpty && !searching)
          Text('Trip details changed — tap to refresh prices.', textAlign: TextAlign.center, style: RdText.sans(12.5, color: RdColors.muted)),
      ],
    );
  }
}
