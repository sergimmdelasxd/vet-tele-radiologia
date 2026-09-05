import { WhatsAppConfig, WhatsAppProvider } from '@/types';
import { findUserById, getSystemSetting } from './db';

/**
 * Normaliza o telefone brasileiro para o formato internacional (55 + DDD + Número)
 */
export function formatWhatsAppPhone(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');

  // Se já tiver 55 no início e mais 10 ou 11 dígitos (total 12 ou 13 dígitos)
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    return digits;
  }

  // DDD + 8 ou 9 dígitos (total 10 ou 11) -> adiciona DDI 55
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }

  return digits;
}

/**
 * Obtém a configuração ativa do WhatsApp (do usuário, global do sistema ou das variáveis de ambiente)
 */
export async function resolveWhatsAppConfig(userId?: string): Promise<WhatsAppConfig | null> {
  // 1. Tenta pegar a configuração individual do usuário
  if (userId) {
    try {
      const user = await findUserById(userId);
      if (user?.whatsappConfig && user.whatsappConfig.enabled) {
        return user.whatsappConfig;
      }
    } catch (err) {
      console.warn('Erro ao buscar whatsappConfig do usuário:', err);
    }
  }

  // 2. Tenta pegar a configuração global do sistema no banco
  try {
    const globalConfig = await getSystemSetting<WhatsAppConfig>('whatsapp_config');
    if (globalConfig && globalConfig.enabled) {
      return globalConfig;
    }
  } catch (err) {
    console.warn('Erro ao buscar whatsapp_config global:', err);
  }

  // 3. Fallback para variáveis de ambiente
  if (process.env.WHATSAPP_API_URL && (process.env.WHATSAPP_API_TOKEN || process.env.WHATSAPP_INSTANCE_ID)) {
    return {
      enabled: true,
      provider: (process.env.WHATSAPP_PROVIDER as WhatsAppProvider) || 'Z_API',
      apiUrl: process.env.WHATSAPP_API_URL,
      instanceId: process.env.WHATSAPP_INSTANCE_ID,
      token: process.env.WHATSAPP_API_TOKEN,
      clientToken: process.env.WHATSAPP_CLIENT_TOKEN
    };
  }

  return null;
}

export interface SendWhatsAppParams {
  phone: string;
  message: string;
  config?: WhatsAppConfig;
  userId?: string;
  mediaUrl?: string;
  fileName?: string;
}

export interface SendWhatsAppResult {
  success: boolean;
  messageId?: string;
  details?: any;
  error?: string;
}

/**
 * Envia uma mensagem ou documento PDF via WhatsApp API (Z-API, Evolution API ou Webhook)
 */
export async function sendWhatsAppMessage({
  phone,
  message,
  config,
  userId,
  mediaUrl,
  fileName
}: SendWhatsAppParams): Promise<SendWhatsAppResult> {
  const activeConfig = config || (await resolveWhatsAppConfig(userId));

  if (!activeConfig || !activeConfig.enabled) {
    return {
      success: false,
      error: 'A API do WhatsApp não está configurada ou está desativada no momento.'
    };
  }

  const formattedPhone = formatWhatsAppPhone(phone);
  if (!formattedPhone || formattedPhone.length < 10) {
    return {
      success: false,
      error: 'Número de telefone inválido ou incompleto.'
    };
  }

  const rawBaseUrl = (activeConfig.apiUrl || '').trim().replace(/\/+$/, '');
  const instance = (activeConfig.instanceId || '').trim();
  const token = (activeConfig.token || '').trim();
  const clientToken = (activeConfig.clientToken || '').trim();

  try {
    if (activeConfig.provider === 'Z_API') {
      const baseUrl = rawBaseUrl || 'https://api.z-api.io';
      if (!instance || !token) {
        return { success: false, error: 'ID da Instância e Token são obrigatórios para a Z-API.' };
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (clientToken) {
        headers['Client-Token'] = clientToken;
      }

      // Se houver mediaUrl (como laudo em PDF), envia como documento anexado
      if (mediaUrl) {
        const docUrl = `${baseUrl}/instances/${instance}/token/${token}/send-document/pdf`;
        const res = await fetch(docUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            phone: formattedPhone,
            document: mediaUrl,
            fileName: fileName || 'Laudo_Veterinario.pdf',
            caption: message
          }),
          signal: AbortSignal.timeout(20000)
        });

        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          return {
            success: true,
            messageId: data.zaapId || data.messageId || data.id,
            details: data
          };
        }
        // Se falhar o envio de documento, faz fallback para envio de texto comum
      }

      // Envio de texto normal
      const url = `${baseUrl}/instances/${instance}/token/${token}/send-text`;
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          phone: formattedPhone,
          message: message
        }),
        signal: AbortSignal.timeout(15000)
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return {
          success: false,
          error: data.message || data.error || `Erro HTTP ${res.status} ao disparar via Z-API.`
        };
      }

      return {
        success: true,
        messageId: data.zaapId || data.messageId || data.id,
        details: data
      };
    } 
    
    if (activeConfig.provider === 'EVOLUTION_API') {
      if (!rawBaseUrl || !instance || !token) {
        return { success: false, error: 'URL da API, Nome da Instância e API Key são obrigatórios para a Evolution API.' };
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'apikey': token
      };

      // Se houver mediaUrl (laudo em PDF), envia como documento
      if (mediaUrl) {
        const mediaEndpoint = `${rawBaseUrl}/message/sendMedia/${instance}`;
        const res = await fetch(mediaEndpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            number: formattedPhone,
            media: mediaUrl,
            mediatype: 'document',
            mimetype: 'application/pdf',
            fileName: fileName || 'Laudo_Veterinario.pdf',
            caption: message
          }),
          signal: AbortSignal.timeout(20000)
        });

        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          return {
            success: true,
            messageId: data.key?.id || data.id,
            details: data
          };
        }
        // Se falhar envio de mídia, tenta texto normal
      }

      const url = `${rawBaseUrl}/message/sendText/${instance}`;
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          number: formattedPhone,
          text: message
        }),
        signal: AbortSignal.timeout(15000)
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return {
          success: false,
          error: data.message || data.error || (Array.isArray(data.response?.message) ? data.response.message.join(', ') : `Erro HTTP ${res.status} na Evolution API.`)
        };
      }

      return {
        success: true,
        messageId: data.key?.id || data.id,
        details: data
      };
    } 
    
    if (activeConfig.provider === 'CUSTOM_WEBHOOK') {
      if (!rawBaseUrl) {
        return { success: false, error: 'URL do Webhook é obrigatória.' };
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(rawBaseUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          phone: formattedPhone,
          message: message,
          mediaUrl: mediaUrl || null,
          fileName: fileName || null,
          sentAt: new Date().toISOString()
        }),
        signal: AbortSignal.timeout(15000)
      });

      if (!res.ok) {
        return {
          success: false,
          error: `O webhook retornou status HTTP ${res.status}.`
        };
      }

      const data = await res.json().catch(() => ({}));
      return {
        success: true,
        details: data
      };
    }

    return {
      success: false,
      error: `Provedor de WhatsApp desconhecido: ${activeConfig.provider}`
    };
  } catch (err: any) {
    console.error('Erro ao enviar mensagem no WhatsApp:', err);
    if (err.name === 'TimeoutError') {
      return {
        success: false,
        error: 'Tempo limite esgotado ao conectar à API do WhatsApp (Timeout 15s).'
      };
    }
    return {
      success: false,
      error: err.message || 'Falha de rede ao conectar à API do WhatsApp.'
    };
  }
}
