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

/// Turns any error into a sentence that can be shown to the customer.
String errorText(Object e, [String fallback = 'Something went wrong. Please try again.']) {
  if (e is ApiException) return e.message.isEmpty ? fallback : e.message;
  return fallback;
}

/// Typed client for the Ridean REST API (same endpoints as packages/shared/src/api-client.ts).
class RideanApi {
  static const _tokenKey = 'ridean.token';
  final _storage = const FlutterSecureStorage();
  final Dio _dio = Dio(BaseOptions(baseUrl: AppConfig.apiUrl, connectTimeout: const Duration(seconds: 10), receiveTimeout: const Duration(seconds: 40)));
  String? _token;

  /// Called when the API answers 401 so the app can sign the user out.
  void Function()? onUnauthorized;

  RideanApi() {
    _dio.interceptors.add(InterceptorsWrapper(onRequest: (o, h) {
      if (_token != null) o.headers['Authorization'] = 'Bearer $_token';
      h.next(o);
    }));
  }

  bool get hasToken => _token != null;
  Future<String?> loadToken() async => _token = await _storage.read(key: _tokenKey);
  Future<void> setToken(String? t) async {
    _token = t;
    t == null ? await _storage.delete(key: _tokenKey) : await _storage.write(key: _tokenKey, value: t);
  }

  Future<T> _call<T>(Future<Response<dynamic>> Function() fn, T Function(dynamic) map) async {
    try {
      final r = await fn();
      return map(r.data);
    } on DioException catch (e) {
      final status = e.response?.statusCode;
      if (status == 401 && _token != null) onUnauthorized?.call();
      final data = e.response?.data;
      final msg = data is Map && data['message'] != null
          ? (data['message'] is List ? (data['message'] as List).join(', ') : '${data['message']}')
          : (e.type == DioExceptionType.connectionError || e.type == DioExceptionType.connectionTimeout
              ? 'We couldn’t reach Ridean. Check your connection and try again.'
              : 'Something went wrong. Please try again.');
      throw ApiException(status, msg);
    }
  }

  Map<String, dynamic> _m(dynamic d) => Map<String, dynamic>.from(d as Map);
  List<Map<String, dynamic>> _l(dynamic d) => (d as List).map((e) => Map<String, dynamic>.from(e as Map)).toList();

  // ---- auth
  Future<User> _auth(dynamic d) async {
    final m = _m(d);
    await setToken(m['accessToken'] as String);
    return User.fromJson(_m(m['user']));
  }

  Future<User> login(String email, String password) async =>
      _auth(await _call(() => _dio.post('/auth/login', data: {'email': email, 'password': password}), (d) => d));
  Future<User> loginWithPhone(String phone, String password) async =>
      _auth(await _call(() => _dio.post('/auth/login', data: {'phone': phone, 'password': password}), (d) => d));
  Future<User> register({required String email, required String password, required String firstName, required String lastName, String? phone}) async =>
      _auth(await _call(
          () => _dio.post('/auth/register', data: {
                'email': email,
                'password': password,
                'firstName': firstName,
                'lastName': lastName,
                if (phone != null && phone.isNotEmpty) 'phone': phone,
              }),
          (d) => d));
  Future<User> me() => _call(() => _dio.get('/me'), (d) => User.fromJson(_m(d)));
  Future<User> updateMe({String? firstName, String? lastName, String? phone}) => _call(
      () => _dio.patch('/me', data: {
            if (firstName != null) 'firstName': firstName,
            if (lastName != null) 'lastName': lastName,
            if (phone != null) 'phone': phone,
          }),
      (d) => User.fromJson(_m(d)));

  // ---- quotes
  Future<({List<Quote> quotes, List<String> errors})> searchQuotes(QuoteSearch s) => _call(
        () => _dio.post('/quotes/search', data: s.toJson()),
        (d) => (
          quotes: _l(d['quotes']).map(Quote.fromJson).toList(),
          errors: _l(d['errors'] ?? const []).map((e) => '${e['supplier']}').toList(),
        ),
      );
  Future<Quote> quote(String id) => _call(() => _dio.get('/quotes/$id'), (d) => Quote.fromJson(_m(d)));
  Future<PromoResult> applyPromo(String quoteId, String code) => _call(() => _dio.post('/quotes/$quoteId/promo', data: {'code': code}), (d) => PromoResult.fromJson(_m(d)));

  // ---- bookings
  /// [input] mirrors CreateBookingRequest: quoteId, passenger{firstName,lastName,email,phone}, flightNumber, notes,
  /// paymentMethodId, payWithWallet, payWithBusiness, tripPurpose, promoCode, tip.
  Future<({Booking booking, String? clientSecret, String? supplierPaymentUrl})> createBooking(Map<String, dynamic> input) => _call(
        () => _dio.post('/bookings', data: input),
        (d) => (booking: Booking.fromJson(_m(d['booking'])), clientSecret: d['clientSecret'] as String?, supplierPaymentUrl: d['supplierPaymentUrl'] as String?),
      );
  Future<List<Booking>> bookings({String? status}) =>
      _call(() => _dio.get('/bookings', queryParameters: {if (status != null) 'status': status}), (d) => _l(d['items']).map(Booking.fromJson).toList());
  Future<Booking> booking(String id) => _call(() => _dio.get('/bookings/$id'), (d) => Booking.fromJson(_m(d)));
  Future<Booking> cancelBooking(String id, [String reason = 'Cancelled in app']) =>
      _call(() => _dio.post('/bookings/$id/cancel', data: {'reason': reason}), (d) => Booking.fromJson(_m(d)));

  /// [input] mirrors UpdateBookingRequest: pickupAt (ISO), flightNumber, passengers, luggage, notes, passenger{...}.
  Future<Booking> updateBooking(String id, Map<String, dynamic> input) => _call(() => _dio.patch('/bookings/$id', data: input), (d) => Booking.fromJson(_m(d)));
  Future<LiveStatus> bookingStatus(String id) => _call(() => _dio.get('/bookings/$id/status'), (d) => LiveStatus.fromJson(_m(d)));
  Future<List<BookingMessage>> bookingMessages(String id) => _call(() => _dio.get('/bookings/$id/messages'), (d) => _l(d).map(BookingMessage.fromJson).toList());
  Future<BookingMessage> sendBookingMessage(String id, String body) =>
      _call(() => _dio.post('/bookings/$id/messages', data: {'body': body}), (d) => BookingMessage.fromJson(_m(d)));

  // ---- invoices
  Future<List<Invoice>> invoices({String? month}) =>
      _call(() => _dio.get('/invoices', queryParameters: {if (month != null) 'month': month}), (d) => _l(d).map(Invoice.fromJson).toList());
  Future<Invoice> invoice(String bookingId) => _call(() => _dio.get('/invoices/$bookingId'), (d) => Invoice.fromJson(_m(d)));

  // ---- wallet
  Future<Wallet> wallet() => _call(() => _dio.get('/wallet'), (d) => Wallet.fromJson(_m(d)));

  /// Returns a Stripe client secret when card payment is needed; null when the API credited the wallet directly (simulated payments).
  Future<String?> walletTopUp(int amount) => _call(() => _dio.post('/wallet/top-up', data: {'amount': amount}), (d) => d is Map ? d['clientSecret'] as String? : null);

  // ---- addresses
  Future<List<SavedAddress>> addresses() => _call(() => _dio.get('/me/addresses'), (d) => _l(d).map(SavedAddress.fromJson).toList());
  Future<SavedAddress> addAddress(String label, String address) =>
      _call(() => _dio.post('/me/addresses', data: {'label': label, 'address': address}), (d) => SavedAddress.fromJson(_m(d)));
  Future<void> deleteAddress(String id) => _call(() => _dio.delete('/me/addresses/$id'), (_) {});

  // ---- payment methods
  Future<List<SavedCard>> paymentMethods() => _call(() => _dio.get('/payments/methods'), (d) => _l(d).map(SavedCard.fromJson).toList());
  Future<String> createSetupIntent() => _call(() => _dio.post('/payments/setup-intent'), (d) => '${d['clientSecret']}');
  Future<void> removePaymentMethod(String id) => _call(() => _dio.delete('/payments/methods/$id'), (_) {});
  Future<void> setDefaultPaymentMethod(String id) => _call(() => _dio.post('/payments/methods/$id/default'), (_) {});

  /// Development only (PAYMENTS_MODE=simulated): stores a test card without Stripe.
  Future<SavedCard> addSimulatedCard({required String number, required int expMonth, required int expYear, bool makeDefault = false}) => _call(
      () => _dio.post('/payments/methods/simulated', data: {'number': number, 'expMonth': expMonth, 'expYear': expYear, 'makeDefault': makeDefault}),
      (d) => SavedCard.fromJson(_m(d)));

  // ---- settings & account
  Future<UserSettings> settings() => _call(() => _dio.get('/me/settings'), (d) => UserSettings.fromJson(_m(d)));

  /// Send a partial UserSettings, e.g. {'notifications': {'offers': true}}.
  Future<UserSettings> updateSettings(Map<String, dynamic> patch) => _call(() => _dio.patch('/me/settings', data: patch), (d) => UserSettings.fromJson(_m(d)));
  Future<void> changePassword(String currentPassword, String newPassword) =>
      _call(() => _dio.post('/me/password', data: {'currentPassword': currentPassword, 'newPassword': newPassword}), (_) {});
  Future<Map<String, dynamic>> exportData() => _call(() => _dio.get('/me/export'), (d) => _m(d));
  Future<void> deleteAccount(String password) => _call(() => _dio.post('/me/delete', data: {'password': password}), (_) {});

  // ---- business
  Future<BusinessAccount?> business() => _call(() => _dio.get('/business'), (d) => d is Map && d.isNotEmpty ? BusinessAccount.fromJson(_m(d)) : null);
  Future<BusinessAccount> createBusiness({required String name, int? monthlyBudget, String? billingEmail}) => _call(
      () => _dio.post('/business', data: {
            'name': name,
            if (monthlyBudget != null) 'monthlyBudget': monthlyBudget,
            if (billingEmail != null && billingEmail.isNotEmpty) 'billingEmail': billingEmail,
          }),
      (d) => BusinessAccount.fromJson(_m(d)));

  /// [patch]: name, monthlyBudget (minor units), billingEmail, policy{requirePurpose,businessClassOnly,approvalOver}.
  Future<BusinessAccount> updateBusiness(Map<String, dynamic> patch) => _call(() => _dio.patch('/business', data: patch), (d) => BusinessAccount.fromJson(_m(d)));
  Future<BusinessAccount> inviteBusinessMember({required String email, String? name, String role = 'member'}) => _call(
      () => _dio.post('/business/members', data: {'email': email, if (name != null && name.isNotEmpty) 'name': name, 'role': role}),
      (d) => BusinessAccount.fromJson(_m(d)));
  Future<BusinessAccount> removeBusinessMember(String id) => _call(() => _dio.delete('/business/members/$id'), (d) => BusinessAccount.fromJson(_m(d)));

  // ---- support
  Future<void> contact({required String name, required String email, required String topic, required String message}) =>
      _call(() => _dio.post('/contact', data: {'name': name, 'email': email, 'topic': topic, 'message': message}), (_) {});
}
