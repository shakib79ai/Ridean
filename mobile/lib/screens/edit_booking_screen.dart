import 'package:flutter/material.dart';
import '../data/mock.dart';
import '../theme/tokens.dart';
import '../widgets/common.dart';
import '../widgets/hero_header.dart';

class EditBookingScreen extends StatefulWidget {
  const EditBookingScreen({super.key, required this.trip});

  final Trip trip;

  @override
  State<EditBookingScreen> createState() => _EditBookingScreenState();
}

class _EditBookingScreenState extends State<EditBookingScreen> {
  late final TextEditingController _pickup = TextEditingController(text: widget.trip.from);
  late final TextEditingController _dropoff = TextEditingController(text: widget.trip.to);
  late final TextEditingController _note = TextEditingController();

  bool _babySeat = false;
  int _extraLuggage = 0;
  int _extraPassengers = 0;

  @override
  void dispose() {
    _pickup.dispose();
    _dropoff.dispose();
    _note.dispose();
    super.dispose();
  }

  void _save() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Booking updated.')),
    );
    Navigator.of(context).maybePop();
  }

  @override
  Widget build(BuildContext context) {
    final t = widget.trip;
    return Scaffold(
      backgroundColor: RColors.navy,
      body: SafeArea(
        child: Column(
          children: [
            const HeroHeader(title: 'Edit booking'),
            RSheet(
              children: [
                RCard(
                  dark: true,
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(color: const Color(0xFFFBEBCF), borderRadius: BorderRadius.circular(RRadius.pill)),
                        child: Text(t.mode, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFF7A4A00))),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(t.car, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 13)),
                      ),
                    ],
                  ),
                ),
                const RSectionHeader(title: 'Date & time'),
                RField(label: 'Pickup date & time', value: '${t.date} · ${t.time}', onTap: () {}),
                const RSectionHeader(title: 'Trip'),
                _TextInput(label: 'Pickup location', controller: _pickup),
                _TextInput(label: 'Drop-off location', controller: _dropoff),
                const RSectionHeader(title: 'Special requests'),
                RCard(
                  child: Row(
                    children: [
                      const Expanded(
                        child: Text('Baby seat', style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700, color: RColors.navy)),
                      ),
                      Switch(value: _babySeat, activeColor: RColors.acc, onChanged: (v) => setState(() => _babySeat = v)),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                _stepperRow('Extra luggage', _extraLuggage, (v) => setState(() => _extraLuggage = v), max: 5),
                const SizedBox(height: 8),
                _stepperRow('Extra passengers', _extraPassengers, (v) => setState(() => _extraPassengers = v), max: 4),
                const SizedBox(height: 10),
                Text('NOTE TO DRIVER'.toUpperCase(), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: RColors.muted)),
                const SizedBox(height: 6),
                Container(
                  decoration: BoxDecoration(color: RColors.ground, borderRadius: BorderRadius.circular(RRadius.md), border: Border.all(color: RColors.line)),
                  padding: const EdgeInsets.all(12),
                  child: TextField(
                    controller: _note,
                    maxLines: 3,
                    style: const TextStyle(fontSize: 13.5, color: RColors.navy),
                    decoration: const InputDecoration(border: InputBorder.none, isDense: true, hintText: 'e.g. meet at the north entrance'),
                  ),
                ),
                const SizedBox(height: 18),
                RButton(label: 'Save changes', variant: RButtonVariant.accent, onPressed: _save),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _stepperRow(String label, int value, ValueChanged<int> onChanged, {required int max}) {
    return RCard(
      child: Row(
        children: [
          Expanded(child: Text(label, style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700, color: RColors.navy))),
          _stepBtn(Icons.remove, () => onChanged(value > 0 ? value - 1 : 0)),
          SizedBox(
            width: 28,
            child: Text('$value', textAlign: TextAlign.center, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: RColors.navy)),
          ),
          _stepBtn(Icons.add, () => onChanged(value < max ? value + 1 : max)),
        ],
      ),
    );
  }

  Widget _stepBtn(IconData icon, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 28,
        height: 28,
        decoration: BoxDecoration(color: RColors.ground, borderRadius: BorderRadius.circular(8), border: Border.all(color: RColors.line)),
        alignment: Alignment.center,
        child: Icon(icon, size: 15, color: RColors.navy),
      ),
    );
  }
}

class _TextInput extends StatelessWidget {
  const _TextInput({required this.label, required this.controller});

  final String label;
  final TextEditingController controller;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label.toUpperCase(), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: RColors.muted)),
          const SizedBox(height: 6),
          Container(
            decoration: BoxDecoration(color: RColors.ground, borderRadius: BorderRadius.circular(RRadius.md), border: Border.all(color: RColors.line)),
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: TextField(
              controller: controller,
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: RColors.navy),
              decoration: const InputDecoration(border: InputBorder.none, isDense: true, contentPadding: EdgeInsets.symmetric(vertical: 12)),
            ),
          ),
        ],
      ),
    );
  }
}
