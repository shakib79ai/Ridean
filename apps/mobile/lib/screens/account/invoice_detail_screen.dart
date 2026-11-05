import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../api/models.dart';
import '../../state/providers.dart';
import '../../theme.dart';
import '../../widgets/kit.dart';

String _lineAmount(int amount, String currency) => amount < 0 ? '−${formatMoney(-amount, currency)}' : formatMoney(amount, currency);

String _summary(Invoice i) => [
      'Ridean invoice ${i.number}',
      'Booking ${i.reference} · issued ${formatDate(i.issuedAt)}',
      i.description,
      ...i.lines.map((l) => '${l.label}: ${_lineAmount(l.amount, i.currency)}'),
      'Total paid: ${formatMoney(i.total, i.currency)} (${i.paidWith})',
    ].join('\n');

class InvoiceDetailScreen extends ConsumerWidget {
  const InvoiceDetailScreen({super.key, required this.bookingId});
  final String bookingId;

  Future<void> _share(BuildContext context, Invoice i) async {
    try {
      await Clipboard.setData(ClipboardData(text: _summary(i)));
      if (!context.mounted) return;
      showRdToast(context, 'Invoice summary copied');
    } catch (_) {
      if (!context.mounted) return;
      showRdToast(context, 'Couldn’t copy — please try again');
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(invoiceProvider(bookingId));
    final inv = async.valueOrNull;
    return RdPage(
      title: 'Invoice',
      subtitle: inv == null ? null : '${inv.number} · ${formatDate(inv.issuedAt)}',
      onRefresh: () async {
        ref.invalidate(invoiceProvider(bookingId));
        try {
          await ref.read(invoiceProvider(bookingId).future);
        } catch (_) {
          // Rendered below.
        }
      },
      children: [
        rdAsync(
          async,
          (i) => Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            _InvoiceCard(invoice: i),
            const SizedBox(height: 14),
            RdOutlineButton(label: 'Share', icon: Icons.near_me_outlined, onPressed: () => _share(context, i)),
          ]),
          onRetry: () => ref.invalidate(invoiceProvider(bookingId)),
          loadingHeight: 360,
        ),
      ],
    );
  }
}

class _InvoiceCard extends StatelessWidget {
  const _InvoiceCard({required this.invoice});
  final Invoice invoice;

  @override
  Widget build(BuildContext context) {
    final i = invoice;
    final company = i.billedCompany;
    final small = RdText.sans(11.5, color: RdColors.muted, height: 1.5);
    return RdCard(
      padding: const EdgeInsets.all(18),
      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const RdWordmark(size: 26),
              Padding(padding: const EdgeInsets.only(top: 2), child: Text('Booking ${i.reference}', style: small)),
            ]),
          ),
          const SizedBox(width: 12),
          Text('Best My Flight Inc.\n1088 Liberty Ave\nBrooklyn, NY 11208', textAlign: TextAlign.right, style: small),
        ]),
        const RdDivider(vertical: 10),
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 4),
          child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('Billed to', style: RdText.sans(12, color: RdColors.muted)),
                const SizedBox(height: 3),
                Text(i.billedName, style: RdText.sans(13)),
                if (company != null && company.isNotEmpty) Padding(padding: const EdgeInsets.only(top: 2), child: Text(company, style: RdText.sans(12, color: RdColors.muted))),
              ]),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                Text('Paid with', style: RdText.sans(12, color: RdColors.muted)),
                const SizedBox(height: 3),
                Text(i.paidWith, textAlign: TextAlign.right, style: RdText.sans(13)),
              ]),
            ),
          ]),
        ),
        const RdDivider(vertical: 10),
        Padding(
          padding: const EdgeInsets.only(top: 2, bottom: 4),
          child: Text(i.description, style: RdText.sans(13, color: RdColors.muted, height: 1.4)),
        ),
        for (final l in i.lines) RdSummaryRow(l.label, _lineAmount(l.amount, i.currency)),
        const RdDivider(vertical: 6),
        RdSummaryRow('Total paid', formatMoney(i.total, i.currency), bold: true),
      ]),
    );
  }
}
