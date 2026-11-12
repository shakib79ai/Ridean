# Ridean brand kit

The Ridean logo: a gold car outline with a wheel, the gold **Ridean** wordmark and the slogan **RIDE | TRANSFER | RENT** in white, on deep emerald. Every file carries the Ridean name.

| Folder | Files |
|---|---|
| `1-logo/` | Full logo, transparent PNG: gold for dark backgrounds, gold for light backgrounds, white, black, dark green. Full logo on emerald, black, white and cream (PNG + JPEG). |
| `1-logo/compact-without-slogan/` | Car + Ridean without the slogan, for small spaces (dark, light, white) |
| `2-social-media/` | Profile picture 1080×1080, Instagram post 1080×1080 and portrait 1080×1350, story 1080×1920, covers for Facebook (1640×624), X (1500×500), LinkedIn (1584×396), YouTube (2560×1440), website share image (1200×630), email signature (1200×320) |
| `3-app-icons/` | App icon 1024 (square and rounded), Android adaptive foreground, PWA icons 512 / maskable 512 / 192, Apple touch icon 180 |
| `4-favicon/` | `favicon.ico` (16/32/48) and PNG favicons. The tab icon is too small for the word, so it uses the R of the Ridean wordmark. |

Colours: emerald `#112E18`, gold `#E9B949` (gradient `#FBE08C` → `#C08C22`), white slogan `#FFFFFF`, dark green `#0E3B22` for light backgrounds.

Usage: full logo wherever it fits; compact logo when the slogan would be under about 8 px tall; keep clear space equal to the wheel height; full logo at least 160 px wide on screen. Don't stretch, recolour or rearrange the logo.

Where it is used: website, PWA and admin headers and sign-in pages (`public/brand/`), Next.js `favicon.ico` / `icon.png` / `apple-icon.png` / `opengraph-image.png`, PWA manifest icons, and the Flutter app (`assets/images/logo*.png`, launcher icons from `assets/brand/` via `flutter_launcher_icons`).
