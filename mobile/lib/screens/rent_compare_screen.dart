import 'package:flutter/material.dart';
import '../data/mock.dart';
import '../theme/tokens.dart';
import '../widgets/common.dart';
import '../widgets/hero_header.dart';
import 'booking_review_screen.dart';

class RentCompareScreen extends StatefulWidget {
  const RentCompareScreen({
    super.key,
    this.initialPickupLocation,
    this.initialPickupDate,
    this.initialReturnDate,
  });

  final String? initialPickupLocation;
  final String? initialPickupDate;
  final String? initialReturnDate;

  @override
  State<RentCompareScreen> createState() => _RentCompareScreenState();
}

class _RentCompareScreenState extends State<RentCompareScreen> {
  String filter = 'All';
  static const filters = ['All', 'Economy', 'SUV', 'Luxury'];

  late String pickupLocation = widget.initialPickupLocation ?? 'LaGuardia Airport (LGA)';
  late String pickupDate = widget.initialPickupDate ?? 'Oct 20, 2026';
  late String returnDate = widget.initialReturnDate ?? 'Oct 23, 2026';
  bool returnDifferentLocation = false;
  String dropoffLocation = 'Manhattan — West 34th St';

  Future<void> _editField(String title, String current, ValueChanged<String> onSave) async {
    final controller = TextEditingController(text: current);
    final result = await showModalBottomSheet<String>(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom),
        child: Container(
          decoration: const BoxDecoration(
            color: RColors.surface,
            borderRadius: BorderRadius.only(topLeft: Radius.circular(20), topRight: Radius.circular(20)),
          ),
          padding: const EdgeInsets.fromLTRB(20, 24, 20, 28),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: RColors.navy)),
              const SizedBox(height: 14),
              TextField(
                controller: controller,
                autofocus: true,
                decoration: InputDecoration(
                  filled: true,
                  fillColor: RColors.ground,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(RRadius.md), borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 18),
              RButton(
                label: 'Save',
                variant: RButtonVariant.accent,
                onPressed: () => Navigator.of(ctx).pop(controller.text),
              ),
            ],
          ),
        ),
      ),
    );
    if (result != null && result.trim().isNotEmpty) {
      onSave(result.trim());
    }
  }

  void _runSearch() {
    setState(() {});
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Showing rentals at $pickupLocation · $pickupDate – $returnDate')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final rows = rentalSuppliers
        .where((s) => filter == 'All' || s.spec.toLowerCase().contains(filter.toLowerCase()))
        .toList();

    return Scaffold(
      backgroundColor: RColors.navy,
      body: SafeArea(
        child: Column(
          children: [
            HeroHeader(title: 'Compare rentals', subtitle: '$pickupLocation · $pickupDate – $returnDate'),
            RSheet(
              children: [
                const Text('SEARCH RENTALS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: RColors.muted)),
                const SizedBox(height: 9),
                RField(
                  label: 'Pickup location',
                  value: pickupLocation,
                  leftDot: RColors.ok,
                  onTap: () => _editField('Pickup location', pickupLocation, (v) => setState(() => pickupLocation = v)),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: RField(
                        label: 'Pickup date',
                        value: pickupDate,
                        onTap: () => _editField('Pickup date', pickupDate, (v) => setState(() => pickupDate = v)),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: RField(
                        label: 'Return date',
                        value: returnDate,
                        onTap: () => _editField('Return date', returnDate, (v) => setState(() => returnDate = v)),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                GestureDetector(
                  onTap: () => setState(() => returnDifferentLocation = !returnDifferentLocation),
                  child: Row(
                    children: [
                      Container(
                        width: 20,
                        height: 20,
                        decoration: BoxDecoration(
                          color: returnDifferentLocation ? RColors.navy : Colors.transparent,
                          border: Border.all(color: returnDifferentLocation ? RColors.navy : RColors.line, width: 1.5),
                          borderRadius: BorderRadius.circular(5),
                        ),
                        alignment: Alignment.center,
                        child: returnDifferentLocation
                            ? const Icon(Icons.check, size: 13, color: Colors.white)
                            : null,
                      ),
                      const SizedBox(width: 10),
                      const Text('Return to a different location',
                          style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600, color: RColors.navy)),
                    ],
                  ),
                ),
                if (returnDifferentLocation) ...[
                  const SizedBox(height: 10),
                  RField(
                    label: 'Drop-off location',
                    value: dropoffLocation,
                    leftDot: RColors.bad,
                    onTap: () => _editField('Drop-off location', dropoffLocation, (v) => setState(() => dropoffLocation = v)),
                  ),
                ],
                const SizedBox(height: 10),
                SizedBox(
                  height: 36,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: filters.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 8),
                    itemBuilder: (context, i) {
                      final f = filters[i];
                      final active = f == filter;
                      return GestureDetector(
                        onTap: () => setState(() => filter = f),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          decoration: BoxDecoration(
                            color: active ? RColors.navy : RColors.ground,
                            border: Border.all(color: active ? RColors.navy : RColors.line),
                            borderRadius: BorderRadius.circular(RRadius.pill),
                          ),
                          alignment: Alignment.center,
                          child: Text(f,
                              style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                  color: active ? Colors.white : RColors.muted)),
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 10),
                RButton(label: 'Search rentals', variant: RButtonVariant.primary, onPressed: _runSearch),
                const SizedBox(height: 18),
                Text('${rows.length} cars available', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: RColors.navy)),
                const SizedBox(height: 10),
                for (final s in rows) ...[
                  RCard(
                    selected: s.best,
                    padding: const EdgeInsets.all(13),
                    onTap: () => Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => BookingReviewScreen(
                          service: 'Car Rental',
                          vehicleName: s.name,
                          vehicleSpec: s.spec,
                          priceLabel: '\$${s.pricePerDay}/day',
                          pickup: pickupLocation,
                          dropoff: returnDifferentLocation ? dropoffLocation : 'Returned to $pickupLocation',
                          date: '$pickupDate – $returnDate',
                          tripId: 't3',
                        ),
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 34,
                              height: 34,
                              decoration: BoxDecoration(
                                color: s.code == 'ENTERPRISE'
                                    ? const Color(0xFFC8102E)
                                    : s.code == 'ALAMO'
                                        ? const Color(0xFF0B4F8A)
                                        : RColors.navy,
                                borderRadius: BorderRadius.circular(9),
                              ),
                              alignment: Alignment.center,
                              child: Text(
                                s.code,
                                style: TextStyle(
                                  fontSize: 8.5,
                                  fontWeight: FontWeight.w800,
                                  color: s.code == 'SIXT' ? RColors.acc : Colors.white,
                                ),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(s.name, style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700, color: RColors.navy)),
                                  Text(s.spec, style: const TextStyle(fontSize: 11, color: RColors.muted)),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 9),
                        const Divider(color: RColors.line, height: 1),
                        const SizedBox(height: 9),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            s.best ? const RPill(label: 'Best price', tone: 'ok') : const SizedBox.shrink(),
                            RichText(
                              text: TextSpan(
                                style: const TextStyle(fontWeight: FontWeight.w800, color: RColors.navy, fontSize: 15),
                                children: [
                                  TextSpan(text: '\$${s.pricePerDay}'),
                                  const TextSpan(
                                      text: '/day',
                                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: RColors.muted)),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 9),
                ],
                const Center(
                  child: Padding(
                    padding: EdgeInsets.only(top: 4),
                    child: Text('Prices include taxes & supplier fees · sorted by best price',
                        style: TextStyle(fontSize: 11, color: RColors.muted)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
