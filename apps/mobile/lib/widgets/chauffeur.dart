// The 8 pre-booked classes (same keys as Ridean Direct dispatch) plus the hours stepper and car picker.
// Website / PWA: packages/shared/src/services.ts (CHAUFFEUR_CLASSES) and packages/web-core/src/Chauffeur.tsx.
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../api/models.dart';
import '../theme.dart';

enum CarShape { sedan, suv, minivan, van }

class ChauffeurClass {
  const ChauffeurClass(this.key, this.label, this.category, this.example, this.passengers, this.bags, this.shape, this.hourlyRate, this.minHours, this.airportFrom, this.photo);
  final String key, label, example;

  /// economy · ride · business · first (same structure as SIXT ride).
  final String category;
  final int passengers, bags;
  final CarShape shape;

  /// Cents. Ridean company rate card; customer channels add their margin.
  final int hourlyRate;
  final int minHours;

  /// Cents. Lowest airport fare (JFK/LGA/EWR), shown as "from".
  final int airportFrom;

  /// Studio photo (assets/images).
  final String photo;
}

/// Ridean's 9 classes — the same keys and names as Ridean Direct dispatch.
const chauffeurClasses = [
  ChauffeurClass('economy_light', 'Economy Light', 'economy', 'Toyota Corolla or similar', 3, 1, CarShape.sedan, 7500, 3, 9500, 'assets/images/cls-comfort.jpg'),
  ChauffeurClass('ride', 'Ride', 'ride', 'Toyota Camry or similar', 3, 2, CarShape.sedan, 8500, 3, 11000, 'assets/images/cls-sedan.jpg'),
  ChauffeurClass('ride_suv', 'Ride SUV', 'ride', 'Toyota Highlander or similar', 5, 4, CarShape.suv, 9500, 3, 12500, 'assets/images/cls-xl.jpg'),
  ChauffeurClass('ride_xl', 'Ride XL', 'ride', 'Toyota Sienna or similar', 6, 5, CarShape.minivan, 10500, 3, 14000, 'assets/images/cls-xl.jpg'),
  ChauffeurClass('ride_xxl', 'Ride XXL', 'ride', 'Mercedes Sprinter or similar', 12, 8, CarShape.van, 19500, 4, 25000, 'assets/images/cls-suv-black.jpg'),
  ChauffeurClass('business', 'Business', 'business', 'Mercedes E-Class or similar', 3, 2, CarShape.sedan, 10000, 3, 13000, 'assets/images/cls-business.jpg'),
  ChauffeurClass('business_suv', 'Business SUV', 'business', 'Chevrolet Suburban or similar', 6, 4, CarShape.suv, 12500, 3, 16500, 'assets/images/cls-xl.jpg'),
  ChauffeurClass('first', 'First', 'first', 'Mercedes S-Class or similar', 3, 2, CarShape.sedan, 15500, 3, 18500, 'assets/images/cls-black.jpg'),
  ChauffeurClass('first_suv', 'First SUV', 'first', 'Cadillac Escalade or similar', 6, 4, CarShape.suv, 15000, 3, 19500, 'assets/images/cls-suv-black.jpg'),
];

/// Old class keys → new keys, so older bookings and partner feeds still resolve.
const legacyClassKeys = {
  'sedan': 'ride',
  'extra_comfort': 'ride',
  'xl': 'ride_suv',
  'black': 'first',
  'standard_sedan': 'ride',
  'business_sedan': 'business',
  'first_sedan': 'first',
  'midsize_suv': 'ride_suv',
  'minivan': 'ride_xl',
  'large_suv': 'business_suv',
  'premium_suv': 'first_suv',
  'executive_van': 'ride_xxl',
};

String normalizeClassKey(String key) => legacyClassKeys[key] ?? key;

/// Classes offered for Luxury chauffeur.
const luxuryClassKeys = ['business', 'business_suv', 'first', 'first_suv'];

const hourlyMinHours = 3;
const hourlyMaxHours = 12;
const hourlyIncludedMiles = 15;

ChauffeurClass? chauffeurClass(String key) {
  final k = normalizeClassKey(key);
  for (final c in chauffeurClasses) {
    if (c.key == k) return c;
  }
  return null;
}

/// Display name for any class key, old or new ("business_sedan" → "Business").
String vehicleClassLabel(String key) {
  final c = chauffeurClass(key);
  if (c != null) return c.label;
  final s = key.replaceAll('_', ' ').trim();
  return s.isEmpty ? 'Car' : s[0].toUpperCase() + s.substring(1);
}

int minHoursFor(String key) => chauffeurClass(key)?.minHours ?? hourlyMinHours;
int billedHours(String key, int hours) => hours < minHoursFor(key) ? minHoursFor(key) : hours;

/// Cheapest quote per class.
Map<String, Quote> bestQuoteByClass(List<Quote>? quotes) {
  final m = <String, Quote>{};
  for (final q in quotes ?? const <Quote>[]) {
    final cur = m[q.vehicle.cls];
    if (cur == null || q.price.customerPrice < cur.price.customerPrice) m[q.vehicle.cls] = q;
  }
  return m;
}

String _whole(int minor, String currency) => formatMoney(minor, currency).replaceAll(RegExp(r'\.00$'), '');

const _body = {
  CarShape.sedan: 'M4 38c0-5 1-8 6-9l14-2 14-9c3-2 6-3 10-3h22c4 0 7 1 10 3l12 9 16 2c5 1 8 3 8 7v2c0 1-1 2-2 2h-4a11 11 0 0 0-21 0H33a11 11 0 0 0-21 0H6c-1 0-2-1-2-2z M42 26l9-7c2-1 3-2 6-2h10v9z M71 26v-9h6c3 0 5 1 7 3l7 6z',
  CarShape.suv: 'M4 37c0-6 2-9 7-10l12-2 9-11c2-2 4-3 7-3h44c3 0 5 1 7 3l9 10 10 2c4 1 6 4 6 8v4c0 1-1 2-2 2h-5a11 11 0 0 0-21 0H33a11 11 0 0 0-21 0H6c-1 0-2-1-2-2z M36 25l7-9c1-1 2-2 4-2h12v11z M63 25V14h14v11z M81 25V14h5c2 0 3 1 4 2l7 9z',
  CarShape.minivan: 'M4 37c0-6 2-8 7-9l9-2 15-13c3-2 5-3 9-3h46c4 0 6 2 8 4l10 13 4 3c3 1 4 4 4 7v2c0 1-1 2-2 2h-5a11 11 0 0 0-21 0H33a11 11 0 0 0-21 0H6c-1 0-2-1-2-2z M40 25l10-9c1-1 3-2 5-2h12v11z M71 25V14h16v11z M91 25V14h4c2 0 3 1 4 3l5 8z',
  CarShape.van: 'M4 37c0-5 2-7 6-8l8-2 9-15c2-3 4-5 8-5h72c4 0 6 3 6 6v24c0 2-1 3-2 3h-5a11 11 0 0 0-21 0H33a11 11 0 0 0-21 0H6c-1 0-2-1-2-2z M30 26l7-12c1-2 2-3 4-3h7v15z M52 26V11h15v15z M71 26V11h15v15z M90 26V11h15v15z',
};

/// Gold side-view car for a class shape.
class CarSilhouette extends StatelessWidget {
  const CarSilhouette(this.shape, {super.key, this.width = 66});
  final CarShape shape;
  final double width;
  @override
  Widget build(BuildContext context) {
    const wheel = '<circle cx="{x}" cy="40" r="8.2" fill="#0E2A22"/><circle cx="{x}" cy="40" r="6.4" fill="url(#g)"/><circle cx="{x}" cy="40" r="2.6" fill="#0E2A22"/>';
    final svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 50"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">'
        '<stop offset="0" stop-color="#FBE08C"/><stop offset=".55" stop-color="#E2B04A"/><stop offset="1" stop-color="#B98428"/></linearGradient></defs>'
        '<path fill="url(#g)" fill-rule="evenodd" d="${_body[shape]}"/>${wheel.replaceAll('{x}', '22')}${wheel.replaceAll('{x}', '95')}</svg>';
    return SvgPicture.string(svg, width: width, height: width * 50 / 120, excludeFromSemantics: true);
  }
}

/// − 3 hours + with the minimum and included miles underneath.
class HoursStepper extends StatelessWidget {
  const HoursStepper({super.key, required this.value, required this.min, required this.onChanged, this.max = hourlyMaxHours, this.disabled = false});
  final int value, min, max;
  final ValueChanged<int> onChanged;
  final bool disabled;

  Widget _btn(IconData icon, String label, bool enabled, bool primary, VoidCallback onTap) {
    return Semantics(
      button: true,
      enabled: enabled,
      label: label,
      child: Opacity(
        opacity: enabled ? 1 : .35,
        child: GestureDetector(
          onTap: enabled ? onTap : null,
          child: Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              gradient: primary ? const LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter, colors: [RdColors.ctaTop, RdColors.ctaBottom]) : null,
              color: primary ? null : RdColors.iconTile,
              borderRadius: BorderRadius.circular(12),
              border: primary ? null : Border.all(color: RdColors.line),
            ),
            child: Icon(icon, size: 22, color: primary ? RdColors.ink : RdColors.cream),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(color: RdColors.bg, borderRadius: BorderRadius.circular(14), border: Border.all(color: RdColors.line)),
        child: Row(children: [
          _btn(Icons.remove, 'Fewer hours', !disabled && value > min, false, () => onChanged(value - 1)),
          Expanded(
            child: Semantics(
              liveRegion: true,
              child: Row(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.baseline, textBaseline: TextBaseline.alphabetic, children: [
                Text('$value', style: RdText.serif(30, height: 1)),
                const SizedBox(width: 8),
                Text(value == 1 ? 'hour' : 'hours', style: RdText.sans(15, color: RdColors.soft)),
              ]),
            ),
          ),
          _btn(Icons.add, 'More hours', !disabled && value < max, true, () => onChanged(value + 1)),
        ]),
      ),
      const SizedBox(height: 8),
      Text('Minimum $min hours · ${value * hourlyIncludedMiles} miles included', textAlign: TextAlign.center, style: RdText.sans(12.5, color: RdColors.muted)),
    ]);
  }
}

/// The 8-class list. Before a search it shows the rate card; after, live prices (classes nobody offered are greyed out).
class ClassPickerList extends StatelessWidget {
  const ClassPickerList({super.key, required this.hourly, required this.quotes, required this.value, required this.onPick, this.hours = 3, this.only});
  final bool hourly;
  final List<Quote>? quotes;
  final String? value;
  final ValueChanged<String> onPick;
  final int hours;

  /// Show only these class keys (Luxury chauffeur).
  final List<String>? only;

  @override
  Widget build(BuildContext context) {
    final best = bestQuoteByClass(quotes);
    final rows = <Widget>[];
    for (final c in chauffeurClasses) {
      if (only != null && !only!.contains(c.key)) continue;
      final q = best[c.key];
      final on = c.key == value;
      final unavailable = quotes != null && q == null;
      final currency = q?.price.currency ?? 'USD';
      String price;
      String note;
      if (hourly) {
        final perHour = q != null ? (q.price.customerPrice / billedHours(c.key, hours)).round() : c.hourlyRate;
        price = '${_whole(perHour, currency)}/h';
        note = 'min ${c.minHours} h';
      } else {
        if (only != null) {
          price = q != null ? q.price.display : '—';
          note = q != null ? 'trip total' : '';
        } else {
          price = q != null ? q.price.display : _whole(c.airportFrom, currency);
          note = q != null ? q.supplierName : 'from';
        }
      }
      rows.add(Semantics(
        selected: on,
        button: true,
        enabled: !unavailable,
        label: '${c.label}, ${c.passengers} passengers, ${c.bags} bags, $price',
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: unavailable ? null : () => onPick(c.key),
          child: Opacity(
            opacity: unavailable ? .45 : 1,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 160),
              padding: const EdgeInsets.fromLTRB(10, 10, 12, 10),
              decoration: BoxDecoration(
                color: on ? const Color(0xFF163F32) : RdColors.card,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: on ? RdColors.yellow : RdColors.line, width: 1.5),
                boxShadow: on ? const [BoxShadow(color: Color(0x29F6C428), spreadRadius: 3)] : null,
              ),
              child: Row(children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Image.asset(c.photo, width: 92, height: 56, fit: BoxFit.cover, excludeFromSemantics: true),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(c.label, maxLines: 1, overflow: TextOverflow.ellipsis, style: RdText.sans(15, weight: FontWeight.w600)),
                    const SizedBox(height: 2),
                    Text(unavailable ? 'Not available for this trip' : (q?.vehicle.name ?? c.example), maxLines: 1, overflow: TextOverflow.ellipsis, style: RdText.sans(12, color: RdColors.muted)),
                    const SizedBox(height: 4),
                    Row(children: [
                      const Icon(Icons.person, size: 14, color: RdColors.muted),
                      const SizedBox(width: 4),
                      Text('${c.passengers}', style: RdText.sans(12, color: RdColors.muted)),
                      const SizedBox(width: 10),
                      const Icon(Icons.work, size: 13, color: RdColors.muted),
                      const SizedBox(width: 4),
                      Text('${c.bags}', style: RdText.sans(12, color: RdColors.muted)),
                    ]),
                  ]),
                ),
                const SizedBox(width: 8),
                Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                  Text(price, style: RdText.sans(16, weight: FontWeight.w700, color: on ? RdColors.yellow : RdColors.cream)),
                  const SizedBox(height: 2),
                  Text(note, style: RdText.sans(11.5, color: RdColors.muted)),
                ]),
                const SizedBox(width: 10),
                Container(
                  width: 22,
                  height: 22,
                  decoration: BoxDecoration(shape: BoxShape.circle, color: on ? RdColors.yellow : null, border: Border.all(color: on ? RdColors.yellow : const Color(0xFF3C5D50), width: 1.5)),
                  child: on ? const Icon(Icons.check, size: 14, color: RdColors.ink) : null,
                ),
              ]),
            ),
          ),
        ),
      ));
    }
    return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      for (var i = 0; i < rows.length; i++) ...[if (i > 0) const SizedBox(height: 8), rows[i]],
    ]);
  }
}
