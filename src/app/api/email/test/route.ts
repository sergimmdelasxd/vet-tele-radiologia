import { NextResponse } from 'next/server';
import { getCurrentUserFromCookie } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { EmailConfig } from '@/types';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUserFromCookie();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { to, config } = await request.json() as { to: string; config?: EmailConfig };

    if (!to || !to.includes('@')) {
      return NextResponse.json({ error: 'Informe um endereço de e-mail de destino válido' }, { status: 400 });
    }

    // Se forneceu config customizada para testar antes de salvar
    if (config && config.smtpHost && config.smtpUser && config.smtpPass && config.smtpPass !== '••••••••') {
      try {
        const transporter = nodemailer.createTransport({
          host: config.smtpHost,
          port: config.smtpPort || 587,
          secure: config.smtpSecure ?? (config.smtpPort === 465),
          auth: {
            user: config.smtpUser,
            pass: config.smtpPass
          }
        });

        // Verifica credenciais SMTP
        await transporter.verify();

        const info = await transporter.sendMail({
          from: `"${config.fromName || 'VetTeleRad'}" <${config.fromEmail || config.smtpUser}>`,
          to,
          subject: 'Teste de Envio de E-mail — VetTeleRad Telerradiologia',
          html: `
            <div style="font-family: sans-serif; padding: 20px; background: #0f172a; color: #f8fafc; border-radius: 12px;">
              <h2 style="color: #38bdf8;">Conexão SMTP Bem-sucedida!</h2>
              <p>Este é um e-mail de teste disparado pelo painel administrativo do <strong>VetTeleRad</strong>.</p>
              <p style="color: #94a3b8; font-size: 13px;">Seu servidor SMTP (${config.smtpHost}:${config.smtpPort}) está configurado e respondendo perfeitamente.</p>
              <hr style="border: 0; border-top: 1px solid #334155; margin: 20px 0;" />
              <p style="color: #64748b; font-size: 11px;">Enviado em: ${new Date().toLocaleString('pt-BR')}</p>
            </div>
          `
        });

        return NextResponse.json({
          success: true,
          simulated: false,
          message: `E-mail de teste enviado com sucesso para ${to}!`,
          messageId: info.messageId
        });
      } catch (smtpErr: any) {
        return NextResponse.json({
          success: false,
          error: `Falha na conexão SMTP: ${smtpErr.message || smtpErr}`
        }, { status: 400 });
      }
    }

    // Caso contrário, usa a rotina padrão
    const result = await sendEmail({
      to,
      subject: 'Teste de Envio de E-mail — VetTeleRad',
      html: `
        <div style="font-family: sans-serif; padding: 20px; background: #0f172a; color: #f8fafc; border-radius: 12px;">
          <h2 style="color: #38bdf8;">Teste de Notificação VetTeleRad</h2>
          <p>Disparo de teste realizado com sucesso para o endereço <strong>${to}</strong>.</p>
          <hr style="border: 0; border-top: 1px solid #334155; margin: 20px 0;" />
          <p style="color: #64748b; font-size: 11px;">Data: ${new Date().toLocaleString('pt-BR')}</p>
        </div>
      `,
      text: `Teste de envio de e-mail VetTeleRad disparado com sucesso para ${to} em ${new Date().toLocaleString('pt-BR')}.`
    });

    return NextResponse.json({
      success: true,
      simulated: result.simulated,
      message: result.simulated
        ? `Envio simulado com sucesso para ${to} (Consulte o console do servidor para visualizar o e-mail completo).`
        : `E-mail real disparado via SMTP com sucesso para ${to}!`
    });
  } catch (error: any) {
    console.error('Test email error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
