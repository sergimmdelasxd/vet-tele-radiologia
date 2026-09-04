import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured, supabaseUrl, supabaseAnonKey } from '@/lib/supabase';

export async function GET() {
  const result: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    isSupabaseConfigured,
    urlPrefix: supabaseUrl ? supabaseUrl.slice(0, 25) + '...' : 'NOT_CONFIGURED',
    anonKeyPrefix: supabaseAnonKey ? supabaseAnonKey.slice(0, 15) + '...' : 'NOT_CONFIGURED',
  };

  if (!isSupabaseConfigured) {
    return NextResponse.json({
      status: 'CONFIG_MISSING',
      message: 'Variaveis de ambiente SUPABASE_URL ou SUPABASE_ANON_KEY nao estao disponiveis neste deploy.',
      details: result
    }, { status: 200 });
  }

  try {
    const { count, error, data } = await supabase
      .from('users')
      .select('id, name, email, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      return NextResponse.json({
        status: 'SUPABASE_ERROR',
        error: error.message,
        details: error,
        config: result
      }, { status: 500 });
    }

    return NextResponse.json({
      status: 'HEALTHY',
      usersInCloud: count,
      latestUsers: data,
      config: result
    }, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      status: 'FATAL_EXCEPTION',
      error: msg,
      config: result
    }, { status: 500 });
  }
}
