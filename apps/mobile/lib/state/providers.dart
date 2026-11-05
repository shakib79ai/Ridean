import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../api/api_client.dart';
import '../api/models.dart';

final apiProvider = Provider<RideanApi>((ref) => RideanApi());

/// Signed-in user (null when signed out). Also a Listenable so go_router can refresh redirects.
class AuthController extends ChangeNotifier {
  AuthController(this.api);
  final RideanApi api;
  User? user;
  bool ready = false;

  Future<void> restore() async {
    if (await api.loadToken() != null) {
      try {
        user = await api.me();
      } catch (_) {
        await api.setToken(null);
      }
    }
    ready = true;
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    user = await api.login(email, password);
    notifyListeners();
  }

  Future<void> register(Map<String, String> input) async {
    user = await api.register(input);
    notifyListeners();
  }

  Future<void> logout() async {
    await api.setToken(null);
    user = null;
    notifyListeners();
  }
}

final authProvider = ChangeNotifierProvider<AuthController>((ref) => AuthController(ref.read(apiProvider))..restore());

final bookingsProvider = FutureProvider.autoDispose<List<Booking>>((ref) => ref.read(apiProvider).bookings());
final bookingProvider = FutureProvider.autoDispose.family<Booking, String>((ref, id) => ref.read(apiProvider).booking(id));
final walletProvider = FutureProvider.autoDispose<Wallet>((ref) => ref.read(apiProvider).wallet());
final quoteProvider = FutureProvider.autoDispose.family<Quote, String>((ref, id) => ref.read(apiProvider).quote(id));
