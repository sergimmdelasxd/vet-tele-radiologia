import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { findUserByEmail, updateUser } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';
import { recordAuditTrail } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'E-mail é obrigatório para recuperação de senha' },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await findUserByEmail(normalizedEmail);

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      // Token válido por 1 hora
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000).toISOString();

      await updateUser(user.id, {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires
      });

      const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

      try {
        await sendPasswordResetEmail(
          { name: user.name, email: user.email },
          resetToken,
          origin
        );
      } catch (mailErr) {
        console.error('Falha ao enviar e-mail de redefinição de senha:', mailErr);
      }

      recordAuditTrail({
        user,
        action: 'FORGOT_PASSWORD',
        resourceType: 'AUTH',
        resourceId: user.id,
        details: `Solicitação de redefinição de senha gerada para ${user.email}.`,
        req: request
      });
    }

    // Retorna mensagem padrão neutra por segurança (OWASP)
    return NextResponse.json({
      success: true,
      message: 'Se o e-mail estiver cadastrado em nosso sistema, enviamos um link para redefinição de senha. Verifique sua caixa de entrada e pasta de spam.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar recuperação de senha' },
      { status: 500 }
    );
  }
}
