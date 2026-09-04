import { NextRequest } from 'next/server';
import { createAuditLog } from './db';
import { AuditAction, AuditResourceType, User } from '@/types';

export function getClientInfo(req?: Request | NextRequest | Headers) {
  let ip = '127.0.0.1';
  let userAgent = 'Unknown Device';

  if (!req) return { ip, userAgent };

  try {
    const headers = 'headers' in req ? req.headers : req;
    const xForwardedFor = headers.get('x-forwarded-for');
    const xRealIp = headers.get('x-real-ip');
    const cfConnectingIp = headers.get('cf-connecting-ip');
    
    ip = cfConnectingIp || (xForwardedFor ? xForwardedFor.split(',')[0].trim() : null) || xRealIp || '127.0.0.1';
    userAgent = headers.get('user-agent') || 'Unknown Device';
  } catch {}

  return { ip, userAgent };
}

export function recordAuditTrail(params: {
  user?: Partial<User> | null;
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId?: string;
  details: string;
  req?: Request | Headers;
}) {
  const { ip, userAgent } = getClientInfo(params.req);

  try {
    return createAuditLog({
      userId: params.user?.id,
      userName: params.user?.name || params.user?.clinicName,
      userRole: params.user?.role,
      userEmail: params.user?.email,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      details: params.details,
      ipAddress: ip,
      userAgent: userAgent.slice(0, 150)
    });
  } catch (err) {
    console.error('Falha ao registrar log de auditoria LGPD:', err);
    return null;
  }
}
