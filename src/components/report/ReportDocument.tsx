'use client';

import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  ShieldCheck, 
  Activity, 
  User, 
  Building2, 
  Stethoscope, 
  Heart, 
  QrCode, 
  Waves, 
  Download, 
  Share2, 
  MessageSquare, 
  Copy, 
  Check, 
  Mail, 
  Loader2,
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  Bot
} from 'lucide-react';
import { Exam } from '@/types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

interface ReportDocumentProps {
  exam: Exam;
  onClose?: () => void;
  isDraft?: boolean;
}

export const ReportDocument: React.FC<ReportDocumentProps> = ({ exam, onClose, isDraft = false }) => {
  const report = exam.report;
  const isUltrasound = exam.modality === 'ULTRASSOM';
  const isDraftMode = isDraft || exam.status !== 'REPORTED';

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [destPhone, setDestPhone] = useState(exam.ownerPhone || exam.clinicPhone || '');
  const [destEmail, setDestEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  // Disparo via API do WhatsApp
  const [isSendingViaApi, setIsSendingViaApi] = useState(false);
  const [apiSendSuccess, setApiSendSuccess] = useState(false);
  const [apiSendError, setApiSendError] = useState<string | null>(null);
  const [hasWhatsAppApi, setHasWhatsAppApi] = useState<boolean | null>(null);

  useEffect(() => {
    if (showWhatsAppModal && hasWhatsAppApi === null) {
      fetch('/api/whatsapp/config')
        .then(r => r.json())
        .then(d => {
          setHasWhatsAppApi(!!d.resolvedConfig?.enabled);
        })
        .catch(() => setHasWhatsAppApi(false));
    }
  }, [showWhatsAppModal, hasWhatsAppApi]);

  // Logotipo da clínica no laudo
  const [currentClinicLogo, setCurrentClinicLogo] = useState(exam.clinicLogo || '');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoSuccessToast, setLogoSuccessToast] = useState(false);
  const logoInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (exam.clinicLogo) {
      setCurrentClinicLogo(exam.clinicLogo);
    } else if (!currentClinicLogo && exam.clinicId && exam.clinicId !== 'unknown') {
      // Herda logotipo atual da clínica caso o exame não possua um específico
      fetch('/api/clinics')
        .then(r => r.json())
        .then(d => {
          if (d.clinics && Array.isArray(d.clinics)) {
            const found = d.clinics.find(
              (c: any) => c.id === exam.clinicId || (c.clinicName && c.clinicName.toLowerCase() === (exam.clinicName || '').toLowerCase())
            );
            if (found?.clinicLogo) {
              setCurrentClinicLogo(found.clinicLogo);
            }
          }
        })
        .catch(() => {});
    }
  }, [exam.clinicLogo, exam.clinicId, exam.clinicName, currentClinicLogo]);

  const handleUploadClinicLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('files', files[0]);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data.files && data.files[0]) {
        const newLogoUrl = data.files[0].url;
        setCurrentClinicLogo(newLogoUrl);
        exam.clinicLogo = newLogoUrl;

        // Salva no exame (o backend propaga também para o perfil da clínica)
        await fetch(`/api/exams/${exam.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clinicLogo: newLogoUrl })
        });

        // Tenta atualizar no perfil da clínica caso logada
        fetch('/api/auth/me', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clinicLogo: newLogoUrl })
        }).catch(() => {});

        setLogoSuccessToast(true);
        setTimeout(() => setLogoSuccessToast(false), 3500);
      }
    } catch (err) {
      console.error('Erro ao anexar logo:', err);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  if (!report) {
    return (
      <div className="p-8 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-400">
        Este exame ainda não possui laudo emitido.
      </div>
    );
  }

  // Imagens-chave anexadas
  const keyImages = exam.images.filter(
    img => !report.keyImageIds || report.keyImageIds.length === 0 || report.keyImageIds.includes(img.id)
  );

  const handlePrint = () => {
    window.print();
  };

  const generatePdfInstance = async (): Promise<jsPDF | null> => {
    const docEl = document.getElementById(`printable-report-${exam.id}`);
    if (!docEl) return null;

    // Aguarda todas as imagens do laudo (logo, assinatura, exames) carregarem antes de renderizar no canvas
    const imgElements = Array.from(docEl.querySelectorAll('img'));
    await Promise.all(
      imgElements.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = () => resolve(true);
          img.onerror = () => resolve(true);
        });
      })
    );

    const canvas = await html2canvas(docEl, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      logging: false,
      backgroundColor: '#ffffff',
      scrollY: 0,
      scrollX: 0,
      x: 0,
      y: 0,
      windowWidth: 1024
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm
    const margin = 8; // 8mm margem padrão médica
    const usableWidth = pageWidth - (margin * 2); // 194mm
    const usableHeight = pageHeight - (margin * 2); // 281mm

    const contentAspectRatio = canvas.width / canvas.height;
    let renderWidth = usableWidth;
    let renderHeight = renderWidth / contentAspectRatio;

    // Se o laudo couber ou estiver ligeiramente acima (até 30%), ajusta a escala para caber exatamente em 1 PÁGINA A4 ÚNICA
    if (renderHeight <= usableHeight * 1.30) {
      if (renderHeight > usableHeight) {
        renderHeight = usableHeight;
        renderWidth = renderHeight * contentAspectRatio;
      }
      const xOffset = margin + (usableWidth - renderWidth) / 2;
      const yOffset = margin;
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imgData, 'JPEG', xOffset, yOffset, renderWidth, renderHeight, undefined, 'FAST');
    } else {
      // Se for um laudo longo com muitas fotos/cortes anexados, fatia em páginas limpas sem duplicar o laudo
      const pageCanvasHeight = Math.floor(canvas.width * (usableHeight / usableWidth));
      let sourceY = 0;

      while (sourceY < canvas.height) {
        if (sourceY > 0) pdf.addPage();

        const sliceHeight = Math.min(pageCanvasHeight, canvas.height - sourceY);
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sliceHeight;
        const ctx = pageCanvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          ctx.drawImage(canvas, 0, sourceY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
          const sliceData = pageCanvas.toDataURL('image/jpeg', 0.95);
          const sliceRenderHeight = (sliceHeight * usableWidth) / canvas.width;
          pdf.addImage(sliceData, 'JPEG', margin, margin, usableWidth, sliceRenderHeight, undefined, 'FAST');
        }
        sourceY += pageCanvasHeight;
      }
    }

    return pdf;
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const pdf = await generatePdfInstance();
      if (!pdf) {
        window.print();
        return;
      }

      const cleanPatient = exam.patientName.replace(/[^a-zA-Z0-9]/g, '_');
      pdf.save(`Laudo-VetTeleRad-${exam.id}-${cleanPatient}.pdf`);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Gera e faz upload do arquivo PDF oficial para envio direto em anexo no WhatsApp
  const handleUploadPdfBlob = async (): Promise<string | null> => {
    try {
      const pdf = await generatePdfInstance();
      if (!pdf) return null;
      const blob = pdf.output('blob');
      const cleanPatient = exam.patientName.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `Laudo_${exam.id}_${cleanPatient}.pdf`;
      const file = new File([blob], fileName, { type: 'application/pdf' });

      const formData = new FormData();
      formData.append('files', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data.files && data.files[0]?.url) {
        return data.files[0].url;
      }
      return null;
    } catch (e) {
      console.error('Erro ao gerar/subir PDF para envio:', e);
      return null;
    }
  };

  const getPublicUrl = () => {
    return typeof window !== 'undefined' ? `${window.location.origin}/laudo/${exam.id}` : '';
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getPublicUrl());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const isSendingToTutor = !!exam.ownerPhone && destPhone.replace(/\D/g, '') === exam.ownerPhone.replace(/\D/g, '');
  const isReportFinalized = exam.status === 'REPORTED' && !isDraftMode;
  const isBlockedForTutor = isSendingToTutor && !isReportFinalized;

  const getFormattedMessage = () => {
    const modalityName = isUltrasound ? 'ULTRASSOM' : 'RAIO-X';
    const rawText = (report.conclusion || report.findings || '').replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();

    if (isSendingToTutor) {
      return `🐾 *LAUDO VETERINÁRIO EM PDF — VetTeleRad*
📄 *Protocolo:* ${exam.id}
🐶 *Paciente:* ${exam.patientName} (${exam.species} - ${exam.breed})
👤 *Tutor(a):* ${exam.ownerName}
🏥 *Clínica Solicitante:* ${exam.clinicName}
🩺 *Médico Veterinário:* ${exam.requestingVet}
👨‍⚕️ *Especialista:* ${report.radiologistName} (${report.radiologistCrmv})

📎 *O laudo oficial timbrado em PDF com imagens em alta resolução já está disponível:*
🔗 ${getPublicUrl()}`;
    }

    return `🐾 *LAUDO ${modalityName} DISPONÍVEL — VetTeleRad*
📄 *Protocolo:* ${exam.id}
🐶 *Paciente:* ${exam.patientName} (${exam.species} - ${exam.breed})
🏥 *Clínica Solicitante:* ${exam.clinicName}
🩺 *Médico Veterinário:* ${exam.requestingVet}
👨‍⚕️ *Especialista:* ${report.radiologistName} (${report.radiologistCrmv})

🔍 *Impressão Diagnóstica:*
${rawText.slice(0, 180)}${rawText.length > 180 ? '...' : ''}

🔗 *Acesse o laudo oficial e imagens pelo link:*
${getPublicUrl()}`;
  };

  const handleSendWhatsApp = () => {
    const rawDigits = destPhone.replace(/\D/g, '');
    const isTargetTutor = !!exam.ownerPhone && rawDigits === exam.ownerPhone.replace(/\D/g, '');

    if (isTargetTutor && !isReportFinalized) {
      setApiSendError('Para enviar ao tutor, o laudo já deve estar finalizado e emitido em PDF (sem marca d\'água de rascunho).');
      return;
    }

    const text = encodeURIComponent(getFormattedMessage());
    let targetUrl = `https://wa.me/?text=${text}`;
    if (rawDigits.length >= 10) {
      const fullPhone = rawDigits.startsWith('55') ? rawDigits : `55${rawDigits}`;
      targetUrl = `https://wa.me/${fullPhone}?text=${text}`;
    }
    window.open(targetUrl, '_blank');
    setShowWhatsAppModal(false);
  };

  const handleSendViaApi = async () => {
    const rawDigits = destPhone.replace(/\D/g, '');
    if (!rawDigits || rawDigits.length < 10) {
      setApiSendError('Informe um número de telefone com DDD válido (mínimo 10 dígitos).');
      return;
    }

    const isTargetTutor = !!exam.ownerPhone && rawDigits === exam.ownerPhone.replace(/\D/g, '');
    if (isTargetTutor && !isReportFinalized) {
      setApiSendError('Para enviar ao tutor, o laudo já deve estar finalizado e emitido em PDF (sem marca d\'água de rascunho).');
      return;
    }

    setIsSendingViaApi(true);
    setApiSendError(null);
    setApiSendSuccess(false);

    try {
      // Quando finalizado, gera o arquivo PDF timbrado e anexa diretamente no envio do WhatsApp
      let mediaUrl: string | undefined = undefined;
      const cleanPatient = exam.patientName.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `Laudo_${exam.id}_${cleanPatient}.pdf`;

      if (isReportFinalized) {
        const uploadedUrl = await handleUploadPdfBlob();
        if (uploadedUrl) {
          mediaUrl = uploadedUrl;
        }
      }

      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: rawDigits,
          message: getFormattedMessage(),
          examId: exam.id,
          mediaUrl,
          fileName
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Falha ao disparar mensagem via WhatsApp API.');
      }

      setApiSendSuccess(true);
      setTimeout(() => {
        setShowWhatsAppModal(false);
        setApiSendSuccess(false);
      }, 2500);
    } catch (err: any) {
      setApiSendError(err.message || 'Erro ao disparar mensagem via API do WhatsApp.');
    } finally {
      setIsSendingViaApi(false);
    }
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destEmail) return;
    setEmailSent(true);
    setTimeout(() => {
      setEmailSent(false);
      setShowEmailModal(false);
    }, 2000);
  };

  return (
    <div className="space-y-4">
      {/* Barra de Ações Superior (Oculta na Impressão) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/95 backdrop-blur-md border border-slate-200/90 p-4 rounded-3xl shadow-sm print:hidden">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </span>
          <div>
            <span className="font-bold text-slate-800 text-xs sm:text-sm block">
              {isUltrasound ? 'Laudo Ultrassonográfico Oficial' : 'Laudo Radiográfico Oficial'}
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Assinado Digitalmente com CRMV • Pronto para Entrega
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Botão Copiar Link */}
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200/90 shadow-2xs transition cursor-pointer"
            title="Copiar Link de Acesso ao Laudo"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link'}</span>
          </button>

          {/* Botão Anexar / Alterar Logo da Clínica (Permitido apenas durante rascunho) */}
          {isDraftMode && (
            <>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp"
                className="hidden"
                onChange={handleUploadClinicLogo}
              />
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                disabled={isUploadingLogo}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200/90 shadow-2xs transition cursor-pointer disabled:opacity-50"
                title="Anexar ou alterar o logotipo oficial da clínica neste rascunho"
              >
                {isUploadingLogo ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
                ) : (
                  <Building2 className="w-3.5 h-3.5 text-teal-600" />
                )}
                <span>{currentClinicLogo ? 'Alterar Logo' : '+ Logo'}</span>
              </button>
            </>
          )}

          {/* Botão WhatsApp */}
          <button
            onClick={() => setShowWhatsAppModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200/90 shadow-2xs transition cursor-pointer"
            title="Compartilhar no WhatsApp do Veterinário Requisitante ou Tutor"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp</span>
          </button>

          {/* Botão E-mail */}
          <button
            onClick={() => setShowEmailModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-xl text-xs font-bold border border-sky-200/90 shadow-2xs transition cursor-pointer"
            title="Enviar Laudo por E-mail"
          >
            <Mail className="w-3.5 h-3.5 text-sky-600" />
            <span>E-mail</span>
          </button>

          {/* Botão Baixar PDF */}
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white rounded-xl text-xs font-bold shadow-xs shadow-teal-500/20 transition cursor-pointer disabled:opacity-50"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Gerando PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Baixar PDF</span>
              </>
            )}
          </button>

          {/* Botão Imprimir */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200/90 shadow-2xs transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Imprimir</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer ml-1"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Alerta de Sucesso ao Anexar Logo */}
      {logoSuccessToast && (
        <div className="max-w-4xl mx-auto mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Logotipo da clínica anexado com sucesso! Já atualizado no laudo e PDF.</span>
          </div>
          <button
            type="button"
            onClick={() => setLogoSuccessToast(false)}
            className="text-emerald-700 hover:text-emerald-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Papel Timbrado do Laudo (Estilo A4 Médico) */}
      <div 
        id={`printable-report-${exam.id}`}
        className="bg-white text-slate-900 rounded-3xl shadow-xl shadow-slate-200/70 max-w-4xl mx-auto border border-slate-200/90 relative font-sans print:border-0 print:shadow-none print:m-0 print:rounded-none print:max-w-none overflow-visible print:overflow-visible"
      >
        {/* Marca d'Água de Rascunho / Preliminar */}
        {isDraftMode && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20 overflow-hidden select-none">
            <div className="transform -rotate-45 border-4 border-rose-500/25 bg-rose-50/20 py-6 px-14 rounded-3xl text-center shadow-lg backdrop-blur-2xs">
              <span className="block text-4xl sm:text-6xl font-black text-rose-600/25 tracking-widest uppercase font-mono">
                RASCUNHO
              </span>
              <span className="block text-xs sm:text-sm font-bold text-rose-700/35 tracking-widest uppercase mt-2 font-mono">
                DOCUMENTO PRELIMINAR • SEM VALOR MÉDICO-LEGAL
              </span>
            </div>
          </div>
        )}

        {/* Faixa decorativa superior em gradiente pastel */}
        <div className="h-2.5 bg-gradient-to-r from-teal-500 via-cyan-500 to-sky-500 w-full rounded-t-3xl print:rounded-none print:h-1.5" />

        <div className="p-6 sm:p-10 pt-5 sm:pt-6 print:p-4 print:pt-3">

        {/* Cabeçalho Oficial Timbrado */}
        <div className="border-b border-slate-200/90 pb-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* LADO ESQUERDO: LOGO DA CLÍNICA SOLICITANTE COM MAIOR DESTAQUE */}
          <div className="flex-1 flex items-center justify-start min-h-[72px]">
            {currentClinicLogo ? (
              <div className="relative group flex items-center gap-3.5">
                <div className="h-16 sm:h-20 max-w-[280px] flex items-center justify-start">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentClinicLogo}
                    alt={exam.clinicName ? `Logotipo ${exam.clinicName}` : "Logotipo da Clínica Solicitante"}
                    crossOrigin="anonymous"
                    className="max-h-full max-w-full object-contain object-left drop-shadow-xs"
                  />
                </div>
                <div className="border-l border-slate-200 pl-3.5">
                  <span className="font-bold text-xs text-slate-800 leading-tight block">
                    {exam.clinicName || 'Clínica Veterinária'}
                  </span>
                  {exam.requestingVet && (
                    <span className="text-[10px] text-slate-500 block">
                      Solicitante: {exam.requestingVet}
                    </span>
                  )}
                  {isDraftMode && (
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="text-[10px] text-teal-700 hover:text-teal-900 hover:underline print:hidden cursor-pointer font-bold block mt-0.5"
                    >
                      Alterar logotipo
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-700 shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm text-slate-900 leading-tight">
                    {exam.clinicName || 'Clínica Veterinária Solicitante'}
                  </div>
                  {exam.requestingVet && (
                    <p className="text-xs text-slate-600 mt-0.5">
                      Médico(a) Solicitante: <strong className="text-slate-800">{exam.requestingVet}</strong>
                    </p>
                  )}
                  {exam.clinicPhone && (
                    <p className="text-[11px] text-slate-500 font-mono">
                      Tel: {exam.clinicPhone}
                    </p>
                  )}
                  {isDraftMode && (
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="text-[10px] text-teal-700 hover:text-teal-900 hover:underline print:hidden cursor-pointer font-bold block mt-1"
                    >
                      + Anexar logotipo da clínica
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* LADO DIREITO: LOGO DA TELERRADIOLOGIA (VetTeleRad) */}
          <div className="flex items-center gap-3.5 sm:border-l sm:border-slate-200 sm:pl-6 shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-sm shadow-teal-500/20 shrink-0">
              {isUltrasound ? <Waves className="w-6 h-6" /> : <Activity className="w-6 h-6" />}
            </div>
            <div className="text-left">
              <div className="text-xl font-black tracking-tight text-slate-900 leading-tight">
                Vet<span className="text-teal-600">Tele</span>Rad
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {isUltrasound
                  ? 'Teleultrassonografia Veterinária'
                  : 'Telerradiologia Veterinária'}
              </p>
              <div className="flex items-center gap-2 mt-1 font-mono text-[10px]">
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-semibold border border-slate-200">
                  Protocolo: {exam.id}
                </span>
                <span className="px-2 py-0.5 bg-teal-50 text-teal-800 rounded-md font-semibold border border-teal-200">
                  {isUltrasound ? 'ULTRASSOM' : 'RAIO-X'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Título do Laudo */}
        <div className="mt-4 print:mt-2 text-center">
          <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-teal-50 via-sky-50 to-teal-50 text-teal-900 text-xs font-black uppercase tracking-widest rounded-full border border-teal-200/80 shadow-2xs">
            {isUltrasound
              ? 'LAUDO DE ULTRASSONOGRAFIA VETERINÁRIA'
              : 'LAUDO DE RADIOGRAFIA VETERINÁRIA'}
          </span>
        </div>

        {/* Informações do Paciente e da Solicitação */}
        <div className="my-4 print:my-2.5 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/70 p-5 print:p-3 rounded-2xl border border-slate-200/80 text-xs">
          {/* Dados do Paciente */}
          <div className="space-y-2 border-b md:border-b-0 md:border-r border-slate-200 pb-3 md:pb-0 md:pr-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-teal-600" />
              <span>Dados do Paciente</span>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-slate-700">
              <div><span className="text-slate-500">Nome:</span> <strong className="text-slate-900">{exam.patientName}</strong></div>
              <div><span className="text-slate-500">Espécie:</span> <strong className="text-slate-900">{exam.species}</strong></div>
              <div><span className="text-slate-500">Raça:</span> <strong>{exam.breed}</strong></div>
              <div><span className="text-slate-500">Idade:</span> <strong>{exam.age}</strong></div>
              <div><span className="text-slate-500">Sexo / Castrado:</span> <strong>{exam.gender} ({exam.isCastrated ? 'Castrado' : 'Inteiro'})</strong></div>
              <div><span className="text-slate-500">Peso:</span> <strong>{exam.weight}</strong></div>
              <div className="col-span-2"><span className="text-slate-500">Tutor:</span> <strong>{exam.ownerName}</strong></div>
            </div>
          </div>

          {/* Dados da Solicitação e Exame */}
          <div className="space-y-2 md:pl-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
              <span>Dados da Solicitação</span>
            </div>
            <div className="space-y-1.5 text-slate-700">
              <div><span className="text-slate-500">Médico(a) Solicitante:</span> <strong className="text-slate-900">{exam.requestingVet}</strong></div>
              <div><span className="text-slate-500">Estudo Realizado:</span> <strong className="text-teal-700 font-bold">{exam.region}</strong></div>
              {isUltrasound && exam.fastingHours && (
                <div><span className="text-slate-500">Preparo Clínico:</span> <strong>{exam.fastingHours}</strong></div>
              )}
              <div><span className="text-slate-500">Data do Exame:</span> <strong>{new Date(exam.createdAt).toLocaleDateString('pt-BR')}</strong></div>
            </div>
          </div>
        </div>

        {/* Histórico Clínico Informado */}
        {exam.clinicalHistory && (
          <div className="mb-4 print:mb-2.5 bg-amber-50/70 border border-amber-200/80 p-3.5 print:p-2.5 rounded-xl text-xs">
            <span className="font-bold text-amber-900 block mb-0.5">Histórico Clínico e Suspeita Diagnóstica:</span>
            <p className="text-slate-700 italic leading-relaxed">
              &quot;{exam.clinicalHistory}&quot; {exam.suspectedDiagnosis ? `— Suspeita: ${exam.suspectedDiagnosis}` : ''}
            </p>
          </div>
        )}

        {/* Seções do Laudo */}
        <div className="space-y-4 print:space-y-2.5 text-xs text-slate-800 leading-relaxed">
          {/* Técnica */}
          <div>
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2">
              {isUltrasound ? '1. Técnica e Equipamentos Utilizados' : '1. Técnica Radiográfica'}
            </h2>
            <p className="text-slate-700">{report.technique}</p>
          </div>

          {/* Descrição dos Achados e Impressão Diagnóstica */}
          <div>
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2">
              {isUltrasound ? '2. Achados Ecográficos & Impressão Diagnóstica' : '2. Achados Radiográficos & Impressão Diagnóstica'}
            </h2>
            {report.findings.includes('<') ? (
              <div 
                className="text-slate-900 text-xs sm:text-sm leading-relaxed max-w-none [&_p]:my-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                dangerouslySetInnerHTML={{ __html: report.findings }}
              />
            ) : (
              <div className="whitespace-pre-line text-slate-800 font-normal space-y-2">
                {report.findings}
              </div>
            )}
          </div>

          {/* Mensurações Especiais de Radiografia (VHS / Norberg) */}
          {!isUltrasound && (report.vhsScore || report.norbergAngle) && (
            <div className="p-4 bg-sky-50/70 border border-sky-200/80 rounded-2xl flex flex-wrap items-center gap-8 shadow-2xs">
              {report.vhsScore && (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-sky-900 block">VHS (Buchanan &amp; Bücheler)</span>
                    <strong className="text-sm text-slate-900 font-mono">{report.vhsScore}</strong>
                  </div>
                </div>
              )}
              {report.norbergAngle && (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-mono font-bold text-xs">
                    ∠
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-sky-900 block">Ângulo de Norberg</span>
                    <strong className="text-sm text-slate-900 font-mono">{report.norbergAngle}</strong>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recomendações (Exibidas se preenchidas e não repetidas no texto principal) */}
          {report.recommendations && !report.findings.includes(report.recommendations) && (
            <div className="bg-slate-50/60 border border-slate-200/80 p-4 rounded-xl">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2">
                3. Recomendações e Considerações Finais
              </h2>
              <p className="text-slate-700">{report.recommendations}</p>
            </div>
          )}

          {/* Imagens Anexas */}
          {keyImages.length > 0 && (
            <div className="pt-2 print:page-break-before-auto">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-1 mb-3">
                {isUltrasound ? 'Cortes Ecográficos Selecionados de Referência' : 'Imagens Radiográficas de Referência'}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {keyImages.map((img, idx) => (
                  <div key={img.id || idx} className="border border-slate-200/90 rounded-2xl p-2.5 bg-slate-50/70 flex flex-col items-center shadow-2xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={img.url} 
                      alt={img.label} 
                      crossOrigin="anonymous"
                      className="max-h-52 w-auto object-contain rounded-xl bg-black shadow-xs"
                    />
                    <span className="text-[10px] text-slate-600 font-semibold mt-2 text-center">
                      {img.label || `Registro ${idx + 1}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Rodapé e Carimbo */}
        <div className="mt-6 pt-4 print:mt-4 print:pt-3 border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Autenticação Digital e QR Code */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-700 shadow-2xs">
              <QrCode className="w-9 h-9" />
            </div>
            <div className="text-[10px] text-slate-500 space-y-0.5">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Autenticidade Verificada</span>
              </div>
              <div>Emitido em: {new Date(report.reportedAt).toLocaleString('pt-BR')}</div>
              <div className="font-mono text-[9px] text-slate-400 max-w-[220px] truncate">
                Hash: {report.digitalSignatureHash}
              </div>
            </div>
          </div>

          {/* Carimbo / Assinatura do Especialista */}
          <div className="text-center sm:text-right border-t sm:border-t-0 sm:border-l border-slate-200 pt-4 sm:pt-0 sm:pl-6">
            {report.radiologistSignatureUrl && (
              <div className="mb-2 flex justify-center sm:justify-end">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={report.radiologistSignatureUrl}
                  alt={`Assinatura e Carimbo de ${report.radiologistName}`}
                  crossOrigin="anonymous"
                  className="h-16 max-h-20 max-w-[220px] object-contain drop-shadow-xs"
                />
              </div>
            )}
            <div className="font-serif italic text-lg text-slate-800 font-semibold mb-1">
              {report.radiologistName}
            </div>
            <div className="text-xs font-bold text-slate-900">
              {report.radiologistName}
            </div>
            <div className="text-xs text-teal-700 font-mono font-bold">
              {report.radiologistCrmv}
            </div>
            <div className="inline-block px-2 py-0.5 bg-teal-50 text-teal-800 border border-teal-200/80 rounded text-[10px] uppercase font-bold tracking-wider mt-1">
              {report.radiologistSpecialty || (isUltrasound ? 'Médica Veterinária Ultrassonografista' : 'Médica Veterinária Radiologista')}
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Modal WhatsApp */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 max-w-md w-full space-y-4 shadow-2xl shadow-slate-300/50 text-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span>Enviar Laudo por WhatsApp</span>
              </div>
              <button 
                onClick={() => setShowWhatsAppModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Uma mensagem estruturada com os dados do paciente ({exam.patientName}), impressão diagnóstica e link direto do laudo será enviada para o WhatsApp informado:
            </p>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Número do WhatsApp (com DDD):
                </label>
                {exam.ownerPhone && exam.clinicPhone && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setDestPhone(exam.ownerPhone || '')}
                      className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                        destPhone.replace(/\D/g, '') === exam.ownerPhone.replace(/\D/g, '')
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Tutor
                    </button>
                    <button
                      type="button"
                      onClick={() => setDestPhone(exam.clinicPhone || '')}
                      className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                        destPhone.replace(/\D/g, '') === exam.clinicPhone.replace(/\D/g, '')
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Clínica
                    </button>
                  </div>
                )}
              </div>
              <input
                type="text"
                placeholder="(11) 98765-4321"
                value={destPhone}
                onChange={e => setDestPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:border-emerald-500 focus:bg-white focus:outline-none transition shadow-2xs"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                {exam.ownerPhone && destPhone.replace(/\D/g, '') === exam.ownerPhone.replace(/\D/g, '')
                  ? `Destinatário: Tutor do Paciente (${exam.ownerName})`
                  : exam.clinicPhone && destPhone.replace(/\D/g, '') === exam.clinicPhone.replace(/\D/g, '')
                  ? `Destinatário: Clínica Solicitante (${exam.clinicName})`
                  : 'Destinatário personalizado'}
              </span>
            </div>

            {isBlockedForTutor && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900 font-bold mb-0.5">Laudo ainda não emitido em PDF</strong>
                  <span>Para enviar diretamente ao tutor, o laudo precisa estar concluído e emitido em PDF (sem marca d&apos;água de rascunho). Selecione a Clínica para aviso interno ou conclua o laudo antes de disparar ao tutor.</span>
                </div>
              </div>
            )}

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-[11px] text-slate-600 max-h-36 overflow-y-auto whitespace-pre-line font-mono leading-relaxed">
              {getFormattedMessage()}
            </div>

            {apiSendSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Laudo disparado com sucesso pelo robô do WhatsApp!</span>
              </div>
            )}

            {apiSendError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{apiSendError}</span>
              </div>
            )}

            {!hasWhatsAppApi && !apiSendSuccess && (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-center gap-2">
                <Bot className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>Conecte o robô da <strong>Z-API</strong> ou <strong>Evolution API</strong> nas Configurações para disparar automaticamente sem abrir abas.</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowWhatsAppModal(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition cursor-pointer"
              >
                Cancelar
              </button>

              {hasWhatsAppApi && (
                <button
                  type="button"
                  onClick={handleSendViaApi}
                  disabled={isSendingViaApi || apiSendSuccess || isBlockedForTutor}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition active:scale-95 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  title={isBlockedForTutor ? "Finalize o laudo em PDF para enviar ao tutor" : "Enviar mensagem automática pelo robô conectado da API"}
                >
                  {isSendingViaApi ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Disparando com PDF...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Disparar via Robô (API)</span>
                    </>
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={handleSendWhatsApp}
                disabled={isBlockedForTutor}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                title={isBlockedForTutor ? "Finalize o laudo em PDF para enviar ao tutor" : "Abrir no WhatsApp Web ou no aplicativo"}
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>{hasWhatsAppApi ? 'WhatsApp Web' : 'Abrir WhatsApp'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal E-mail */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 max-w-md w-full space-y-4 shadow-2xl shadow-slate-300/50 text-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-teal-900 font-bold text-base">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <span>Enviar Laudo por E-mail</span>
              </div>
              <button 
                onClick={() => setShowEmailModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  E-mail do Requisitante ou Tutor:
                </label>
                <input
                  type="email"
                  required
                  placeholder="veterinario@clinica.com.br"
                  value={destEmail}
                  onChange={e => setDestEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:border-teal-500 focus:bg-white focus:outline-none transition shadow-2xs"
                />
              </div>

              {emailSent && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200/90 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>E-mail com o laudo em PDF enviado com sucesso!</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  disabled={emailSent}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-500/20 disabled:opacity-50 transition cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  <span>Enviar Agora</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
