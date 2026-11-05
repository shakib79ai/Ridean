import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'api/models.dart';
import 'screens/account/add_card_screen.dart';
import 'screens/account/addresses_screen.dart';
import 'screens/account/business_screen.dart';
import 'screens/account/edit_profile_screen.dart';
import 'screens/account/invoice_detail_screen.dart';
import 'screens/account/invoices_screen.dart';
import 'screens/account/payment_methods_screen.dart';
import 'screens/account/profile_screen.dart';
import 'screens/account/settings_screen.dart';
import 'screens/auth/create_account_screen.dart';
import 'screens/auth/sign_in_screen.dart';
import 'screens/book/airport_screen.dart';
import 'screens/book/hourly_screen.dart';
import 'screens/book/luxury_screen.dart';
import 'screens/book/rent_compare_screen.dart';
import 'screens/book/rent_screen.dart';
import 'screens/book/ride_screen.dart';
import 'screens/checkout/payment_screen.dart';
import 'screens/checkout/review_screen.dart';
import 'screens/home_screen.dart';
import 'screens/support/help_screen.dart';
import 'screens/support/legal_screen.dart';
import 'screens/trips/booking_details_screen.dart';
import 'screens/trips/contact_driver_screen.dart';
import 'screens/trips/edit_booking_screen.dart';
import 'screens/trips/receipt_screen.dart';
import 'screens/trips/trip_status_screen.dart';
import 'screens/trips/trips_screen.dart';
import 'screens/wallet_screen.dart';
import 'state/providers.dart';
import 'theme.dart';
import 'widgets/shell.dart';

/// Routes that need a signed-in user; others are public.
const _protected = ['/trips', '/wallet', '/account', '/checkout', '/bookings'];

final routerProvider = Provider<GoRouter>((ref) {
  final auth = ref.read(authProvider);
  return GoRouter(
    refreshListenable: auth,
    redirect: (context, state) {
      if (!auth.ready) return null;
      final loc = state.matchedLocation;
      if (auth.user == null && _protected.any(loc.startsWith)) return '/signin?next=${Uri.encodeComponent(state.uri.toString())}';
      if (auth.user != null && (loc == '/signin' || loc == '/signup')) return state.uri.queryParameters['next'] ?? '/';
      return null;
    },
    routes: [
      ShellRoute(
        builder: (context, state, child) => AppShell(location: state.matchedLocation, child: child),
        routes: [
          GoRoute(path: '/', pageBuilder: (_, __) => const NoTransitionPage(child: HomeScreen())),
          GoRoute(path: '/trips', pageBuilder: (_, __) => const NoTransitionPage(child: TripsScreen())),
          GoRoute(path: '/wallet', pageBuilder: (_, __) => const NoTransitionPage(child: WalletScreen())),
          GoRoute(path: '/account', pageBuilder: (_, __) => const NoTransitionPage(child: ProfileScreen())),
        ],
      ),
      // Booking flows
      GoRoute(path: '/book/ride', builder: (_, __) => const RideScreen()),
      GoRoute(path: '/book/airport-transfer', builder: (_, __) => const AirportTransferScreen()),
      GoRoute(path: '/book/hourly', builder: (_, __) => const HourlyScreen()),
      GoRoute(path: '/book/luxury', builder: (_, __) => const LuxuryScreen()),
      GoRoute(path: '/book/rent', builder: (_, __) => const RentScreen()),
      GoRoute(
        path: '/book/rent/compare',
        redirect: (_, s) => s.extra is QuoteSearch ? null : '/book/rent',
        builder: (_, s) => RentCompareScreen(search: s.extra as QuoteSearch),
      ),
      // Checkout
      GoRoute(path: '/checkout/:quoteId', builder: (_, s) => BookingReviewScreen(quoteId: s.pathParameters['quoteId']!)),
      GoRoute(path: '/checkout/:quoteId/pay', builder: (_, s) => PaymentScreen(quoteId: s.pathParameters['quoteId']!)),
      // Trips
      GoRoute(path: '/bookings/:id', builder: (_, s) => BookingDetailsScreen(id: s.pathParameters['id']!)),
      GoRoute(path: '/bookings/:id/status', builder: (_, s) => TripStatusScreen(id: s.pathParameters['id']!)),
      GoRoute(path: '/bookings/:id/chauffeur', builder: (_, s) => ContactDriverScreen(id: s.pathParameters['id']!)),
      GoRoute(path: '/bookings/:id/edit', builder: (_, s) => EditBookingScreen(id: s.pathParameters['id']!)),
      GoRoute(path: '/bookings/:id/receipt', builder: (_, s) => TripReceiptScreen(id: s.pathParameters['id']!)),
      // Account
      GoRoute(path: '/account/edit', builder: (_, __) => const EditProfileScreen()),
      GoRoute(path: '/account/payment-methods', builder: (_, __) => const PaymentMethodsScreen()),
      GoRoute(path: '/account/payment-methods/new', builder: (_, s) => AddCardScreen(next: s.uri.queryParameters['next'])),
      GoRoute(path: '/account/addresses', builder: (_, __) => const SavedAddressesScreen()),
      GoRoute(path: '/account/business', builder: (_, __) => const BusinessScreen()),
      GoRoute(path: '/account/settings', builder: (_, __) => const SettingsScreen()),
      GoRoute(path: '/account/invoices', builder: (_, __) => const InvoicesScreen()),
      GoRoute(path: '/account/invoices/:bookingId', builder: (_, s) => InvoiceDetailScreen(bookingId: s.pathParameters['bookingId']!)),
      // Support & auth
      GoRoute(path: '/help', builder: (_, __) => const HelpScreen()),
      GoRoute(path: '/legal', builder: (_, s) => LegalScreen(section: s.uri.queryParameters['section'])),
      GoRoute(path: '/signin', builder: (_, s) => SignInScreen(next: s.uri.queryParameters['next'])),
      GoRoute(path: '/signup', builder: (_, s) => CreateAccountScreen(next: s.uri.queryParameters['next'])),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(child: Text('Page not found', style: RdText.serif(22))),
    ),
  );
});
