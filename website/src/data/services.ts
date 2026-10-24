export type Service = {
  slug: string;
  icon: string;
  iconBg: string;
  name: string;
  shortDesc: string;
  longDesc: string;
  fromPrice: string;
};

export const services: Service[] = [
  {
    slug: "ride-now",
    icon: "🚕",
    iconBg: "#0A1F44",
    name: "Ride Now",
    shortDesc: "On-demand rides for everyday trips across the city.",
    longDesc:
      "On-demand rides for everyday trips. Choose Sedan, XL, Extra Comfort, Business or Black Car — matched instantly, priced upfront.",
    fromPrice: "$18.40",
  },
  {
    slug: "airport-transfers",
    icon: "✈️",
    iconBg: "#1F4A8C",
    name: "Airport Transfers",
    shortDesc: "Flight-synced pickups, round trip, with flight tracking.",
    longDesc:
      "Flight-synced pickup and drop-off with live tracking — your driver adjusts automatically if your flight is delayed.",
    fromPrice: "$74.00",
  },
  {
    slug: "hourly-chauffeur",
    icon: "🕐",
    iconBg: "#12305F",
    name: "Hourly Chauffeur",
    shortDesc: "Reserve a vehicle and driver by the hour.",
    longDesc:
      "Reserve a vehicle and professional driver by the hour — 3, 4, 6 or 8-hour blocks for meetings, errands or a full day out.",
    fromPrice: "$45/hr",
  },
  {
    slug: "luxury-chauffeur",
    icon: "🚘",
    iconBg: "#0A1F44",
    name: "Luxury Chauffeur",
    shortDesc: "Premium vehicles for business, airport & events.",
    longDesc:
      "Mercedes S-Class, Escalade and Sprinter vans with professional chauffeurs for business travel, airport runs and events.",
    fromPrice: "$145",
  },
  {
    slug: "car-rentals",
    icon: "🔑",
    iconBg: "#1F4A8C",
    name: "Car Rentals",
    shortDesc: "Compare prices across SIXT, Enterprise & Alamo.",
    longDesc:
      "Compare live prices across SIXT, Enterprise and Alamo in one search — book the best deal, taxes and fees included.",
    fromPrice: "$39/day",
  },
];
