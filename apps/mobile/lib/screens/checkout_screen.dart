import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_stripe/flutter_stripe.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../api/models.dart';
import '../config.dart';
import '../state/providers.dart';
import '../theme.dart';
import '../widgets/common.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key, required this.quoteId});
  final String quoteId;
  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  final _form = GlobalKey<FormState>();
  late final user = ref.read(authProvider).user!;
  late final _first = TextEditingController(text: user.firstName);
  late final _last = TextEditingController(text: user.lastName);
  late final _email = TextEditingController(text: user.email);
  late final _phone = TextEditingController(text: user.phone ?? '');
  final _notes = TextEditingController();
  bool _wallet = false;
  bool _busy = false;
  String? _error;

  Future<void> _pay(Quote q) async {
    if (!_form.currentState!.validate()) return;
    setState(() {
      _busy = true;
      _error = null;
    });
    final api = ref.read(apiProvider);
    try {
      final r = await api.createBooking({
        'quoteId': q.id,
        'passenger': {'firstName': _first.text.trim(), 'lastName': _last.text.trim(), 'email': _email.text.trim(), 'phone': _phone.text.trim()},
        if (_notes.text.trim().isNotEmpty) 'notes': _notes.text.trim(),
        if (_wallet) 'payWithWallet': true,
      });
      if (r.clientSecret != null) {
        if (AppConfig.stripePublishableKey.isEmpty) throw Exception('Stripe is not configured in this build (STRIPE_PUBLISHABLE_KEY).');
        await Stripe.instance.initPaymentSheet(paymentSheetParameters: SetupPaymentSheetParameters(
          paymentIntentClientSecret: r.clientSecret,
          merchantDisplayName: 'Ridean',
          style: ThemeMode.dark,
          applePay: const PaymentSheetApplePay(merchantCountryCode: 'US'),
          googlePay: const PaymentSheetGooglePay(merchantCountryCode: 'US', testEnv: !bool.fromEnvironment('dart.vm.product')),
        ));
        await Stripe.instance.presentPaymentSheet();
      } else if (r.supplierPaymentUrl != null) {
        await launchUrl(Uri.parse(r.supplierPaymentUrl!), mode: LaunchMode.inAppBrowserView);
      }
      if (mounted) context.go('/bookings/${r.booking.id}');
    } on StripeException catch (e) {
      setState(() => _error = e.error.localizedMessage ?? 'Payment was not completed.');
    } catch (e) {
      setState(() => _error = '$e');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final quote = ref.watch(quoteProvider(widget.quoteId));
    const gap = SizedBox(height: 12);
    return Scaffold(
      appBar: AppBar(title: const Text('Review and pay')),
      body: quote.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => ErrorView(e),
        data: (q) => Form(
          key: _form,
          child: ListView(padding: const EdgeInsets.all(16), children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(serviceByKey(q.service).label.toUpperCase(), style: const TextStyle(color: RdColors.gold, letterSpacing: 2, fontSize: 12)),
                  const SizedBox(height: 4),
                  Text(q.vehicle.name, style: Theme.of(context).textTheme.titleLarge),
                  Text('${q.supplierName} · ${q.vehicle.passengers} passengers · ${q.vehicle.bags} bags', style: const TextStyle(color: RdColors.muted)),
                  const Divider(height: 24),
                  for (final i in q.inclusions) Padding(padding: const EdgeInsets.only(bottom: 4), child: Row(children: [const Icon(Icons.check, size: 16, color: RdColors.ok), const SizedBox(width: 8), Text(i)])),
                  Text(q.cancellation, style: const TextStyle(color: RdColors.muted, fontSize: 12.5)),
                  const Divider(height: 24),
                  Row(children: [const Expanded(child: Text('Total')), Text(q.price.display, style: Theme.of(context).textTheme.headlineMedium)]),
                ]),
              ),
            ),
            const SizedBox(height: 18),
            Text('Passenger', style: Theme.of(context).textTheme.titleLarge),
            gap,
            Row(children: [
              Expanded(child: TextFormField(controller: _first, decoration: const InputDecoration(labelText: 'First name'), validator: _req)),
              const SizedBox(width: 10),
              Expanded(child: TextFormField(controller: _last, decoration: const InputDecoration(labelText: 'Last name'), validator: _req)),
            ]),
            gap,
            TextFormField(controller: _email, keyboardType: TextInputType.emailAddress, decoration: const InputDecoration(labelText: 'Email'), validator: (v) => (v ?? '').contains('@') ? null : 'Enter a valid email'),
            gap,
            TextFormField(controller: _phone, keyboardType: TextInputType.phone, decoration: const InputDecoration(labelText: 'Mobile number'), validator: (v) => (v ?? '').trim().length < 6 ? 'Enter a phone number' : null),
            gap,
            TextFormField(controller: _notes, decoration: const InputDecoration(labelText: 'Notes for the chauffeur (optional)')),
            if (q.price.collectedBy == 'ridean') SwitchListTile(contentPadding: EdgeInsets.zero, value: _wallet, onChanged: (v) => setState(() => _wallet = v), title: const Text('Pay with Ridean wallet')),
            if (q.price.collectedBy == 'supplier') const Padding(padding: EdgeInsets.only(top: 12), child: Text('You pay the partner directly for this booking.', style: TextStyle(color: RdColors.muted))),
            if (_error != null) Padding(padding: const EdgeInsets.only(top: 12), child: Text(_error!, style: const TextStyle(color: RdColors.bad))),
            const SizedBox(height: 18),
            FilledButton(onPressed: _busy ? null : () => _pay(q), child: Text(_busy ? 'Processing…' : 'Confirm and pay ${q.price.display}')),
          ]),
        ),
      ),
    );
  }

  String? _req(String? v) => (v ?? '').trim().isEmpty ? 'Required' : null;
}
