import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_stripe/flutter_stripe.dart' hide Card;
import 'config.dart';
import 'router.dart';
import 'state/providers.dart';
import 'theme.dart';
import 'widgets/kit.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
    statusBarBrightness: Brightness.dark,
    systemNavigationBarColor: Color(0xFF06140F),
    systemNavigationBarIconBrightness: Brightness.light,
  ));
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
    // Wait for the saved session to be restored so protected screens never load signed out.
    final ready = ref.watch(authProvider.select((a) => a.ready));
    if (!ready) {
      return MaterialApp(
        debugShowCheckedModeBanner: false,
        theme: buildTheme(),
        home: const Scaffold(backgroundColor: RdColors.bg, body: Center(child: RdWordmark(size: 44))),
      );
    }
    return MaterialApp.router(
      title: 'Ridean',
      debugShowCheckedModeBanner: false,
      theme: buildTheme(),
      routerConfig: ref.watch(routerProvider),
    );
  }
}
