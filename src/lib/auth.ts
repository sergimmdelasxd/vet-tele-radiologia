import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { User } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'vet-teleradiologia-jwt-secret-key-2026-xyz-super-secure';
export const COOKIE_NAME = 'vet_tele_token';

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  role: 'CLINIC' | 'RADIOLOGIST' | 'ADMIN';
  clinicName?: string;
  clinicLogo?: string;
  crmv?: string;
}

export function signToken(user: User): string {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    clinicName: user.clinicName,
    clinicLogo: user.clinicLogo,
    crmv: user.crmv,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUserFromCookie(): Promise<TokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}
