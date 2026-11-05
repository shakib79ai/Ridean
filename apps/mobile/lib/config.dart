/// Build-time configuration. Pass values with --dart-define, e.g.
///   flutter run --dart-define=API_URL=https://api.ridean.com --dart-define=STRIPE_PUBLISHABLE_KEY=pk_live_...
class AppConfig {
  static const apiUrl = String.fromEnvironment('API_URL', defaultValue: 'http://10.0.2.2:4000');
  static const stripePublishableKey = String.fromEnvironment('STRIPE_PUBLISHABLE_KEY');
  static const merchantIdentifier = String.fromEnvironment('APPLE_MERCHANT_ID', defaultValue: 'merchant.com.ridean');

  /// CI screenshot builds only (.github/workflows/mobile-screens.yml): starts the app signed in as a demo customer.
  /// Never set for real builds.
  static const devToken = String.fromEnvironment('DEV_TOKEN');
}
