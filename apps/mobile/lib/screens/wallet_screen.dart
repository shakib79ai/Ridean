import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_stripe/flutter_stripe.dart';
import '../api/models.dart';
import '../config.dart';
import '../state/providers.dart';
import '../theme.dart';
import '../widgets/common.dart';

class WalletScreen extends ConsumerWidget {
  const WalletScreen({super.key});

  Future<void> _topUp(BuildContext context, WidgetRef ref, int amount) async {
    try {
      final secret = await ref.read(apiProvider).walletTopUp(amount);
      if (secret != null && AppConfig.stripePublishableKey.isNotEmpty) {
        await Stripe.instance.initPaymentSheet(paymentSheetParameters: SetupPaymentSheetParameters(paymentIntentClientSecret: secret, merchantDisplayName: 'Ridean', style: ThemeMode.dark));
        await Stripe.instance.presentPaymentSheet();
      }
      ref.invalidate(walletProvider);
    } catch (e) {
      if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final w = ref.watch(walletProvider);
    return w.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => ErrorView(e, onRetry: () => ref.invalidate(walletProvider)),
      data: (w) => ListView(padding: const EdgeInsets.all(16), children: [
        Text('Wallet', style: Theme.of(context).textTheme.headlineLarge),
        const SizedBox(height: 12),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('Balance', style: TextStyle(color: RdColors.muted)),
              Text(formatMoney(w.balance, w.currency), style: Theme.of(context).textTheme.headlineLarge?.copyWith(color: RdColors.gold)),
              const SizedBox(height: 14),
              Wrap(spacing: 8, children: [for (final a in [2500, 5000, 10000]) OutlinedButton(onPressed: () => _topUp(context, ref, a), child: Text('+ ${formatMoney(a, w.currency)}'))]),
            ]),
          ),
        ),
        const SizedBox(height: 16),
        for (final t in w.transactions)
          ListTile(
            contentPadding: EdgeInsets.zero,
            title: Text('${t['description']}'),
            subtitle: Text(formatWhen(t['createdAt'] as String?)),
            trailing: Text(formatMoney((t['amount'] as num).toInt(), w.currency), style: TextStyle(color: (t['amount'] as num) >= 0 ? RdColors.ok : RdColors.cream)),
          ),
      ]),
    );
  }
}
