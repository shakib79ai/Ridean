// Home tab (boards: Main + MainPlatforms). PWA: src/app/(tabs)/page.tsx
// Rendered inside AppShell, which supplies the bottom tab bar.
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../api/models.dart';
import '../state/providers.dart';
import '../theme.dart';
import '../widgets/kit.dart';
import 'book/ride_screen.dart';

const _ink = Color(0xFF000909);
const _cardLine = Color(0x6B467868); // rgba(70,120,104,.42)

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});
  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  @override
  Widget build(BuildContext context) {
    return ColoredBox(
      color: RdColors.bg,
      child: ListView(padding: EdgeInsets.zero, children: [
        const _Hero(),
        Container(
          decoration: const BoxDecoration(gradient: LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter, colors: [_ink, RdColors.bg], stops: [0, .05])),
          child: const Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            SizedBox(height: 18),
            _ServiceRail(),
            SizedBox(height: 18),
            Padding(padding: EdgeInsets.symmetric(horizontal: 20), child: _TrustTiles()),
            SizedBox(height: 34),
            _ClassRail(),
            SizedBox(height: 34),
            Padding(padding: EdgeInsets.fromLTRB(20, 0, 20, 28), child: _MeetGreet()),
          ]),
        ),
      ]),
    );
  }
}

// ---------------------------------------------------------------------------
// Hero + search

class _Hero extends StatelessWidget {
  const _Hero();
  @override
  Widget build(BuildContext context) {
    final top = MediaQuery.of(context).padding.top;
    final imageHeight = 430 + top;
    return ColoredBox(
      color: _ink,
      child: Stack(children: [
        Positioned(top: 0, left: 0, right: 0, height: imageHeight, child: Image.asset('assets/images/hero.jpg', fit: BoxFit.cover, alignment: const Alignment(0, -.4))),
        Positioned(
          top: 0,
          left: 0,
          right: 0,
          height: imageHeight,
          child: const DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [Color(0x8C000909), Color(0x0D000909), Color(0x26000909), _ink],
                stops: [0, .28, .6, 1],
              ),
            ),
          ),
        ),
        Padding(
          padding: EdgeInsets.only(top: top + 8, bottom: 12),
          child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 8, 0),
              child: Row(children: [
                const RdWordmark(size: 44),
                const Spacer(),
                IconButton(onPressed: () => context.go('/account'), tooltip: 'Menu', icon: const Icon(Icons.menu_rounded, color: RdColors.cream, size: 28)),
              ]),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 40, 20, 0),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 300),
                  child: Text('Arrive exceptionally.',
                      style: RdText.serif(40, height: 1.02, color: Colors.white).copyWith(shadows: const [Shadow(color: Color(0x73000000), blurRadius: 18, offset: Offset(0, 2))])),
                ),
                const SizedBox(height: 6),
                ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 220),
                  child: Text('Premium mobility for wherever life takes you.',
                      style: RdText.sans(14.5, height: 1.3, color: const Color(0xFFEEF1EC)).copyWith(shadows: const [Shadow(color: Color(0x80000000), blurRadius: 10, offset: Offset(0, 1))])),
                ),
              ]),
            ),
            const SizedBox(height: 92),
            const _HeroSearch(),
          ]),
        ),
      ]),
    );
  }
}

class _HeroSearch extends ConsumerStatefulWidget {
  const _HeroSearch();
  @override
  ConsumerState<_HeroSearch> createState() => _HeroSearchState();
}

class _HeroSearchState extends ConsumerState<_HeroSearch> {
  final _pickup = TextEditingController();
  final _dropoff = TextEditingController();
  bool _now = true;
  DateTime _when = defaultDateTime(1);
  String? _error;

  @override
  void initState() {
    super.initState();
    final last = ref.read(lastSearchProvider('ride_now'));
    if (last != null) {
      _pickup.text = last.pickup;
      _dropoff.text = last.dropoff;
    }
  }

  @override
  void dispose() {
    _pickup.dispose();
    _dropoff.dispose();
    super.dispose();
  }

  /// Airport transfer and Rent a car open their own screens, carrying the pickup typed here.
  void _openTab(BookingTab t) {
    if (t == BookingTab.ride) return;
    final service = t == BookingTab.airport ? 'airport_transfer' : 'rent';
    final p = _pickup.text.trim();
    if (validAddress(p)) {
      final prev = ref.read(lastSearchProvider(service));
      final s = prev?.copy() ?? QuoteSearch(service);
      s.pickup = p;
      if (t == BookingTab.airport && validAddress(_dropoff.text)) s.dropoff = _dropoff.text.trim();
      ref.read(lastSearchProvider(service).notifier).state = s;
    }
    context.push(t == BookingTab.airport ? '/book/airport-transfer' : '/book/rent');
  }

  void _submit() {
    FocusScope.of(context).unfocus();
    String? err;
    if (!validAddress(_pickup.text)) {
      err = 'Enter a pickup location';
    } else if (!validAddress(_dropoff.text)) {
      err = 'Enter a destination';
    } else if (!_now && _when.isBefore(DateTime.now())) {
      err = 'Pickup time is in the past';
    }
    setState(() => _error = err);
    if (err != null) return;
    final s = QuoteSearch('ride_now')
      ..pickup = _pickup.text.trim()
      ..dropoff = _dropoff.text.trim()
      ..pickupAt = _now ? null : _when;
    ref.read(lastSearchProvider('ride_now').notifier).state = s;
    context.push('/book/ride');
  }

  Future<void> _locate() async {
    final a = await pickSavedAddress(context, ref);
    if (!mounted || a == null) return;
    setState(() => _pickup.text = a);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: const Color(0xCC041813),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0x80467868)),
        boxShadow: const [BoxShadow(color: Color(0xB3000000), blurRadius: 50, offset: Offset(0, 24), spreadRadius: -18)],
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        BookingTabs(active: BookingTab.ride, onSelect: _openTab, fontSize: 12.5),
        Padding(
          padding: const EdgeInsets.fromLTRB(14, 12, 14, 14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: rdGap([
              RdSegmented<bool>(
                options: const [(true, 'Now'), (false, 'Schedule')],
                value: _now,
                onChanged: (v) => setState(() {
                  _now = v;
                  if (!v && _when.isBefore(DateTime.now())) _when = defaultDateTime(1);
                }),
              ),
              if (!_now) DateTimeRow(value: _when, onChanged: (d) => setState(() => _when = d)),
              RdField(
                label: 'Pickup',
                icon: Icons.place_outlined,
                controller: _pickup,
                hint: 'Airport, hotel or address',
                textInputAction: TextInputAction.next,
                action: RdFieldAction(icon: Icons.my_location, tooltip: 'Use a saved place', onPressed: _locate),
              ),
              RdField(
                label: 'Where to?',
                icon: Icons.place_outlined,
                controller: _dropoff,
                hint: 'Enter a destination',
                textInputAction: TextInputAction.search,
                onSubmitted: (_) => _submit(),
                action: RdFieldAction(
                  icon: Icons.swap_vert,
                  tooltip: 'Swap pickup and destination',
                  onPressed: () => setState(() {
                    final t = _pickup.text;
                    _pickup.text = _dropoff.text;
                    _dropoff.text = t;
                  }),
                ),
              ),
              if (_error != null) RdErrorText(_error!),
              RdCta(label: 'Find a ride', onPressed: _submit),
              const _HourlyRow(),
            ], 10),
          ),
        ),
      ]),
    );
  }
}

/// "Hourly chauffeur · Your time. Our chauffeur." shortcut under the search (MainPlatforms board).
class _HourlyRow extends StatelessWidget {
  const _HourlyRow();
  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => context.push('/book/hourly'),
        child: Container(
          padding: const EdgeInsets.all(4),
          decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), border: Border.all(color: RdColors.line)),
          child: Row(children: [
            const RdThumb('assets/images/seat.jpg', width: 110, height: 46, radius: 9),
            const SizedBox(width: 14),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('Hourly chauffeur', maxLines: 1, overflow: TextOverflow.ellipsis, style: RdText.sans(14, weight: FontWeight.w600)),
                const SizedBox(height: 2),
                Text('Your time. Our chauffeur.', maxLines: 1, overflow: TextOverflow.ellipsis, style: RdText.sans(12.5, color: RdColors.muted)),
              ]),
            ),
            const Padding(padding: EdgeInsets.symmetric(horizontal: 8), child: Icon(Icons.chevron_right, color: RdColors.cream, size: 22)),
          ]),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Services

class _ServiceRail extends StatelessWidget {
  const _ServiceRail();

  static const _alignments = {
    'ride_now': Alignment(-.4, 0),
    'airport_transfer': Alignment(-.1, .2),
    'rent': Alignment(-.3, 0),
    'hourly': Alignment(.36, -.56),
    'luxury': Alignment(-.2, .24),
  };

  @override
  Widget build(BuildContext context) {
    return Column(children: [
      SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.fromLTRB(20, 0, 20, 4),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          for (var i = 0; i < services.length; i++) ...[
            if (i > 0) const SizedBox(width: 10),
            _ServiceCard(service: services[i], alignment: _alignments[services[i].key] ?? Alignment.center),
          ],
        ]),
      ),
      const SizedBox(height: 10),
      Row(mainAxisAlignment: MainAxisAlignment.center, children: [
        const Icon(Icons.swap_horiz, size: 14, color: RdColors.muted),
        const SizedBox(width: 6),
        Text('Swipe to see all services', style: RdText.sans(11.5, color: RdColors.muted)),
      ]),
    ]);
  }
}

class _ServiceCard extends StatelessWidget {
  const _ServiceCard({required this.service, required this.alignment});
  final ServiceDef service;
  final Alignment alignment;
  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 206,
      child: Material(
        color: const Color(0xFF001814),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: const BorderSide(color: _cardLine)),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: () => context.push('/book/${service.slug}'),
          child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            SizedBox(
              height: 90,
              child: Stack(fit: StackFit.expand, children: [
                Image.asset(service.image, fit: BoxFit.cover, alignment: alignment),
                const DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter, colors: [Color(0x00001814), Color(0xF2001814)], stops: [.55, 1]),
                  ),
                ),
              ]),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(11, 0, 11, 10),
              child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                Text(service.label, maxLines: 1, overflow: TextOverflow.ellipsis, style: RdText.serif(16.5, weight: FontWeight.w500, color: const Color(0xFFF7F4EC))),
                const SizedBox(height: 4),
                ConstrainedBox(
                  constraints: const BoxConstraints(minHeight: 32),
                  child: Text(service.tagline, maxLines: 3, overflow: TextOverflow.ellipsis, style: RdText.sans(11.5, height: 1.4, color: const Color(0xFFD7DED9))),
                ),
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.only(top: 6),
                  decoration: const BoxDecoration(border: Border(top: BorderSide(color: Color(0x59467868)))),
                  child: Row(children: [
                    Text('Book now', style: RdText.sans(12, weight: FontWeight.w600, color: const Color(0xFFFCCB2C))),
                    const SizedBox(width: 6),
                    const Icon(Icons.arrow_forward, size: 13, color: Color(0xFFFCCB2C)),
                    const Spacer(),
                    Container(
                      width: 24,
                      height: 24,
                      decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: const Color(0x40F3EEDF))),
                      child: const Icon(Icons.chevron_right, size: 15, color: RdColors.cream),
                    ),
                  ]),
                ),
              ]),
            ),
          ]),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Trust tiles

class _TrustTiles extends StatelessWidget {
  const _TrustTiles();
  @override
  Widget build(BuildContext context) {
    return const Column(children: [
      Row(children: [
        Expanded(child: _TrustTile(Icons.sell_outlined, 'No surge pricing', 'One upfront price')),
        SizedBox(width: 10),
        Expanded(child: _TrustTile(Icons.check_rounded, 'Free cancellation', 'Up to 1 hour before')),
      ]),
      SizedBox(height: 10),
      Row(children: [
        Expanded(child: _TrustTile(Icons.verified_user_outlined, 'Vetted chauffeurs', 'Fully licensed')),
        SizedBox(width: 10),
        Expanded(child: _TrustTile(Icons.chat_bubble_outline_rounded, '24/7 support', 'Day or night')),
      ]),
    ]);
  }
}

class _TrustTile extends StatelessWidget {
  const _TrustTile(this.icon, this.title, this.text);
  final IconData icon;
  final String title, text;
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 11),
      decoration: BoxDecoration(color: RdColors.card, borderRadius: BorderRadius.circular(14), border: Border.all(color: RdColors.line)),
      child: Row(children: [
        Container(
          width: 30,
          height: 30,
          decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: const Color(0x73D9A94F))),
          child: Icon(icon, size: 16, color: RdColors.gold),
        ),
        const SizedBox(width: 9),
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(title, maxLines: 1, overflow: TextOverflow.ellipsis, style: RdText.sans(12.5, weight: FontWeight.w600)),
            const SizedBox(height: 1),
            Text(text, maxLines: 1, overflow: TextOverflow.ellipsis, style: RdText.sans(11, color: RdColors.muted)),
          ]),
        ),
      ]),
    );
  }
}

// ---------------------------------------------------------------------------
// Car classes

class _ClassInfo {
  final String image, name, text;
  final int pax, bags;
  const _ClassInfo(this.image, this.name, this.text, this.pax, this.bags);
}

const _classes = [
  _ClassInfo('assets/images/cls-sedan.jpg', 'Sedan', 'Everyday comfort', 3, 2),
  _ClassInfo('assets/images/cls-xl.jpg', 'XL', 'More room for everyone', 6, 4),
  _ClassInfo('assets/images/cls-comfort.jpg', 'Extra Comfort', 'Space to unwind', 3, 2),
  _ClassInfo('assets/images/cls-business.jpg', 'Business', 'Refined executive travel', 3, 2),
  _ClassInfo('assets/images/cls-black.jpg', 'Black Car Service', 'Our most elevated ride', 3, 2),
];

class _ClassRail extends StatelessWidget {
  const _ClassRail();
  @override
  Widget build(BuildContext context) {
    return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const RdEyebrow('Choose your class'),
          const SizedBox(height: 8),
          Text('A car for every journey.', style: RdText.serif(28, height: 1.12)),
          const SizedBox(height: 8),
          Text('Find the space, comfort and style that suit your journey.', style: RdText.sans(14, height: 1.5, color: RdColors.soft)),
        ]),
      ),
      SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 6),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          for (var i = 0; i < _classes.length; i++) ...[
            if (i > 0) const SizedBox(width: 12),
            _ClassCard(_classes[i]),
          ],
        ]),
      ),
      Padding(
        padding: const EdgeInsets.fromLTRB(20, 4, 20, 0),
        child: Text('Vehicle models and capacity vary by supplier. Images are illustrative.', style: RdText.sans(11, color: RdColors.muted)),
      ),
    ]);
  }
}

class _ClassCard extends StatelessWidget {
  const _ClassCard(this.c);
  final _ClassInfo c;
  @override
  Widget build(BuildContext context) {
    Widget spec(IconData icon, String text) => Row(mainAxisSize: MainAxisSize.min, children: [
          Icon(icon, size: 14, color: RdColors.gold),
          const SizedBox(width: 6),
          Text(text, style: RdText.sans(12.5)),
        ]);
    return SizedBox(
      width: 206,
      child: Material(
        color: RdColors.card,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: const BorderSide(color: RdColors.line)),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: () => context.push('/book/ride'),
          child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            SizedBox(height: 124, child: Image.asset(c.image, fit: BoxFit.cover)),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 14, 16, 16),
              child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                Text(c.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: RdText.serif(21)),
                const SizedBox(height: 2),
                Text(c.text, maxLines: 1, overflow: TextOverflow.ellipsis, style: RdText.sans(13, color: RdColors.soft)),
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.symmetric(vertical: 9),
                  decoration: const BoxDecoration(border: Border(top: BorderSide(color: RdColors.line), bottom: BorderSide(color: RdColors.line))),
                  child: Wrap(spacing: 14, runSpacing: 6, children: [
                    spec(Icons.person_outline, '${c.pax} passengers'),
                    spec(Icons.work_outline, '${c.bags} bags'),
                  ]),
                ),
                const SizedBox(height: 10),
                Row(children: [
                  Text('Explore class', style: RdText.sans(13.5, weight: FontWeight.w600, color: RdColors.gold)),
                  const SizedBox(width: 6),
                  const Icon(Icons.arrow_forward, size: 15, color: RdColors.gold),
                ]),
              ]),
            ),
          ]),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Meet & Greet

const _meet = [
  (Icons.person_outline, 'Name sign in arrivals', 'Your chauffeur waits inside the terminal.'),
  (Icons.flight_outlined, 'Flight tracking', 'Pickup moves if you land early or late.'),
  (Icons.schedule, 'Free waiting time', 'Waiting after landing is included.'),
  (Icons.work_outline, 'Help with luggage', 'Your chauffeur carries your bags.'),
];

const _steps = ['Add your flight number when you book.', "Get your chauffeur's name, photo and phone before you land.", 'Meet them in arrivals and go.'];

class _MeetGreet extends StatelessWidget {
  const _MeetGreet();

  Widget _tile((IconData, String, String) m) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: RdColors.mapBg, borderRadius: BorderRadius.circular(12), border: Border.all(color: RdColors.line)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        RdIconTile(m.$1, size: 32),
        const SizedBox(height: 8),
        Text(m.$2, style: RdText.sans(13, weight: FontWeight.w600)),
        const SizedBox(height: 8),
        Text(m.$3, style: RdText.sans(11.5, height: 1.45, color: RdColors.muted)),
      ]),
    );
  }

  Widget _pair(int i) {
    return IntrinsicHeight(
      child: Row(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        Expanded(child: _tile(_meet[i])),
        const SizedBox(width: 10),
        Expanded(child: _tile(_meet[i + 1])),
      ]),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 22),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: RdColors.line),
        gradient: const LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: [Color(0xFF0F2E25), Color(0xFF0A2019)]),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        const RdEyebrow('Meet & Greet'),
        const SizedBox(height: 14),
        Text('Your chauffeur is waiting in arrivals', style: RdText.serif(28, height: 1.12)),
        const SizedBox(height: 14),
        Text('Walk out of customs to a friendly face holding your name sign. No queues, no searching for a car.', style: RdText.sans(14, height: 1.55, color: RdColors.soft)),
        const SizedBox(height: 14),
        _pair(0),
        const SizedBox(height: 10),
        _pair(2),
        const SizedBox(height: 14),
        Container(
          padding: const EdgeInsets.only(top: 14),
          decoration: const BoxDecoration(border: Border(top: BorderSide(color: RdColors.line))),
          child: Column(children: [
            for (var i = 0; i < _steps.length; i++)
              Padding(
                padding: EdgeInsets.only(top: i == 0 ? 0 : 10),
                child: Row(children: [
                  Container(
                    width: 24,
                    height: 24,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: RdColors.gold)),
                    child: Text('${i + 1}', style: RdText.serif(14, weight: FontWeight.w500, color: RdColors.gold)),
                  ),
                  const SizedBox(width: 10),
                  Expanded(child: Text(_steps[i], style: RdText.sans(13, height: 1.45, color: RdColors.soft))),
                ]),
              ),
          ]),
        ),
        const SizedBox(height: 18),
        RdCta(label: 'Book an airport transfer', onPressed: () => context.push('/book/airport-transfer')),
        const SizedBox(height: 10),
        Center(child: RdLink('How Meet & Greet works', size: 13.5, onTap: () => context.push('/help'))),
      ]),
    );
  }
}
