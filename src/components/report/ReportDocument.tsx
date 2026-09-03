'use client';

import React, { useState } from 'react';
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
  X
} from 'lucide-react';
import { Exam } from '@/types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ReportDocumentProps {
  exam: Exam;
  onClose?: () => void;
}

export const ReportDocument: React.FC<ReportDocumentProps> = ({ exam, onClose }) => {
  const report = exam.report;
  const isUltrasound = exam.modality === 'ULTRASSOM';

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [destPhone, setDestPhone] = useState(exam.clinicPhone || '');
  const [destEmail, setDestEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

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

  const handleDownloadPdf = async () => {
    const docEl = document.getElementById(`printable-report-${exam.id}`);
    if (!docEl) return;

    setIsGeneratingPdf(true);
    try {
      const canvas = await html2canvas(docEl, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const pageHeight = pdf.internal.pageSize.getHeight();

      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
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

  const getPublicUrl = () => {
    return typeof window !== 'undefined' ? `${window.location.origin}/laudo/${exam.id}` : '';
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getPublicUrl());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const getFormattedMessage = () => {
    const modalityName = isUltrasound ? 'ULTRASSOM' : 'RAIO-X';
    return `🐾 *LAUDO ${modalityName} DISPONÍVEL — VetTeleRad*
📄 *Protocolo:* ${exam.id}
🐶 *Paciente:* ${exam.patientName} (${exam.species} - ${exam.breed})
🏥 *Clínica Solicitante:* ${exam.clinicName}
🩺 *Médico Veterinário:* ${exam.requestingVet}
👨‍⚕️ *Especialista:* ${report.radiologistName} (${report.radiologistCrmv})

🔍 *Conclusão Diagnóstica:*
${report.conclusion.slice(0, 180)}${report.conclusion.length > 180 ? '...' : ''}

🔗 *Acesse o laudo oficial e imagens pelo link:*
${getPublicUrl()}`;
  };

  const handleSendWhatsApp = () => {
    const text = encodeURIComponent(getFormattedMessage());
    const digitsOnly = destPhone.replace(/\D/g, '');
    let targetUrl = `https://wa.me/?text=${text}`;
    if (digitsOnly.length >= 10) {
      const fullPhone = digitsOnly.startsWith('55') ? digitsOnly : `55${digitsOnly}`;
      targetUrl = `https://wa.me/${fullPhone}?text=${text}`;
    }
    window.open(targetUrl, '_blank');
    setShowWhatsAppModal(false);
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

          {/* Botão WhatsApp */}
          <button
            onClick={() => setShowWhatsAppModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200/80 shadow-2xs transition cursor-pointer"
            title="Compartilhar no WhatsApp do Veterinário Requisitante ou Tutor"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp</span>
          </button>

          {/* Botão E-mail */}
          <button
            onClick={() => setShowEmailModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-xl text-xs font-bold border border-sky-200/80 shadow-2xs transition cursor-pointer"
            title="Enviar Laudo por E-mail"
          >
            <Mail className="w-3.5 h-3.5 text-sky-600" />
            <span>E-mail</span>
          </button>

          {/* Botão Download PDF Direto */}
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-500/20 transition cursor-pointer disabled:opacity-50 active:scale-95"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Gerando PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Baixar PDF Timbrado</span>
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
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Papel Timbrado do Laudo (Estilo A4 Médico) */}
      <div 
        id={`printable-report-${exam.id}`}
        className="bg-white text-slate-900 p-8 sm:p-12 rounded-3xl shadow-xl shadow-slate-200/70 max-w-4xl mx-auto border border-slate-200/90 relative overflow-hidden font-sans print:border-0 print:shadow-none print:p-0 print:m-0 print:rounded-none"
      >
        {/* Faixa decorativa superior em gradiente pastel */}
        <div className="h-2 bg-gradient-to-r from-teal-500 via-cyan-500 to-sky-500 -mx-8 sm:-mx-12 -mt-8 sm:-mt-12 mb-8 print:h-1.5 print:mb-6" />

        {/* Cabeçalho Oficial Timbrado */}
        <div className="border-b border-slate-200/90 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-sm shadow-teal-500/20">
              {isUltrasound ? <Waves className="w-7 h-7" /> : <Activity className="w-7 h-7" />}
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Vet<span className="text-teal-600">Tele</span>Rad
              </h1>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {isUltrasound
                  ? 'Centro Especializado de Teleultrassonografia Veterinária'
                  : 'Centro Especializado de Telerradiologia Veterinária'}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-500 sm:border-l sm:border-slate-200 sm:pl-5">
            <div className="font-bold text-slate-800">Central Nacional de Diagnóstico</div>
            <div>contato@vettelerad.com.br • (11) 3003-9820</div>
            <div className="flex sm:justify-end items-center gap-2 mt-1 font-mono text-[11px]">
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-semibold border border-slate-200">
                Protocolo: {exam.id}
              </span>
              <span className="px-2 py-0.5 bg-teal-50 text-teal-800 rounded-md font-semibold border border-teal-200">
                {isUltrasound ? 'ULTRASSOM' : 'RAIO-X'}
              </span>
            </div>
          </div>
        </div>

        {/* Título do Laudo */}
        <div className="mt-5 text-center">
          <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-teal-50 via-sky-50 to-teal-50 text-teal-900 text-xs font-black uppercase tracking-widest rounded-full border border-teal-200/80 shadow-2xs">
            {isUltrasound
              ? 'LAUDO DE ULTRASSONOGRAFIA VETERINÁRIA'
              : 'LAUDO DE RADIOGRAFIA VETERINÁRIA'}
          </span>
        </div>

        {/* Informações do Paciente e da Clínica */}
        <div className="my-5 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 text-xs">
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

          {/* Dados da Clínica e Solicitante */}
          <div className="space-y-2 md:pl-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-sky-800 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-sky-600" />
              <span>Clínica Solicitante</span>
            </div>
            <div className="space-y-1.5 text-slate-700">
              <div><span className="text-slate-500">Estabelecimento:</span> <strong className="text-slate-900">{exam.clinicName}</strong></div>
              <div><span className="text-slate-500">Médico Solicitante:</span> <strong>{exam.requestingVet}</strong></div>
              <div><span className="text-slate-500">Estudo Realizado:</span> <strong className="text-teal-700">{exam.region}</strong></div>
              {isUltrasound && exam.fastingHours && (
                <div><span className="text-slate-500">Preparo Clínico:</span> <strong>{exam.fastingHours}</strong></div>
              )}
              <div><span className="text-slate-500">Data do Exame:</span> <strong>{new Date(exam.createdAt).toLocaleDateString('pt-BR')}</strong></div>
            </div>
          </div>
        </div>

        {/* Histórico Clínico Informado */}
        {exam.clinicalHistory && (
          <div className="mb-6 bg-amber-50/70 border border-amber-200/80 p-3.5 rounded-xl text-xs">
            <span className="font-bold text-amber-900 block mb-0.5">Histórico Clínico e Suspeita Diagnóstica:</span>
            <p className="text-slate-700 italic leading-relaxed">
              &quot;{exam.clinicalHistory}&quot; {exam.suspectedDiagnosis ? `— Suspeita: ${exam.suspectedDiagnosis}` : ''}
            </p>
          </div>
        )}

        {/* Seções do Laudo */}
        <div className="space-y-6 text-xs text-slate-800 leading-relaxed">
          {/* Técnica */}
          <div>
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2">
              {isUltrasound ? '1. Técnica e Equipamentos Utilizados' : '1. Técnica Radiográfica'}
            </h2>
            <p className="text-slate-700">{report.technique}</p>
          </div>

          {/* Descrição dos Achados */}
          <div>
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2">
              {isUltrasound ? '2. Descrição dos Achados Ecográficos dos Órgãos' : '2. Descrição dos Achados Radiográficos'}
            </h2>
            <div className="whitespace-pre-line text-slate-800 font-normal space-y-2">
              {report.findings}
            </div>
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

          {/* Conclusão Diagnóstica - Destaque em Pastel */}
          <div className="p-5 bg-gradient-to-r from-teal-50/90 via-emerald-50/60 to-sky-50/80 border-2 border-teal-500/70 rounded-2xl shadow-xs text-slate-900 print:border-teal-600">
            <h2 className="text-xs font-black text-teal-900 uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              <span>3. Conclusão Diagnóstica</span>
            </h2>
            <div className="whitespace-pre-line font-bold text-slate-900 text-xs sm:text-sm leading-relaxed">
              {report.conclusion}
            </div>
          </div>

          {/* Recomendações */}
          {report.recommendations && (
            <div className="bg-slate-50/60 border border-slate-200/80 p-4 rounded-xl">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2">
                4. Recomendações e Considerações Finais
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
        <div className="mt-10 pt-6 border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
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
              {isUltrasound ? 'Médica Veterinária Ultrassonografista' : 'Médica Veterinária Radiologista'}
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
              Uma mensagem estruturada com os dados do paciente ({exam.patientName}), conclusão diagnóstica e link direto do laudo será enviada para o WhatsApp informado:
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Número do WhatsApp (com DDD):
              </label>
              <input
                type="text"
                placeholder="(11) 98765-4321"
                value={destPhone}
                onChange={e => setDestPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:border-emerald-500 focus:bg-white focus:outline-none transition shadow-2xs"
              />
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-[11px] text-slate-600 max-h-36 overflow-y-auto whitespace-pre-line font-mono leading-relaxed">
              {getFormattedMessage()}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowWhatsAppModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Abrir WhatsApp</span>
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
