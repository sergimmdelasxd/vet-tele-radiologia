import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { findUserByEmail, createUser } from '@/lib/db';
import { signToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, clinicName, crmv, phone, cnpj, uf } = body;

    if (!email || !password || !name || !clinicName) {
      return NextResponse.json(
        { error: 'Nome do responsável, nome da clínica, email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve conter no mínimo 6 caracteres' },
        { status: 400 }
      );
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Este e-mail já está cadastrado em nosso sistema' },
        { status: 400 }
      );
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = await createUser({
      name,
      email,
      password: hashedPassword,
      role: 'CLINIC',
      clinicName,
      crmv: crmv || '',
      phone: phone || '',
      cnpj: cnpj || '',
      uf: uf || 'SP'
    });

    const token = signToken(newUser);

    const response = NextResponse.json({
      success: true,
      user: newUser,
      token
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Erro ao cadastrar clínica parceira' },
      { status: 500 }
    );
  }
}
