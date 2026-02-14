import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE env vars');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
  auth: { persistSession: false },
});

async function listMusic() {
  try {
    const { data, error } = await supabase.storage.from('Music').list('', { limit: 100 });
    if (error) {
      console.error('Supabase storage error:', error.message || error);
      process.exit(2);
    }
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(3);
  }
}

listMusic();
