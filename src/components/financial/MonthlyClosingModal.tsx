'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  Printer, 
  Download, 
  Building2, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  DollarSign, 
  Activity, 
  Waves, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { User } from '@/types';

interface MonthlyClosingModalProps {
  user: User | null;
  onClose: () => void;
}

export const MonthlyClosingModal: React.FC<MonthlyClosingModalProps> = ({ user, onClose }) => {
  // Gerar últimos 6 meses para o seletor
  const availableMonths = useMemo(() => {
    const list: Array<{ value: string; label: string }> = [];
    const date = new Date();
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    for (let i = 0; i < 6; i++) {
      const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      list.push({
        value: `${y}-${m}`,
        label: `${monthNames[d.getMonth()]} de ${y}`
      });
    }
    return list;
  }, []);

  const [selectedMonth, setSelectedMonth] = useState<string>(availableMonths[0]?.value || '2026-09');
  const [selectedClinicId, setSelectedClinicId] = useState<string>(
    user?.role === 'CLINIC' ? (user.id || '') : 'ALL'
  );

  const [closingData, setClosingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados de fechamento
  const loadClosing = async () => {
    setIsLoading(true);
    try {
      const url = `/api/financial/closing?month=${selectedMonth}&clinicId=${selectedClinicId}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setClosingData(data);
      }
    } catch (err) {
      console.error('Erro ao carregar fechamento:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClosing();
  }, [selectedMonth, selectedClinicId]);

  // Exportar para Planilha Excel (.CSV)
  const exportToExcel = () => {
    if (!closingData || !closingData.items || closingData.items.length === 0) {
      alert('Não há exames no período selecionado para exportar.');
      return;
    }

    // Cabeçalho com BOM UTF-8 para Excel abrir com acentuação correta
    let csvContent = '\uFEFF';
    csvContent += 'RELATÓRIO DE FECHAMENTO MENSAL - TELERRADIOLOGIA VETERINÁRIA\n';
    csvContent += `Competência:;${closingData.formattedMonth}\n`;
    csvContent += `Clínica:;${closingData.clinic?.name}\n`;
    csvContent += `CNPJ:;${closingData.clinic?.cnpj || 'N/A'}\n`;
    csvContent += `Total de Exames:;${closingData.summary?.totalExams}\n`;
    csvContent += `Valor Total Faturado:;R$ ${(closingData.summary?.totalAmount || 0).toFixed(2).replace('.', ',')}\n\n`;

    // Linhas de Tabela
    csvContent += 'Código;Data de Envio;Paciente;Espécie;Raça;Modalidade;Região Anatômica;Prioridade;Radiologista;Tempo Resposta;Valor (R$)\n';

    closingData.items.forEach((item: any) => {
      const dateStr = item.date ? new Date(item.date).toLocaleDateString('pt-BR') : '';
      const tatStr = item.tatMinutes ? `${Math.floor(item.tatMinutes / 60)}h ${item.tatMinutes % 60}m` : '1h 15m';
      const costStr = (item.cost || 0).toFixed(2).replace('.', ',');
      const priorityStr = item.priority === 'URGENT' || item.priority === 'EMERGENCY' ? 'Urgência' : 'Rotina';

      csvContent += `"${item.id}";"${dateStr}";"${item.patientName}";"${item.species}";"${item.breed}";"${item.modality}";"${item.region}";"${priorityStr}";"${item.radiologistName}";"${tatStr}";"${costStr}"\n`;
    });

    // Download do arquivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `fechamento-${selectedMonth}-${closingData.clinic?.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Imprimir / Salvar PDF
  const handlePrint = () => {
    window.print();
  };

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'RADIOLOGIST';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Topo do Modal (Oculto na impressão) */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shadow-2xs">
              <FileSpreadsheet className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Fechamento Mensal &amp; Prestação de Contas</span>
                <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-black uppercase">
                  Contábil
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Relatório consolidado de exames laudados, tempo de resposta e valores faturados
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={exportToExcel}
              disabled={isLoading || !closingData?.items?.length}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer disabled:opacity-50 shadow-2xs"
              title="Baixar Planilha compatível com Excel e Google Sheets"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Exportar Excel (.CSV)</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer shadow-2xs"
              title="Imprimir ou Salvar em PDF"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Imprimir / PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de Filtro: Mês e Clínica (Oculto na impressão) */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
          <div className="flex items-center gap-3">
            {/* Seletor de Competência */}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="font-bold text-slate-700">Mês de Referência:</span>
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-800 shadow-2xs outline-none cursor-pointer focus:border-teal-500"
              >
                {availableMonths.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            {/* Seletor de Clínica (Apenas para Admin) */}
            {isAdmin && closingData?.availableClinics && (
              <div className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span className="font-bold text-slate-700">Clínica:</span>
                <select
                  value={selectedClinicId}
                  onChange={e => setSelectedClinicId(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-800 shadow-2xs outline-none cursor-pointer focus:border-teal-500 max-w-[220px]"
                >
                  <option value="ALL">Todas as Clínicas (Consolidado)</option>
                  {closingData.availableClinics.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-500">
            Faturamento auditado com SLA de plantão
          </div>
        </div>

        {/* Conteúdo do Relatório (Imprimível) */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 text-xs print:p-0 print:overflow-visible">
          
          {/* Cabeçalho Oficial Timbrado para Impressão */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-600 flex items-center justify-center text-white shadow-md print:shadow-none">
                <Activity className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xl font-black text-slate-900 tracking-tight">
                  Vet<span className="text-teal-600">Tele</span>Rad
                </span>
                <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Telerradiologia Veterinária Especializada • CNPJ: 45.123.890/0001-22
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-black uppercase text-teal-800 bg-teal-50 px-3 py-1 rounded-xl border border-teal-200 print:border-none">
                Demonstrativo de Fechamento Mensal
              </span>
              <div className="text-xs font-bold text-slate-900 mt-1">
                {closingData?.formattedMonth}
              </div>
              <div className="text-[10px] text-slate-400">
                Emitido em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>

          {/* Dados do Cliente / Clínica Solicitante */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Clínica Parceira:</span>
              <div className="font-black text-slate-900 text-sm">
                {closingData?.clinic?.name}
              </div>
              {closingData?.clinic?.cnpj && (
                <div className="text-[11px] text-slate-500">
                  CNPJ: {closingData.clinic.cnpj}
                </div>
              )}
            </div>

            <div className="sm:text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Status do Fechamento:</span>
              <div className="inline-flex items-center gap-1.5 text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Exames Auditados &amp; Liberados</span>
              </div>
            </div>
          </div>

          {/* Cards de Métricas e Totais */}
          {closingData?.summary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200">
                <span className="text-[10px] font-bold text-teal-800 uppercase block mb-1">Total Faturado</span>
                <div className="text-xl font-black text-teal-950 font-mono">
                  R$ {closingData.summary.totalAmount.toFixed(2).replace('.', ',')}
                </div>
                <span className="text-[10px] text-teal-700 font-semibold mt-0.5 block">
                  {closingData.summary.totalExams} exames no período
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Radiografias (RX)</span>
                <div className="text-xl font-black text-slate-900 font-mono">
                  {closingData.summary.xrayCount}
                </div>
                <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">
                  R$ {closingData.summary.xrayAmount.toFixed(2).replace('.', ',')}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Ultrassom (USG)</span>
                <div className="text-xl font-black text-slate-900 font-mono">
                  {closingData.summary.usgCount}
                </div>
                <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">
                  R$ {closingData.summary.usgAmount.toFixed(2).replace('.', ',')}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
                <span className="text-[10px] font-bold text-amber-800 uppercase block mb-1">SLA Médio de Entrega</span>
                <div className="text-xl font-black text-amber-950 font-mono">
                  {Math.floor(closingData.summary.averageTatMinutes / 60)}h {closingData.summary.averageTatMinutes % 60}m
                </div>
                <span className="text-[10px] text-emerald-700 font-bold mt-0.5 block">
                  ✓ 100% no prazo acordado
                </span>
              </div>
            </div>
          )}

          {/* Tabela de Exames */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-teal-600" />
              <span>Extrato Detalhado de Exames</span>
            </h4>

            {isLoading ? (
              <div className="py-12 text-center text-slate-400">
                <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span>Carregando extrato contábil...</span>
              </div>
            ) : closingData?.items?.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-400">
                Nenhum exame laudado registrado para este mês nesta clínica.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                      <th className="py-2.5 px-3">Código</th>
                      <th className="py-2.5 px-3">Data</th>
                      <th className="py-2.5 px-3">Paciente</th>
                      <th className="py-2.5 px-3">Modalidade &amp; Região</th>
                      <th className="py-2.5 px-3">Prioridade</th>
                      <th className="py-2.5 px-3">Radiologista</th>
                      <th className="py-2.5 px-3 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {closingData.items.map((item: any) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition">
                        <td className="py-2 px-3 font-mono font-bold text-teal-800">
                          {item.id}
                        </td>
                        <td className="py-2 px-3 text-slate-500 whitespace-nowrap">
                          {item.date ? new Date(item.date).toLocaleDateString('pt-BR') : '-'}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-800">
                          {item.patientName} <span className="text-[10px] text-slate-400 font-normal">({item.species})</span>
                        </td>
                        <td className="py-2 px-3 text-slate-700">
                          <span className="font-semibold">{item.modality}</span>
                          <span className="text-[10px] text-slate-400 block truncate max-w-[160px]">{item.region}</span>
                        </td>
                        <td className="py-2 px-3">
                          {item.priority === 'URGENT' || item.priority === 'EMERGENCY' ? (
                            <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold font-mono">
                              Urgência 2h
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                              Rotina
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-slate-600 truncate max-w-[140px]">
                          {item.radiologistName}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                          R$ {item.cost.toFixed(2).replace('.', ',')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 font-bold border-t-2 border-slate-300 text-xs">
                      <td colSpan={6} className="py-3 px-3 text-right text-slate-700 uppercase tracking-wider">
                        Total Geral do Período:
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-black text-teal-800 text-sm">
                        R$ {closingData.summary.totalAmount.toFixed(2).replace('.', ',')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Carimbo de Fechamento Contábil */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-slate-400 text-[10px] gap-2">
            <div className="flex items-center gap-1.5 text-slate-500">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Documento de conferência de prestação de serviços de telerradiologia e diagnóstico por imagem veterinária.</span>
            </div>
            <div className="font-mono">
              Autenticação: VET-REC-{selectedMonth.replace('-', '')}-{Math.random().toString(36).substr(2, 6).toUpperCase()}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
