import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';
import * as schema from './schema';

// Load apps/api/.env when present (Node >= 20.12); real environment variables take precedence.
try {
  process.loadEnvFile('.env');
} catch {
  /* no .env file — rely on the environment */
}

/**
 * Seeds the supplier catalogue with the commercial terms used in the designs, plus the first admin.
 * Terms are placeholders — replace them with the real agreements in Admin → Supplier accounts.
 */
const SUPPLIERS: (typeof schema.suppliers.$inferInsert)[] = [
  { code: 'curb', name: 'Curb', adapter: 'curb', services: ['ride_now'], inventoryType: 'gross', commissionPct: 7, markupType: 'fixed', markupValue: 250, paymentFlow: 'supplier_collects', settlementCycle: 'monthly', paymentTerms: 'Invoice Net 30' },
  { code: 'sixt', name: 'SIXT', adapter: 'sixt', services: ['rent'], inventoryType: 'net', commissionPct: 0, markupType: 'percent', markupValue: 12, paymentFlow: 'corporate_card', settlementCycle: 'per_booking', paymentTerms: 'Card charged at booking' },
  { code: 'mozio', name: 'Mozio', adapter: 'mozio', services: ['airport_transfer', 'hourly'], inventoryType: 'gross', commissionPct: 10, markupType: 'percent', markupValue: 8, paymentFlow: 'ach_debit', settlementCycle: 'weekly', paymentTerms: 'Net 15' },
  { code: 'priceline', name: 'Priceline', adapter: 'priceline', services: ['rent', 'airport_transfer'], inventoryType: 'net', commissionPct: 0, markupType: 'percent', markupValue: 10, paymentFlow: 'corporate_card', settlementCycle: 'per_booking', paymentTerms: 'Card charged at booking' },
  { code: 'hertz', name: 'Hertz', adapter: 'hertz', services: ['rent'], inventoryType: 'gross', commissionPct: 12, markupType: 'percent', markupValue: 5, paymentFlow: 'ach_debit', settlementCycle: 'weekly', paymentTerms: 'Net 15' },
  {
    code: 'citych', name: 'City Chauffeurs NYC', adapter: 'generic_http', services: ['hourly', 'luxury', 'airport_transfer'], inventoryType: 'net', commissionPct: 0, markupType: 'percent', markupValue: 18, paymentFlow: 'ach_debit', settlementCycle: 'weekly', paymentTerms: 'Net 7',
    config: { searchPath: '/v1/quotes', bookPath: '/v1/bookings', cancelPath: '/v1/bookings/{ref}/cancel' },
  },
];

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  const pool = new Pool({ connectionString: url });
  const db = drizzle(pool, { schema });

  for (const s of SUPPLIERS) {
    const existing = await db.select().from(schema.suppliers).where(eq(schema.suppliers.code, s.code!));
    if (existing.length === 0) {
      await db.insert(schema.suppliers).values(s);
      console.log('Supplier added:', s.name);
    }
  }

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    const found = await db.select().from(schema.users).where(eq(schema.users.email, email.toLowerCase()));
    if (found.length === 0) {
      await db.insert(schema.users).values({
        email: email.toLowerCase(),
        passwordHash: await bcrypt.hash(password, 12),
        firstName: 'Ridean',
        lastName: 'Admin',
        role: 'admin',
      });
      console.log('Admin user created:', email);
    }
  } else {
    console.log('ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin user');
  }
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
