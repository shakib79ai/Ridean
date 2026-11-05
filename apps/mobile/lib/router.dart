import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'api/models.dart';
import 'screens/account_screen.dart';
import 'screens/auth_screens.dart';
import 'screens/booking_screen.dart';
import 'screens/checkout_screen.dart';
import 'screens/home_screen.dart';
import 'screens/quotes_screen.dart';
import 'screens/search_screen.dart';
import 'screens/trips_screen.dart';
import 'screens/wallet_screen.dart';
import 'state/providers.dart';
import 'widgets/shell.dart';

const _protected = ['/trips', '/wallet', '/account', '/checkout', '/bookings'];

final routerProvider = Provider<GoRouter>((ref) {
  final auth = ref.read(authProvider);
  return GoRouter(
    refreshListenable: auth,
    redirect: (context, state) {
      if (!auth.ready) return null;
      final loc = state.matchedLocation;
      if (auth.user == null && _protected.any(loc.startsWith)) return '/signin?next=${Uri.encodeComponent(state.uri.toString())}';
      return null;
    },
    routes: [
      ShellRoute(
        builder: (context, state, child) => AppShell(location: state.matchedLocation, child: child),
        routes: [
          GoRoute(path: '/', builder: (_, __) => const HomeScreen()),
          GoRoute(path: '/trips', builder: (_, __) => const TripsScreen()),
          GoRoute(path: '/wallet', builder: (_, __) => const WalletScreen()),
          GoRoute(path: '/account', builder: (_, __) => const AccountScreen()),
        ],
      ),
      GoRoute(path: '/book/:service', builder: (_, s) => SearchScreen(service: s.pathParameters['service']!)),
      GoRoute(path: '/quotes', redirect: (_, s) => s.extra is QuoteSearch ? null : '/', builder: (_, s) => QuotesScreen(search: s.extra as QuoteSearch)),
      GoRoute(path: '/checkout/:quoteId', builder: (_, s) => CheckoutScreen(quoteId: s.pathParameters['quoteId']!)),
      GoRoute(path: '/bookings/:id', builder: (_, s) => BookingScreen(id: s.pathParameters['id']!)),
      GoRoute(path: '/signin', builder: (_, s) => SignInScreen(next: s.uri.queryParameters['next'])),
      GoRoute(path: '/signup', builder: (_, s) => SignUpScreen(next: s.uri.queryParameters['next'])),
    ],
    errorBuilder: (_, __) => const Scaffold(body: Center(child: Text('Page not found'))),
  );
});
