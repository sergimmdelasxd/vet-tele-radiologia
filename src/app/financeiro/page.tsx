'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  DollarSign, 
  TrendingUp, 
  Building2, 
  Activity, 
  Waves, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  FileText, 
  User, 
  Download, 
  RefreshCw, 
  Edit3, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  Percent, 
  Sparkles,
  Phone,
  Search,
  SlidersHorizontal,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { MonthlyClosingModal } from '@/components/financial/MonthlyClosingModal';
import { ClinicPricingModal } from '@/components/dashboard/ClinicPricingModal';
import { 
  User as UserType, 
  PlatformFinancialAnalytics, 
  ClinicFinancialSummary, 
  ClinicPlan 
} from '@/types';

export default function FinanceiroPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [analytics, setAnalytics] = useState<PlatformFinancialAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);

  // Filtros
  const [searchClinic, setSearchClinic] = useState('');
  const [planFilter, setPlanFilter] = useState<'ALL' | ClinicPlan>('ALL');

  // Modais de Gestão
  const [editingClinic, setEditingClinic] = useState<ClinicFinancialSummary | null>(null);
  const [selectedNewPlan, setSelectedNewPlan] = useState<ClinicPlan>('PRO');
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);

  const [adjustingClinic, setAdjustingClinic] = useState<ClinicFinancialSummary | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<string>('100');
  const [adjustReason, setAdjustReason] = useState('Bônus promocional de fidelidade');
  const [isSubmittingAdjust, setIsSubmittingAdjust] = useState(false);

  const [pricingClinic, setPricingClinic] = useState<ClinicFinancialSummary | null>(null);

  const loadData = async () => {
    try {
      setErrorMsg(null);
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

      const res = await fetch('/api/financial/analytics');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao carregar dados financeiros');
      }
      setAnalytics(data.analytics);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Falha ao sincronizar dados');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Salvar novo plano
  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClinic) return;
    setIsUpdatingPlan(true);

    try {
      const res = await fetch('/api/financial/analytics', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-plan',
          clinicId: editingClinic.clinicId,
          plan: selectedNewPlan
        })
      });

      if (!res.ok) throw new Error('Falha ao atualizar plano');

      setEditingClinic(null);
      loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  // Salvar ajuste de saldo
  const handleSaveBalanceAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingClinic) return;
    setIsSubmittingAdjust(true);

    try {
      const numericAmount = parseFloat(adjustAmount);
      if (isNaN(numericAmount)) {
        alert('Informe um valor numérico válido.');
        return;
      }

      const res = await fetch('/api/financial/analytics', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'adjust-balance',
          clinicId: adjustingClinic.clinicId,
          amount: numericAmount,
          reason: adjustReason
        })
      });

      if (!res.ok) throw new Error('Falha ao ajustar saldo');

      setAdjustingClinic(null);
      loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmittingAdjust(false);
    }
  };

  // Exportar CSV
  const handleExportCSV = () => {
    if (!analytics) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Clinica;Plano;Total_Exames;Raio_X;Ultrassom;Urgencias;Faturamento_Total_R$;Saldo_Carteira_R$\n';

    analytics.clinicsSummary.forEach(c => {
      csvContent += `"${c.clinicName}";"${c.plan}";${c.totalExams};${c.radiographyCount};${c.ultrasoundCount};${c.urgentCount};${c.totalRevenue.toFixed(2)};${c.balance.toFixed(2)}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio-financeiro-vettelrad-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtrar clínicas
  const filteredClinics = useMemo(() => {
    if (!analytics) return [];
    return analytics.clinicsSummary.filter(c => {
      const matchSearch =
        c.clinicName.toLowerCase().includes(searchClinic.toLowerCase()) ||
        c.contactName.toLowerCase().includes(searchClinic.toLowerCase()) ||
        c.email.toLowerCase().includes(searchClinic.toLowerCase());
      const matchPlan = planFilter === 'ALL' || c.plan === planFilter;
      return matchSearch && matchPlan;
    });
  }, [analytics, searchClinic, planFilter]);

  const getPlanBadge = (plan: ClinicPlan) => {
    switch (plan) {
      case 'PRO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            Clínica Pro
          </span>
        );
      case 'HOSPITAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-purple-500/10 text-purple-300 border border-purple-500/30">
            <ShieldCheck className="w-3 h-3 text-purple-400" />
            Hospital 24h
          </span>
        );
      case 'AVULSO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            <DollarSign className="w-3 h-3 text-emerald-400" />
            Avulso / Pré-Pago
          </span>
        );
    }
  };

  if (isLoading || !analytics || !currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs">Carregando painel financeiro analítico...</span>
      </div>
    );
  }

  // Encontrar o maior valor mensal para escalar o gráfico de barras
  const maxMonthly = Math.max(...analytics.monthlyRevenue.map(m => m.total), 1);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      <Navbar user={currentUser} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Principal */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" /> Faturamento &amp; Gestão de Clínicas
              </span>
              <span className="text-xs text-slate-400">
                Acesso Gestor • {currentUser.name}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Painel Financeiro &amp; Volumetria por Parceiro
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Monitore faturamento em tempo real, receita por modalidade (Raio-X e USG), planos contratados e saldo de créditos das clínicas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsClosingModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition cursor-pointer"
              title="Abrir Fechamento Mensal Consolidado com Seleção de Mês e Impressão PDF"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Fechamento Mensal</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition cursor-pointer"
              title="Exportar dados para planilha CSV"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Exportar Planilha (CSV)</span>
            </button>

            <button
              onClick={loadData}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition cursor-pointer"
              title="Atualizar dados"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Faturamento Total */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Faturamento Total</span>
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">
              R$ {analytics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium mt-2">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+18.4% vs mês anterior</span>
            </div>
          </div>

          {/* Receita Raio-X Digital */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 text-cyan-300">
                <Activity className="w-3.5 h-3.5" /> Receita Raio-X
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {analytics.clinicsSummary.reduce((acc, c) => acc + c.radiographyCount, 0)} laudos
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">
              R$ {analytics.radiographyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-400 mt-2">
              Preço médio unitário: <strong className="text-slate-200">R$ 45,00</strong>
            </div>
          </div>

          {/* Receita Ultrassonografia */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 text-teal-300">
                <Waves className="w-3.5 h-3.5" /> Receita Ultrassom
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {analytics.clinicsSummary.reduce((acc, c) => acc + c.ultrasoundCount, 0)} laudos
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-teal-400 font-mono">
              R$ {analytics.ultrasoundRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-400 mt-2">
              Preço médio unitário: <strong className="text-slate-200">R$ 60,00</strong>
            </div>
          </div>

          {/* Saldo Ativo em Carteira */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5" /> Saldo em Custódia
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300">
                {analytics.clinicsCount} parceiros
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
              R$ {analytics.totalActiveBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-400 mt-2">
              Ticket Médio / Laudo: <strong className="text-slate-200">R$ {analytics.averageTicket.toFixed(2)}</strong>
            </div>
          </div>

        </div>

        {/* Gráficos Interativos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Gráfico 1: Evolução Mensal da Receita (Raio-X vs Ultrassom) */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  Evolução Mensal do Faturamento (Últimos 6 Meses)
                </h2>
                <p className="text-xs text-slate-400">Comparativo de receita gerada por Raio-X Digital e Ultrassonografia</p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-3 h-3 rounded-md bg-cyan-500 inline-block" />
                  <span>Raio-X</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-3 h-3 rounded-md bg-teal-400 inline-block" />
                  <span>Ultrassom</span>
                </div>
              </div>
            </div>

            {/* Gráfico de Barras SVG / CSS Customizado */}
            <div className="h-64 flex items-end justify-between gap-2 sm:gap-6 pt-8 pb-2 px-2 border-b border-slate-800/80">
              {analytics.monthlyRevenue.map((item, index) => {
                const totalHeightPercent = Math.round((item.total / maxMonthly) * 100);
                const radHeightPercent = Math.round((item.radiography / item.total) * 100);
                const usgHeightPercent = 100 - radHeightPercent;

                return (
                  <div key={item.month} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    
                    {/* Tooltip flutuante no hover */}
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 border border-slate-700 text-[10px] p-2 rounded-xl whitespace-nowrap z-20 shadow-xl pointer-events-none">
                      <div className="font-bold text-white">{item.month} / 2026: R$ {item.total.toLocaleString('pt-BR')}</div>
                      <div className="text-cyan-400">RX: R$ {item.radiography.toLocaleString('pt-BR')}</div>
                      <div className="text-teal-400">USG: R$ {item.ultrasound.toLocaleString('pt-BR')}</div>
                    </div>

                    {/* Valor acima da barra */}
                    <span className="text-[10px] font-mono text-slate-400 group-hover:text-white mb-1.5 transition">
                      R${(item.total / 1000).toFixed(1)}k
                    </span>

                    {/* Barra Empilhada com Raio-X e Ultrassom */}
                    <div 
                      className="w-full max-w-[48px] rounded-t-xl overflow-hidden flex flex-col transition-all duration-300 group-hover:brightness-110 shadow-lg shadow-cyan-500/5"
                      style={{ height: `${Math.max(totalHeightPercent, 12)}%` }}
                    >
                      {/* Top: Ultrassom */}
                      <div 
                        className="bg-gradient-to-t from-teal-500 to-teal-400 w-full transition-all"
                        style={{ height: `${usgHeightPercent}%` }}
                      />
                      {/* Bottom: Raio-X */}
                      <div 
                        className="bg-gradient-to-t from-cyan-600 to-cyan-500 w-full transition-all"
                        style={{ height: `${radHeightPercent}%` }}
                      />
                    </div>

                    {/* Rótulo do Mês */}
                    <span className="text-xs font-semibold text-slate-400 mt-2 font-mono">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-1">
              <span>* Valores consolidados de laudos finalizados e autorizados na plataforma</span>
              <span>Crescimento linear contínuo</span>
            </div>
          </div>

          {/* Gráfico 2: Distribuição dos Planos Contratados */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1">
                <Percent className="w-4 h-4 text-purple-400" />
                Planos &amp; Convênios
              </h2>
              <p className="text-xs text-slate-400 mb-6">Fatia de mercado entre as clínicas conveniadas</p>

              <div className="space-y-4">
                {analytics.planDistribution.map(plan => (
                  <div key={plan.plan} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-2.5 h-2.5 rounded-full inline-block"
                          style={{ backgroundColor: plan.color }}
                        />
                        <span className="font-semibold text-slate-200">{plan.label}</span>
                      </div>
                      <span className="font-mono text-slate-400">
                        {plan.count} clínica{plan.count > 1 ? 's' : ''} ({plan.percentage}%)
                      </span>
                    </div>

                    <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${plan.percentage}%`,
                          backgroundColor: plan.color 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 mt-6 text-xs text-slate-400 space-y-2">
              <span className="text-[11px] font-bold text-cyan-400 block uppercase tracking-wider">
                Vantagens dos Planos
              </span>
              <p className="text-[11px] leading-relaxed">
                Clínicas no <strong>Plano Pro</strong> e <strong>Hospital 24h</strong> contam com descontos de até 28% por laudo e atendimento prioritário com SLA de 45 minutos.
              </p>
            </div>
          </div>

        </div>

        {/* Tabela de Detalhamento por Clínica Parceira */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          
          {/* Barra de Filtros da Tabela */}
          <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-cyan-400" />
                Volumetria e Faturamento por Clínica Parceira
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Exames pedidos por cada parceiro, divisão entre Raio-X e USG, plano atual e saldo de créditos
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Buscar clínica, e-mail..."
                  value={searchClinic}
                  onChange={e => setSearchClinic(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                />
              </div>

              <select
                value={planFilter}
                onChange={e => setPlanFilter(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-cyan-500"
              >
                <option value="ALL">Todos os Planos</option>
                <option value="PRO">Plano Pro</option>
                <option value="HOSPITAL">Hospital 24h</option>
                <option value="AVULSO">Avulso</option>
              </select>
            </div>
          </div>

          {/* Tabela de Dados */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-5">Clínica Parceira</th>
                  <th className="py-4 px-4">Plano Contratado</th>
                  <th className="py-4 px-4">Total de Exames</th>
                  <th className="py-4 px-4">Divisão (RX / USG)</th>
                  <th className="py-4 px-4">Faturamento Gerado</th>
                  <th className="py-4 px-4">Saldo em Carteira</th>
                  <th className="py-4 px-5 text-right">Ações de Gestão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredClinics.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      Nenhuma clínica encontrada para os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredClinics.map(clinic => (
                    <tr key={clinic.clinicId} className="hover:bg-slate-850/50 transition">
                      
                      {/* Clínica */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="font-bold text-white text-sm">{clinic.clinicName}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {clinic.contactName} • {clinic.uf}
                        </div>
                        <div className="text-[10px] text-slate-500">{clinic.email}</div>
                      </td>

                      {/* Plano */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {getPlanBadge(clinic.plan)}
                          {clinic.customPricing && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/25 text-[9px] font-bold">
                              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                              Personalizado
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">
                          {clinic.customPricing ? (
                            <span>Base RX: R$ {clinic.customPricing.radiographyBase || 45} | USG: R$ {clinic.customPricing.ultrasoundAbdominal || 60}</span>
                          ) : (
                            <>
                              {clinic.plan === 'PRO' && 'RX: R$ 38 | USG: R$ 52'}
                              {clinic.plan === 'HOSPITAL' && 'RX: R$ 32 | USG: R$ 44'}
                              {clinic.plan === 'AVULSO' && 'RX: R$ 45 | USG: R$ 60'}
                            </>
                          )}
                        </div>
                      </td>

                      {/* Total Exames */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-black text-white text-base font-mono block">
                          {clinic.totalExams}
                        </span>
                        {clinic.urgentCount > 0 && (
                          <span className="text-[10px] font-bold text-amber-400">
                            {clinic.urgentCount} urgências
                          </span>
                        )}
                      </td>

                      {/* Divisão RX e USG */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-cyan-300 font-mono font-bold">
                            <Activity className="w-3 h-3 text-cyan-400" />
                            {clinic.radiographyCount} RX
                          </span>
                          <span className="text-slate-600">|</span>
                          <span className="inline-flex items-center gap-1 text-teal-300 font-mono font-bold">
                            <Waves className="w-3 h-3 text-teal-400" />
                            {clinic.ultrasoundCount} USG
                          </span>
                        </div>
                      </td>

                      {/* Faturamento Gerado */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-black text-emerald-400 text-sm font-mono block">
                          R$ {clinic.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {clinic.totalExams > 0 ? `Méd. R$ ${(clinic.totalRevenue / clinic.totalExams).toFixed(2)}/laudo` : '-'}
                        </span>
                      </td>

                      {/* Saldo em Carteira */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-200">
                          R$ {clinic.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        {clinic.balance < 100 ? (
                          <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-0.5">
                            <AlertCircle className="w-3 h-3" /> Saldo Baixo
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Saldo Regular
                          </span>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          
                          {/* Botão Preços de Laudo */}
                          <button
                            type="button"
                            onClick={() => setPricingClinic(clinic)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 rounded-lg text-[11px] font-bold border border-amber-500/30 transition cursor-pointer"
                            title="Configurar valores cobrados por laudo (Raio-X, Regiões, USG Abdominal, AFAST, TFAST, Vet BLUE)"
                          >
                            <DollarSign className="w-3 h-3 text-amber-400" />
                            <span>Preços de Laudo</span>
                          </button>

                          {/* Botão Alterar Plano */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingClinic(clinic);
                              setSelectedNewPlan(clinic.plan);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold border border-slate-700 transition cursor-pointer"
                            title="Alterar plano comercial da clínica"
                          >
                            <Edit3 className="w-3 h-3 text-cyan-400" />
                            <span>Mudar Plano</span>
                          </button>

                          {/* Botão Ajustar Saldo */}
                          <button
                            type="button"
                            onClick={() => {
                              setAdjustingClinic(clinic);
                              setAdjustAmount('100');
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 rounded-lg text-[11px] font-bold border border-emerald-500/30 transition cursor-pointer"
                            title="Creditar ou debitar saldo"
                          >
                            <Wallet className="w-3 h-3 text-emerald-400" />
                            <span>Ajustar Saldo</span>
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

      </main>

      {/* Modal 1: Alterar Plano da Clínica */}
      {editingClinic && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Alterar Plano da Clínica</h3>
                <p className="text-xs text-slate-400">{editingClinic.clinicName}</p>
              </div>
              <button
                onClick={() => setEditingClinic(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="p-6 space-y-4 text-xs">
              <label className="block text-slate-300 font-semibold">Selecione o Novo Plano Comercial:</label>

              <div className="space-y-2">
                {[
                  {
                    id: 'PRO',
                    title: 'Clínica Parceira Pro',
                    desc: 'Desconto de 15% (RX R$ 38 / USG R$ 52), SLA prioritário e canal direto WhatsApp',
                    badge: 'Recomendado'
                  },
                  {
                    id: 'HOSPITAL',
                    title: 'Hospital 24h & Redes',
                    desc: 'Desconto de 28% (RX R$ 32 / USG R$ 44), SLA 45min e faturamento quinzenal',
                    badge: 'Alto Volume'
                  },
                  {
                    id: 'AVULSO',
                    title: 'Plano Avulso / Sob Demanda',
                    desc: 'Tabela padrão (RX R$ 45 / USG R$ 60), sem compromisso nem mensalidade',
                    badge: 'Flexível'
                  }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedNewPlan(item.id as ClinicPlan)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition cursor-pointer ${
                      selectedNewPlan === item.id
                        ? 'bg-cyan-950/50 border-cyan-500 text-white shadow-md shadow-cyan-500/10'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <strong className="text-white text-xs">{item.title}</strong>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">{item.desc}</p>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingClinic(null)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPlan}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/25 cursor-pointer disabled:opacity-50"
                >
                  {isUpdatingPlan ? 'Salvando...' : 'Salvar Alteração de Plano'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Ajustar Saldo / Bonificar Clínica */}
      {adjustingClinic && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Ajuste de Saldo da Clínica</h3>
                <p className="text-xs text-slate-400">{adjustingClinic.clinicName}</p>
              </div>
              <button
                onClick={() => setAdjustingClinic(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBalanceAdjust} className="p-6 space-y-4 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Saldo Atual em Carteira:</span>
                <span className="text-white font-mono font-bold text-sm">
                  R$ {adjustingClinic.balance.toFixed(2)}
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Valor a Creditar (+) ou Debitar (-):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={adjustAmount}
                    onChange={e => setAdjustAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2 text-white font-mono text-sm outline-none focus:border-cyan-500"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Ex: Digite 100 para bonificar ou -50 para estorno.
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Motivo / Justificativa do Ajuste:
                </label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  placeholder="Ex: Bônus de fidelidade, Acordo comercial..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAdjustingClinic(null)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdjust}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingAdjust ? 'Processando...' : 'Aplicar Ajuste de Saldo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isClosingModalOpen && (
        <MonthlyClosingModal
          user={currentUser}
          onClose={() => setIsClosingModalOpen(false)}
        />
      )}

      {pricingClinic && (
        <ClinicPricingModal
          isOpen={!!pricingClinic}
          onClose={() => setPricingClinic(null)}
          clinic={pricingClinic}
          onSaved={loadData}
        />
      )}

    </div>
  );
}
