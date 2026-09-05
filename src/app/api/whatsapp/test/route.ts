import { NextResponse } from 'next/server';
import { getCurrentUserFromCookie } from '@/lib/auth';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUserFromCookie();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { phone, config } = body;

    if (!phone) {
      return NextResponse.json(
        { error: 'Informe um número de telefone com DDD para receber a mensagem de teste.' },
        { status: 400 }
      );
    }

    if (!config || !config.enabled) {
      return NextResponse.json(
        { error: 'Ative a integração e preencha as credenciais da API para testar.' },
        { status: 400 }
      );
    }

    const testMessage = `🩺 *VetTeleRad — Teste de Conexão WhatsApp API*
    
✅ Parabéns! A integração da sua clínica/sistema com o robô da *${config.provider}* foi concluída com sucesso.

Os laudos veterinários e notificações agora podem ser disparados com 1 clique diretamente pelo WhatsApp.
🕒 *Data do Teste:* ${new Date().toLocaleString('pt-BR')}`;

    const result = await sendWhatsAppMessage({
      phone,
      message: testMessage,
      config
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Falha ao conectar ou disparar mensagem de teste.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      message: 'Mensagem de teste enviada com sucesso!'
    });
  } catch (err: any) {
    console.error('Erro na rota /api/whatsapp/test:', err);
    return NextResponse.json(
      { error: err.message || 'Erro interno ao testar WhatsApp.' },
      { status: 500 }
    );
  }
}
