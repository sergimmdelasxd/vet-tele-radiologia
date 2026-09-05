import { NextResponse } from 'next/server';
import { getCurrentUserFromCookie } from '@/lib/auth';
import { setSystemSetting } from '@/lib/db';
import { resolveEmailConfig } from '@/lib/email';
import { EmailConfig } from '@/types';

export async function GET() {
  try {
    const user = await getCurrentUserFromCookie();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const config = await resolveEmailConfig();

    return NextResponse.json({
      config: {
        ...config,
        smtpPass: config.smtpPass ? '••••••••' : ''
      }
    });
  } catch (error: any) {
    console.error('Erro ao buscar configuração de e-mail:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUserFromCookie();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { config } = body as { config: Partial<EmailConfig> };

    if (!config) {
      return NextResponse.json({ error: 'Dados de configuração ausentes' }, { status: 400 });
    }

    const currentConfig = await resolveEmailConfig();

    // Se o usuário não alterou a senha (manteve as bolinhas ou vazio), preserva a existente
    const finalPass = config.smtpPass && config.smtpPass !== '••••••••'
      ? config.smtpPass
      : currentConfig.smtpPass;

    const newConfig: EmailConfig = {
      enabled: config.enabled ?? currentConfig.enabled ?? false,
      requireEmailVerification: config.requireEmailVerification ?? currentConfig.requireEmailVerification ?? true,
      smtpHost: config.smtpHost !== undefined ? config.smtpHost.trim() : currentConfig.smtpHost,
      smtpPort: config.smtpPort ? Number(config.smtpPort) : (currentConfig.smtpPort || 587),
      smtpSecure: config.smtpSecure ?? currentConfig.smtpSecure ?? false,
      smtpUser: config.smtpUser !== undefined ? config.smtpUser.trim() : currentConfig.smtpUser,
      smtpPass: finalPass,
      fromName: config.fromName !== undefined ? config.fromName.trim() : currentConfig.fromName,
      fromEmail: config.fromEmail !== undefined ? config.fromEmail.trim() : currentConfig.fromEmail
    };

    await setSystemSetting('email_config', newConfig);

    return NextResponse.json({
      success: true,
      message: 'Configurações de e-mail atualizadas com sucesso',
      config: {
        ...newConfig,
        smtpPass: newConfig.smtpPass ? '••••••••' : ''
      }
    });
  } catch (error: any) {
    console.error('Erro ao salvar configuração de e-mail:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
