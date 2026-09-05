'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Building2, 
  UploadCloud, 
  Trash2, 
  Check, 
  Image as ImageIcon, 
  Loader2, 
  Sparkles, 
  FileText,
  Phone,
  UserCheck,
  MapPin,
  FileBadge,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  Key,
  Globe
} from 'lucide-react';
import { User, WhatsAppProvider } from '@/types';

interface ClinicSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUserUpdated: (updatedUser: User) => void;
}

export const ClinicSettingsModal: React.FC<ClinicSettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  onUserUpdated
}) => {
  const [clinicName, setClinicName] = useState(user.clinicName || user.name || '');
  const [clinicLogo, setClinicLogo] = useState(user.clinicLogo || '');
  const [signatureImage, setSignatureImage] = useState(user.signatureImage || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [name, setName] = useState(user.name || '');
  const [crmv, setCrmv] = useState(user.crmv || '');
  const [cnpj, setCnpj] = useState(user.cnpj || '');
  const [uf, setUf] = useState(user.uf || 'SP');
  const [specialty, setSpecialty] = useState(user.specialty || '');

  // Integração WhatsApp API
  const [whatsappEnabled, setWhatsappEnabled] = useState(user.whatsappConfig?.enabled ?? false);
  const [whatsappProvider, setWhatsappProvider] = useState<WhatsAppProvider>(user.whatsappConfig?.provider || 'Z_API');
  const [whatsappApiUrl, setWhatsappApiUrl] = useState(user.whatsappConfig?.apiUrl || 'https://api.z-api.io');
  const [whatsappInstanceId, setWhatsappInstanceId] = useState(user.whatsappConfig?.instanceId || '');
  const [whatsappToken, setWhatsappToken] = useState(user.whatsappConfig?.token || '');
  const [whatsappClientToken, setWhatsappClientToken] = useState(user.whatsappConfig?.clientToken || '');
  const [saveAsGlobalWhatsapp, setSaveAsGlobalWhatsapp] = useState(false);

  // Teste de envio WhatsApp
  const [isTestingWhatsapp, setIsTestingWhatsapp] = useState(false);
  const [whatsappTestPhone, setWhatsappTestPhone] = useState(user.phone || '');
  const [whatsappTestSuccess, setWhatsappTestSuccess] = useState<string | null>(null);
  const [whatsappTestError, setWhatsappTestError] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingSignature, setIsUploadingSignature] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('A imagem deve ter no máximo 5MB.');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    try {
      const formData = new FormData();
      formData.append('files', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao fazer upload da logo');
      }

      if (data.files && data.files[0]) {
        setClinicLogo(data.files[0].url);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Falha ao enviar imagem.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('A imagem da assinatura deve ter no máximo 5MB.');
      return;
    }

    setIsUploadingSignature(true);
    setErrorMessage(null);
    try {
      const formData = new FormData();
      formData.append('files', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao fazer upload da assinatura');
      }

      if (data.files && data.files[0]) {
        setSignatureImage(data.files[0].url);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Falha ao enviar imagem da assinatura.');
    } finally {
      setIsUploadingSignature(false);
    }
  };

  const handleRemoveLogo = () => {
    setClinicLogo('');
  };

  const handleRemoveSignature = () => {
    setSignatureImage('');
  };

  const handleTestWhatsApp = async () => {
    const rawDigits = whatsappTestPhone.replace(/\D/g, '');
    if (!rawDigits || rawDigits.length < 10) {
      setWhatsappTestError('Informe um número de WhatsApp válido com DDD (mínimo 10 dígitos) para testar.');
      return;
    }

    setIsTestingWhatsapp(true);
    setWhatsappTestSuccess(null);
    setWhatsappTestError(null);

    try {
      const res = await fetch('/api/whatsapp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: rawDigits,
          config: {
            enabled: true,
            provider: whatsappProvider,
            apiUrl: whatsappApiUrl.trim(),
            instanceId: whatsappInstanceId.trim(),
            token: whatsappToken.trim(),
            clientToken: whatsappClientToken.trim()
          }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Falha ao testar conexão com a API do WhatsApp.');
      }

      setWhatsappTestSuccess('Mensagem de teste disparada com sucesso! Verifique seu WhatsApp.');
    } catch (err: any) {
      setWhatsappTestError(err.message || 'Erro ao enviar teste para o WhatsApp.');
    } finally {
      setIsTestingWhatsapp(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const whatsappPayload = {
      enabled: whatsappEnabled,
      provider: whatsappProvider,
      apiUrl: whatsappApiUrl.trim(),
      instanceId: whatsappInstanceId.trim(),
      token: whatsappToken.trim(),
      clientToken: whatsappClientToken.trim()
    };

    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicName,
          clinicLogo,
          signatureImage,
          phone,
          name,
          crmv,
          cnpj,
          uf,
          specialty: specialty || undefined,
          whatsappConfig: whatsappPayload
        })
      });

      if (saveAsGlobalWhatsapp && (user.role === 'ADMIN' || user.role === 'RADIOLOGIST')) {
        fetch('/api/whatsapp/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            config: whatsappPayload,
            isGlobal: true
          })
        }).catch(() => {});
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao salvar alterações.');
      }

      if (data.user) {
        onUserUpdated(data.user);
        setSuccessMessage('Dados e logotipo da clínica atualizados com sucesso!');
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Falha ao salvar dados.');
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200/90 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-8 text-slate-800">
        
        {/* Cabeçalho do Modal */}
        <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-50/50 via-white to-sky-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shadow-2xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                Minha Clínica &amp; Logotipo do Laudo
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Personalize o cabeçalho timbrado dos seus laudos com a marca da sua clínica
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-6">
          {/* Mensagens de Alerta / Sucesso */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* SEÇÃO 1: LOGOTIPO OFICIAL DA CLÍNICA */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-teal-600" />
                <span>Logotipo Oficial para o Laudo Timbrado</span>
              </label>
              {clinicLogo && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer transition"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remover Logo</span>
                </button>
              )}
            </div>

            {/* Caixa de Upload e Visualização */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp"
              className="hidden"
              onChange={handleLogoUpload}
            />

            {clinicLogo ? (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row items-center gap-4">
                {/* Preview em tamanho real */}
                <div className="h-20 w-44 p-2 bg-white rounded-xl border border-slate-200 flex items-center justify-center shadow-2xs shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={clinicLogo}
                    alt="Logo da clínica"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <div className="space-y-1.5 flex-1 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Logotipo Vinculado aos Laudos</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Este logotipo aparecerá no topo de todos os laudos timbrados de Raio-X e Ultrassom emitidos para a sua clínica.
                  </p>
                  <div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="text-xs font-bold text-teal-700 hover:text-teal-900 hover:underline cursor-pointer transition"
                    >
                      {isUploading ? 'Enviando imagem...' : 'Clique para alterar por outra imagem'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-teal-400 rounded-2xl p-6 text-center cursor-pointer transition bg-slate-50/50 hover:bg-teal-50/20 group"
              >
                {isUploading ? (
                  <div className="flex flex-col items-center justify-center gap-2 text-teal-700 py-3">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="text-xs font-bold">Processando upload do logotipo...</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto text-teal-600 group-hover:scale-110 transition-transform shadow-2xs">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Clique aqui para carregar a logo da sua clínica
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Formatos suportados: PNG (fundo transparente recomendado), SVG, JPG ou WebP (máx. 5MB)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PREVIEW DO CABEÇALHO TIMBRADO */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-teal-50/60 via-slate-50 to-sky-50/60 border border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-2">
                Simulação do cabeçalho timbrado oficial (Maior destaque para sua logo):
              </span>
              <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex items-center justify-between gap-4 text-xs">
                {/* Lado Esquerdo: Logo da Clínica em Maior Destaque */}
                <div className="flex-1 flex items-center justify-start">
                  {clinicLogo ? (
                    <div className="h-12 sm:h-14 max-w-[200px] flex items-center justify-start">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={clinicLogo} alt="Logo" className="max-h-full max-w-full object-contain object-left" />
                    </div>
                  ) : (
                    <div className="h-12 px-4 border-2 border-dashed border-teal-300 rounded-xl text-[11px] text-teal-700 bg-teal-50/40 flex items-center justify-center font-bold">
                      Sua Logo com Maior Destaque Aqui
                    </div>
                  )}
                </div>

                <div className="text-slate-200 font-light text-xl">|</div>

                {/* Lado Direito: Logo da Telerradiologia */}
                <div className="flex items-center gap-2.5 shrink-0 pl-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                    VT
                  </div>
                  <div>
                    <strong className="text-slate-900 block text-xs leading-none font-black">
                      Vet<span className="text-teal-600">Tele</span>Rad
                    </strong>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                      Telerradiologia
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SEÇÃO DE ASSINATURA E CARIMBO (SE RADIOLOGISTA OU ADMIN) */}
          {(user.role === 'RADIOLOGIST' || user.role === 'ADMIN') && (
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>Assinatura &amp; Carimbo Digitalizado do Especialista</span>
                </label>
                {signatureImage && (
                  <button
                    type="button"
                    onClick={handleRemoveSignature}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer transition"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remover Assinatura</span>
                  </button>
                )}
              </div>

              <input
                type="file"
                ref={signatureInputRef}
                onChange={handleSignatureUpload}
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
              />

              {signatureImage ? (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-36 bg-white p-2 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-center overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={signatureImage} alt="Assinatura" className="max-h-full max-w-full object-contain" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Assinatura Ativa</span>
                      <span className="text-[11px] text-teal-600 font-semibold">Exibida no rodapé dos laudos emitidos por você</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => signatureInputRef.current?.click()}
                    disabled={isUploadingSignature}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:border-teal-500 text-slate-700 hover:text-teal-700 text-xs font-bold rounded-xl transition shadow-2xs cursor-pointer"
                  >
                    {isUploadingSignature ? 'Enviando...' : 'Trocar Imagem'}
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => signatureInputRef.current?.click()}
                  className="p-5 border-2 border-dashed border-slate-200 hover:border-teal-500 rounded-2xl bg-slate-50/60 hover:bg-teal-50/20 transition cursor-pointer flex items-center justify-center gap-3 text-center"
                >
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-bold text-slate-800 block">
                      Carregar imagem da sua Assinatura ou Carimbo (CRMV)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Recomendado: Imagem PNG com fundo transparente (aparecerá nos laudos)
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SEÇÃO 3: INTEGRAÇÃO WHATSAPP API (Z-API, EVOLUTION API & WEBHOOK) */}
          <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Robô de Disparo WhatsApp API</span>
                  {whatsappEnabled && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Ativo
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Dispare laudos e mensagens diretamente pelo WhatsApp com 1 clique usando Z-API ou Evolution API.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={whatsappEnabled}
                  onChange={e => setWhatsappEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {whatsappEnabled && (
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/90 space-y-3.5 animate-in fade-in">
                {/* Escolha do Provedor */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5 text-[11px]">
                    Provedor da API de WhatsApp
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setWhatsappProvider('Z_API');
                        if (!whatsappApiUrl || whatsappApiUrl.includes('localhost') || whatsappApiUrl.includes('evolution')) {
                          setWhatsappApiUrl('https://api.z-api.io');
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                        whatsappProvider === 'Z_API'
                          ? 'bg-white border-emerald-500 text-emerald-900 shadow-xs font-bold'
                          : 'bg-white/60 border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span className="block text-xs">Z-API</span>
                      <span className="text-[10px] text-slate-400 font-normal">Mais popular no Brasil</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setWhatsappProvider('EVOLUTION_API');
                        if (whatsappApiUrl === 'https://api.z-api.io') {
                          setWhatsappApiUrl('');
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                        whatsappProvider === 'EVOLUTION_API'
                          ? 'bg-white border-emerald-500 text-emerald-900 shadow-xs font-bold'
                          : 'bg-white/60 border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span className="block text-xs">Evolution API</span>
                      <span className="text-[10px] text-slate-400 font-normal">Open Source / Servidor</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setWhatsappProvider('CUSTOM_WEBHOOK')}
                      className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                        whatsappProvider === 'CUSTOM_WEBHOOK'
                          ? 'bg-white border-emerald-500 text-emerald-900 shadow-xs font-bold'
                          : 'bg-white/60 border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span className="block text-xs">Webhook Custom</span>
                      <span className="text-[10px] text-slate-400 font-normal">N8N / Make / Zapier</span>
                    </button>
                  </div>
                </div>

                {/* Campos da API */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                      {whatsappProvider === 'CUSTOM_WEBHOOK' ? 'URL do Webhook *' : 'URL Base da API *'}
                    </label>
                    <input
                      type="url"
                      required
                      value={whatsappApiUrl}
                      onChange={e => setWhatsappApiUrl(e.target.value)}
                      placeholder={
                        whatsappProvider === 'Z_API'
                          ? 'https://api.z-api.io'
                          : whatsappProvider === 'EVOLUTION_API'
                          ? 'https://evolution.seuservidor.com'
                          : 'https://webhook.site/...'
                      }
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-500 transition shadow-2xs font-mono"
                    />
                  </div>

                  {whatsappProvider !== 'CUSTOM_WEBHOOK' && (
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                        {whatsappProvider === 'Z_API' ? 'ID da Instância (Instance ID) *' : 'Nome da Instância (Instance Name) *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={whatsappInstanceId}
                        onChange={e => setWhatsappInstanceId(e.target.value)}
                        placeholder={whatsappProvider === 'Z_API' ? 'Ex: 3B821A87...' : 'Ex: radiologia-vet'}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-500 transition shadow-2xs font-mono"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                      {whatsappProvider === 'Z_API' ? 'Token da Instância (Token) *' : whatsappProvider === 'EVOLUTION_API' ? 'API Key da Instância / Global *' : 'Token de Autorização (Opcional)'}
                    </label>
                    <input
                      type="password"
                      value={whatsappToken}
                      onChange={e => setWhatsappToken(e.target.value)}
                      placeholder="••••••••••••••••••••"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-500 transition shadow-2xs font-mono"
                    />
                  </div>

                  {whatsappProvider === 'Z_API' && (
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                        Client-Token de Segurança (Opcional)
                      </label>
                      <input
                        type="password"
                        value={whatsappClientToken}
                        onChange={e => setWhatsappClientToken(e.target.value)}
                        placeholder="Client-Token de segurança da Z-API"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-500 transition shadow-2xs font-mono"
                      />
                    </div>
                  )}
                </div>

                {(user.role === 'ADMIN' || user.role === 'RADIOLOGIST') && (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="saveAsGlobalWhatsapp"
                      checked={saveAsGlobalWhatsapp}
                      onChange={e => setSaveAsGlobalWhatsapp(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <label htmlFor="saveAsGlobalWhatsapp" className="text-[11px] text-slate-600 font-medium cursor-pointer">
                      Definir este robô como padrão para toda a plataforma de telemedicina
                    </label>
                  </div>
                )}

                {/* Bloco de Teste de Conexão */}
                <div className="p-3 bg-white rounded-xl border border-emerald-200/80 space-y-2">
                  <span className="block text-[11px] font-bold text-slate-800">
                    🧪 Testar envio do robô no seu WhatsApp
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={whatsappTestPhone}
                      onChange={e => setWhatsappTestPhone(e.target.value)}
                      placeholder="(11) 98765-4321"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={handleTestWhatsApp}
                      disabled={isTestingWhatsapp}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50 shrink-0 shadow-2xs"
                    >
                      {isTestingWhatsapp ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Testando...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Testar Robô</span>
                        </>
                      )}
                    </button>
                  </div>

                  {whatsappTestSuccess && (
                    <div className="p-2 rounded-lg bg-emerald-100/70 text-emerald-800 text-[11px] font-semibold flex items-center gap-1.5 animate-in fade-in">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{whatsappTestSuccess}</span>
                    </div>
                  )}

                  {whatsappTestError && (
                    <div className="p-2 rounded-lg bg-rose-50 text-rose-800 text-[11px] font-semibold flex items-center gap-1.5 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>{whatsappTestError}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* SEÇÃO 2: DADOS CADASTRAIS DA CLÍNICA */}
          <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <FileBadge className="w-3.5 h-3.5 text-teal-600" />
              <span>Dados da Clínica e Responsável</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Nome Fantasia */}
              <div className="sm:col-span-2">
                <label className="block text-slate-600 font-semibold mb-1 text-[11px]">
                  Nome da Clínica / Hospital Veterinário *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={clinicName}
                    onChange={e => setClinicName(e.target.value)}
                    placeholder="Ex: Clínica Veterinária São Francisco 24h"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-teal-500 transition shadow-2xs font-medium"
                  />
                </div>
              </div>

              {/* Telefone / WhatsApp */}
              <div>
                <label className="block text-slate-600 font-semibold mb-1 text-[11px]">
                  Telefone / WhatsApp de Contato
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="(11) 98765-4321"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-teal-500 transition shadow-2xs font-medium"
                  />
                </div>
              </div>

              {/* UF */}
              <div>
                <label className="block text-slate-600 font-semibold mb-1 text-[11px]">
                  Estado (UF)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={uf}
                    onChange={e => setUf(e.target.value.toUpperCase())}
                    placeholder="SP"
                    maxLength={2}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-teal-500 transition shadow-2xs font-medium uppercase"
                  />
                </div>
              </div>

              {/* Médico Veterinário Responsável */}
              <div>
                <label className="block text-slate-600 font-semibold mb-1 text-[11px]">
                  Médico(a) Veterinário(a) Solicitante Padrão
                </label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Dr(a). Nome do Veterinário"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-teal-500 transition shadow-2xs font-medium"
                  />
                </div>
              </div>

              {/* CRMV */}
              <div>
                <label className="block text-slate-600 font-semibold mb-1 text-[11px]">
                  CRMV do Responsável
                </label>
                <div className="relative">
                  <FileBadge className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={crmv}
                    onChange={e => setCrmv(e.target.value)}
                    placeholder="Ex: CRMV-SP 45.291"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-teal-500 transition shadow-2xs font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Botões do Rodapé */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-500/20 transition active:scale-95 cursor-pointer disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Salvar Alterações</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
