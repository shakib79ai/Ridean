import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as path from 'path';

// Load apps/api/.env when present (Node >= 20.12); real environment variables take precedence.
try {
  process.loadEnvFile('.env');
} catch {
  /* no .env file — rely on the environment */
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  const pool = new Pool({ connectionString: url });
  const db = drizzle(pool);
  // Works from both src (ts-node) and dist (compiled): migrations live in apps/api/drizzle
  const migrationsFolder = path.resolve(__dirname, '..', '..', 'drizzle');
  await migrate(db, { migrationsFolder });
  await pool.end();
  console.log('Migrations applied from', migrationsFolder);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
