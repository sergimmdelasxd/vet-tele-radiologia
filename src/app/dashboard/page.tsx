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
  DollarSign
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

  // Filtros e busca
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ExamStatus>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | ExamPriority>('ALL');
  const [modalityFilter, setModalityFilter] = useState<'ALL' | ExamModality>('ALL');

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

  // Exames filtrados
  const filteredExams = useMemo(() => {
    return exams.filter(e => {
      const matchSearch =
        e.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.clinicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.region.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || e.status === statusFilter;
      const matchPriority = priorityFilter === 'ALL' || e.priority === priorityFilter;
      const matchModality = modalityFilter === 'ALL' || e.modality === modalityFilter;

      return matchSearch && matchStatus && matchPriority && matchModality;
    });
  }, [exams, searchQuery, statusFilter, priorityFilter, modalityFilter]);

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
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold">Carregando portal de diagnóstico veterinário...</span>
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
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {currentUser.role === 'CLINIC' && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" /> Portal do Solicitante (Clínica Parceira)
                  </span>
                )}
                {currentUser.role === 'RADIOLOGIST' && (
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1">
                    <Stethoscope className="w-3.5 h-3.5" /> Fila de Laudos (Radiografia & Ultrassom)
                  </span>
                )}
                {currentUser.role === 'ADMIN' && (
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Central de Diagnóstico por Imagem
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Olá, {currentUser.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                {currentUser.role === 'CLINIC'
                  ? `Gerencie pedidos de Telerradiografia e Ultrassonografia da ${currentUser.clinicName || 'sua clínica'}. Envie exames e emita laudos timbrados.`
                  : 'Worklist veterinária integrada: laudos de Raio-X e Ultrassonografia (USG) com suporte a templates e medidas.'}
              </p>
            </div>

            {/* Ações Primárias */}
            <div className="flex flex-wrap items-center gap-3">
              {(currentUser.role === 'CLINIC' || currentUser.role === 'ADMIN') && (
                <button
                  type="button"
                  onClick={() => setIsFinancialModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-3 bg-slate-800/90 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 font-bold text-xs sm:text-sm rounded-xl shadow-md transition active:scale-95 cursor-pointer"
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
                    className="inline-flex items-center gap-2 px-4 py-3 bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 font-bold text-xs sm:text-sm rounded-xl shadow-md transition active:scale-95 cursor-pointer"
                    title="Abrir Agenda de Rotina e Horários de Exames"
                  >
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    <span>Agenda</span>
                  </Link>

                  <Link
                    href="/financeiro"
                    className="inline-flex items-center gap-2 px-4 py-3 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 font-bold text-xs sm:text-sm rounded-xl shadow-md transition active:scale-95 cursor-pointer"
                    title="Abrir Painel Financeiro e Volumetria de Clínicas"
                  >
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span>Painel Financeiro</span>
                  </Link>
                </>
              )}

              <button
                onClick={() => setIsNewExamModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-cyan-500/25 transition active:scale-95 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>
                  {currentUser.role === 'CLINIC'
                    ? 'Novo Pedido (Raio-X / USG)'
                    : 'Cadastrar Novo Exame (Entrada de Caso)'}
                </span>
              </button>

              <button
                onClick={loadData}
                className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition cursor-pointer"
                title="Atualizar dados"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cards de Métricas Rápidas */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-800/80 text-xs">
            <div className="bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800/60">
              <span className="text-slate-400 text-[11px] block uppercase tracking-wider">Total de Exames</span>
              <span className="text-2xl font-black text-white mt-1 block">{stats.total}</span>
            </div>

            <div className="bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800/60">
              <span className="text-cyan-400 text-[11px] block uppercase tracking-wider font-semibold flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" /> Raio-X
              </span>
              <span className="text-2xl font-black text-cyan-400 mt-1 block">{stats.xrays}</span>
            </div>

            <div className="bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800/60">
              <span className="text-blue-400 text-[11px] block uppercase tracking-wider font-semibold flex items-center gap-1">
                <Waves className="w-3.5 h-3.5" /> Ultrassom
              </span>
              <span className="text-2xl font-black text-blue-400 mt-1 block">{stats.ultrasounds}</span>
            </div>

            <div className="bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800/60">
              <span className="text-emerald-400 text-[11px] block uppercase tracking-wider font-semibold">
                Laudos Prontos
              </span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">{stats.reported}</span>
            </div>

            <div className="bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800/60 col-span-2 sm:col-span-1">
              <span className="text-rose-400 text-[11px] block uppercase tracking-wider font-semibold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-rose-500/20" /> Urgências 24h
              </span>
              <span className="text-2xl font-black text-rose-400 mt-1 block">{stats.urgent}</span>
            </div>
          </div>
        </div>

        {/* Barra de Filtros e Busca */}
        <div className="space-y-3">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-md">
            {/* Busca */}
            <div className="relative w-full lg:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar pet, raça, órgão, clínica ou ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500 placeholder-slate-500"
              />
            </div>

            {/* Filtro de Modalidade (Raio-X vs Ultrassom) */}
            <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setModalityFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  modalityFilter === 'ALL'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Todas Modalidades
              </button>

              <button
                onClick={() => setModalityFilter('RADIOGRAFIA')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
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
                className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                  modalityFilter === 'ULTRASSOM'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-blue-300'
                }`}
              >
                <Waves className="w-3.5 h-3.5" />
                <span>Ultrassom ({stats.ultrasounds})</span>
              </button>
            </div>

            {/* Abas de Filtro de Status */}
            <div className="flex items-center gap-1 overflow-x-auto text-xs pb-1 lg:pb-0">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 ${
                  statusFilter === 'ALL'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Todos ({exams.length})
              </button>

              <button
                onClick={() => setStatusFilter('PENDING')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 ${
                  statusFilter === 'PENDING'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Pendentes ({stats.pending})
              </button>

              <button
                onClick={() => setStatusFilter('IN_PROGRESS')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 ${
                  statusFilter === 'IN_PROGRESS'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Em Análise ({stats.inProgress})
              </button>

              <button
                onClick={() => setStatusFilter('REPORTED')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 ${
                  statusFilter === 'REPORTED'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Concluídos ({stats.reported})
              </button>

              {/* Toggle de Urgência */}
              <button
                onClick={() => setPriorityFilter(prev => prev === 'URGENT' ? 'ALL' : 'URGENT')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1 shrink-0 ${
                  priorityFilter === 'URGENT'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-rose-400 hover:bg-rose-950/30'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Urgentes</span>
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Exames */}
        <div className="space-y-3">
          {filteredExams.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3">
              <FileText className="w-10 h-10 text-slate-600 mx-auto" />
              <div className="font-semibold text-slate-300">Nenhum exame encontrado com os filtros atuais</div>
              <p className="text-xs text-slate-500">Tente ajustar o filtro de modalidade (Raio-X / Ultrassom) ou envie um novo pedido.</p>
              <button
                onClick={() => setIsNewExamModalOpen(true)}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Cadastrar Exame Agora</span>
              </button>
            </div>
          ) : (
            filteredExams.map(exam => {
              const isUrgent = exam.priority === 'URGENT';
              const isReported = exam.status === 'REPORTED';
              const isPending = exam.status === 'PENDING';
              const isInProgress = exam.status === 'IN_PROGRESS';
              const isUltrasound = exam.modality === 'ULTRASSOM';

              return (
                <div
                  key={exam.id}
                  className={`bg-slate-900 border rounded-2xl p-4 sm:p-5 transition hover:border-slate-700 shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                    isUrgent && !isReported
                      ? 'border-rose-800/80 bg-gradient-to-r from-rose-950/20 via-slate-900 to-slate-900'
                      : isUltrasound
                      ? 'border-slate-800/90 hover:border-blue-700/60'
                      : 'border-slate-800'
                  }`}
                >
                  {/* Informações do Paciente e Exame */}
                  <div className="flex items-start gap-3.5">
                    {/* Imagem Thumbnail */}
                    <div 
                      onClick={() => setActiveViewingExam(exam)}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-black border border-slate-800 overflow-hidden shrink-0 cursor-pointer relative group flex items-center justify-center"
                    >
                      {exam.images[0] ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={exam.images[0].url}
                            alt={exam.patientName}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                            <Eye className="w-5 h-5" />
                          </div>
                        </>
                      ) : (
                        <FileText className="w-6 h-6 text-slate-600" />
                      )}
                      <span className="absolute bottom-1 right-1 bg-slate-900/90 text-[9px] px-1 py-0.5 rounded text-cyan-300 font-mono">
                        {exam.images.length} {isUltrasound ? 'cortes' : 'imgs'}
                      </span>
                    </div>

                    {/* Detalhes */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-400">
                          {exam.id}
                        </span>

                        {/* Badge de Modalidade (Raio-X vs Ultrassom) */}
                        {isUltrasound ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                            <Waves className="w-3 h-3" /> ULTRASSOM (USG)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                            <Activity className="w-3 h-3" /> RAIO-X
                          </span>
                        )}

                        {isUrgent && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
                            <Flame className="w-3 h-3" /> Plantão 2h (Urgência)
                          </span>
                        )}

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
                      </div>

                      <div className="text-base font-bold text-white flex items-center gap-2">
                        <span>{exam.patientName}</span>
                        <span className="text-xs font-normal text-cyan-300">
                          ({exam.species} • {exam.breed} • {exam.age})
                        </span>
                      </div>

                      <div className="text-xs text-slate-300 font-medium">
                        {isUltrasound ? (
                          <>
                            Exame: <span className="text-blue-400 font-semibold">{exam.region}</span>
                            {exam.fastingHours && (
                              <span className="text-slate-400 ml-2">
                                • Preparo: <strong className="text-slate-300">{exam.fastingHours}</strong>
                              </span>
                            )}
                          </>
                        ) : (
                          <>
                            Região: <span className="text-cyan-400 font-semibold">{exam.region}</span>
                          </>
                        )}
                        {exam.suspectedDiagnosis && (
                          <span className="text-slate-400 ml-2">
                            • Suspeita: <strong className="text-slate-300">{exam.suspectedDiagnosis}</strong>
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-0.5 pt-0.5">
                        <span>Clínica: <strong>{exam.clinicName}</strong></span>
                        <span>• Solicitante: {exam.requestingVet}</span>
                        <span>• Enviado em: {new Date(exam.createdAt).toLocaleDateString('pt-BR')} às {new Date(exam.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Ações do Exame */}
                  <div className="flex flex-wrap items-center gap-2 lg:border-l lg:border-slate-800 lg:pl-4">
                    {/* Botão Ver Imagens / Cortes */}
                    <button
                      onClick={() => setActiveViewingExam(exam)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition cursor-pointer"
                      title={isUltrasound ? 'Abrir visualizador ecográfico' : 'Abrir visualizador radiográfico'}
                    >
                      <Eye className="w-4 h-4 text-cyan-400" />
                      <span>{isUltrasound ? `Ver Cortes USG (${exam.images.length})` : `Ver Raio-X (${exam.images.length})`}</span>
                    </button>

                    {/* Se já foi laudado: Botão Ver / Imprimir Laudo */}
                    {isReported ? (
                      <button
                        onClick={() => setActiveDocumentExam(exam)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Ver / Imprimir Laudo</span>
                      </button>
                    ) : (
                      /* Se for Radiologista ou Admin: Botão para Laudar */
                      (currentUser.role === 'RADIOLOGIST' || currentUser.role === 'ADMIN') && (
                        <button
                          onClick={() => {
                            setActiveReportingExam(exam);
                            setActiveViewingExam(exam);
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-md shadow-cyan-600/20 transition cursor-pointer"
                        >
                          <Stethoscope className="w-4 h-4" />
                          <span>{isInProgress ? 'Continuar Laudo' : 'Iniciar Laudo'}</span>
                        </button>
                      )
                    )}

                    {/* Se for radiologista e o exame já tiver laudo, permitir editar */}
                    {isReported && (currentUser.role === 'RADIOLOGIST' || currentUser.role === 'ADMIN') && (
                      <button
                        onClick={() => {
                          setActiveReportingExam(exam);
                          setActiveViewingExam(exam);
                        }}
                        className="p-2 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded-xl transition text-xs cursor-pointer"
                        title="Reabrir editor para retificar laudo"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
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
