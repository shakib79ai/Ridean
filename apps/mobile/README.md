# Ridean mobile (Flutter)

iOS and Android app for Ridean customers: search every service (Ride Now, Airport transfer, Rent a car, Hourly and Luxury chauffeur), compare supplier quotes, pay with Stripe PaymentSheet / Apple Pay / Google Pay or the Ridean wallet, and manage trips.

> **Status:** written against the same REST API as the website and PWA, but it has **not been compiled** in this repository's CI (no Flutter SDK there). Run `flutter analyze` and a device build before release.

## First-time setup

The repo contains only `lib/`, `assets/` and `pubspec.yaml`. Generate the native platform folders once:

```bash
cd apps/mobile
flutter create --org com.ridean --project-name ridean --platforms=ios,android .
flutter pub get
```

Then apply the platform settings flutter_stripe needs:

- **Android** — `android/app/build.gradle`: `minSdkVersion 21`; `MainActivity` must extend `FlutterFragmentActivity`; use a `Theme.AppCompat` / `Theme.MaterialComponents` app theme.
- **iOS** — `ios/Podfile`: `platform :ios, '13.0'`. Add your Apple Pay merchant ID capability if you use Apple Pay.

## Run

```bash
flutter run \
  --dart-define=API_URL=http://10.0.2.2:4000 \
  --dart-define=STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

`10.0.2.2` is the host machine from the Android emulator; use `http://localhost:4000` on the iOS simulator. With the API in `PAYMENTS_MODE=simulated`, leave the Stripe key empty — bookings confirm without a payment sheet.

## Release builds

```bash
flutter build appbundle --dart-define=API_URL=https://api.ridean.com --dart-define=STRIPE_PUBLISHABLE_KEY=pk_live_xxx
flutter build ipa       --dart-define=API_URL=https://api.ridean.com --dart-define=STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

## Structure

| Path | What |
|---|---|
| `lib/config.dart` | Build-time settings (`--dart-define`) |
| `lib/theme.dart` | Emerald & Pure Gold theme (mirrors `packages/shared/src/tokens.ts`) |
| `lib/api/` | Models and the typed REST client (mirrors `packages/shared`) |
| `lib/state/providers.dart` | Riverpod providers and auth |
| `lib/router.dart` | go_router routes and sign-in redirects |
| `lib/screens/` | Home, search (one adaptive form for every service), quotes, checkout, booking, trips, wallet, account, sign in/up |

## Adding a service

Add it to `SERVICES` in `packages/shared/src/services.ts` (web) and to `services` in `lib/api/models.dart` (mobile). Suppliers serving it are configured in the admin; no other app changes are needed.
