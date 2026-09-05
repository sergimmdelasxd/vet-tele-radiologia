import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { findUserByEmail, createUser } from '@/lib/db';
import { signToken, COOKIE_NAME } from '@/lib/auth';
import crypto from 'crypto';
import { resolveEmailConfig, sendVerificationEmail, getBaseUrl } from '@/lib/email';

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

    const emailConfig = await resolveEmailConfig();
    const requireVerification = emailConfig.requireEmailVerification ?? true;
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

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
      uf: uf || 'SP',
      emailVerified: !requireVerification,
      verificationToken: requireVerification ? verificationToken : undefined,
      verificationExpires: requireVerification ? verificationExpires : undefined
    });

    // Detecta URL base da aplicação para o link de confirmação
    const origin = getBaseUrl(request);

    // Dispara e-mail de confirmação
    try {
      await sendVerificationEmail(
        { name: newUser.name, email: newUser.email, clinicName: newUser.clinicName },
        verificationToken,
        origin
      );
    } catch (mailErr) {
      console.error('Falha ao enviar e-mail de confirmação:', mailErr);
    }

    // Se exige verificação, não loga direto e orienta o usuário a confirmar
    if (requireVerification) {
      return NextResponse.json({
        success: true,
        requireVerification: true,
        email: newUser.email,
        message: 'Cadastro realizado com sucesso! Enviamos um e-mail com o link para ativação da sua conta.'
      });
    }

    const token = signToken(newUser);

    const response = NextResponse.json({
      success: true,
      requireVerification: false,
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
