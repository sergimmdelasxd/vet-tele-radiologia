'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Activity, 
  LogOut, 
  FileText, 
  PlusCircle, 
  Shield, 
  Stethoscope, 
  Building2, 
  User as UserIcon,
  Sparkles,
  Calendar
} from 'lucide-react';
import { User } from '@/types';

interface NavbarProps {
  user: User | null;
  onNewExamClick?: () => void;
  onRefresh?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onNewExamClick }) => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const switchUser = async (email: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: email === 'admin@vetrad.com.br' ? 'admin123' : '123456' })
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo e Nome */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                  Vet<span className="text-cyan-400">Tele</span>Rad
                </span>
                <span className="block text-[10px] text-cyan-200/70 tracking-wider font-semibold uppercase -mt-1">
                  Telerradiologia Veterinária
                </span>
              </div>
            </Link>

            {/* Role Badge */}
            {user && (
              <div className="hidden md:flex items-center ml-4 pl-4 border-l border-slate-700/60">
                {user.role === 'CLINIC' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Building2 className="w-3.5 h-3.5" />
                    Clínica Parceira
                  </span>
                )}
                {user.role === 'RADIOLOGIST' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    <Stethoscope className="w-3.5 h-3.5" />
                    Radiologista Plantonista
                  </span>
                )}
                {user.role === 'ADMIN' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    <Shield className="w-3.5 h-3.5" />
                    Central Admin
                  </span>
                )}
              </div>
            )}

            {/* Links Institucionais */}
            <nav className="hidden xl:flex items-center gap-5 ml-6 text-xs text-slate-400 font-medium">
              <Link href="/#como-funciona" className="hover:text-cyan-400 transition">Como Funciona</Link>
              <Link href="/#precos" className="hover:text-cyan-400 transition">Preços &amp; Planos</Link>
              <Link href="/#calculadora" className="hover:text-cyan-400 transition">Simulador</Link>
              <Link href="/#corpo-clinico" className="hover:text-cyan-400 transition">Especialistas</Link>
              <Link href="/#faq" className="hover:text-cyan-400 transition">FAQ</Link>
            </nav>
          </div>

          {/* Ações e Menus */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Botão de Envio de Exame para Clínicas e Radiologistas */}
                {onNewExamClick && (
                  <button
                    onClick={onNewExamClick}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-lg shadow-md shadow-cyan-500/20 transition-all active:scale-95 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{user.role === 'RADIOLOGIST' ? 'Novo Exame / Entrada' : 'Novo Exame'}</span>
                  </button>
                )}

                <Link
                  href="/dashboard"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
                >
                  <FileText className="w-4 h-4 text-cyan-400" />
                  Painel de Exames
                </Link>

                {(user.role === 'RADIOLOGIST' || user.role === 'ADMIN') && (
                  <Link
                    href="/agenda"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-cyan-300 hover:text-white hover:bg-slate-800 transition bg-cyan-500/10 border border-cyan-500/20"
                  >
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    Agenda de Rotina
                  </Link>
                )}

                {/* Dropdown / Menu de Usuário & Troca de Perfil de Demonstração */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-700/60">
                  <div className="text-right hidden lg:block">
                    <div className="text-xs font-bold text-slate-200">
                      {user.clinicName || user.name}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {user.crmv || user.email}
                    </div>
                  </div>

                  {/* Quick Role Switcher (Demonstração prática) */}
                  <div className="relative group">
                    <button
                      title="Alternar perfil de teste"
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 hover:text-cyan-300 transition flex items-center gap-1 text-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span className="hidden sm:inline text-[11px]">Trocar Perfil</span>
                    </button>
                    
                    <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-2 px-1 hidden group-hover:block z-50">
                      <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Alternar Perfis (Demonstração)
                      </div>
                      <button
                        onClick={() => switchUser('clinica@vetlife.com.br')}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-slate-700 flex items-center justify-between text-slate-200"
                      >
                        <span>Clínica VetLife</span>
                        <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded">Clínica</span>
                      </button>
                      <button
                        onClick={() => switchUser('radiologista@vetrad.com.br')}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-slate-700 flex items-center justify-between text-slate-200"
                      >
                        <span>Dra. Camila (CRMV)</span>
                        <span className="text-[10px] bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded">Radiologista</span>
                      </button>
                      <button
                        onClick={() => switchUser('admin@vetrad.com.br')}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-slate-700 flex items-center justify-between text-slate-200"
                      >
                        <span>Dr. Ricardo (Diretoria)</span>
                        <span className="text-[10px] bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded">Admin</span>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    title="Sair da conta"
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-xs sm:text-sm font-medium text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition"
                >
                  Entrar no Portal
                </Link>
                <Link
                  href="/cadastro"
                  className="text-xs sm:text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-500 px-3.5 py-2 rounded-lg shadow-sm transition"
                >
                  Cadastrar Clínica
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
