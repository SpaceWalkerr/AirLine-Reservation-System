import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    '⚠️ Missing Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).\n' +
    'Create a .env file in the project root with your Supabase credentials.\n' +
    'The app will render but database features will not work.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
