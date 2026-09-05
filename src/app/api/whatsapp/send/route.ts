import { NextResponse } from 'next/server';
import { getCurrentUserFromCookie } from '@/lib/auth';
import { sendWhatsAppMessage, resolveWhatsAppConfig } from '@/lib/whatsapp';
import { recordAuditTrail } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUserFromCookie();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { phone, message, examId, customConfig, mediaUrl, fileName } = body;

    if (!phone || !message) {
      return NextResponse.json(
        { error: 'Telefone de destino e texto da mensagem são obrigatórios.' },
        { status: 400 }
      );
    }

    const config = customConfig || (await resolveWhatsAppConfig(user.userId));
    if (!config || !config.enabled) {
      return NextResponse.json(
        {
          error:
            'A integração com o WhatsApp não está configurada ou ativada. Acesse Configurações da Clínica para cadastrar suas credenciais da API.'
        },
        { status: 400 }
      );
    }

    const result = await sendWhatsAppMessage({
      phone,
      message,
      config,
      userId: user.userId,
      mediaUrl,
      fileName
    });

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error || 'Falha ao disparar mensagem pela API do WhatsApp.'
        },
        { status: 502 }
      );
    }

    // Registra trilha de auditoria
    if (examId) {
      recordAuditTrail({
        user: { id: user.userId, name: user.name, role: user.role, email: user.email },
        action: 'SHARE_WHATSAPP',
        resourceType: 'REPORT',
        resourceId: examId,
        details: `Disparo de laudo via WhatsApp API (${config.provider}) para ${phone}. ID: ${result.messageId || 'OK'}`,
        req: request
      });
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      provider: config.provider,
      sentTo: phone
    });
  } catch (err: any) {
    console.error('Erro na rota /api/whatsapp/send:', err);
    return NextResponse.json(
      { error: err.message || 'Erro interno ao processar envio do WhatsApp.' },
      { status: 500 }
    );
  }
}
