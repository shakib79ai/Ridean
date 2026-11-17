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
    // The router is created straight away so a deep link keeps its location.
    final ready = ref.watch(authProvider.select((a) => a.ready));
    return MaterialApp.router(
      title: 'Ridean',
      debugShowCheckedModeBanner: false,
      theme: buildTheme().copyWith(platform: _platformOverride()),
      routerConfig: ref.watch(routerProvider),
      builder: (context, child) => ready
          ? (child ?? const SizedBox.shrink())
          : const Scaffold(backgroundColor: RdColors.bg, body: Center(child: RdWordmark(size: 44, withSlogan: true))),
    );
  }
}

/// CI screenshot builds only: `?platform=ios|android` previews the other platform's look in a browser.
TargetPlatform? _platformOverride() {
  if (AppConfig.devToken.isEmpty) return null;
  switch (Uri.base.queryParameters['platform']) {
    case 'ios':
      return TargetPlatform.iOS;
    case 'android':
      return TargetPlatform.android;
  }
  return null;
}
