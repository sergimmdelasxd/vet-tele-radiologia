import { NextResponse } from 'next/server';
import { findUserByVerificationToken, updateUser } from '@/lib/db';
import { recordAuditTrail } from '@/lib/audit';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token de verificação não informado' },
        { status: 400 }
      );
    }

    const user = await findUserByVerificationToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Link de confirmação inválido ou já utilizado' },
        { status: 400 }
      );
    }

    if (user.verificationExpires && new Date(user.verificationExpires) < new Date()) {
      return NextResponse.json(
        { error: 'Link de confirmação expirado. Por favor, solicite um novo link de verificação.' },
        { status: 400 }
      );
    }

    const updated = await updateUser(user.id, {
      emailVerified: true,
      verificationToken: '',
      verificationExpires: ''
    });

    recordAuditTrail({
      user,
      action: 'VERIFY_EMAIL',
      resourceType: 'USER',
      resourceId: user.id,
      details: `E-mail ${user.email} confirmado com sucesso via token de verificação.`,
      req: request
    });

    return NextResponse.json({
      success: true,
      message: 'E-mail confirmado com sucesso! Você já pode acessar o sistema.',
      user: updated
    });
  } catch (error) {
    console.error('Verify email error:', error);
    return NextResponse.json(
      { error: 'Erro interno ao validar confirmação de e-mail' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Token de verificação não informado' },
        { status: 400 }
      );
    }

    const user = await findUserByVerificationToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Link de confirmação inválido ou já utilizado' },
        { status: 400 }
      );
    }

    if (user.verificationExpires && new Date(user.verificationExpires) < new Date()) {
      return NextResponse.json(
        { error: 'Link de confirmação expirado. Por favor, solicite um novo link de verificação.' },
        { status: 400 }
      );
    }

    const updated = await updateUser(user.id, {
      emailVerified: true,
      verificationToken: '',
      verificationExpires: ''
    });

    recordAuditTrail({
      user,
      action: 'VERIFY_EMAIL',
      resourceType: 'USER',
      resourceId: user.id,
      details: `E-mail ${user.email} confirmado com sucesso via token de verificação.`,
      req: request
    });

    return NextResponse.json({
      success: true,
      message: 'E-mail confirmado com sucesso! Você já pode acessar o sistema.',
      user: updated
    });
  } catch (error) {
    console.error('Verify email error:', error);
    return NextResponse.json(
      { error: 'Erro interno ao validar confirmação de e-mail' },
      { status: 500 }
    );
  }
}
