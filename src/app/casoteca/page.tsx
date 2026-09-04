'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, 
  Search, 
  Sparkles, 
  Filter, 
  Eye, 
  X, 
  ArrowLeft, 
  Layers, 
  Tag, 
  GraduationCap, 
  CheckCircle2, 
  Share2, 
  Bookmark,
  ChevronRight,
  Stethoscope
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { User, TeachingCase } from '@/types';

const CATEGORIES = [
  'Todas',
  'Tórax & Coração',
  'Abdômen & Órgãos',
  'Ortopedia & Coluna',
  'Crânio & Cervical',
  'Ultrassonografia'
];

const SPECIES = [
  'Todas',
  'Canino',
  'Felino',
  'Silvestre/Exótico'
];

export default function CasotecaPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cases, setCases] = useState<TeachingCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedSpecies, setSelectedSpecies] = useState('Todas');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Todas');
  const [activeCase, setActiveCase] = useState<TeachingCase | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const meRes = await fetch('/api/auth/me');
        const meData = await meRes.json();
        if (meData.user) {
          setCurrentUser(meData.user);
        }

        const casesRes = await fetch('/api/cases');
        const casesData = await casesRes.json();
        if (casesRes.ok && casesData.cases) {
          setCases(casesData.cases);
        }
      } catch (err) {
        console.error('Erro ao carregar casoteca:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      const matchCat = selectedCategory === 'Todas' || c.category === selectedCategory;
      const matchSpec = selectedSpecies === 'Todas' || c.species === selectedSpecies;
      const matchDiff = selectedDifficulty === 'Todas' || c.difficulty === selectedDifficulty;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q ||
        c.title.toLowerCase().includes(q) ||
        c.diagnosis.toLowerCase().includes(q) ||
        c.findings.toLowerCase().includes(q) ||
        c.breed.toLowerCase().includes(q);

      return matchCat && matchSpec && matchDiff && matchSearch;
    });
  }, [cases, selectedCategory, selectedSpecies, selectedDifficulty, searchQuery]);

  const handleOpenCase = async (c: TeachingCase) => {
    setActiveCase(c);
    // registrar incremento de visualização
    try {
      fetch(`/api/cases/${c.id}`);
      setCases(prev => prev.map(item => item.id === c.id ? { ...item, viewsCount: (item.viewsCount || 0) + 1 } : item));
    } catch (err) {}
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'Caso Raro':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Avançado':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Intermediário':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <Navbar user={currentUser} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Cabeçalho */}
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
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shadow-2xs">
                <BookOpen className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Casoteca &amp; Atlas Radiológico</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold font-mono">
                    {cases.length} Casos de Ensino
                  </span>
                </h1>
                <p className="text-xs text-slate-600">
                  Repositório de achados clássicos, patologias raras e discussão diagnóstica veterinária.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros e Barra de Pesquisa */}
        <div className="space-y-3 bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Buscar por patologia (ex: GDV, hérnia, osteossarcoma), raça, achado..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-500 shadow-2xs transition"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              {/* Espécie */}
              <select
                value={selectedSpecies}
                onChange={e => setSelectedSpecies(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold outline-none cursor-pointer"
              >
                {SPECIES.map(sp => (
                  <option key={sp} value={sp}>{sp === 'Todas' ? 'Todas Espécies' : sp}</option>
                ))}
              </select>

              {/* Dificuldade */}
              <select
                value={selectedDifficulty}
                onChange={e => setSelectedDifficulty(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold outline-none cursor-pointer"
              >
                <option value="Todas">Toda Dificuldade</option>
                <option value="Básico / Ensino">Básico / Ensino</option>
                <option value="Intermediário">Intermediário</option>
                <option value="Avançado">Avançado</option>
                <option value="Caso Raro">Caso Raro</option>
              </select>
            </div>
          </div>

          {/* Categorias / Abas */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Casos */}
        {isLoading ? (
          <div className="py-20 text-center text-slate-500 flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold">Carregando atlas de casos clínicos...</span>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="py-16 text-center bg-white border border-slate-200 rounded-3xl p-8 space-y-2 shadow-xs">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">Nenhum caso clínico encontrado</h3>
            <p className="text-xs text-slate-500">Tente ajustar seus filtros de busca ou categoria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCases.map(caseItem => {
              const primaryImage = caseItem.images && caseItem.images.length > 0 
                ? caseItem.images[0].url 
                : 'https://images.unsplash.com/photo-1516382799247-87df95d790b7?auto=format&fit=crop&q=80&w=800';

              return (
                <div
                  key={caseItem.id}
                  onClick={() => handleOpenCase(caseItem)}
                  className="bg-white border border-slate-200/90 hover:border-indigo-300 rounded-3xl overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-200 flex flex-col cursor-pointer group"
                >
                  {/* Imagem do Caso */}
                  <div className="relative h-48 bg-slate-950 overflow-hidden">
                    <img
                      src={primaryImage}
                      alt={caseItem.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />
                    
                    {/* Badges sobre a imagem */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border shadow-xs ${getDifficultyBadge(caseItem.difficulty)}`}>
                        {caseItem.difficulty}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-black/60 text-white backdrop-blur-xs border border-white/20">
                        {caseItem.modality}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-slate-200 font-semibold">
                      <span>{caseItem.species} • {caseItem.breed}</span>
                      <span className="flex items-center gap-1 text-[10px] text-slate-300">
                        <Eye className="w-3 h-3" />
                        {caseItem.viewsCount || 0}
                      </span>
                    </div>
                  </div>

                  {/* Conteúdo do Card */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                        {caseItem.category}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition line-clamp-2 leading-snug">
                        {caseItem.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {caseItem.summary || caseItem.findings}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-slate-400 truncate max-w-[170px]">
                        {caseItem.createdBy}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                        <span>Ver Estudo</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* MODAL DETALHADO DO CASO DE ENSINO */}
      {activeCase && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            {/* Topo do Modal */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shadow-2xs">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border ${getDifficultyBadge(activeCase.difficulty)}`}>
                      {activeCase.difficulty}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      {activeCase.category} • {activeCase.modality}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 line-clamp-1">
                    {activeCase.title}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveCase(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
              {/* Imagens do Caso */}
              {activeCase.images && activeCase.images.length > 0 && (
                <div className="space-y-2">
                  <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <span>Imagens e Projeções do Exame:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeCase.images.map((img, idx) => (
                      <div key={idx} className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 flex flex-col">
                        <img
                          src={img.url}
                          alt={img.label}
                          className="w-full h-48 object-cover cursor-zoom-in"
                          onClick={() => window.open(img.url, '_blank')}
                        />
                        <div className="p-2 bg-slate-900 text-slate-300 text-[10px] font-mono border-t border-slate-800 text-center truncate">
                          {img.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Paciente e Anamnese */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Espécie &amp; Raça:</span>
                  <span className="font-bold text-slate-800 text-xs">{activeCase.species} • {activeCase.breed}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Idade:</span>
                  <span className="font-bold text-slate-800 text-xs">{activeCase.age || 'Não informada'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Especialista Responsável:</span>
                  <span className="font-bold text-slate-800 text-xs truncate block">{activeCase.createdBy}</span>
                </div>
              </div>

              {/* Histórico Clínico */}
              {activeCase.clinicalHistory && (
                <div>
                  <h4 className="font-bold text-slate-800 text-xs mb-1">Histórico Clínico &amp; Suspeita:</h4>
                  <p className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 text-slate-700 leading-relaxed">
                    {activeCase.clinicalHistory}
                  </p>
                </div>
              )}

              {/* Achados Radiográficos */}
              <div>
                <h4 className="font-bold text-slate-800 text-xs mb-1">Achados Radiográficos &amp; Interpretação:</h4>
                <div className="p-3.5 bg-white rounded-2xl border border-slate-200 text-slate-800 leading-relaxed">
                  {activeCase.findings}
                </div>
              </div>

              {/* Diagnóstico Definitivo */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                  Diagnóstico Conclusivo:
                </span>
                <p className="font-bold text-slate-900 text-sm">
                  {activeCase.diagnosis}
                </p>
              </div>

              {/* Dicas de Ouro / Key Points */}
              {activeCase.keyPoints && activeCase.keyPoints.length > 0 && (
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Pontos-Chave de Ensino &amp; Dicas de Plantão:</span>
                  </div>
                  <ul className="space-y-1.5 pl-4 list-disc text-slate-700 text-xs">
                    {activeCase.keyPoints.map((pt, i) => (
                      <li key={i} className="leading-relaxed">{pt}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Diagnósticos Diferenciais */}
              {activeCase.differentialDiagnosis && activeCase.differentialDiagnosis.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-800 text-xs mb-1">Diagnósticos Diferenciais Considerados:</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeCase.differentialDiagnosis.map((diff, i) => (
                      <span key={i} className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold">
                        {diff}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Rodapé do Modal */}
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">
                VetTeleRad Atlas de Radiologia Veterinária
              </span>
              <button
                type="button"
                onClick={() => setActiveCase(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-semibold cursor-pointer transition"
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
