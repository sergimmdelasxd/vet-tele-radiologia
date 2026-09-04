'use client';

import React, { useState } from 'react';
import { X, BookOpen, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { Exam, TeachingCase } from '@/types';

interface SaveToCasotecaModalProps {
  exam: Exam;
  findings: string;
  conclusion: string;
  onClose: () => void;
  onSaved?: (newCase: TeachingCase) => void;
}

export const SaveToCasotecaModal: React.FC<SaveToCasotecaModalProps> = ({
  exam,
  findings,
  conclusion,
  onClose,
  onSaved
}) => {
  const [title, setTitle] = useState(`Caso de ${exam.modality === 'RADIOGRAFIA' ? 'RX' : 'USG'}: ${exam.region || 'Região Anatômica'} em ${exam.species}`);
  const [category, setCategory] = useState<'Tórax & Coração' | 'Abdômen & Órgãos' | 'Ortopedia & Coluna' | 'Crânio & Cervical' | 'Ultrassonografia' | 'Outros'>('Tórax & Coração');
  const [difficulty, setDifficulty] = useState<'Básico / Ensino' | 'Intermediário' | 'Avançado' | 'Caso Raro'>('Intermediário');
  const [summary, setSummary] = useState(exam.clinicalHistory || 'Achados radiológicos de relevância diagnóstica.');
  const [keyPointsText, setKeyPointsText] = useState('Dica diagnóstica chave a ser observada neste caso.');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const keyPoints = keyPointsText
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);

      const images = (exam.images || []).map(img => ({
        id: img.id,
        url: img.url,
        label: img.label || img.projection || 'Projeção Radiológica'
      }));

      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          species: exam.species,
          breed: exam.breed,
          age: exam.age,
          category,
          modality: exam.modality,
          difficulty,
          summary: summary.trim(),
          clinicalHistory: exam.clinicalHistory,
          findings: findings.replace(/<[^>]*>/g, ' ').trim() || 'Achados do laudo.',
          diagnosis: conclusion.replace(/<[^>]*>/g, ' ').trim() || 'Conclusão diagnóstica.',
          keyPoints,
          images
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar caso na casoteca');

      setSuccess(true);
      if (onSaved) onSaved(data.case);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar caso');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shadow-2xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Salvar na Casoteca &amp; Atlas
              </h2>
              <p className="text-[11px] text-slate-500">
                Compartilhe este caso para aprendizado da comunidade médica
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-teal-50 border border-teal-200 text-teal-800 rounded-2xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-600" />
              <span>Caso clínico salvo com sucesso no Atlas &amp; Casoteca!</span>
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-bold mb-1">Título do Caso Clínico *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:bg-white focus:border-indigo-500 font-semibold shadow-2xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Categoria Anatômica *</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:bg-white focus:border-indigo-500 shadow-2xs cursor-pointer"
              >
                <option value="Tórax & Coração">Tórax & Coração</option>
                <option value="Abdômen & Órgãos">Abdômen & Órgãos</option>
                <option value="Ortopedia & Coluna">Ortopedia & Coluna</option>
                <option value="Crânio & Cervical">Crânio & Cervical</option>
                <option value="Ultrassonografia">Ultrassonografia</option>
                <option value="Outros">Outros</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Grau de Dificuldade *</label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:bg-white focus:border-indigo-500 shadow-2xs cursor-pointer"
              >
                <option value="Básico / Ensino">Básico / Ensino</option>
                <option value="Intermediário">Intermediário</option>
                <option value="Avançado">Avançado</option>
                <option value="Caso Raro">Caso Raro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Resumo Clínico / Apresentação</label>
            <textarea
              rows={2}
              value={summary}
              onChange={e => setSummary(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 outline-none focus:bg-white focus:border-indigo-500 shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Dicas de Ouro / Pontos de Aprendizado (1 por linha)</label>
            <textarea
              rows={3}
              placeholder="Digite cada dica de ensino em uma linha separada..."
              value={keyPointsText}
              onChange={e => setKeyPointsText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 outline-none focus:bg-white focus:border-indigo-500 shadow-2xs"
            />
          </div>

          <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-2xl text-[11px] text-indigo-900 leading-relaxed">
            🛡️ <strong>Anonimização Automática:</strong> Nomes de tutores ou clínicas solicitantes são removidos. Apenas os dados do paciente ({exam.species}, {exam.breed}) e as imagens radiológicas serão visíveis para estudo.
          </div>

          {/* Botões */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving || success}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs transition active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSaving ? 'Publicando...' : 'Salvar no Atlas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
