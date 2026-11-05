import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../api/models.dart';
import '../../state/providers.dart';
import '../../theme.dart';
import '../../widgets/kit.dart';

String _monthKey(String iso) => iso.length >= 7 ? iso.substring(0, 7) : iso;

String _monthName(String key) {
  final parts = key.split('-');
  final y = int.tryParse(parts.first) ?? DateTime.now().year;
  final m = parts.length > 1 ? int.tryParse(parts[1]) ?? 1 : 1;
  final name = DateFormat('MMMM').format(DateTime(y, m));
  return y == DateTime.now().year ? name : '$name $y';
}

String _tripLabel(Invoice i) {
  final parts = i.description.split(' · ');
  return parts.length > 1 ? '${serviceByKey(i.service).label} · ${parts[1]}' : i.description;
}

IconData _serviceIcon(String service) {
  switch (service) {
    case 'airport_transfer':
      return Icons.flight_outlined;
    case 'rent':
      return Icons.car_rental_outlined;
    case 'hourly':
      return Icons.schedule;
    case 'luxury':
      return Icons.star_outline_rounded;
    default:
      return Icons.directions_car_outlined;
  }
}

String _csvCell(Object v) => '"${'$v'.replaceAll('"', '""')}"';

class InvoicesScreen extends ConsumerStatefulWidget {
  const InvoicesScreen({super.key});
  @override
  ConsumerState<InvoicesScreen> createState() => _InvoicesScreenState();
}

class _InvoicesScreenState extends ConsumerState<InvoicesScreen> {
  String _month = 'all';
  final Map<String, Future<List<Invoice>>> _byMonth = {};

  Future<List<Invoice>> _forMonth(String m) => _byMonth.putIfAbsent(m, () => ref.read(apiProvider).invoices(month: m));

  Future<void> _refresh() async {
    setState(_byMonth.clear);
    ref.invalidate(invoicesProvider);
    try {
      await ref.read(invoicesProvider.future);
    } catch (_) {
      // The error state is rendered by the list.
    }
  }

  Future<void> _export(List<Invoice> rows) async {
    if (rows.isEmpty) return;
    final head = ['Invoice', 'Date', 'Reference', 'Trip', 'Paid with', 'Amount', 'Currency'];
    final lines = rows.map((i) => [
          i.number,
          i.issuedAt.length >= 10 ? i.issuedAt.substring(0, 10) : i.issuedAt,
          i.reference,
          i.description,
          i.paidWith,
          (i.total / 100).toStringAsFixed(2),
          i.currency,
        ].map(_csvCell).join(','));
    final csv = [head.map(_csvCell).join(','), ...lines].join('\n');
    try {
      await Clipboard.setData(ClipboardData(text: csv));
      if (!mounted) return;
      showRdToast(context, 'Statement copied (CSV)');
    } catch (_) {
      if (!mounted) return;
      showRdToast(context, 'Couldn’t copy — please try again');
    }
  }

  Widget _list(List<Invoice> rows) {
    if (rows.isEmpty) {
      return _month == 'all'
          ? RdEmpty(
              icon: Icons.receipt_long_outlined,
              title: 'No invoices yet',
              text: 'You’ll get one for every paid trip.',
              action: 'Book a ride',
              onAction: () => context.push('/book/ride'),
            )
          : const RdEmpty(icon: Icons.receipt_long_outlined, title: 'No invoices for this month');
    }
    final children = <Widget>[];
    for (var k = 0; k < rows.length; k++) {
      if (k > 0) children.add(const Divider(height: 1, color: RdColors.line));
      children.add(_InvoiceRow(invoice: rows[k]));
    }
    return RdCard(padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2), child: Column(children: children));
  }

  @override
  Widget build(BuildContext context) {
    final all = ref.watch(invoicesProvider);
    final allData = all.valueOrNull;
    final year = DateTime.now().year;

    final months = <String>{for (final i in allData ?? const <Invoice>[]) _monthKey(i.issuedAt)}.toList()
      ..sort()
      ..retainWhere((m) => m.isNotEmpty);
    final recent = months.reversed.take(3).toList();
    final thisYear = (allData ?? const <Invoice>[]).where((i) => parseDate(i.issuedAt)?.year == year).toList();
    final currency = thisYear.isNotEmpty ? thisYear.first.currency : (allData != null && allData.isNotEmpty ? allData.first.currency : 'USD');
    final yearTotal = thisYear.fold<int>(0, (n, i) => n + i.total);

    Widget body;
    List<Invoice>? rows;
    if (_month == 'all') {
      rows = allData;
      body = rdAsync(all, _list, onRetry: () => ref.invalidate(invoicesProvider), loadingHeight: 260);
    } else {
      final m = _month;
      body = FutureBuilder<List<Invoice>>(
        future: _forMonth(m),
        builder: (context, snap) {
          if (snap.hasError) {
            return RdError(snap.error ?? 'error', onRetry: () => setState(() => _byMonth.remove(m)));
          }
          final data = snap.data;
          if (snap.connectionState != ConnectionState.done || data == null) return const RdLoading(height: 260);
          return _list(data);
        },
      );
    }

    final shown = rows;
    return RdPage(
      title: 'Invoices',
      onRefresh: _refresh,
      children: [
        if (recent.isNotEmpty)
          RdChips<String>(
            options: [('all', 'All'), for (final m in recent) (m, _monthName(m))],
            value: _month,
            onChanged: (v) => setState(() => _month = v),
          ),
        RdCard(
          child: Row(children: [
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('Total spent · $year', style: RdText.sans(12.5, color: RdColors.muted)),
                const SizedBox(height: 2),
                if (allData != null)
                  Text(formatMoney(yearTotal, currency), maxLines: 1, overflow: TextOverflow.ellipsis, style: RdText.serif(28))
                else if (all.hasError)
                  Text('—', style: RdText.serif(28))
                else
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 8),
                    child: SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: RdColors.gold)),
                  ),
              ]),
            ),
            const SizedBox(width: 12),
            _ExportButton(
              onTap: _month == 'all'
                  ? (shown != null && shown.isNotEmpty ? () => _export(shown) : null)
                  : () async {
                      final m = _month;
                      try {
                        final data = await _forMonth(m);
                        if (!mounted) return;
                        await _export(data);
                      } catch (_) {
                        // The list shows the error.
                      }
                    },
            ),
          ]),
        ),
        body,
      ],
    );
  }
}

class _ExportButton extends StatelessWidget {
  const _ExportButton({required this.onTap});
  final VoidCallback? onTap;
  @override
  Widget build(BuildContext context) {
    final color = onTap == null ? RdColors.muted : RdColors.gold;
    return Semantics(
      button: true,
      label: 'Export statement',
      excludeSemantics: true,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 4),
          child: Row(mainAxisSize: MainAxisSize.min, children: [
            Icon(Icons.download_rounded, size: 18, color: color),
            const SizedBox(width: 6),
            Text('Export', style: RdText.sans(13.5, weight: FontWeight.w600, color: color)),
          ]),
        ),
      ),
    );
  }
}

class _InvoiceRow extends StatelessWidget {
  const _InvoiceRow({required this.invoice});
  final Invoice invoice;
  @override
  Widget build(BuildContext context) {
    final i = invoice;
    return InkWell(
      onTap: () => context.push('/account/invoices/${i.bookingId}'),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 2),
        child: Row(children: [
          RdIconTile(_serviceIcon(i.service)),
          const SizedBox(width: 14),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(_tripLabel(i), maxLines: 1, overflow: TextOverflow.ellipsis, style: RdText.sans(15, weight: FontWeight.w500)),
              const SizedBox(height: 2),
              Text('${formatDate(i.issuedAt)} · ${i.number}', maxLines: 1, overflow: TextOverflow.ellipsis, style: RdText.sans(12.5, color: RdColors.muted)),
            ]),
          ),
          const SizedBox(width: 10),
          Text(formatMoney(i.total, i.currency), style: RdText.sans(14.5, weight: FontWeight.w600)),
        ]),
      ),
    );
  }
}
