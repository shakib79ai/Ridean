import 'package:flutter/material.dart';
import '../data/mock.dart';
import '../theme/tokens.dart';
import '../widgets/common.dart';
import '../widgets/hero_header.dart';
import 'edit_booking_screen.dart';
import 'contact_driver_screen.dart';

/// Shown when a rider taps a trip from the Trips list. Covers both jobs:
/// surfacing the rider's own booking info at the time of booking, and
/// letting them manage an upcoming booking (edit / cancel / contact).
class BookingDetailsScreen extends StatefulWidget {
  const BookingDetailsScreen({super.key, required this.trip});

  final Trip trip;

  @override
  State<BookingDetailsScreen> createState() => _BookingDetailsScreenState();
}

class _BookingDetailsScreenState extends State<BookingDetailsScreen> {
  bool _cancelled = false;

  Future<void> _confirmCancel() async {
    final confirmed = await showModalBottomSheet<bool>(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        decoration: const BoxDecoration(
          color: RColors.surface,
          borderRadius: BorderRadius.only(topLeft: Radius.circular(20), topRight: Radius.circular(20)),
        ),
        padding: const EdgeInsets.fromLTRB(20, 24, 20, 28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Cancel this booking?', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: RColors.navy)),
            const SizedBox(height: 8),
            const Text(
              'Cancelling within 1 hour of pickup may incur a \$5 fee.',
              style: TextStyle(fontSize: 13, color: RColors.muted),
            ),
            const SizedBox(height: 18),
            RButton(
              label: 'Yes, cancel booking',
              variant: RButtonVariant.primary,
              onPressed: () => Navigator.of(ctx).pop(true),
            ),
            const SizedBox(height: 10),
            RButton(
              label: 'Keep booking',
              variant: RButtonVariant.secondary,
              onPressed: () => Navigator.of(ctx).pop(false),
            ),
          ],
        ),
      ),
    );
    if (confirmed == true && mounted) {
      setState(() => _cancelled = true);
    }
  }

  void _editBooking() {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => EditBookingScreen(trip: widget.trip)),
    );
  }

  void _contactSupport() {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => ContactDriverScreen(trip: widget.trip)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final t = widget.trip;
    final status = _cancelled ? 'cancelled' : t.status;
    final tone = status == 'upcoming' ? 'warn' : (status == 'completed' ? 'ok' : 'bad');
    final label = status[0].toUpperCase() + status.substring(1);
    final canManage = status == 'upcoming';

    return Scaffold(
      backgroundColor: RColors.navy,
      body: SafeArea(
        child: Column(
          children: [
            const HeroHeader(title: 'Booking details'),
            RSheet(
              children: [
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
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(color: const Color(0xFFFBEBCF), borderRadius: BorderRadius.circular(RRadius.pill)),
                                child: Text(t.mode, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFF7A4A00))),
                              ),
                              const SizedBox(width: 6),
                              RPill(label: label, tone: tone),
                            ],
                          ),
                          Text('${t.date} · ${t.time}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: RColors.mutedOnDark)),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Container(width: 10, height: 10, decoration: const BoxDecoration(color: Color(0xFF0F6B45), shape: BoxShape.circle)),
                          const SizedBox(width: 9),
                          Expanded(child: Text(t.from, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 14.5))),
                        ],
                      ),
                      Padding(
                        padding: const EdgeInsets.only(left: 4),
                        child: Container(width: 2, height: 16, color: RColors.navy2),
                      ),
                      Row(
                        children: [
                          Container(width: 10, height: 10, decoration: const BoxDecoration(color: Color(0xFFA32020), shape: BoxShape.circle)),
                          const SizedBox(width: 9),
                          Expanded(child: Text(t.to, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 14.5))),
                        ],
                      ),
                    ],
                  ),
                ),
                RCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('RIDER', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: RColors.muted, letterSpacing: 0.4)),
                      const SizedBox(height: 4),
                      Text(rUser.name, style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w700, color: RColors.navy)),
                    ],
                  ),
                ),
                RCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Vehicle', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: RColors.navy)),
                      Text(t.car, style: const TextStyle(fontSize: 13, color: RColors.muted)),
                      const SizedBox(height: 8),
                      Text(
                        canManage ? 'Driver' : 'Driver assigned',
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: RColors.navy),
                      ),
                      Text(
                        canManage ? 'Will be assigned shortly before pickup' : 'Marcus H. · ★ 4.9',
                        style: const TextStyle(fontSize: 13, color: RColors.muted),
                      ),
                    ],
                  ),
                ),
                RCard(
                  child: Column(
                    children: [
                      _priceRow('Fare', t.price),
                      _priceRow('Booking fee', '\$2.50'),
                      _priceRow('Taxes', '\$3.10'),
                      const RDivider(label: ''),
                      _priceRow('Total', t.price, bold: true),
                    ],
                  ),
                ),
                if (canManage)
                  RCard(
                    padding: EdgeInsets.zero,
                    child: Column(
                      children: [
                        _actionRow(
                          icon: Icons.edit_outlined,
                          label: 'Edit booking',
                          color: RColors.navy,
                          onTap: _editBooking,
                          showDivider: true,
                        ),
                        _actionRow(
                          icon: Icons.cancel_outlined,
                          label: 'Cancel booking',
                          color: RColors.bad,
                          onTap: _confirmCancel,
                          showDivider: true,
                        ),
                        _actionRow(
                          icon: Icons.chat_bubble_outline,
                          label: 'Contact driver & support',
                          color: RColors.navy,
                          onTap: _contactSupport,
                          showDivider: false,
                        ),
                      ],
                    ),
                  ),
                if (canManage)
                  RButton(label: 'Track this trip', variant: RButtonVariant.accent, onPressed: () {}),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _priceRow(String label, String value, {bool bold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(fontSize: bold ? 13.5 : 13, fontWeight: bold ? FontWeight.w700 : FontWeight.w400, color: RColors.muted)),
          Text(value, style: TextStyle(fontSize: bold ? 13.5 : 13, fontWeight: bold ? FontWeight.w800 : FontWeight.w600, color: RColors.navy)),
        ],
      ),
    );
  }

  Widget _actionRow({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
    required bool showDivider,
  }) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          border: showDivider ? const Border(bottom: BorderSide(color: RColors.line)) : null,
        ),
        child: Row(
          children: [
            Icon(icon, size: 18, color: color),
            const SizedBox(width: 12),
            Expanded(child: Text(label, style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w600, color: color))),
            const Icon(Icons.chevron_right, size: 18, color: RColors.mutedOnDark),
          ],
        ),
      ),
    );
  }
}
