'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle, 
  Stethoscope, 
  Save, 
  Image as ImageIcon, 
  Waves, 
  Activity,
  BookOpen,
  Send,
  Loader2,
  MessageSquare,
  PenTool
} from 'lucide-react';
import { Exam, ReportTemplate, User } from '@/types';
import { REPORT_TEMPLATES } from '@/data/templates';
import { RichTextEditor } from '@/components/common/RichTextEditor';
import { SaveToCasotecaModal } from '@/components/cases/SaveToCasotecaModal';
import { VetSignatureModal } from '@/components/dashboard/VetSignatureModal';

interface ReportEditorProps {
  exam: Exam;
  currentRadiologistName: string;
  currentRadiologistCrmv: string;
  onReportSaved: (updatedExam: Exam) => void;
  vhsScore?: string;
  capturedKeyImages?: string[];
}

export const ReportEditor: React.FC<ReportEditorProps> = ({
  exam,
  currentRadiologistName,
  currentRadiologistCrmv,
  onReportSaved,
  vhsScore: initialVhsScore,
  capturedKeyImages = []
}) => {
  const existingReport = exam.report;
  const isUltrasound = exam.modality === 'ULTRASSOM';

  const defaultTechnique = isUltrasound
    ? 'Exame ultrassonográfico realizado em aparelho de alta resolução com transdutores microconvexo e linear multifrequenciais (5.0 a 10.0 MHz), após tricotomia e aplicação de gel acústico.'
    : 'Estudo radiográfico obtido em projeções ortogonais com técnica de alto contraste e foco fino.';

  // Conteúdo inicial unificado (achados + impressão diagnóstica)
  const getInitialContent = () => {
    if (!existingReport) return '';
    if (existingReport.findings && (existingReport.findings.includes('IMPRESSÃO DIAGNÓSTICA') || existingReport.findings.includes('<p>'))) {
      return existingReport.findings;
    }
    if (existingReport.findings && existingReport.conclusion && existingReport.findings !== existingReport.conclusion) {
      return `<p style="margin-bottom: 6px;"><strong style="text-decoration: underline; font-size: 13px;">DESCRIÇÃO DOS ACHADOS:</strong></p><p>${existingReport.findings.replace(/\n/g, '<br>')}</p><p><br></p><p style="margin-bottom: 6px;"><strong style="text-decoration: underline; font-size: 13px;">IMPRESSÃO DIAGNÓSTICA:</strong></p><p><strong>${existingReport.conclusion.replace(/\n/g, '<br>')}</strong></p>`;
    }
    return existingReport.findings || existingReport.conclusion || '';
  };

  const [technique, setTechnique] = useState(existingReport?.technique || defaultTechnique);
  const [reportContent, setReportContent] = useState<string>(getInitialContent);
  const [recommendations, setRecommendations] = useState(
    existingReport?.recommendations || 
    'Correlação com os dados clínicos, laboratoriais e evolução do paciente. Novos exames de imagem complementares a critério médico veterinário.'
  );
  const [vhsScore, setVhsScore] = useState(existingReport?.vhsScore || initialVhsScore || '');
  const [norbergAngle, setNorbergAngle] = useState(existingReport?.norbergAngle || '');
  const [selectedKeyImages, setSelectedKeyImages] = useState<string[]>(
    existingReport?.keyImageIds || capturedKeyImages
  );

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showCasotecaModal, setShowCasotecaModal] = useState(false);

  const [allTemplates, setAllTemplates] = useState<ReportTemplate[]>(REPORT_TEMPLATES);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentUserSignature, setCurrentUserSignature] = useState<string | undefined>(undefined);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<string | null>(null);
  const [draftRecovered, setDraftRecovered] = useState(false);

  // WhatsApp API states
  const [hasWhatsAppApi, setHasWhatsAppApi] = useState(false);
  const [isSendingViaApi, setIsSendingViaApi] = useState(false);
  const [apiSentSuccess, setApiSentSuccess] = useState(false);
  const [apiSendError, setApiSendError] = useState<string | null>(null);

  // Carregar templates, assinatura do especialista e status do WhatsApp
  useEffect(() => {
    fetch('/api/templates')
      .then(r => r.json())
      .then(d => {
        if (d.templates && d.templates.length > 0) {
          setAllTemplates(d.templates);
        }
      })
      .catch(() => {});

    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        if (d.user) {
          setCurrentUser(d.user);
          if (d.user.signatureImage) {
            setCurrentUserSignature(d.user.signatureImage);
          }
        }
      })
      .catch(() => {});

    fetch('/api/whatsapp/config')
      .then(r => r.json())
      .then(d => {
        if (d.resolvedConfig?.enabled) {
          setHasWhatsAppApi(true);
        }
      })
      .catch(() => {});
  }, []);

  // 1. Recuperar rascunho anterior automaticamente caso o exame ainda não tenha laudo
  useEffect(() => {
    if (!existingReport && typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(`vet_draft_${exam.id}`);
        if (raw) {
          const draft = JSON.parse(raw);
          if (draft.reportContent) setReportContent(draft.reportContent);
          if (draft.technique) setTechnique(draft.technique);
          if (draft.recommendations) setRecommendations(draft.recommendations);
          if (draft.vhsScore) setVhsScore(draft.vhsScore);
          if (draft.norbergAngle) setNorbergAngle(draft.norbergAngle);
          if (draft.selectedKeyImages) setSelectedKeyImages(draft.selectedKeyImages);
          if (draft.savedAt) {
            setLastAutoSaveTime(new Date(draft.savedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
          }
          setDraftRecovered(true);
        }
      } catch (e) {
        console.error('Erro ao restaurar rascunho:', e);
      }
    }
  }, [exam.id, existingReport]);

  // 2. Salvamento Automático periódico a cada alteração (debounced 1.5s)
  useEffect(() => {
    if (existingReport) return;

    const timer = setTimeout(() => {
      if (reportContent && reportContent.trim() && typeof window !== 'undefined') {
        try {
          const now = new Date();
          localStorage.setItem(`vet_draft_${exam.id}`, JSON.stringify({
            reportContent,
            technique,
            recommendations,
            vhsScore,
            norbergAngle,
            selectedKeyImages,
            savedAt: now.toISOString()
          }));
          setLastAutoSaveTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
        } catch (e) {
          console.error('Erro ao salvar rascunho:', e);
        }
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [reportContent, technique, recommendations, vhsScore, norbergAngle, selectedKeyImages, exam.id, existingReport]);

  // Filtrar templates por modalidade correspondente ou exibir agrupados
  const usgTemplates = allTemplates.filter(t => t.modality === 'ULTRASSOM');
  const xrayTemplates = allTemplates.filter(t => t.modality === 'RADIOGRAFIA');

  // Sugestão inteligente para a região anatômica do exame
  const matchedTemplate = useMemo(() => {
    if (!exam.region) return null;
    const regLower = exam.region.toLowerCase();
    return allTemplates.find(t => 
      t.title.toLowerCase().includes(regLower) ||
      regLower.includes(t.title.toLowerCase()) ||
      t.id.toLowerCase().includes(regLower)
    );
  }, [allTemplates, exam.region]);

  const handleSelectTemplate = (templateId: string) => {
    const tpl = allTemplates.find(t => t.id === templateId);
    if (!tpl) return;

    if (reportContent && reportContent.trim() && !confirm('Deseja substituir o texto atual pelos dados do modelo selecionado?')) {
      return;
    }

    setTechnique(tpl.technique);
    setRecommendations(tpl.recommendations || '');

    const unifiedHtml = `<p style="margin-bottom: 6px;"><strong style="text-decoration: underline; font-size: 13px;">DESCRIÇÃO DOS ACHADOS:</strong></p><p>${tpl.findings.replace(/\n/g, '<br>')}</p><p><br></p><p style="margin-bottom: 6px;"><strong style="text-decoration: underline; font-size: 13px;">IMPRESSÃO DIAGNÓSTICA:</strong></p><p><strong>${tpl.conclusion.replace(/\n/g, '<br>')}</strong></p>${tpl.recommendations ? `<p><br></p><p style="margin-bottom: 6px;"><strong style="text-decoration: underline; font-size: 13px;">RECOMENDAÇÕES:</strong></p><p>${tpl.recommendations.replace(/\n/g, '<br>')}</p>` : ''}`;

    setReportContent(unifiedHtml);
  };

  const handleToggleKeyImage = (imageId: string) => {
    setSelectedKeyImages(prev => 
      prev.includes(imageId) ? prev.filter(id => id !== imageId) : [...prev, imageId]
    );
  };

  const handleSaveReport = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!reportContent || !reportContent.trim()) {
      setErrorMsg('O campo unificado de Achados e Impressão Diagnóstica é obrigatório.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/exams/${exam.id}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          technique,
          findings: reportContent,
          conclusion: reportContent,
          recommendations,
          vhsScore: isUltrasound ? undefined : (vhsScore.trim() || undefined),
          norbergAngle: isUltrasound ? undefined : (norbergAngle.trim() || undefined),
          keyImageIds: selectedKeyImages,
          radiologistSignatureUrl: currentUserSignature || currentUser?.signatureImage,
          radiologistSpecialty: currentUser?.specialty
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Falha ao emitir laudo');
      }

      // Limpar rascunho após salvar com sucesso
      try {
        localStorage.removeItem(`vet_draft_${exam.id}`);
        setLastAutoSaveTime(null);
      } catch {}

      // Notificar o sistema em tempo real
      try {
        fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'REPORT_READY',
            title: `✅ Laudo Concluído: ${exam.patientName}`,
            message: `O laudo de ${exam.patientName} (${exam.species}) foi assinado digitalmente por ${currentRadiologistName}.`,
            targetRole: 'CLINIC',
            examId: exam.id,
            link: `/laudo/${exam.id}`
          })
        });
      } catch (err) {
        console.debug(err);
      }

      setSuccessMsg(`Laudo de ${isUltrasound ? 'Ultrassonografia' : 'Radiografia'} emitido e assinado com sucesso!`);
      onReportSaved(data.exam);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar laudo';
      setErrorMsg(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendWhatsAppNotification = async () => {
    // Regra: Envia para o telefone do tutor se preenchido; se não, vai para a clínica solicitante
    const rawPhone = exam.ownerPhone || exam.clinicPhone || '';
    const digitsOnly = rawPhone.replace(/\D/g, '');

    const publicLaudoUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/laudo/${exam.id}`;
    const textMessage = `🐾 *LAUDO VETERINÁRIO CONCLUÍDO — VetTeleRad*
📄 *Protocolo:* ${exam.id}
🐶 *Paciente:* ${exam.patientName} (${exam.species} - ${exam.breed})
👤 *Tutor:* ${exam.ownerName}
🏥 *Clínica Solicitante:* ${exam.clinicName}
🩺 *Médico Veterinário:* ${exam.requestingVet}
👨‍⚕️ *Especialista:* ${currentRadiologistName} (${currentRadiologistCrmv})

🔗 *Acesse o laudo oficial timbrado e imagens:*
${publicLaudoUrl}`;

    if (!hasWhatsAppApi || !digitsOnly || digitsOnly.length < 10) {
      const text = encodeURIComponent(textMessage);
      const targetUrl = digitsOnly.length >= 10
        ? `https://wa.me/${digitsOnly.startsWith('55') ? digitsOnly : `55${digitsOnly}`}?text=${text}`
        : `https://wa.me/?text=${text}`;
      window.open(targetUrl, '_blank');
      return;
    }

    setIsSendingViaApi(true);
    setApiSendError(null);
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: digitsOnly,
          message: textMessage,
          examId: exam.id
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Falha ao disparar no WhatsApp');
      }

      setApiSentSuccess(true);
    } catch (err: any) {
      setApiSendError(err.message || 'Erro no envio da mensagem.');
    } finally {
      setIsSendingViaApi(false);
    }
  };

  return (
    <div className="bg-white/95 border border-slate-200/90 p-5 lg:p-7 space-y-6 text-slate-800 min-h-full rounded-3xl shadow-xs">
      {/* Header com Status e Seletor de Templates */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            {isUltrasound ? (
              <div className="flex items-center gap-2 text-teal-700">
                <span className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center">
                  <Waves className="w-4 h-4 text-teal-600" />
                </span>
                <h2 className="text-base sm:text-lg font-black text-slate-900">Laudo de Ultrassonografia Veterinária</h2>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sky-700">
                <span className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-sky-600" />
                </span>
                <h2 className="text-base sm:text-lg font-black text-slate-900">Laudo Radiológico Veterinário</h2>
              </div>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Exame: <strong className="text-slate-800 font-mono">{exam.id}</strong> | Paciente:{' '}
            <strong className="text-teal-700">{exam.patientName} ({exam.species})</strong>
            {exam.fastingHours && (
              <span className="text-slate-600 ml-2 font-medium">• {exam.fastingHours}</span>
            )}
          </p>
        </div>

        {/* Dropdown de Modelos Rápidos agrupados */}
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <select
            onChange={e => handleSelectTemplate(e.target.value)}
            defaultValue=""
            className="bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-teal-500 transition cursor-pointer max-w-[280px] shadow-2xs"
          >
            <option value="" disabled>
              ⚡ Inserir Modelo Pré-configurado...
            </option>

            {isUltrasound ? (
              <>
                <optgroup label="Modelos de Ultrassonografia (USG)">
                  {usgTemplates.map(tpl => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.title}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Modelos de Radiografia">
                  {xrayTemplates.map(tpl => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.title}
                    </option>
                  ))}
                </optgroup>
              </>
            ) : (
              <>
                <optgroup label="Modelos de Radiografia (Raio-X)">
                  {xrayTemplates.map(tpl => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.title}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Modelos de Ultrassonografia">
                  {usgTemplates.map(tpl => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.title}
                    </option>
                  ))}
                </optgroup>
              </>
            )}
          </select>

          {matchedTemplate && !reportContent && (
            <button
              type="button"
              onClick={() => handleSelectTemplate(matchedTemplate.id)}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 text-amber-800 text-xs font-bold rounded-xl transition active:scale-95 cursor-pointer shadow-2xs"
              title="Inserir modelo pré-configurado desta região anatômica"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Inserir Modelo de {exam.region}</span>
            </button>
          )}

          {lastAutoSaveTime && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 border border-teal-200/80 text-teal-800 rounded-xl text-xs font-semibold shadow-2xs shrink-0">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span>Rascunho salvo às {lastAutoSaveTime}</span>
            </div>
          )}
        </div>
      </div>

      {draftRecovered && (
        <div className="p-3.5 bg-teal-50 border border-teal-200 text-teal-900 rounded-2xl text-xs flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <span className="text-base">💾</span>
            <div>
              <strong className="block text-slate-900">Rascunho em andamento restaurado automaticamente</strong>
              <span className="text-[11px] text-teal-700">Seus textos e seleções foram recuperados da última edição.</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDraftRecovered(false)}
            className="px-3 py-1 bg-white border border-teal-200 hover:bg-teal-100/50 text-teal-800 rounded-lg text-xs font-bold transition cursor-pointer"
          >
            Entendido
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <div>
              <span className="font-bold">{successMsg}</span>
              <p className="text-[11px] text-emerald-700 mt-0.5">O laudo oficial já está timbrado e disponível para a clínica parceira.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
            {apiSentSuccess ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-100 text-emerald-800 rounded-xl font-bold text-xs shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mensagem enviada pelo Robô!</span>
              </span>
            ) : hasWhatsAppApi ? (
              <button
                type="button"
                onClick={handleSendWhatsAppNotification}
                disabled={isSendingViaApi}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold transition shadow-xs cursor-pointer text-xs active:scale-95 disabled:opacity-60"
                title={exam.ownerPhone ? "Disparar mensagem oficial de laudo pronto direto no WhatsApp do tutor" : "Disparar mensagem oficial de laudo pronto direto no WhatsApp da clínica"}
              >
                {isSendingViaApi ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Disparando Robô...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{exam.ownerPhone ? 'Notificar Tutor via Robô (API)' : 'Notificar Clínica via Robô (API)'}</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSendWhatsAppNotification}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-xs cursor-pointer text-xs active:scale-95"
                title={exam.ownerPhone ? "Enviar mensagem com o link do laudo pronto no WhatsApp do tutor" : "Enviar mensagem com o link do laudo pronto no WhatsApp da clínica"}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{exam.ownerPhone ? 'Notificar Tutor no WhatsApp' : 'Notificar Clínica no WhatsApp'}</span>
              </button>
            )}

            {apiSendError && (
              <span className="text-[11px] text-rose-600 font-semibold block sm:inline">
                {apiSendError}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Formulário do Laudo */}
      <div className="space-y-5 text-xs">
        {/* Técnica Realizada */}
        <div>
          <label className="block text-slate-700 font-semibold mb-1 uppercase tracking-wider text-[11px]">
            {isUltrasound ? 'Técnica e Equipamento Ultrassonográfico' : 'Técnica Radiográfica Realizada'}
          </label>
          <input
            type="text"
            value={technique}
            onChange={e => setTechnique(e.target.value)}
            placeholder="Descreva transdutores utilizados, frequências e preparo..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 outline-none focus:bg-white focus:border-teal-500 transition shadow-2xs text-xs"
          />
        </div>

        {/* Mensurações Especiais de Radiografia (apenas se for Raio-X) */}
        {!isUltrasound && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-sky-50/60 p-3.5 rounded-2xl border border-sky-200/80">
            <div>
              <label className="block text-sky-950 font-bold mb-1 text-[11px]">
                Vertebral Heart Score (VHS)
              </label>
              <input
                type="text"
                value={vhsScore}
                onChange={e => setVhsScore(e.target.value)}
                placeholder="Ex: 9.6 v (Normal: até 10.5v)"
                className="w-full bg-white border border-sky-200 rounded-xl px-3 py-1.5 text-slate-800 text-xs outline-none focus:border-teal-500 shadow-2xs font-mono"
              />
            </div>
            <div>
              <label className="block text-sky-950 font-bold mb-1 text-[11px]">
                Ângulo de Norberg / Ortopédico
              </label>
              <input
                type="text"
                value={norbergAngle}
                onChange={e => setNorbergAngle(e.target.value)}
                placeholder="Ex: Coxofemoral D: 105° | E: 98°"
                className="w-full bg-white border border-sky-200 rounded-xl px-3 py-1.5 text-slate-800 text-xs outline-none focus:border-teal-500 shadow-2xs font-mono"
              />
            </div>
          </div>
        )}

        {/* CAIXA ÚNICA DE EDIÇÃO COM ACHADOS E IMPRESSÃO DIAGNÓSTICA JUNTOS */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <label className="text-slate-900 font-bold text-xs sm:text-sm flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block" />
              <span>Achados e Impressão Diagnóstica (Caixa Única de Texto Rico) *</span>
            </label>
            <span className="text-[11px] text-teal-800 font-semibold bg-teal-50 border border-teal-200/80 px-2.5 py-0.5 rounded-full self-start sm:self-auto shadow-2xs">
              Negrito, Sublinhado, Itálico, Fontes e Tamanhos
            </span>
          </div>

          <RichTextEditor
            value={reportContent}
            onChange={setReportContent}
            placeholder="Descreva detalhadamente os achados de imagem e elabore a impressão diagnóstica..."
            minHeight="380px"
          />
        </div>

        {/* Seleção de Imagens-Chave para o Laudo */}
        {exam.images.length > 0 && (
          <div>
            <label className="block text-slate-700 font-semibold mb-2 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-teal-600" />
              Cortes / Imagens Selecionadas para o Laudo
            </label>
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {exam.images.map(img => {
                const isSelected = selectedKeyImages.includes(img.id);
                return (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => handleToggleKeyImage(img.id)}
                    className={`relative rounded-2xl overflow-hidden border-2 transition p-1 bg-slate-50 flex flex-col items-center gap-1 shrink-0 ${
                      isSelected ? 'border-teal-500 ring-2 ring-teal-500/20 bg-teal-50/30' : 'border-slate-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.label} className="w-20 h-16 object-cover rounded-xl bg-black" />
                    <span className="text-[10px] text-slate-700 font-medium max-w-[80px] truncate">
                      {img.projection || img.label}
                    </span>
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-teal-600 text-white rounded-full p-0.5 shadow-sm">
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Carimbo do Radiologista e Botão de Ação */}
      <div className="pt-5 border-t border-slate-200 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3.5">
          {currentUser?.signatureImage ? (
            <div className="h-14 w-32 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-center overflow-hidden shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentUser.signatureImage}
                alt="Assinatura"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0 shadow-2xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-900 leading-tight">
                {currentUser?.name || currentRadiologistName}
              </span>
              <span className={`text-[11px] px-2 py-0.5 font-bold rounded-md border ${currentUser?.signatureImage ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                {currentUser?.signatureImage ? 'Assinatura Ativa' : 'Sem Assinatura'}
              </span>
            </div>
            <div className="text-xs text-teal-700 font-mono font-bold mt-0.5">
              {currentUser?.crmv || currentRadiologistCrmv} • {currentUser?.specialty || (isUltrasound ? 'Médica Veterinária Ultrassonografista' : 'Médica Veterinária Radiologista')}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowSignatureModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold text-teal-900 bg-teal-100 hover:bg-teal-200 border border-teal-300 transition cursor-pointer shadow-2xs active:scale-95"
            title="Cadastrar ou editar minha assinatura e dados do CRMV"
          >
            <PenTool className="w-3.5 h-3.5 text-teal-700" />
            <span>{currentUser?.signatureImage ? 'Alterar Assinatura & CRMV' : '+ Cadastrar Assinatura & CRMV'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setShowCasotecaModal(true)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-bold rounded-xl transition active:scale-95 cursor-pointer shadow-2xs"
            title="Salvar como caso de ensino no Atlas & Casoteca"
          >
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>Salvar no Atlas</span>
          </button>

          <button
            onClick={handleSaveReport}
            disabled={isSaving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-500/20 transition active:scale-95 cursor-pointer"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Assinando e Emitindo...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{existingReport ? 'Atualizar e Reassinar Laudo' : 'Emitir e Assinar Laudo'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* MODAL PARA SALVAR CASO NA CASOTECA */}
      {showCasotecaModal && (
        <SaveToCasotecaModal
          exam={exam}
          findings={reportContent}
          conclusion={reportContent}
          onClose={() => setShowCasotecaModal(false)}
        />
      )}

      {/* MODAL PARA CONFIGURAR ASSINATURA & CRMV DO VETERINÁRIO */}
      {currentUser && (
        <VetSignatureModal
          isOpen={showSignatureModal}
          onClose={() => setShowSignatureModal(false)}
          user={currentUser}
          onUserUpdated={(updated) => {
            setCurrentUser(updated);
            if (updated.signatureImage) {
              setCurrentUserSignature(updated.signatureImage);
            }
          }}
        />
      )}
    </div>
  );
};
