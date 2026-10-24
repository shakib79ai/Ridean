class VehicleCategory {
  final String id;
  final String name;
  final int seats;
  final String eta;
  final String price;
  final String desc;
  const VehicleCategory({
    required this.id,
    required this.name,
    required this.seats,
    required this.eta,
    required this.price,
    required this.desc,
  });
}

const vehicleCategories = <VehicleCategory>[
  VehicleCategory(id: 'sedan', name: 'Sedan', seats: 4, eta: '4 min', price: '\$18.40', desc: 'Everyday rides, affordable'),
  VehicleCategory(id: 'xl', name: 'XL', seats: 6, eta: '6 min', price: '\$26.90', desc: 'Extra seats for groups'),
  VehicleCategory(id: 'comfort', name: 'Extra Comfort', seats: 4, eta: '5 min', price: '\$24.10', desc: 'More legroom, newer cars'),
  VehicleCategory(id: 'business', name: 'Business', seats: 4, eta: '7 min', price: '\$39.50', desc: 'Premium sedans, top-rated drivers'),
  VehicleCategory(id: 'black', name: 'Black Car', seats: 4, eta: '9 min', price: '\$58.00', desc: 'Chauffeured, executive class'),
];

class RentalCar {
  final String id;
  final String name;
  final String category;
  final int seats;
  final String transmission;
  final String price;
  const RentalCar({
    required this.id,
    required this.name,
    required this.category,
    required this.seats,
    required this.transmission,
    required this.price,
  });
}

const rentalCars = <RentalCar>[
  RentalCar(id: 'r1', name: 'Toyota Corolla', category: 'Economy', seats: 5, transmission: 'Automatic', price: '\$39/day'),
  RentalCar(id: 'r2', name: 'Honda CR-V', category: 'SUV', seats: 5, transmission: 'Automatic', price: '\$62/day'),
  RentalCar(id: 'r3', name: 'BMW 5 Series', category: 'Luxury', seats: 5, transmission: 'Automatic', price: '\$110/day'),
  RentalCar(id: 'r4', name: 'Chrysler Pacifica', category: 'Minivan', seats: 7, transmission: 'Automatic', price: '\$85/day'),
];

class RentalSupplier {
  final String id;
  final String code;
  final String name;
  final String spec;
  final int pricePerDay;
  final bool best;
  const RentalSupplier({
    required this.id,
    required this.code,
    required this.name,
    required this.spec,
    required this.pricePerDay,
    this.best = false,
  });
}

const rentalSuppliers = <RentalSupplier>[
  RentalSupplier(id: 's1', code: 'SIXT', name: 'Toyota Corolla or similar', spec: 'Economy · 5 seats · Automatic', pricePerDay: 39, best: true),
  RentalSupplier(id: 's2', code: 'ENTERPRISE', name: 'Nissan Sentra or similar', spec: 'Economy · 5 seats · Automatic', pricePerDay: 44),
  RentalSupplier(id: 's3', code: 'ALAMO', name: 'Hyundai Elantra or similar', spec: 'Economy · 5 seats · Automatic', pricePerDay: 41),
  RentalSupplier(id: 's4', code: 'SIXT', name: 'Honda CR-V or similar', spec: 'SUV · 5 seats · Automatic', pricePerDay: 62),
];

class ChauffeurVehicle {
  final String id;
  final String name;
  final int seats;
  final String desc;
  final int pricePerHr;
  const ChauffeurVehicle({
    required this.id,
    required this.name,
    required this.seats,
    required this.desc,
    required this.pricePerHr,
  });
}

const chauffeurVehicles = <ChauffeurVehicle>[
  ChauffeurVehicle(id: 'c1', name: 'Business Sedan', seats: 4, desc: 'chauffeur included', pricePerHr: 45),
  ChauffeurVehicle(id: 'c2', name: 'Business SUV', seats: 6, desc: 'chauffeur included', pricePerHr: 58),
  ChauffeurVehicle(id: 'c3', name: 'First Class', seats: 4, desc: 'chauffeur included', pricePerHr: 89),
];

class LuxuryVehicle {
  final String id;
  final String name;
  final int seats;
  final String desc;
  final int price;
  final String? badge;
  const LuxuryVehicle({
    required this.id,
    required this.name,
    required this.seats,
    required this.desc,
    required this.price,
    this.badge,
  });
}

const luxuryVehicles = <LuxuryVehicle>[
  LuxuryVehicle(id: 'l1', name: 'Mercedes S-Class', seats: 3, desc: 'professional chauffeur · bottled water', price: 145, badge: 'FIRST CLASS'),
  LuxuryVehicle(id: 'l2', name: 'Cadillac Escalade', seats: 6, desc: 'professional chauffeur', price: 175),
  LuxuryVehicle(id: 'l3', name: 'Mercedes Sprinter', seats: 12, desc: 'group & event transport', price: 220),
];

class Trip {
  final String id;
  final String mode;
  final String status; // upcoming | completed | cancelled
  final String from;
  final String to;
  final String date;
  final String time;
  final String price;
  final String distance;
  final String car;
  const Trip({
    required this.id,
    required this.mode,
    required this.status,
    required this.from,
    required this.to,
    required this.date,
    required this.time,
    required this.price,
    required this.distance,
    required this.car,
  });
}

const trips = <Trip>[
  Trip(
    id: 't1',
    mode: 'Airport Transfer',
    status: 'upcoming',
    from: 'JFK Airport, Terminal 4',
    to: '432 Park Ave, Manhattan',
    date: 'Oct 14, 2026',
    time: '3:40 PM',
    price: '\$74.00',
    distance: '17.2 mi',
    car: 'Business · Toyota Camry',
  ),
  Trip(
    id: 't2',
    mode: 'Ride Now',
    status: 'completed',
    from: 'Brooklyn Heights',
    to: 'SoHo, Manhattan',
    date: 'Oct 6, 2026',
    time: '9:12 AM',
    price: '\$21.50',
    distance: '5.4 mi',
    car: 'Sedan · Honda Accord',
  ),
  Trip(
    id: 't3',
    mode: 'Rent',
    status: 'completed',
    from: 'LaGuardia Airport',
    to: 'Returned same location',
    date: 'Sep 28, 2026',
    time: '10:00 AM',
    price: '\$186.00',
    distance: '—',
    car: 'Honda CR-V · SUV',
  ),
  Trip(
    id: 't4',
    mode: 'Ride Now',
    status: 'cancelled',
    from: 'Williamsburg',
    to: 'Downtown Brooklyn',
    date: 'Sep 24, 2026',
    time: '6:05 PM',
    price: '\$0.00',
    distance: '2.1 mi',
    car: 'Sedan',
  ),
];

class PaymentMethod {
  final String id;
  final String brand;
  final String last4;
  final String expiry;
  final bool isDefault;
  const PaymentMethod({
    required this.id,
    required this.brand,
    required this.last4,
    required this.expiry,
    required this.isDefault,
  });
}

const paymentMethods = <PaymentMethod>[
  PaymentMethod(id: 'p1', brand: 'Visa', last4: '4821', expiry: '08/29', isDefault: true),
  PaymentMethod(id: 'p2', brand: 'Mastercard', last4: '2290', expiry: '03/27', isDefault: false),
];

class WalletActivity {
  final String id;
  final String title;
  final String date;
  final String amount;
  final bool positive;
  const WalletActivity({
    required this.id,
    required this.title,
    required this.date,
    required this.amount,
    required this.positive,
  });
}

const walletActivity = <WalletActivity>[
  WalletActivity(id: 'w1', title: 'Referral credit', date: 'Oct 9, 2026', amount: '+\$10.00', positive: true),
  WalletActivity(id: 'w2', title: 'Applied to Airport Transfer', date: 'Oct 2, 2026', amount: '-\$5.00', positive: false),
];

const walletBalance = 32.5;

class Invoice {
  final String id;
  final String icon;
  final String iconTone;
  final String title;
  final String dateRoute;
  final String amount;
  final String invoiceNumber;
  final String category;
  final String dateTime;
  final String pickup;
  final String dropoff;
  final String baseFare;
  final String bookingFee;
  final String taxes;
  final String total;
  final String paymentBrand;
  final String paymentDate;
  final String vehicle;
  final String driver;
  const Invoice({
    required this.id,
    required this.icon,
    required this.iconTone,
    required this.title,
    required this.dateRoute,
    required this.amount,
    required this.invoiceNumber,
    required this.category,
    required this.dateTime,
    required this.pickup,
    required this.dropoff,
    required this.baseFare,
    required this.bookingFee,
    required this.taxes,
    required this.total,
    required this.paymentBrand,
    required this.paymentDate,
    required this.vehicle,
    required this.driver,
  });
}

const invoices = <Invoice>[
  Invoice(
    id: 'inv1',
    icon: '✈️',
    iconTone: 'info',
    title: 'Airport Transfer',
    dateRoute: 'Oct 2, 2026 · JFK → Manhattan',
    amount: '\$74.00',
    invoiceNumber: 'RD-20261002-0417',
    category: 'Airport Transfer',
    dateTime: 'Oct 2, 2026 · 7:05 AM',
    pickup: 'JFK Airport, Terminal 4',
    dropoff: '432 Park Ave, Manhattan',
    baseFare: '\$65.00',
    bookingFee: '\$2.50',
    taxes: '\$6.50',
    total: '\$74.00',
    paymentBrand: 'Visa •••• 4821',
    paymentDate: 'Charged Oct 2, 2026',
    vehicle: 'Business · Toyota Camry',
    driver: 'Driver: Marcus H. · ★ 4.9',
  ),
  Invoice(
    id: 'inv2',
    icon: '🚗',
    iconTone: 'warn',
    title: 'Ride · Sedan',
    dateRoute: 'Sep 27, 2026 · Midtown → Brooklyn',
    amount: '\$21.90',
    invoiceNumber: 'RD-20260927-0318',
    category: 'Ride Now',
    dateTime: 'Sep 27, 2026 · 6:40 PM',
    pickup: 'Midtown, Manhattan',
    dropoff: 'Brooklyn Heights',
    baseFare: '\$18.40',
    bookingFee: '\$1.50',
    taxes: '\$2.00',
    total: '\$21.90',
    paymentBrand: 'Visa •••• 4821',
    paymentDate: 'Charged Sep 27, 2026',
    vehicle: 'Sedan · Honda Accord',
    driver: 'Driver: Aisha K. · ★ 4.8',
  ),
  Invoice(
    id: 'inv3',
    icon: '🔑',
    iconTone: 'ok',
    title: 'Rental · Toyota Corolla',
    dateRoute: 'Sep 14–17, 2026 · LaGuardia',
    amount: '\$117.00',
    invoiceNumber: 'RD-20260914-0205',
    category: 'Car Rental',
    dateTime: 'Sep 14–17, 2026 · 3 days',
    pickup: 'LaGuardia Airport',
    dropoff: 'Returned same location',
    baseFare: '\$108.00',
    bookingFee: '\$3.00',
    taxes: '\$6.00',
    total: '\$117.00',
    paymentBrand: 'Mastercard •••• 2290',
    paymentDate: 'Charged Sep 17, 2026',
    vehicle: 'Economy · Toyota Corolla',
    driver: 'Supplier: Sixt',
  ),
  Invoice(
    id: 'inv4',
    icon: '🚗',
    iconTone: 'warn',
    title: 'Ride · Business',
    dateRoute: 'Sep 8, 2026 · Downtown → Airport',
    amount: '\$46.20',
    invoiceNumber: 'RD-20260908-0142',
    category: 'Ride Now',
    dateTime: 'Sep 8, 2026 · 5:15 AM',
    pickup: 'Downtown Brooklyn',
    dropoff: 'JFK Airport',
    baseFare: '\$40.00',
    bookingFee: '\$2.00',
    taxes: '\$4.20',
    total: '\$46.20',
    paymentBrand: 'Visa •••• 4821',
    paymentDate: 'Charged Sep 8, 2026',
    vehicle: 'Business · Toyota Camry',
    driver: 'Driver: Marcus H. · ★ 4.9',
  ),
  Invoice(
    id: 'inv5',
    icon: '✈️',
    iconTone: 'info',
    title: 'Airport Transfer',
    dateRoute: 'Aug 30, 2026 · EWR → Jersey City',
    amount: '\$58.50',
    invoiceNumber: 'RD-20260830-0098',
    category: 'Airport Transfer',
    dateTime: 'Aug 30, 2026 · 11:20 AM',
    pickup: 'Newark Airport, Terminal B',
    dropoff: 'Jersey City, NJ',
    baseFare: '\$50.00',
    bookingFee: '\$2.50',
    taxes: '\$6.00',
    total: '\$58.50',
    paymentBrand: 'Visa •••• 4821',
    paymentDate: 'Charged Aug 30, 2026',
    vehicle: 'Sedan · Honda Accord',
    driver: 'Driver: Aisha K. · ★ 4.8',
  ),
];

class RUser {
  final String name;
  final String email;
  final String phone;
  final String memberSince;
  final double rating;
  const RUser({
    required this.name,
    required this.email,
    required this.phone,
    required this.memberSince,
    required this.rating,
  });
}

const rUser = RUser(
  name: 'Shakib Rahman',
  email: 'shakib.ai.engineer@gmail.com',
  phone: '+1 (555) 014-2290',
  memberSince: '2025',
  rating: 4.95,
);
