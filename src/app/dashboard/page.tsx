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

  // Menu de Abas da Worklist: Laudos Pendentes vs Laudos Realizados vs Todos
  const [worklistTab, setWorklistTab] = useState<'PENDING' | 'REPORTED' | 'ALL'>('PENDING');

  // Sistema de Pesquisa Detalhado & Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | ExamPriority>('ALL');
  const [modalityFilter, setModalityFilter] = useState<'ALL' | ExamModality>('ALL');
  const [speciesFilter, setSpeciesFilter] = useState<string>('ALL');
  const [clinicFilter, setClinicFilter] = useState<string>('ALL');
  const [periodFilter, setPeriodFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');
  const [sortBy, setSortBy] = useState<'RECENT' | 'URGENT' | 'OLDEST' | 'PATIENT'>('RECENT');
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);

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

  // Lista dinâmica de clínicas parceiras para o dropdown
  const clinicsList = useMemo(() => {
    const set = new Set<string>();
    exams.forEach(e => {
      if (e.clinicName) set.add(e.clinicName);
    });
    return Array.from(set).sort();
  }, [exams]);

  // Lista dinâmica de espécies para o dropdown
  const speciesList = useMemo(() => {
    const set = new Set<string>();
    exams.forEach(e => {
      if (e.species) set.add(e.species);
    });
    return Array.from(set).sort();
  }, [exams]);

  // Limpar todos os filtros detalhados
  const handleResetFilters = () => {
    setSearchQuery('');
    setPriorityFilter('ALL');
    setModalityFilter('ALL');
    setSpeciesFilter('ALL');
    setClinicFilter('ALL');
    setPeriodFilter('ALL');
    setSortBy('RECENT');
  };

  const activeFiltersCount = [
    searchQuery !== '',
    priorityFilter !== 'ALL',
    modalityFilter !== 'ALL',
    speciesFilter !== 'ALL',
    clinicFilter !== 'ALL',
    periodFilter !== 'ALL',
    sortBy !== 'RECENT'
  ].filter(Boolean).length;

  // Exames filtrados e ordenados
  const filteredAndSortedExams = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfWeek = startOfToday - 7 * 24 * 60 * 60 * 1000;
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const result = exams.filter(e => {
      // 1. Filtro da Aba Principal (Pendentes vs Realizados vs Todos)
      if (worklistTab === 'PENDING') {
        if (e.status === 'REPORTED') return false;
      } else if (worklistTab === 'REPORTED') {
        if (e.status !== 'REPORTED') return false;
      }

      // 2. Busca Textual Geral
      const query = searchQuery.toLowerCase().trim();
      if (query) {
        const matchSearch =
          e.patientName.toLowerCase().includes(query) ||
          e.breed.toLowerCase().includes(query) ||
          e.id.toLowerCase().includes(query) ||
          e.clinicName.toLowerCase().includes(query) ||
          (e.requestingVet && e.requestingVet.toLowerCase().includes(query)) ||
          (e.ownerName && e.ownerName.toLowerCase().includes(query)) ||
          e.region.toLowerCase().includes(query) ||
          (e.species && e.species.toLowerCase().includes(query)) ||
          (e.suspectedDiagnosis && e.suspectedDiagnosis.toLowerCase().includes(query));

        if (!matchSearch) return false;
      }

      // 3. Filtro de Modalidade
      if (modalityFilter !== 'ALL' && e.modality !== modalityFilter) return false;

      // 4. Filtro de Prioridade
      if (priorityFilter !== 'ALL' && e.priority !== priorityFilter) return false;

      // 5. Filtro de Espécie
      if (speciesFilter !== 'ALL' && e.species !== speciesFilter) return false;

      // 6. Filtro de Clínica
      if (clinicFilter !== 'ALL' && e.clinicName !== clinicFilter) return false;

      // 7. Filtro de Período
      if (periodFilter !== 'ALL') {
        const examTime = new Date(e.createdAt).getTime();
        if (periodFilter === 'TODAY' && examTime < startOfToday) return false;
        if (periodFilter === 'WEEK' && examTime < startOfWeek) return false;
        if (periodFilter === 'MONTH' && examTime < startOfMonth) return false;
      }

      return true;
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
  }, [exams, worklistTab, searchQuery, priorityFilter, modalityFilter, speciesFilter, clinicFilter, periodFilter, sortBy]);

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
    <div className="min-h-screen bg-[#fafbfc] text-slate-800 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      <Navbar
        user={currentUser}
        onNewExamClick={() => setIsNewExamModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        {/* Banner de Boas-vindas & CTA */}
        <div className="bg-white/95 border border-slate-200/90 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xs backdrop-blur-md">
          {/* Brilhos difusos pastéis de fundo */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2.5">
                {currentUser.role === 'CLINIC' && (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" /> Portal do Solicitante (Clínica Parceira)
                  </span>
                )}
                {currentUser.role === 'RADIOLOGIST' && (
                  <span className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                    <Stethoscope className="w-3.5 h-3.5 text-teal-600" /> Fila de Laudos (Radiografia &amp; Ultrassom)
                  </span>
                )}
                {currentUser.role === 'ADMIN' && (
                  <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" /> Central de Diagnóstico por Imagem
                  </span>
                )}

                <span className="text-[11px] text-slate-500 hidden sm:inline-flex items-center gap-1 font-medium">
                  • {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Olá, {currentUser.name.split(' ')[0]}
                <span className="text-teal-600 font-normal">👋</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-2xl leading-relaxed">
                {currentUser.role === 'CLINIC'
                  ? `Acompanhe seus pedidos de Telerradiografia e Ultrassonografia da ${currentUser.clinicName || 'sua clínica'}. Envie exames 24h e emita laudos timbrados assinados digitalmente.`
                  : 'Worklist veterinária integrada: laudos de Raio-X e Ultrassonografia com visualizador PACS web, modelos pré-configurados e editor de laudo rico.'}
              </p>
            </div>

            {/* Ações Primárias */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              {(currentUser.role === 'CLINIC' || currentUser.role === 'ADMIN') && (
                <button
                  type="button"
                  onClick={() => setIsFinancialModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 sm:py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold text-xs sm:text-sm rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer"
                  title="Abrir Carteira, Extrato e Recarga de Saldo"
                >
                  <Wallet className="w-4 h-4 text-emerald-600" />
                  <span>
                    Saldo: <strong className="font-mono text-emerald-950">R$ {(currentUser.balance ?? 0).toFixed(2).replace('.', ',')}</strong>
                  </span>
                </button>
              )}

              {(currentUser.role === 'RADIOLOGIST' || currentUser.role === 'ADMIN') && (
                <>
                  <Link
                    href="/agenda"
                    className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-900 font-bold text-xs sm:text-sm rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer"
                    title="Abrir Agenda de Rotina e Horários de Exames"
                  >
                    <Calendar className="w-4 h-4 text-sky-600" />
                    <span>Agenda</span>
                  </Link>

                  <Link
                    href="/financeiro"
                    className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-900 font-bold text-xs sm:text-sm rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer"
                    title="Abrir Painel Financeiro e Volumetria de Clínicas"
                  >
                    <DollarSign className="w-4 h-4 text-teal-600" />
                    <span>Financeiro</span>
                  </Link>
                </>
              )}

              <button
                onClick={() => setIsNewExamModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-teal-500/20 transition-all active:scale-95 cursor-pointer"
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
                className="p-2.5 sm:p-3 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-xl border border-slate-200 transition-all cursor-pointer shadow-2xs"
                title="Atualizar dados agora"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cards de Métricas Rápidas Interativos */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-200/80 text-xs">
            {/* 1. Total */}
            <button
              type="button"
              onClick={() => {
                setWorklistTab('ALL');
                handleResetFilters();
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer group ${
                worklistTab === 'ALL' && activeFiltersCount === 0
                  ? 'bg-slate-100 border-slate-300 shadow-2xs'
                  : 'bg-slate-50/70 border-slate-200/80 hover:border-slate-300 hover:bg-white'
              }`}
              title="Clique para ver todos os exames"
            >
              <div className="flex items-center justify-between text-slate-600 text-[11px] uppercase tracking-wider font-bold">
                <span>Total Geral</span>
                <Layers className="w-3.5 h-3.5 text-slate-500 group-hover:text-teal-600 transition-colors" />
              </div>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-2xl font-black text-slate-900">{stats.total}</span>
                <span className="text-[10px] text-slate-500 font-medium">casos</span>
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
                  ? 'bg-sky-50 border-sky-400 shadow-2xs'
                  : 'bg-sky-50/40 border-sky-200/70 hover:border-sky-300 hover:bg-sky-50'
              }`}
              title="Clique para filtrar apenas Raio-X"
            >
              <div className="flex items-center justify-between text-sky-900 text-[11px] uppercase tracking-wider font-bold">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-sky-600" /> Raio-X
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-mono font-bold">
                  {stats.total > 0 ? Math.round((stats.xrays / stats.total) * 100) : 0}%
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-2xl font-black text-sky-950">{stats.xrays}</span>
                <span className="text-[10px] text-sky-700/80 font-medium">laudos RX</span>
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
                  ? 'bg-teal-50 border-teal-400 shadow-2xs'
                  : 'bg-teal-50/40 border-teal-200/70 hover:border-teal-300 hover:bg-teal-50'
              }`}
              title="Clique para filtrar apenas Ultrassom"
            >
              <div className="flex items-center justify-between text-teal-900 text-[11px] uppercase tracking-wider font-bold">
                <span className="flex items-center gap-1.5">
                  <Waves className="w-3.5 h-3.5 text-teal-600" /> Ultrassom
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-800 font-mono font-bold">
                  {stats.total > 0 ? Math.round((stats.ultrasounds / stats.total) * 100) : 0}%
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-2xl font-black text-teal-950">{stats.ultrasounds}</span>
                <span className="text-[10px] text-teal-700/80 font-medium">cortes USG</span>
              </div>
            </button>

            {/* 4. Laudos Concluídos */}
            <button
              type="button"
              onClick={() => {
                setWorklistTab('REPORTED');
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer group ${
                worklistTab === 'REPORTED'
                  ? 'bg-emerald-50 border-emerald-400 shadow-2xs'
                  : 'bg-emerald-50/40 border-emerald-200/70 hover:border-emerald-300 hover:bg-emerald-50'
              }`}
              title="Clique para ver laudos prontos"
            >
              <div className="flex items-center justify-between text-emerald-900 text-[11px] uppercase tracking-wider font-bold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Prontos
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold">
                  {stats.total > 0 ? Math.round((stats.reported / stats.total) * 100) : 0}%
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-2xl font-black text-emerald-950">{stats.reported}</span>
                <span className="text-[10px] text-emerald-700/80 font-medium">emitidos</span>
              </div>
            </button>

            {/* 5. Urgências 24h */}
            <button
              type="button"
              onClick={() => {
                setWorklistTab('PENDING');
                setPriorityFilter(prev => prev === 'URGENT' ? 'ALL' : 'URGENT');
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer col-span-2 sm:col-span-1 group ${
                priorityFilter === 'URGENT'
                  ? 'bg-rose-50 border-rose-400 shadow-2xs'
                  : 'bg-rose-50/40 border-rose-200/70 hover:border-rose-300 hover:bg-rose-50'
              }`}
              title="Clique para filtrar urgências 24h"
            >
              <div className="flex items-center justify-between text-rose-900 text-[11px] uppercase tracking-wider font-bold">
                <span className="flex items-center gap-1.5">
                  <Flame className={`w-3.5 h-3.5 text-rose-600 ${stats.urgent > 0 ? 'animate-pulse' : ''}`} /> Urgências
                </span>
                {stats.urgent > 0 && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-extrabold animate-pulse">
                    Plantão
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-2xl font-black text-rose-950">{stats.urgent}</span>
                <span className="text-[10px] text-rose-700/80 font-medium">críticos</span>
              </div>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* NOVO MENU DE ABAS: LAUDOS PENDENTES VS LAUDOS REALIZADOS / FEITOS          */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-2xs">
          {/* Abas Principais da Worklist */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl overflow-x-auto">
            {/* 1. Laudos Pendentes */}
            <button
              type="button"
              onClick={() => setWorklistTab('PENDING')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer shrink-0 ${
                worklistTab === 'PENDING'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/90'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Laudos Pendentes</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-900 border border-amber-200/90">
                {stats.pending + stats.inProgress}
              </span>
              {stats.urgent > 0 && (
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
                  <Flame className="w-3 h-3 text-rose-600" />
                  <span>{stats.urgent} Urgente{stats.urgent > 1 ? 's' : ''}</span>
                </span>
              )}
            </button>

            {/* 2. Laudos Realizados / Concluídos */}
            <button
              type="button"
              onClick={() => setWorklistTab('REPORTED')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer shrink-0 ${
                worklistTab === 'REPORTED'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/90'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>Laudos Realizados</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-teal-100 text-teal-900 border border-teal-200/90">
                {stats.reported}
              </span>
            </button>

            {/* 3. Todos os Exames */}
            <button
              type="button"
              onClick={() => setWorklistTab('ALL')}
              className={`px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                worklistTab === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/90'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
              }`}
            >
              <Layers className="w-4 h-4 text-slate-500" />
              <span>Todos ({stats.total})</span>
            </button>
          </div>

          {/* Alternador de Visão: Cards Detalhados vs Tabela PACS */}
          <div className="flex items-center gap-1 self-end sm:self-auto bg-slate-100/90 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('CARDS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'CARDS'
                  ? 'bg-white text-teal-800 shadow-2xs border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Visualizar em Cards"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('TABLE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'TABLE'
                  ? 'bg-white text-teal-800 shadow-2xs border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Visualizar em Tabela PACS"
            >
              <List className="w-3.5 h-3.5" />
              <span>Tabela PACS</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SISTEMA DE PESQUISA DETALHADO & FILTROS AVANÇADOS                          */}
        {/* ========================================================================= */}
        <div className="space-y-3">
          <div className="bg-white border border-slate-200/90 p-4 rounded-2xl shadow-xs space-y-3 text-slate-800">
            {/* Linha Superior: Barra de Busca Principal + Botão Filtros Detalhados + Ordenação */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              {/* Campo de Busca Rápida com Limpeza */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Pesquisar por paciente, raça, espécie, tutor, protocolo (VET-XXXX), clínica solicitante ou suspeita..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-9 py-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-teal-500 transition-colors placeholder-slate-400 shadow-2xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                    title="Limpar busca"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Controles da Direita */}
              <div className="flex flex-wrap items-center gap-2.5 self-end lg:self-auto">
                {/* Botão de Filtros Detalhados Expansível */}
                <button
                  type="button"
                  onClick={() => setIsAdvancedFiltersOpen(prev => !prev)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer shadow-2xs ${
                    isAdvancedFiltersOpen || activeFiltersCount > 0
                      ? 'bg-teal-50 border-teal-300 text-teal-900'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-teal-600" />
                  <span>Filtros Detalhados</span>
                  {activeFiltersCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-[10px] font-black flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                {/* Seletor de Ordenação */}
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs shadow-2xs">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="text-slate-500 hidden sm:inline text-[11px] font-medium">Ordem:</span>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as any)}
                    aria-label="Ordenação de exames"
                    className="bg-transparent text-slate-800 text-xs font-bold outline-none cursor-pointer py-0.5"
                  >
                    <option value="RECENT">Mais Recentes</option>
                    <option value="URGENT">Urgências Primeiro</option>
                    <option value="OLDEST">Mais Antigos na Fila</option>
                    <option value="PATIENT">Nome do Paciente (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* PAINEL EXPANSÍVEL DE FILTROS DETALHADOS */}
            {isAdvancedFiltersOpen && (
              <div className="pt-3 border-t border-slate-200 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                  {/* 1. Modalidade Médica */}
                  <div>
                    <label className="block text-slate-600 font-bold mb-1 text-[11px] uppercase tracking-wider">
                      Modalidade
                    </label>
                    <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setModalityFilter('ALL')}
                        className={`flex-1 py-1.5 rounded-lg font-bold transition text-xs cursor-pointer ${
                          modalityFilter === 'ALL'
                            ? 'bg-white text-slate-900 shadow-2xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Todas
                      </button>
                      <button
                        type="button"
                        onClick={() => setModalityFilter('RADIOGRAFIA')}
                        className={`flex-1 py-1.5 rounded-lg font-bold transition text-xs flex items-center justify-center gap-1 cursor-pointer ${
                          modalityFilter === 'RADIOGRAFIA'
                            ? 'bg-sky-100 text-sky-900 shadow-2xs'
                            : 'text-slate-500 hover:text-sky-800'
                        }`}
                      >
                        <Activity className="w-3 h-3 text-sky-600" />
                        <span>RX</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setModalityFilter('ULTRASSOM')}
                        className={`flex-1 py-1.5 rounded-lg font-bold transition text-xs flex items-center justify-center gap-1 cursor-pointer ${
                          modalityFilter === 'ULTRASSOM'
                            ? 'bg-teal-100 text-teal-900 shadow-2xs'
                            : 'text-slate-500 hover:text-teal-800'
                        }`}
                      >
                        <Waves className="w-3 h-3 text-teal-600" />
                        <span>USG</span>
                      </button>
                    </div>
                  </div>

                  {/* 2. Prioridade / SLA */}
                  <div>
                    <label className="block text-slate-600 font-bold mb-1 text-[11px] uppercase tracking-wider">
                      Prioridade
                    </label>
                    <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setPriorityFilter('ALL')}
                        className={`flex-1 py-1.5 rounded-lg font-bold transition text-xs cursor-pointer ${
                          priorityFilter === 'ALL'
                            ? 'bg-white text-slate-900 shadow-2xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Todas
                      </button>
                      <button
                        type="button"
                        onClick={() => setPriorityFilter('NORMAL')}
                        className={`flex-1 py-1.5 rounded-lg font-bold transition text-xs cursor-pointer ${
                          priorityFilter === 'NORMAL'
                            ? 'bg-teal-100 text-teal-900 shadow-2xs'
                            : 'text-slate-500 hover:text-teal-800'
                        }`}
                      >
                        Rotina
                      </button>
                      <button
                        type="button"
                        onClick={() => setPriorityFilter('URGENT')}
                        className={`flex-1 py-1.5 rounded-lg font-bold transition text-xs flex items-center justify-center gap-1 cursor-pointer ${
                          priorityFilter === 'URGENT'
                            ? 'bg-rose-100 text-rose-900 shadow-2xs'
                            : 'text-slate-500 hover:text-rose-800'
                        }`}
                      >
                        <Flame className="w-3 h-3 text-rose-600" />
                        <span>Urgente</span>
                      </button>
                    </div>
                  </div>

                  {/* 3. Espécie Animal */}
                  <div>
                    <label className="block text-slate-600 font-bold mb-1 text-[11px] uppercase tracking-wider">
                      Espécie Animal
                    </label>
                    <select
                      value={speciesFilter}
                      onChange={e => setSpeciesFilter(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium outline-none focus:bg-white focus:border-teal-500 transition shadow-2xs cursor-pointer"
                    >
                      <option value="ALL">🐾 Todas as Espécies</option>
                      {speciesList.map(sp => (
                        <option key={sp} value={sp}>
                          {sp}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 4. Clínica Solicitante */}
                  <div>
                    <label className="block text-slate-600 font-bold mb-1 text-[11px] uppercase tracking-wider">
                      Clínica Parceira
                    </label>
                    <select
                      value={clinicFilter}
                      onChange={e => setClinicFilter(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium outline-none focus:bg-white focus:border-teal-500 transition shadow-2xs cursor-pointer truncate"
                    >
                      <option value="ALL">🏥 Todas as Clínicas</option>
                      {clinicsList.map(c => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 5. Período da Solicitação */}
                  <div>
                    <label className="block text-slate-600 font-bold mb-1 text-[11px] uppercase tracking-wider">
                      Período
                    </label>
                    <select
                      value={periodFilter}
                      onChange={e => setPeriodFilter(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium outline-none focus:bg-white focus:border-teal-500 transition shadow-2xs cursor-pointer"
                    >
                      <option value="ALL">📅 Qualquer Período</option>
                      <option value="TODAY">Hoje</option>
                      <option value="WEEK">Últimos 7 dias</option>
                      <option value="MONTH">Este Mês</option>
                    </select>
                  </div>
                </div>

                {/* Rodapé dos Filtros com Botão Limpar */}
                {activeFiltersCount > 0 && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-[11px] text-slate-500 font-medium">
                      {activeFiltersCount} critério(s) de filtragem aplicado(s)
                    </span>
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3 text-slate-500" />
                      <span>Limpar Todos os Filtros</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Barra de Status dos Resultados */}
          <div className="flex items-center justify-between px-2 text-xs text-slate-500">
            <div className="flex items-center gap-2 flex-wrap">
              <span>
                Exibindo <strong className="text-slate-900 font-bold">{filteredAndSortedExams.length}</strong> de <strong className="text-slate-700 font-semibold">{exams.length}</strong> exames
                {worklistTab === 'PENDING' && ' na Fila de Pendentes'}
                {worklistTab === 'REPORTED' && ' nos Laudos Realizados'}
              </span>
              {searchQuery && (
                <span className="text-teal-700 font-medium bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                  contendo &quot;{searchQuery}&quot;
                </span>
              )}
            </div>

            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-[11px] text-teal-700 hover:text-teal-900 hover:underline cursor-pointer font-bold transition"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Resetar filtros</span>
              </button>
            )}
          </div>
        </div>

        {/* LISTAGEM PRINCIPAL: MODO CARDS OU MODO TABELA */}
        {filteredAndSortedExams.length === 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center text-slate-500 space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
              <FileText className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base font-bold text-slate-900">Nenhum exame encontrado</h3>
              <p className="text-xs text-slate-500">
                Não localizamos exames correspondentes aos critérios selecionados na aba{' '}
                <strong className="text-slate-800">
                  {worklistTab === 'PENDING' ? 'Laudos Pendentes' : worklistTab === 'REPORTED' ? 'Laudos Realizados' : 'Todos os Exames'}
                </strong>. Tente ajustar os termos de busca ou filtros de modalidade e espécie.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Limpar Filtros</span>
                </button>
              )}
              <button
                onClick={() => setIsNewExamModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-500/20 transition cursor-pointer"
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
          <div className="bg-white border border-slate-200/90 rounded-3xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-600 font-bold">
                    <th className="py-3.5 px-4">Status &amp; Prioridade</th>
                    <th className="py-3.5 px-4">Protocolo</th>
                    <th className="py-3.5 px-4">Paciente</th>
                    <th className="py-3.5 px-4">Região / Estudo</th>
                    <th className="py-3.5 px-4">Clínica &amp; Solicitante</th>
                    <th className="py-3.5 px-4">Data &amp; Fila</th>
                    <th className="py-3.5 px-4 text-right">Ações Rápidas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAndSortedExams.map(exam => {
                    const isUrgent = exam.priority === 'URGENT';
                    const isReported = exam.status === 'REPORTED';
                    const isPending = exam.status === 'PENDING';
                    const isInProgress = exam.status === 'IN_PROGRESS';
                    const isUltrasound = exam.modality === 'ULTRASSOM';

                    return (
                      <tr 
                        key={exam.id}
                        className={`hover:bg-slate-50/70 transition-colors ${
                          isUrgent && !isReported ? 'bg-rose-50/30' : ''
                        }`}
                      >
                        {/* Status & Prioridade */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            {isReported && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 w-fit">
                                <CheckCircle2 className="w-3 h-3 text-teal-600" /> Concluído
                              </span>
                            )}
                            {isPending && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200 w-fit">
                                <Clock className="w-3 h-3 text-amber-600" /> Na Fila
                              </span>
                            )}
                            {isInProgress && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-900 border border-blue-200 w-fit">
                                <Stethoscope className="w-3 h-3 text-blue-600" /> Em Análise
                              </span>
                            )}

                            {isUrgent && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-50 text-rose-800 border border-rose-200 animate-pulse w-fit">
                                <Flame className="w-2.5 h-2.5 text-rose-600" /> Urgência 2h
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Protocolo & Modalidade */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900 text-xs">
                            <span>{exam.id}</span>
                            <button
                              type="button"
                              onClick={(e) => handleCopyId(e, exam.id)}
                              className="text-slate-400 hover:text-teal-600 transition cursor-pointer"
                              title="Copiar ID"
                            >
                              {copiedId === exam.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                          <div className="mt-1">
                            {isUltrasound ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                                <Waves className="w-2.5 h-2.5 text-teal-600" /> ULTRASSOM
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                                <Activity className="w-2.5 h-2.5 text-sky-600" /> RAIO-X
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Paciente */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 text-sm">
                            {exam.patientName}
                          </div>
                          <div className="text-[11px] text-slate-600 mt-0.5">
                            <span className="text-teal-700 font-bold">{exam.species}</span> • {exam.breed} • {exam.age}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Tutor: {exam.ownerName}
                          </div>
                        </td>

                        {/* Estudo / Região */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800">
                            {exam.region}
                          </div>
                          {exam.fastingHours && (
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              Preparo: <strong className="text-slate-700">{exam.fastingHours}</strong>
                            </div>
                          )}
                          {exam.suspectedDiagnosis && (
                            <div className="text-[10px] text-slate-500 truncate max-w-xs" title={exam.suspectedDiagnosis}>
                              Suspeita: {exam.suspectedDiagnosis}
                            </div>
                          )}
                        </td>

                        {/* Clínica Solicitante */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[150px]">{exam.clinicName}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {exam.requestingVet}
                          </div>
                        </td>

                        {/* Data & Fila */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-medium text-slate-800">
                            {new Date(exam.createdAt).toLocaleDateString('pt-BR')} às {new Date(exam.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                            <Timer className="w-3 h-3 text-teal-600" />
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
                              className="p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition cursor-pointer"
                              title="Visualizar imagens/cortes no PACS"
                            >
                              <Eye className="w-3.5 h-3.5 text-teal-600" />
                              <span className="hidden xl:inline ml-1">PACS ({exam.images.length})</span>
                            </button>

                            {/* Laudar ou Ver Laudo */}
                            {isReported ? (
                              <button
                                type="button"
                                onClick={() => setActiveDocumentExam(exam)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-2xs transition cursor-pointer"
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
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white text-xs font-bold rounded-lg shadow-2xs transition cursor-pointer"
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
          /* MODO CARDS DETALHADOS (DESIGN PASTEL ELEGANTE & ESPAÇOSO)                 */
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
                  className={`bg-white border rounded-3xl p-5 sm:p-6 transition-all duration-200 shadow-xs hover:shadow-md relative group text-slate-800 ${
                    isUrgent && !isReported
                      ? 'border-rose-300 bg-rose-50/20 hover:border-rose-400'
                      : 'border-slate-200/90 hover:border-teal-300'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    {/* Bloco Esquerdo: Thumbnail + Detalhes do Caso */}
                    <div className="flex items-start gap-4">
                      {/* Thumbnail com Zoom Overlay */}
                      <div 
                        onClick={() => setActiveViewingExam(exam)}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-black border border-slate-200 overflow-hidden shrink-0 cursor-pointer relative group/thumb flex items-center justify-center shadow-2xs"
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
                            <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover/thumb:opacity-100 transition flex items-center justify-center text-white">
                              <Eye className="w-6 h-6 text-teal-300" />
                            </div>
                          </>
                        ) : (
                          <FileText className="w-8 h-8 text-slate-400" />
                        )}

                        <span className="absolute bottom-1.5 right-1.5 bg-slate-900/80 border border-slate-700 text-[9px] px-1.5 py-0.5 rounded-md text-white font-mono shadow-sm">
                          {exam.images.length} {isUltrasound ? 'cortes' : 'imgs'}
                        </span>
                      </div>

                      {/* Informações Centrais do Exame */}
                      <div className="space-y-1.5 flex-1">
                        {/* Linha de Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Protocolo Copiável */}
                          <div className="inline-flex items-center gap-1 font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                            <span>{exam.id}</span>
                            <button
                              type="button"
                              onClick={(e) => handleCopyId(e, exam.id)}
                              className="text-slate-400 hover:text-teal-600 transition cursor-pointer"
                              title="Copiar ID do exame"
                            >
                              {copiedId === exam.id ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>

                          {/* Modalidade */}
                          {isUltrasound ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                              <Waves className="w-3 h-3 text-teal-600" /> ULTRASSOM (USG)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                              <Activity className="w-3 h-3 text-sky-600" /> RAIO-X
                            </span>
                          )}

                          {/* Status */}
                          {isReported && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Laudo Concluído
                            </span>
                          )}

                          {isPending && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" /> Na Fila para Laudo
                            </span>
                          )}

                          {isInProgress && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-900 border border-blue-200">
                              <Stethoscope className="w-3 h-3 text-blue-600" /> Em Elaboração
                            </span>
                          )}

                          {/* Prioridade Urgente */}
                          {isUrgent && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-800 border border-rose-200 animate-pulse">
                              <Flame className="w-3 h-3 text-rose-600" /> Urgência 2h
                            </span>
                          )}

                          {/* Tempo Decorrido */}
                          <span className="text-[11px] text-slate-500 flex items-center gap-1 ml-auto lg:ml-0 font-medium">
                            <Timer className="w-3 h-3 text-teal-600" />
                            {formatRelativeTime(exam.createdAt)}
                          </span>
                        </div>

                        {/* Nome do Paciente & Detalhes */}
                        <div className="flex flex-wrap items-center gap-2 pt-0.5">
                          <h2 className="text-lg font-black text-slate-900 tracking-tight">
                            {exam.patientName}
                          </h2>
                          <span className="px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold">
                            {exam.species}
                          </span>
                          <span className="text-xs text-slate-600 font-medium">
                            {exam.breed} • {exam.age} {exam.weight && `• ${exam.weight}`} {exam.gender && `• ${exam.gender}`}
                          </span>
                        </div>

                        {/* Região, Preparo & Suspeita Diagnóstica */}
                        <div className="text-xs text-slate-700 font-medium space-y-1">
                          <div className="flex flex-wrap items-center gap-x-2">
                            <span>
                              {isUltrasound ? 'Estudo:' : 'Região:'} <strong className="text-slate-900 font-bold">{exam.region}</strong>
                            </span>
                            {exam.fastingHours && (
                              <span className="text-slate-500 font-normal">
                                • Preparo: <strong className="text-slate-700">{exam.fastingHours}</strong>
                              </span>
                            )}
                          </div>

                          {exam.suspectedDiagnosis && (
                            <div className="text-[11px] text-slate-500">
                              Suspeita diagnóstica: <span className="text-slate-700 italic font-medium">{exam.suspectedDiagnosis}</span>
                            </div>
                          )}
                        </div>

                        {/* Metadados: Clínica Solicitante, Solicitante & Data */}
                        <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <strong className="text-slate-700">{exam.clinicName}</strong>
                          </span>
                          <span className="flex items-center gap-1">
                            <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                            <span>Dr(a). {exam.requestingVet}</span>
                          </span>
                          <span>
                            • Solicitado em: {new Date(exam.createdAt).toLocaleDateString('pt-BR')} às {new Date(exam.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bloco Direito: Ações do Card */}
                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-end gap-2.5 lg:border-l lg:border-slate-200 lg:pl-6 pt-3 lg:pt-0 border-t border-slate-100 lg:border-t-0">
                      {/* Botão Ver Imagens / PACS */}
                      <button
                        type="button"
                        onClick={() => setActiveViewingExam(exam)}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition active:scale-95 cursor-pointer w-full sm:w-auto shadow-2xs"
                        title={isUltrasound ? 'Abrir visualizador ecográfico' : 'Abrir visualizador radiográfico'}
                      >
                        <Eye className="w-4 h-4 text-teal-600" />
                        <span>{isUltrasound ? `Ver Cortes (${exam.images.length})` : `Ver Raio-X (${exam.images.length})`}</span>
                      </button>

                      {/* Ação de Laudo */}
                      {isReported ? (
                        <div className="flex items-center gap-1.5 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={() => setActiveDocumentExam(exam)}
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-600/20 transition active:scale-95 cursor-pointer flex-1 sm:flex-initial"
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
                              className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition text-xs border border-slate-200 cursor-pointer shadow-2xs"
                              title="Retificar ou complementar laudo"
                            >
                              <FileText className="w-4 h-4 text-teal-600" />
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
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-500/20 transition active:scale-95 cursor-pointer w-full sm:w-auto"
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
