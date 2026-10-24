import 'package:flutter/material.dart';
import '../theme/tokens.dart';
import '../widgets/common.dart';
import '../widgets/hero_header.dart';

class _Employee {
  final String name;
  final String email;
  const _Employee(this.name, this.email);
}

const _employees = <_Employee>[
  _Employee('Nina Kade', 'nina@bestmyflight.com'),
  _Employee('Omar Siddiqui', 'omar@bestmyflight.com'),
];

class BusinessAccountScreen extends StatefulWidget {
  const BusinessAccountScreen({super.key});

  @override
  State<BusinessAccountScreen> createState() => _BusinessAccountScreenState();
}

class _BusinessAccountScreenState extends State<BusinessAccountScreen> {
  bool _expenseReporting = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: RColors.navy,
      body: SafeArea(
        child: Column(
          children: [
            const HeroHeader(title: 'Business account'),
            RSheet(
              children: [
                const RField(label: 'Company name', value: 'Best My Flight Inc.'),
                const RField(label: 'Business email', value: 'billing@bestmyflight.com'),
                RCard(
                  child: Row(
                    children: [
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Expense reporting', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: RColors.navy)),
                            SizedBox(height: 2),
                            Text('Auto-generate monthly ride receipts', style: TextStyle(fontSize: 12, color: RColors.muted)),
                          ],
                        ),
                      ),
                      Switch(
                        value: _expenseReporting,
                        activeColor: RColors.acc,
                        onChanged: (v) => setState(() => _expenseReporting = v),
                      ),
                    ],
                  ),
                ),
                const RSectionHeader(title: 'Linked employees'),
                for (final e in _employees) ...[
                  RCard(
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 16,
                          backgroundColor: RColors.navy2,
                          child: Text(e.name.substring(0, 1), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 12)),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(e.name, style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700, color: RColors.navy)),
                              Text(e.email, style: const TextStyle(fontSize: 11.5, color: RColors.muted)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 8),
                ],
                RButton(label: '+ Invite employee', variant: RButtonVariant.secondary, onPressed: () {}),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
