import 'package:flutter/material.dart';
import '../data/mock.dart';
import '../theme/tokens.dart';
import '../widgets/common.dart';
import '../widgets/hero_header.dart';
import 'ride_now_screen.dart';
import 'airport_transfer_screen.dart';
import 'hourly_chauffeur_screen.dart';
import 'luxury_chauffeur_screen.dart';
import 'rent_compare_screen.dart';
import 'profile_screen.dart';
import 'booking_details_screen.dart';
import 'contact_driver_screen.dart';
import 'business_account_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final upcoming = trips.firstWhere((t) => t.status == 'upcoming');

    return Scaffold(
      backgroundColor: RColors.surface,
      body: SafeArea(
        bottom: false,
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const _CheckeredFlag(),
              Container(
                color: RColors.navy,
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const RideanMark(size: 34),
                            const SizedBox(width: 9),
                            RichText(
                              text: const TextSpan(
                                style: TextStyle(fontSize: 21, fontWeight: FontWeight.w800, color: Colors.white),
                                children: [
                                  TextSpan(text: 'Ride'),
                                  TextSpan(text: 'an', style: TextStyle(color: RColors.acc)),
                                ],
                              ),
                            ),
                          ],
                        ),
                        Row(
                          children: [
                            _IconBtn(icon: Icons.notifications_outlined, onTap: () {}),
                            const SizedBox(width: 9),
                            _IconBtn(
                              icon: Icons.person_outline,
                              onTap: () => Navigator.of(context).push(
                                MaterialPageRoute(builder: (_) => const ProfileScreen()),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 22),
                    const Text('Where to next?', style: TextStyle(fontSize: 27, fontWeight: FontWeight.w800, color: Colors.white)),
                    const SizedBox(height: 18),
                    Row(
                      children: [
                        _ModeTile(
                          label: 'Rent',
                          icon: Icons.directions_car_filled_rounded,
                          active: true,
                          onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const RentCompareScreen())),
                        ),
                        const SizedBox(width: 9),
                        _ModeTile(
                          label: 'Ride Now',
                          icon: Icons.bolt_rounded,
                          onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const RideNowScreen())),
                        ),
                        const SizedBox(width: 9),
                        _ModeTile(
                          label: 'Airport',
                          icon: Icons.flight_takeoff_rounded,
                          onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const AirportTransferScreen())),
                        ),
                        const SizedBox(width: 9),
                        _ModeTile(
                          label: 'Subscribe',
                          icon: Icons.autorenew_rounded,
                          onTap: () {},
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                child: const _HomeSearchCard(),
              ),
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Upcoming trip', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: RColors.navy)),
                    const SizedBox(height: 8),
                    RCard(
                      dark: true,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  RPill(label: upcoming.mode, tone: 'warn'),
                                  const SizedBox(width: 6),
                                  RPill(
                                    label: upcoming.mode == 'Airport Transfer' ? 'Flight synced' : 'On the way',
                                    tone: 'ok',
                                  ),
                                ],
                              ),
                              Text('${upcoming.date} · ${upcoming.time}',
                                  style: const TextStyle(color: RColors.mutedOnDark, fontSize: 12, fontWeight: FontWeight.w700)),
                            ],
                          ),
                          const SizedBox(height: 10),
                          Text('${upcoming.from} → ${upcoming.to}',
                              style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis),
                          const SizedBox(height: 4),
                          Text('${upcoming.car} · ${upcoming.distance}',
                              style: const TextStyle(color: RColors.mutedOnDark, fontSize: 13)),
                          if (upcoming.mode == 'Airport Transfer') ...[
                            const SizedBox(height: 4),
                            const Text('2 checked bags · 1 carry-on',
                                style: TextStyle(color: RColors.mutedOnDark, fontSize: 12)),
                          ],
                          const SizedBox(height: 14),
                          Row(
                            children: [
                              Expanded(
                                child: GestureDetector(
                                  onTap: () => Navigator.of(context).push(
                                    MaterialPageRoute(builder: (_) => BookingDetailsScreen(trip: upcoming)),
                                  ),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(vertical: 10),
                                    alignment: Alignment.center,
                                    decoration: BoxDecoration(
                                      color: RColors.navy2,
                                      borderRadius: BorderRadius.circular(RRadius.sm),
                                    ),
                                    child: const Text('Trip details',
                                        style: TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w700)),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: GestureDetector(
                                  onTap: () => Navigator.of(context).push(
                                    MaterialPageRoute(builder: (_) => ContactDriverScreen(trip: upcoming)),
                                  ),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(vertical: 10),
                                    alignment: Alignment.center,
                                    decoration: BoxDecoration(
                                      color: RColors.acc,
                                      borderRadius: BorderRadius.circular(RRadius.sm),
                                    ),
                                    child: const Text('Contact driver',
                                        style: TextStyle(color: RColors.navy, fontSize: 12.5, fontWeight: FontWeight.w700)),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFF7E6),
                        border: Border.all(color: const Color(0xFFF6DFA3)),
                        borderRadius: BorderRadius.circular(RRadius.md),
                      ),
                      child: Row(
                        children: [
                          const Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Ridean+', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: RColors.navy)),
                                SizedBox(height: 2),
                                Text('Priority pickups & member pricing',
                                    style: TextStyle(fontSize: 12.5, color: RColors.muted)),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                            decoration: BoxDecoration(color: RColors.navy, borderRadius: BorderRadius.circular(RRadius.md)),
                            child: const Text('Join', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13)),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: RColors.infoBg,
                        border: Border.all(color: const Color(0xFFBFD6EF)),
                        borderRadius: BorderRadius.circular(RRadius.md),
                      ),
                      child: Row(
                        children: [
                          const Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Ridean Business', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: RColors.navy)),
                                SizedBox(height: 2),
                                Text('Centralized billing & travel policies for your team',
                                    style: TextStyle(fontSize: 12.5, color: RColors.muted)),
                              ],
                            ),
                          ),
                          GestureDetector(
                            onTap: () => Navigator.of(context).push(
                              MaterialPageRoute(builder: (_) => const BusinessAccountScreen()),
                            ),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                              decoration: BoxDecoration(color: RColors.navy, borderRadius: BorderRadius.circular(RRadius.md)),
                              child: const Text('Learn more', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13)),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    const Text('Recent trips', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: RColors.navy)),
                    const SizedBox(height: 8),
                    for (final t in trips.where((t) => t.status != 'upcoming').take(3)) ...[
                      _RecentTripRow(trip: t),
                      const SizedBox(height: 8),
                    ],
                    const SizedBox(height: 8),
                    const Text('More ways to ride', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: RColors.navy)),
                    const SizedBox(height: 8),
                    _ServiceRow(
                      icon: Icons.schedule_rounded,
                      label: 'Hourly Chauffeur',
                      desc: 'Vehicle + driver by the hour',
                      onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const HourlyChauffeurScreen())),
                    ),
                    const SizedBox(height: 8),
                    _ServiceRow(
                      icon: Icons.directions_car_rounded,
                      label: 'Luxury Chauffeur',
                      desc: 'Premium vehicles for business & events',
                      onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const LuxuryChauffeurScreen())),
                    ),
                    const SizedBox(height: 8),
                    _ServiceRow(
                      icon: Icons.compare_arrows_rounded,
                      label: 'Compare Rentals',
                      desc: 'Best prices across SIXT, Enterprise & Alamo',
                      onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const RentCompareScreen())),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _CheckeredFlag extends StatelessWidget {
  const _CheckeredFlag();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 11,
      child: Row(
        children: List.generate(24, (i) {
          return Expanded(child: Container(color: i.isEven ? RColors.navy : RColors.acc));
        }),
      ),
    );
  }
}

class _IconBtn extends StatelessWidget {
  const _IconBtn({required this.icon, required this.onTap});

  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 38,
        height: 38,
        decoration: const BoxDecoration(color: RColors.navy2, shape: BoxShape.circle),
        alignment: Alignment.center,
        child: Icon(icon, color: Colors.white, size: 18),
      ),
    );
  }
}

class _ModeTile extends StatelessWidget {
  const _ModeTile({required this.label, required this.icon, required this.onTap, this.active = false});

  final String label;
  final IconData icon;
  final VoidCallback onTap;
  final bool active;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 13, horizontal: 4),
          decoration: BoxDecoration(
            color: active ? RColors.acc : RColors.navy2,
            borderRadius: BorderRadius.circular(RRadius.lg),
          ),
          child: Column(
            children: [
              Icon(icon, size: 20, color: active ? RColors.navy : Colors.white),
              const SizedBox(height: 7),
              Text(
                label,
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w800, color: active ? RColors.navy : Colors.white),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ServiceRow extends StatelessWidget {
  const _ServiceRow({required this.icon, required this.label, required this.desc, required this.onTap});

  final IconData icon;
  final String label;
  final String desc;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return RCard(
      onTap: onTap,
      padding: const EdgeInsets.all(12),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(color: RColors.ground, borderRadius: BorderRadius.circular(RRadius.md)),
            alignment: Alignment.center,
            child: Icon(icon, size: 19, color: RColors.navy),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700, color: RColors.navy)),
                const SizedBox(height: 1),
                Text(desc, style: const TextStyle(fontSize: 11.5, color: RColors.muted)),
              ],
            ),
          ),
          const Icon(Icons.chevron_right, color: RColors.muted),
        ],
      ),
    );
  }
}

enum _SearchTab { ride, airport, hourly, luxury, rentals }

class _HomeSearchCard extends StatefulWidget {
  const _HomeSearchCard();

  @override
  State<_HomeSearchCard> createState() => _HomeSearchCardState();
}

class _HomeSearchCardState extends State<_HomeSearchCard> {
  _SearchTab tab = _SearchTab.ride;
  int hours = 4;
  int passengers = 1;
  int luggage = 1;
  int carryOn = 1;
  bool scheduled = false;

  final pickupCtrl = TextEditingController(text: 'Current location');
  final destCtrl = TextEditingController();
  final pickupDateCtrl = TextEditingController(text: 'Oct 20, 2026');
  final returnDateCtrl = TextEditingController(text: 'Oct 23, 2026');
  final scheduleDateCtrl = TextEditingController(text: 'Oct 23, 2026');
  final scheduleTimeCtrl = TextEditingController(text: '8:00 AM');

  static const List<(_SearchTab, String, IconData)> _tabs = [
    (_SearchTab.ride, 'Ride', Icons.bolt_rounded),
    (_SearchTab.airport, 'Airport', Icons.flight_takeoff_rounded),
    (_SearchTab.hourly, 'Hourly', Icons.schedule_rounded),
    (_SearchTab.luxury, 'Luxury', Icons.directions_car_rounded),
    (_SearchTab.rentals, 'Rentals', Icons.compare_arrows_rounded),
  ];

  @override
  void dispose() {
    pickupCtrl.dispose();
    destCtrl.dispose();
    pickupDateCtrl.dispose();
    returnDateCtrl.dispose();
    scheduleDateCtrl.dispose();
    scheduleTimeCtrl.dispose();
    super.dispose();
  }

  String? _orNull(TextEditingController c) {
    final t = c.text.trim();
    return t.isEmpty ? null : t;
  }

  String get _buttonLabel => switch (tab) {
        _SearchTab.ride => 'Find a ride',
        _SearchTab.airport => 'See transfer rates',
        _SearchTab.hourly => 'See chauffeur rates',
        _SearchTab.luxury => 'See luxury rates',
        _SearchTab.rentals => 'Search rentals',
      };

  void _search() {
    switch (tab) {
      case _SearchTab.ride:
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => RideNowScreen(
              initialPickup: _orNull(pickupCtrl) ?? 'Current location',
              initialDestination: _orNull(destCtrl),
              initialPassengers: passengers,
            ),
          ),
        );
        break;
      case _SearchTab.airport:
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => AirportTransferScreen(
              initialPickup: _orNull(pickupCtrl) ?? '432 Park Ave, Manhattan',
              initialDestination: _orNull(destCtrl) ?? 'JFK Airport, Terminal 4',
              initialPassengers: passengers,
              initialLuggage: luggage,
              initialCarryOn: carryOn,
            ),
          ),
        );
        break;
      case _SearchTab.hourly:
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => HourlyChauffeurScreen(
              initialPickup: _orNull(pickupCtrl) ?? '432 Park Ave, Manhattan',
              initialHours: hours,
              initialPassengers: passengers,
            ),
          ),
        );
        break;
      case _SearchTab.luxury:
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => LuxuryChauffeurScreen(
              initialPickup: _orNull(pickupCtrl) ?? 'One Vanderbilt, Manhattan',
              initialDestination: _orNull(destCtrl) ?? 'JFK Airport, Terminal 4',
              initialPassengers: passengers,
            ),
          ),
        );
        break;
      case _SearchTab.rentals:
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => RentCompareScreen(
              initialPickupLocation: _orNull(pickupCtrl),
              initialPickupDate: _orNull(pickupDateCtrl),
              initialReturnDate: _orNull(returnDateCtrl),
            ),
          ),
        );
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: RColors.surface,
        borderRadius: BorderRadius.circular(RRadius.lg),
        boxShadow: [
          BoxShadow(color: RColors.navy.withOpacity(0.12), blurRadius: 20, offset: const Offset(0, 10)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              for (int i = 0; i < _tabs.length; i++) ...[
                Expanded(
                  child: Builder(
                    builder: (context) {
                      final (t, label, icon) = _tabs[i];
                      final active = t == tab;
                      return GestureDetector(
                        onTap: () => setState(() => tab = t),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          decoration: BoxDecoration(
                            color: active ? RColors.acc : RColors.ground,
                            borderRadius: BorderRadius.circular(RRadius.md),
                          ),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(icon, size: 17, color: active ? RColors.navy : RColors.muted),
                              const SizedBox(height: 4),
                              Text(
                                label,
                                style: TextStyle(
                                  fontSize: 9.5,
                                  fontWeight: FontWeight.w800,
                                  color: active ? RColors.navy : RColors.muted,
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
                if (i != _tabs.length - 1) const SizedBox(width: 6),
              ],
            ],
          ),
          const SizedBox(height: 12),
          _buildFields(),
          const SizedBox(height: 12),
          RButton(label: _buttonLabel, variant: RButtonVariant.accent, onPressed: _search),
        ],
      ),
    );
  }

  Widget _buildFields() {
    return switch (tab) {
      _SearchTab.ride => Column(
          children: [
            Row(
              children: [
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => scheduled = false),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 9),
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: !scheduled ? RColors.navy : RColors.ground,
                        borderRadius: BorderRadius.circular(RRadius.pill),
                      ),
                      child: Text('Ride now',
                          style: TextStyle(
                              fontSize: 12.5,
                              fontWeight: FontWeight.w700,
                              color: !scheduled ? Colors.white : RColors.muted)),
                    ),
                  ),
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => scheduled = true),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 9),
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: scheduled ? RColors.navy : RColors.ground,
                        borderRadius: BorderRadius.circular(RRadius.pill),
                      ),
                      child: Text('Schedule',
                          style: TextStyle(
                              fontSize: 12.5,
                              fontWeight: FontWeight.w700,
                              color: scheduled ? Colors.white : RColors.muted)),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            _SearchInput(controller: pickupCtrl, hint: 'Pickup location', dot: RColors.ok),
            const SizedBox(height: 8),
            _SearchInput(
              controller: destCtrl,
              hint: 'Destination',
              dot: RColors.bad,
              dotShape: BoxShape.rectangle,
            ),
            if (scheduled) ...[
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(child: RField(label: 'Date', value: scheduleDateCtrl.text)),
                  const SizedBox(width: 10),
                  Expanded(child: RField(label: 'Time', value: scheduleTimeCtrl.text)),
                ],
              ),
            ],
            const SizedBox(height: 8),
            _CountStepper(
              label: 'Passengers',
              value: passengers,
              min: 1,
              max: 6,
              onChanged: (v) => setState(() => passengers = v),
            ),
          ],
        ),
      _SearchTab.luxury => Column(
          children: [
            _SearchInput(controller: pickupCtrl, hint: 'Pickup location', dot: RColors.ok),
            const SizedBox(height: 8),
            _SearchInput(
              controller: destCtrl,
              hint: 'Destination',
              dot: RColors.bad,
              dotShape: BoxShape.rectangle,
            ),
            const SizedBox(height: 8),
            _CountStepper(
              label: 'Passengers',
              value: passengers,
              min: 1,
              max: 6,
              onChanged: (v) => setState(() => passengers = v),
            ),
          ],
        ),
      _SearchTab.airport => Column(
          children: [
            _SearchInput(controller: pickupCtrl, hint: 'Pickup location', dot: RColors.ok),
            const SizedBox(height: 8),
            _SearchInput(
              controller: destCtrl,
              hint: 'Destination',
              dot: RColors.bad,
              dotShape: BoxShape.rectangle,
            ),
            const SizedBox(height: 8),
            _CountStepper(
              label: 'Passengers',
              value: passengers,
              min: 1,
              max: 6,
              onChanged: (v) => setState(() => passengers = v),
            ),
            const SizedBox(height: 8),
            _CountStepper(
              label: 'Checked bags',
              value: luggage,
              min: 0,
              max: 6,
              onChanged: (v) => setState(() => luggage = v),
            ),
            const SizedBox(height: 8),
            _CountStepper(
              label: 'Carry-on',
              value: carryOn,
              min: 0,
              max: 6,
              onChanged: (v) => setState(() => carryOn = v),
            ),
          ],
        ),
      _SearchTab.hourly => Column(
          children: [
            _SearchInput(controller: pickupCtrl, hint: 'Pickup location', dot: RColors.ok),
            const SizedBox(height: 8),
            Row(
              children: [
                for (final h in const [3, 4, 6, 8]) ...[
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => hours = h),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: h == hours ? RColors.navy : RColors.ground,
                          border: Border.all(color: h == hours ? RColors.navy : RColors.line),
                          borderRadius: BorderRadius.circular(RRadius.sm),
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          '$h hrs',
                          style: TextStyle(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w700,
                            color: h == hours ? Colors.white : RColors.navy,
                          ),
                        ),
                      ),
                    ),
                  ),
                  if (h != 8) const SizedBox(width: 6),
                ],
              ],
            ),
            const SizedBox(height: 8),
            _CountStepper(
              label: 'Passengers',
              value: passengers,
              min: 1,
              max: 6,
              onChanged: (v) => setState(() => passengers = v),
            ),
          ],
        ),
      _SearchTab.rentals => Column(
          children: [
            _SearchInput(controller: pickupCtrl, hint: 'Pickup location', dot: RColors.ok),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(child: _SearchInput(controller: pickupDateCtrl, hint: 'Pickup date')),
                const SizedBox(width: 8),
                Expanded(child: _SearchInput(controller: returnDateCtrl, hint: 'Return date')),
              ],
            ),
          ],
        ),
    };
  }
}

class _SearchInput extends StatelessWidget {
  const _SearchInput({
    required this.controller,
    required this.hint,
    this.dot,
    this.dotShape = BoxShape.circle,
  });

  final TextEditingController controller;
  final String hint;
  final Color? dot;
  final BoxShape dotShape;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: RColors.ground,
        border: Border.all(color: RColors.line),
        borderRadius: BorderRadius.circular(RRadius.md),
      ),
      child: Row(
        children: [
          if (dot != null) ...[
            Container(width: 9, height: 9, decoration: BoxDecoration(color: dot, shape: dotShape)),
            const SizedBox(width: 10),
          ],
          Expanded(
            child: TextField(
              controller: controller,
              style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w600, color: RColors.navy),
              decoration: InputDecoration(
                hintText: hint,
                hintStyle: const TextStyle(fontSize: 13.5, color: RColors.muted, fontWeight: FontWeight.w500),
                border: InputBorder.none,
                isDense: true,
                contentPadding: const EdgeInsets.symmetric(vertical: 12),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Compact passenger/luggage/carry-on count stepper used in the home
/// search card (Ride Now, Airport Transfer, Hourly & Luxury Chauffeur).
class _CountStepper extends StatelessWidget {
  const _CountStepper({
    required this.label,
    required this.value,
    required this.onChanged,
    this.min = 0,
    this.max = 6,
  });

  final String label;
  final int value;
  final int min;
  final int max;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: RColors.ground,
        border: Border.all(color: RColors.line),
        borderRadius: BorderRadius.circular(RRadius.md),
      ),
      child: Row(
        children: [
          Expanded(
            child: Text(
              label,
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: RColors.navy),
            ),
          ),
          _StepBtn(icon: Icons.remove_rounded, onTap: value > min ? () => onChanged(value - 1) : null),
          SizedBox(
            width: 28,
            child: Text(
              '$value',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: RColors.navy),
            ),
          ),
          _StepBtn(icon: Icons.add_rounded, onTap: value < max ? () => onChanged(value + 1) : null),
        ],
      ),
    );
  }
}

class _StepBtn extends StatelessWidget {
  const _StepBtn({required this.icon, required this.onTap});

  final IconData icon;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final enabled = onTap != null;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 26,
        height: 26,
        decoration: BoxDecoration(
          color: enabled ? RColors.navy : RColors.line,
          borderRadius: BorderRadius.circular(RRadius.sm),
        ),
        alignment: Alignment.center,
        child: Icon(icon, size: 15, color: enabled ? Colors.white : RColors.muted),
      ),
    );
  }
}

class _RecentTripRow extends StatelessWidget {
  const _RecentTripRow({required this.trip});

  final Trip trip;

  @override
  Widget build(BuildContext context) {
    return RCard(
      padding: const EdgeInsets.all(12),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(color: RColors.ground, borderRadius: BorderRadius.circular(RRadius.sm)),
            alignment: Alignment.center,
            child: const Icon(Icons.history_rounded, size: 18, color: RColors.navy2),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('${trip.from} → ${trip.to}',
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: RColors.navy),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis),
                const SizedBox(height: 2),
                Text('${trip.date} · ${trip.car} · ${trip.distance}',
                    style: const TextStyle(fontSize: 11.5, color: RColors.muted)),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(trip.price, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: RColors.navy)),
              const SizedBox(height: 2),
              RPill(label: trip.status == 'cancelled' ? 'Cancelled' : 'Completed', tone: trip.status == 'cancelled' ? 'bad' : 'ok'),
            ],
          ),
        ],
      ),
    );
  }
}
