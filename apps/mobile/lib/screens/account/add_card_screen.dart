// Add card — board "AddPaymentMethod". Mirrors apps/pwa/src/app/account/payment-methods/new/page.tsx.
// With a Stripe publishable key the card is collected by Stripe's PaymentSheet (SetupIntent);
// without one (PAYMENTS_MODE=simulated in development) the design's own form posts a test card.
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_stripe/flutter_stripe.dart' hide Card;
import 'package:go_router/go_router.dart';
import '../../api/api_client.dart';
import '../../config.dart';
import '../../state/providers.dart';
import '../../theme.dart';
import '../../widgets/kit.dart';

class AddCardScreen extends ConsumerStatefulWidget {
  const AddCardScreen({super.key, this.next});
  final String? next;
  @override
  ConsumerState<AddCardScreen> createState() => _AddCardScreenState();
}

class _AddCardScreenState extends ConsumerState<AddCardScreen> {
  final _number = TextEditingController();
  final _name = TextEditingController();
  final _expiry = TextEditingController();
  final _cvc = TextEditingController();
  bool _makeDefault = true;
  bool _busy = false;
  String _error = '';

  bool get _stripe => AppConfig.stripePublishableKey.isNotEmpty;

  String? get _next {
    final n = widget.next;
    return n != null && n.startsWith('/') && !n.startsWith('//') ? n : null;
  }

  @override
  void dispose() {
    _number.dispose();
    _name.dispose();
    _expiry.dispose();
    _cvc.dispose();
    super.dispose();
  }

  void _setText(TextEditingController c, String text) {
    c.value = TextEditingValue(text: text, selection: TextSelection.collapsed(offset: text.length));
  }

  void _onNumber(String v) {
    final d = v.replaceAll(RegExp(r'\D'), '');
    final digits = d.length > 19 ? d.substring(0, 19) : d;
    final groups = <String>[];
    for (var i = 0; i < digits.length; i += 4) {
      groups.add(digits.substring(i, i + 4 > digits.length ? digits.length : i + 4));
    }
    final text = groups.join(' ');
    if (text != v) _setText(_number, text);
    setState(() {});
  }

  void _onExpiry(String v) {
    final d = v.replaceAll(RegExp(r'\D'), '');
    final digits = d.length > 4 ? d.substring(0, 4) : d;
    final text = digits.length > 2 ? '${digits.substring(0, 2)}/${digits.substring(2)}' : digits;
    if (text != v) _setText(_expiry, text);
    setState(() {});
  }

  void _onCvc(String v) {
    final d = v.replaceAll(RegExp(r'\D'), '');
    final text = d.length > 4 ? d.substring(0, 4) : d;
    if (text != v) _setText(_cvc, text);
  }

  void _finish(String message) {
    ref.invalidate(paymentMethodsProvider);
    showRdToast(context, message);
    final n = _next;
    if (n != null) {
      context.go(n);
    } else if (context.canPop()) {
      context.pop();
    } else {
      context.go('/account/payment-methods');
    }
  }

  Future<void> _saveStripe() async {
    setState(() {
      _busy = true;
      _error = '';
    });
    final api = ref.read(apiProvider);
    final makeDefault = _makeDefault;
    try {
      final before = makeDefault ? (await api.paymentMethods()).map((c) => c.id).toSet() : <String>{};
      final secret = await api.createSetupIntent();
      if (!mounted) return;
      await Stripe.instance.initPaymentSheet(
        paymentSheetParameters: SetupPaymentSheetParameters(
          setupIntentClientSecret: secret,
          merchantDisplayName: 'Ridean',
          style: ThemeMode.dark,
        ),
      );
      await Stripe.instance.presentPaymentSheet();
      if (!mounted) return;
      var message = 'Card saved';
      if (makeDefault) {
        try {
          // PaymentSheet doesn't return the new payment method id, so find the card that wasn't there before.
          final after = await api.paymentMethods();
          final added = after.where((c) => !before.contains(c.id)).toList();
          if (added.isNotEmpty) {
            await api.setDefaultPaymentMethod(added.first.id);
          } else {
            message = 'Card saved — set it as default from Payment methods';
          }
        } catch (_) {
          message = 'Card saved — set it as default from Payment methods';
        }
      }
      if (!mounted) return;
      _finish(message);
    } on StripeException catch (e) {
      if (!mounted) return;
      setState(() {
        _busy = false;
        if (e.error.code != FailureCode.Canceled) _error = e.error.localizedMessage ?? 'We couldn’t save your card. Please try again.';
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _busy = false;
        _error = errorText(e, 'We couldn’t start adding a card. Please try again.');
      });
    }
  }

  Future<void> _saveSimulated() async {
    final digits = _number.text.replaceAll(RegExp(r'\D'), '');
    final parts = _expiry.text.split('/');
    final mm = parts.isNotEmpty ? parts[0] : '';
    final yy = parts.length > 1 ? parts[1] : '';
    final expMonth = int.tryParse(mm) ?? 0;
    final expYear = 2000 + (int.tryParse(yy) ?? 0);
    final now = DateTime.now();
    String err = '';
    if (digits.length < 12) {
      err = 'Please enter a valid card number.';
    } else if (_name.text.trim().isEmpty) {
      err = 'Please enter the name on the card.';
    } else if (mm.isEmpty || yy.length != 2 || expMonth < 1 || expMonth > 12) {
      err = 'Please enter the expiry as MM/YY.';
    } else if (expYear < now.year || (expYear == now.year && expMonth < now.month)) {
      err = 'This card has expired.';
    } else if (!RegExp(r'^\d{3,4}$').hasMatch(_cvc.text)) {
      err = 'Please enter the 3 or 4 digit security code.';
    }
    if (err.isNotEmpty) {
      setState(() => _error = err);
      return;
    }
    setState(() {
      _error = '';
      _busy = true;
    });
    try {
      // The CVC is only checked here — it is never sent to our API.
      await ref.read(apiProvider).addSimulatedCard(number: digits, expMonth: expMonth, expYear: expYear, makeDefault: _makeDefault);
      if (!mounted) return;
      _finish('Card saved');
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
    final user = ref.watch(authProvider).user;
    final defaultRow = RdListGroup(children: [
      RdToggleRow(
        title: 'Set as default',
        subtitle: 'Use for rides, transfers and rentals',
        value: _makeDefault,
        onChanged: _busy ? null : (v) => setState(() => _makeDefault = v),
      ),
    ]);

    if (_stripe) {
      return RdPage(
        title: 'Add card',
        children: [
          _CardPreview(number: '', name: user?.fullName ?? '', expiry: ''),
          defaultRow,
          if (_error.isNotEmpty) RdErrorText(_error),
          RdCta(label: 'Save card', arrow: false, busy: _busy, onPressed: _saveStripe),
          const RdNote('Card details go straight to our payment processor, Stripe, and never touch our servers', icon: Icons.lock_outline_rounded, center: true),
        ],
      );
    }

    return RdPage(
      title: 'Add card',
      children: [
        _CardPreview(number: _number.text, name: _name.text, expiry: _expiry.text),
        RdCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: rdGap([
              RdField(
                label: 'Card number',
                icon: Icons.credit_card_outlined,
                controller: _number,
                hint: '1234 5678 9012 3456',
                keyboardType: TextInputType.number,
                autofillHints: const [AutofillHints.creditCardNumber],
                textInputAction: TextInputAction.next,
                onChanged: _onNumber,
              ),
              RdField(
                label: 'Name on card',
                icon: Icons.person_outline_rounded,
                controller: _name,
                hint: 'As shown on card',
                textCapitalization: TextCapitalization.words,
                autofillHints: const [AutofillHints.creditCardName],
                textInputAction: TextInputAction.next,
                onChanged: (_) => setState(() {}),
              ),
              Row(children: [
                Expanded(
                  child: RdField(
                    label: 'Expiry',
                    icon: Icons.calendar_today_outlined,
                    controller: _expiry,
                    hint: 'MM/YY',
                    keyboardType: TextInputType.number,
                    autofillHints: const [AutofillHints.creditCardExpirationDate],
                    textInputAction: TextInputAction.next,
                    onChanged: _onExpiry,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: RdField(
                    label: 'CVC',
                    icon: Icons.lock_outline_rounded,
                    controller: _cvc,
                    hint: '123',
                    obscure: true,
                    keyboardType: TextInputType.number,
                    autofillHints: const [AutofillHints.creditCardSecurityCode],
                    textInputAction: TextInputAction.done,
                    onChanged: _onCvc,
                    onSubmitted: (_) => _saveSimulated(),
                  ),
                ),
              ]),
            ], 12),
          ),
        ),
        defaultRow,
        if (_error.isNotEmpty) RdErrorText(_error),
        RdCta(label: 'Save card', arrow: false, busy: _busy, onPressed: _saveSimulated),
        const RdNote('Test mode — card details aren’t charged. Only the last 4 digits and expiry are stored.', icon: Icons.lock_outline_rounded, center: true),
      ],
    );
  }
}

/// Live card preview: digits fill in over the bullets, name and expiry update as typed.
class _CardPreview extends StatelessWidget {
  const _CardPreview({required this.number, required this.name, required this.expiry});
  final String number;
  final String name;
  final String expiry;
  @override
  Widget build(BuildContext context) {
    final d = number.replaceAll(RegExp(r'\D'), '');
    final digits = d.length > 16 ? d.substring(0, 16) : d;
    final filled = (digits + '•' * 16).substring(0, 16);
    final shown = [for (var i = 0; i < 16; i += 4) filled.substring(i, i + 4)].join(' ');
    return Container(
      height: 150,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0x66D9A94F)),
        gradient: const LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: [Color(0xFF1E5442), Color(0xFF0A1F18)], stops: [0, .75]),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Row(children: [
          const RdWordmark(size: 20),
          const Spacer(),
          Container(
            width: 36,
            height: 26,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(5),
              gradient: const LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: [Color(0xFFF2D27A), Color(0xFFB9842A)]),
            ),
          ),
        ]),
        Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          FittedBox(
            fit: BoxFit.scaleDown,
            alignment: Alignment.centerLeft,
            child: Text(shown, maxLines: 1, style: RdText.sans(19, letterSpacing: 2.3)),
          ),
          const SizedBox(height: 8),
          Row(children: [
            Expanded(
              child: Text(name.trim().isEmpty ? 'YOUR NAME' : name.trim().toUpperCase(), maxLines: 1, overflow: TextOverflow.ellipsis, style: RdText.sans(12, color: RdColors.muted)),
            ),
            const SizedBox(width: 10),
            Text(expiry.isEmpty ? 'MM/YY' : expiry, style: RdText.sans(12, color: RdColors.muted)),
          ]),
        ]),
      ]),
    );
  }
}
