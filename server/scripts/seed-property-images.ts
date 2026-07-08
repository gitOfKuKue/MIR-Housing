import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const BUCKET = 'property-images';
const ENV_FILE = resolve(__dirname, '../src/.env');

interface PropertyImageRow {
  id: string;
  property_id: string;
  storage_path: string;
  sort_order: number;
}

function loadEnvFile(path: string): void {
  if (!existsSync(path)) {
    return;
  }

  const content = readFileSync(path, 'utf8');

  for (const line of content.split('\n')) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separator = trimmed.indexOf('=');

    if (separator === -1) {
      continue;
    }

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

async function createSupabaseClient(): Promise<SupabaseClient> {
  loadEnvFile(ENV_FILE);

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const email = process.env.SEED_EMAIL ?? process.env.email;
  const password = process.env.SEED_PASSWORD ?? process.env.password;
  const apiBase =
    process.env.API_BASE_URL ?? 'http://localhost:8000/api/v1';

  if (!url) {
    throw new Error('Set SUPABASE_URL in server/src/.env');
  }

  if (serviceRoleKey) {
    return createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  if (!anonKey) {
    throw new Error(
      'Set SUPABASE_SERVICE_ROLE_KEY (recommended) or SUPABASE_ANON_KEY in server/src/.env',
    );
  }

  if (!email || !password) {
    throw new Error(
      'Without SUPABASE_SERVICE_ROLE_KEY, set SEED_EMAIL and SEED_PASSWORD for login.',
    );
  }

  const loginResponse = await fetch(`${apiBase}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!loginResponse.ok) {
    const error = await loginResponse.text();
    throw new Error(`Login failed (${loginResponse.status}): ${error}`);
  }

  const { access_token } = (await loginResponse.json()) as {
    access_token: string;
  };

  return createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${access_token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function downloadPlaceholder(
  propertyId: string,
  sortOrder: number,
): Promise<{ buffer: Buffer; contentType: string }> {
  const seed = `mir-${propertyId.slice(-4)}-${sortOrder}`;
  const response = await fetch(
    `https://picsum.photos/seed/${seed}/1200/800`,
    { redirect: 'follow' },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to download placeholder for ${propertyId}: HTTP ${response.status}`,
    );
  }

  const contentType = response.headers.get('content-type') ?? 'image/jpeg';
  const buffer = Buffer.from(await response.arrayBuffer());

  return { buffer, contentType };
}

async function main(): Promise<void> {
  const supabase = await createSupabaseClient();

  const { data: images, error } = await supabase
    .from('property_images')
    .select('id, property_id, storage_path, sort_order')
    .like('storage_path', 'seed/%')
    .order('property_id', { ascending: true })
    .order('sort_order', { ascending: true });

  if (error) {
    throw new Error(`Failed to load property_images: ${error.message}`);
  }

  const rows = (images ?? []) as PropertyImageRow[];

  if (rows.length === 0) {
    console.error(
      'No seed image rows found. Run server/supabase/seed/009_seed_20_properties_full.sql first.',
    );
    process.exit(1);
  }

  console.log(`Uploading ${rows.length} images to bucket "${BUCKET}"...`);

  let uploaded = 0;

  for (const image of rows) {
    const { buffer, contentType } = await downloadPlaceholder(
      image.property_id,
      image.sort_order,
    );

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(image.storage_path, buffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      throw new Error(
        `Upload failed for ${image.storage_path}: ${uploadError.message}`,
      );
    }

    uploaded += 1;
    console.log(`  [${uploaded}/${rows.length}] ${image.storage_path}`);
  }

  console.log(`Done. ${uploaded} images are now in Supabase Storage.`);
}

main().catch((error: unknown) => {
  console.error('Seed images failed:', error);
  process.exit(1);
});
