'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Activity, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  Building2, 
  Stethoscope, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (loginEmail?: string, loginPass?: string) => {
    setErrorMsg(null);
    setIsLoading(true);

    const targetEmail = loginEmail || email;
    const targetPassword = loginPass || password;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, password: targetPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Credenciais inválidas');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao entrar no portal';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuick = (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    handleLogin(quickEmail, quickPass);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-cyan-500 selection:text-white">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link href="/" className="flex items-center justify-center gap-2 group mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black text-white">
            Vet<span className="text-cyan-400">Tele</span>Rad
          </span>
        </Link>
        <h2 className="text-center text-xl font-bold tracking-tight text-slate-100">
          Acesso ao Portal de Telerradiologia
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Clínicas conveniadas, médicos radiologistas e administradores
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 sm:px-8 rounded-2xl shadow-2xl space-y-6">
          {errorMsg && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form
            onSubmit={e => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                E-mail Cadastrado
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seuemail@clinica.com.br"
                  className="block w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Senha de Acesso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/25 transition active:scale-95 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <span>Entrar no Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-4 border-t border-slate-800">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Acessar com Credenciais Demo:</span>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleQuick('clinica@vetlife.com.br', '123456')}
                className="w-full p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 rounded-xl flex items-center justify-between text-xs transition"
              >
                <div className="flex items-center gap-2 text-left">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-semibold text-slate-200">Clínica VetLife (Terceiro)</div>
                    <div className="text-[10px] text-slate-400">clinica@vetlife.com.br</div>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 font-bold px-2 py-0.5 rounded">
                  Entrar
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuick('radiologista@vetrad.com.br', '123456')}
                className="w-full p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 rounded-xl flex items-center justify-between text-xs transition"
              >
                <div className="flex items-center gap-2 text-left">
                  <Stethoscope className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="font-semibold text-slate-200">Dra. Camila (Radiologista)</div>
                    <div className="text-[10px] text-slate-400">radiologista@vetrad.com.br</div>
                  </div>
                </div>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 font-bold px-2 py-0.5 rounded">
                  Entrar
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuick('admin@vetrad.com.br', 'admin123')}
                className="w-full p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/50 rounded-xl flex items-center justify-between text-xs transition"
              >
                <div className="flex items-center gap-2 text-left">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="font-semibold text-slate-200">Dr. Ricardo (Central Admin)</div>
                    <div className="text-[10px] text-slate-400">admin@vetrad.com.br</div>
                  </div>
                </div>
                <span className="text-[10px] bg-purple-950 text-purple-300 font-bold px-2 py-0.5 rounded">
                  Entrar
                </span>
              </button>
            </div>
          </div>

          {/* Cadastro de Terceiros */}
          <div className="text-center pt-2 text-xs text-slate-400">
            Sua clínica ainda não tem cadastro?{' '}
            <Link href="/cadastro" className="text-cyan-400 hover:underline font-semibold">
              Cadastre-se aqui
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
