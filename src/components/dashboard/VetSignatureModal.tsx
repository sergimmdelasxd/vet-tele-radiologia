'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  PenTool,
  ShieldCheck,
  UploadCloud,
  Trash2,
  Check,
  Loader2,
  Sparkles,
  Phone,
  QrCode,
  Eraser,
  CheckCircle2,
  AlertCircle,
  BadgeCheck
} from 'lucide-react';
import { User } from '@/types';

interface VetSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUserUpdated: (updatedUser: User) => void;
}

const UF_LIST = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const SPECIALTY_SUGGESTIONS = [
  'Médica Veterinária Radiologista',
  'Médico Veterinário Radiologista',
  'Médica Veterinária Ultrassonografista',
  'Médico Veterinário Ultrassonografista',
  'Médico(a) Veterinário(a) Telerradiologista',
  'Médico Veterinário Clínico Geral',
  'Médica Veterinária Cardiologista',
  'Médico Veterinário Cardiologista'
];

export const VetSignatureModal: React.FC<VetSignatureModalProps> = ({
  isOpen,
  onClose,
  user,
  onUserUpdated
}) => {
  const [mounted, setMounted] = useState(false);

  const [name, setName] = useState(user.name || '');
  const [crmv, setCrmv] = useState(user.crmv ? user.crmv.replace(/\D/g, '') : '');
  const [uf, setUf] = useState(user.uf || 'SP');
  const [specialty, setSpecialty] = useState(user.specialty || 'Médica Veterinária Radiologista');
  const [phone, setPhone] = useState(user.phone || '');
  const [signatureImage, setSignatureImage] = useState(user.signatureImage || '');

  // Modo de inserção da assinatura: 'upload' ou 'draw'
  const [activeTab, setActiveTab] = useState<'upload' | 'draw'>('upload');

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Canvas drawing state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawnOnCanvas, setHasDrawnOnCanvas] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Garantir que a renderização via Portal ocorra apenas no cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sincronizar dados quando o modal abre ou o usuário muda
  useEffect(() => {
    if (isOpen) {
      setName(user.name || '');
      setCrmv(user.crmv ? user.crmv.replace(/\D/g, '') : '');
      setUf(user.uf || 'SP');
      setSpecialty(user.specialty || (user.role === 'RADIOLOGIST' ? 'Médica Veterinária Radiologista' : 'Médico(a) Veterinário(a)'));
      setPhone(user.phone || '');
      setSignatureImage(user.signatureImage || '');
      setSuccessMessage(null);
      setErrorMessage(null);
      setHasDrawnOnCanvas(false);
    }
  }, [isOpen, user]);

  // Inicializar canvas quando entrar na aba 'draw'
  useEffect(() => {
    if (activeTab === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [activeTab]);

  if (!isOpen || !mounted) return null;

  // Upload de arquivo de imagem de assinatura
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        throw new Error(data.error || 'Erro ao enviar assinatura');
      }

      if (data.urls && data.urls.length > 0) {
        setSignatureImage(data.urls[0]);
        setSuccessMessage('Assinatura enviada com sucesso! Clique em "Salvar" para confirmar.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha no upload da assinatura.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Canvas drawing handlers (mouse & touch)
  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e && e.touches.length > 0) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      };
    } else if ('clientX' in e) {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }
    return { x: 0, y: 0 };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const { x, y } = getCanvasCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawnOnCanvas(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnOnCanvas(false);
  };

  const handleApplyDrawnSignature = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawnOnCanvas) {
      setErrorMessage('Desenhe sua assinatura no quadro antes de aplicar.');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    try {
      // Export canvas as PNG blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setErrorMessage('Erro ao processar o traço da assinatura.');
          setIsUploading(false);
          return;
        }

        const file = new File([blob], `assinatura_${Date.now()}.png`, { type: 'image/png' });
        const formData = new FormData();
        formData.append('files', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Erro ao salvar assinatura desenhada');
        }

        if (data.urls && data.urls.length > 0) {
          setSignatureImage(data.urls[0]);
          setSuccessMessage('Traço da assinatura salvo com sucesso!');
        }
        setIsUploading(false);
      }, 'image/png');
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao salvar assinatura desenhada.');
      setIsUploading(false);
    }
  };

  const handleRemoveSignature = () => {
    setSignatureImage('');
    clearCanvas();
  };

  // Salvar no perfil do usuário
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const formattedCrmv = crmv ? `CRMV-${uf} ${crmv.trim()}` : '';

    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          crmv: formattedCrmv,
          uf,
          specialty: specialty.trim(),
          phone: phone.trim(),
          signatureImage: signatureImage || ''
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao salvar credenciais do veterinário.');
      }

      setSuccessMessage('Dados e assinatura profissional salvos com sucesso!');
      if (data.user) {
        onUserUpdated(data.user);
      }

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro inesperado ao salvar.');
    } finally {
      setIsSaving(false);
    }
  };

  const formattedPreviewCrmv = crmv ? `CRMV-${uf} ${crmv}` : user.crmv || `CRMV-${uf} 00000`;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-9 max-w-4xl w-full shadow-2xl shadow-slate-950/50 text-slate-800 my-auto">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-teal-500/25 shrink-0">
              <PenTool className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                  Minha Assinatura &amp; CRMV
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 font-bold border border-teal-200">
                  CFMV / Laudo Oficial
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Cadastre seus dados profissionais, carimbo e assinatura digital para validação jurídica dos laudos.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            title="Fechar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Mensagens de Feedback */}
        {errorMessage && (
          <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="mt-6 space-y-6">
          {/* Seção 1: Dados Profissionais */}
          <div className="space-y-4">
            <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 text-teal-600" />
              <span>Dados Profissionais do Médico(a) Veterinário(a)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nome Completo */}
              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
                  Nome Completo (como constará no carimbo oficial) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dra. Mariana Rocha Silva"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:border-teal-500 focus:bg-white focus:outline-none transition shadow-2xs font-medium"
                />
              </div>

              {/* CRMV e UF */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
                  Número do CRMV *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 12345"
                  value={crmv}
                  onChange={e => setCrmv(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:border-teal-500 focus:bg-white focus:outline-none transition shadow-2xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
                  Estado de Registro (UF) *
                </label>
                <select
                  value={uf}
                  onChange={e => setUf(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:border-teal-500 focus:bg-white focus:outline-none transition shadow-2xs font-bold cursor-pointer"
                >
                  {UF_LIST.map(state => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              {/* Título / Especialidade */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs sm:text-sm font-bold text-slate-700">
                    Título Profissional / Especialidade no Laudo *
                  </label>
                  <span className="text-xs text-slate-400">
                    Exibido abaixo do CRMV no carimbo
                  </span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Ex: Médica Veterinária Radiologista"
                  value={specialty}
                  onChange={e => setSpecialty(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:border-teal-500 focus:bg-white focus:outline-none transition shadow-2xs font-medium"
                />

                {/* Sugestões rápidas de título */}
                <div className="flex flex-wrap gap-2 mt-2.5">
                  {SPECIALTY_SUGGESTIONS.slice(0, 6).map(sug => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setSpecialty(sug)}
                      className={`text-xs px-3 py-1 rounded-xl border transition cursor-pointer ${
                        specialty === sug
                          ? 'bg-teal-100 border-teal-300 text-teal-900 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Telefone / Contato (opcional) */}
              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
                  Telefone / WhatsApp Profissional (Opcional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="(11) 98765-4321"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:border-teal-500 focus:bg-white focus:outline-none transition shadow-2xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Seção 2: Assinatura & Carimbo Digital */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <PenTool className="w-4 h-4 text-teal-600" />
                <span>Assinatura Digital &amp; Carimbo do Especialista</span>
              </label>

              {signatureImage && (
                <button
                  type="button"
                  onClick={handleRemoveSignature}
                  className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1.5 cursor-pointer transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remover Assinatura</span>
                </button>
              )}
            </div>

            {/* Abas: Upload vs Desenhar */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                  activeTab === 'upload'
                    ? 'bg-white text-teal-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UploadCloud className="w-4 h-4" />
                <span>Carregar Arquivo / Imagem (PNG ou JPG)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('draw')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                  activeTab === 'draw'
                    ? 'bg-white text-teal-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <PenTool className="w-4 h-4" />
                <span>Desenhar na Tela (Mouse ou Touch)</span>
              </button>
            </div>

            {/* Conteúdo Aba Upload */}
            {activeTab === 'upload' && (
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp"
                  className="hidden"
                  onChange={handleFileUpload}
                />

                {signatureImage ? (
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-5">
                    <div className="h-28 sm:h-32 w-64 bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-center shadow-xs shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={signatureImage}
                        alt="Assinatura"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="space-y-2 flex-1 text-center sm:text-left">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Assinatura Digital Ativa</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                        Esta assinatura digital será impressa no rodapé de todos os seus laudos com autenticidade verificada.
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="text-xs sm:text-sm font-bold text-teal-700 hover:text-teal-900 hover:underline cursor-pointer"
                      >
                        {isUploading ? 'Enviando nova imagem...' : 'Clique para substituir por outra imagem'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-3xl p-8 sm:p-10 text-center cursor-pointer transition bg-slate-50/50 hover:bg-teal-50/20 group"
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center justify-center gap-3 text-teal-700 py-4">
                        <Loader2 className="w-9 h-9 animate-spin" />
                        <span className="text-sm font-bold">Processando upload da assinatura...</span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto text-teal-600 group-hover:scale-110 transition-transform shadow-xs">
                          <UploadCloud className="w-7 h-7" />
                        </div>
                        <div>
                          <span className="text-sm sm:text-base font-bold text-slate-800 block">
                            Clique aqui para carregar a imagem da sua assinatura ou carimbo
                          </span>
                          <span className="text-xs text-slate-500 block mt-1">
                            Recomendado: imagem PNG com fundo transparente ou foto nítida em folha branca (máx. 5MB)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Conteúdo Aba Desenhar */}
            {activeTab === 'draw' && (
              <div className="space-y-3">
                <div className="relative border-2 border-slate-300 rounded-3xl overflow-hidden bg-white shadow-inner">
                  <canvas
                    ref={canvasRef}
                    width={960}
                    height={300}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-[200px] sm:h-[240px] cursor-crosshair touch-none bg-slate-50/30"
                  />
                  <div className="absolute bottom-3 left-4 pointer-events-none text-xs text-slate-400 italic">
                    ✍️ Assine ou rubrique no quadro acima com o mouse, caneta ou tela touch
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition cursor-pointer"
                  >
                    <Eraser className="w-4 h-4" />
                    <span>Limpar Quadro</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleApplyDrawnSignature}
                    disabled={!hasDrawnOnCanvas || isUploading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-teal-600/20 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Aplicando traço...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Usar Este Traço como Minha Assinatura</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Pré-visualização em Tempo Real do Rodapé do Laudo */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-teal-50/80 via-slate-50 to-cyan-50/80 border-2 border-teal-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm uppercase font-bold text-slate-700 tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>Pré-visualização do Carimbo Oficial (Rodapé do Laudo)</span>
              </span>
              <span className="text-xs font-mono text-teal-700 font-bold bg-white px-2.5 py-1 rounded-lg border border-teal-200 shadow-2xs">
                Padrão CFMV
              </span>
            </div>

            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
              {/* Autenticação simulada */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-700 shadow-2xs shrink-0">
                  <QrCode className="w-10 h-10 text-slate-700" />
                </div>
                <div className="text-xs text-slate-500 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    <span>Autenticidade Verificada</span>
                  </div>
                  <div>Emitido em: {new Date().toLocaleDateString('pt-BR')}</div>
                  <div className="font-mono text-xs text-slate-400">
                    Hash: VET-SIGN-{Date.now().toString().slice(-6)}
                  </div>
                </div>
              </div>

              {/* Carimbo / Assinatura do Especialista */}
              <div className="text-center sm:text-right border-t sm:border-t-0 sm:border-l border-slate-200 pt-4 sm:pt-0 sm:pl-6 w-full sm:w-auto">
                {signatureImage ? (
                  <div className="mb-2 flex justify-center sm:justify-end">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={signatureImage}
                      alt="Assinatura e Carimbo"
                      className="h-20 sm:h-24 max-w-[280px] object-contain drop-shadow-xs"
                    />
                  </div>
                ) : (
                  <div className="font-serif italic text-xl sm:text-2xl text-slate-700 font-semibold mb-1">
                    {name || 'Nome do Veterinário'}
                  </div>
                )}
                <div className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                  {name || 'Nome do Médico Veterinário'}
                </div>
                <div className="text-xs sm:text-sm text-teal-700 font-mono font-bold mt-0.5">
                  {formattedPreviewCrmv}
                </div>
                <div className="inline-block px-3 py-1 bg-teal-50 text-teal-800 border border-teal-200/80 rounded-md text-xs uppercase font-bold tracking-wider mt-1.5 shadow-2xs">
                  {specialty || 'Médica Veterinária Radiologista'}
                </div>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 transition cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-teal-500/25 transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Salvando Credenciais...</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>Salvar Minha Assinatura &amp; CRMV</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
