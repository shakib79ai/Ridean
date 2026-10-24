import 'package:flutter/material.dart';
import '../data/mock.dart';
import '../theme/tokens.dart';
import '../widgets/common.dart';
import '../widgets/hero_header.dart';

class InvoiceDetailScreen extends StatelessWidget {
  const InvoiceDetailScreen({super.key, required this.invoice});

  final Invoice invoice;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: RColors.navy,
      body: SafeArea(
        child: Column(
          children: [
            Stack(
              children: [
                const HeroHeader(title: 'Invoice'),
                Positioned(
                  right: 20,
                  top: 26,
                  child: GestureDetector(
                    onTap: () {},
                    child: Container(
                      width: 36,
                      height: 36,
                      decoration: const BoxDecoration(color: RColors.navy2, shape: BoxShape.circle),
                      alignment: Alignment.center,
                      child: const Icon(Icons.ios_share_rounded, color: Colors.white, size: 17),
                    ),
                  ),
                ),
              ],
            ),
            RSheet(
              children: [
                RCard(
                  dark: true,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('INVOICE NUMBER',
                                    style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w700, color: RColors.mutedOnDark)),
                                const SizedBox(height: 4),
                                Text(invoice.invoiceNumber,
                                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.white)),
                              ],
                            ),
                          ),
                          const RPill(label: 'Paid', tone: 'ok'),
                        ],
                      ),
                      const SizedBox(height: 14),
                      Row(
                        children: [
                          RPill(label: invoice.category, tone: 'warn'),
                          const Spacer(),
                          Text(invoice.dateTime, style: const TextStyle(fontSize: 12, color: RColors.mutedOnDark)),
                        ],
                      ),
                      const SizedBox(height: 16),
                      const Divider(color: RColors.navy2, height: 1),
                      const SizedBox(height: 16),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Column(
                            children: [
                              Container(width: 10, height: 10, decoration: const BoxDecoration(color: RColors.ok, shape: BoxShape.circle)),
                              Container(width: 1.5, height: 28, color: RColors.navy2),
                              Container(width: 10, height: 10, decoration: const BoxDecoration(color: RColors.bad, shape: BoxShape.circle)),
                            ],
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(invoice.pickup, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.white)),
                                const SizedBox(height: 26),
                                Text(invoice.dropoff, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.white)),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const RSectionHeader(title: 'Charges'),
                RCard(
                  padding: const EdgeInsets.all(15),
                  child: Column(
                    children: [
                      _ChargeRow(label: 'Base fare', value: invoice.baseFare),
                      const SizedBox(height: 10),
                      _ChargeRow(label: 'Booking fee', value: invoice.bookingFee),
                      const SizedBox(height: 10),
                      _ChargeRow(label: 'Taxes & surcharges', value: invoice.taxes),
                      const SizedBox(height: 12),
                      const Divider(color: RColors.line, height: 1),
                      const SizedBox(height: 12),
                      _ChargeRow(label: 'Total charged', value: invoice.total, bold: true),
                    ],
                  ),
                ),
                const RSectionHeader(title: 'Payment & vehicle'),
                RCard(
                  padding: const EdgeInsets.all(15),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 36,
                            height: 36,
                            decoration: BoxDecoration(color: RColors.ground, borderRadius: BorderRadius.circular(10)),
                            alignment: Alignment.center,
                            child: const Text('💳', style: TextStyle(fontSize: 16)),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(invoice.paymentBrand,
                                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: RColors.navy)),
                                Text(invoice.paymentDate, style: const TextStyle(fontSize: 11.5, color: RColors.muted)),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      const Divider(color: RColors.line, height: 1),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Container(
                            width: 36,
                            height: 36,
                            decoration: BoxDecoration(color: RColors.ground, borderRadius: BorderRadius.circular(10)),
                            alignment: Alignment.center,
                            child: const Text('🚘', style: TextStyle(fontSize: 16)),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(invoice.vehicle, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: RColors.navy)),
                                Text(invoice.driver, style: const TextStyle(fontSize: 11.5, color: RColors.muted)),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                Row(
                  children: [
                    Expanded(child: RButton(label: 'Download PDF', variant: RButtonVariant.accent, onPressed: () {})),
                    const SizedBox(width: 10),
                    Expanded(child: RButton(label: 'Email receipt', variant: RButtonVariant.secondary, onPressed: () {})),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _ChargeRow extends StatelessWidget {
  const _ChargeRow({required this.label, required this.value, this.bold = false});

  final String label;
  final String value;
  final bool bold;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label,
            style: TextStyle(
              fontSize: bold ? 14 : 13,
              fontWeight: bold ? FontWeight.w800 : FontWeight.w500,
              color: bold ? RColors.navy : RColors.muted,
            )),
        Text(value,
            style: TextStyle(
              fontSize: bold ? 15 : 13,
              fontWeight: bold ? FontWeight.w800 : FontWeight.w700,
              color: RColors.navy,
            )),
      ],
    );
  }
}
