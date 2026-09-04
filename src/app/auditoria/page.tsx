'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  ArrowLeft, 
  Lock, 
  CheckCircle2, 
  FileText, 
  Eye, 
  LogIn, 
  Calendar, 
  Clock, 
  UserCheck, 
  Laptop, 
  HardDrive,
  AlertCircle,
  FileSpreadsheet,
  ExternalLink
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { AuditLog, User } from '@/types';

export default function AuditLogsPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [resourceFilter, setResourceFilter] = useState('ALL');

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});

    loadLogs();
  }, []);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/audit-logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter(l => {
    if (actionFilter !== 'ALL' && l.action !== actionFilter) return false;
    if (resourceFilter !== 'ALL' && l.resourceType !== resourceFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchDetails = l.details.toLowerCase().includes(q);
      const matchUser = l.userName?.toLowerCase().includes(q);
      const matchResource = l.resourceId?.toLowerCase().includes(q);
      const matchIp = l.ipAddress?.includes(q);
      return matchDetails || matchUser || matchResource || matchIp;
    }
    return true;
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE_REPORT':
        return { label: 'Emissão de Laudo', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'DOWNLOAD_REPORT':
        return { label: 'Download de PDF', color: 'bg-sky-50 text-sky-800 border-sky-200' };
      case 'PRINT_REPORT':
        return { label: 'Impressão de Laudo', color: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'CREATE_EXAM':
        return { label: 'Upload de Exame', color: 'bg-teal-50 text-teal-800 border-teal-200' };
      case 'VIEW_EXAM':
        return { label: 'Acesso a Prontuário', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' };
      case 'LOGIN':
        return { label: 'Autenticação / Login', color: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'EXPORT_CLOSING':
        return { label: 'Fechamento Financeiro', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      default:
        return { label: action, color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const exportCsv = () => {
    const headers = ['ID', 'Data/Hora (UTC)', 'Usuário', 'Perfil', 'Ação', 'Recurso', 'ID do Recurso', 'IP Origem', 'Dispositivo', 'Detalhes'];
    const rows = filteredLogs.map(l => [
      l.id,
      new Date(l.createdAt).toISOString(),
      `"${l.userName || 'Anônimo'}"`,
      l.userRole || '',
      l.action,
      l.resourceType,
      l.resourceId || '',
      l.ipAddress || '',
      `"${(l.userAgent || '').replace(/"/g, '""')}"`,
      `"${l.details.replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `trilha-auditoria-lgpd-vettelerad-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(filteredLogs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `auditoria-seguranca-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      <Navbar user={currentUser} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-teal-600 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar ao Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 border border-teal-500/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Trilha de Auditoria &amp; Conformidade LGPD
                </h1>
                <p className="text-xs text-slate-500">
                  Rastreabilidade e custódia digital segundo a Lei nº 13.709/2018 e Resoluções CFMV nº 1.321/2020 e 1.475/2022
                </p>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={loadLogs}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              title="Recarregar eventos"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>

            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-teal-700" />
              <span>Exportar Planilha (.CSV)</span>
            </button>

            <button
              type="button"
              onClick={exportJson}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Backup Audit (.JSON)</span>
            </button>
          </div>
        </div>

        {/* Cards Informativos de Conformidade */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Criptografia em Repouso</div>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span>AES-256 / SHA-256</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Guarda de Prontuário</div>
              <div className="text-sm font-bold text-slate-900">
                5 Anos (Res. CFMV)
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Identificação de Acesso</div>
              <div className="text-sm font-bold text-slate-900">
                100% Auditável (IP + CRMV)
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Status de Proteção</div>
              <div className="text-sm font-bold text-emerald-700 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>LGPD Em Conformidade</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros e Barra de Pesquisa */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Input de Busca */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Pesquisar por paciente, ID do exame, médico, clínica, IP ou descrição..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Filtro de Ação */}
            <div className="flex items-center gap-2">
              <select
                value={actionFilter}
                onChange={e => setActionFilter(e.target.value)}
                className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="ALL">Todas as Ações</option>
                <option value="CREATE_REPORT">Emissão de Laudo</option>
                <option value="DOWNLOAD_REPORT">Download de Laudo</option>
                <option value="CREATE_EXAM">Upload / Novo Exame</option>
                <option value="VIEW_EXAM">Visualização de Exame</option>
                <option value="LOGIN">Autenticação (Login)</option>
                <option value="EXPORT_CLOSING">Fechamento Mensal</option>
              </select>

              {/* Filtro de Recurso */}
              <select
                value={resourceFilter}
                onChange={e => setResourceFilter(e.target.value)}
                className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="ALL">Todos os Recursos</option>
                <option value="EXAM">Exames Médicos</option>
                <option value="REPORT">Laudos Radiológicos</option>
                <option value="AUTH">Autenticação &amp; Sessão</option>
                <option value="FINANCIAL">Financeiro &amp; Cobrança</option>
              </select>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>Exibindo <strong>{filteredLogs.length}</strong> eventos registrados na trilha de auditoria</span>
            <span>Logs mantidos em armazenamento protegido e imutável</span>
          </div>
        </div>

        {/* Tabela de Eventos de Auditoria */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal-600" />
              <div className="text-xs font-semibold">Carregando trilha de auditoria segura...</div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto text-slate-300" />
              <div className="text-sm font-bold text-slate-700">Nenhum evento localizado</div>
              <div className="text-xs text-slate-500">Tente ajustar seus termos de pesquisa ou filtros de ação.</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 divide-y divide-slate-200">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="px-4 py-3">Data / Hora (BRT)</th>
                    <th scope="col" className="px-4 py-3">Ação Registrada</th>
                    <th scope="col" className="px-4 py-3">Responsável</th>
                    <th scope="col" className="px-4 py-3">Recurso / Paciente</th>
                    <th scope="col" className="px-4 py-3">Detalhes do Evento</th>
                    <th scope="col" className="px-4 py-3">Origem (IP &amp; Client)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredLogs.map(log => {
                    const badge = getActionBadge(log.action);
                    const logDate = new Date(log.createdAt);
                    
                    return (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Data e Hora */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-semibold text-slate-900">
                            {logDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {logDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </div>
                        </td>

                        {/* Ação */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${badge.color}`}>
                            {badge.label}
                          </span>
                        </td>

                        {/* Responsável */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-bold text-slate-900 text-xs">
                            {log.userName || 'Sistema'}
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1">
                            <span>{log.userRole || 'ANÔNIMO'}</span>
                            {log.userEmail && <span>• {log.userEmail}</span>}
                          </div>
                        </td>

                        {/* Recurso */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {log.resourceId ? (
                            <div className="font-mono font-bold text-teal-700 text-xs">
                              {log.resourceId}
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">
                            {log.resourceType}
                          </div>
                        </td>

                        {/* Detalhes */}
                        <td className="px-4 py-3 text-slate-700 max-w-xs sm:max-w-md">
                          <p className="line-clamp-2 leading-relaxed text-xs">
                            {log.details}
                          </p>
                        </td>

                        {/* IP & Dispositivo */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-mono text-[11px] text-slate-800 font-semibold">
                            {log.ipAddress || '127.0.0.1'}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[140px]" title={log.userAgent}>
                            {log.userAgent || 'Web Browser'}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Card Didático de Normas LGPD & CFMV */}
        <div className="bg-gradient-to-br from-teal-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                Como a VetTeleRad assegura a conformidade integral da sua clínica com a LGPD
              </h3>
              <p className="text-xs text-teal-200/80">
                Garantia de segurança jurídica para os médicos veterinários solicitantes e especialistas telerradiologistas
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="font-bold text-teal-300">1. Princípio da Necessidade &amp; Finalidade</div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Coletamos estritamente os dados essenciais para o diagnóstico por imagem e emissão do laudo técnico (espécie, raça, idade, histórico e identificação do tutor).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="font-bold text-teal-300">2. Guarda e Sigilo Profissional</div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Todos os exames e imagens médicas são custodiados sob sigilo médico-veterinário e arquivados pelo prazo regulamentar mínimo de 5 anos exigido pelo CFMV.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="font-bold text-teal-300">3. Integridade e Assinatura Digital</div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Cada laudo emitido recebe um hash criptográfico SHA-256 e carimbo de tempo inviolável, garantindo que o documento emitido pelo especialista não sofreu adulteração.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 border-t border-white/10">
            <span>Dúvidas jurídicas ou solicitações de titulares de dados?</span>
            <div className="flex items-center gap-4">
              <Link href="/privacidade" className="text-teal-300 hover:text-teal-200 underline font-semibold">
                Política de Privacidade Completa
              </Link>
              <Link href="/termos" className="text-teal-300 hover:text-teal-200 underline font-semibold">
                Termos de Custódia e Serviço
              </Link>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
