import { NextResponse } from 'next/server';
import { getCurrentUserFromCookie } from '@/lib/auth';
import { resolveWhatsAppConfig } from '@/lib/whatsapp';
import { updateUser, setSystemSetting, getSystemSetting, findUserById } from '@/lib/db';
import { WhatsAppConfig } from '@/types';

export async function GET() {
  try {
    const user = await getCurrentUserFromCookie();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const fullUser = await findUserById(user.userId);
    const userConfig = fullUser?.whatsappConfig;
    const globalConfig = await getSystemSetting<WhatsAppConfig>('whatsapp_config');

    return NextResponse.json({
      userConfig: userConfig || null,
      globalConfig: globalConfig || null,
      resolvedConfig: await resolveWhatsAppConfig(user.userId)
    });
  } catch (err: any) {
    console.error('Erro ao buscar configuração do WhatsApp:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUserFromCookie();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { config, isGlobal } = body as { config: WhatsAppConfig; isGlobal?: boolean };

    if (!config) {
      return NextResponse.json({ error: 'Configuração inválida' }, { status: 400 });
    }

    // Se solicitado salvar como configuração global e o usuário for ADMIN
    if (isGlobal && (user.role === 'ADMIN' || user.role === 'RADIOLOGIST')) {
      await setSystemSetting('whatsapp_config', config);
    }

    // Salva também no perfil do usuário
    await updateUser(user.userId, { whatsappConfig: config });

    return NextResponse.json({
      success: true,
      config
    });
  } catch (err: any) {
    console.error('Erro ao salvar configuração do WhatsApp:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
