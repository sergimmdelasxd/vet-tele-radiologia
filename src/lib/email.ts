import nodemailer from 'nodemailer';
import { getSystemSetting } from './db';
import { EmailConfig, User } from '@/types';

// Cache para simulação em ambiente de desenvolvimento / teste
export interface SimulatedEmail {
  id: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
  sentAt: string;
  previewUrl?: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __vet_simulated_emails__: SimulatedEmail[] | undefined;
}

export function getSimulatedEmails(): SimulatedEmail[] {
  return global.__vet_simulated_emails__ || [];
}

export function addSimulatedEmail(email: Omit<SimulatedEmail, 'id' | 'sentAt'>) {
  if (!global.__vet_simulated_emails__) {
    global.__vet_simulated_emails__ = [];
  }
  const entry: SimulatedEmail = {
    ...email,
    id: 'sim-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    sentAt: new Date().toISOString()
  };
  global.__vet_simulated_emails__.unshift(entry);
  if (global.__vet_simulated_emails__.length > 50) {
    global.__vet_simulated_emails__ = global.__vet_simulated_emails__.slice(0, 50);
  }
  return entry;
}

export function getBaseUrl(request?: Request): string {
  if (request) {
    const origin = request.headers.get('origin');
    if (origin && !origin.includes('localhost')) {
      return origin;
    }

    const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
    const proto = request.headers.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https');
    if (host && !host.includes('localhost')) {
      return `${proto}://${host}`;
    }

    if (origin) return origin;
    if (host) return `${proto}://${host}`;
  }

  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return 'http://localhost:3000';
}

export async function resolveEmailConfig(): Promise<EmailConfig> {
  const globalConfig = await getSystemSetting<EmailConfig>('email_config');

  const envHost = process.env.SMTP_HOST;
  const envPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const envUser = process.env.SMTP_USER;
  const envPass = process.env.SMTP_PASS;
  const envFrom = process.env.SMTP_FROM || 'central@vettelerad.com.br';
  const envFromName = process.env.SMTP_FROM_NAME || 'VetTeleRad — Telerradiologia Veterinária';
  const envRequireVerification = process.env.REQUIRE_EMAIL_VERIFICATION === 'true';

  if (globalConfig) {
    return {
      enabled: globalConfig.enabled ?? (Boolean(globalConfig.smtpHost) || Boolean(envHost)),
      requireEmailVerification: globalConfig.requireEmailVerification ?? true,
      smtpHost: globalConfig.smtpHost || envHost,
      smtpPort: globalConfig.smtpPort || envPort,
      smtpSecure: globalConfig.smtpSecure ?? (globalConfig.smtpPort === 465 || envPort === 465),
      smtpUser: globalConfig.smtpUser || envUser,
      smtpPass: globalConfig.smtpPass || envPass,
      fromName: globalConfig.fromName || envFromName,
      fromEmail: globalConfig.fromEmail || envFrom
    };
  }

  return {
    enabled: Boolean(envHost),
    requireEmailVerification: envRequireVerification || true,
    smtpHost: envHost,
    smtpPort: envPort,
    smtpSecure: envPort === 465,
    smtpUser: envUser,
    smtpPass: envPass,
    fromName: envFromName,
    fromEmail: envFrom
  };
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<{
  success: boolean;
  simulated: boolean;
  messageId?: string;
  error?: string;
}> {
  const config = await resolveEmailConfig();

  // Se SMTP estiver configurado com host e usuário
  if (config.enabled && config.smtpHost && config.smtpUser && config.smtpPass) {
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

      const info = await transporter.sendMail({
        from: `"${config.fromName || 'VetTeleRad'}" <${config.fromEmail || config.smtpUser}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.subject
      });

      console.log(`[EMAIL ENVIADO VIA SMTP] Para: ${options.to} | Assunto: ${options.subject} | ID: ${info.messageId}`);
      return { success: true, simulated: false, messageId: info.messageId };
    } catch (err: any) {
      console.error('[ERRO SMTP] Falha no disparo real de e-mail:', err);
      // Registra fallback na simulação caso falhe a conexão SMTP externa
      addSimulatedEmail({
        to: options.to,
        subject: `[FALHA SMTP - MODO SIMULADO] ${options.subject}`,
        html: options.html,
        text: options.text
      });
      return { success: false, simulated: true, error: err.message };
    }
  }

  // MODO SIMULAÇÃO / DESENVOLVIMENTO:
  // Salva no registro e exibe no console para facilitar testes locais
  const entry = addSimulatedEmail({
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text
  });

  console.log('\n' + '='.repeat(70));
  console.log(`📧 [VETTELERAD EMAIL SIMULATOR]`);
  console.log(`Para: ${options.to}`);
  console.log(`Assunto: ${options.subject}`);
  console.log(`Data: ${new Date().toLocaleString('pt-BR')}`);
  if (options.text) {
    console.log(`Prévia:\n${options.text.substring(0, 300)}...`);
  }
  console.log('='.repeat(70) + '\n');

  return { success: true, simulated: true, messageId: entry.id };
}

// Template de Verificação de E-mail
export async function sendVerificationEmail(
  user: { name: string; email: string; clinicName?: string },
  token: string,
  baseUrl: string
) {
  const verifyUrl = `${baseUrl}/verificar-email?token=${encodeURIComponent(token)}`;

  const subject = 'Confirme seu e-mail — VetTeleRad Telerradiologia';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmação de E-mail</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #090d16; color: #e2e8f0; margin: 0; padding: 20px; }
        .card { max-width: 580px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        .header { background: linear-gradient(135deg, #0284c7, #0891b2); padding: 32px 24px; text-align: center; }
        .brand { font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; margin: 0; }
        .brand span { color: #38bdf8; }
        .content { padding: 36px 30px; line-height: 1.6; }
        .greeting { font-size: 18px; font-weight: 700; color: #f8fafc; margin-top: 0; margin-bottom: 16px; }
        .text { color: #94a3b8; font-size: 14px; margin-bottom: 24px; }
        .button-box { text-align: center; margin: 32px 0; }
        .button { display: inline-block; background: linear-gradient(90deg, #06b6d4, #2563eb); color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: bold; font-size: 14px; box-shadow: 0 4px 12px rgba(6, 182, 212, 0.35); }
        .link-alt { word-break: break-all; font-size: 12px; color: #38bdf8; background: #0b1120; padding: 12px; border-radius: 8px; border: 1px solid #1e293b; }
        .footer { background: #090d16; padding: 20px 30px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1 class="brand">Vet<span>Tele</span>Rad</h1>
          <p style="margin: 6px 0 0 0; color: #e0f2fe; font-size: 12px; font-weight: 500;">Telerradiologia & Ultrassonografia Veterinária</p>
        </div>
        <div class="content">
          <h2 class="greeting">Olá, ${user.name}!</h2>
          <p class="text">
            Seja muito bem-vindo ao <strong>VetTeleRad</strong>${user.clinicName ? ` (${user.clinicName})` : ''}.
            Para garantir a segurança da sua conta e liberar o acesso completo ao portal de envio e laudos de exames, confirme seu endereço de e-mail clicando no botão abaixo:
          </p>

          <div class="button-box">
            <a href="${verifyUrl}" target="_blank" class="button">Confirmar Meu E-mail</a>
          </div>

          <p class="text" style="font-size: 12px; margin-bottom: 8px;">
            Se o botão acima não funcionar, copie e cole o link a seguir no seu navegador:
          </p>
          <div class="link-alt">
            <a href="${verifyUrl}" style="color: #38bdf8; text-decoration: none;">${verifyUrl}</a>
          </div>

          <p class="text" style="font-size: 12px; margin-top: 24px; color: #64748b;">
            ⚠️ Este link de confirmação expira em <strong>24 horas</strong>. Se você não solicitou este cadastro, desconsidere esta mensagem.
          </p>
        </div>
        <div class="footer">
          © ${new Date().getFullYear()} VetTeleRad — Telerradiologia Veterinária. Todos os direitos reservados.
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `Olá, ${user.name}!\n\nConfirme seu e-mail no VetTeleRad acessando o link abaixo:\n${verifyUrl}\n\nEste link é válido por 24 horas.`;

  return sendEmail({
    to: user.email,
    subject,
    html,
    text
  });
}

// Template de Esqueci Minha Senha / Redefinição
export async function sendPasswordResetEmail(
  user: { name: string; email: string },
  token: string,
  baseUrl: string
) {
  const resetUrl = `${baseUrl}/redefinir-senha?token=${encodeURIComponent(token)}`;

  const subject = 'Redefinição de Senha — VetTeleRad';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Redefinição de Senha</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #090d16; color: #e2e8f0; margin: 0; padding: 20px; }
        .card { max-width: 580px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        .header { background: linear-gradient(135deg, #0369a1, #0284c7); padding: 32px 24px; text-align: center; }
        .brand { font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; margin: 0; }
        .brand span { color: #38bdf8; }
        .content { padding: 36px 30px; line-height: 1.6; }
        .greeting { font-size: 18px; font-weight: 700; color: #f8fafc; margin-top: 0; margin-bottom: 16px; }
        .text { color: #94a3b8; font-size: 14px; margin-bottom: 24px; }
        .button-box { text-align: center; margin: 32px 0; }
        .button { display: inline-block; background: linear-gradient(90deg, #0284c7, #06b6d4); color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: bold; font-size: 14px; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.35); }
        .link-alt { word-break: break-all; font-size: 12px; color: #38bdf8; background: #0b1120; padding: 12px; border-radius: 8px; border: 1px solid #1e293b; }
        .footer { background: #090d16; padding: 20px 30px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1 class="brand">Vet<span>Tele</span>Rad</h1>
          <p style="margin: 6px 0 0 0; color: #e0f2fe; font-size: 12px; font-weight: 500;">Recuperação de Acesso Seguro</p>
        </div>
        <div class="content">
          <h2 class="greeting">Olá, ${user.name}!</h2>
          <p class="text">
            Recebemos uma solicitação para redefinir a senha da sua conta no <strong>VetTeleRad</strong> associada ao e-mail <strong>${user.email}</strong>.
          </p>
          <p class="text">
            Para criar uma nova senha de acesso, clique no botão abaixo:
          </p>

          <div class="button-box">
            <a href="${resetUrl}" target="_blank" class="button">Redefinir Minha Senha</a>
          </div>

          <p class="text" style="font-size: 12px; margin-bottom: 8px;">
            Ou copie e cole o link no seu navegador:
          </p>
          <div class="link-alt">
            <a href="${resetUrl}" style="color: #38bdf8; text-decoration: none;">${resetUrl}</a>
          </div>

          <p class="text" style="font-size: 12px; margin-top: 24px; color: #64748b;">
            🔒 Este link expira em <strong>1 hora</strong> por motivos de segurança.<br>
            Se você não solicitou a redefinição de senha, nenhuma ação é necessária. Sua senha continuará segura e inalterada.
          </p>
        </div>
        <div class="footer">
          © ${new Date().getFullYear()} VetTeleRad — Telerradiologia Veterinária. Todos os direitos reservados.
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `Olá, ${user.name}!\n\nRedefina sua senha no VetTeleRad acessando o link abaixo:\n${resetUrl}\n\nEste link é válido por 1 hora. Se você não solicitou, ignore esta mensagem.`;

  return sendEmail({
    to: user.email,
    subject,
    html,
    text
  });
}
