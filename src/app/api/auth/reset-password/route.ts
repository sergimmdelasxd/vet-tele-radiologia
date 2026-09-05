import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { findUserByResetToken, updateUser } from '@/lib/db';
import { recordAuditTrail } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token de recuperação não informado' },
        { status: 400 }
      );
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'A nova senha deve ter no mínimo 6 caracteres' },
        { status: 400 }
      );
    }

    const user = await findUserByResetToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Link de redefinição inválido ou já utilizado. Por favor, solicite um novo link.' },
        { status: 400 }
      );
    }

    if (user.resetPasswordExpires && new Date(user.resetPasswordExpires) < new Date()) {
      return NextResponse.json(
        { error: 'Este link de redefinição de senha expirou (validade de 1 hora). Solicite um novo link.' },
        { status: 400 }
      );
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    await updateUser(user.id, {
      password: hashedPassword,
      resetPasswordToken: '',
      resetPasswordExpires: '',
      emailVerified: true // O acesso ao e-mail confirma a titularidade
    });

    recordAuditTrail({
      user,
      action: 'PASSWORD_RESET',
      resourceType: 'AUTH',
      resourceId: user.id,
      details: `Senha do usuário ${user.email} alterada com sucesso via token de recuperação.`,
      req: request
    });

    return NextResponse.json({
      success: true,
      message: 'Sua senha foi redefinida com sucesso! Você já pode acessar sua conta.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Erro interno ao redefinir senha' },
      { status: 500 }
    );
  }
}
