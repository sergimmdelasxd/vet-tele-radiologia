import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { findUserByEmail, updateUser } from '@/lib/db';
import { sendVerificationEmail, getBaseUrl } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'E-mail é obrigatório' },
        { status: 400 }
      );
    }

    const user = await findUserByEmail(email);
    if (!user) {
      // Retorna sucesso neutro para não expor lista de usuários
      return NextResponse.json({
        success: true,
        message: 'Se o e-mail estiver cadastrado, um novo link de confirmação foi enviado.'
      });
    }

    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        message: 'Este e-mail já foi confirmado anteriormente. Você pode entrar diretamente com sua senha.'
      });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    await updateUser(user.id, {
      verificationToken,
      verificationExpires
    });

    const origin = getBaseUrl(request);
    await sendVerificationEmail(
      { name: user.name, email: user.email, clinicName: user.clinicName },
      verificationToken,
      origin
    );

    return NextResponse.json({
      success: true,
      message: 'Um novo link de ativação foi enviado para sua caixa de entrada.'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Erro ao reenviar e-mail de confirmação' },
      { status: 500 }
    );
  }
}
