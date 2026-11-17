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

/** On-demand Ride Now categories (yellow/green cabs and FHV partners). */
export const RIDE_CLASSES = [
  { key: 'sedan', label: 'Sedan', example: 'Toyota Camry or similar', passengers: 3, bags: 2 },
  { key: 'xl', label: 'XL', example: 'Toyota Highlander or similar', passengers: 6, bags: 4 },
  { key: 'extra_comfort', label: 'Extra Comfort', example: 'Newer cars, more legroom', passengers: 3, bags: 2 },
  { key: 'business', label: 'Business', example: 'Mercedes E-Class or similar', passengers: 3, bags: 2 },
  { key: 'black', label: 'Black Car Service', example: 'Mercedes S-Class or similar', passengers: 3, bags: 2 },
] as const;

export type CarShape = 'sedan' | 'suv' | 'minivan' | 'van';

export interface ChauffeurClass {
  key: string;
  label: string;
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
}

/**
 * The 8 pre-booked classes used by Ridean Direct (dispatch, bases, drivers).
 * Airport transfer, Hourly chauffeur and Luxury chauffeur show exactly these.
 * Keys match the dispatch API, so a booking keeps its class end to end.
 */
export const CHAUFFEUR_CLASSES = [
  { key: 'standard_sedan', label: 'Standard Sedan', example: 'Toyota Camry or similar', passengers: 3, bags: 2, shape: 'sedan', hourlyRate: 8500, minHours: 3, airportFrom: 11000, summary: 'Everyday comfortable car for 1–3 people.', photo: '/img/cls-sedan.jpg' },
  { key: 'business_sedan', label: 'Business Sedan', example: 'Mercedes E-Class or similar', passengers: 3, bags: 3, shape: 'sedan', hourlyRate: 10000, minHours: 3, airportFrom: 13000, summary: 'Black or gray executive car for business travel.', photo: '/img/cls-business.jpg' },
  { key: 'first_sedan', label: 'First Sedan', example: 'Mercedes S-Class or similar', passengers: 3, bags: 3, shape: 'sedan', hourlyRate: 15500, minHours: 3, airportFrom: 18500, summary: 'Top luxury black sedan, chauffeur level.', photo: '/img/cls-black.jpg' },
  { key: 'midsize_suv', label: 'Mid-size SUV', example: 'Toyota Highlander or similar', passengers: 6, bags: 2, shape: 'suv', hourlyRate: 9500, minHours: 3, airportFrom: 12500, summary: '7 seats: 6 people with 2 bags, or 3 people with 4 bags.', photo: '/img/cls-xl.jpg' },
  { key: 'minivan', label: 'Minivan', example: 'Toyota Sienna or similar', passengers: 6, bags: 5, shape: 'minivan', hourlyRate: 10500, minHours: 3, airportFrom: 14000, summary: 'Sliding doors and room for families with luggage.', photo: '/img/cls-xl.jpg' },
  { key: 'large_suv', label: 'Business SUV', example: 'Chevrolet Suburban or similar', passengers: 6, bags: 6, shape: 'suv', hourlyRate: 12500, minHours: 3, airportFrom: 16500, summary: 'Black or gray full-size SUV for groups with luggage.', photo: '/img/cls-xl.jpg' },
  { key: 'premium_suv', label: 'Premium SUV', example: 'Cadillac Escalade or similar', passengers: 6, bags: 6, shape: 'suv', hourlyRate: 15000, minHours: 3, airportFrom: 19500, summary: 'Luxury black full-size SUV, VIP level.', photo: '/img/cls-suv-black.jpg' },
  { key: 'executive_van', label: 'Executive Van', example: 'Mercedes Sprinter or similar', passengers: 12, bags: 12, shape: 'van', hourlyRate: 19500, minHours: 4, airportFrom: 25000, summary: 'Large van for groups of up to 12 with luggage.', photo: '/img/cls-suv-black.jpg' },
] as const satisfies readonly ChauffeurClass[];

/** Every class any Ridean service can return (label lookup). */
export const VEHICLE_CLASSES = [...RIDE_CLASSES, ...CHAUFFEUR_CLASSES] as const;

/** Services that use the 8 chauffeur classes. */
export const CHAUFFEUR_SERVICES: readonly ServiceKey[] = ['airport_transfer', 'hourly', 'luxury'];
export const HOURLY_MIN_HOURS = 3;
export const HOURLY_MAX_HOURS = 12;
/** Miles included per booked hour; extra miles are billed per started mile. */
export const HOURLY_INCLUDED_MILES = 15;

export function chauffeurClass(key: string | undefined): ChauffeurClass | undefined {
  return (CHAUFFEUR_CLASSES as readonly ChauffeurClass[]).find((c) => c.key === key);
}
/** Minimum bookable hours for a class (Executive Van is 4). */
export function minHoursFor(key?: string): number {
  return chauffeurClass(key)?.minHours ?? HOURLY_MIN_HOURS;
}
export type VehicleClassKey = (typeof VEHICLE_CLASSES)[number]['key'] | (string & {});
