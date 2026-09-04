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
  DollarSign,
  FileSpreadsheet
} from 'lucide-react';
import { FinancialTransaction, User } from '@/types';
import { MonthlyClosingModal } from '@/components/financial/MonthlyClosingModal';

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
  const [showClosing, setShowClosing] = useState(false);

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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shadow-2xs">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Carteira & Faturamento</span>
                <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                  {currentUser.clinicName || 'Clínica Conveniada'}
                </span>
              </h2>
              <p className="text-xs text-slate-500">Controle de saldo, recargas e faturamento de laudos</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Saldo em destaque */}
        <div className="p-6 bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-sky-50/80 border-b border-teal-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1">
              Saldo Atual de Créditos
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                R$ {balance.toFixed(2).replace('.', ',')}
              </span>
              <span className="text-xs text-teal-700 font-bold">
                (Aprox. {Math.floor(balance / 45)} laudos de Raio-X ou {Math.floor(balance / 60)} de USG)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('RECARGA')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Recarregar Saldo</span>
            </button>
          </div>
        </div>

        {/* Abas */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/80 text-xs">
          <button
            onClick={() => setActiveTab('EXTRATO')}
            className={`py-3 px-4 font-bold transition border-b-2 cursor-pointer ${
              activeTab === 'EXTRATO'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Extrato de Movimentações ({transactions.length})
          </button>
          <button
            onClick={() => setActiveTab('RECARGA')}
            className={`py-3 px-4 font-bold transition border-b-2 cursor-pointer ${
              activeTab === 'RECARGA'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Comprar Créditos (PIX Instantâneo)
          </button>
          <button
            onClick={() => setActiveTab('PRECOS')}
            className={`py-3 px-4 font-bold transition border-b-2 cursor-pointer ${
              activeTab === 'PRECOS'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Tabela de Preços por Laudo
          </button>
        </div>

        {/* Conteúdo das Abas */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {activeTab === 'EXTRATO' && (
            <div className="space-y-3">
              {isLoading ? (
                <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs">Carregando movimentações...</span>
                </div>
              ) : transactions.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Nenhuma transação registrada até o momento.
                </div>
              ) : (
                transactions.map(tx => {
                  const isCredit = tx.type === 'CREDIT_PURCHASE';
                  return (
                    <div
                      key={tx.id}
                      className="p-3.5 bg-white border border-slate-200/90 rounded-2xl flex items-center justify-between gap-4 hover:border-teal-300 transition shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            isCredit
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800">{tx.description}</div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>{new Date(tx.createdAt).toLocaleString('pt-BR')}</span>
                            <span>•</span>
                            <span className="uppercase font-mono font-semibold">{tx.paymentMethod}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-sm font-black font-mono ${
                            isCredit ? 'text-emerald-700' : 'text-slate-800'
                          }`}
                        >
                          {isCredit ? '+' : '-'} R$ {tx.amount.toFixed(2).replace('.', ',')}
                        </span>
                        <div className="text-[10px] text-emerald-700 flex items-center justify-end gap-1 font-semibold">
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
                <div className="py-12 text-center space-y-3 bg-emerald-50 border border-emerald-200 rounded-3xl p-6">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                  <h3 className="text-base font-bold text-slate-900">Pagamento Confirmado com Sucesso!</h3>
                  <p className="text-xs text-slate-600">
                    O saldo de <strong className="text-emerald-800">R$ {effectiveAmount.toFixed(2).replace('.', ',')}</strong> foi adicionado imediatamente à sua conta.
                  </p>
                </div>
              ) : (
                <>
                  {/* Escolha do Pacote */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
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
                          className={`p-4 rounded-2xl border text-left transition cursor-pointer relative ${
                            selectedPackage === pkg.amount && !customAmount
                              ? 'bg-teal-50/80 border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                          }`}
                        >
                          {pkg.best && (
                            <span className="absolute -top-2.5 right-3 bg-teal-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase shadow-xs">
                              Mais Escolhido
                            </span>
                          )}
                          <div className="text-xs text-slate-500 font-semibold">{pkg.title}</div>
                          <div className="text-xl font-black text-slate-900 font-mono my-1">
                            R$ {pkg.amount},00
                          </div>
                          <div className="text-[11px] text-teal-800 font-bold">{pkg.badge}</div>
                        </button>
                      ))}
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs text-slate-600">Ou digite outro valor:</span>
                      <div className="relative flex-1 max-w-[160px]">
                        <span className="absolute left-2.5 top-2 text-xs text-slate-400 font-bold">R$</span>
                        <input
                          type="number"
                          placeholder="Valor livre"
                          value={customAmount}
                          onChange={e => {
                            setCustomAmount(e.target.value);
                          }}
                          className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-2 py-1.5 text-xs text-slate-800 outline-none focus:border-teal-500 shadow-2xs font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Método de Pagamento */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                      2. Forma de Pagamento
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('PIX')}
                        className={`p-3 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition cursor-pointer ${
                          paymentMethod === 'PIX'
                            ? 'bg-teal-50 border-teal-500 text-teal-800 ring-2 ring-teal-500/20 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs'
                        }`}
                      >
                        <QrCode className="w-4 h-4 text-teal-600" />
                        <span>PIX Instantâneo (Liberação Imediata)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('CREDIT_CARD')}
                        className={`p-3 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition cursor-pointer ${
                          paymentMethod === 'CREDIT_CARD'
                            ? 'bg-teal-50 border-teal-500 text-teal-800 ring-2 ring-teal-500/20 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs'
                        }`}
                      >
                        <CreditCard className="w-4 h-4 text-slate-600" />
                        <span>Cartão Corporativo</span>
                      </button>
                    </div>
                  </div>

                  {/* Detalhes do Pagamento (PIX) */}
                  {paymentMethod === 'PIX' && (
                    <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                      {/* SVG Mock QR Code */}
                      <div className="w-28 h-28 bg-white p-2 rounded-2xl border border-slate-200/80 flex items-center justify-center shrink-0 shadow-xs">
                        <QrCode className="w-24 h-24 text-slate-800" />
                      </div>

                      <div className="space-y-2 flex-1 w-full text-xs">
                        <div className="text-slate-700 font-semibold">
                          Total a Pagar: <strong className="text-teal-800 text-sm font-mono font-black">R$ {effectiveAmount.toFixed(2).replace('.', ',')}</strong>
                        </div>
                        <p className="text-slate-500 text-[11px]">
                          Escaneie o QR Code no app do seu banco ou use a chave PIX copia-e-cola abaixo:
                        </p>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={pixKey}
                            className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-[10px] text-slate-600 font-mono shadow-2xs"
                          />
                          <button
                            type="button"
                            onClick={handleCopyPix}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer transition shadow-2xs"
                          >
                            {copiedPix ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedPix ? 'Copiado' : 'Copiar'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'CREDIT_CARD' && (
                    <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <label className="block text-slate-600 mb-1 font-semibold">Número do Cartão</label>
                          <input
                            type="text"
                            defaultValue="•••• •••• •••• 8842"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none shadow-2xs"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-600 mb-1 font-semibold">Validade</label>
                          <input
                            type="text"
                            defaultValue="11/29"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none shadow-2xs"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-600 mb-1 font-semibold">CVV</label>
                          <input
                            type="text"
                            defaultValue="•••"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none shadow-2xs"
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
                      className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl shadow-xs text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition active:scale-98"
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
                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-sky-800 font-bold text-sm">
                    <Sparkles className="w-4 h-4 text-sky-600" />
                    <span>Radiografia Digital (Raio-X)</span>
                  </div>
                  <div className="space-y-2 text-slate-700">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span>Laudo Rotina (até 12h)</span>
                      <strong className="text-slate-900 font-mono text-sm">R$ 45,00</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Plantão Urgência (até 2h)</span>
                      <strong className="text-rose-700 font-mono text-sm">R$ 65,00</strong>
                    </div>
                  </div>
                </div>

                {/* Ultrassom */}
                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-teal-800 font-bold text-sm">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <span>Ultrassonografia Veterinária (USG)</span>
                  </div>
                  <div className="space-y-2 text-slate-700">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span>Laudo Rotina (até 12h)</span>
                      <strong className="text-slate-900 font-mono text-sm">R$ 60,00</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Plantão Urgência (até 2h)</span>
                      <strong className="text-rose-700 font-mono text-sm">R$ 85,00</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-teal-50/60 border border-teal-200/80 rounded-2xl text-slate-700 text-[11px] leading-relaxed">
                💡 <strong>Como funciona o débito:</strong> Quando sua clínica submete um novo exame, a taxa correspondente é debitada automaticamente do seu saldo de créditos. Clínicas com alto volume mensal contam com faturamento quinzenal via boleto bancário no plano Hospital 24h.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div>Suporte Financeiro: financeiro@vettelerad.com.br</div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowClosing(true)}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-xl font-bold cursor-pointer transition flex items-center gap-1.5 shadow-2xs"
              title="Abrir Demonstrativo de Fechamento e Exportar Planilha / PDF"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
              <span>Fechamento Mensal (.CSV / PDF)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-semibold cursor-pointer transition"
            >
              Fechar
            </button>
          </div>
        </div>

      </div>

      {showClosing && (
        <MonthlyClosingModal
          user={currentUser}
          onClose={() => setShowClosing(false)}
        />
      )}
    </div>
  );
};
