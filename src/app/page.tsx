'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Activity, 
  ShieldCheck, 
  Clock, 
  Stethoscope, 
  Building2, 
  CheckCircle2, 
  ArrowRight, 
  Flame, 
  FileText, 
  Sparkles, 
  Eye, 
  Heart,
  Layers,
  ChevronRight,
  Dog,
  Cat
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { User } from '@/types';

export default function HomePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setCurrentUser(data.user);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleQuickLogin = async (email: string, roleName: string) => {
    try {
      const password = email === 'admin@vetrad.com.br' ? 'admin123' : '123456';
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      <Navbar user={currentUser} />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-800">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-600/20 to-blue-600/10 blur-[130px] pointer-events-none" />
        <div className="absolute top-12 left-10 w-72 h-72 bg-emerald-500/10 blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Telerradiologia &amp; Teleultrassonografia Veterinária Especializada</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Laudos de Raio-X e Ultrassom com{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">
                Agilidade e Precisão
              </span>
            </h1>

            {/* Subhead */}
            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto">
              Conecte sua clínica ou hospital a médicos veterinários radiologistas e ultrassonografistas de plantão.
              Pedidos e laudos completos de <strong>Radiografia Digital e Ultrassonografia (USG)</strong> com visualizador web e emissão timbrada em até <strong>2 horas</strong>.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/cadastro"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-cyan-500/25 transition active:scale-95"
              >
                <span>Cadastrar Minha Clínica</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <Link
                href={currentUser ? "/dashboard" : "/login"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm rounded-xl transition"
              >
                <Building2 className="w-4 h-4 text-cyan-400" />
                <span>{currentUser ? "Ir para o Painel" : "Acessar Portal do Parceiro"}</span>
              </Link>
            </div>

            {/* Quick Demo Access (1-Click Test Drive) */}
            <div className="pt-6 border-t border-slate-800/80 max-w-xl mx-auto">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                ⚡ Teste Imediato (Acesso Demo em 1 clique)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  onClick={() => handleQuickLogin('clinica@vetlife.com.br', 'Clínica Parceira')}
                  className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-emerald-500/30 hover:border-emerald-500 rounded-xl text-left transition group flex flex-col"
                >
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">Terceiro / Clínica</span>
                  <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-300">Clínica VetLife</span>
                  <span className="text-[10px] text-slate-400">Solicitar exames & laudos</span>
                </button>

                <button
                  onClick={() => handleQuickLogin('radiologista@vetrad.com.br', 'Radiologista')}
                  className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-cyan-500/30 hover:border-cyan-500 rounded-xl text-left transition group flex flex-col"
                >
                  <span className="text-[10px] font-bold text-cyan-400 uppercase">Especialista</span>
                  <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">Dra. Camila (CRMV)</span>
                  <span className="text-[10px] text-slate-400">Worklist & emitir laudos</span>
                </button>

                <button
                  onClick={() => handleQuickLogin('admin@vetrad.com.br', 'Admin')}
                  className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-purple-500/30 hover:border-purple-500 rounded-xl text-left transition group flex flex-col"
                >
                  <span className="text-[10px] font-bold text-purple-400 uppercase">Central</span>
                  <span className="text-xs font-bold text-slate-200 group-hover:text-purple-300">Dr. Ricardo (Admin)</span>
                  <span className="text-[10px] text-slate-400">Visão global & métricas</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona o Fluxo */}
      <section className="py-16 bg-slate-900/40 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2">
              Fluxo Simplificado para Parceiros
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">
              Como funciona a Telerradiologia na sua rotina?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative group hover:border-cyan-500/50 transition shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-black text-base mb-4 border border-cyan-500/20">
                1
              </div>
              <h3 className="font-bold text-base text-white mb-1">
                Envio do Raio-X
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sua clínica faz o upload dos arquivos de imagem (DICOM ou JPEG/PNG) com os dados clínicos do pet e suspeita.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative group hover:border-cyan-500/50 transition shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-black text-base mb-4 border border-cyan-500/20">
                2
              </div>
              <h3 className="font-bold text-base text-white mb-1">
                Fila de Especialistas
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                O exame entra imediatamente na Worklist dos nossos médicos veterinários radiologistas de plantão.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative group hover:border-cyan-500/50 transition shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-black text-base mb-4 border border-cyan-500/20">
                3
              </div>
              <h3 className="font-bold text-base text-white mb-1">
                Análise com PACS Web
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                O radiologista realiza medições anatômicas (VHS, Norberg), janelamento avançado e laudo estruturado.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative group hover:border-cyan-500/50 transition shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-black text-base mb-4 border border-cyan-500/20">
                4
              </div>
              <h3 className="font-bold text-base text-white mb-1">
                Laudo com CRMV & PDF
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Receba o laudo timbrado com assinatura digital e carimbo oficial, pronto para imprimir ou enviar ao tutor.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Destaques Técnicos e Recursos */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                Plantão de Urgência em até 2h
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Para casos críticos de trauma, suspeita de torção gástrica (DVG), corpos estranhos obstrutivos e pneumotórax. Laudo prioritário dia e noite.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                Cálculo de VHS e Medições
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Visualizador web integrado com régua milimétrica, Vertebral Heart Score (Buchanan) e ângulo de Norberg para displasia coxofemoral.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                Assinatura Digital & CRMV
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Todos os laudos contêm registro de responsabilidade técnica no CRMV, hash criptográfico de autenticidade e formatação médica timbrada.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-300">VetTeleRad</span>
            <span>— Sistema de Telerradiologia Veterinária</span>
          </div>
          <div>
            Desenvolvido para Clínicas, Hospitais e Médicos Veterinários Radiologistas.
          </div>
        </div>
      </footer>
    </div>
  );
}
