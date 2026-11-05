import 'package:flutter_test/flutter_test.dart';
import 'package:ridean/api/models.dart';

void main() {
  test('formats money from minor units', () {
    expect(formatMoney(1890, 'USD'), r'$18.90');
  });

  test('quote search omits empty fields', () {
    final s = QuoteSearch('ride_now')..pickup = 'JFK';
    final j = s.toJson();
    expect(j['service'], 'ride_now');
    expect(j.containsKey('dropoff'), isFalse);
    expect(j.containsKey('pickupAt'), isFalse);
  });
}
