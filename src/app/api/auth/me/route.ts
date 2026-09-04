import { NextResponse } from 'next/server';
import { getCurrentUserFromCookie } from '@/lib/auth';
import { findUserById } from '@/lib/db';

export async function GET() {
  try {
    const payload = await getCurrentUserFromCookie();
    if (!payload) {
      return NextResponse.json({ user: null });
    }

    const user = await findUserById(payload.userId);
    if (!user) {
      return NextResponse.json({ user: null });
    }

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ user: null });
  }
}
