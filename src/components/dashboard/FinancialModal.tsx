'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  QrCode, 
  CheckCircle2, 
  Copy, 
  Check, 
  Sparkles, 
  Clock, 
  AlertCircle,
  FileText,
  DollarSign
} from 'lucide-react';
import { FinancialTransaction, User } from '@/types';

interface FinancialModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onBalanceUpdated: (newBalance: number) => void;
}

export const FinancialModal: React.FC<FinancialModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onBalanceUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'EXTRATO' | 'RECARGA' | 'PRECOS'>('EXTRATO');
  const [balance, setBalance] = useState<number>(currentUser.balance ?? 0);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Estados de Recarga
  const [selectedPackage, setSelectedPackage] = useState<number>(300);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CREDIT_CARD'>('PIX');
  const [isProcessing, setIsProcessing] = useState(false);
  const [rechargeSuccess, setRechargeSuccess] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);

  const pixKey = "00020126580014br.gov.bcb.pix0136vettelerad-financas-pix-99205204000053039865405";

  useEffect(() => {
    if (isOpen) {
      loadFinancialData();
    }
  }, [isOpen]);

  const loadFinancialData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/financial');
      const data = await res.json();
      if (res.ok) {
        setBalance(data.balance);
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error('Erro ao buscar dados financeiros:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const effectiveAmount = customAmount ? parseFloat(customAmount) || 0 : selectedPackage;

  const handleConfirmPayment = async () => {
    if (effectiveAmount <= 0) return;
    setIsProcessing(true);
    try {
      const res = await fetch('/api/financial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'recharge',
          amount: effectiveAmount,
          paymentMethod
        })
      });
      const data = await res.json();
      if (res.ok) {
        setBalance(data.newBalance);
        onBalanceUpdated(data.newBalance);
        setRechargeSuccess(true);
        loadFinancialData();
        setTimeout(() => {
          setRechargeSuccess(false);
          setActiveTab('EXTRATO');
        }, 2200);
      }
    } catch (err) {
      console.error('Erro ao recarregar:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Carteira &amp; Faturamento</span>
                <span className="text-xs font-normal text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {currentUser.clinicName || 'Clínica Conveniada'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">Controle de saldo, recargas e faturamento de laudos</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Saldo em destaque */}
        <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Saldo Atual de Créditos
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white font-mono tracking-tight">
                R$ {balance.toFixed(2).replace('.', ',')}
              </span>
              <span className="text-xs text-emerald-400 font-medium">
                (Aprox. {Math.floor(balance / 45)} laudos de Raio-X ou {Math.floor(balance / 60)} de USG)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('RECARGA')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 transition active:scale-95 cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Recarregar Saldo</span>
            </button>
          </div>
        </div>

        {/* Abas */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/40 text-xs">
          <button
            onClick={() => setActiveTab('EXTRATO')}
            className={`py-3 px-4 font-bold transition border-b-2 cursor-pointer ${
              activeTab === 'EXTRATO'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Extrato de Movimentações ({transactions.length})
          </button>
          <button
            onClick={() => setActiveTab('RECARGA')}
            className={`py-3 px-4 font-bold transition border-b-2 cursor-pointer ${
              activeTab === 'RECARGA'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Comprar Créditos (PIX / Cartão)
          </button>
          <button
            onClick={() => setActiveTab('PRECOS')}
            className={`py-3 px-4 font-bold transition border-b-2 cursor-pointer ${
              activeTab === 'PRECOS'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Tabela de Preços por Laudo
          </button>
        </div>

        {/* Conteúdo das Abas */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'EXTRATO' && (
            <div className="space-y-3">
              {isLoading ? (
                <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs">Carregando movimentações...</span>
                </div>
              ) : transactions.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  Nenhuma transação registrada até o momento.
                </div>
              ) : (
                transactions.map(tx => {
                  const isCredit = tx.type === 'CREDIT_PURCHASE';
                  return (
                    <div
                      key={tx.id}
                      className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between gap-4 hover:border-slate-700 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            isCredit
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-200">{tx.description}</div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>{new Date(tx.createdAt).toLocaleString('pt-BR')}</span>
                            <span>•</span>
                            <span className="uppercase font-mono">{tx.paymentMethod}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-sm font-black font-mono ${
                            isCredit ? 'text-emerald-400' : 'text-slate-300'
                          }`}
                        >
                          {isCredit ? '+' : '-'} R$ {tx.amount.toFixed(2).replace('.', ',')}
                        </span>
                        <div className="text-[10px] text-emerald-500 flex items-center justify-end gap-1 font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Concluído</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'RECARGA' && (
            <div className="space-y-6">
              {rechargeSuccess ? (
                <div className="py-12 text-center space-y-3 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-6">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                  <h3 className="text-base font-bold text-white">Pagamento Confirmado com Sucesso!</h3>
                  <p className="text-xs text-slate-300">
                    O saldo de <strong>R$ {effectiveAmount.toFixed(2).replace('.', ',')}</strong> foi adicionado imediatamente à sua conta.
                  </p>
                </div>
              ) : (
                <>
                  {/* Escolha do Pacote */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                      1. Selecione o Pacote de Créditos
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { amount: 150, title: 'Iniciante', badge: '~3 laudos RX' },
                        { amount: 300, title: 'Recomendado', badge: '~7 laudos RX', best: true },
                        { amount: 600, title: 'Hospital Pro', badge: '~14 laudos RX' }
                      ].map(pkg => (
                        <button
                          key={pkg.amount}
                          type="button"
                          onClick={() => {
                            setSelectedPackage(pkg.amount);
                            setCustomAmount('');
                          }}
                          className={`p-4 rounded-xl border text-left transition cursor-pointer relative ${
                            selectedPackage === pkg.amount && !customAmount
                              ? 'bg-cyan-950/30 border-cyan-500 ring-1 ring-cyan-500'
                              : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {pkg.best && (
                            <span className="absolute -top-2.5 right-3 bg-cyan-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                              Mais Escolhido
                            </span>
                          )}
                          <div className="text-xs text-slate-400 font-semibold">{pkg.title}</div>
                          <div className="text-xl font-black text-white font-mono my-1">
                            R$ {pkg.amount},00
                          </div>
                          <div className="text-[11px] text-emerald-400 font-medium">{pkg.badge}</div>
                        </button>
                      ))}
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs text-slate-400">Ou digite outro valor:</span>
                      <div className="relative flex-1 max-w-[160px]">
                        <span className="absolute left-2.5 top-2 text-xs text-slate-500 font-bold">R$</span>
                        <input
                          type="number"
                          placeholder="Valor livre"
                          value={customAmount}
                          onChange={e => {
                            setCustomAmount(e.target.value);
                          }}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-2 py-1.5 text-xs text-white outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Método de Pagamento */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                      2. Forma de Pagamento
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('PIX')}
                        className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition cursor-pointer ${
                          paymentMethod === 'PIX'
                            ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                            : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <QrCode className="w-4 h-4" />
                        <span>PIX Instantâneo (Liberação Imediata)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('CREDIT_CARD')}
                        className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition cursor-pointer ${
                          paymentMethod === 'CREDIT_CARD'
                            ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300'
                            : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Cartão de Crédito Corporativo</span>
                      </button>
                    </div>
                  </div>

                  {/* Detalhes do Pagamento (PIX) */}
                  {paymentMethod === 'PIX' && (
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
                      {/* SVG Mock QR Code */}
                      <div className="w-28 h-28 bg-white p-2 rounded-xl flex items-center justify-center shrink-0">
                        <QrCode className="w-24 h-24 text-slate-900" />
                      </div>

                      <div className="space-y-2 flex-1 w-full text-xs">
                        <div className="text-slate-300 font-semibold">
                          Total a Pagar: <strong className="text-emerald-400 text-sm font-mono">R$ {effectiveAmount.toFixed(2).replace('.', ',')}</strong>
                        </div>
                        <p className="text-slate-400 text-[11px]">
                          Escaneie o QR Code no app do seu banco ou use a chave PIX copia-e-cola abaixo:
                        </p>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={pixKey}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-[10px] text-slate-400 font-mono"
                          />
                          <button
                            type="button"
                            onClick={handleCopyPix}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0"
                          >
                            {copiedPix ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedPix ? 'Copiado' : 'Copiar'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'CREDIT_CARD' && (
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <label className="block text-slate-400 mb-1">Número do Cartão</label>
                          <input
                            type="text"
                            defaultValue="•••• •••• •••• 8842"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1">Validade</label>
                          <input
                            type="text"
                            defaultValue="11/29"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1">CVV</label>
                          <input
                            type="text"
                            defaultValue="•••"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleConfirmPayment}
                      disabled={isProcessing || effectiveAmount <= 0}
                      className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Confirmando Transação...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Simular Pagamento Aprovado (R$ {effectiveAmount.toFixed(2).replace('.', ',')})</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'PRECOS' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Radiografia */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>Radiografia Digital (Raio-X)</span>
                  </div>
                  <div className="space-y-2 text-slate-300">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span>Laudo Rotina (até 12h)</span>
                      <strong className="text-white font-mono text-sm">R$ 45,00</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Plantão Urgência (até 2h)</span>
                      <strong className="text-cyan-400 font-mono text-sm">R$ 65,00</strong>
                    </div>
                  </div>
                </div>

                {/* Ultrassom */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>Ultrassonografia Veterinária (USG)</span>
                  </div>
                  <div className="space-y-2 text-slate-300">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span>Laudo Rotina (até 12h)</span>
                      <strong className="text-white font-mono text-sm">R$ 60,00</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Plantão Urgência (até 2h)</span>
                      <strong className="text-teal-400 font-mono text-sm">R$ 85,00</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-400 text-[11px] leading-relaxed">
                💡 <strong>Como funciona o débito:</strong> Quando sua clínica submete um novo exame, a taxa correspondente é debitada automaticamente do seu saldo de créditos. Clínicas com alto volume mensal (&gt; 50 exames) contam com faturamento quinzenal via boleto bancário no plano Hospital 24h.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <div>Suporte Financeiro: financeiro@vettelerad.com.br</div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
