// Dart mirrors of packages/shared/src/types.ts. Money is always integer minor units (cents).
import 'package:intl/intl.dart';

String formatMoney(int minor, [String currency = 'USD']) => NumberFormat.simpleCurrency(name: currency).format(minor / 100);

class ServiceDef {
  final String key, slug, label, tagline;
  final bool supportsNow;
  const ServiceDef(this.key, this.slug, this.label, this.tagline, {this.supportsNow = false});
}

/// Keep in sync with SERVICES in packages/shared/src/services.ts. New services added there
/// appear here by adding a line — the API decides which suppliers serve them.
const services = <ServiceDef>[
  ServiceDef('ride_now', 'ride', 'Ride Now', 'On-demand and scheduled rides with upfront prices.', supportsNow: true),
  ServiceDef('airport_transfer', 'airport-transfer', 'Airport transfer', 'Flight-tracked pickups with meet & greet.'),
  ServiceDef('rent', 'rent', 'Rent a car', 'Compare rental partners in one search.'),
  ServiceDef('hourly', 'hourly', 'Hourly chauffeur', 'A dedicated car and chauffeur, by the hour.'),
  ServiceDef('luxury', 'luxury', 'Luxury chauffeur', 'S-Class, 7 Series, Range Rover and more.'),
];

ServiceDef serviceByKey(String k) => services.firstWhere((s) => s.key == k, orElse: () => ServiceDef(k, k, k, ''));

class User {
  final String id, email, firstName, lastName, role;
  final String? phone;
  User.fromJson(Map<String, dynamic> j)
      : id = j['id'],
        email = j['email'],
        firstName = j['firstName'] ?? '',
        lastName = j['lastName'] ?? '',
        role = j['role'] ?? 'customer',
        phone = j['phone'];
}

class Vehicle {
  final String cls, name;
  final int passengers, bags;
  Vehicle.fromJson(Map<String, dynamic> j)
      : cls = j['class'] ?? '',
        name = j['name'] ?? '',
        passengers = j['passengers'] ?? 0,
        bags = j['bags'] ?? 0;
}

class Price {
  final String currency, collectedBy;
  final int customerPrice;
  Price.fromJson(Map<String, dynamic> j)
      : currency = j['currency'] ?? 'USD',
        collectedBy = j['collectedBy'] ?? 'ridean',
        customerPrice = (j['customerPrice'] as num).toInt();
  String get display => formatMoney(customerPrice, currency);
}

class Quote {
  final String id, service, supplierName, cancellation, expiresAt;
  final Vehicle vehicle;
  final Price price;
  final int? etaMinutes, durationMinutes;
  final List<String> inclusions;
  Quote.fromJson(Map<String, dynamic> j)
      : id = j['id'],
        service = j['service'],
        supplierName = j['supplierName'],
        cancellation = j['cancellation'] ?? '',
        expiresAt = j['expiresAt'] ?? '',
        vehicle = Vehicle.fromJson(j['vehicle']),
        price = Price.fromJson(j['price']),
        etaMinutes = j['etaMinutes'],
        durationMinutes = j['durationMinutes'],
        inclusions = List<String>.from(j['inclusions'] ?? const []);
}

class Booking {
  final String id, reference, service, status, supplierName, pickup, createdAt;
  final String? dropoff, pickupAt, flightNumber;
  final Vehicle vehicle;
  final Price price;
  Booking.fromJson(Map<String, dynamic> j)
      : id = j['id'],
        reference = j['reference'],
        service = j['service'],
        status = j['status'],
        supplierName = j['supplierName'] ?? '',
        pickup = j['pickup']?['address'] ?? '',
        dropoff = j['dropoff']?['address'],
        pickupAt = j['pickupAt'],
        flightNumber = j['flightNumber'],
        createdAt = j['createdAt'],
        vehicle = Vehicle.fromJson(j['vehicle']),
        price = Price.fromJson(j['price']);

  bool get cancellable => const ['pending_payment', 'payment_authorised', 'confirmed', 'driver_assigned'].contains(status);
  String get statusLabel => const {
        'pending_payment': 'Pending payment',
        'payment_authorised': 'Confirming',
        'confirmed': 'Confirmed',
        'driver_assigned': 'Driver assigned',
        'in_progress': 'In progress',
        'completed': 'Completed',
        'cancelled': 'Cancelled',
        'failed': 'Failed',
      }[status] ??
      status;
}

class Wallet {
  final String currency;
  final int balance;
  final List<Map<String, dynamic>> transactions;
  Wallet.fromJson(Map<String, dynamic> j)
      : currency = j['currency'] ?? 'USD',
        balance = (j['balance'] as num).toInt(),
        transactions = List<Map<String, dynamic>>.from(j['transactions'] ?? const []);
}

/// Mirrors QuoteSearchRequest.
class QuoteSearch {
  String service;
  String pickup = '';
  String dropoff = '';
  DateTime? pickupAt;
  String tripType = 'one_way';
  DateTime? returnAt;
  String flightNumber = '';
  int passengers = 1;
  int luggage = 1;
  int hours = 3;
  bool sameReturn = true;
  String returnLocation = '';
  DateTime? rentalReturnAt;

  QuoteSearch(this.service);

  Map<String, dynamic> toJson() {
    final j = <String, dynamic>{'service': service, 'pickup': {'address': pickup}, 'passengers': passengers, 'luggage': luggage};
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
