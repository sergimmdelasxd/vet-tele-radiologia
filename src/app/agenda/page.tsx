'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  Activity, 
  Waves, 
  MessageSquare, 
  FileText, 
  User, 
  Building2, 
  Stethoscope, 
  Sparkles, 
  Trash2, 
  Filter, 
  ArrowRight,
  ExternalLink,
  Phone
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { NewAppointmentModal } from '@/components/agenda/NewAppointmentModal';
import { Appointment, AppointmentStatus, ExamModality, User as UserType } from '@/types';

export default function AgendaPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtros de Data
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // Default to current local date
    return '2026-09-02';
  });

  // Filtros gerais
  const [modalityFilter, setModalityFilter] = useState<'ALL' | ExamModality>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | AppointmentStatus>('ALL');
  const [viewMode, setViewMode] = useState<'TIMELINE' | 'LIST'>('TIMELINE');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal de Agendamento
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Carregar usuário e dados
  const loadData = async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (!meData.user) {
        router.push('/login');
        return;
      }
      setCurrentUser(meData.user);

      const appRes = await fetch(`/api/appointments?date=${selectedDate}`);
      const appData = await appRes.json();
      if (appData.appointments) {
        setAppointments(appData.appointments);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  // Navegação de Dias
  const handlePrevDay = () => {
    const d = new Date(`${selectedDate}T12:00:00Z`);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(`${selectedDate}T12:00:00Z`);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate('2026-09-02');
  };

  // Alterar Status
  const handleUpdateStatus = async (id: string, newStatus: AppointmentStatus) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setAppointments(prev =>
          prev.map(a => (a.id === id ? { ...a, status: newStatus } : a))
        );
      }
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    }
  };

  // Excluir Agendamento
  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente cancelar este agendamento?')) return;
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setAppointments(prev => prev.filter(a => a.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Converter para Exame na Worklist
  const handleConvertToExam = async (id: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'convert-to-exam' })
      });
      const data = await res.json();
      if (res.ok && data.exam) {
        // Redireciona para o dashboard com mensagem
        router.push(`/dashboard?examCreated=${data.exam.id}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Enviar Lembrete via WhatsApp
  const handleSendReminderWhatsApp = (app: Appointment) => {
    const phone = (app.ownerPhone || '').replace(/\D/g, '');
    const cleanPhone = phone.startsWith('55') ? phone : `55${phone}`;

    const text = encodeURIComponent(
      `🐾 *LEMBRETE DE EXAME — VetTeleRad*\n\n` +
      `Olá, confirmamos o agendamento de *${app.patientName}*:\n` +
      `📅 *Data:* ${new Date(`${app.date}T12:00:00`).toLocaleDateString('pt-BR')}\n` +
      `⏰ *Horário:* ${app.time}h\n` +
      `🔬 *Exame:* ${app.region} (${app.modality === 'ULTRASSOM' ? 'Ultrassom' : 'Raio-X'})\n` +
      `🏥 *Clínica:* ${app.clinicName}\n` +
      `👨‍⚕️ *Especialista:* ${app.specialistName || 'Médico Veterinário'}\n\n` +
      (app.preparationInstructions ? `⚠️ *Orientações de Preparo:* ${app.preparationInstructions}\n\n` : '') +
      `Por favor, chegue com 10 minutos de antecedência. Qualquer dúvida estamos à disposição!`
    );

    const waUrl = phone.length >= 10
      ? `https://wa.me/${cleanPhone}?text=${text}`
      : `https://wa.me/?text=${text}`;

    window.open(waUrl, '_blank');
  };

  // Agendamentos filtrados
  const filteredAppointments = useMemo(() => {
    return appointments.filter(a => {
      const matchModality = modalityFilter === 'ALL' || a.modality === modalityFilter;
      const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
      const matchSearch =
        a.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.clinicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.ownerName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchModality && matchStatus && matchSearch;
    });
  }, [appointments, modalityFilter, statusFilter, searchQuery]);

  // Estatísticas do dia selecionado
  const stats = useMemo(() => {
    return {
      total: appointments.length,
      xrays: appointments.filter(a => a.modality === 'RADIOGRAFIA').length,
      ultrasounds: appointments.filter(a => a.modality === 'ULTRASSOM').length,
      confirmed: appointments.filter(a => a.status === 'CONFIRMED').length,
      inProgress: appointments.filter(a => a.status === 'IN_PROGRESS').length,
      completed: appointments.filter(a => a.status === 'COMPLETED').length
    };
  }, [appointments]);

  // Horários da grade
  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '13:30', '14:00', '14:30', '15:00',
    '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
  ];

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'SCHEDULED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">Agendado</span>;
      case 'CONFIRMED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20">Confirmado</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20 animate-pulse">Em Atendimento</span>;
      case 'COMPLETED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">Realizado</span>;
      case 'CANCELLED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20">Cancelado</span>;
    }
  };

  if (isLoading || !currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs">Carregando agenda de rotina...</span>
      </div>
    );
  }

  const formattedDateString = new Date(`${selectedDate}T12:00:00Z`).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      <Navbar user={currentUser} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Topo: Título & Navegação de Datas */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5" /> Agenda de Rotina Especializada
              </span>
              <span className="text-xs text-slate-400">
                {currentUser.role === 'ADMIN' ? 'Visão Central' : currentUser.name}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white capitalize">
              {formattedDateString}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Organize horários de entrada, orientações de jejum/preparo e encaminhamento direto para laudos.
            </p>
          </div>

          {/* Controles de Data e Ações */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
              <button
                type="button"
                onClick={handlePrevDay}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
                title="Dia anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <button
                type="button"
                onClick={handleToday}
                className="px-3 py-1 text-xs font-bold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                Hoje
              </button>

              <button
                type="button"
                onClick={handleNextDay}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
                title="Próximo dia"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500 font-mono"
            />

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Agendar Novo Exame</span>
            </button>
          </div>
        </div>

        {/* Métricas do Dia Selecionado */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs">
          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
            <span className="text-slate-400 text-[11px] block uppercase font-semibold">Total do Dia</span>
            <span className="text-2xl font-black text-white mt-1 block font-mono">{stats.total}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
            <span className="text-cyan-400 text-[11px] block uppercase font-semibold flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" /> Raio-X
            </span>
            <span className="text-2xl font-black text-cyan-400 mt-1 block font-mono">{stats.xrays}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
            <span className="text-teal-400 text-[11px] block uppercase font-semibold flex items-center gap-1">
              <Waves className="w-3.5 h-3.5" /> Ultrassom
            </span>
            <span className="text-2xl font-black text-teal-400 mt-1 block font-mono">{stats.ultrasounds}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
            <span className="text-blue-400 text-[11px] block uppercase font-semibold">Confirmados</span>
            <span className="text-2xl font-black text-blue-400 mt-1 block font-mono">{stats.confirmed}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
            <span className="text-purple-400 text-[11px] block uppercase font-semibold">Em Espera/Curso</span>
            <span className="text-2xl font-black text-purple-400 mt-1 block font-mono">{stats.inProgress}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
            <span className="text-emerald-400 text-[11px] block uppercase font-semibold">Concluídos</span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block font-mono">{stats.completed}</span>
          </div>
        </div>

        {/* Barra de Filtros & Alternância de Visualização */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Busca */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar paciente, raça, tutor..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white outline-none focus:border-cyan-500"
              />
            </div>

            {/* Modalidade */}
            <select
              value={modalityFilter}
              onChange={e => setModalityFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 outline-none focus:border-cyan-500"
            >
              <option value="ALL">Todas Modalidades</option>
              <option value="RADIOGRAFIA">Raio-X</option>
              <option value="ULTRASSOM">Ultrassom</option>
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 outline-none focus:border-cyan-500"
            >
              <option value="ALL">Todos os Status</option>
              <option value="SCHEDULED">Agendado</option>
              <option value="CONFIRMED">Confirmado</option>
              <option value="IN_PROGRESS">Em Atendimento</option>
              <option value="COMPLETED">Realizado</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
          </div>

          {/* Alternador de Visualização */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('TIMELINE')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                viewMode === 'TIMELINE'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Grade Horária
            </button>
            <button
              onClick={() => setViewMode('LIST')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                viewMode === 'LIST'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Lista ({filteredAppointments.length})
            </button>
          </div>
        </div>

        {/* Visualização 1: Grade Horária (Timeline do Dia) */}
        {viewMode === 'TIMELINE' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                Linha do Tempo de Atendimentos
              </span>
              <span>{filteredAppointments.length} agendamentos no dia</span>
            </div>

            <div className="divide-y divide-slate-800/80">
              {timeSlots.map(slot => {
                const appsInSlot = filteredAppointments.filter(a => a.time === slot);

                return (
                  <div key={slot} className="flex flex-col sm:flex-row items-start hover:bg-slate-900/40 transition">
                    {/* Coluna do Horário */}
                    <div className="w-full sm:w-28 p-4 shrink-0 border-b sm:border-b-0 sm:border-r border-slate-800 flex sm:flex-col items-center sm:items-start justify-between">
                      <span className="text-sm font-black font-mono text-slate-200">{slot}</span>
                      <span className="text-[10px] text-slate-500 font-mono">30 min</span>
                    </div>

                    {/* Conteúdo do Horário */}
                    <div className="flex-1 p-3 w-full">
                      {appsInSlot.length === 0 ? (
                        <div className="py-2 text-[11px] text-slate-600 italic">
                          Horário disponível na rotina
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {appsInSlot.map(app => (
                            <div
                              key={app.id}
                              className={`p-4 rounded-2xl border transition shadow-md flex flex-col justify-between ${
                                app.modality === 'ULTRASSOM'
                                  ? 'bg-slate-950/90 border-teal-500/30 hover:border-teal-500/60'
                                  : 'bg-slate-950/90 border-cyan-500/30 hover:border-cyan-500/60'
                              }`}
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                                        app.modality === 'ULTRASSOM'
                                          ? 'bg-teal-500/20 text-teal-300'
                                          : 'bg-cyan-500/20 text-cyan-300'
                                      }`}
                                    >
                                      {app.modality === 'ULTRASSOM' ? <Waves className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
                                      {app.modality === 'ULTRASSOM' ? 'USG' : 'Raio-X'}
                                    </span>
                                    {getStatusBadge(app.status)}
                                  </div>

                                  <span className="text-[10px] font-mono text-slate-500">{app.id}</span>
                                </div>

                                <div>
                                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                                    <span>{app.patientName}</span>
                                    <span className="text-xs font-normal text-slate-400">
                                      ({app.species} • {app.breed}{app.age ? `, ${app.age}` : ''})
                                    </span>
                                  </h3>
                                  <div className="text-xs font-semibold text-cyan-300 mt-0.5">
                                    {app.region}
                                  </div>
                                </div>

                                <div className="text-[11px] text-slate-400 space-y-1 pt-1 border-t border-slate-800/80">
                                  <div className="flex items-center gap-1.5">
                                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                                    <span>{app.clinicName} (Sol: {app.requestingVet})</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Tutor: {app.ownerName} {app.ownerPhone ? `(${app.ownerPhone})` : ''}</span>
                                  </div>
                                  {app.specialistName && (
                                    <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                                      <Stethoscope className="w-3.5 h-3.5 text-cyan-400" />
                                      <span>Esp: {app.specialistName}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Preparo Clínico */}
                                {app.preparationInstructions && (
                                  <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[10px] text-amber-300">
                                    <strong>Preparo:</strong> {app.preparationInstructions}
                                  </div>
                                )}

                                {app.notes && (
                                  <div className="text-[10px] text-slate-400 italic">
                                    &quot;{app.notes}&quot;
                                  </div>
                                )}
                              </div>

                              {/* Ações do Card */}
                              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 mt-3 border-t border-slate-800/80">
                                {/* Botão WhatsApp */}
                                <button
                                  type="button"
                                  onClick={() => handleSendReminderWhatsApp(app)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 rounded-lg text-[10px] font-bold transition cursor-pointer"
                                  title="Enviar lembrete e preparo no WhatsApp"
                                >
                                  <MessageSquare className="w-3 h-3" />
                                  <span>WhatsApp</span>
                                </button>

                                <div className="flex items-center gap-1.5">
                                  {/* Mudar Status */}
                                  {app.status === 'SCHEDULED' && (
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateStatus(app.id, 'CONFIRMED')}
                                      className="px-2 py-1 bg-blue-950 hover:bg-blue-900 text-blue-300 rounded-lg text-[10px] font-semibold border border-blue-500/30 cursor-pointer"
                                    >
                                      Confirmar
                                    </button>
                                  )}

                                  {app.status === 'CONFIRMED' && (
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateStatus(app.id, 'IN_PROGRESS')}
                                      className="px-2 py-1 bg-purple-950 hover:bg-purple-900 text-purple-300 rounded-lg text-[10px] font-semibold border border-purple-500/30 cursor-pointer"
                                    >
                                      Atender
                                    </button>
                                  )}

                                  {/* Gerar Exame para Fila de Laudos */}
                                  {app.status !== 'COMPLETED' ? (
                                    <button
                                      type="button"
                                      onClick={() => handleConvertToExam(app.id)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-[10px] font-bold shadow-md shadow-cyan-500/20 cursor-pointer"
                                      title="Enviar paciente para a worklist de laudos"
                                    >
                                      <FileText className="w-3 h-3" />
                                      <span>Laudar Exame</span>
                                    </button>
                                  ) : (
                                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3" />
                                      <span>Na Worklist</span>
                                    </span>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => handleDelete(app.id)}
                                    className="p-1 text-slate-500 hover:text-rose-400 rounded transition cursor-pointer"
                                    title="Cancelar agendamento"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Visualização 2: Tabela / Lista Completa */}
        {viewMode === 'LIST' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Horário</th>
                    <th className="py-3.5 px-4">Paciente / Tutor</th>
                    <th className="py-3.5 px-4">Modalidade &amp; Exame</th>
                    <th className="py-3.5 px-4">Clínica Requisitante</th>
                    <th className="py-3.5 px-4">Preparo &amp; Observações</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        Nenhum agendamento encontrado para esta data ou filtros.
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map(app => (
                      <tr key={app.id} className="hover:bg-slate-850/50 transition">
                        <td className="py-3 px-4 font-mono font-black text-white whitespace-nowrap">
                          {app.time}h
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <strong className="text-white block">{app.patientName}</strong>
                          <span className="text-slate-400 text-[11px]">{app.species} • {app.breed}</span>
                          <div className="text-slate-500 text-[10px]">Tutor: {app.ownerName}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 font-bold text-slate-200">
                            {app.modality === 'ULTRASSOM' ? (
                              <Waves className="w-3.5 h-3.5 text-teal-400" />
                            ) : (
                              <Activity className="w-3.5 h-3.5 text-cyan-400" />
                            )}
                            <span>{app.region}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">{app.specialistName}</span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="text-slate-200 font-medium block">{app.clinicName}</span>
                          <span className="text-slate-400 text-[10px]">{app.requestingVet}</span>
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate text-[11px]">
                          {app.preparationInstructions ? (
                            <span className="text-amber-300 font-medium">{app.preparationInstructions}</span>
                          ) : (
                            <span className="text-slate-500">Sem preparo especial</span>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {getStatusBadge(app.status)}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleSendReminderWhatsApp(app)}
                              className="p-1.5 text-emerald-400 hover:bg-emerald-950 rounded-lg transition"
                              title="Enviar WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>

                            {app.status !== 'COMPLETED' ? (
                              <button
                                type="button"
                                onClick={() => handleConvertToExam(app.id)}
                                className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-[10px] font-bold"
                              >
                                Laudar
                              </button>
                            ) : (
                              <span className="text-[10px] text-emerald-400 font-bold">Pronto</span>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDelete(app.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition"
                              title="Cancelar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* Modal de Cadastro de Novo Agendamento */}
      {isModalOpen && (
        <NewAppointmentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAppointmentCreated={newApp => {
            setAppointments(prev => [newApp, ...prev]);
          }}
          currentUser={currentUser}
          initialDate={selectedDate}
        />
      )}
    </div>
  );
}
