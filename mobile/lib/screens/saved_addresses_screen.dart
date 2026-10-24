import 'package:flutter/material.dart';
import '../theme/tokens.dart';
import '../widgets/common.dart';
import '../widgets/hero_header.dart';

class _Addr {
  final IconData icon;
  final String label;
  final String address;
  const _Addr(this.icon, this.label, this.address);
}

const _addresses = <_Addr>[
  _Addr(Icons.home_rounded, 'Home', '432 Park Ave, Manhattan, NY'),
  _Addr(Icons.work_rounded, 'Work', '1 World Trade Center, NY'),
  _Addr(Icons.location_on_rounded, 'Mom\'s place', 'Brooklyn Heights, NY'),
];

class SavedAddressesScreen extends StatelessWidget {
  const SavedAddressesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: RColors.navy,
      body: SafeArea(
        child: Column(
          children: [
            const HeroHeader(title: 'Saved addresses'),
            RSheet(
              children: [
                for (final a in _addresses) ...[
                  RCard(
                    child: Row(
                      children: [
                        Container(
                          width: 36,
                          height: 36,
                          decoration: BoxDecoration(color: RColors.ground, borderRadius: BorderRadius.circular(10)),
                          alignment: Alignment.center,
                          child: Icon(a.icon, size: 18, color: RColors.navy),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(a.label, style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700, color: RColors.navy)),
                              Text(a.address, style: const TextStyle(fontSize: 12, color: RColors.muted)),
                            ],
                          ),
                        ),
                        const Icon(Icons.edit_outlined, size: 17, color: RColors.muted),
                        const SizedBox(width: 10),
                        const Icon(Icons.delete_outline, size: 17, color: RColors.bad),
                      ],
                    ),
                  ),
                  const SizedBox(height: 10),
                ],
                RButton(label: '+ Add address', variant: RButtonVariant.secondary, onPressed: () {}),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
