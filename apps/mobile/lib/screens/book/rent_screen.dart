// Rent a car search (board: Rent). PWA: src/app/book/rent/page.tsx (search part).
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../api/models.dart';
import '../../state/providers.dart';
import '../../theme.dart';
import '../../widgets/kit.dart';
import 'ride_screen.dart';

/// Rental pick-up and return happen at 10:00 local time (the form only asks for dates).
DateTime rentalDate(DateTime d) => DateTime(d.year, d.month, d.day, 10);

class RentScreen extends ConsumerStatefulWidget {
  const RentScreen({super.key});
  @override
  ConsumerState<RentScreen> createState() => _RentScreenState();
}

class _RentScreenState extends ConsumerState<RentScreen> {
  final _pickup = TextEditingController();
  final _returnLocation = TextEditingController();
  bool _sameReturn = true;
  DateTime _from = rentalDate(DateTime.now().add(const Duration(days: 1)));
  DateTime _to = rentalDate(DateTime.now().add(const Duration(days: 4)));
  String? _formError;

  @override
  void initState() {
    super.initState();
    final init = ref.read(lastSearchProvider('rent'));
    if (init != null) {
      _pickup.text = init.pickup;
      _sameReturn = init.sameReturn;
      _returnLocation.text = init.returnLocation;
      final a = init.pickupAt, b = init.rentalReturnAt;
      if (a != null && a.isAfter(DateTime.now())) _from = rentalDate(a);
      if (b != null && b.isAfter(_from)) _to = rentalDate(b);
    }
  }

  @override
  void dispose() {
    _pickup.dispose();
    _returnLocation.dispose();
    super.dispose();
  }

  void _submit() {
    FocusScope.of(context).unfocus();
    String? err;
    if (!validAddress(_pickup.text)) {
      err = 'Enter a pick-up location';
    } else if (_from.isBefore(DateTime.now())) {
      err = 'Pick-up date is in the past';
    } else if (!_to.isAfter(_from)) {
      err = 'Return must be after pick-up';
    } else if (!_sameReturn && !validAddress(_returnLocation.text)) {
      err = 'Enter a return location';
    }
    setState(() => _formError = err);
    if (err != null) return;
    final s = QuoteSearch('rent')
      ..pickup = _pickup.text.trim()
      ..pickupAt = _from
      ..rentalReturnAt = _to
      ..sameReturn = _sameReturn
      ..returnLocation = _sameReturn ? '' : _returnLocation.text.trim();
    ref.read(lastSearchProvider('rent').notifier).state = s.copy();
    context.push('/book/rent/compare', extra: s);
  }

  @override
  Widget build(BuildContext context) {
    return RdHeroPage(
      hero: const RdHeroHeader(
        image: 'assets/images/chauffeur-door.jpg',
        title: 'Rent a car',
        subtitle: 'Freedom to move on your terms.',
        height: 190,
        alignment: Alignment(0, -.4),
      ),
      children: [
        BookingSearchCard(active: BookingTab.rent, children: [
          RdField(label: 'Pickup location', icon: Icons.place_outlined, controller: _pickup, hint: 'Airport, city or address', textInputAction: TextInputAction.done),
          GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTap: () => setState(() => _sameReturn = !_sameReturn),
            child: Row(children: [
              RdToggle(value: _sameReturn, onChanged: (v) => setState(() => _sameReturn = v)),
              const SizedBox(width: 10),
              Expanded(child: Text('Return to same location', style: RdText.sans(13.5))),
            ]),
          ),
          if (!_sameReturn)
            RdField(label: 'Return location', icon: Icons.place_outlined, controller: _returnLocation, hint: 'Enter a different return address', textInputAction: TextInputAction.done),
          Row(children: [
            Expanded(
              child: RdDateField(
                label: 'Pick-up',
                value: _from,
                onChanged: (d) => setState(() {
                  _from = rentalDate(d);
                  if (!_to.isAfter(_from)) _to = _from.add(const Duration(days: 1));
                }),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: RdDateField(
                label: 'Return',
                value: _to,
                first: DateTime(_from.year, _from.month, _from.day),
                onChanged: (d) => setState(() => _to = rentalDate(d)),
              ),
            ),
          ]),
          if (_formError != null) RdErrorText(_formError!),
        ]),
        RdCta(label: 'Compare prices', onPressed: _submit),
      ],
    );
  }
}
