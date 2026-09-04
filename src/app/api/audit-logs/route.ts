import { NextResponse } from 'next/server';
import { getCurrentUserFromCookie } from '@/lib/auth';
import { getAuditLogs, createAuditLog } from '@/lib/db';
import { getClientInfo } from '@/lib/audit';
import { AuditAction, AuditResourceType } from '@/types';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUserFromCookie();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || undefined;
    const resourceType = searchParams.get('resourceType') || undefined;
    const search = searchParams.get('search') || undefined;

    // Se for clínica, visualiza apenas os logs de ações ligadas à sua conta
    const userIdFilter = user.role === 'CLINIC' ? user.userId : (searchParams.get('userId') || undefined);

    const logs = getAuditLogs({
      action,
      resourceType,
      userId: userIdFilter,
      search
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Fetch audit logs error:', error);
    return NextResponse.json({ error: 'Erro ao buscar logs de auditoria' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUserFromCookie();
    const body = await request.json();
    const { action, resourceType, resourceId, details } = body as {
      action: AuditAction;
      resourceType: AuditResourceType;
      resourceId?: string;
      details: string;
    };

    if (!action || !resourceType || !details) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 });
    }

    const { ip, userAgent } = getClientInfo(request);

    const log = createAuditLog({
      userId: user?.userId,
      userName: user?.name || user?.clinicName || 'Usuário Não Autenticado',
      userRole: user?.role,
      userEmail: user?.email,
      action,
      resourceType,
      resourceId,
      details,
      ipAddress: ip,
      userAgent: userAgent.slice(0, 150)
    });

    return NextResponse.json({ success: true, log });
  } catch (error) {
    console.error('Create audit log error:', error);
    return NextResponse.json({ error: 'Erro ao registrar evento de auditoria' }, { status: 500 });
  }
}
