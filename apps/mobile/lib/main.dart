import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_stripe/flutter_stripe.dart';
import 'config.dart';
import 'router.dart';
import 'theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  if (AppConfig.stripePublishableKey.isNotEmpty) {
    Stripe.publishableKey = AppConfig.stripePublishableKey;
    Stripe.merchantIdentifier = AppConfig.merchantIdentifier;
    await Stripe.instance.applySettings();
  }
  runApp(const ProviderScope(child: RideanApp()));
}

class RideanApp extends ConsumerWidget {
  const RideanApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp.router(
      title: 'Ridean',
      debugShowCheckedModeBanner: false,
      theme: buildTheme(),
      routerConfig: ref.watch(routerProvider),
    );
  }
}
