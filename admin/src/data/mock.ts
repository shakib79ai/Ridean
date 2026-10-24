export type BookingStatus = "Completed" | "En route" | "In progress" | "Scheduled" | "Disputed" | "Cancelled";

export type Booking = {
  id: string;
  customer: string;
  service: string;
  driverOrSupplier: string;
  pickup: string;
  status: BookingStatus;
  amount: number;
};

export const bookings: Booking[] = [
  { id: "#RD-10482", customer: "Maria Chen", service: "Ride Now", driverOrSupplier: "D. Alvarez", pickup: "10:42 AM", status: "Completed", amount: 18.4 },
  { id: "#RD-10481", customer: "James Okafor", service: "Airport transfer", driverOrSupplier: "K. Osei", pickup: "10:15 AM", status: "In progress", amount: 74.0 },
  { id: "#RD-10483", customer: "Noah Bergström", service: "Ride Now", driverOrSupplier: "L. Petrov", pickup: "11:05 AM", status: "En route", amount: 16.8 },
  { id: "#RD-10480", customer: "Priya Nair", service: "Luxury chauffeur", driverOrSupplier: "S. Mercer", pickup: "12:30 PM", status: "Scheduled", amount: 145.0 },
  { id: "#RD-10479", customer: "Tom Becker", service: "Car rental", driverOrSupplier: "Enterprise", pickup: "9:00 AM", status: "Completed", amount: 39.0 },
  { id: "#RD-10478", customer: "Lena Fischer", service: "Hourly chauffeur", driverOrSupplier: "R. Diallo", pickup: "8:20 AM", status: "Disputed", amount: 180.0 },
  { id: "#RD-10477", customer: "Dev Patel", service: "Ride Now", driverOrSupplier: "M. Hassan", pickup: "7:58 AM", status: "Completed", amount: 22.1 },
  { id: "#RD-10476", customer: "Sara Kim", service: "Airport transfer", driverOrSupplier: "Sixt", pickup: "7:30 AM", status: "Cancelled", amount: 0 },
  { id: "#RD-10475", customer: "Omar Siddiqui", service: "Car rental", driverOrSupplier: "Alamo", pickup: "6:45 AM", status: "Completed", amount: 52.0 },
  { id: "#RD-10474", customer: "Nadia Hussein", service: "Luxury chauffeur", driverOrSupplier: "S. Mercer", pickup: "6:10 AM", status: "Completed", amount: 132.0 },
];

export type VehicleTier = {
  name: string;
  service: string;
  pct: number;
  popular?: boolean;
};

export const vehicleTiers: VehicleTier[] = [
  { name: "Sedan", service: "Ride Now", pct: 38, popular: true },
  { name: "Business Sedan", service: "Hourly Chauffeur", pct: 22 },
  { name: "XL", service: "Ride Now", pct: 16 },
  { name: "Mercedes S-Class", service: "Luxury Chauffeur", pct: 13 },
  { name: "Business SUV", service: "Hourly Chauffeur", pct: 11 },
];

export type DriverStatus = "Online" | "Offline" | "Suspended";

export type Driver = {
  name: string;
  vehicle: string;
  rating: number;
  trips: number;
  status: DriverStatus;
};

export const drivers: Driver[] = [
  { name: "Diego Alvarez", vehicle: "Toyota Camry · Sedan", rating: 4.9, trips: 1204, status: "Online" },
  { name: "Kwame Osei", vehicle: "Mercedes V-Class · Van", rating: 4.8, trips: 842, status: "Online" },
  { name: "Sophie Mercer", vehicle: "BMW 7 Series · Luxury", rating: 5.0, trips: 356, status: "Offline" },
  { name: "Rokia Diallo", vehicle: "Chevrolet Suburban · SUV", rating: 4.7, trips: 678, status: "Online" },
  { name: "Mateo Hassan", vehicle: "Honda Accord · Sedan", rating: 4.6, trips: 512, status: "Suspended" },
  { name: "Lina Petrov", vehicle: "Tesla Model Y · Sedan", rating: 4.9, trips: 298, status: "Online" },
];

export type SupplierStatus = "Active" | "Dispute open" | "Onboarding";

export type Supplier = {
  name: string;
  code: string;
  category: string;
  color: string;
  textColor: string;
  commission: number;
  status: SupplierStatus;
};

export const suppliers: Supplier[] = [
  { name: "Enterprise", code: "ENT", category: "Car rentals", color: "#C8102E", textColor: "#FFFFFF", commission: 14, status: "Active" },
  { name: "Alamo", code: "ALM", category: "Car rentals", color: "#0B4F8A", textColor: "#FFFFFF", commission: 12, status: "Active" },
  { name: "Sixt", code: "SXT", category: "Car rentals", color: "#0A1F44", textColor: "#F4B000", commission: 15, status: "Dispute open" },
  { name: "Lyft", code: "LFT", category: "Ride Now network", color: "#352E80", textColor: "#FFFFFF", commission: 18, status: "Active" },
  { name: "Uber", code: "UBR", category: "Ride Now network", color: "#0A1F44", textColor: "#FFFFFF", commission: 18, status: "Active" },
  { name: "Curb", code: "CRB", category: "Ride Now network", color: "#1E8E5A", textColor: "#FFFFFF", commission: 16, status: "Onboarding" },
];

export type PlatformUserStatus = "Active" | "Ridean+" | "Flagged";

export type PlatformUser = {
  name: string;
  email: string;
  joined: string;
  trips: number;
  walletBalance: number;
  status: PlatformUserStatus;
};

export const platformUsers: PlatformUser[] = [
  { name: "Maria Chen", email: "maria.chen@email.com", joined: "Mar 2025", trips: 142, walletBalance: 32.5, status: "Active" },
  { name: "James Okafor", email: "j.okafor@email.com", joined: "Jun 2025", trips: 87, walletBalance: 0, status: "Active" },
  { name: "Priya Nair", email: "priya.nair@email.com", joined: "Jan 2026", trips: 24, walletBalance: 15.0, status: "Ridean+" },
  { name: "Tom Becker", email: "tbecker@email.com", joined: "Aug 2024", trips: 301, walletBalance: 8.2, status: "Active" },
  { name: "Lena Fischer", email: "lena.f@email.com", joined: "Feb 2026", trips: 6, walletBalance: 0, status: "Flagged" },
  { name: "Dev Patel", email: "dev.patel@email.com", joined: "Oct 2025", trips: 58, walletBalance: 12.0, status: "Active" },
];

export type SettlementStatus = "Pending" | "Disputed" | "Paid";

export type Settlement = {
  party: string;
  period: string;
  trips: number;
  gross: number;
  commission: number;
  net: number;
  status: SettlementStatus;
};

export const settlements: Settlement[] = [
  { party: "Diego Alvarez", period: "Oct 13–19", trips: 58, gross: 1240.0, commission: 186.0, net: 1054.0, status: "Pending" },
  { party: "Enterprise", period: "Oct 13–19", trips: 214, gross: 18420.0, commission: 2578.8, net: 15841.2, status: "Pending" },
  { party: "Sixt", period: "Oct 13–19", trips: 96, gross: 9120.0, commission: 1368.0, net: 7752.0, status: "Disputed" },
  { party: "Sophie Mercer", period: "Oct 13–19", trips: 22, gross: 3190.0, commission: 319.0, net: 2871.0, status: "Pending" },
  { party: "Alamo", period: "Oct 6–12", trips: 180, gross: 7420.0, commission: 890.4, net: 6529.6, status: "Paid" },
  { party: "Kwame Osei", period: "Oct 6–12", trips: 41, gross: 2870.0, commission: 430.5, net: 2439.5, status: "Paid" },
];

export type TeamMember = {
  name: string;
  email: string;
  role: string;
  initials: string;
  color: string;
};

export const team: TeamMember[] = [
  { name: "Alex Rivera", email: "alex@bestmyflight.com", role: "Owner", initials: "AR", color: "#0A1F44" },
  { name: "Shakib Haider", email: "shakib@bestmyflight.com", role: "Engineering admin", initials: "SH", color: "#1F4A8C" },
  { name: "Nina Kade", email: "nina@bestmyflight.com", role: "Support agent", initials: "NK", color: "#4A5D78" },
];

export const admin = {
  name: "Alex Rivera",
  role: "Operations Admin",
  initials: "AR",
  email: "alex@bestmyflight.com",
  phone: "+1 (646) 555-0148",
};

export type FaqItem = { q: string; a: string };

export const adminFaqs: FaqItem[] = [
  {
    q: "How do I process a supplier settlement?",
    a: "Go to Settlements, find the supplier's row for the pay period, and click Pay. Disputed settlements must be reviewed and resolved before they can be paid out.",
  },
  {
    q: "How do I suspend a driver?",
    a: "Open Drivers & Suppliers, find the driver, and click Manage on their row. You can suspend, reinstate, or review flagged documents from there.",
  },
  {
    q: "How do I resolve a supplier dispute?",
    a: "Disputed settlements are flagged in both the Dashboard's \"Needs attention\" card and the Settlements table. Click Review on the row to see the disputed trips and contact the supplier.",
  },
  {
    q: "Can I change platform commission rates?",
    a: "Yes — under Settings → Pricing & commission you can adjust the default base fare, per-mile/minute rates, and platform commission. Supplier-specific rates are set under Drivers & Suppliers.",
  },
  {
    q: "How do I add another admin teammate?",
    a: "Go to Settings → Team & roles and click \"Invite teammate\". They'll receive an email invite with a role you assign (Owner, Engineering admin, or Support agent).",
  },
];
