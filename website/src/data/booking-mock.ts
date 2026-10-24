export type VehicleCategory = { id: string; name: string; seats: number; eta: string; price: string; desc: string; popular?: boolean; unavailable?: string };
export const vehicleCategories: VehicleCategory[] = [
  { id: "sedan", name: "Sedan", seats: 4, eta: "4 min", price: "$18.40", desc: "Everyday rides, affordable" },
  { id: "xl", name: "XL", seats: 6, eta: "6 min", price: "$26.90", desc: "Extra seats for groups", popular: true },
  { id: "comfort", name: "Extra Comfort", seats: 4, eta: "5 min", price: "$24.10", desc: "More legroom, newer cars" },
  { id: "business", name: "Business", seats: 4, eta: "7 min", price: "$39.50", desc: "Premium sedans, top-rated drivers" },
  { id: "black", name: "Black Car", seats: 4, eta: "9 min", price: "$58.00", desc: "Chauffeured, executive class", unavailable: "Limited availability — book ahead" },
];

export type RentalSupplier = { id: string; code: string; name: string; spec: string; pricePerDay: number; best?: boolean };
export const rentalSuppliers: RentalSupplier[] = [
  { id: "s1", code: "SIXT", name: "Toyota Corolla or similar", spec: "Economy · 5 seats · Automatic", pricePerDay: 39, best: true },
  { id: "s2", code: "ENTERPRISE", name: "Nissan Sentra or similar", spec: "Economy · 5 seats · Automatic", pricePerDay: 44 },
  { id: "s3", code: "ALAMO", name: "Hyundai Elantra or similar", spec: "Economy · 5 seats · Automatic", pricePerDay: 41 },
  { id: "s4", code: "SIXT", name: "Honda CR-V or similar", spec: "SUV · 5 seats · Automatic", pricePerDay: 62 },
];

export type ChauffeurVehicle = { id: string; name: string; seats: number; desc: string; pricePerHr: number; popular?: boolean; unavailable?: string };
export const chauffeurVehicles: ChauffeurVehicle[] = [
  { id: "c1", name: "Business Sedan", seats: 4, desc: "chauffeur included", pricePerHr: 45 },
  { id: "c2", name: "Business SUV", seats: 6, desc: "chauffeur included", pricePerHr: 58, popular: true },
  { id: "c3", name: "First Class", seats: 4, desc: "chauffeur included", pricePerHr: 89, unavailable: "Not available in this area right now" },
];

export type LuxuryVehicle = { id: string; name: string; seats: number; desc: string; price: number; badge?: string; popular?: boolean; unavailable?: string };
export const luxuryVehicles: LuxuryVehicle[] = [
  { id: "l1", name: "Mercedes S-Class", seats: 3, desc: "professional chauffeur · bottled water", price: 145, badge: "FIRST CLASS" },
  { id: "l2", name: "Cadillac Escalade", seats: 6, desc: "professional chauffeur", price: 175, popular: true },
  { id: "l3", name: "Mercedes Sprinter", seats: 12, desc: "group & event transport", price: 220, unavailable: "Limited availability — book ahead" },
];

export type Trip = {
  id: string;
  mode: string;
  status: "upcoming" | "completed" | "cancelled";
  from: string;
  to: string;
  date: string;
  time: string;
  price: string;
  distance: string;
  car: string;
  driver?: string;
};

export const trips: Trip[] = [
  { id: "t1", mode: "Airport Transfer", status: "upcoming", from: "JFK Airport, Terminal 4", to: "432 Park Ave, Manhattan", date: "Oct 14, 2026", time: "3:40 PM", price: "$74.00", distance: "17.2 mi", car: "Business · Toyota Camry", driver: "Kwame Osei" },
  { id: "t2", mode: "Ride Now", status: "completed", from: "Brooklyn Heights", to: "SoHo, Manhattan", date: "Oct 6, 2026", time: "9:12 AM", price: "$21.50", distance: "5.4 mi", car: "Sedan · Honda Accord" },
  { id: "t3", mode: "Rent", status: "completed", from: "LaGuardia Airport", to: "Returned same location", date: "Sep 28, 2026", time: "10:00 AM", price: "$186.00", distance: "—", car: "Honda CR-V · SUV" },
  { id: "t4", mode: "Ride Now", status: "cancelled", from: "Williamsburg", to: "Downtown Brooklyn", date: "Sep 24, 2026", time: "6:05 PM", price: "$0.00", distance: "2.1 mi", car: "Sedan" },
];

export type PaymentMethod = { id: string; brand: string; last4: string; expiry: string; isDefault: boolean };
export const paymentMethods: PaymentMethod[] = [
  { id: "p1", brand: "Visa", last4: "4821", expiry: "08/29", isDefault: true },
  { id: "p2", brand: "Mastercard", last4: "2290", expiry: "03/27", isDefault: false },
];

export type WalletActivity = { id: string; title: string; date: string; amount: string; positive: boolean };
export const walletActivity: WalletActivity[] = [
  { id: "w1", title: "Referral credit", date: "Oct 9, 2026", amount: "+$10.00", positive: true },
  { id: "w2", title: "Applied to Airport Transfer", date: "Oct 2, 2026", amount: "-$5.00", positive: false },
];

export const walletBalance = 32.5;

export type Invoice = {
  id: string;
  mode: string;
  icon: string;
  iconBg: string;
  title: string;
  date: string;
  time: string;
  route: string;
  price: string;
  status: "Paid";
  charges: { label: string; amount: string }[];
  total: string;
  paymentLabel: string;
  paymentSub: string;
  vehicleLabel: string;
  vehicleSub: string;
};

export const invoices: Invoice[] = [
  {
    id: "RD-20261002-0417",
    mode: "Airport Transfer",
    icon: "✈️",
    iconBg: "#E8EEF8",
    title: "Airport Transfer",
    date: "Oct 2, 2026",
    time: "7:05 AM",
    route: "JFK Airport, Terminal 4 → 432 Park Ave, Manhattan",
    price: "$74.00",
    status: "Paid",
    charges: [
      { label: "Base fare", amount: "$65.00" },
      { label: "Booking fee", amount: "$2.50" },
      { label: "Taxes & surcharges", amount: "$6.50" },
    ],
    total: "$74.00",
    paymentLabel: "Visa •••• 4821",
    paymentSub: "Charged Oct 2, 2026",
    vehicleLabel: "Business · Toyota Camry",
    vehicleSub: "Driver: Marcus H. · ★ 4.9",
  },
  {
    id: "RD-20260927-0318",
    mode: "Ride Now",
    icon: "🚗",
    iconBg: "#FBEBCF",
    title: "Ride · Sedan",
    date: "Sep 27, 2026",
    time: "6:40 PM",
    route: "Midtown, Manhattan → Brooklyn Heights",
    price: "$21.90",
    status: "Paid",
    charges: [
      { label: "Base fare", amount: "$17.40" },
      { label: "Booking fee", amount: "$1.50" },
      { label: "Taxes & surcharges", amount: "$3.00" },
    ],
    total: "$21.90",
    paymentLabel: "Visa •••• 4821",
    paymentSub: "Charged Sep 27, 2026",
    vehicleLabel: "Sedan · Honda Accord",
    vehicleSub: "Driver: Dana R. · ★ 4.8",
  },
  {
    id: "RD-20260914-0902",
    mode: "Rent",
    icon: "🔑",
    iconBg: "#DDF3E8",
    title: "Rental · Toyota Corolla",
    date: "Sep 14–17, 2026",
    time: "Pickup 10:00 AM",
    route: "LaGuardia Airport — returned same location",
    price: "$117.00",
    status: "Paid",
    charges: [
      { label: "3 days @ $39.00", amount: "$117.00" },
      { label: "Booking fee", amount: "$0.00" },
      { label: "Taxes & surcharges", amount: "$0.00" },
    ],
    total: "$117.00",
    paymentLabel: "Mastercard •••• 2290",
    paymentSub: "Charged Sep 14, 2026",
    vehicleLabel: "SIXT · Toyota Corolla or similar",
    vehicleSub: "Economy · 5 seats · Automatic",
  },
  {
    id: "RD-20260908-0145",
    mode: "Ride Now",
    icon: "🚗",
    iconBg: "#FBEBCF",
    title: "Ride · Business",
    date: "Sep 8, 2026",
    time: "8:15 AM",
    route: "Downtown Brooklyn → JFK Airport",
    price: "$46.20",
    status: "Paid",
    charges: [
      { label: "Base fare", amount: "$39.50" },
      { label: "Booking fee", amount: "$2.00" },
      { label: "Taxes & surcharges", amount: "$4.70" },
    ],
    total: "$46.20",
    paymentLabel: "Visa •••• 4821",
    paymentSub: "Charged Sep 8, 2026",
    vehicleLabel: "Business · Toyota Camry",
    vehicleSub: "Driver: Kwame O. · ★ 4.9",
  },
  {
    id: "RD-20260830-0710",
    mode: "Airport Transfer",
    icon: "✈️",
    iconBg: "#E8EEF8",
    title: "Airport Transfer",
    date: "Aug 30, 2026",
    time: "5:50 PM",
    route: "Newark Airport (EWR) → Jersey City",
    price: "$58.50",
    status: "Paid",
    charges: [
      { label: "Base fare", amount: "$51.00" },
      { label: "Booking fee", amount: "$2.50" },
      { label: "Taxes & surcharges", amount: "$5.00" },
    ],
    total: "$58.50",
    paymentLabel: "Visa •••• 4821",
    paymentSub: "Charged Aug 30, 2026",
    vehicleLabel: "Business · Toyota Camry",
    vehicleSub: "Driver: Priya N. · ★ 5.0",
  },
];

export const invoiceStats = { tripsThisYear: 14, totalSpent: "$912.40" };

export const rUser = {
  name: "Shakib Rahman",
  email: "shakib.ai.engineer@gmail.com",
  phone: "+1 (555) 014-2290",
  memberSince: "2025",
  rating: 4.95,
};

export type SavedAddress = { id: string; label: string; address: string };
export const savedAddresses: SavedAddress[] = [
  { id: "a1", label: "Home", address: "432 Park Ave, Manhattan, NY 10022" },
  { id: "a2", label: "Work", address: "1 World Trade Center, New York, NY 10007" },
  { id: "a3", label: "Other", address: "JFK Airport, Terminal 4, Queens, NY" },
];

export type Employee = { id: string; name: string; email: string; role: string };
export const businessEmployees: Employee[] = [
  { id: "e1", name: "Nadia Haque", email: "nadia@bestmyflight.com", role: "Finance" },
  { id: "e2", name: "Omar Siddiqui", email: "omar@bestmyflight.com", role: "Operations" },
];

export const businessAccount = {
  companyName: "Best My Flight Inc.",
  businessEmail: "travel@bestmyflight.com",
  expenseReporting: true,
};

export type Faq = { id: string; q: string; a: string };
export const faqs: Faq[] = [
  { id: "f1", q: "How do I cancel a booking?", a: "Open the booking under Trips, tap Cancel booking, and confirm. A fee may apply within an hour of pickup." },
  { id: "f2", q: "How do I change my pickup time or location?", a: "Open the booking and select Edit booking to update the time, location, or vehicle before pickup." },
  { id: "f3", q: "How do I add a payment method?", a: "Go to Profile > Payment methods > Add payment method, then enter a card or connect PayPal." },
  { id: "f4", q: "What is Ridean+?", a: "Ridean+ is our membership offering priority pickups and member pricing on every ride." },
  { id: "f5", q: "How do I contact my driver?", a: "Open the booking and select Contact driver to call or message them directly." },
];
