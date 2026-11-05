// Wallet tab — board "Wallet". Mirrors apps/pwa/src/app/(tabs)/wallet/page.tsx.
// Left out (no backend): the "Ridean+ member · 5% back" badge and the "Promotions" row.
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_stripe/flutter_stripe.dart' hide Card;
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../api/api_client.dart';
import '../api/models.dart';
import '../config.dart';
import '../state/providers.dart';
import '../theme.dart';
import '../widgets/kit.dart';

const _amounts = [2500, 5000, 10000, 20000];

String _noCents(String s) => s.endsWith('.00') ? s.substring(0, s.length - 3) : s;

String _signed(int minor, String currency) => '${minor < 0 ? '−' : '+'}${formatMoney(minor.abs(), currency)}';

String _day(String iso) {
  final d = parseDate(iso);
  return d == null ? '' : DateFormat('d MMM').format(d);
}

IconData _txIcon(WalletTx t) {
  if (t.amount < 0) return Icons.directions_car_outlined;
  if (t.description.startsWith('Refund')) return Icons.replay_rounded;
  return Icons.add_rounded;
}

class WalletScreen extends ConsumerStatefulWidget {
  const WalletScreen({super.key});
  @override
  ConsumerState<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends ConsumerState<WalletScreen> {
  int? _busy;
  String _error = '';

  bool get _stripe => AppConfig.stripePublishableKey.isNotEmpty;

  Future<void> _refresh() async {
    ref.invalidate(paymentMethodsProvider);
    await ref.refresh(walletProvider.future);
  }

  Future<void> _topUp(int amount, String currency) async {
    setState(() {
      _busy = amount;
      _error = '';
    });
    try {
      final secret = await ref.read(apiProvider).walletTopUp(amount);
      if (!mounted) return;
      if (secret != null && secret.isNotEmpty && _stripe) {
        await Stripe.instance.initPaymentSheet(
          paymentSheetParameters: SetupPaymentSheetParameters(
            paymentIntentClientSecret: secret,
            merchantDisplayName: 'Ridean',
            style: ThemeMode.dark,
          ),
        );
        await Stripe.instance.presentPaymentSheet();
        if (!mounted) return;
        showRdToast(context, 'Top-up received');
        // The payment webhook credits the wallet; give it a moment.
        await Future<void>.delayed(const Duration(milliseconds: 2500));
        if (!mounted) return;
        ref.invalidate(walletProvider);
      } else {
        ref.invalidate(walletProvider);
        showRdToast(context, 'Added ${formatMoney(amount, currency)} to your wallet');
      }
    } on StripeException catch (e) {
      if (!mounted) return;
      if (e.error.code != FailureCode.Canceled) {
        setState(() => _error = e.error.localizedMessage ?? 'Your payment could not be completed.');
      }
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = errorText(e));
    } finally {
      if (mounted) setState(() => _busy = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    final wallet = ref.watch(walletProvider);
    final cards = ref.watch(paymentMethodsProvider);
    final w = wallet.valueOrNull;
    final currency = w?.currency ?? 'USD';

    final list = cards.valueOrNull;
    SavedCard? def;
    if (list != null) {
      for (final c in list) {
        if (c.isDefault) def = c;
      }
    }
    final cardsSub = cards.isLoading && list == null
        ? ' '
        : def != null
            ? '${def.label} · default'
            : (list != null && list.isNotEmpty)
                ? '${list.length} saved'
                : list != null
                    ? 'No saved cards yet'
                    : 'Cards, wallet and business';

    final note = !_stripe ? 'Test mode — top-ups are added instantly and no card is charged.' : 'You’ll confirm your card for each top-up.';

    return RdTabPage(
      header: RdBrandHeader(onAction: () => context.push('/account/settings')),
      onRefresh: _refresh,
      children: [
        if (wallet.hasError && w == null) RdError(wallet.error!, onRetry: () => ref.invalidate(walletProvider)),
        _BalanceCard(balance: w == null ? null : formatMoney(w.balance, currency)),
        const RdSectionTitle('Add funds'),
        Row(children: [
          for (var i = 0; i < _amounts.length; i++) ...[
            if (i > 0) const SizedBox(width: 8),
            Expanded(
              child: _AmountChip(
                label: _busy == _amounts[i] ? '…' : '+${_noCents(formatMoney(_amounts[i], currency))}',
                semantic: 'Add ${formatMoney(_amounts[i], currency)}',
                dim: w == null || (_busy != null && _busy != _amounts[i]),
                onTap: (_busy != null || w == null) ? null : () => _topUp(_amounts[i], currency),
              ),
            ),
          ],
        ]),
        Text(note, style: RdText.sans(12.5, color: RdColors.muted)),
        if (_error.isNotEmpty) RdErrorText(_error),
        RdListGroup(children: [
          RdListTile(
            icon: Icons.credit_card_outlined,
            title: 'Payment methods',
            subtitle: cardsSub,
            onTap: () => context.push('/account/payment-methods'),
          ),
          RdListTile(
            icon: Icons.description_outlined,
            title: 'Invoices',
            subtitle: 'Download receipts',
            onTap: () => context.push('/account/invoices'),
          ),
        ]),
        const RdSectionTitle('Recent activity'),
        if (w == null && wallet.isLoading)
          const RdLoading(height: 200)
        else if (w != null && w.transactions.isEmpty)
          const RdEmpty(icon: Icons.account_balance_wallet_outlined, title: 'No wallet activity yet', text: 'Add funds to get started.')
        else if (w != null)
          RdListGroup(children: [
            for (final t in w.transactions) _TxRow(tx: t, currency: currency),
          ]),
      ],
    );
  }
}

class _BalanceCard extends StatelessWidget {
  const _BalanceCard({required this.balance});
  final String? balance;
  @override
  Widget build(BuildContext context) {
    final b = balance;
    return Container(
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0x59D9A94F)),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF1E5442), Color(0xFF0E2A22), Color(0xFF0A1F18)],
          stops: [0, .6, 1],
        ),
      ),
      child: Stack(children: [
        Positioned(
          right: -40,
          top: -40,
          child: Container(
            width: 180,
            height: 180,
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(colors: [Color(0x40F2D27A), Color(0x00F2D27A)], stops: [0, .7]),
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.all(22),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Ridean Wallet balance', style: RdText.sans(13, color: RdColors.muted)),
            const SizedBox(height: 4),
            if (b != null)
              FittedBox(
                fit: BoxFit.scaleDown,
                alignment: Alignment.centerLeft,
                child: Text(b, style: RdText.serif(40)),
              )
            else
              const SizedBox(
                height: 52,
                child: Align(alignment: Alignment.centerLeft, child: SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2.2, color: RdColors.gold))),
              ),
            const SizedBox(height: 10),
            Text('Use your balance at checkout for rides, transfers and rentals.', style: RdText.sans(12, color: RdColors.muted)),
          ]),
        ),
      ]),
    );
  }
}

class _AmountChip extends StatelessWidget {
  const _AmountChip({required this.label, required this.semantic, required this.onTap, this.dim = false});
  final String label;
  final String semantic;
  final VoidCallback? onTap;
  final bool dim;
  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      enabled: onTap != null,
      label: semantic,
      excludeSemantics: true,
      child: Opacity(
        opacity: dim ? .6 : 1,
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: onTap,
            borderRadius: BorderRadius.circular(999),
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 9),
              alignment: Alignment.center,
              decoration: BoxDecoration(color: RdColors.card, borderRadius: BorderRadius.circular(999), border: Border.all(color: RdColors.line)),
              child: FittedBox(fit: BoxFit.scaleDown, child: Text(label, maxLines: 1, style: RdText.sans(13.5))),
            ),
          ),
        ),
      ),
    );
  }
}

class _TxRow extends StatelessWidget {
  const _TxRow({required this.tx, required this.currency});
  final WalletTx tx;
  final String currency;
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 2),
      child: Row(children: [
        RdIconTile(_txIcon(tx)),
        const SizedBox(width: 14),
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(tx.description, maxLines: 2, overflow: TextOverflow.ellipsis, style: RdText.sans(15, weight: FontWeight.w500)),
            Padding(padding: const EdgeInsets.only(top: 2), child: Text(_day(tx.createdAt), style: RdText.sans(12.5, color: RdColors.muted))),
          ]),
        ),
        const SizedBox(width: 8),
        Text(_signed(tx.amount, currency), style: RdText.sans(14.5, weight: FontWeight.w600, color: tx.amount > 0 ? RdColors.ok : RdColors.cream)),
      ]),
    );
  }
}
