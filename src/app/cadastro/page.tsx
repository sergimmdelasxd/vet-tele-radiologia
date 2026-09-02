'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Activity, 
  Building2, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  FileText, 
  MapPin, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';

export default function CadastroPage() {
  const router = useRouter();

  const [clinicName, setClinicName] = useState('');
  const [name, setName] = useState(''); // Nome do Responsável Técnico
  const [crmv, setCrmv] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [phone, setPhone] = useState('');
  const [uf, setUf] = useState('SP');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password.length < 6) {
      setErrorMsg('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicName,
          name,
          crmv,
          cnpj,
          phone,
          uf,
          email,
          password
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao realizar cadastro');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao cadastrar';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-cyan-500 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10 text-center px-4">
        <Link href="/" className="inline-flex items-center justify-center gap-2 group mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black text-white">
            Vet<span className="text-cyan-400">Tele</span>Rad
          </span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Cadastro de Clínica ou Hospital Parceiro
        </h2>
        <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto">
          Cadastre seu estabelecimento veterinário e comece a enviar exames para nossa equipe de especialistas hoje mesmo.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10 px-4">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 sm:px-8 rounded-2xl shadow-2xl space-y-6">
          {errorMsg && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-200">
            {/* Dados do Estabelecimento */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
              <h3 className="font-bold text-cyan-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Dados da Clínica / Hospital
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1">Nome Fantasia do Estabelecimento *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Clínica Veterinária São Francisco 24h"
                    value={clinicName}
                    onChange={e => setClinicName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">CNPJ</label>
                  <input
                    type="text"
                    placeholder="00.000.000/0001-00"
                    value={cnpj}
                    onChange={e => setCnpj(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="(11) 99999-8888"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Responsável Técnico */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
              <h3 className="font-bold text-cyan-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Médico Veterinário Responsável
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Dra. Mariana Costa"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">CRMV e UF *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: CRMV-SP 45.123"
                    value={crmv}
                    onChange={e => setCrmv(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Dados de Acesso */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
              <h3 className="font-bold text-cyan-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Credenciais de Acesso ao Portal
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1">E-mail de Login *</label>
                  <input
                    type="email"
                    required
                    placeholder="contato@minhaclinica.com.br"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1">Crie uma Senha Segura *</label>
                  <input
                    type="password"
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-cyan-500"
                  />
                </div>
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
                  <span>Cadastrando...</span>
                </>
              ) : (
                <>
                  <span>Concluir Cadastro & Acessar Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 text-xs text-slate-400">
            Já possui cadastro?{' '}
            <Link href="/login" className="text-cyan-400 hover:underline font-semibold">
              Fazer Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
