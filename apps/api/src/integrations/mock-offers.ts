import { createHash } from 'crypto';
import { CHAUFFEUR_CLASSES, CHAUFFEUR_SERVICES, LUXURY_CLASS_KEYS, RIDE_CLASSES, chauffeurClass, normalizeClassKey, type QuoteSearchRequest, type ServiceKey } from '@ridean/shared';
import type { SupplierOffer } from './supplier-adapter';

/**
 * Deterministic sample offers used when SUPPLIER_MODE=mock or a supplier has no credentials yet.
 * The same search always returns the same prices, so the UI and tests are stable.
 */
export function mockOffers(supplierCode: string, req: QuoteSearchRequest, currency: string): SupplierOffer[] {
  const seed = hash(`${supplierCode}|${req.service}|${req.pickup?.address}|${req.dropoff?.address ?? ''}|${req.hours ?? ''}`);
  const km = 6 + (seed % 38);
  const base = baseFare(req.service, km, req);
  const classes = classesFor(req.service, req.vehicleClass);
  return classes.map((c, i) => {
    // Every class scales with the Ridean rate card (Business = 1).
    const cc = chauffeurClass(c.key);
    let factor = cc ? cc.hourlyRate / 10000 : 1 + i * 0.25;
    // A class with a higher minimum (Ride XXL: 4 h) is priced for its minimum hours.
    if (cc && req.service === 'hourly') factor *= Math.max(cc.minHours, req.hours ?? 3) / Math.max(3, req.hours ?? 3);
    const jitter = 1 + ((seed >> (i + 2)) % 9) / 100;
    return {
      offerId: `${supplierCode}-${c.key}-${seed.toString(36)}`,
      vehicle: { class: c.key, name: c.example, passengers: c.passengers, bags: c.bags },
      price: Math.round(base * factor * jitter),
      currency,
      etaMinutes: req.service === 'ride_now' ? 3 + (seed % 9) : undefined,
      durationMinutes: req.service === 'rent' ? undefined : Math.round(km * 2.4),
      distanceKm: req.service === 'rent' ? undefined : km,
      cancellation: req.service === 'rent' ? 'Free cancellation up to 48 hours before pick-up' : 'Free cancellation up to 1 hour before pickup',
      inclusions: inclusionsFor(req.service),
      meta: { mock: true },
    } satisfies SupplierOffer;
  });
}

function baseFare(service: ServiceKey, km: number, req: QuoteSearchRequest): number {
  switch (service) {
    case 'ride_now':
      return 350 + km * 190;
    case 'airport_transfer':
      return (4500 + km * 160) * (req.tripType === 'return' ? 1.9 : 1);
    case 'hourly':
      // Business hourly rate; other classes scale by their rate.
      return 10000 * Math.max(3, req.hours ?? 3);
    case 'luxury':
      // Business trip price; First and the SUVs scale by their rate.
      return 6500 + km * 220;
    case 'rent': {
      const days = req.rentalPickupAt && req.rentalReturnAt ? Math.max(1, Math.ceil((Date.parse(req.rentalReturnAt) - Date.parse(req.rentalPickupAt)) / 86_400_000)) : 3;
      return 4200 * days;
    }
    default:
      return 5000 + km * 200;
  }
}

function classesFor(service: ServiceKey, wanted?: string) {
  const all: { key: string; example: string; passengers: number; bags: number }[] = CHAUFFEUR_SERVICES.includes(service) ? [...CHAUFFEUR_CLASSES] : [...RIDE_CLASSES];
  if (wanted) return all.filter((c) => c.key === normalizeClassKey(wanted));
  if (service === 'luxury') return all.filter((c) => LUXURY_CLASS_KEYS.includes(c.key));
  return all;
}

function inclusionsFor(service: ServiceKey): string[] {
  switch (service) {
    case 'airport_transfer':
      return ['Meet & greet', 'Flight tracking', '60 min free waiting'];
    case 'hourly':
      return ['Dedicated chauffeur', 'Unlimited stops', 'Free waiting'];
    case 'luxury':
      return ['Vetted chauffeur', 'Bottled water', '15 min free waiting'];
    case 'rent':
      return ['Unlimited miles', 'Collision damage waiver', 'Free cancellation'];
    default:
      return ['Upfront price', 'No surge'];
  }
}

function hash(s: string): number {
  return parseInt(createHash('sha1').update(s).digest('hex').slice(0, 8), 16);
}
