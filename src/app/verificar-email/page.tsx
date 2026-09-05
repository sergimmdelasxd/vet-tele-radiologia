'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Mail, 
  ArrowRight, 
  Loader2,
  RefreshCw
} from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'LOADING' | 'SUCCESS' | 'ERROR'>('LOADING');
  const [message, setMessage] = useState<string>('');

  // Estados para reenvio de confirmação
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('ERROR');
      setMessage('Nenhum código de confirmação foi fornecido no link.');
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Falha ao confirmar e-mail');
        }

        setStatus('SUCCESS');
        setMessage(data.message || 'Seu e-mail foi confirmado com sucesso!');
      } catch (err: any) {
        setStatus('ERROR');
        setMessage(err.message || 'Link de confirmação inválido ou expirado.');
      }
    };

    verify();
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;

    setIsResending(true);
    setResendSuccess(null);
    setResendError(null);

    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao reenviar e-mail');
      }

      setResendSuccess(data.message || 'Novo link enviado com sucesso! Verifique sua caixa de entrada.');
    } catch (err: any) {
      setResendError(err.message || 'Falha ao reenviar link de verificação.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 py-8 px-6 sm:px-8 rounded-2xl shadow-2xl space-y-6 text-center">
      {status === 'LOADING' && (
        <div className="py-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-cyan-950/60 border border-cyan-800/80 flex items-center justify-center mx-auto text-cyan-400">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <h3 className="text-lg font-bold text-white">Validando seu e-mail...</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Aguarde um instante enquanto confirmamos sua conta em nossos servidores.
          </p>
        </div>
      )}

      {status === 'SUCCESS' && (
        <div className="py-6 space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-600/80 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-900/30">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <h3 className="text-xl font-black text-white">Conta Ativada com Sucesso!</h3>
            <p className="text-xs text-slate-300 mt-2 max-w-sm mx-auto">
              {message}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Agora você tem acesso completo para enviar exames de Raio-X e Ultrassom e receber laudos oficiais.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/25 transition active:scale-95"
            >
              <span>Fazer Login no Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {status === 'ERROR' && (
        <div className="py-4 space-y-5 text-left">
          <div className="flex items-center gap-3 p-4 bg-rose-950/40 border border-rose-900/70 rounded-xl text-rose-300">
            <AlertCircle className="w-6 h-6 shrink-0 text-rose-400" />
            <div>
              <h4 className="font-bold text-xs text-rose-200">Não foi possível confirmar o e-mail</h4>
              <p className="text-xs text-rose-300/90 mt-0.5">{message}</p>
            </div>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-cyan-400" />
              <span>Solicitar Novo Link de Confirmação</span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Caso seu link tenha expirado (validade de 24h), informe seu e-mail abaixo para receber um novo:
            </p>

            {resendSuccess && (
              <div className="p-3 bg-emerald-950/50 border border-emerald-800 text-emerald-300 rounded-lg text-xs font-medium">
                {resendSuccess}
              </div>
            )}

            {resendError && (
              <div className="p-3 bg-rose-950/50 border border-rose-800 text-rose-300 rounded-lg text-xs font-medium">
                {resendError}
              </div>
            )}

            <form onSubmit={handleResend} className="space-y-3">
              <input
                type="email"
                required
                placeholder="seuemail@clinica.com.br"
                value={resendEmail}
                onChange={e => setResendEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
              />

              <button
                type="submit"
                disabled={isResending}
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition disabled:opacity-50 cursor-pointer"
              >
                {isResending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Reenviando...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Enviar Novo Link</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="text-center pt-2">
            <Link href="/login" className="text-xs text-cyan-400 hover:underline">
              Voltar para a tela de Login
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-cyan-500 selection:text-white">
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <Link href="/" className="inline-flex items-center justify-center gap-2 group mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black text-white">
            Vet<span className="text-cyan-400">Tele</span>Rad
          </span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <Suspense fallback={
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center text-slate-400 text-xs">
            Carregando verificação...
          </div>
        }>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
