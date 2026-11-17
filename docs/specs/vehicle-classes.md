# Ridean vehicle classes (shared with Ridean Direct)

One list of classes for every Ridean service and for the Ridean Direct dispatch project
(dispatcher apps, base apps, driver apps, partner API). The names and categories follow
SIXT ride, plus Economy Light, Ride XL and First SUV.

Source of truth in code: `packages/shared/src/services.ts` (`VEHICLE_CLASSES`) and
`apps/mobile/lib/widgets/chauffeur.dart` (`chauffeurClasses`). Keep both in sync.

## Categories

| Category | Who it is for |
|---|---|
| Economy | Lowest price, light luggage |
| Ride | Everyday cars at a great price |
| Business | Black cars with a suited chauffeur |
| First | Top luxury, maximum comfort |

## The 9 classes

| Key (API) | Name | Category | Example car | Passengers | Bags | Hourly rate | Min hours | Airport from |
|---|---|---|---|---|---|---|---|---|
| `economy_light` | Economy Light | Economy | Toyota Corolla or similar | 3 | 1 | $75 | 3 | $95 |
| `ride` | Ride | Ride | Toyota Camry or similar | 3 | 2 | $85 | 3 | $110 |
| `ride_suv` | Ride SUV | Ride | Toyota Highlander or similar | 5 | 4 | $95 | 3 | $125 |
| `ride_xl` | Ride XL | Ride | Toyota Sienna or similar (minivan) | 6 | 5 | $105 | 3 | $140 |
| `ride_xxl` | Ride XXL | Ride | Mercedes Sprinter or similar (van) | 12 | 8 | $195 | 4 | $250 |
| `business` | Business | Business | Mercedes E-Class or similar | 3 | 2 | $100 | 3 | $130 |
| `business_suv` | Business SUV | Business | Chevrolet Suburban or similar | 6 | 4 | $125 | 3 | $165 |
| `first` | First | First | Mercedes S-Class or similar | 3 | 2 | $155 | 3 | $185 |
| `first_suv` | First SUV | First | Cadillac Escalade or similar | 6 | 4 | $150 | 3 | $195 |

Rates are the Ridean company rate card (before the margin customer channels add).

## Which services show which classes

| Service | Classes |
|---|---|
| Ride (on demand, now) | Economy Light, Ride, Ride SUV, Ride XL, Business, First |
| Ride (scheduled), Airport transfer, Hourly chauffeur | All 9 |
| Luxury chauffeur | Business, Business SUV, First, First SUV |
| Rent a car | Rental partners' ACRISS codes map to Economy Light, Ride, Ride SUV/XL, Business, First |

## Old keys → new keys

Older bookings and partner feeds may still send the old keys. Both Ridean and Ridean
Direct must accept them and convert with this table (`normalizeClassKey()` in code).

| Old key | New key |
|---|---|
| `sedan`, `extra_comfort`, `standard_sedan` | `ride` |
| `xl`, `midsize_suv` | `ride_suv` |
| `minivan` | `ride_xl` |
| `executive_van` | `ride_xxl` |
| `business_sedan` | `business` |
| `large_suv` | `business_suv` |
| `black`, `first_sedan` | `first` |
| `premium_suv` | `first_suv` |

## Rules for Ridean Direct

- Bases register each car under exactly one of the 9 keys.
- Job offers, driver apps and the partner API use the keys above and show the names above.
- A booking keeps its class key from the customer app through dispatch to the driver.
- Upgrades go up within a category or to a higher category (Ride → Business → First), never down.
