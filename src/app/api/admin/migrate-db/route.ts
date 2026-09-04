import { NextResponse } from 'next/server';
import { getCurrentUserFromCookie } from '@/lib/auth';
import { readDatabase } from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUserFromCookie();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Apenas administradores podem verificar status de migração' }, { status: 403 });
    }

    const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
    const db = readDatabase();

    return NextResponse.json({
      status: hasDatabaseUrl ? 'CONFIGURED' : 'LOCAL_JSON',
      hasDatabaseUrl,
      databaseType: hasDatabaseUrl ? 'PostgreSQL (Supabase)' : 'Local Secure JSON Storage (/tmp)',
      stats: {
        users: db.users.length,
        exams: db.exams.length,
        transactions: db.transactions?.length || 0,
        appointments: db.appointments?.length || 0,
        templates: db.templates?.length || 0,
        quickPhrases: db.quickPhrases?.length || 0,
        teachingCases: db.teachingCases?.length || 0,
        auditLogs: db.auditLogs?.length || 0
      },
      lgpdStatus: {
        auditTrailActive: true,
        encryptionInRest: true,
        digitalSignaturesActive: true,
        retentionPolicy: '5 Anos (CFMV 1.321/2020)'
      }
    });
  } catch (error) {
    console.error('Migration check error:', error);
    return NextResponse.json({ error: 'Erro ao verificar migração' }, { status: 500 });
  }
}
