// Dart mirrors of packages/shared/src/types.ts. Money is always integer minor units (cents).
import 'package:intl/intl.dart';

String formatMoney(int minor, [String currency = 'USD']) => NumberFormat.simpleCurrency(name: currency).format(minor / 100);

int _int(dynamic v) => v is num ? v.toInt() : int.tryParse('$v') ?? 0;
int? _intOrNull(dynamic v) => v == null ? null : _int(v);
String? _str(dynamic v) => v == null ? null : '$v';
Map<String, dynamic> _map(dynamic v) => v is Map ? Map<String, dynamic>.from(v) : <String, dynamic>{};
List<Map<String, dynamic>> _list(dynamic v) => v is List ? v.map((e) => _map(e)).toList() : <Map<String, dynamic>>[];

DateTime? parseDate(String? iso) => iso == null || iso.isEmpty ? null : DateTime.tryParse(iso)?.toLocal();

/// "Fri, 14 Nov · 6:30 AM"
String formatDateTime(String? iso, {String empty = 'As soon as possible'}) {
  final d = parseDate(iso);
  return d == null ? empty : '${DateFormat('EEE, d MMM').format(d)} · ${DateFormat('h:mm a').format(d)}';
}

/// "14 Nov 2026"
String formatDate(String? iso) {
  final d = parseDate(iso);
  return d == null ? '' : DateFormat('d MMM y').format(d);
}

/// "6:30 PM"
String formatTime(String? iso) {
  final d = parseDate(iso);
  return d == null ? '' : DateFormat('h:mm a').format(d);
}

class ServiceDef {
  final String key, slug, label, tagline, image;
  final bool supportsNow;
  const ServiceDef(this.key, this.slug, this.label, this.tagline, this.image, {this.supportsNow = false});
}

/// Keep in sync with SERVICES in packages/shared/src/services.ts.
const services = <ServiceDef>[
  ServiceDef('ride_now', 'ride', 'Ride', 'On-demand and scheduled rides with upfront prices.', 'assets/images/seat.jpg', supportsNow: true),
  ServiceDef('airport_transfer', 'airport-transfer', 'Airport transfer', 'Flight-tracked pickups with meet & greet, one way or return.', 'assets/images/plane.jpg'),
  ServiceDef('rent', 'rent', 'Rent a car', 'Compare rental partners in one search.', 'assets/images/chauffeur-door.jpg'),
  ServiceDef('hourly', 'hourly', 'Hourly chauffeur', 'A dedicated car and chauffeur, booked by the hour.', 'assets/images/hero.jpg'),
  ServiceDef('luxury', 'luxury', 'Luxury chauffeur', 'First-class cars such as the S-Class, 7 Series and Range Rover.', 'assets/images/hero.jpg'),
];

ServiceDef serviceByKey(String k) => services.firstWhere((s) => s.key == k, orElse: () => ServiceDef(k, k, k, '', 'assets/images/hero.jpg'));

/// Illustrative photo for a vehicle class key (sedan, xl, comfort, business, black, suv, van, …).
String vehicleImage(String cls, [String service = '']) {
  final c = cls.toLowerCase();
  if (c.contains('xl') || c.contains('van') || c.contains('suv') || c.contains('minivan')) return 'assets/images/cls-xl.jpg';
  if (c.contains('black') || c.contains('first') || c.contains('luxury')) return 'assets/images/cls-black.jpg';
  if (c.contains('business') || c.contains('executive')) return 'assets/images/cls-business.jpg';
  if (c.contains('comfort') || c.contains('premium')) return 'assets/images/cls-comfort.jpg';
  return 'assets/images/cls-sedan.jpg';
}

class User {
  final String id, email, firstName, lastName, role;
  final String? phone, createdAt;
  User.fromJson(Map<String, dynamic> j)
      : id = '${j['id']}',
        email = j['email'] ?? '',
        firstName = j['firstName'] ?? '',
        lastName = j['lastName'] ?? '',
        role = j['role'] ?? 'customer',
        phone = _str(j['phone']),
        createdAt = _str(j['createdAt']);
  String get fullName => '$firstName $lastName'.trim();
  String get initials => '${firstName.isEmpty ? '' : firstName[0]}${lastName.isEmpty ? '' : lastName[0]}'.toUpperCase();
}

class Vehicle {
  final String cls, name;
  final int passengers, bags;
  final String? imageUrl;
  Vehicle.fromJson(Map<String, dynamic> j)
      : cls = j['class'] ?? '',
        name = j['name'] ?? '',
        passengers = _int(j['passengers']),
        bags = _int(j['bags']),
        imageUrl = _str(j['imageUrl']);
  String get image => vehicleImage(cls);
}

/// Customer-facing price (internal margins are redacted by the API).
class Price {
  final String currency, collectedBy;
  final int customerPrice;
  Price.fromJson(Map<String, dynamic> j)
      : currency = j['currency'] ?? 'USD',
        collectedBy = j['collectedBy'] ?? 'ridean',
        customerPrice = _int(j['customerPrice']);
  String get display => formatMoney(customerPrice, currency);
  bool get supplierCollects => collectedBy == 'supplier';
}

class Quote {
  final String id, service, supplierName, cancellation, expiresAt;
  final Vehicle vehicle;
  final Price price;
  final int? etaMinutes, durationMinutes;
  final double? distanceKm;
  final List<String> inclusions;
  Quote.fromJson(Map<String, dynamic> j)
      : id = '${j['id']}',
        service = j['service'] ?? '',
        supplierName = j['supplierName'] ?? '',
        cancellation = j['cancellation'] ?? '',
        expiresAt = j['expiresAt'] ?? '',
        vehicle = Vehicle.fromJson(_map(j['vehicle'])),
        price = Price.fromJson(_map(j['price'])),
        etaMinutes = _intOrNull(j['etaMinutes']),
        durationMinutes = _intOrNull(j['durationMinutes']),
        distanceKm = (j['distanceKm'] as num?)?.toDouble(),
        inclusions = List<String>.from(j['inclusions'] ?? const []);
}

class Passenger {
  final String firstName, lastName, email, phone;
  Passenger.fromJson(Map<String, dynamic> j)
      : firstName = j['firstName'] ?? '',
        lastName = j['lastName'] ?? '',
        email = j['email'] ?? '',
        phone = j['phone'] ?? '';
  String get fullName => '$firstName $lastName'.trim();
}

class Booking {
  final String id, reference, service, status, supplierName, pickup, createdAt;
  final String? dropoff, pickupAt, returnAt, tripType, flightNumber, paymentMethod, promoCode, notes, cancelReason, supplierReference;
  final int? passengers, luggage, tip, discount;
  final Passenger passenger;
  final Vehicle vehicle;
  final Price price;
  Booking.fromJson(Map<String, dynamic> j)
      : id = '${j['id']}',
        reference = j['reference'] ?? '',
        service = j['service'] ?? '',
        status = j['status'] ?? '',
        supplierName = j['supplierName'] ?? '',
        supplierReference = _str(j['supplierReference']),
        pickup = _map(j['pickup'])['address'] ?? '',
        dropoff = _str(_map(j['dropoff'])['address']),
        pickupAt = _str(j['pickupAt']),
        returnAt = _str(j['returnAt']),
        tripType = _str(j['tripType']),
        flightNumber = _str(j['flightNumber']),
        paymentMethod = _str(j['paymentMethod']),
        promoCode = _str(j['promoCode']),
        notes = _str(j['notes']),
        cancelReason = _str(j['cancelReason']),
        passengers = _intOrNull(j['passengers']),
        luggage = _intOrNull(j['luggage']),
        tip = _intOrNull(j['tip']),
        discount = _intOrNull(j['discount']),
        createdAt = j['createdAt'] ?? '',
        passenger = Passenger.fromJson(_map(j['passenger'])),
        vehicle = Vehicle.fromJson(_map(j['vehicle'])),
        price = Price.fromJson(_map(j['price']));

  static const activeStatuses = ['pending_payment', 'payment_authorised', 'confirmed', 'driver_assigned', 'in_progress'];
  bool get upcoming => activeStatuses.contains(status);
  bool get cancellable => const ['pending_payment', 'payment_authorised', 'confirmed', 'driver_assigned'].contains(status);
  bool get editable => const ['pending_payment', 'payment_authorised', 'confirmed'].contains(status);
  String get serviceLabel => serviceByKey(service).label;
  String get paymentLabel => const {'card': 'Card', 'wallet': 'Ridean Wallet', 'business': 'Business account', 'supplier': 'Paid to partner'}[paymentMethod] ?? 'Card';
  String get statusLabel => const {
        'pending_payment': 'Pending payment',
        'payment_authorised': 'Confirming',
        'confirmed': 'Confirmed',
        'driver_assigned': 'Chauffeur assigned',
        'in_progress': 'In progress',
        'completed': 'Completed',
        'cancelled': 'Cancelled',
        'failed': 'Failed',
      }[status] ??
      status;
}

class WalletTx {
  final String id, description, createdAt;
  final int amount;
  WalletTx.fromJson(Map<String, dynamic> j)
      : id = '${j['id']}',
        description = j['description'] ?? '',
        createdAt = j['createdAt'] ?? '',
        amount = _int(j['amount']);
}

class Wallet {
  final String currency;
  final int balance;
  final List<WalletTx> transactions;
  Wallet.fromJson(Map<String, dynamic> j)
      : currency = j['currency'] ?? 'USD',
        balance = _int(j['balance']),
        transactions = _list(j['transactions']).map(WalletTx.fromJson).toList();
}

class SavedAddress {
  final String id, label, address;
  SavedAddress.fromJson(Map<String, dynamic> j)
      : id = '${j['id']}',
        label = j['label'] ?? '',
        address = j['address'] ?? '';
}

class SavedCard {
  final String id, brand, last4;
  final int expMonth, expYear;
  final bool isDefault;
  SavedCard.fromJson(Map<String, dynamic> j)
      : id = '${j['id']}',
        brand = j['brand'] ?? 'card',
        last4 = j['last4'] ?? '',
        expMonth = _int(j['expMonth']),
        expYear = _int(j['expYear']),
        isDefault = j['isDefault'] == true;
  String get brandLabel => brand.isEmpty ? 'Card' : brand[0].toUpperCase() + brand.substring(1);
  String get label => '$brandLabel •••• $last4';
  String get expiry => '${expMonth.toString().padLeft(2, '0')}/${(expYear % 100).toString().padLeft(2, '0')}';
}

class Driver {
  final String? name, phone, vehicle, plate, photoUrl;
  final double? rating;
  Driver.fromJson(Map<String, dynamic> j)
      : name = _str(j['name']),
        phone = _str(j['phone']),
        vehicle = _str(j['vehicle']),
        plate = _str(j['plate']),
        photoUrl = _str(j['photoUrl']),
        rating = (j['rating'] as num?)?.toDouble();
  String get initials {
    final parts = (name ?? '').trim().split(RegExp(r'\s+')).where((p) => p.isNotEmpty).toList();
    return parts.take(2).map((p) => p[0].toUpperCase()).join();
  }
}

class TripEvent {
  final String key, label;
  final String? at;
  final bool done;
  TripEvent.fromJson(Map<String, dynamic> j)
      : key = j['key'] ?? '',
        label = j['label'] ?? '',
        at = _str(j['at']),
        done = j['done'] == true;
}

class LiveStatus {
  final String status;
  final Driver? driver;
  final int? etaMinutes;
  final List<TripEvent> events;
  final bool messaging;
  LiveStatus.fromJson(Map<String, dynamic> j)
      : status = j['status'] ?? '',
        driver = j['driver'] is Map ? Driver.fromJson(_map(j['driver'])) : null,
        etaMinutes = _intOrNull(j['etaMinutes']),
        events = _list(j['events']).map(TripEvent.fromJson).toList(),
        messaging = j['messaging'] == true;
}

class BookingMessage {
  final String id, sender, body, createdAt;
  BookingMessage.fromJson(Map<String, dynamic> j)
      : id = '${j['id']}',
        sender = j['sender'] ?? 'system',
        body = j['body'] ?? '',
        createdAt = j['createdAt'] ?? '';
  bool get mine => sender == 'customer';
}

class PromoResult {
  final String code;
  final int percentOff, discount, customerPrice;
  PromoResult.fromJson(Map<String, dynamic> j)
      : code = j['code'] ?? '',
        percentOff = _int(j['percentOff']),
        discount = _int(j['discount']),
        customerPrice = _int(j['customerPrice']);
}

class InvoiceLine {
  final String label;
  final int amount;
  InvoiceLine.fromJson(Map<String, dynamic> j)
      : label = j['label'] ?? '',
        amount = _int(j['amount']);
}

class Invoice {
  final String id, number, bookingId, reference, issuedAt, service, description, paidWith, currency;
  final List<InvoiceLine> lines;
  final int total;
  final String billedName, billedEmail;
  final String? billedCompany;
  Invoice.fromJson(Map<String, dynamic> j)
      : id = '${j['id']}',
        number = j['number'] ?? '',
        bookingId = '${j['bookingId']}',
        reference = j['reference'] ?? '',
        issuedAt = j['issuedAt'] ?? '',
        service = j['service'] ?? '',
        description = j['description'] ?? '',
        paidWith = j['paidWith'] ?? '',
        currency = j['currency'] ?? 'USD',
        lines = _list(j['lines']).map(InvoiceLine.fromJson).toList(),
        total = _int(j['total']),
        billedName = _map(j['billedTo'])['name'] ?? '',
        billedEmail = _map(j['billedTo'])['email'] ?? '',
        billedCompany = _str(_map(j['billedTo'])['company']);
}

class BusinessPolicy {
  final bool requirePurpose, businessClassOnly;
  final int approvalOver;
  BusinessPolicy.fromJson(Map<String, dynamic> j)
      : requirePurpose = j['requirePurpose'] == true,
        businessClassOnly = j['businessClassOnly'] == true,
        approvalOver = _int(j['approvalOver']);
}

class BusinessMember {
  final String id, email, role, status;
  final String? name;
  final int tripsThisMonth, spendThisMonth;
  BusinessMember.fromJson(Map<String, dynamic> j)
      : id = '${j['id']}',
        email = j['email'] ?? '',
        role = j['role'] ?? 'member',
        status = j['status'] ?? 'active',
        name = _str(j['name']),
        tripsThisMonth = _int(j['tripsThisMonth']),
        spendThisMonth = _int(j['spendThisMonth']);
  String get displayName => (name == null || name!.isEmpty) ? email : name!;
}

class BusinessAccount {
  final String id, name, role, currency;
  final String? billingEmail;
  final int monthlyBudget, spendThisMonth, tripsThisMonth;
  final BusinessPolicy policy;
  final List<BusinessMember> members;
  BusinessAccount.fromJson(Map<String, dynamic> j)
      : id = '${j['id']}',
        name = j['name'] ?? '',
        role = j['role'] ?? 'member',
        currency = j['currency'] ?? 'USD',
        billingEmail = _str(j['billingEmail']),
        monthlyBudget = _int(j['monthlyBudget']),
        spendThisMonth = _int(j['spendThisMonth']),
        tripsThisMonth = _int(j['tripsThisMonth']),
        policy = BusinessPolicy.fromJson(_map(j['policy'])),
        members = _list(j['members']).map(BusinessMember.fromJson).toList();
  bool get isAdmin => role == 'admin';
}

/// Mirrors UserSettings. Kept as nested maps so a PATCH can send just the changed group.
class UserSettings {
  final Map<String, dynamic> raw;
  UserSettings(this.raw);
  factory UserSettings.fromJson(Map<String, dynamic> j) => UserSettings(Map<String, dynamic>.from(j));
  bool flag(String group, String key, [bool fallback = false]) {
    final g = raw[group];
    return g is Map && g[key] is bool ? g[key] as bool : fallback;
  }

  String pref(String key, String fallback) {
    final g = raw['preferences'];
    return g is Map && g[key] is String ? g[key] as String : fallback;
  }

  String? get defaultPaymentMethod => _str(raw['defaultPaymentMethod']);
}

/// Mirrors QuoteSearchRequest.
class QuoteSearch {
  String service;
  String pickup = '';
  String dropoff = '';
  DateTime? pickupAt; // null = as soon as possible (Ride only)
  String tripType = 'one_way';
  DateTime? returnAt;
  String flightNumber = '';
  int passengers = 1;
  int luggage = 1;
  int hours = 3;
  bool sameReturn = true;
  String returnLocation = '';
  DateTime? rentalReturnAt;
  String? vehicleClass;

  QuoteSearch(this.service);

  QuoteSearch copy() => QuoteSearch(service)
    ..pickup = pickup
    ..dropoff = dropoff
    ..pickupAt = pickupAt
    ..tripType = tripType
    ..returnAt = returnAt
    ..flightNumber = flightNumber
    ..passengers = passengers
    ..luggage = luggage
    ..hours = hours
    ..sameReturn = sameReturn
    ..returnLocation = returnLocation
    ..rentalReturnAt = rentalReturnAt
    ..vehicleClass = vehicleClass;

  Map<String, dynamic> toJson() {
    final j = <String, dynamic>{'service': service, 'pickup': {'address': pickup}, 'passengers': passengers, 'luggage': luggage};
    if (vehicleClass != null) j['vehicleClass'] = vehicleClass;
    if (service == 'rent') {
      j['rentalPickupAt'] = pickupAt?.toUtc().toIso8601String();
      j['rentalReturnAt'] = rentalReturnAt?.toUtc().toIso8601String();
      if (!sameReturn && returnLocation.isNotEmpty) j['returnLocation'] = {'address': returnLocation};
      return j;
    }
    if (dropoff.isNotEmpty) j['dropoff'] = {'address': dropoff};
    if (pickupAt != null) j['pickupAt'] = pickupAt!.toUtc().toIso8601String();
    if (service == 'airport_transfer') {
      j['tripType'] = tripType;
      if (tripType == 'return' && returnAt != null) j['returnAt'] = returnAt!.toUtc().toIso8601String();
      if (flightNumber.isNotEmpty) j['flightNumber'] = flightNumber;
    }
    if (service == 'hourly') j['hours'] = hours;
    return j;
  }
}

/// Choices made on Review booking that the Payment screen needs.
class CheckoutDraft {
  String firstName, lastName, email, phone;
  String notes = '';
  String flightNumber = '';
  PromoResult? promo;
  CheckoutDraft({this.firstName = '', this.lastName = '', this.email = '', this.phone = ''});
}
