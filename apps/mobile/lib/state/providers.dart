import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../api/api_client.dart';
import '../api/models.dart';
import '../config.dart';

final apiProvider = Provider<RideanApi>((ref) => RideanApi());

/// Signed-in user (null when signed out). Also a Listenable so go_router can refresh redirects.
class AuthController extends ChangeNotifier {
  AuthController(this.api) {
    api.onUnauthorized = () {
      if (user != null) logout();
    };
  }
  final RideanApi api;
  User? user;
  bool ready = false;

  Future<void> restore() async {
    try {
      if (AppConfig.devToken.isNotEmpty) await api.setToken(Uri.base.queryParameters['signedout'] == '1' ? null : AppConfig.devToken);
      if (await api.loadToken() != null) {
        try {
          user = await api.me();
        } on ApiException catch (e) {
          if (e.status == 401) await api.setToken(null);
        }
      }
    } catch (_) {
      // Secure storage unavailable — continue signed out.
    }
    ready = true;
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    user = await api.login(email, password);
    notifyListeners();
  }

  Future<void> loginWithPhone(String phone, String password) async {
    user = await api.loginWithPhone(phone, password);
    notifyListeners();
  }

  Future<void> register({required String email, required String password, required String firstName, required String lastName, String? phone}) async {
    user = await api.register(email: email, password: password, firstName: firstName, lastName: lastName, phone: phone);
    notifyListeners();
  }

  /// Replace the cached user after PATCH /me.
  void setUser(User u) {
    user = u;
    notifyListeners();
  }

  Future<void> logout() async {
    await api.setToken(null);
    user = null;
    notifyListeners();
  }
}

final authProvider = ChangeNotifierProvider<AuthController>((ref) => AuthController(ref.read(apiProvider))..restore());

// Data providers. Call ref.invalidate(provider) after a mutation to refetch.
final bookingsProvider = FutureProvider.autoDispose<List<Booking>>((ref) => ref.read(apiProvider).bookings());
final bookingProvider = FutureProvider.autoDispose.family<Booking, String>((ref, id) => ref.read(apiProvider).booking(id));
final liveStatusProvider = FutureProvider.autoDispose.family<LiveStatus, String>((ref, id) => ref.read(apiProvider).bookingStatus(id));
final messagesProvider = FutureProvider.autoDispose.family<List<BookingMessage>, String>((ref, id) => ref.read(apiProvider).bookingMessages(id));
final quoteProvider = FutureProvider.autoDispose.family<Quote, String>((ref, id) => ref.read(apiProvider).quote(id));
final walletProvider = FutureProvider.autoDispose<Wallet>((ref) => ref.read(apiProvider).wallet());
final paymentMethodsProvider = FutureProvider.autoDispose<List<SavedCard>>((ref) => ref.read(apiProvider).paymentMethods());
final addressesProvider = FutureProvider.autoDispose<List<SavedAddress>>((ref) => ref.read(apiProvider).addresses());
final settingsProvider = FutureProvider.autoDispose<UserSettings>((ref) => ref.read(apiProvider).settings());
final invoicesProvider = FutureProvider.autoDispose<List<Invoice>>((ref) => ref.read(apiProvider).invoices());
final invoiceProvider = FutureProvider.autoDispose.family<Invoice, String>((ref, bookingId) => ref.read(apiProvider).invoice(bookingId));
final businessProvider = FutureProvider.autoDispose<BusinessAccount?>((ref) => ref.read(apiProvider).business());

/// Review booking → Payment hand-off, keyed by quote id. Lives for the app session.
final checkoutDraftProvider = Provider.family<CheckoutDraft, String>((ref, quoteId) => CheckoutDraft());

/// The last search per service so going back to a booking screen keeps what the user typed.
final lastSearchProvider = StateProvider.family<QuoteSearch?, String>((ref, service) => null);
