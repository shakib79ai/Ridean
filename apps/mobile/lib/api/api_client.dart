import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config.dart';
import 'models.dart';

class ApiException implements Exception {
  final int? status;
  final String message;
  ApiException(this.status, this.message);
  @override
  String toString() => message;
}

/// Typed client for the Ridean REST API (same endpoints as packages/shared/src/api-client.ts).
class RideanApi {
  static const _tokenKey = 'ridean.token';
  final _storage = const FlutterSecureStorage();
  final Dio _dio = Dio(BaseOptions(baseUrl: AppConfig.apiUrl, connectTimeout: const Duration(seconds: 10), receiveTimeout: const Duration(seconds: 40)));
  String? _token;

  RideanApi() {
    _dio.interceptors.add(InterceptorsWrapper(onRequest: (o, h) {
      if (_token != null) o.headers['Authorization'] = 'Bearer $_token';
      h.next(o);
    }));
  }

  Future<String?> loadToken() async => _token = await _storage.read(key: _tokenKey);
  Future<void> setToken(String? t) async {
    _token = t;
    t == null ? await _storage.delete(key: _tokenKey) : await _storage.write(key: _tokenKey, value: t);
  }

  Future<T> _call<T>(Future<Response> Function() fn, T Function(dynamic) map) async {
    try {
      final r = await fn();
      return map(r.data);
    } on DioException catch (e) {
      final data = e.response?.data;
      final msg = data is Map && data['message'] != null ? (data['message'] is List ? (data['message'] as List).join(', ') : '${data['message']}') : (e.message ?? 'Network error');
      throw ApiException(e.response?.statusCode, msg);
    }
  }

  // auth
  Future<User> login(String email, String password) async {
    final d = await _call(() => _dio.post('/auth/login', data: {'email': email, 'password': password}), (d) => d as Map<String, dynamic>);
    await setToken(d['accessToken'] as String);
    return User.fromJson(d['user']);
  }

  Future<User> register(Map<String, String> input) async {
    final d = await _call(() => _dio.post('/auth/register', data: input), (d) => d as Map<String, dynamic>);
    await setToken(d['accessToken'] as String);
    return User.fromJson(d['user']);
  }

  Future<User> me() => _call(() => _dio.get('/me'), (d) => User.fromJson(d));

  // quotes
  Future<({List<Quote> quotes, List<String> errors})> searchQuotes(QuoteSearch s) => _call(
        () => _dio.post('/quotes/search', data: s.toJson()),
        (d) => (
          quotes: (d['quotes'] as List).map((q) => Quote.fromJson(q)).toList(),
          errors: (d['errors'] as List).map((e) => '${e['supplier']}').toList(),
        ),
      );
  Future<Quote> quote(String id) => _call(() => _dio.get('/quotes/$id'), (d) => Quote.fromJson(d));

  // bookings
  Future<({Booking booking, String? clientSecret, String? supplierPaymentUrl})> createBooking(Map<String, dynamic> input) => _call(
        () => _dio.post('/bookings', data: input),
        (d) => (booking: Booking.fromJson(d['booking']), clientSecret: d['clientSecret'] as String?, supplierPaymentUrl: d['supplierPaymentUrl'] as String?),
      );
  Future<List<Booking>> bookings() => _call(() => _dio.get('/bookings'), (d) => (d['items'] as List).map((b) => Booking.fromJson(b)).toList());
  Future<Booking> booking(String id) => _call(() => _dio.get('/bookings/$id'), (d) => Booking.fromJson(d));
  Future<Booking> cancelBooking(String id) => _call(() => _dio.post('/bookings/$id/cancel', data: {'reason': 'Cancelled in app'}), (d) => Booking.fromJson(d));

  // wallet
  Future<Wallet> wallet() => _call(() => _dio.get('/wallet'), (d) => Wallet.fromJson(d));
  Future<String?> walletTopUp(int amount) => _call(() => _dio.post('/wallet/top-up', data: {'amount': amount}), (d) => d is Map ? d['clientSecret'] as String? : null);
}
