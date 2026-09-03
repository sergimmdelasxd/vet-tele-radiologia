import { NextResponse } from 'next/server';
import { getCurrentUserFromCookie } from '@/lib/auth';
import { findUserById, updateUser } from '@/lib/db';

export async function GET() {
  try {
    const payload = await getCurrentUserFromCookie();
    if (!payload) {
      return NextResponse.json({ user: null });
    }

    const user = findUserById(payload.userId);
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

export async function PATCH(request: Request) {
  try {
    const payload = await getCurrentUserFromCookie();
    if (!payload) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { clinicLogo, clinicName, name, phone, uf, crmv, cnpj, avatar } = body;

    const updates: Record<string, any> = {};
    if (clinicLogo !== undefined) updates.clinicLogo = clinicLogo;
    if (clinicName !== undefined) updates.clinicName = clinicName;
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (uf !== undefined) updates.uf = uf;
    if (crmv !== undefined) updates.crmv = crmv;
    if (cnpj !== undefined) updates.cnpj = cnpj;
    if (avatar !== undefined) updates.avatar = avatar;

    const updatedUser = updateUser(payload.userId, updates);
    if (!updatedUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Erro ao atualizar perfil', details: error.message }, { status: 500 });
  }
}
