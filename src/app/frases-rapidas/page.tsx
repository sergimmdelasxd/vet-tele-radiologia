'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Zap, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  Sparkles, 
  FileText, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Folder,
  ArrowLeft,
  Filter,
  Layers,
  HelpCircle
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { User, QuickPhrase } from '@/types';

const PRESET_CATEGORIES = [
  'Tórax & Coração',
  'Abdômen & Órgãos',
  'Ortopedia & Coluna',
  'Crânio & Cervical',
  'Ultrassonografia Geral',
  'Outros / Gerais'
];

export default function FrasesRapidasPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [phrases, setPhrases] = useState<QuickPhrase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal de Criação / Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPhrase, setEditingPhrase] = useState<QuickPhrase | null>(null);
  const [formData, setFormData] = useState({
    shortcut: '',
    title: '',
    category: PRESET_CATEGORIES[0],
    content: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Carregar dados
  const loadData = async () => {
    setIsLoading(true);
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (!meData.user) {
        router.push('/login');
        return;
      }
      setCurrentUser(meData.user);

      const phrasesRes = await fetch('/api/macros');
      const phrasesData = await phrasesRes.json();
      if (phrasesRes.ok) {
        setPhrases(phrasesData.phrases || []);
      }
    } catch (err) {
      console.error('Erro ao carregar frases rápidas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Copiar atalho
  const handleCopyShortcut = (e: React.MouseEvent, shortcut: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(shortcut);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Abrir modal de criação
  const handleOpenCreate = () => {
    setEditingPhrase(null);
    setFormData({
      shortcut: '/',
      title: '',
      category: selectedCategory !== 'ALL' ? selectedCategory : PRESET_CATEGORIES[0],
      content: ''
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Abrir modal de edição
  const handleOpenEdit = (phrase: QuickPhrase) => {
    setEditingPhrase(phrase);
    setFormData({
      shortcut: phrase.shortcut,
      title: phrase.title,
      category: phrase.category,
      content: phrase.content.replace(/<[^>]*>/g, '') // remove tags para edição amigável se desejar, ou mantém
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Salvar frase (POST ou PATCH)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    let shortcut = formData.shortcut.trim();
    if (!shortcut.startsWith('/')) {
      shortcut = '/' + shortcut;
    }

    if (!shortcut || shortcut === '/') {
      setFormError('Informe um atalho válido iniciando com / (ex: /torax-normal)');
      return;
    }

    if (!formData.title.trim()) {
      setFormError('Informe o título descritivo da frase rápida.');
      return;
    }

    if (!formData.content.trim()) {
      setFormError('Informe o conteúdo médico da frase.');
      return;
    }

    setIsSaving(true);
    try {
      // Format content with paragraph if not already HTML
      let formattedContent = formData.content.trim();
      if (!formattedContent.startsWith('<p>')) {
        formattedContent = '<p>' + formattedContent.replace(/\n/g, '<br>') + '</p>';
      }

      if (editingPhrase) {
        // PATCH
        const res = await fetch(`/api/macros/${editingPhrase.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shortcut,
            title: formData.title.trim(),
            category: formData.category,
            content: formattedContent
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao atualizar frase');
        setPhrases(prev => prev.map(p => p.id === editingPhrase.id ? data.phrase : p));
        showToast('Frase rápida atualizada com sucesso!');
      } else {
        // POST
        const res = await fetch('/api/macros', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shortcut,
            title: formData.title.trim(),
            category: formData.category,
            content: formattedContent
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao criar frase');
        setPhrases(prev => [data.phrase, ...prev]);
        showToast('Nova frase rápida cadastrada com sucesso!');
      }

      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Erro ao salvar frase rápida');
    } finally {
      setIsSaving(false);
    }
  };

  // Excluir frase
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Tem certeza que deseja excluir a frase rápida "${title}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/macros/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPhrases(prev => prev.filter(p => p.id !== id));
        showToast('Frase rápida removida com sucesso!');
      }
    } catch (err) {
      console.error('Erro ao excluir frase:', err);
    }
  };

  // Categorias disponíveis dinamicamente
  const allCategories = useMemo(() => {
    const set = new Set(PRESET_CATEGORIES);
    phrases.forEach(p => set.add(p.category));
    return Array.from(set);
  }, [phrases]);

  // Filtragem e busca
  const filteredPhrases = useMemo(() => {
    return phrases.filter(p => {
      const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        p.title.toLowerCase().includes(q) || 
        p.shortcut.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [phrases, selectedCategory, searchQuery]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500 gap-3">
        <div className="w-10 h-10 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold">Carregando gerenciador de frases rápidas...</span>
      </div>
    );
  }

  const isAuthorized = currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'RADIOLOGIST');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <Navbar user={currentUser} />

      {/* Toast de Sucesso */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-teal-800 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-teal-300 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Cabeçalho e Voltar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-teal-700 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar ao Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-2xs">
                <Zap className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Frases Rápidas &amp; Macros de Laudo
                </h1>
                <p className="text-xs text-slate-600">
                  Gerencie parágrafos prontos e atalhos com barra (<strong className="text-amber-700 font-mono">/</strong>) para laudar com máxima agilidade.
                </p>
              </div>
            </div>
          </div>

          {isAuthorized && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Frase Rápida</span>
            </button>
          )}
        </div>

        {/* Banner Explicativo sobre o uso de / no Laudo */}
        <div className="bg-gradient-to-r from-amber-50/80 via-teal-50/60 to-sky-50/70 border border-amber-200/80 rounded-3xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 font-mono font-black text-base shadow-2xs">
              /
            </span>
            <div className="space-y-0.5 text-xs text-slate-700">
              <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span>Como usar durante a edição do laudo:</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-200/60 text-amber-900 font-mono text-[10px]">Atalho Ativo</span>
              </div>
              <p>
                No editor de texto do laudo, digite <code className="bg-white px-1.5 py-0.5 rounded font-mono text-amber-800 font-bold border border-amber-200">/</code> seguido de uma palavra (ex: <code className="bg-white px-1.5 py-0.5 rounded font-mono text-amber-800 font-bold border border-amber-200">/torax</code> ou <code className="bg-white px-1.5 py-0.5 rounded font-mono text-amber-800 font-bold border border-amber-200">/cardio</code>). O menu flutuante aparecerá automaticamente para você escolher e preencher o texto instantaneamente!
              </p>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 transition shadow-2xs shrink-0 self-start md:self-auto"
          >
            Testar no Editor
          </Link>
        </div>

        {/* Barra de Pesquisa e Filtro de Categorias */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Buscar por atalho, título, termo médico..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 outline-none focus:border-teal-500 shadow-2xs transition"
            />
          </div>

          {/* Abas / Filtro de Categoria */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Todas ({phrases.length})
            </button>
            {allCategories.map(cat => {
              const count = phrases.filter(p => p.category === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid de Frases Rápidas */}
        {filteredPhrases.length === 0 ? (
          <div className="py-16 text-center bg-white border border-slate-200/90 rounded-3xl p-8 space-y-3 shadow-xs">
            <Zap className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">Nenhuma frase rápida encontrada</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery ? 'Tente buscar por outros termos ou atalhos.' : 'Cadastre sua primeira frase rápida para acelerar a emissão de laudos.'}
            </p>
            {isAuthorized && (
              <button
                type="button"
                onClick={handleOpenCreate}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-teal-700 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Criar Frase Rápida</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPhrases.map(phrase => {
              const plainText = phrase.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
              return (
                <div
                  key={phrase.id}
                  className="bg-white border border-slate-200/90 hover:border-teal-300 rounded-3xl p-5 flex flex-col justify-between space-y-4 transition-all duration-200 shadow-2xs hover:shadow-md group relative"
                >
                  <div className="space-y-2.5">
                    {/* Topo do Card: Atalho e Categoria */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-900 px-2.5 py-1 rounded-xl font-mono text-xs font-black shadow-2xs">
                        <span>{phrase.shortcut}</span>
                        <button
                          type="button"
                          onClick={(e) => handleCopyShortcut(e, phrase.shortcut, phrase.id)}
                          className="hover:text-amber-700 transition cursor-pointer ml-1"
                          title="Copiar atalho"
                        >
                          {copiedId === phrase.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3 text-amber-600" />
                          )}
                        </button>
                      </div>

                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/80 truncate max-w-[130px]">
                        {phrase.category}
                      </span>
                    </div>

                    {/* Título */}
                    <h3 className="font-black text-slate-900 text-sm tracking-tight group-hover:text-teal-800 transition-colors">
                      {phrase.title}
                    </h3>

                    {/* Preview do Conteúdo */}
                    <p className="text-xs text-slate-600 line-clamp-4 leading-relaxed font-sans bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                      {plainText}
                    </p>
                  </div>

                  {/* Rodapé do Card: Ações */}
                  {isAuthorized && (
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-slate-400">
                        {phrase.createdBy ? `Por ${phrase.createdBy}` : 'Padrão do Sistema'}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(phrase)}
                          className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-xl transition cursor-pointer"
                          title="Editar Frase Rápida"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(phrase.id, phrase.title)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                          title="Excluir Frase Rápida"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* MODAL DE CRIAÇÃO / EDIÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-2xs">
                  <Zap className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {editingPhrase ? 'Editar Frase Rápida' : 'Nova Frase Rápida'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Atalho com barra para inserção instantânea no laudo
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {formError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Atalho e Categoria */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Atalho de Teclado (inicie com /) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="/torax-normal"
                    value={formData.shortcut}
                    onChange={e => setFormData({ ...formData, shortcut: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:bg-white focus:border-teal-500 font-mono font-bold shadow-2xs"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Ex: /cardio, /displasia</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Categoria Anatômica *
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:bg-white focus:border-teal-500 font-medium shadow-2xs cursor-pointer"
                  >
                    {PRESET_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Título Descritivo */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Título da Frase Rápida *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Tórax sem alterações patológicas evidentes"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:bg-white focus:border-teal-500 shadow-2xs font-semibold"
                />
              </div>

              {/* Conteúdo Médico */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Texto da Frase / Parágrafo Médico *
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="Descreva o parágrafo clínico que será colado automaticamente ao acionar o atalho..."
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-slate-800 outline-none focus:bg-white focus:border-teal-500 shadow-2xs font-sans leading-relaxed text-xs sm:text-sm"
                />
              </div>

              {/* Botões do Modal */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-xs transition active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSaving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <span>Salvar Frase Rápida</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
