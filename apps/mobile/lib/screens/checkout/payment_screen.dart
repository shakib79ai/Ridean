import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_stripe/flutter_stripe.dart' hide Card;
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../api/api_client.dart';
import '../../api/models.dart';
import '../../config.dart';
import '../../state/providers.dart';
import '../../theme.dart';
import '../../widgets/kit.dart';

/// Board: Payment. Choose how to pay, add a tip and create the booking.
class PaymentScreen extends ConsumerStatefulWidget {
  const PaymentScreen({super.key, required this.quoteId});
  final String quoteId;

  @override
  ConsumerState<PaymentScreen> createState() => _PaymentScreenState();
}

const _tips = [0, 10, 15, 20];

class _PaymentScreenState extends ConsumerState<PaymentScreen> {
  /// 'card:<id>', 'new', 'wallet' or 'business'. Null = use the sensible default.
  String? _pm;
  int _tipPct = 0;
  final _purpose = TextEditingController();
  bool _busy = false;
  String? _error;

  bool get _stripeReady => AppConfig.stripePublishableKey.isNotEmpty;

  @override
  void initState() {
    super.initState();
    // Without passenger details from Review we can't book.
    final d = ref.read(checkoutDraftProvider(widget.quoteId));
    if (d.firstName.isEmpty || d.email.isEmpty) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) context.pushReplacement('/checkout/${widget.quoteId}');
      });
    }
  }

  @override
  void dispose() {
    _purpose.dispose();
    super.dispose();
  }

  Future<void> _addPaymentMethod() async {
    final next = Uri.encodeComponent('/checkout/${widget.quoteId}/pay');
    await context.push('/account/payment-methods/new?next=$next');
    if (!mounted) return;
    ref.invalidate(paymentMethodsProvider);
    setState(() => _pm = null);
  }

  Future<void> _pay({
    required Quote quote,
    required String? pm,
    required int tip,
    required PromoResult? promo,
    required BusinessAccount? business,
  }) async {
    if (_busy) return;
    final supplier = quote.price.supplierCollects;
    final draft = ref.read(checkoutDraftProvider(widget.quoteId));
    setState(() => _error = null);
    if (!supplier) {
      if (pm == null) {
        setState(() => _error = 'Choose how you’d like to pay.');
        return;
      }
      if (pm == 'business' && business != null && business.policy.requirePurpose && _purpose.text.trim().isEmpty) {
        setState(() => _error = 'Your company asks for a trip purpose on business bookings.');
        return;
      }
    }
    final input = <String, dynamic>{
      'quoteId': widget.quoteId,
      'passenger': {'firstName': draft.firstName, 'lastName': draft.lastName, 'email': draft.email, 'phone': draft.phone},
      if (draft.notes.isNotEmpty) 'notes': draft.notes,
      if (draft.flightNumber.isNotEmpty) 'flightNumber': draft.flightNumber,
      if (!supplier && promo != null) 'promoCode': promo.code,
    };
    if (!supplier && pm != null) {
      if (tip > 0) input['tip'] = tip;
      if (pm.startsWith('card:')) input['paymentMethodId'] = pm.substring(5);
      if (pm == 'wallet') input['payWithWallet'] = true;
      if (pm == 'business') {
        input['payWithBusiness'] = true;
        final purpose = _purpose.text.trim();
        if (purpose.isNotEmpty) input['tripPurpose'] = purpose;
      }
    }

    setState(() => _busy = true);
    try {
      final r = await ref.read(apiProvider).createBooking(input);
      if (!mounted) return;
      ref.invalidate(bookingsProvider);
      ref.invalidate(walletProvider);
      final statusPath = '/bookings/${r.booking.id}/status';
      final payUrl = r.supplierPaymentUrl;
      final secret = r.clientSecret;
      if (payUrl != null && payUrl.isNotEmpty) {
        final uri = Uri.tryParse(payUrl);
        if (uri != null) {
          final ok = await launchUrl(uri, mode: LaunchMode.externalApplication);
          if (!mounted) return;
          if (!ok) showRdToast(context, 'We couldn’t open the payment page.');
        }
      } else if (secret != null && secret.isNotEmpty && _stripeReady && r.booking.status == 'pending_payment') {
        try {
          await Stripe.instance.initPaymentSheet(
            paymentSheetParameters: SetupPaymentSheetParameters(
              paymentIntentClientSecret: secret,
              merchantDisplayName: 'Ridean',
              style: ThemeMode.dark,
            ),
          );
          await Stripe.instance.presentPaymentSheet();
        } on StripeException catch (e) {
          if (!mounted) return;
          if (e.error.code != FailureCode.Canceled) {
            showRdToast(context, e.error.localizedMessage ?? 'Payment failed');
          }
        } catch (_) {
          if (!mounted) return;
          showRdToast(context, 'Payment failed');
        }
        if (!mounted) return;
      }
      context.go(statusPath);
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = errorText(e);
        _busy = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final q = ref.watch(quoteProvider(widget.quoteId));
    return q.when(
      loading: () => const RdPage(title: 'Payment', children: [RdLoading()]),
      error: (e, _) => _errorPage(e),
      data: (quote) => quote.price.supplierCollects ? _supplierPage(quote) : _ridean(quote),
    );
  }

  Widget _errorPage(Object e) {
    final status = e is ApiException ? e.status : null;
    final gone = status == 410 || status == 404;
    return RdPage(title: 'Payment', children: [
      RdCard(
        child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          Text(gone ? 'This price is no longer available. Search again to get a fresh, upfront price.' : errorText(e),
              style: RdText.sans(14.5, color: RdColors.muted, height: 1.55)),
          const SizedBox(height: 14),
          RdCta(
            label: gone ? 'Search again' : 'Back to review',
            onPressed: () {
              if (gone) {
                context.go('/');
              } else {
                context.pushReplacement('/checkout/${widget.quoteId}');
              }
            },
          ),
        ]),
      ),
    ]);
  }

  PromoResult? get _promo => ref.read(checkoutDraftProvider(widget.quoteId)).promo;

  Widget _totals({required Quote quote, required PromoResult? promo, required int? tip, required int total}) {
    final currency = quote.price.currency;
    final discount = promo?.discount ?? 0;
    return RdCard(
      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        RdSummaryRow('Trip fare', formatMoney(quote.price.customerPrice, currency)),
        if (promo != null && discount > 0)
          RdSummaryRow('Promo · ${promo.code}', '−${formatMoney(discount, currency)}', labelColor: RdColors.ok, valueColor: RdColors.ok),
        if (tip != null) RdSummaryRow('Tip', formatMoney(tip, currency)),
        const RdDivider(vertical: 6),
        RdSummaryRow('Total', formatMoney(total, currency), bold: true),
      ]),
    );
  }

  Widget get _secureNote => const RdNote('Payments are encrypted and secure', icon: Icons.lock_outline_rounded, center: true);

  Widget _supplierPage(Quote quote) {
    return RdPage(title: 'Payment', children: [
      RdSectionTitle('You’ll pay ${quote.supplierName} directly'),
      RdCard(
        child: Text(
          '${quote.supplierName} takes the payment for this trip on its own payment page. Confirm your booking and we’ll take you there if a payment is needed now.',
          style: RdText.sans(14, color: RdColors.muted, height: 1.55),
        ),
      ),
      _totals(quote: quote, promo: null, tip: null, total: quote.price.customerPrice),
      if (_error != null) RdErrorText(_error!),
      RdCta(
        label: _busy ? 'Processing…' : 'Confirm booking',
        busy: _busy,
        onPressed: () => _pay(quote: quote, pm: null, tip: 0, promo: null, business: null),
      ),
      _secureNote,
    ]);
  }

  Widget _ridean(Quote quote) {
    final cardsA = ref.watch(paymentMethodsProvider);
    final walletA = ref.watch(walletProvider);
    final bizA = ref.watch(businessProvider);
    bool pending(AsyncValue<Object?> a) => a.isLoading && !a.hasValue && !a.hasError;
    if (pending(cardsA) || pending(walletA) || pending(bizA)) {
      return const RdPage(title: 'Payment', children: [RdLoading()]);
    }
    // Like the PWA, a failed lookup just hides that option.
    final cards = cardsA.valueOrNull ?? const <SavedCard>[];
    final wallet = walletA.valueOrNull;
    final business = bizA.valueOrNull;

    final currency = quote.price.currency;
    final promo = _promo;
    final fare = promo != null ? promo.customerPrice : quote.price.customerPrice;
    final tip = (fare * _tipPct / 100).round();
    final total = fare + tip;
    final walletOk = wallet != null && wallet.balance >= total;

    // Effective selection: the user's choice, else default card → new card → wallet.
    SavedCard? defCard;
    for (final c in cards) {
      if (c.isDefault) defCard = c;
    }
    defCard ??= cards.isEmpty ? null : cards.first;
    String? pm = _pm ??
        (defCard != null
            ? 'card:${defCard.id}'
            : _stripeReady
                ? 'new'
                : walletOk
                    ? 'wallet'
                    : null);
    if (pm == 'wallet' && !walletOk) pm = null;
    if (pm == 'business' && business == null) pm = null;
    if (pm == 'new' && !_stripeReady) pm = null;
    if (pm != null && pm.startsWith('card:') && !cards.any((c) => 'card:${c.id}' == pm)) pm = null;

    return RdPage(
      title: 'Payment',
      onRefresh: () async {
        ref.invalidate(paymentMethodsProvider);
        ref.invalidate(walletProvider);
        ref.invalidate(businessProvider);
      },
      children: [
        const RdSectionTitle('Pay with'),
        Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: rdGap([
          for (final c in cards)
            RdPayOption(
              icon: Icons.credit_card_rounded,
              title: c.label,
              subtitle: 'Expires ${c.expiry}${c.isDefault ? ' · Default' : ''}',
              selected: pm == 'card:${c.id}',
              onTap: () => setState(() => _pm = 'card:${c.id}'),
            ),
          if (_stripeReady)
            RdPayOption(
              icon: Icons.credit_card_rounded,
              title: 'New card',
              subtitle: 'Enter card details next',
              selected: pm == 'new',
              onTap: () => setState(() => _pm = 'new'),
            ),
          if (wallet != null)
            RdPayOption(
              icon: Icons.account_balance_wallet_outlined,
              title: 'Ridean Wallet',
              subtitle: 'Balance ${formatMoney(wallet.balance, wallet.currency)}${walletOk ? '' : ' · Not enough balance'}',
              selected: pm == 'wallet',
              enabled: walletOk,
              onTap: () => setState(() => _pm = 'wallet'),
            ),
          if (business != null)
            RdPayOption(
              icon: Icons.work_outline_rounded,
              title: 'Business account',
              subtitle: '${business.name} · billed monthly',
              selected: pm == 'business',
              onTap: () => setState(() => _pm = 'business'),
            ),
        ], 10)),
        if (pm == 'business' && business != null && business.policy.requirePurpose)
          RdField(
            label: 'Trip purpose (required by your company)',
            icon: Icons.work_outline_rounded,
            controller: _purpose,
            hint: 'e.g. Client meeting',
            maxLength: 200,
            textCapitalization: TextCapitalization.sentences,
          ),
        if (cards.isEmpty && !_stripeReady && wallet == null && business == null)
          Text('You haven’t saved a card yet. Add one to pay by card.', style: RdText.sans(14, color: RdColors.muted)),
        Align(
          alignment: Alignment.centerLeft,
          child: RdLink('Add payment method', icon: Icons.add_rounded, size: 14.5, onTap: _addPaymentMethod),
        ),
        const RdSectionTitle('Add a tip'),
        RdChips<int>(
          options: [for (final t in _tips) (t, t == 0 ? 'No tip' : '$t%')],
          value: _tipPct,
          onChanged: (v) => setState(() => _tipPct = v),
        ),
        _totals(quote: quote, promo: promo, tip: tip, total: total),
        if (_error != null) RdErrorText(_error!),
        RdCta(
          label: _busy ? 'Processing…' : 'Pay ${formatMoney(total, currency)}',
          busy: _busy,
          onPressed: pm == null ? null : () => _pay(quote: quote, pm: pm, tip: tip, promo: promo, business: business),
        ),
        _secureNote,
      ],
    );
  }
}
