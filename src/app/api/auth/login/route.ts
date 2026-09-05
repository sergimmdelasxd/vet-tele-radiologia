import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { findUserByEmail } from '@/lib/db';
import { signToken, COOKIE_NAME } from '@/lib/auth';
import { recordAuditTrail } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const user = await findUserByEmail(email);
    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    const { resolveEmailConfig } = await import('@/lib/email');
    const emailConfig = await resolveEmailConfig();
    if (emailConfig.requireEmailVerification && user.emailVerified === false) {
      return NextResponse.json(
        { 
          error: 'E-mail não confirmado. Por favor, acesse o link enviado para a sua caixa de entrada para ativar a sua conta.',
          requireVerification: true,
          email: user.email
        },
        { status: 403 }
      );
    }

    const token = signToken(user);
    const { password: _, ...userWithoutPassword } = user;

    // Registro de Auditoria LGPD
    recordAuditTrail({
      user,
      action: 'LOGIN',
      resourceType: 'AUTH',
      resourceId: user.id,
      details: `Autenticação bem-sucedida do usuário ${user.name} (${user.role}) via credenciais seguras.`,
      req: request
    });

    const response = NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar login' },
      { status: 500 }
    );
  }
}
