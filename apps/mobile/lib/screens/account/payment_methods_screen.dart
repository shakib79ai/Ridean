// Payment methods — boards "Payments" + "PaymentsPlatforms". Mirrors apps/pwa/src/app/account/payment-methods/page.tsx.
// Only saved cards can be the default; the wallet and business rows link to their pages (chosen at checkout).
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../api/api_client.dart';
import '../../api/models.dart';
import '../../state/providers.dart';
import '../../theme.dart';
import '../../widgets/kit.dart';

String _brandName(String b) {
  const map = {
    'visa': 'Visa',
    'mastercard': 'Mastercard',
    'amex': 'Amex',
    'american_express': 'Amex',
    'discover': 'Discover',
    'diners': 'Diners',
    'jcb': 'JCB',
    'unionpay': 'UnionPay',
  };
  final k = b.toLowerCase();
  return map[k] ?? (k.isEmpty ? 'Card' : k[0].toUpperCase() + k.substring(1));
}

String _cardLabel(SavedCard c) => '${_brandName(c.brand)} •••• ${c.last4}';

class PaymentMethodsScreen extends ConsumerStatefulWidget {
  const PaymentMethodsScreen({super.key});
  @override
  ConsumerState<PaymentMethodsScreen> createState() => _PaymentMethodsScreenState();
}

class _PaymentMethodsScreenState extends ConsumerState<PaymentMethodsScreen> {
  String _busy = '';
  String? _defaultId; // optimistic default while the request runs
  String _error = '';

  Future<void> _makeDefault(SavedCard c) async {
    if (c.isDefault || _busy.isNotEmpty) return;
    setState(() {
      _error = '';
      _busy = c.id;
      _defaultId = c.id;
    });
    try {
      await ref.read(apiProvider).setDefaultPaymentMethod(c.id);
      if (!mounted) return;
      ref.invalidate(paymentMethodsProvider);
      showRdToast(context, 'Default payment updated');
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = errorText(e);
        _defaultId = null;
      });
    } finally {
      if (mounted) setState(() => _busy = '');
    }
  }

  Future<void> _remove(SavedCard c) async {
    final ok = await rdConfirm(context, title: 'Remove card', message: 'Remove ${_cardLabel(c)}?', confirm: 'Remove card', danger: true);
    if (!ok || !mounted) return;
    setState(() {
      _error = '';
      _busy = c.id;
    });
    try {
      await ref.read(apiProvider).removePaymentMethod(c.id);
      if (!mounted) return;
      _defaultId = null;
      ref.invalidate(paymentMethodsProvider);
      showRdToast(context, 'Card removed');
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = errorText(e));
    } finally {
      if (mounted) setState(() => _busy = '');
    }
  }

  @override
  Widget build(BuildContext context) {
    final cards = ref.watch(paymentMethodsProvider);
    final wallet = ref.watch(walletProvider);
    final business = ref.watch(businessProvider);
    final user = ref.watch(authProvider).user;

    final list = cards.valueOrNull ?? const <SavedCard>[];
    bool isDef(SavedCard c) => _defaultId != null ? c.id == _defaultId : c.isDefault;
    SavedCard? def;
    for (final c in list) {
      if (isDef(c)) def = c;
    }
    if (def == null && list.isNotEmpty) def = list.first;

    final subtitle = list.length > 1
        ? 'Tap a method to make it your default'
        : list.length == 1
            ? 'Your default card is used for rides, transfers and rentals'
            : null;

    final w = wallet.valueOrNull;
    final b = business.valueOrNull;

    return RdPage(
      title: 'Payment methods',
      subtitle: subtitle,
      onRefresh: () async {
        _defaultId = null;
        ref.invalidate(walletProvider);
        ref.invalidate(businessProvider);
        await ref.refresh(paymentMethodsProvider.future);
      },
      children: [
        if (cards.hasError && cards.valueOrNull == null) RdError(cards.error!, onRetry: () => ref.invalidate(paymentMethodsProvider)),
        if (_error.isNotEmpty) RdErrorText(_error),
        if (cards.isLoading && cards.valueOrNull == null)
          const RdLoading(height: 200)
        else if (def != null)
          _CardPreview(card: def, holder: user == null ? '' : user.fullName.toUpperCase())
        else if (cards.valueOrNull != null)
          const RdEmpty(icon: Icons.credit_card_outlined, title: 'No saved cards yet', text: 'Add a card to pay for rides, transfers and rentals.'),
        if (list.isNotEmpty || w != null || b != null)
          Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: rdGap([
              for (final c in list)
                Row(children: [
                  Expanded(
                    child: _PmRow(
                      icon: Icons.credit_card_outlined,
                      title: _cardLabel(c),
                      subtitle: 'Expires ${c.expiry}${isDef(c) ? ' · default' : ''}',
                      selected: isDef(c),
                      radio: true,
                      onTap: _busy.isNotEmpty ? null : () => _makeDefault(c),
                    ),
                  ),
                  const SizedBox(width: 2),
                  IconButton(
                    onPressed: _busy.isNotEmpty ? null : () => _remove(c),
                    tooltip: 'Remove ${_cardLabel(c)}',
                    icon: const Icon(Icons.delete_outline_rounded, size: 19, color: RdColors.muted),
                  ),
                ]),
              if (w != null)
                _PmRow(
                  icon: Icons.account_balance_wallet_outlined,
                  title: 'Ridean Wallet',
                  subtitle: 'Balance ${formatMoney(w.balance, w.currency)} · choose at checkout',
                  onTap: () => context.go('/wallet'),
                ),
              if (b != null)
                _PmRow(
                  icon: Icons.work_outline_rounded,
                  title: 'Business account',
                  subtitle: '${b.name} · choose at checkout',
                  onTap: () => context.push('/account/business'),
                ),
            ], 10),
          ),
        RdCta(label: 'Add payment method', arrow: false, onPressed: () => context.push('/account/payment-methods/new')),
      ],
    );
  }
}

/// The gold-rimmed default card at the top of the board.
class _CardPreview extends StatelessWidget {
  const _CardPreview({required this.card, required this.holder});
  final SavedCard card;
  final String holder;
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 120,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0x66D9A94F)),
        gradient: const LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: [Color(0xFF2A2414), Color(0xFF0E2A22)], stops: [0, .7]),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Row(children: [
          const RdWordmark(size: 20),
          const Spacer(),
          Text(_brandName(card.brand).toUpperCase(), style: RdText.sans(13, weight: FontWeight.w700, letterSpacing: 1)),
        ]),
        Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          Text('•••• •••• •••• ${card.last4}', maxLines: 1, overflow: TextOverflow.clip, softWrap: false, style: RdText.sans(17, letterSpacing: 2.4)),
          const SizedBox(height: 6),
          Row(children: [
            Expanded(child: Text(holder, maxLines: 1, overflow: TextOverflow.ellipsis, style: RdText.sans(12, color: RdColors.muted))),
            const SizedBox(width: 10),
            Text(card.expiry, style: RdText.sans(12, color: RdColors.muted)),
          ]),
        ]),
      ]),
    );
  }
}

/// Payment method row (.rd-pm): 44×30 icon chip, title, subtitle and a radio or chevron.
class _PmRow extends StatelessWidget {
  const _PmRow({required this.icon, required this.title, required this.subtitle, required this.onTap, this.selected = false, this.radio = false});
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback? onTap;
  final bool selected;
  final bool radio;
  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      selected: radio ? selected : null,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(14),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 160),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: selected ? RdColors.optOn : RdColors.bg,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: selected ? RdColors.gold : RdColors.line),
            ),
            child: Row(children: [
              Container(
                width: 44,
                height: 30,
                decoration: BoxDecoration(color: RdColors.iconTile, borderRadius: BorderRadius.circular(6)),
                child: Icon(icon, size: 18, color: RdColors.gold),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(title, maxLines: 1, overflow: TextOverflow.ellipsis, style: RdText.sans(15)),
                  Padding(
                    padding: const EdgeInsets.only(top: 2),
                    child: Text(subtitle, maxLines: 2, overflow: TextOverflow.ellipsis, style: RdText.sans(12.5, color: RdColors.muted)),
                  ),
                ]),
              ),
              const SizedBox(width: 8),
              if (radio) RdRadio(selected: selected) else const Icon(Icons.chevron_right, size: 20, color: RdColors.muted),
            ]),
          ),
        ),
      ),
    );
  }
}
