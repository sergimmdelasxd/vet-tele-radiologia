'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  PlusCircle, 
  Search, 
  Clock, 
  Flame, 
  FileText, 
  Eye, 
  CheckCircle2, 
  Stethoscope, 
  Building2, 
  ShieldCheck, 
  Activity, 
  Waves, 
  X, 
  RefreshCw, 
  Printer, 
  Sparkles, 
  SlidersHorizontal, 
  Wallet, 
  Calendar, 
  DollarSign,
  LayoutGrid,
  List,
  ArrowUpDown,
  Copy,
  Check,
  Layers,
  Timer,
  RotateCcw,
  User as UserIcon,
  ChevronRight
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { DicomXrayViewer } from '@/components/viewer/DicomXrayViewer';
import { ReportEditor } from '@/components/report/ReportEditor';
import { ReportDocument } from '@/components/report/ReportDocument';
import { NewExamModal } from '@/components/dashboard/NewExamModal';
import { FinancialModal } from '@/components/dashboard/FinancialModal';
import { Exam, User, ExamStatus, ExamPriority, ExamModality } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtros, busca e ordenação
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ExamStatus>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | ExamPriority>('ALL');
  const [modalityFilter, setModalityFilter] = useState<'ALL' | ExamModality>('ALL');
  const [sortBy, setSortBy] = useState<'RECENT' | 'URGENT' | 'OLDEST' | 'PATIENT'>('RECENT');

  // Modo de visualização (Cards vs Tabela PACS/Worklist)
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('CARDS');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modais e Estados de Trabalho
  const [isNewExamModalOpen, setIsNewExamModalOpen] = useState(false);
  const [activeViewingExam, setActiveViewingExam] = useState<Exam | null>(null);
  const [activeReportingExam, setActiveReportingExam] = useState<Exam | null>(null);
  const [activeDocumentExam, setActiveDocumentExam] = useState<Exam | null>(null);
  const [isFinancialModalOpen, setIsFinancialModalOpen] = useState(false);
  // Proporção de tela entre Visualizador e Editor de Laudo ('35' | '50' | '60' | '75')
  const [editorSplitRatio, setEditorSplitRatio] = useState<'35' | '50' | '60' | '75'>('60');

  // Carregar usuário e exames
  const loadData = async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (!meData.user) {
        router.push('/login');
        return;
      }
      setCurrentUser(meData.user);

      const examsRes = await fetch('/api/exams');
      const examsData = await examsRes.json();
      if (examsData.exams) {
        setExams(examsData.exams);
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

  // Formatação amigável de tempo decorrido
  const formatRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      if (diffMinutes < 1) return 'Agora mesmo';
      if (diffMinutes < 60) return `Há ${diffMinutes} min`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `Há ${diffHours}h`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return 'Ontem';
      return `Há ${diffDays} dias`;
    } catch {
      return 'Recente';
    }
  };

  // Copiar ID do protocolo com feedback
  const handleCopyId = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Limpar todos os filtros ativos
  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setModalityFilter('ALL');
    setSortBy('RECENT');
  };

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'ALL' || priorityFilter !== 'ALL' || modalityFilter !== 'ALL' || sortBy !== 'RECENT';

  // Exames filtrados e ordenados
  const filteredAndSortedExams = useMemo(() => {
    const result = exams.filter(e => {
      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        e.patientName.toLowerCase().includes(query) ||
        e.breed.toLowerCase().includes(query) ||
        e.id.toLowerCase().includes(query) ||
        e.clinicName.toLowerCase().includes(query) ||
        e.region.toLowerCase().includes(query) ||
        (e.species && e.species.toLowerCase().includes(query)) ||
        (e.suspectedDiagnosis && e.suspectedDiagnosis.toLowerCase().includes(query));

      const matchStatus = statusFilter === 'ALL' || e.status === statusFilter;
      const matchPriority = priorityFilter === 'ALL' || e.priority === priorityFilter;
      const matchModality = modalityFilter === 'ALL' || e.modality === modalityFilter;

      return matchSearch && matchStatus && matchPriority && matchModality;
    });

    return result.sort((a, b) => {
      if (sortBy === 'URGENT') {
        if (a.priority === 'URGENT' && b.priority !== 'URGENT') return -1;
        if (a.priority !== 'URGENT' && b.priority === 'URGENT') return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'OLDEST') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'PATIENT') {
        return a.patientName.localeCompare(b.patientName);
      }
      // Padrão: mais recente primeiro
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [exams, searchQuery, statusFilter, priorityFilter, modalityFilter, sortBy]);

  // Estatísticas do Usuário
  const stats = useMemo(() => {
    return {
      total: exams.length,
      pending: exams.filter(e => e.status === 'PENDING').length,
      inProgress: exams.filter(e => e.status === 'IN_PROGRESS').length,
      reported: exams.filter(e => e.status === 'REPORTED').length,
      urgent: exams.filter(e => e.priority === 'URGENT' && e.status !== 'REPORTED').length,
      xrays: exams.filter(e => e.modality === 'RADIOGRAFIA').length,
      ultrasounds: exams.filter(e => e.modality === 'ULTRASSOM').length
    };
  }, [exams]);

  const handleExamCreated = (newExam: Exam) => {
    setExams(prev => [newExam, ...prev]);
  };

  const handleReportSaved = (updatedExam: Exam) => {
    setExams(prev => prev.map(e => e.id === updatedExam.id ? updatedExam : e));
    setActiveReportingExam(null);
    setActiveDocumentExam(updatedExam);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold tracking-wide">Carregando portal de diagnóstico veterinário...</span>
      </div>
    );
  }

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      <Navbar
        user={currentUser}
        onNewExamClick={() => setIsNewExamModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner de Boas-vindas & CTA */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800/90 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2.5">
                {currentUser.role === 'CLINIC' && (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                    <Building2 className="w-3.5 h-3.5" /> Portal do Solicitante (Clínica Parceira)
                  </span>
                )}
                {currentUser.role === 'RADIOLOGIST' && (
                  <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                    <Stethoscope className="w-3.5 h-3.5" /> Fila de Laudos (Radiografia &amp; Ultrassom)
                  </span>
                )}
                {currentUser.role === 'ADMIN' && (
                  <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5" /> Central de Diagnóstico por Imagem
                  </span>
                )}

                <span className="text-[11px] text-slate-400 hidden sm:inline-flex items-center gap-1">
                  • {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-2">
                Olá, {currentUser.name.split(' ')[0]}
                <span className="text-cyan-400 font-normal">👋</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
                {currentUser.role === 'CLINIC'
                  ? `Acompanhe seus pedidos de Telerradiografia e Ultrassonografia da ${currentUser.clinicName || 'sua clínica'}. Envie exames 24h e emita laudos timbrados assinados digitalmente.`
                  : 'Worklist veterinária integrada: laudos de Raio-X e Ultrassonografia com visualizador PACS web, modelos ágeis e ferramentas de calibração.'}
              </p>
            </div>

            {/* Ações Primárias */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              {(currentUser.role === 'CLINIC' || currentUser.role === 'ADMIN') && (
                <button
                  type="button"
                  onClick={() => setIsFinancialModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 sm:py-3 bg-slate-900/90 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                  title="Abrir Carteira, Extrato e Recarga de Saldo"
                >
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  <span>
                    Saldo: <strong className="font-mono text-emerald-300">R$ {(currentUser.balance ?? 0).toFixed(2).replace('.', ',')}</strong>
                  </span>
                </button>
              )}

              {(currentUser.role === 'RADIOLOGIST' || currentUser.role === 'ADMIN') && (
                <>
                  <Link
                    href="/agenda"
                    className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3 bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                    title="Abrir Agenda de Rotina e Horários de Exames"
                  >
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    <span>Agenda</span>
                  </Link>

                  <Link
                    href="/financeiro"
                    className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                    title="Abrir Painel Financeiro e Volumetria de Clínicas"
                  >
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span>Financeiro</span>
                  </Link>
                </>
              )}

              <button
                onClick={() => setIsNewExamModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-cyan-500/25 transition-all active:scale-95 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>
                  {currentUser.role === 'CLINIC'
                    ? 'Novo Pedido'
                    : 'Cadastrar Exame'}
                </span>
              </button>

              <button
                onClick={loadData}
                className="p-2.5 sm:p-3 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700/80 transition-all cursor-pointer"
                title="Atualizar dados agora"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cards de Métricas Rápidas Interativos (Filtram ao Clicar) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-800/80 text-xs">
            {/* 1. Total */}
            <button
              type="button"
              onClick={() => {
                setModalityFilter('ALL');
                setStatusFilter('ALL');
                setPriorityFilter('ALL');
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer group ${
                modalityFilter === 'ALL' && statusFilter === 'ALL' && priorityFilter === 'ALL'
                  ? 'bg-slate-800/80 border-cyan-500/50 ring-1 ring-cyan-500/30 shadow-lg'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
              title="Clique para ver todos os exames"
            >
              <div className="flex items-center justify-between text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                <span>Total de Exames</span>
                <Layers className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
              </div>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-2xl font-black text-white">{stats.total}</span>
                <span className="text-[10px] text-slate-400">casos</span>
              </div>
            </button>

            {/* 2. Raio-X */}
            <button
              type="button"
              onClick={() => {
                setModalityFilter(prev => prev === 'RADIOGRAFIA' ? 'ALL' : 'RADIOGRAFIA');
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer group ${
                modalityFilter === 'RADIOGRAFIA'
                  ? 'bg-cyan-950/40 border-cyan-500/70 ring-1 ring-cyan-500/40 shadow-lg shadow-cyan-950/30'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-cyan-500/30 hover:bg-slate-900/60'
              }`}
              title="Clique para filtrar apenas Raio-X"
            >
              <div className="flex items-center justify-between text-cyan-400 text-[11px] uppercase tracking-wider font-semibold">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" /> Raio-X
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-mono">
                  {stats.total > 0 ? Math.round((stats.xrays / stats.total) * 100) : 0}%
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-2xl font-black text-cyan-400">{stats.xrays}</span>
                <span className="text-[10px] text-cyan-300/70">laudos RX</span>
              </div>
            </button>

            {/* 3. Ultrassom */}
            <button
              type="button"
              onClick={() => {
                setModalityFilter(prev => prev === 'ULTRASSOM' ? 'ALL' : 'ULTRASSOM');
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer group ${
                modalityFilter === 'ULTRASSOM'
                  ? 'bg-blue-950/40 border-blue-500/70 ring-1 ring-blue-500/40 shadow-lg shadow-blue-950/30'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-blue-500/30 hover:bg-slate-900/60'
              }`}
              title="Clique para filtrar apenas Ultrassom"
            >
              <div className="flex items-center justify-between text-blue-400 text-[11px] uppercase tracking-wider font-semibold">
                <span className="flex items-center gap-1.5">
                  <Waves className="w-3.5 h-3.5" /> Ultrassom
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-300 font-mono">
                  {stats.total > 0 ? Math.round((stats.ultrasounds / stats.total) * 100) : 0}%
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-2xl font-black text-blue-400">{stats.ultrasounds}</span>
                <span className="text-[10px] text-blue-300/70">cortes USG</span>
              </div>
            </button>

            {/* 4. Laudos Concluídos */}
            <button
              type="button"
              onClick={() => {
                setStatusFilter(prev => prev === 'REPORTED' ? 'ALL' : 'REPORTED');
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer group ${
                statusFilter === 'REPORTED'
                  ? 'bg-emerald-950/40 border-emerald-500/70 ring-1 ring-emerald-500/40 shadow-lg shadow-emerald-950/30'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-emerald-500/30 hover:bg-slate-900/60'
              }`}
              title="Clique para filtrar laudos prontos"
            >
              <div className="flex items-center justify-between text-emerald-400 text-[11px] uppercase tracking-wider font-semibold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Prontos
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-mono">
                  {stats.total > 0 ? Math.round((stats.reported / stats.total) * 100) : 0}%
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-2xl font-black text-emerald-400">{stats.reported}</span>
                <span className="text-[10px] text-emerald-300/70">emitidos</span>
              </div>
            </button>

            {/* 5. Urgências 24h */}
            <button
              type="button"
              onClick={() => {
                setPriorityFilter(prev => prev === 'URGENT' ? 'ALL' : 'URGENT');
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer col-span-2 sm:col-span-1 group ${
                priorityFilter === 'URGENT'
                  ? 'bg-rose-950/40 border-rose-500/70 ring-1 ring-rose-500/40 shadow-lg shadow-rose-950/30'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-rose-500/30 hover:bg-slate-900/60'
              }`}
              title="Clique para filtrar urgências 24h"
            >
              <div className="flex items-center justify-between text-rose-400 text-[11px] uppercase tracking-wider font-semibold">
                <span className="flex items-center gap-1.5">
                  <Flame className={`w-3.5 h-3.5 fill-rose-500/20 ${stats.urgent > 0 ? 'animate-pulse text-rose-400' : ''}`} /> Urgências
                </span>
                {stats.urgent > 0 && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-extrabold animate-pulse">
                    Plantão
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-2xl font-black text-rose-400">{stats.urgent}</span>
                <span className="text-[10px] text-rose-300/70">críticos</span>
              </div>
            </button>
          </div>
        </div>

        {/* BARRA DE CONTROLE, FILTROS, ORDENAÇÃO E ALTERNADOR DE VISÃO */}
        <div className="space-y-3">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg space-y-3">
            {/* Linha Superior: Busca + Ordenação + Toggle Modo de Visão */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              {/* Campo de Busca com Botão de Limpar */}
              <div className="relative flex-1 max-w-xl">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por paciente, raça, órgão, clínica ou ID do protocolo..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-9 py-2.5 text-xs text-slate-200 outline-none focus:border-cyan-500 transition-colors placeholder-slate-500 shadow-inner"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                    title="Limpar busca"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Controles da Direita: Ordenação e Toggle Cards/Tabela */}
              <div className="flex items-center gap-2.5 self-end lg:self-auto">
                {/* Seletor de Ordenação */}
                <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-slate-400 hidden sm:inline text-[11px]">Ordem:</span>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as any)}
                    aria-label="Ordenação de exames"
                    className="bg-transparent text-slate-200 text-xs font-semibold outline-none cursor-pointer py-1"
                  >
                    <option value="RECENT" className="bg-slate-900 text-slate-200">Mais Recentes</option>
                    <option value="URGENT" className="bg-slate-900 text-slate-200">Urgências Primeiro</option>
                    <option value="OLDEST" className="bg-slate-900 text-slate-200">Mais Antigos (Fila)</option>
                    <option value="PATIENT" className="bg-slate-900 text-slate-200">Nome do Paciente (A-Z)</option>
                  </select>
                </div>

                {/* Alternador de Visão: Cards vs Tabela Médica */}
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setViewMode('CARDS')}
                    className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                      viewMode === 'CARDS'
                        ? 'bg-slate-800 text-cyan-400 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Visualizar em Cards Detalhados"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Cards</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode('TABLE')}
                    className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                      viewMode === 'TABLE'
                        ? 'bg-slate-800 text-cyan-400 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Visualizar em Tabela Médica (Worklist PACS)"
                  >
                    <List className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Tabela</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Linha Inferior: Filtros Rápidos de Modalidade e Status */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-800/80">
              {/* Modalidade */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setModalityFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                    modalityFilter === 'ALL'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Todas
                </button>

                <button
                  onClick={() => setModalityFilter('RADIOGRAFIA')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                    modalityFilter === 'RADIOGRAFIA'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-cyan-300'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Raio-X ({stats.xrays})</span>
                </button>

                <button
                  onClick={() => setModalityFilter('ULTRASSOM')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                    modalityFilter === 'ULTRASSOM'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-blue-300'
                  }`}
                >
                  <Waves className="w-3.5 h-3.5" />
                  <span>Ultrassom ({stats.ultrasounds})</span>
                </button>
              </div>

              {/* Status e Urgência */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-2.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                    statusFilter === 'ALL'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Todos ({exams.length})
                </button>

                <button
                  onClick={() => setStatusFilter('PENDING')}
                  className={`px-2.5 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                    statusFilter === 'PENDING'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-amber-300'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  <span>Na Fila ({stats.pending})</span>
                </button>

                <button
                  onClick={() => setStatusFilter('IN_PROGRESS')}
                  className={`px-2.5 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                    statusFilter === 'IN_PROGRESS'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-blue-300'
                  }`}
                >
                  <Stethoscope className="w-3 h-3" />
                  <span>Em Análise ({stats.inProgress})</span>
                </button>

                <button
                  onClick={() => setStatusFilter('REPORTED')}
                  className={`px-2.5 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                    statusFilter === 'REPORTED'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-emerald-300'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Prontos ({stats.reported})</span>
                </button>

                {/* Toggle de Urgência */}
                <button
                  onClick={() => setPriorityFilter(prev => prev === 'URGENT' ? 'ALL' : 'URGENT')}
                  className={`px-2.5 py-1.5 rounded-lg font-semibold transition flex items-center gap-1 cursor-pointer ml-1 ${
                    priorityFilter === 'URGENT'
                      ? 'bg-rose-600 text-white shadow-sm ring-1 ring-rose-400/50'
                      : 'text-rose-400 bg-rose-950/30 hover:bg-rose-950/60 border border-rose-800/40'
                  }`}
                  title="Exibir apenas casos urgentes de plantão"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Urgentes ({stats.urgent})</span>
                </button>
              </div>
            </div>
          </div>

          {/* Barra de Status dos Resultados & Botão Limpar Filtros */}
          <div className="flex items-center justify-between px-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span>
                Exibindo <strong className="text-white font-mono">{filteredAndSortedExams.length}</strong> de <strong className="text-slate-300 font-mono">{exams.length}</strong> exames
              </span>
              {searchQuery && (
                <span className="text-cyan-400">
                  • contendo &quot;{searchQuery}&quot;
                </span>
              )}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer transition"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Limpar filtros</span>
              </button>
            )}
          </div>
        </div>

        {/* LISTAGEM PRINCIPAL: MODO CARDS OU MODO TABELA */}
        {filteredAndSortedExams.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center mx-auto text-slate-500">
              <FileText className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base font-bold text-white">Nenhum exame encontrado</h3>
              <p className="text-xs text-slate-400">
                Não localizamos exames correspondentes aos filtros selecionados. Tente ajustar os termos de busca ou filtros de modalidade e status.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Limpar Filtros</span>
                </button>
              )}
              <button
                onClick={() => setIsNewExamModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Cadastrar Novo Exame</span>
              </button>
            </div>
          </div>
        ) : viewMode === 'TABLE' ? (
          /* ========================================================================= */
          /* MODO TABELA MÉDICA (WORKLIST PROFISSIONAL PACS/RIS)                       */
          /* ========================================================================= */
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                    <th className="py-3.5 px-4">Status &amp; Prioridade</th>
                    <th className="py-3.5 px-4">Protocolo</th>
                    <th className="py-3.5 px-4">Paciente</th>
                    <th className="py-3.5 px-4">Região / Estudo</th>
                    <th className="py-3.5 px-4">Clínica &amp; Solicitante</th>
                    <th className="py-3.5 px-4">Data &amp; Fila</th>
                    <th className="py-3.5 px-4 text-right">Ações Rápidas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredAndSortedExams.map(exam => {
                    const isUrgent = exam.priority === 'URGENT';
                    const isReported = exam.status === 'REPORTED';
                    const isPending = exam.status === 'PENDING';
                    const isInProgress = exam.status === 'IN_PROGRESS';
                    const isUltrasound = exam.modality === 'ULTRASSOM';

                    return (
                      <tr 
                        key={exam.id}
                        className={`hover:bg-slate-800/40 transition-colors ${
                          isUrgent && !isReported ? 'bg-rose-950/10' : ''
                        }`}
                      >
                        {/* Status & Prioridade */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            {isReported && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 w-fit">
                                <CheckCircle2 className="w-3 h-3" /> Concluído
                              </span>
                            )}
                            {isPending && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 w-fit">
                                <Clock className="w-3 h-3" /> Na Fila
                              </span>
                            )}
                            {isInProgress && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30 w-fit">
                                <Stethoscope className="w-3 h-3" /> Em Análise
                              </span>
                            )}

                            {isUrgent && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse w-fit">
                                <Flame className="w-2.5 h-2.5" /> Urgência 2h
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Protocolo & Modalidade */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-mono font-bold text-white text-xs">
                            <span>{exam.id}</span>
                            <button
                              type="button"
                              onClick={(e) => handleCopyId(e, exam.id)}
                              className="text-slate-500 hover:text-cyan-300 transition"
                              title="Copiar ID"
                            >
                              {copiedId === exam.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                          <div className="mt-1">
                            {isUltrasound ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                <Waves className="w-2.5 h-2.5" /> ULTRASSOM
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                <Activity className="w-2.5 h-2.5" /> RAIO-X
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Paciente */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white text-sm">
                            {exam.patientName}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            <span className="text-cyan-300 font-medium">{exam.species}</span> • {exam.breed} • {exam.age}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Tutor: {exam.ownerName}
                          </div>
                        </td>

                        {/* Estudo / Região */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-200">
                            {exam.region}
                          </div>
                          {exam.fastingHours && (
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Preparo: <strong className="text-slate-300">{exam.fastingHours}</strong>
                            </div>
                          )}
                          {exam.suspectedDiagnosis && (
                            <div className="text-[10px] text-slate-400 truncate max-w-xs" title={exam.suspectedDiagnosis}>
                              Suspeita: {exam.suspectedDiagnosis}
                            </div>
                          )}
                        </td>

                        {/* Clínica Solicitante */}
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-200 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                            <span className="truncate max-w-[150px]">{exam.clinicName}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {exam.requestingVet}
                          </div>
                        </td>

                        {/* Data & Fila */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-medium text-slate-200">
                            {new Date(exam.createdAt).toLocaleDateString('pt-BR')} às {new Date(exam.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Timer className="w-3 h-3 text-cyan-400" />
                            <span>{formatRelativeTime(exam.createdAt)}</span>
                          </div>
                        </td>

                        {/* Ações */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {/* Ver Imagens */}
                            <button
                              type="button"
                              onClick={() => setActiveViewingExam(exam)}
                              className="p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition cursor-pointer"
                              title="Visualizar imagens/cortes no PACS"
                            >
                              <Eye className="w-3.5 h-3.5 text-cyan-400" />
                              <span className="hidden xl:inline ml-1">PACS ({exam.images.length})</span>
                            </button>

                            {/* Laudar ou Ver Laudo */}
                            {isReported ? (
                              <button
                                type="button"
                                onClick={() => setActiveDocumentExam(exam)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition cursor-pointer"
                                title="Ver ou imprimir laudo timbrado"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Laudo</span>
                              </button>
                            ) : (
                              (currentUser.role === 'RADIOLOGIST' || currentUser.role === 'ADMIN') && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveReportingExam(exam);
                                    setActiveViewingExam(exam);
                                  }}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-lg shadow-sm transition cursor-pointer"
                                >
                                  <Stethoscope className="w-3.5 h-3.5" />
                                  <span>{isInProgress ? 'Continuar' : 'Laudar'}</span>
                                </button>
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* MODO CARDS DETALHADOS (DESIGN ELEVADO E RICO)                             */
          /* ========================================================================= */
          <div className="space-y-4">
            {filteredAndSortedExams.map(exam => {
              const isUrgent = exam.priority === 'URGENT';
              const isReported = exam.status === 'REPORTED';
              const isPending = exam.status === 'PENDING';
              const isInProgress = exam.status === 'IN_PROGRESS';
              const isUltrasound = exam.modality === 'ULTRASSOM';

              return (
                <div
                  key={exam.id}
                  className={`bg-slate-900 border rounded-3xl p-5 sm:p-6 transition-all duration-200 shadow-lg relative group ${
                    isUrgent && !isReported
                      ? 'border-rose-700/80 bg-gradient-to-r from-rose-950/20 via-slate-900 to-slate-900 hover:border-rose-600 shadow-rose-950/20'
                      : isUltrasound
                      ? 'border-slate-800 hover:border-blue-700/60 shadow-blue-950/10'
                      : 'border-slate-800 hover:border-slate-700 shadow-slate-950/50'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    {/* Bloco Esquerdo: Thumbnail + Detalhes do Caso */}
                    <div className="flex items-start gap-4">
                      {/* Thumbnail com Zoom Overlay */}
                      <div 
                        onClick={() => setActiveViewingExam(exam)}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-black border border-slate-800 overflow-hidden shrink-0 cursor-pointer relative group/thumb flex items-center justify-center shadow-md"
                        title="Clique para abrir no visualizador PACS"
                      >
                        {exam.images[0] ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={exam.images[0].url}
                              alt={exam.patientName}
                              className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/thumb:opacity-100 transition flex items-center justify-center text-white">
                              <Eye className="w-6 h-6 text-cyan-400" />
                            </div>
                          </>
                        ) : (
                          <FileText className="w-8 h-8 text-slate-600" />
                        )}

                        <span className="absolute bottom-1.5 right-1.5 bg-slate-950/90 border border-slate-800 text-[9px] px-1.5 py-0.5 rounded-md text-cyan-300 font-mono shadow-sm">
                          {exam.images.length} {isUltrasound ? 'cortes' : 'imgs'}
                        </span>
                      </div>

                      {/* Informações Centrais do Exame */}
                      <div className="space-y-1.5 flex-1">
                        {/* Linha de Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Protocolo Copiável */}
                          <div className="inline-flex items-center gap-1 font-mono text-xs font-bold text-slate-300 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                            <span>{exam.id}</span>
                            <button
                              type="button"
                              onClick={(e) => handleCopyId(e, exam.id)}
                              className="text-slate-500 hover:text-cyan-400 transition"
                              title="Copiar ID do exame"
                            >
                              {copiedId === exam.id ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>

                          {/* Modalidade */}
                          {isUltrasound ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                              <Waves className="w-3 h-3" /> ULTRASSOM (USG)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                              <Activity className="w-3 h-3" /> RAIO-X
                            </span>
                          )}

                          {/* Status */}
                          {isReported && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" /> Laudo Concluído
                            </span>
                          )}

                          {isPending && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              <Clock className="w-3 h-3" /> Na Fila para Laudo
                            </span>
                          )}

                          {isInProgress && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                              <Stethoscope className="w-3 h-3" /> Em Elaboração
                            </span>
                          )}

                          {/* Prioridade Urgente */}
                          {isUrgent && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
                              <Flame className="w-3 h-3" /> Urgência 2h
                            </span>
                          )}

                          {/* Tempo Decorrido */}
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 ml-auto lg:ml-0 font-medium">
                            <Timer className="w-3 h-3 text-cyan-400" />
                            {formatRelativeTime(exam.createdAt)}
                          </span>
                        </div>

                        {/* Nome do Paciente & Detalhes */}
                        <div className="flex flex-wrap items-center gap-2 pt-0.5">
                          <h2 className="text-lg font-black text-white tracking-tight">
                            {exam.patientName}
                          </h2>
                          <span className="px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                            {exam.species}
                          </span>
                          <span className="text-xs text-slate-300 font-medium">
                            {exam.breed} • {exam.age} {exam.weight && `• ${exam.weight}`} {exam.gender && `• ${exam.gender}`}
                          </span>
                        </div>

                        {/* Região, Preparo & Suspeita Diagnóstica */}
                        <div className="text-xs text-slate-300 font-medium space-y-1">
                          <div className="flex flex-wrap items-center gap-x-2">
                            <span>
                              {isUltrasound ? 'Estudo:' : 'Região:'} <strong className="text-white">{exam.region}</strong>
                            </span>
                            {exam.fastingHours && (
                              <span className="text-slate-400">
                                • Preparo: <strong className="text-slate-200">{exam.fastingHours}</strong>
                              </span>
                            )}
                          </div>

                          {exam.suspectedDiagnosis && (
                            <div className="text-[11px] text-slate-400">
                              Suspeita diagnóstica: <span className="text-slate-200 italic font-medium">{exam.suspectedDiagnosis}</span>
                            </div>
                          )}
                        </div>

                        {/* Metadados: Clínica Solicitante, Solicitante & Data */}
                        <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-slate-500" />
                            <strong className="text-slate-300">{exam.clinicName}</strong>
                          </span>
                          <span className="flex items-center gap-1">
                            <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                            <span>Dr(a). {exam.requestingVet}</span>
                          </span>
                          <span>
                            • Solicitado em: {new Date(exam.createdAt).toLocaleDateString('pt-BR')} às {new Date(exam.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bloco Direito: Ações do Card */}
                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-end gap-2.5 lg:border-l lg:border-slate-800 lg:pl-6 pt-3 lg:pt-0 border-t border-slate-800/80 lg:border-t-0">
                      {/* Botão Ver Imagens / PACS */}
                      <button
                        type="button"
                        onClick={() => setActiveViewingExam(exam)}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition active:scale-95 cursor-pointer w-full sm:w-auto"
                        title={isUltrasound ? 'Abrir visualizador ecográfico' : 'Abrir visualizador radiográfico'}
                      >
                        <Eye className="w-4 h-4 text-cyan-400" />
                        <span>{isUltrasound ? `Ver Cortes (${exam.images.length})` : `Ver Raio-X (${exam.images.length})`}</span>
                      </button>

                      {/* Ação de Laudo */}
                      {isReported ? (
                        <div className="flex items-center gap-1.5 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={() => setActiveDocumentExam(exam)}
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition active:scale-95 cursor-pointer flex-1 sm:flex-initial"
                          >
                            <Printer className="w-4 h-4" />
                            <span>Ver / Imprimir Laudo</span>
                          </button>

                          {/* Se for radiologista ou admin, permitir reabrir editor */}
                          {(currentUser.role === 'RADIOLOGIST' || currentUser.role === 'ADMIN') && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveReportingExam(exam);
                                setActiveViewingExam(exam);
                              }}
                              className="p-2.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded-xl transition text-xs border border-slate-700/60 cursor-pointer"
                              title="Retificar ou complementar laudo"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ) : (
                        /* Se for radiologista ou admin, botão para Iniciar Laudo */
                        (currentUser.role === 'RADIOLOGIST' || currentUser.role === 'ADMIN') && (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveReportingExam(exam);
                              setActiveViewingExam(exam);
                            }}
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-md shadow-cyan-600/25 transition active:scale-95 cursor-pointer w-full sm:w-auto"
                          >
                            <Stethoscope className="w-4 h-4" />
                            <span>{isInProgress ? 'Continuar Laudo' : 'Iniciar Laudo'}</span>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* MODAL 1: Novo Pedido de Exame (Raio-X ou USG) */}
      <NewExamModal
        isOpen={isNewExamModalOpen}
        onClose={() => setIsNewExamModalOpen(false)}
        onExamCreated={handleExamCreated}
        defaultClinicName={currentUser.clinicName}
        defaultVetName={currentUser.name}
        userRole={currentUser.role}
      />

      {/* MODAL 2: Visualizador Radiográfico / Ecográfico PACS */}
      {activeViewingExam && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col p-2 sm:p-4 overflow-hidden">
          {/* Top Bar do Modal */}
          <div className="bg-slate-900 border border-slate-800 rounded-t-2xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${activeViewingExam.modality === 'ULTRASSOM' ? 'bg-blue-400' : 'bg-cyan-400'} animate-pulse`} />
              <div>
                <span className="text-sm font-bold text-white">
                  {activeViewingExam.modality === 'ULTRASSOM' ? 'Visualizador Ecográfico (USG)' : 'Visualizador Telerradiológico (Raio-X)'} — {activeViewingExam.patientName} ({activeViewingExam.species})
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline ml-2">
                  Protocolo: {activeViewingExam.id} • {activeViewingExam.region}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Controles de Proporção de Tela quando o editor de laudo está aberto */}
              {activeReportingExam && (
                <div className="hidden md:flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-[11px]">
                  <span className="text-slate-400 px-2 font-medium flex items-center gap-1">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                    Editor:
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditorSplitRatio('50')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                      editorSplitRatio === '50'
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="50% Imagem / 50% Laudo (Equilibrado)"
                  >
                    50% / 50%
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorSplitRatio('60')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                      editorSplitRatio === '60'
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="60% Laudo / 40% Imagem (Ampliado - Mais espaço)"
                  >
                    60% Laudo
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorSplitRatio('75')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                      editorSplitRatio === '75'
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="75% Laudo / 25% Imagem (Editor Amplo)"
                  >
                    75% Laudo
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorSplitRatio('35')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                      editorSplitRatio === '35'
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="35% Laudo / 65% Imagem (Foco na Imagem)"
                  >
                    Foco Imagem
                  </button>
                </div>
              )}

              {/* Se for Radiologista, botão para alternar painel de edição do laudo */}
              {(currentUser.role === 'RADIOLOGIST' || currentUser.role === 'ADMIN') && (
                <button
                  onClick={() => {
                    setActiveReportingExam(activeReportingExam ? null : activeViewingExam);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    activeReportingExam
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>{activeReportingExam ? 'Ocultar Editor' : 'Abrir Editor de Laudo'}</span>
                </button>
              )}

              {activeViewingExam.report && (
                <button
                  onClick={() => setActiveDocumentExam(activeViewingExam)}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Ver Laudo Pronto</span>
                </button>
              )}

              <button
                onClick={() => {
                  setActiveViewingExam(null);
                  setActiveReportingExam(null);
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Área Central: Visualizador PACS + Editor de Laudo Lado a Lado se Ativo */}
          <div className="flex-1 bg-slate-950 border-x border-b border-slate-800 rounded-b-2xl overflow-hidden flex flex-col lg:flex-row">
            {/* Lado Esquerdo: Visualizador */}
            <div className={`h-full min-h-[400px] transition-all duration-200 ${
              !activeReportingExam 
                ? 'w-full flex-1' 
                : editorSplitRatio === '35'
                ? 'w-full lg:w-[65%]'
                : editorSplitRatio === '50'
                ? 'w-full lg:w-1/2'
                : editorSplitRatio === '60'
                ? 'w-full lg:w-[40%]'
                : 'w-full lg:w-[25%]'
            }`}>
              <DicomXrayViewer
                images={activeViewingExam.images}
                patientName={activeViewingExam.patientName}
                initialVhs={activeViewingExam.report?.vhsScore}
              />
            </div>

            {/* Lado Direito: Editor de Laudo Estruturado */}
            {activeReportingExam && (
              <div className={`w-full border-t lg:border-t-0 lg:border-l border-slate-800 overflow-y-auto max-h-[80vh] lg:max-h-full transition-all duration-200 bg-slate-900/60 ${
                editorSplitRatio === '35'
                  ? 'lg:w-[35%]'
                  : editorSplitRatio === '50'
                  ? 'lg:w-1/2'
                  : editorSplitRatio === '60'
                  ? 'lg:w-[60%]'
                  : 'lg:w-[75%]'
              }`}>
                <ReportEditor
                  exam={activeReportingExam}
                  currentRadiologistName={currentUser.name}
                  currentRadiologistCrmv={currentUser.crmv || 'CRMV-SP 38.412'}
                  onReportSaved={handleReportSaved}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: Visualização do Laudo Oficial Timbrado & Impressão PDF */}
      {activeDocumentExam && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-4xl my-auto">
            <ReportDocument
              exam={activeDocumentExam}
              onClose={() => setActiveDocumentExam(null)}
            />
          </div>
        </div>
      )}

      {/* MODAL 4: Carteira & Faturamento */}
      {currentUser && (
        <FinancialModal
          isOpen={isFinancialModalOpen}
          onClose={() => setIsFinancialModalOpen(false)}
          currentUser={currentUser}
          onBalanceUpdated={(newBalance) => {
            setCurrentUser(prev => prev ? { ...prev, balance: newBalance } : null);
          }}
        />
      )}
    </div>
  );
}
