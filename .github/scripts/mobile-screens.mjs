// Helper for .github/workflows/mobile-screens.yml.
//   node mobile-screens.mjs seed   → creates a demo customer with a card, an address, wallet funds and a booking;
//                                    prints token=…, booking=…, quote=… for $GITHUB_OUTPUT
//   node mobile-screens.mjs shoot  → screenshots every app route on iPhone 13 and Pixel 7 into ./screens
const API = 'http://localhost:4000';
const WEB = 'http://localhost:8080';

async function call(method, path, body, token) {
  const r = await fetch(API + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`${method} ${path} → ${r.status} ${text}`);
  return text ? JSON.parse(text) : undefined;
}

const inDays = (d, h = 9) => {
  const t = new Date(Date.now() + d * 864e5);
  t.setUTCHours(h, 30, 0, 0);
  return t.toISOString();
};

async function seed() {
  const email = `sara.${Date.now()}@example.com`;
  const { accessToken: t } = await call('POST', '/auth/register', { email, password: 'Passw0rd!!', firstName: 'Sara', lastName: 'Khan', phone: '+12125550111' });
  const card = await call('POST', '/payments/methods/simulated', { number: '4242424242424242', expMonth: 8, expYear: 2029, makeDefault: true }, t);
  await call('POST', '/me/addresses', { label: 'Home', address: '350 W 50th St, New York, NY' }, t);
  await call('POST', '/me/addresses', { label: 'Work', address: '1 World Trade Center, New York, NY' }, t);
  await call('POST', '/wallet/top-up', { amount: 6420 }, t).catch(() => {});
  const passenger = { firstName: 'Sara', lastName: 'Khan', email, phone: '+12125550111' };
  const search = async (body) => (await call('POST', '/quotes/search', body, t)).quotes;
  const air = await search({ service: 'airport_transfer', pickup: { address: 'JFK Airport Terminal 4' }, dropoff: { address: 'The Plaza Hotel, New York' }, pickupAt: inDays(9, 11), tripType: 'one_way', passengers: 2, luggage: 2 });
  const airQuote = air.find((q) => q.price.collectedBy === 'ridean') ?? air[0];
  const { booking } = await call('POST', '/bookings', { quoteId: airQuote.id, passenger, flightNumber: 'BA117', paymentMethodId: card.id }, t);
  const hourly = await search({ service: 'hourly', pickup: { address: 'The Plaza Hotel, New York' }, pickupAt: inDays(13, 14), hours: 4, passengers: 1, luggage: 0 });
  if (hourly[0]) await call('POST', '/bookings', { quoteId: (hourly.find((q) => q.price.collectedBy === 'ridean') ?? hourly[0]).id, passenger, paymentMethodId: card.id }, t).catch(() => {});
  await call('POST', `/bookings/${booking.id}/messages`, { body: 'I will be at the main exit after customs.' }, t).catch(() => {});
  const ride = await search({ service: 'ride_now', pickup: { address: 'Times Square, New York' }, dropoff: { address: 'Brooklyn Bridge Park' }, passengers: 1, luggage: 1 });
  const rideQuote = ride.find((q) => q.price.collectedBy === 'ridean') ?? ride[0];
  console.log(`token=${t}`);
  console.log(`booking=${booking.id}`);
  console.log(`quote=${rideQuote.id}`);
}

async function shoot() {
  const { chromium, devices } = await import('playwright');
  const fs = await import('node:fs');
  const { BOOKING_ID: b, QUOTE_ID: q } = process.env;
  fs.mkdirSync('screens', { recursive: true });
  const routes = [
    ['home', '/'], ['ride', '/book/ride'], ['airport-transfer', '/book/airport-transfer'], ['hourly', '/book/hourly'], ['luxury', '/book/luxury'], ['rent', '/book/rent'],
    ['review', `/checkout/${q}`], ['payment', `/checkout/${q}/pay`],
    ['trips', '/trips'], ['booking-details', `/bookings/${b}`], ['trip-status', `/bookings/${b}/status`], ['contact-driver', `/bookings/${b}/chauffeur`],
    ['edit-booking', `/bookings/${b}/edit`], ['receipt', `/bookings/${b}/receipt`],
    ['wallet', '/wallet'], ['account', '/account'], ['edit-profile', '/account/edit'], ['payment-methods', '/account/payment-methods'],
    ['add-card', '/account/payment-methods/new'], ['addresses', '/account/addresses'], ['business', '/account/business'], ['settings', '/account/settings'],
    ['invoices', '/account/invoices'], ['invoice', `/account/invoices/${b}`], ['help', '/help'], ['legal', '/legal'],
  ];
  const signedOut = [['signin', '/signin'], ['signup', '/signup']];
  const browser = await chromium.launch();
  const report = [];
  for (const [platform, device] of [['ios', devices['iPhone 13']], ['android', devices['Pixel 7']]]) {
    for (const [list, query] of [[routes, ''], [signedOut, '?signedout=1']]) {
      const ctx = await browser.newContext({ ...device });
      const page = await ctx.newPage();
      page.on('pageerror', (e) => report.push(`[${platform}] pageerror ${e.message}`));
      page.on('console', (m) => { if (m.type() === 'error') report.push(`[${platform}] console ${m.text().slice(0, 300)}`); });
      for (const [name, route] of list) {
        await page.goto(`${WEB}/${query}#${route}`, { waitUntil: 'networkidle' }).catch(() => {});
        await page.waitForTimeout(name === 'home' ? 5000 : 3500);
        await page.screenshot({ path: `screens/${platform}-${name}.png` });
        // Full scroll capture: scroll the Flutter view in steps.
        for (let i = 1; i <= 3; i++) {
          await page.mouse.move(device.viewport.width / 2, device.viewport.height / 2);
          await page.mouse.wheel(0, device.viewport.height * 0.8);
          await page.waitForTimeout(700);
          await page.screenshot({ path: `screens/${platform}-${name}-${i}.png` });
        }
        console.log('shot', platform, name);
      }
      await ctx.close();
    }
  }
  fs.writeFileSync('screens/report.txt', report.join('\n') || 'no errors');
  await browser.close();
}

(process.argv[2] === 'seed' ? seed() : shoot()).catch((e) => {
  console.error(e);
  process.exit(1);
});
