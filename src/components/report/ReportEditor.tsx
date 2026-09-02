'use client';

import React, { useState } from 'react';
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
  Activity
} from 'lucide-react';
import { Exam, ReportTemplate } from '@/types';
import { REPORT_TEMPLATES } from '@/data/templates';

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

  const [technique, setTechnique] = useState(existingReport?.technique || defaultTechnique);
  const [findings, setFindings] = useState(existingReport?.findings || '');
  const [conclusion, setConclusion] = useState(existingReport?.conclusion || '');
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

  // Filtrar templates por modalidade correspondente ou exibir agrupados
  const usgTemplates = REPORT_TEMPLATES.filter(t => t.modality === 'ULTRASSOM');
  const xrayTemplates = REPORT_TEMPLATES.filter(t => t.modality === 'RADIOGRAFIA');

  const handleSelectTemplate = (templateId: string) => {
    const tpl = REPORT_TEMPLATES.find(t => t.id === templateId);
    if (!tpl) return;

    if (findings && !confirm('Deseja substituir o texto atual pelos dados do modelo selecionado?')) {
      return;
    }

    setTechnique(tpl.technique);
    setFindings(tpl.findings);
    setConclusion(tpl.conclusion);
    setRecommendations(tpl.recommendations);
  };

  const handleToggleKeyImage = (imageId: string) => {
    setSelectedKeyImages(prev => 
      prev.includes(imageId) ? prev.filter(id => id !== imageId) : [...prev, imageId]
    );
  };

  const handleSaveReport = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!findings.trim() || !conclusion.trim()) {
      setErrorMsg('Os campos de Descrição dos Achados e Conclusão Diagnóstica são obrigatórios.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/exams/${exam.id}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          technique,
          findings,
          conclusion,
          recommendations,
          vhsScore: isUltrasound ? undefined : (vhsScore.trim() || undefined),
          norbergAngle: isUltrasound ? undefined : (norbergAngle.trim() || undefined),
          keyImageIds: selectedKeyImages
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Falha ao emitir laudo');
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

  return (
    <div className="bg-slate-900/50 p-5 lg:p-7 space-y-6 text-slate-100 min-h-full">
      {/* Header com Status e Seletor de Templates */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            {isUltrasound ? (
              <div className="flex items-center gap-1.5 text-blue-400">
                <Waves className="w-5 h-5" />
                <h2 className="text-lg font-bold text-white">Laudo de Ultrassonografia Veterinária</h2>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-cyan-400">
                <Activity className="w-5 h-5" />
                <h2 className="text-lg font-bold text-white">Laudo Radiológico Veterinário</h2>
              </div>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Exame: <strong className="text-slate-200">{exam.id}</strong> | Paciente:{' '}
            <strong className="text-cyan-300">{exam.patientName} ({exam.species})</strong>
            {exam.fastingHours && (
              <span className="text-blue-300 ml-2">• {exam.fastingHours}</span>
            )}
          </p>
        </div>

        {/* Dropdown de Modelos Rápidos agrupados */}
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <select
            onChange={e => handleSelectTemplate(e.target.value)}
            defaultValue=""
            className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-2 outline-none focus:border-cyan-500 transition cursor-pointer max-w-[280px]"
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
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-950/50 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-950/50 border border-emerald-800 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Formulário do Laudo */}
      <div className="space-y-4 text-xs">
        {/* Técnica Realizada */}
        <div>
          <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
            {isUltrasound ? 'Técnica e Equipamento Ultrassonográfico' : 'Técnica Radiográfica Realizada'}
          </label>
          <input
            type="text"
            value={technique}
            onChange={e => setTechnique(e.target.value)}
            placeholder="Descreva transdutores utilizados, frequências e preparo..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 outline-none focus:border-cyan-500 transition"
          />
        </div>

        {/* Mensurações Especiais de Radiografia (apenas se for Raio-X) */}
        {!isUltrasound && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <div>
              <label className="block text-slate-400 font-medium mb-1 text-[11px]">
                Vertebral Heart Score (VHS)
              </label>
              <input
                type="text"
                value={vhsScore}
                onChange={e => setVhsScore(e.target.value)}
                placeholder="Ex: 9.6 v (Normal: até 10.5v)"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 text-xs outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1 text-[11px]">
                Ângulo de Norberg / Ortopédico
              </label>
              <input
                type="text"
                value={norbergAngle}
                onChange={e => setNorbergAngle(e.target.value)}
                placeholder="Ex: Coxofemoral D: 105° | E: 98°"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 text-xs outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        )}

        {/* Descrição dos Achados (Órgãos ou Projeções) */}
        <div>
          <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[11px] flex items-center justify-between">
            <span>
              {isUltrasound ? 'Descrição dos Achados Ecográficos por Órgão *' : 'Descrição dos Achados Radiográficos *'}
            </span>
            <span className="text-[10px] text-slate-500 font-normal">
              {isUltrasound ? 'Fígado, Baço, Rins, Bexiga, TGI, etc.' : 'Estruturado por sistemas'}
            </span>
          </label>
          <textarea
            rows={8}
            value={findings}
            onChange={e => setFindings(e.target.value)}
            placeholder={
              isUltrasound
                ? 'FÍGADO: Dimensões, bordos, ecotextura e arquitetura vascular...\nRINS: Dimensões, ecogenicidade cortical, relação corticomedular e pelve...\nBEXIGA: Repleção, espessura parietal, conteúdo luminal...\nLÍQUIDO LIVRE: Presença ou ausência...'
                : 'Descreva detalhadamente as estruturas visualizadas...'
            }
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-slate-200 leading-relaxed outline-none focus:border-cyan-500 transition font-sans text-xs"
          />
        </div>

        {/* Conclusão Diagnóstica */}
        <div>
          <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[11px] text-cyan-400">
            Conclusão Diagnóstica *
          </label>
          <textarea
            rows={3}
            value={conclusion}
            onChange={e => setConclusion(e.target.value)}
            placeholder="1. Diagnóstico ecográfico / radiográfico principal.&#10;2. Diagnósticos diferenciais e estadiamento."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-slate-200 leading-relaxed outline-none focus:border-cyan-500 transition font-sans text-xs font-medium"
          />
        </div>

        {/* Recomendações Clínicas */}
        <div>
          <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
            Recomendações e Conduta Sugerida
          </label>
          <textarea
            rows={2}
            value={recommendations}
            onChange={e => setRecommendations(e.target.value)}
            placeholder="Recomendações clínicas, biópsia/punção guiada por USG, exames laboratoriais complementares..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-slate-200 leading-relaxed outline-none focus:border-cyan-500 transition font-sans text-xs"
          />
        </div>

        {/* Seleção de Imagens-Chave para o Laudo */}
        {exam.images.length > 0 && (
          <div>
            <label className="block text-slate-300 font-semibold mb-2 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
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
                    className={`relative rounded-xl overflow-hidden border-2 transition p-1 bg-slate-950 flex flex-col items-center gap-1 shrink-0 ${
                      isSelected ? 'border-cyan-400 ring-2 ring-cyan-500/20' : 'border-slate-800 opacity-60'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.label} className="w-20 h-16 object-cover rounded-lg bg-black" />
                    <span className="text-[10px] text-slate-300 max-w-[80px] truncate">
                      {img.projection || img.label}
                    </span>
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-cyan-500 text-white rounded-full p-0.5">
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
      <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cyan-950 border border-cyan-700/50 flex items-center justify-center text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200">
              {currentRadiologistName}
            </div>
            <div className="text-[11px] text-cyan-400 font-mono">
              {currentRadiologistCrmv} • {isUltrasound ? 'Médica Veterinária Ultrassonografista' : 'Médica Veterinária Radiologista'}
            </div>
          </div>
        </div>

        <button
          onClick={handleSaveReport}
          disabled={isSaving}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/25 transition active:scale-95 cursor-pointer"
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
  );
};
