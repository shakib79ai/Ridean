/**
 * Service catalogue. Every bookable product ("service head") lives here so the API,
 * the web apps and the admin agree on keys, labels and which search fields apply.
 *
 * To add a new service later (e.g. "shuttle", "intercity"), add an entry below and
 * register at least one supplier adapter that declares support for the new key.
 */
export const SERVICE_KEYS = ['ride_now', 'airport_transfer', 'rent', 'hourly', 'luxury'] as const;
export type CoreServiceKey = (typeof SERVICE_KEYS)[number];
/** Open string type so new services can be added without a breaking change. */
export type ServiceKey = CoreServiceKey | (string & {});

export type SearchField =
  | 'pickup'
  | 'dropoff'
  | 'when'
  | 'tripType'
  | 'returnAt'
  | 'flightNumber'
  | 'passengers'
  | 'luggage'
  | 'hours'
  | 'rentalPickupAt'
  | 'rentalReturnAt'
  | 'returnLocation'
  | 'vehicleClass';

export interface ServiceDefinition {
  key: ServiceKey;
  label: string;
  shortLabel: string;
  tagline: string;
  /** Path segment used by the web apps, e.g. /airport-transfer */
  slug: string;
  fields: SearchField[];
  /** On-demand services can be booked "now"; others are always pre-booked. */
  supportsNow: boolean;
}

export const SERVICES: Record<CoreServiceKey, ServiceDefinition> = {
  ride_now: {
    key: 'ride_now',
    label: 'Ride Now',
    shortLabel: 'Ride',
    tagline: 'On-demand and scheduled rides with upfront prices.',
    slug: 'ride',
    fields: ['pickup', 'dropoff', 'when', 'passengers'],
    supportsNow: true,
  },
  airport_transfer: {
    key: 'airport_transfer',
    label: 'Airport transfer',
    shortLabel: 'Transfer',
    tagline: 'Flight-tracked pickups with meet & greet, one way or return.',
    slug: 'airport-transfer',
    fields: ['tripType', 'pickup', 'dropoff', 'flightNumber', 'when', 'returnAt', 'passengers', 'luggage'],
    supportsNow: false,
  },
  rent: {
    key: 'rent',
    label: 'Rent a car',
    shortLabel: 'Rent',
    tagline: 'Compare rental partners in one search.',
    slug: 'rent',
    fields: ['pickup', 'returnLocation', 'rentalPickupAt', 'rentalReturnAt', 'vehicleClass'],
    supportsNow: false,
  },
  hourly: {
    key: 'hourly',
    label: 'Hourly chauffeur',
    shortLabel: 'Hourly',
    tagline: 'A dedicated car and chauffeur, booked by the hour.',
    slug: 'hourly',
    fields: ['pickup', 'when', 'hours', 'vehicleClass', 'passengers'],
    supportsNow: false,
  },
  luxury: {
    key: 'luxury',
    label: 'Luxury chauffeur',
    shortLabel: 'Luxury',
    tagline: 'First-class cars such as the S-Class, 7 Series and Range Rover.',
    slug: 'luxury',
    fields: ['pickup', 'dropoff', 'when', 'vehicleClass', 'passengers'],
    supportsNow: false,
  },
};

export const SERVICE_LIST: ServiceDefinition[] = SERVICE_KEYS.map((k) => SERVICES[k]);

export function serviceBySlug(slug: string): ServiceDefinition | undefined {
  return SERVICE_LIST.find((s) => s.slug === slug);
}

export function serviceLabel(key: ServiceKey): string {
  return (SERVICES as Record<string, ServiceDefinition>)[key]?.label ?? key;
}

export type CarShape = 'sedan' | 'suv' | 'minivan' | 'van';

/** The four class categories, cheapest first (same structure as SIXT ride). */
export type ClassCategory = 'economy' | 'ride' | 'business' | 'first';
export const CLASS_CATEGORIES: readonly { key: ClassCategory; label: string; summary: string }[] = [
  { key: 'economy', label: 'Economy', summary: 'Lowest price, light luggage' },
  { key: 'ride', label: 'Ride', summary: 'Everyday cars at a great price' },
  { key: 'business', label: 'Business', summary: 'Black cars with a suited chauffeur' },
  { key: 'first', label: 'First', summary: 'Top luxury, maximum comfort' },
];

export interface ChauffeurClass {
  key: string;
  label: string;
  category: ClassCategory;
  example: string;
  passengers: number;
  bags: number;
  shape: CarShape;
  /** Company hourly rate in cents (Ridean rate card; customer channels add their margin). */
  hourlyRate: number;
  minHours: number;
  /** Lowest airport fare in cents (JFK/LGA/EWR), shown as "from". */
  airportFrom: number;
  summary: string;
  /** Studio photo served by the website and PWA under /img. */
  photo: string;
  /** Also offered for on-demand Ride (Ride Now). */
  rideNow: boolean;
}

/**
 * Ridean's 9 vehicle classes — one list for every service and for Ridean Direct
 * (dispatch, bases, drivers). Names and categories follow SIXT ride
 * (Ride, Business, First, Ride SUV, Business SUV, Ride XXL) plus Economy Light,
 * Ride XL (minivan) and First SUV. Keys are the dispatch API keys.
 */
export const VEHICLE_CLASSES = [
  { key: 'economy_light', label: 'Economy Light', category: 'economy', example: 'Toyota Corolla or similar', passengers: 3, bags: 1, shape: 'sedan', hourlyRate: 7500, minHours: 3, airportFrom: 9500, summary: 'Lowest price for light travellers.', photo: '/img/cls-comfort.jpg', rideNow: true },
  { key: 'ride', label: 'Ride', category: 'ride', example: 'Toyota Camry or similar', passengers: 3, bags: 2, shape: 'sedan', hourlyRate: 8500, minHours: 3, airportFrom: 11000, summary: 'Reliable everyday car at a great price.', photo: '/img/cls-sedan.jpg', rideNow: true },
  { key: 'ride_suv', label: 'Ride SUV', category: 'ride', example: 'Toyota Highlander or similar', passengers: 5, bags: 4, shape: 'suv', hourlyRate: 9500, minHours: 3, airportFrom: 12500, summary: 'More room in a comfortable SUV.', photo: '/img/cls-xl.jpg', rideNow: true },
  { key: 'ride_xl', label: 'Ride XL', category: 'ride', example: 'Toyota Sienna or similar', passengers: 6, bags: 5, shape: 'minivan', hourlyRate: 10500, minHours: 3, airportFrom: 14000, summary: 'Minivan for families and extra luggage.', photo: '/img/cls-xl.jpg', rideNow: true },
  { key: 'ride_xxl', label: 'Ride XXL', category: 'ride', example: 'Mercedes Sprinter or similar', passengers: 12, bags: 8, shape: 'van', hourlyRate: 19500, minHours: 4, airportFrom: 25000, summary: 'Van for larger group transfers, up to 12.', photo: '/img/cls-suv-black.jpg', rideNow: false },
  { key: 'business', label: 'Business', category: 'business', example: 'Mercedes E-Class or similar', passengers: 3, bags: 2, shape: 'sedan', hourlyRate: 10000, minHours: 3, airportFrom: 13000, summary: 'Black executive sedan with a suited chauffeur.', photo: '/img/cls-business.jpg', rideNow: true },
  { key: 'business_suv', label: 'Business SUV', category: 'business', example: 'Chevrolet Suburban or similar', passengers: 6, bags: 4, shape: 'suv', hourlyRate: 12500, minHours: 3, airportFrom: 16500, summary: 'Black full-size SUV with a suited chauffeur.', photo: '/img/cls-xl.jpg', rideNow: false },
  { key: 'first', label: 'First', category: 'first', example: 'Mercedes S-Class or similar', passengers: 3, bags: 2, shape: 'sedan', hourlyRate: 15500, minHours: 3, airportFrom: 18500, summary: 'Top luxury sedan with maximum comfort.', photo: '/img/cls-black.jpg', rideNow: true },
  { key: 'first_suv', label: 'First SUV', category: 'first', example: 'Cadillac Escalade or similar', passengers: 6, bags: 4, shape: 'suv', hourlyRate: 15000, minHours: 3, airportFrom: 19500, summary: 'Luxury flagship SUV for VIP travel.', photo: '/img/cls-suv-black.jpg', rideNow: false },
] as const satisfies readonly ChauffeurClass[];

/** Pre-booked services (Airport transfer, Hourly, Luxury) offer all 9 classes. */
export const CHAUFFEUR_CLASSES = VEHICLE_CLASSES;

/** On-demand Ride offers the cars partners can send right away. */
export const RIDE_CLASSES = VEHICLE_CLASSES.filter((c) => c.rideNow);

/** Old class keys (before the SIXT-style names) → new keys, so older bookings and partner feeds still resolve. */
export const LEGACY_CLASS_KEYS: Readonly<Record<string, string>> = {
  sedan: 'ride',
  extra_comfort: 'ride',
  xl: 'ride_suv',
  black: 'first',
  standard_sedan: 'ride',
  business_sedan: 'business',
  first_sedan: 'first',
  midsize_suv: 'ride_suv',
  minivan: 'ride_xl',
  large_suv: 'business_suv',
  premium_suv: 'first_suv',
  executive_van: 'ride_xxl',
};
export const normalizeClassKey = (key: string): string => LEGACY_CLASS_KEYS[key] ?? key;

/** Classes offered for Luxury chauffeur (point-to-point, first-class). */
export const LUXURY_CLASS_KEYS: readonly string[] = ['business', 'business_suv', 'first', 'first_suv'];

/** Services that use the full class list. */
export const CHAUFFEUR_SERVICES: readonly ServiceKey[] = ['airport_transfer', 'hourly', 'luxury'];
export const HOURLY_MIN_HOURS = 3;
export const HOURLY_MAX_HOURS = 12;
/** Miles included per booked hour; extra miles are billed per started mile. */
export const HOURLY_INCLUDED_MILES = 15;

export function chauffeurClass(key: string | undefined): ChauffeurClass | undefined {
  if (!key) return undefined;
  const k = normalizeClassKey(key);
  return (VEHICLE_CLASSES as readonly ChauffeurClass[]).find((c) => c.key === k);
}
/** Display name for any class key, old or new ("business_sedan" → "Business"). */
export function vehicleClassLabel(key: string): string {
  return chauffeurClass(key)?.label ?? key.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
}
/** Minimum bookable hours for a class (Ride XXL is 4). */
export function minHoursFor(key?: string): number {
  return chauffeurClass(key)?.minHours ?? HOURLY_MIN_HOURS;
}
export type VehicleClassKey = (typeof VEHICLE_CLASSES)[number]['key'] | (string & {});
