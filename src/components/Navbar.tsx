'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
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
  Calendar,
  DollarSign,
  ChevronDown,
  Home,
  ClipboardList,
  Zap,
  BookOpen,
  ShieldCheck,
  PenTool
} from 'lucide-react';
import { User } from '@/types';
import { ClinicSettingsModal } from '@/components/dashboard/ClinicSettingsModal';
import { VetSignatureModal } from '@/components/dashboard/VetSignatureModal';
import { NotificationBell } from '@/components/notifications/NotificationBell';

interface NavbarProps {
  user: User | null;
  onNewExamClick?: () => void;
  onRefresh?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onNewExamClick, onRefresh }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [showClinicModal, setShowClinicModal] = React.useState(false);
  const [showVetSignatureModal, setShowVetSignatureModal] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<User | null>(user);

  React.useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const isLight = pathname === '/' || pathname === '/dashboard' || pathname === '/templates' || pathname === '/agenda' || pathname === '/financeiro' || pathname === '/frases-rapidas' || pathname === '/casoteca' || pathname === '/auditoria' || pathname === '/termos' || pathname === '/privacidade';

  return (
    <header className={`${isLight ? 'bg-white/90 backdrop-blur-md border-b border-slate-200/80 text-slate-800 shadow-xs' : 'bg-slate-900 border-b border-slate-800 text-slate-100 shadow-md'} sticky top-0 z-40 transition-colors`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo e Nome */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className={`text-xl font-black tracking-tight flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Vet<span className={isLight ? 'text-teal-600' : 'text-cyan-400'}>Tele</span>Rad
                </span>
                <span className={`block text-[10px] tracking-wider font-semibold uppercase -mt-1 ${isLight ? 'text-slate-500' : 'text-cyan-200/70'}`}>
                  Telerradiologia Veterinária
                </span>
              </div>
            </Link>

            {/* Role Badge */}
            {user && (
              <div className={`hidden md:flex items-center ml-4 pl-4 border-l ${isLight ? 'border-slate-200' : 'border-slate-700/60'}`}>
                {user.role === 'CLINIC' && (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${isLight ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                    <Building2 className="w-3.5 h-3.5" />
                    Clínica Parceira
                  </span>
                )}
                {user.role === 'RADIOLOGIST' && (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${isLight ? 'bg-teal-50 text-teal-800 border border-teal-200' : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'}`}>
                    <Stethoscope className="w-3.5 h-3.5" />
                    Radiologista Plantonista
                  </span>
                )}
                {user.role === 'ADMIN' && (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${isLight ? 'bg-purple-50 text-purple-800 border border-purple-200' : 'bg-purple-500/10 text-purple-300 border border-purple-500/20'}`}>
                    <Shield className="w-3.5 h-3.5" />
                    Central Admin
                  </span>
                )}
              </div>
            )}

            {/* Links Institucionais (Exibidos apenas para visitantes não logados na Página Inicial) */}
            {!user && pathname === '/' && (
              <nav className="hidden xl:flex items-center gap-5 ml-6 text-xs text-slate-600 font-semibold">
                <Link href="/#como-funciona" className="hover:text-teal-600 transition">Como Funciona</Link>
                <Link href="/#modalidades" className="hover:text-teal-600 transition">Modalidades</Link>
                <Link href="/#precos" className="hover:text-teal-600 transition">Preços &amp; Planos</Link>
                <Link href="/#calculadora" className="hover:text-teal-600 transition">Simulador</Link>
                <Link href="/#corpo-clinico" className="hover:text-teal-600 transition">Especialistas</Link>
                <Link href="/#faq" className="hover:text-teal-600 transition">FAQ</Link>
              </nav>
            )}
          </div>

          {/* Ações e Menus */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Botão de Envio de Exame para Clínicas e Radiologistas */}
                {onNewExamClick && (
                  <button
                    onClick={onNewExamClick}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl shadow-md shadow-teal-500/20 transition-all active:scale-95 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{user.role === 'RADIOLOGIST' ? 'Novo Exame / Entrada' : 'Novo Exame'}</span>
                  </button>
                )}

                {/* Link Rápido para Painel de Exames */}
                <Link
                  href="/dashboard"
                  className={`hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
                >
                  <FileText className={`w-4 h-4 ${isLight ? 'text-teal-600' : 'text-cyan-400'}`} />
                  <span>Worklist</span>
                </Link>

                {/* Casoteca & Atlas de Ensino */}
                <Link
                  href="/casoteca"
                  className={`hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
                >
                  <BookOpen className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
                  <span>Casoteca</span>
                </Link>

                {/* CENTRAL DE NOTIFICAÇÕES COM SOM EM TEMPO REAL */}
                <NotificationBell />

                {/* MENU INTERATIVO NO CANTO SUPERIOR DIREITO (HOVER & CLIQUE) */}
                <div className="relative group py-1.5">
                  {/* Botão de Trigger do Menu */}
                  <button
                    className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer text-left shadow-2xs border ${isLight ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800 hover:border-teal-400' : 'bg-slate-850 hover:bg-slate-800 border-slate-700/80 hover:border-cyan-500/50 text-white'}`}
                  >
                    {/* Ícone / Avatar do Perfil */}
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0">
                      {user.role === 'CLINIC' && <Building2 className="w-4 h-4 text-emerald-300" />}
                      {user.role === 'RADIOLOGIST' && <Stethoscope className="w-4 h-4 text-cyan-300" />}
                      {user.role === 'ADMIN' && <Shield className="w-4 h-4 text-purple-300" />}
                    </div>

                    <div className="hidden sm:block text-left pr-1">
                      <div className={`text-xs font-bold leading-tight flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        <span className="truncate max-w-[120px]">{user.clinicName ? user.clinicName.split(' ')[0] : user.name.split(' ')[0]}</span>
                        {(user.role === 'RADIOLOGIST' || user.role === 'ADMIN') && (
                          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" title="Painel Especialista/Admin Ativo" />
                        )}
                      </div>
                      <div className={`text-[10px] leading-tight ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {user.role === 'CLINIC' ? 'Clínica Parceira' : (user.role === 'RADIOLOGIST' ? 'Radiologista' : 'Central Admin')}
                      </div>
                    </div>

                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 transition-transform duration-200 group-hover:rotate-180 shrink-0" />
                  </button>

                  {/* Painel Dropdown Flutuante Aberto ao Passar o Mouse */}
                  <div className="absolute right-0 top-full pt-1.5 w-80 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50 transform origin-top-right group-hover:scale-100 scale-95">
                    <div className="bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl p-2.5 space-y-2 text-xs backdrop-blur-2xl">
                      
                      {/* Cabeçalho do Perfil */}
                      <div className="px-3 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800">
                        <div className="font-bold text-white text-xs truncate">
                          {user.clinicName || user.name}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                          {user.crmv || user.email}
                        </div>

                        {user.role === 'CLINIC' && typeof user.balance === 'number' && (
                          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">Saldo Disponível:</span>
                            <span className="font-mono font-bold text-emerald-400">
                              R$ {user.balance.toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* SEÇÃO 1: MÓDULOS DE GESTÃO (Exclusivo Especialista & Admin) */}
                      {(user.role === 'RADIOLOGIST' || user.role === 'ADMIN') && (
                        <div className="space-y-1">
                          <div className="px-2.5 pt-1 text-[10px] font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3" />
                            <span>Módulos de Gestão</span>
                          </div>

                          {/* Agenda de Rotina */}
                          <Link
                            href="/agenda"
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/80 border border-transparent hover:border-cyan-500/30 transition group/item"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0 group-hover/item:scale-105 transition-transform">
                                <Calendar className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-bold text-slate-200 group-hover/item:text-cyan-300 transition-colors">
                                  Agenda de Rotina
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  Horários, preparos e timeline diária
                                </div>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                              Rotina
                            </span>
                          </Link>

                          {/* Gestão Financeira */}
                          <Link
                            href="/financeiro"
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/80 border border-transparent hover:border-emerald-500/30 transition group/item"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover/item:scale-105 transition-transform">
                                <DollarSign className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-bold text-slate-200 group-hover/item:text-emerald-300 transition-colors">
                                  Gestão Financeira
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  Gráficos, volumetria e planos
                                </div>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Métricas
                            </span>
                          </Link>

                          {/* Modelos de Laudo */}
                          <Link
                            href="/templates"
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/80 border border-transparent hover:border-purple-500/30 transition group/item"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0 group-hover/item:scale-105 transition-transform">
                                <ClipboardList className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-bold text-slate-200 group-hover/item:text-purple-300 transition-colors">
                                  Modelos de Laudo
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  Templates de Raio-X e USG
                                </div>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                              Templates
                            </span>
                          </Link>

                          {/* Frases Rápidas & Macros (/) */}
                          <Link
                            href="/frases-rapidas"
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/80 border border-transparent hover:border-amber-500/30 transition group/item"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover/item:scale-105 transition-transform">
                                <Zap className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-bold text-slate-200 group-hover/item:text-amber-300 transition-colors">
                                  Frases Rápidas (/)
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  Macros, atalhos e parágrafos
                                </div>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                              /atalhos
                            </span>
                          </Link>

                          {/* Casoteca & Atlas de Ensino */}
                          <Link
                            href="/casoteca"
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/80 border border-transparent hover:border-indigo-500/30 transition group/item"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0 group-hover/item:scale-105 transition-transform">
                                <BookOpen className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-bold text-slate-200 group-hover/item:text-indigo-300 transition-colors">
                                  Casoteca &amp; Atlas
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  Casos raros e discussão diagnóstica
                                </div>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              Atlas
                            </span>
                          </Link>

                          {/* Trilha de Auditoria LGPD */}
                          <Link
                            href="/auditoria"
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/80 border border-transparent hover:border-emerald-500/30 transition group/item"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover/item:scale-105 transition-transform">
                                <ShieldCheck className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-bold text-slate-200 group-hover/item:text-emerald-300 transition-colors">
                                  Auditoria &amp; LGPD
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  Rastreabilidade e logs seguros
                                </div>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              LGPD
                            </span>
                          </Link>
                        </div>
                      )}

                      {/* PERSONALIZAÇÃO: LOGOTIPO & DADOS DA CLÍNICA */}
                      <div className="pt-1 border-t border-slate-800/80 space-y-1.5">
                        <button
                          type="button"
                          onClick={() => setShowVetSignatureModal(true)}
                          className="w-full flex items-center justify-between p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/25 transition text-left cursor-pointer group/sign"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0">
                              <PenTool className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-xs text-white group-hover/sign:text-cyan-200">
                                Minha Assinatura &amp; CRMV
                              </div>
                              <div className="text-[10px] text-cyan-300/80">
                                Carimbo e assinatura do laudo
                              </div>
                            </div>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${currentUser?.signatureImage ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-cyan-500/20 text-cyan-300'}`}>
                            {currentUser?.signatureImage ? 'Configurada' : '+ Cadastrar'}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowClinicModal(true)}
                          className="w-full flex items-center justify-between p-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/25 transition text-left cursor-pointer group/logo"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-xs text-white group-hover/logo:text-teal-200">
                                Minha Clínica &amp; Logo
                              </div>
                              <div className="text-[10px] text-teal-300/80">
                                Logotipo do laudo timbrado
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-md font-bold">
                            {currentUser?.clinicLogo ? 'Configurado' : '+ Anexar'}
                          </span>
                        </button>
                      </div>

                      {/* SEÇÃO 2: NAVEGAÇÃO RÁPIDA */}
                      <div className="space-y-1 pt-1 border-t border-slate-800/80">
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-800/60 text-slate-300 hover:text-white transition"
                        >
                          <FileText className="w-4 h-4 text-cyan-400" />
                          <span>Painel de Exames (Worklist)</span>
                        </Link>

                        <Link
                          href="/"
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-800/60 text-slate-300 hover:text-white transition"
                        >
                          <Home className="w-4 h-4 text-slate-400" />
                          <span>Página Inicial / Institucional</span>
                        </Link>
                      </div>

                      {/* SEÇÃO: SAIR */}
                      <div className="pt-1 border-t border-slate-800/80">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sair da Conta</span>
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className={`text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl transition ${
                    isLight
                      ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/90'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  Entrar no Portal
                </Link>
                <Link
                  href="/cadastro"
                  className="text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 px-4 py-2 rounded-xl shadow-md shadow-teal-500/20 transition active:scale-95"
                >
                  Cadastrar Clínica
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Personalização da Clínica & Logotipo */}
      {currentUser && (
        <ClinicSettingsModal
          isOpen={showClinicModal}
          onClose={() => setShowClinicModal(false)}
          user={currentUser}
          onUserUpdated={(updated) => {
            setCurrentUser(updated);
            if (onRefresh) onRefresh();
          }}
        />
      )}

      {/* Modal de Assinatura & CRMV do Médico Veterinário */}
      {currentUser && (
        <VetSignatureModal
          isOpen={showVetSignatureModal}
          onClose={() => setShowVetSignatureModal(false)}
          user={currentUser}
          onUserUpdated={(updated) => {
            setCurrentUser(updated);
            if (onRefresh) onRefresh();
          }}
        />
      )}
    </header>
  );
};
