'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  DollarSign,
  Check,
  Loader2,
  Sparkles,
  Building2,
  Activity,
  Waves,
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2,
  RotateCcw,
  Zap,
  Calculator,
  Tag
} from 'lucide-react';
import { ClinicCustomPricing, ClinicFinancialSummary } from '@/types';
import { DEFAULT_CLINIC_PRICING } from '@/lib/pricing';

interface ClinicPricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinic: ClinicFinancialSummary | null;
  onSaved: () => void;
}

export const ClinicPricingModal: React.FC<ClinicPricingModalProps> = ({
  isOpen,
  onClose,
  clinic,
  onSaved
}) => {
  const [mounted, setMounted] = useState(false);

  // Estados de Raio-X
  const [rxBase, setRxBase] = useState<number>(45);
  const [rxRegions, setRxRegions] = useState<Record<string, number>>({});
  const [newRegionName, setNewRegionName] = useState('');
  const [newRegionPrice, setNewRegionPrice] = useState<number>(45);

  // Estados de Ultrassom
  const [usgAbdominal, setUsgAbdominal] = useState<number>(60);
  const [usgAfast, setUsgAfast] = useState<number>(50);
  const [usgTfast, setUsgTfast] = useState<number>(50);
  const [usgVetBlue, setUsgVetBlue] = useState<number>(50);
  const [usgOther, setUsgOther] = useState<number>(60);

  // Taxa de Urgência
  const [urgentFee, setUrgentFee] = useState<number>(20);

  // Simulador Rápido de Teste
  const [simModality, setSimModality] = useState<'RADIOGRAFIA' | 'ULTRASSOM'>('RADIOGRAFIA');
  const [simExamType, setSimExamType] = useState<string>('Tórax');
  const [simUrgent, setSimUrgent] = useState<boolean>(false);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sincronizar dados quando o modal abre ou a clínica muda
  useEffect(() => {
    if (isOpen && clinic) {
      const p = clinic.customPricing || DEFAULT_CLINIC_PRICING;
      setRxBase(p.radiographyBase ?? 45);
      setRxRegions(p.radiographyRegions ? { ...p.radiographyRegions } : { ...DEFAULT_CLINIC_PRICING.radiographyRegions });
      setUsgAbdominal(p.ultrasoundAbdominal ?? 60);
      setUsgAfast(p.ultrasoundAfast ?? 50);
      setUsgTfast(p.ultrasoundTfast ?? 50);
      setUsgVetBlue(p.ultrasoundVetBlue ?? 50);
      setUsgOther(p.ultrasoundOther ?? 60);
      setUrgentFee(p.urgentFee ?? 20);
      setErrorMsg(null);
      setSuccessMsg(null);
      setNewRegionName('');
    }
  }, [isOpen, clinic]);

  if (!isOpen || !mounted || !clinic) return null;

  // Presets de Preenchimento Rápido
  const applyPreset = (type: 'AVULSO' | 'PRO' | 'HOSPITAL') => {
    if (type === 'AVULSO') {
      setRxBase(45);
      setRxRegions({
        'Tórax': 45,
        'Abdômen': 45,
        'Coluna Cervical': 50,
        'Coluna Torácica': 50,
        'Coluna Lombar': 50,
        'Coluna Toracolombar': 50,
        'Coluna Completa (3 segmentos)': 85,
        'Pelve': 45,
        'Cotovelo': 45,
        'Carpo': 45,
        'Joelho': 45,
        'Rádio e Ulna': 45,
        'Crânio': 55
      });
      setUsgAbdominal(60);
      setUsgAfast(50);
      setUsgTfast(50);
      setUsgVetBlue(50);
      setUsgOther(60);
      setUrgentFee(20);
    } else if (type === 'PRO') {
      setRxBase(38);
      setRxRegions({
        'Tórax': 38,
        'Abdômen': 38,
        'Coluna Cervical': 42,
        'Coluna Torácica': 42,
        'Coluna Lombar': 42,
        'Coluna Toracolombar': 42,
        'Coluna Completa (3 segmentos)': 75,
        'Pelve': 38,
        'Cotovelo': 38,
        'Carpo': 38,
        'Joelho': 38,
        'Rádio e Ulna': 38,
        'Crânio': 48
      });
      setUsgAbdominal(52);
      setUsgAfast(42);
      setUsgTfast(42);
      setUsgVetBlue(42);
      setUsgOther(52);
      setUrgentFee(15);
    } else if (type === 'HOSPITAL') {
      setRxBase(32);
      setRxRegions({
        'Tórax': 32,
        'Abdômen': 32,
        'Coluna Cervical': 36,
        'Coluna Torácica': 36,
        'Coluna Lombar': 36,
        'Coluna Toracolombar': 36,
        'Coluna Completa (3 segmentos)': 65,
        'Pelve': 32,
        'Cotovelo': 32,
        'Carpo': 32,
        'Joelho': 32,
        'Rádio e Ulna': 32,
        'Crânio': 40
      });
      setUsgAbdominal(44);
      setUsgAfast(35);
      setUsgTfast(35);
      setUsgVetBlue(35);
      setUsgOther(44);
      setUrgentFee(10);
    }
  };

  const handleRegionPriceChange = (region: string, price: number) => {
    setRxRegions(prev => ({
      ...prev,
      [region]: price
    }));
  };

  const handleAddCustomRegion = () => {
    const trimmed = newRegionName.trim();
    if (!trimmed) return;
    setRxRegions(prev => ({
      ...prev,
      [trimmed]: Number(newRegionPrice) || rxBase
    }));
    setNewRegionName('');
  };

  const handleRemoveRegion = (region: string) => {
    setRxRegions(prev => {
      const next = { ...prev };
      delete next[region];
      return next;
    });
  };

  // Cálculo do simulador interativo em tempo real
  const calculateSimulatedPrice = () => {
    let base = 0;
    if (simModality === 'ULTRASSOM') {
      const lower = simExamType.toLowerCase();
      if (lower.includes('afast')) base = usgAfast;
      else if (lower.includes('tfast')) base = usgTfast;
      else if (lower.includes('vetblue') || lower.includes('vet blue')) base = usgVetBlue;
      else if (lower.includes('abdominal')) base = usgAbdominal;
      else base = usgOther;
    } else {
      const matched = Object.keys(rxRegions).find(k => 
        k.toLowerCase().includes(simExamType.toLowerCase()) || simExamType.toLowerCase().includes(k.toLowerCase())
      );
      base = matched && rxRegions[matched] !== undefined ? rxRegions[matched] : rxBase;
    }

    if (simUrgent) base += urgentFee;
    return Number(base.toFixed(2));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const customPricingPayload: ClinicCustomPricing = {
      radiographyBase: Number(rxBase),
      radiographyRegions: rxRegions,
      ultrasoundAbdominal: Number(usgAbdominal),
      ultrasoundAfast: Number(usgAfast),
      ultrasoundTfast: Number(usgTfast),
      ultrasoundVetBlue: Number(usgVetBlue),
      ultrasoundOther: Number(usgOther),
      urgentFee: Number(urgentFee)
    };

    try {
      const res = await fetch('/api/financial/analytics', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-pricing',
          clinicId: clinic.clinicId,
          customPricing: customPricingPayload
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao salvar tabela de preços da clínica.');
      }

      setSuccessMsg('Tabela de preços personalizada salva com sucesso!');
      onSaved();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro inesperado ao salvar.');
    } finally {
      setIsSaving(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl shadow-slate-950/80 text-slate-100 my-auto overflow-hidden">
        
        {/* Cabeçalho */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
                  Tabela de Preços por Laudo
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                  Cobrança Personalizada
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-200 font-semibold">{clinic.clinicName}</span>
                <span>• {clinic.contactName} ({clinic.uf || 'SP'})</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition cursor-pointer"
            title="Fechar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Feedback messages */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-4 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Preenchimento Rápido com Presets */}
        <div className="px-6 pt-5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Carregar modelo padrão rápido:</span>
          </span>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => applyPreset('AVULSO')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold transition cursor-pointer active:scale-95"
            >
              Tabela Padrão (Avulso)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('PRO')}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold transition cursor-pointer active:scale-95"
            >
              Plano Pro (-15%)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('HOSPITAL')}
              className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold transition cursor-pointer active:scale-95"
            >
              Hospital 24h (-28%)
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[68vh] overflow-y-auto">
          
          {/* SEÇÃO 1: RAIO-X (POR REGIÃO ANATÔMICA) */}
          <div className="bg-slate-950/60 p-5 rounded-3xl border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    1. Laudos de Raio-X (Valores por Região)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Defina o valor base e valores específicos para cada segmento radiografado
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400">Preço Base Geral:</span>
                <span className="text-xs font-mono font-bold text-cyan-400">R$</span>
                <input
                  type="number"
                  step="0.50"
                  min="0"
                  value={rxBase}
                  onChange={e => setRxBase(parseFloat(e.target.value) || 0)}
                  className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-0.5 text-xs text-white text-right font-mono font-bold outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Grid de Regiões de Raio-X */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              {Object.entries(rxRegions).map(([regName, price]) => (
                <div
                  key={regName}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-xs text-slate-200 font-semibold truncate" title={regName}>
                      {regName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs font-mono text-cyan-400 font-bold">R$</span>
                    <input
                      type="number"
                      step="0.50"
                      min="0"
                      value={price}
                      onChange={e => handleRegionPriceChange(regName, parseFloat(e.target.value) || 0)}
                      className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-right font-mono font-bold outline-none focus:border-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveRegion(regName)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded-md transition cursor-pointer"
                      title="Remover região customizada"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Adicionar Região Personalizada */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                placeholder="Nome da nova região (Ex: Ombro e Escápula, Dígitos...)"
                value={newRegionName}
                onChange={e => setNewRegionName(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-cyan-500"
              />
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs">
                  <span className="text-cyan-400 font-mono font-bold">R$</span>
                  <input
                    type="number"
                    step="0.50"
                    min="0"
                    value={newRegionPrice}
                    onChange={e => setNewRegionPrice(parseFloat(e.target.value) || 0)}
                    className="w-16 bg-transparent text-white font-mono font-bold text-right outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddCustomRegion}
                  disabled={!newRegionName.trim()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-xs font-bold transition cursor-pointer active:scale-95 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Região</span>
                </button>
              </div>
            </div>
          </div>

          {/* SEÇÃO 2: ULTRASSONOGRAFIA (POR PROTOCOLO) */}
          <div className="bg-slate-950/60 p-5 rounded-3xl border border-slate-800/80 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                <Waves className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  2. Laudos de Ultrassonografia (Valores por Protocolo)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Diferencie os valores entre varredura abdominal completa e protocolos de emergência (POCUS)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              {/* Ultrassom Abdominal Total */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div>
                  <span className="text-xs font-bold text-teal-300 block">Ultrassom Abdominal</span>
                  <span className="text-[10px] text-slate-400">Varredura completa rotineira</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                  <span className="text-[11px] text-slate-400">Valor Laudo:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-mono text-teal-400 font-bold">R$</span>
                    <input
                      type="number"
                      step="0.50"
                      min="0"
                      value={usgAbdominal}
                      onChange={e => setUsgAbdominal(parseFloat(e.target.value) || 0)}
                      className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-right font-mono font-bold outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Protocolo AFAST */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div>
                  <span className="text-xs font-bold text-teal-300 block">Protocolo AFAST</span>
                  <span className="text-[10px] text-slate-400">Trauma e líquido livre abdominal</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                  <span className="text-[11px] text-slate-400">Valor Laudo:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-mono text-teal-400 font-bold">R$</span>
                    <input
                      type="number"
                      step="0.50"
                      min="0"
                      value={usgAfast}
                      onChange={e => setUsgAfast(parseFloat(e.target.value) || 0)}
                      className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-right font-mono font-bold outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Protocolo TFAST */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div>
                  <span className="text-xs font-bold text-teal-300 block">Protocolo TFAST</span>
                  <span className="text-[10px] text-slate-400">Trauma torácico e efusão pleural</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                  <span className="text-[11px] text-slate-400">Valor Laudo:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-mono text-teal-400 font-bold">R$</span>
                    <input
                      type="number"
                      step="0.50"
                      min="0"
                      value={usgTfast}
                      onChange={e => setUsgTfast(parseFloat(e.target.value) || 0)}
                      className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-right font-mono font-bold outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Protocolo Vet BLUE */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div>
                  <span className="text-xs font-bold text-teal-300 block">Protocolo Vet BLUE</span>
                  <span className="text-[10px] text-slate-400">Varredura pulmonar de emergência</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                  <span className="text-[11px] text-slate-400">Valor Laudo:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-mono text-teal-400 font-bold">R$</span>
                    <input
                      type="number"
                      step="0.50"
                      min="0"
                      value={usgVetBlue}
                      onChange={e => setUsgVetBlue(parseFloat(e.target.value) || 0)}
                      className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-right font-mono font-bold outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Outros Protocolos USG */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 sm:col-span-2 md:col-span-2">
                <div>
                  <span className="text-xs font-bold text-teal-300 block">Outros Protocolos / Especiais</span>
                  <span className="text-[10px] text-slate-400">USG Cervical, Gestacional, Oftálmico ou Músculo-esquelético</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                  <span className="text-[11px] text-slate-400">Valor Laudo:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-mono text-teal-400 font-bold">R$</span>
                    <input
                      type="number"
                      step="0.50"
                      min="0"
                      value={usgOther}
                      onChange={e => setUsgOther(parseFloat(e.target.value) || 0)}
                      className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-right font-mono font-bold outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SEÇÃO 3: TAXA ADICIONAL DE URGÊNCIA */}
          <div className="bg-slate-950/60 p-5 rounded-3xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold text-white block">
                  Taxa Adicional de Urgência / Plantão 24h
                </span>
                <span className="text-[11px] text-slate-400">
                  Valor somado automaticamente quando a clínica solicitar laudo em caráter de urgência (SLA prioritário)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto bg-slate-900 px-3.5 py-2 rounded-2xl border border-slate-800">
              <span className="text-xs font-mono text-amber-400 font-bold">+ R$</span>
              <input
                type="number"
                step="0.50"
                min="0"
                value={urgentFee}
                onChange={e => setUrgentFee(parseFloat(e.target.value) || 0)}
                className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-right font-mono font-bold outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* SIMULADOR DE COBRANÇA EM TEMPO REAL */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  Simulação de Cobrança em Tempo Real
                </span>
                <span className="text-[11px] text-slate-400">
                  Teste o valor exato que o sistema debitará desta clínica
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={simModality}
                onChange={e => {
                  const m = e.target.value as 'RADIOGRAFIA' | 'ULTRASSOM';
                  setSimModality(m);
                  setSimExamType(m === 'ULTRASSOM' ? 'Ultrassom Abdominal' : 'Tórax');
                }}
                className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-cyan-500"
              >
                <option value="RADIOGRAFIA">Raio-X</option>
                <option value="ULTRASSOM">Ultrassom</option>
              </select>

              <select
                value={simExamType}
                onChange={e => setSimExamType(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-cyan-500 max-w-[170px]"
              >
                {simModality === 'ULTRASSOM' ? (
                  <>
                    <option value="Ultrassom Abdominal">Abdominal Total</option>
                    <option value="AFAST">AFAST</option>
                    <option value="TFAST">TFAST</option>
                    <option value="VetBlue">Vet BLUE</option>
                    <option value="Outros">Outros Protocolos</option>
                  </>
                ) : (
                  <>
                    <option value="Tórax">Tórax</option>
                    <option value="Abdômen">Abdômen</option>
                    <option value="Coluna Cervical">Coluna Cervical</option>
                    <option value="Coluna Torácica">Coluna Torácica</option>
                    <option value="Coluna Lombar">Coluna Lombar</option>
                    <option value="Coluna Completa (3 segmentos)">Coluna Completa</option>
                    <option value="Pelve">Pelve</option>
                    <option value="Cotovelo">Cotovelo</option>
                    <option value="Joelho">Joelho</option>
                    <option value="Crânio">Crânio</option>
                    {Object.keys(rxRegions).filter(k => !['Tórax','Abdômen','Coluna Cervical','Coluna Torácica','Coluna Lombar','Coluna Completa (3 segmentos)','Pelve','Cotovelo','Joelho','Crânio'].includes(k)).map(k => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </>
                )}
              </select>

              <label className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={simUrgent}
                  onChange={e => setSimUrgent(e.target.checked)}
                  className="accent-amber-400 rounded"
                />
                <span>Urgência</span>
              </label>

              <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-black text-sm">
                R$ {calculateSimulatedPrice().toFixed(2).replace('.', ',')}
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => applyPreset('AVULSO')}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Valores Padrão</span>
            </button>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-emerald-500/25 transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Salvando Tabela...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Salvar Tabela de Preços</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
