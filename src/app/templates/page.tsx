'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FileCode, 
  FileText, 
  Plus, 
  Search, 
  Activity, 
  Waves, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  Sparkles, 
  X, 
  Eye, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle,
  Stethoscope,
  Shield,
  Layers,
  ClipboardList
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { ReportTemplate, ExamModality, User as UserType } from '@/types';

export default function TemplatesPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtros
  const [modalityFilter, setModalityFilter] = useState<'ALL' | ExamModality>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modais
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ReportTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<ReportTemplate | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Campos do Formulário
  const [formData, setFormData] = useState({
    modality: 'RADIOGRAFIA' as ExamModality,
    title: '',
    category: 'Tórax',
    technique: '',
    findings: '',
    conclusion: '',
    recommendations: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (!meData.user) {
        router.push('/login');
        return;
      }
      if (meData.user.role !== 'ADMIN' && meData.user.role !== 'RADIOLOGIST') {
        router.push('/dashboard');
        return;
      }
      setCurrentUser(meData.user);

      const res = await fetch('/api/templates');
      const data = await res.json();
      if (data.templates) {
        setTemplates(data.templates);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Extrair categorias únicas
  const categories = useMemo(() => {
    const set = new Set<string>();
    templates.forEach(t => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [templates]);

  // Filtrar templates
  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      const matchModality = modalityFilter === 'ALL' || t.modality === modalityFilter;
      const matchCategory = categoryFilter === 'ALL' || t.category === categoryFilter;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.findings.toLowerCase().includes(q) ||
        t.conclusion.toLowerCase().includes(q);

      return matchModality && matchCategory && matchSearch;
    });
  }, [templates, modalityFilter, categoryFilter, searchQuery]);

  // Contadores
  const counts = useMemo(() => {
    return {
      total: templates.length,
      xray: templates.filter(t => t.modality === 'RADIOGRAFIA').length,
      usg: templates.filter(t => t.modality === 'ULTRASSOM').length
    };
  }, [templates]);

  // Abrir Modal de Criação
  const handleOpenCreate = (preselectedModality?: ExamModality) => {
    const mod = preselectedModality || (modalityFilter === 'ULTRASSOM' ? 'ULTRASSOM' : 'RADIOGRAFIA');
    setEditingTemplate(null);
    setFormData({
      modality: mod,
      title: '',
      category: mod === 'ULTRASSOM' ? 'USG Abdominal' : 'Tórax',
      technique: mod === 'ULTRASSOM'
        ? 'Exame ultrassonográfico realizado em aparelho de alta resolução utilizando transdutor multifrequencial, após ampla tricotomia e aplicação de gel acústico condutor.'
        : 'Estudo radiográfico obtido em projeções ortogonais com boa técnica radiográfica, adequada colimação e posicionamento simétrico.',
      findings: '',
      conclusion: '',
      recommendations: 'Correlação com evolução clínica e exames laboratoriais do paciente.'
    });
    setFormError(null);
    setIsEditorModalOpen(true);
  };

  // Abrir Modal de Edição
  const handleOpenEdit = (tpl: ReportTemplate) => {
    setEditingTemplate(tpl);
    setFormData({
      modality: tpl.modality,
      title: tpl.title,
      category: tpl.category,
      technique: tpl.technique,
      findings: tpl.findings,
      conclusion: tpl.conclusion,
      recommendations: tpl.recommendations
    });
    setFormError(null);
    setIsEditorModalOpen(true);
  };

  // Duplicar Template
  const handleDuplicate = (tpl: ReportTemplate) => {
    setEditingTemplate(null);
    setFormData({
      modality: tpl.modality,
      title: `${tpl.title} (Cópia)`,
      category: tpl.category,
      technique: tpl.technique,
      findings: tpl.findings,
      conclusion: tpl.conclusion,
      recommendations: tpl.recommendations
    });
    setFormError(null);
    setIsEditorModalOpen(true);
  };

  // Excluir Template
  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este modelo de laudo?')) return;

    try {
      const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTemplates(prev => prev.filter(t => t.id !== id));
      } else {
        alert('Falha ao excluir modelo.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Salvar Criação ou Edição
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim()) {
      setFormError('Informe o título do modelo.');
      return;
    }
    if (!formData.findings.trim()) {
      setFormError('Informe o texto base dos achados radiográficos/ecográficos.');
      return;
    }
    if (!formData.conclusion.trim()) {
      setFormError('Informe a impressão diagnóstica / achados principais.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingTemplate) {
        // Atualizar
        const res = await fetch(`/api/templates/${editingTemplate.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao salvar alterações');

        setTemplates(prev => prev.map(t => (t.id === editingTemplate.id ? data.template : t)));
      } else {
        // Criar Novo
        const res = await fetch('/api/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao cadastrar modelo');

        setTemplates(prev => [data.template, ...prev]);
      }

      setIsEditorModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Erro ao processar modelo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copiar Conteúdo do Modelo
  const handleCopyContent = (tpl: ReportTemplate) => {
    const fullText = `MODELO: ${tpl.title}\nMODALIDADE: ${tpl.modality}\nTÉCNICA:\n${tpl.technique}\n\nACHADOS:\n${tpl.findings}\n\nCONCLUSÃO:\n${tpl.conclusion}\n\nRECOMENDAÇÕES:\n${tpl.recommendations}`;
    navigator.clipboard.writeText(fullText);
    setCopiedId(tpl.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  if (isLoading || !currentUser) {
    return (
      <div className="min-h-screen bg-[#fafbfc] flex flex-col items-center justify-center text-slate-500 gap-3">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-medium">Carregando biblioteca de modelos de laudo...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-800 flex flex-col font-sans selection:bg-teal-500 selection:text-white relative">
      {/* Brilhos Ambientais Pastéis */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[850px] h-[350px] bg-gradient-to-tr from-teal-100/50 via-sky-100/40 to-purple-100/30 blur-[130px] pointer-events-none" />

      <Navbar user={currentUser} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 relative z-10">
        
        {/* Header Principal */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200/80 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                <span>Padronização de Laudos Médicos</span>
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Acesso Especialista • {currentUser.name}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Modelos Pré-Configurados de Laudo
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Cadastre, personalize e estruture frases prontas, técnicas e impressões diagnósticas para agilizar a rotina de emissão de laudos de Raio-X e Ultrassom.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleOpenCreate()}
              className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md shadow-teal-500/20 transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Novo Modelo</span>
            </button>
          </div>
        </div>

        {/* Abas e Filtros de Modalidade */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white/90 backdrop-blur-md border border-slate-200/90 p-4 rounded-3xl shadow-sm">
          
          {/* Seletores de Modalidade */}
          <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-2xl border border-slate-200/80 text-xs">
            <button
              onClick={() => setModalityFilter('ALL')}
              className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                modalityFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>Todos ({counts.total})</span>
            </button>

            <button
              onClick={() => setModalityFilter('RADIOGRAFIA')}
              className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                modalityFilter === 'RADIOGRAFIA'
                  ? 'bg-sky-100 text-sky-900 shadow-xs border border-sky-300'
                  : 'text-slate-600 hover:text-sky-800'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-sky-600" />
              <span>Raio-X ({counts.xray})</span>
            </button>

            <button
              onClick={() => setModalityFilter('ULTRASSOM')}
              className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                modalityFilter === 'ULTRASSOM'
                  ? 'bg-teal-100 text-teal-900 shadow-xs border border-teal-300'
                  : 'text-slate-600 hover:text-teal-800'
              }`}
            >
              <Waves className="w-3.5 h-3.5 text-teal-600" />
              <span>Ultrassom ({counts.usg})</span>
            </button>
          </div>

          {/* Busca e Categoria */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Buscar modelo, achado, região..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/90 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 outline-none focus:bg-white focus:border-teal-500 transition shadow-2xs"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2 text-xs text-slate-700 outline-none focus:bg-white focus:border-teal-500 transition shadow-2xs font-medium cursor-pointer"
            >
              <option value="ALL">Todas Categorias</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid de Modelos */}
        {filteredTemplates.length === 0 ? (
          <div className="bg-white/90 border border-slate-200/90 rounded-3xl p-12 text-center text-slate-500 space-y-3 shadow-sm">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto stroke-1" />
            <div className="text-base font-bold text-slate-900">Nenhum modelo encontrado</div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Não encontramos nenhum template com os filtros aplicados. Crie seu primeiro modelo personalizado ou ajuste os filtros.
            </p>
            <button
              onClick={() => handleOpenCreate()}
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-teal-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Novo Modelo</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredTemplates.map(tpl => (
              <div
                key={tpl.id}
                className={`bg-white border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                  tpl.modality === 'ULTRASSOM'
                    ? 'border-emerald-200/80 hover:border-emerald-400/90'
                    : 'border-sky-200/80 hover:border-sky-400/90'
                }`}
              >
                <div>
                  {/* Badges do Card */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                          tpl.modality === 'ULTRASSOM'
                            ? 'bg-teal-50 text-teal-800 border border-teal-200/80'
                            : 'bg-sky-50 text-sky-800 border border-sky-200/80'
                        }`}
                      >
                        {tpl.modality === 'ULTRASSOM' ? <Waves className="w-3.5 h-3.5 text-teal-600" /> : <Activity className="w-3.5 h-3.5 text-sky-600" />}
                        {tpl.modality === 'ULTRASSOM' ? 'Ultrassonografia' : 'Radiografia (RX)'}
                      </span>

                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/80">
                        {tpl.category}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono font-semibold text-slate-400">{tpl.id}</span>
                  </div>

                  {/* Título do Modelo */}
                  <h3 className="text-base font-bold text-slate-900 mb-1.5 line-clamp-1">
                    {tpl.title}
                  </h3>

                  {/* Prévia da Técnica */}
                  <div className="text-xs text-slate-500 line-clamp-2 italic mb-3">
                    &quot;{tpl.technique}&quot;
                  </div>

                  {/* Impressão Diagnóstica em Destaque Menta / Pastel */}
                  <div className="p-3.5 bg-gradient-to-r from-teal-50/70 via-emerald-50/40 to-sky-50/60 rounded-2xl border border-teal-200/70 mb-4">
                    <span className="text-[10px] uppercase font-bold text-teal-900 flex items-center gap-1.5 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                      <span>Impressão Diagnóstica Padrão:</span>
                    </span>
                    <p className="text-xs text-slate-800 line-clamp-3 whitespace-pre-line leading-relaxed font-medium">
                      {tpl.conclusion}
                    </p>
                  </div>
                </div>

                {/* Ações do Card */}
                <div className="flex items-center justify-between gap-2 pt-3.5 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1.5">
                    {/* Visualizar */}
                    <button
                      type="button"
                      onClick={() => setPreviewTemplate(tpl)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl transition font-semibold border border-slate-200/80 cursor-pointer shadow-2xs"
                      title="Visualizar modelo completo"
                    >
                      <Eye className="w-3.5 h-3.5 text-teal-600" />
                      <span>Ver</span>
                    </button>

                    {/* Copiar */}
                    <button
                      type="button"
                      onClick={() => handleCopyContent(tpl)}
                      className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition cursor-pointer border border-slate-200/80 shadow-2xs"
                      title="Copiar texto estruturado"
                    >
                      {copiedId === tpl.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </button>

                    {/* Duplicar */}
                    <button
                      type="button"
                      onClick={() => handleDuplicate(tpl)}
                      className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl transition cursor-pointer border border-amber-200/80 shadow-2xs"
                      title="Duplicar modelo para nova variante"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Editar */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(tpl)}
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-teal-50 hover:bg-teal-100 border border-teal-200/80 text-teal-800 rounded-xl transition font-bold cursor-pointer shadow-2xs"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-teal-600" />
                      <span>Editar</span>
                    </button>

                    {/* Excluir */}
                    <button
                      type="button"
                      onClick={() => handleDelete(tpl.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                      title="Excluir modelo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </main>

      {/* Modal 1: Editor de Template (Criar / Editar) */}
      {isEditorModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white border border-slate-200/90 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl my-auto text-slate-800">
            
            {/* Header do Modal */}
            <div className="px-6 py-5 border-b border-slate-200/90 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-sm shadow-teal-500/20">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <span>{editingTemplate ? 'Editar Modelo de Laudo' : 'Novo Modelo Pré-Configurado'}</span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                      {formData.modality === 'ULTRASSOM' ? 'USG' : 'Raio-X'}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500">Padronize a redação e os critérios diagnósticos para toda a equipe</p>
                </div>
              </div>

              <button
                onClick={() => setIsEditorModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
              
              {/* Modalidade */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
                  Modalidade Médica
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      modality: 'RADIOGRAFIA',
                      category: prev.category === 'USG Abdominal' ? 'Tórax' : prev.category
                    }))}
                    className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2.5 font-bold transition cursor-pointer ${
                      formData.modality === 'RADIOGRAFIA'
                        ? 'bg-sky-50 border-sky-400 text-sky-900 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                    }`}
                  >
                    <Activity className="w-4 h-4 text-sky-600" />
                    <span>Radiografia (Raio-X)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      modality: 'ULTRASSOM',
                      category: prev.category === 'Tórax' ? 'USG Abdominal' : prev.category
                    }))}
                    className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2.5 font-bold transition cursor-pointer ${
                      formData.modality === 'ULTRASSOM'
                        ? 'bg-teal-50 border-teal-400 text-teal-900 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                    }`}
                  >
                    <Waves className="w-4 h-4 text-teal-600" />
                    <span>Ultrassonografia (USG)</span>
                  </button>
                </div>
              </div>

              {/* Título e Categoria */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 mb-1 font-semibold">Título do Modelo *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Tórax Felino - Asma / Broncopatia Crônica"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 outline-none focus:bg-white focus:border-teal-500 transition shadow-2xs text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Categoria / Região *</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="Ex: Tórax, Abdômen, USG Ocular..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 outline-none focus:bg-white focus:border-teal-500 transition shadow-2xs text-xs"
                  />
                </div>
              </div>

              {/* Técnica do Exame */}
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Técnica do Exame *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.technique}
                  onChange={e => setFormData(prev => ({ ...prev, technique: e.target.value }))}
                  placeholder="Descreva a técnica radiográfica ou ecográfica utilizada..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 outline-none focus:bg-white focus:border-teal-500 leading-relaxed font-sans text-xs transition shadow-2xs"
                />
              </div>

              {/* Achados / Descrição de Imagem */}
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Achados Radiográficos / Ecográficos (Laudo Base) *</label>
                <textarea
                  rows={5}
                  required
                  value={formData.findings}
                  onChange={e => setFormData(prev => ({ ...prev, findings: e.target.value }))}
                  placeholder="Descreva detalhadamente os achados de imagem (ex: órgãos, parênquimas, eixos, dimensões)..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 outline-none focus:bg-white focus:border-teal-500 leading-relaxed font-sans text-xs transition shadow-2xs"
                />
              </div>

              {/* Impressão Diagnóstica */}
              <div>
                <label className="block text-teal-900 mb-1 font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                  <span>Impressão Diagnóstica / Achados Principais *</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.conclusion}
                  onChange={e => setFormData(prev => ({ ...prev, conclusion: e.target.value }))}
                  placeholder="Ex: 1. Padrão brônquico difuso compatível com broncopatia inflamatória felina..."
                  className="w-full bg-gradient-to-r from-teal-50/50 via-emerald-50/30 to-sky-50/40 border border-teal-300/80 rounded-xl p-3.5 text-slate-900 outline-none focus:bg-white focus:border-teal-500 leading-relaxed font-sans text-xs transition shadow-2xs font-medium"
                />
              </div>

              {/* Recomendações Clínicas */}
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Recomendações e Condutas Complementares</label>
                <textarea
                  rows={2}
                  value={formData.recommendations}
                  onChange={e => setFormData(prev => ({ ...prev, recommendations: e.target.value }))}
                  placeholder="Ex: Correlação clínica, lavagem broncoalveolar, reavaliação radiográfica após corticoterapia..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 outline-none focus:bg-white focus:border-teal-500 leading-relaxed font-sans text-xs transition shadow-2xs"
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 bg-slate-50/50 px-6 py-4 -mx-6 -mb-6">
                <button
                  type="button"
                  onClick={() => setIsEditorModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-200 transition font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-bold rounded-xl shadow-md shadow-teal-500/20 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Salvando Modelo...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{editingTemplate ? 'Atualizar Modelo' : 'Salvar Novo Modelo'}</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Visualizador Completo do Modelo */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/90 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl text-slate-800">
            <div className="px-6 py-5 border-b border-slate-200/90 flex items-center justify-between bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      previewTemplate.modality === 'ULTRASSOM'
                        ? 'bg-teal-50 text-teal-800 border border-teal-200/80'
                        : 'bg-sky-50 text-sky-800 border border-sky-200/80'
                    }`}
                  >
                    {previewTemplate.modality === 'ULTRASSOM' ? 'Ultrassonografia' : 'Radiografia (RX)'}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">{previewTemplate.category}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{previewTemplate.title}</h3>
              </div>

              <button
                onClick={() => setPreviewTemplate(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs overflow-y-auto max-h-[70vh]">
              <div>
                <strong className="text-slate-700 block uppercase text-[10px] mb-1.5 tracking-wider font-bold">Técnica:</strong>
                <p className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-slate-700 leading-relaxed font-sans">
                  {previewTemplate.technique}
                </p>
              </div>

              <div>
                <strong className="text-slate-700 block uppercase text-[10px] mb-1.5 tracking-wider font-bold">Achados de Imagem:</strong>
                <p className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-slate-800 whitespace-pre-line leading-relaxed font-sans">
                  {previewTemplate.findings}
                </p>
              </div>

              <div>
                <strong className="text-teal-900 block uppercase text-[10px] mb-1.5 tracking-wider font-black flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                  <span>Impressão Diagnóstica:</span>
                </strong>
                <p className="p-4 bg-gradient-to-r from-teal-50/90 via-emerald-50/60 to-sky-50/80 border-2 border-teal-300 rounded-2xl text-slate-900 whitespace-pre-line leading-relaxed font-sans font-bold">
                  {previewTemplate.conclusion}
                </p>
              </div>

              {previewTemplate.recommendations && (
                <div>
                  <strong className="text-amber-900 block uppercase text-[10px] mb-1.5 tracking-wider font-bold">Recomendações:</strong>
                  <p className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-amber-950 leading-relaxed font-sans">
                    {previewTemplate.recommendations}
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-200/90 flex items-center justify-between bg-slate-50/50">
              <button
                onClick={() => handleCopyContent(previewTemplate)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200/80 transition cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copiar Todo o Texto</span>
              </button>

              <button
                onClick={() => setPreviewTemplate(null)}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-md shadow-teal-600/20"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
