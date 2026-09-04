import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

export const supabaseUrl = rawUrl.replace(/^["']|["']$/g, '').trim();
export const supabaseAnonKey = rawKey.replace(/^["']|["']$/g, '').trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseUrl.startsWith('http') && 
  supabaseAnonKey && 
  supabaseAnonKey.length > 20
);

if (!isSupabaseConfigured) {
  console.warn('Aviso: Variaveis SUPABASE_URL ou SUPABASE_ANON_KEY nao configuradas ou invalidas.');
}

export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-key'
);