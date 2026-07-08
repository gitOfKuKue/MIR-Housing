import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:8000/api/v1';
const EMAIL = process.env.SEED_EMAIL ?? process.env.email;
const PASSWORD = process.env.SEED_PASSWORD ?? process.env.password;
const SEED_FILE =
  process.env.SEED_FILE ??
  resolve(__dirname, '../supabase/seed/hcmc-properties-mock.json');

async function main(): Promise<void> {
  if (!EMAIL || !PASSWORD) {
    console.error(
      'Set SEED_EMAIL and SEED_PASSWORD (or email/password) before running seed.',
    );
    process.exit(1);
  }

  const properties = JSON.parse(readFileSync(SEED_FILE, 'utf8')) as unknown[];

  if (!Array.isArray(properties) || properties.length === 0) {
    console.error('Seed file must contain a non-empty JSON array.');
    process.exit(1);
  }

  const loginResponse = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });

  if (!loginResponse.ok) {
    const error = await loginResponse.text();
    console.error(`Login failed (${loginResponse.status}):`, error);
    process.exit(1);
  }

  const { access_token } = (await loginResponse.json()) as {
    access_token: string;
  };

  const bulkResponse = await fetch(`${API_BASE}/properties/bulk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${access_token}`,
    },
    body: JSON.stringify({ properties }),
  });

  if (!bulkResponse.ok) {
    const error = await bulkResponse.text();
    console.error(`Bulk create failed (${bulkResponse.status}):`, error);
    process.exit(1);
  }

  const result = (await bulkResponse.json()) as {
    meta: { created: number };
  };

  console.log(`Successfully created ${result.meta.created} properties.`);
}

main().catch((error: unknown) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
