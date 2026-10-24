# Ridean — Flutter app (iOS + Android)

This is a single Flutter codebase producing both the iOS and Android apps, built to match
the Ridean design system (navy `#0A1F44` / yellow `#F4B000`), feature set and flows already
established on web, PWA and the earlier React Native prototype:

- Sign In / Create Account (checkered-flag + navy hero pattern)
- Home (mode tiles, upcoming trip, more-ways-to-ride)
- Ride Now, Airport Transfer
- Hourly Chauffeur, Luxury Chauffeur, Compare Rentals (multi-supplier)
- Trips, Wallet (credits + saved payment methods), Profile

All data is mocked locally (`lib/data/mock.dart`) — there is no backend wired up yet,
matching the "mockups + working UI, no live payments/suppliers" scope agreed for this pass.

## ⚠️ Not yet verified in this environment

This code was written by hand in a sandboxed cloud session that has **no network access to
`storage.googleapis.com`**, which is where the Flutter SDK's engine/Dart artifacts are
hosted. That means the Flutter SDK itself could not be installed here, so none of the
following could be run in this session:

- `flutter create .` (to generate the `android/` and `ios/` platform folders)
- `flutter pub get`
- `flutter analyze`
- `flutter run` / `flutter build`

**Before you use this project, run on your own machine (with Flutter installed):**

```bash
cd ridean_flutter
flutter create . --platforms=ios,android --org com.bestmyflight   # generates android/ and ios/
flutter pub get
flutter analyze     # fix anything it flags — this code has not been compiler-checked
flutter run
```

The Dart source was written carefully (consistent with Flutter 3.19+/Dart 3.3+ syntax —
records, null-safety, Material 3), but since it has never been compiled, treat
`flutter analyze`'s output as the first real check and fix forward from there.

## Structure

```
lib/
  main.dart                 — app entry, MaterialApp, theme
  theme/tokens.dart          — RColors / RSpacing / RRadius / rideanTheme()
  data/mock.dart             — all mock data (vehicles, trips, wallet, user)
  widgets/
    hero_header.dart         — CheckeredFlag, HeroHeader, RSheet
    common.dart               — RButton, RCard, RPill, RField, RSectionHeader, RDivider
    app_shell.dart            — bottom-tab shell (Home / Trips / Wallet / Profile)
  screens/
    sign_in_screen.dart, create_account_screen.dart
    home_screen.dart, ride_now_screen.dart, airport_transfer_screen.dart
    hourly_chauffeur_screen.dart, luxury_chauffeur_screen.dart, rent_compare_screen.dart
    trips_screen.dart, wallet_screen.dart, profile_screen.dart, trip_status_screen.dart
```

No third-party packages are used beyond `flutter_lints` (dev-only), so `flutter pub get`
should resolve offline once the SDK itself is installed.
