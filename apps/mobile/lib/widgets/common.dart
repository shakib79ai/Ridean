import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../theme.dart';

String formatWhen(String? iso) => iso == null ? 'As soon as possible' : DateFormat('EEE d MMM · h:mm a').format(DateTime.parse(iso).toLocal());

class StatusChip extends StatelessWidget {
  const StatusChip(this.status, this.label, {super.key});
  final String status, label;
  @override
  Widget build(BuildContext context) {
    final color = switch (status) {
      'confirmed' || 'driver_assigned' => RdColors.ok,
      'cancelled' || 'failed' => RdColors.bad,
      'completed' => RdColors.muted,
      _ => RdColors.yellow,
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: color.withValues(alpha: .14), borderRadius: BorderRadius.circular(99)),
      child: Text(label, style: TextStyle(color: color, fontSize: 12.5, fontWeight: FontWeight.w600)),
    );
  }
}

class ErrorView extends StatelessWidget {
  const ErrorView(this.error, {super.key, this.onRetry});
  final Object error;
  final VoidCallback? onRetry;
  @override
  Widget build(BuildContext context) => Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Text('$error', textAlign: TextAlign.center, style: const TextStyle(color: RdColors.muted)),
            if (onRetry != null) TextButton(onPressed: onRetry, child: const Text('Try again')),
          ]),
        ),
      );
}

class Stepper2 extends StatelessWidget {
  const Stepper2({super.key, required this.icon, required this.label, required this.value, required this.onChanged, this.min = 1, this.max = 8});
  final IconData icon;
  final String label;
  final int value, min, max;
  final ValueChanged<int> onChanged;
  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(color: const Color(0xFF01201A), borderRadius: BorderRadius.circular(12), border: Border.all(color: RdColors.line)),
        child: Row(children: [
          Icon(icon, size: 18, color: RdColors.muted),
          const SizedBox(width: 8),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(label, style: const TextStyle(fontSize: 12, color: RdColors.muted)), Text('$value', style: const TextStyle(fontWeight: FontWeight.w600))])),
          IconButton(onPressed: value > min ? () => onChanged(value - 1) : null, icon: const Icon(Icons.remove_circle_outline)),
          IconButton(onPressed: value < max ? () => onChanged(value + 1) : null, icon: const Icon(Icons.add_circle_outline)),
        ]),
      );
}
