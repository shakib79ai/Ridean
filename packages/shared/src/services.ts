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

export const VEHICLE_CLASSES = [
  { key: 'sedan', label: 'Sedan', example: 'Toyota Camry or similar', passengers: 3, bags: 2 },
  { key: 'xl', label: 'XL', example: 'Toyota Highlander or similar', passengers: 6, bags: 4 },
  { key: 'extra_comfort', label: 'Extra Comfort', example: 'Newer cars, more legroom', passengers: 3, bags: 2 },
  { key: 'business', label: 'Business', example: 'Mercedes E-Class or similar', passengers: 3, bags: 2 },
  { key: 'black', label: 'Black Car Service', example: 'Mercedes S-Class or similar', passengers: 3, bags: 2 },
] as const;
export type VehicleClassKey = (typeof VEHICLE_CLASSES)[number]['key'] | (string & {});
