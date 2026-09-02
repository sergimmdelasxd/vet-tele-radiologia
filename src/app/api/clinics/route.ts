import { NextResponse } from 'next/server';
import { getCurrentUserFromCookie } from '@/lib/auth';
import { readDatabase, createUser, findUserByEmail } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const user = await getCurrentUserFromCookie();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const db = readDatabase();
    const clinics = db.users
      .filter(u => u.role === 'CLINIC')
      .map(({ password: _, ...clinic }) => clinic);

    return NextResponse.json({ clinics });
  } catch (error) {
    console.error('Fetch clinics error:', error);
    return NextResponse.json({ error: 'Erro ao buscar clínicas' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUserFromCookie();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { clinicName, name, email, phone, uf, crmv, cnpj } = body;

    if (!clinicName) {
      return NextResponse.json({ error: 'Nome da clínica é obrigatório' }, { status: 400 });
    }

    // Gerar e-mail padrão se não fornecido
    const cleanClinic = clinicName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'clinica';
    const finalEmail = email?.trim() || `contato@${cleanClinic}-${Date.now().toString().slice(-4)}.com.br`;

    const existing = findUserByEmail(finalEmail);
    if (existing) {
      return NextResponse.json({ error: 'Já existe uma clínica cadastrada com este e-mail' }, { status: 400 });
    }

    const newClinic = createUser({
      name: name || `Responsável (${clinicName})`,
      clinicName,
      email: finalEmail,
      password: bcrypt.hashSync('123456', 10),
      role: 'CLINIC',
      phone: phone || '',
      uf: uf || 'SP',
      crmv: crmv || '',
      cnpj: cnpj || ''
    });

    return NextResponse.json({ success: true, clinic: newClinic }, { status: 201 });
  } catch (error) {
    console.error('Create clinic error:', error);
    return NextResponse.json({ error: 'Erro ao cadastrar clínica' }, { status: 500 });
  }
}
