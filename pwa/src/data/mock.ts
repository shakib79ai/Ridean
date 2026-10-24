export type VehicleCategory = {
  id: string;
  name: string;
  icon: string;
  seats: number;
  eta: string;
  price: string;
  desc: string;
};

export const vehicleCategories: VehicleCategory[] = [
  { id: "sedan", name: "Sedan", icon: "🚗", seats: 4, eta: "4 min", price: "$18.40", desc: "Everyday rides, affordable" },
  { id: "xl", name: "XL", icon: "🚙", seats: 6, eta: "6 min", price: "$26.90", desc: "Extra seats for groups" },
  { id: "comfort", name: "Extra Comfort", icon: "🚗", seats: 4, eta: "5 min", price: "$24.10", desc: "More legroom, newer cars" },
  { id: "business", name: "Business", icon: "🚘", seats: 4, eta: "7 min", price: "$39.50", desc: "Premium sedans, top-rated drivers" },
  { id: "black", name: "Black Car", icon: "🚙", seats: 4, eta: "9 min", price: "$58.00", desc: "Chauffeured, executive class" },
];

export type ChauffeurVehicle = {
  id: string;
  name: string;
  seats: number;
  desc: string;
  pricePerHr: number;
};

export const chauffeurVehicles: ChauffeurVehicle[] = [
  { id: "c1", name: "Business Sedan", seats: 4, desc: "chauffeur included", pricePerHr: 45 },
  { id: "c2", name: "Business SUV", seats: 6, desc: "chauffeur included", pricePerHr: 58 },
  { id: "c3", name: "First Class", seats: 4, desc: "chauffeur included", pricePerHr: 89 },
];

export type LuxuryVehicle = {
  id: string;
  name: string;
  seats: number;
  desc: string;
  price: number;
  badge?: string;
};

export const luxuryVehicles: LuxuryVehicle[] = [
  { id: "l1", name: "Mercedes S-Class", seats: 3, desc: "professional chauffeur · bottled water", price: 145, badge: "FIRST CLASS" },
  { id: "l2", name: "Cadillac Escalade", seats: 6, desc: "professional chauffeur", price: 175 },
  { id: "l3", name: "Mercedes Sprinter", seats: 12, desc: "group & event transport", price: 220 },
];

export type RentalSupplier = {
  id: string;
  code: string;
  name: string;
  spec: string;
  pricePerDay: number;
  best?: boolean;
};

export const rentalSuppliers: RentalSupplier[] = [
  { id: "s1", code: "SIXT", name: "Toyota Corolla or similar", spec: "Economy · 5 seats · Automatic", pricePerDay: 39, best: true },
  { id: "s2", code: "ENTERPRISE", name: "Nissan Sentra or similar", spec: "Economy · 5 seats · Automatic", pricePerDay: 44 },
  { id: "s3", code: "ALAMO", name: "Hyundai Elantra or similar", spec: "Economy · 5 seats · Automatic", pricePerDay: 41 },
  { id: "s4", code: "SIXT", name: "Honda CR-V or similar", spec: "SUV · 5 seats · Automatic", pricePerDay: 62 },
];

export type Trip = {
  id: string;
  mode: "Ride Now" | "Airport Transfer" | "Rent";
  status: "upcoming" | "completed" | "cancelled";
  from: string;
  to: string;
  date: string;
  time: string;
  price: string;
  distance: string;
  car: string;
  riderName?: string;
  driver?: string;
  baseFare?: string;
  fees?: string;
};

export const trips: Trip[] = [
  {
    id: "t1",
    mode: "Airport Transfer",
    status: "upcoming",
    from: "432 Park Ave, Manhattan",
    to: "JFK Airport, Terminal 4",
    date: "Oct 14, 2026",
    time: "3:40 PM",
    price: "$74.00",
    distance: "17.2 mi",
    car: "Business · Toyota Camry",
    riderName: "Shakib Rahman",
    driver: "Diego Alvarez · ★4.9 · Plate RD-4821",
    baseFare: "$68.00",
    fees: "$6.00",
  },
  {
    id: "t2",
    mode: "Ride Now",
    status: "completed",
    from: "Brooklyn Heights",
    to: "SoHo, Manhattan",
    date: "Oct 6, 2026",
    time: "9:12 AM",
    price: "$21.50",
    distance: "5.4 mi",
    car: "Sedan · Honda Accord",
    riderName: "Shakib Rahman",
    driver: "Mateo Hassan · ★4.6 · Plate RD-9031",
    baseFare: "$19.00",
    fees: "$2.50",
  },
  {
    id: "t3",
    mode: "Rent",
    status: "completed",
    from: "LaGuardia Airport",
    to: "Returned same location",
    date: "Sep 28, 2026",
    time: "10:00 AM",
    price: "$186.00",
    distance: "—",
    car: "Honda CR-V · SUV",
    riderName: "Shakib Rahman",
    driver: "SIXT rental desk · LGA Terminal B",
    baseFare: "$174.00",
    fees: "$12.00",
  },
  {
    id: "t4",
    mode: "Ride Now",
    status: "cancelled",
    from: "Williamsburg",
    to: "Downtown Brooklyn",
    date: "Sep 24, 2026",
    time: "6:05 PM",
    price: "$0.00",
    distance: "2.1 mi",
    car: "Sedan",
    riderName: "Shakib Rahman",
    baseFare: "$0.00",
    fees: "$0.00",
  },
];

export type PaymentMethod = {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
  isDefault: boolean;
};

export const paymentMethods: PaymentMethod[] = [
  { id: "p1", brand: "Visa", last4: "4821", expiry: "08/29", isDefault: true },
  { id: "p2", brand: "Mastercard", last4: "2290", expiry: "03/27", isDefault: false },
];

export type WalletActivity = {
  id: string;
  title: string;
  date: string;
  amount: string;
  positive: boolean;
};

export const walletActivity: WalletActivity[] = [
  { id: "w1", title: "Referral credit", date: "Oct 9, 2026", amount: "+$10.00", positive: true },
  { id: "w2", title: "Applied to Airport Transfer", date: "Oct 2, 2026", amount: "-$5.00", positive: false },
];

export const walletBalance = 32.5;

export const user = {
  name: "Shakib Rahman",
  email: "shakib.ai.engineer@gmail.com",
  phone: "+1 (555) 014-2290",
  memberSince: "2025",
  rating: 4.95,
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  service: string;
  icon: "flight" | "car" | "key";
  date: string;
  time: string;
  route: string;
  pickup: string;
  dropoff: string;
  amount: number;
  status: "Paid";
  charges: { label: string; amount: number }[];
  paymentMethod: string;
  vehicle?: string;
  driver?: string;
};

export const invoices: Invoice[] = [
  {
    id: "inv-1",
    invoiceNumber: "RD-20261002-0417",
    service: "Airport Transfer",
    icon: "flight",
    date: "Oct 2, 2026",
    time: "7:05 AM",
    route: "JFK → Manhattan",
    pickup: "JFK Airport, Terminal 4",
    dropoff: "432 Park Ave, Manhattan",
    amount: 74.0,
    status: "Paid",
    charges: [
      { label: "Base fare", amount: 65.0 },
      { label: "Booking fee", amount: 2.5 },
      { label: "Taxes & surcharges", amount: 6.5 },
    ],
    paymentMethod: "Visa •••• 4821",
    vehicle: "Business · Toyota Camry",
    driver: "Marcus H. · ★ 4.9",
  },
  {
    id: "inv-2",
    invoiceNumber: "RD-20260927-0318",
    service: "Ride · Sedan",
    icon: "car",
    date: "Sep 27, 2026",
    time: "6:42 PM",
    route: "Midtown → Brooklyn",
    pickup: "5th Ave & 42nd St, Midtown",
    dropoff: "180 Montague St, Brooklyn",
    amount: 21.9,
    status: "Paid",
    charges: [
      { label: "Base fare", amount: 18.4 },
      { label: "Booking fee", amount: 1.0 },
      { label: "Taxes & surcharges", amount: 2.5 },
    ],
    paymentMethod: "Visa •••• 4821",
    vehicle: "Sedan · Toyota Camry",
    driver: "Elena R. · ★ 4.8",
  },
  {
    id: "inv-3",
    invoiceNumber: "RD-20260914-0209",
    service: "Rental · Toyota Corolla",
    icon: "key",
    date: "Sep 14–17, 2026",
    time: "Pickup 10:00 AM",
    route: "LaGuardia Airport",
    pickup: "LaGuardia Airport (LGA)",
    dropoff: "LaGuardia Airport (LGA)",
    amount: 117.0,
    status: "Paid",
    charges: [
      { label: "Rental (3 days)", amount: 99.0 },
      { label: "Protection plan", amount: 12.0 },
      { label: "Taxes & fees", amount: 6.0 },
    ],
    paymentMethod: "Mastercard •••• 2290",
    vehicle: "Toyota Corolla · Enterprise",
  },
  {
    id: "inv-4",
    invoiceNumber: "RD-20260908-0142",
    service: "Ride · Business",
    icon: "car",
    date: "Sep 8, 2026",
    time: "8:15 AM",
    route: "Downtown → Airport",
    pickup: "100 Broadway, Downtown",
    dropoff: "LaGuardia Airport (LGA)",
    amount: 46.2,
    status: "Paid",
    charges: [
      { label: "Base fare", amount: 39.5 },
      { label: "Booking fee", amount: 2.0 },
      { label: "Taxes & surcharges", amount: 4.7 },
    ],
    paymentMethod: "Visa •••• 4821",
    vehicle: "Business · BMW 5 Series",
    driver: "Marcus H. · ★ 4.9",
  },
  {
    id: "inv-5",
    invoiceNumber: "RD-20260830-0087",
    service: "Airport Transfer",
    icon: "flight",
    date: "Aug 30, 2026",
    time: "5:50 PM",
    route: "EWR → Jersey City",
    pickup: "Newark Liberty Airport (EWR)",
    dropoff: "90 Columbus Dr, Jersey City",
    amount: 58.5,
    status: "Paid",
    charges: [
      { label: "Base fare", amount: 50.0 },
      { label: "Booking fee", amount: 2.5 },
      { label: "Taxes & surcharges", amount: 6.0 },
    ],
    paymentMethod: "Visa •••• 4821",
    vehicle: "Business · Toyota Camry",
    driver: "Priya S. · ★ 4.95",
  },
];
