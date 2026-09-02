'use client';

import React, { useEffect, useState, useMemo } from 'react';
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
  ChevronDown,
  Dog,
  Cat,
  Calculator,
  Award,
  Check,
  HelpCircle,
  PhoneCall,
  Mail,
  Zap,
  Waves
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { User } from '@/types';

export default function HomePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Calculadora de Economia
  const [calcXrays, setCalcXrays] = useState<number>(35);
  const [calcUltrasounds, setCalcUltrasounds] = useState<number>(20);

  // FAQ Acordeão
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

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

  // Cálculos de Economia
  const calculationResults = useMemo(() => {
    const teleCost = (calcXrays * 45) + (calcUltrasounds * 60);
    // Custo de contratar um veterinário especialista presencial CLT (Salário médio R$ 7.500 + 40% encargos/benefícios + custos fixos = ~R$ 11.500)
    const inHouseCost = 11500;
    const monthlySavings = Math.max(0, inHouseCost - teleCost);
    const savingsPercent = Math.round((monthlySavings / inHouseCost) * 100);

    return {
      teleCost,
      inHouseCost,
      monthlySavings,
      savingsPercent,
      annualSavings: monthlySavings * 12
    };
  }, [calcXrays, calcUltrasounds]);

  const faqs = [
    {
      q: 'Quais formatos de imagem e arquivos são aceitos pelo sistema?',
      a: 'Aceitamos arquivos nativos DICOM (.dcm), muito comuns em aparelhos de raio-x digital (DR e CR) e aparelhos de ultrassom, além de imagens nos formatos JPEG, PNG, WebP e documentos PDF complementares. Nosso visualizador PACS Web suporta janelamento e contraste direto no navegador.'
    },
    {
      q: 'Qual é o prazo de entrega dos laudos emitidos?',
      a: 'Para exames de rotina, o prazo médio de emissão é de 4 a 12 horas. Para casos de plantão de urgência (trauma, suspeita de torção gástrica, obstrução uretral, dispneia aguda), os laudos são priorizados e emitidos em até 2 horas, 24 horas por dia.'
    },
    {
      q: 'Os laudos possuem validade legal e carimbo com CRMV?',
      a: 'Sim, todos os laudos são assinados digitalmente por Médicos Veterinários especialistas devidamente registrados no Conselho Regional de Medicina Veterinária (CRMV), contendo hash de autenticidade rastreável e cabeçalho oficial timbrado.'
    },
    {
      q: 'Como funciona o pagamento dos laudos e recarga de créditos?',
      a: 'A plataforma opera com um modelo flexível pré-pago sem mensalidade fixa: sua clínica adiciona saldo via PIX com liberação instantânea ou Cartão de Crédito. Conforme os exames são submetidos, o valor do laudo é debitado automaticamente. Para redes e hospitais com alto volume, disponibilizamos faturamento mensal por boleto.'
    },
    {
      q: 'Se a imagem tiver artefato de movimento ou posicionamento incorreto, o que acontece?',
      a: 'Nosso radiologista entrará em contato ou registrará uma solicitação de reconvocação/novas projeções dentro da plataforma, orientando exatamente qual o melhor posicionamento para fechar o diagnóstico com total segurança.'
    },
    {
      q: 'Posso compartilhar o laudo diretamente com os tutores dos animais?',
      a: 'Sim! Com apenas 1 clique você pode baixar o laudo timbrado em PDF de alta qualidade, gerar uma mensagem formatada com link para envio direto no WhatsApp do cliente ou requisitante, ou enviar diretamente por e-mail.'
    }
  ];

  const doctors = [
    {
      name: 'Dra. Camila Siqueira',
      role: 'Médica Veterinária Radiologista',
      crmv: 'CRMV-SP 38.412',
      specialty: 'Especialista em Radiologia Digital e Tomografia Computadorizada (USP). 11 anos de experiência em rotina e emergências.',
      image: 'https://images.unsplash.com/photo-1594824813681-30d8aa531776?w=300&auto=format&fit=crop&q=80'
    },
    {
      name: 'Dr. Ricardo Valença',
      role: 'Mestre em Diagnóstico por Imagem',
      crmv: 'CRMV-SP 21.050',
      specialty: 'Mestre em Medicina Veterinária com ênfase em Cardiologia e Tórax. Responsável Técnico da Central VetTeleRad.',
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80'
    },
    {
      name: 'Dra. Juliana Barros',
      role: 'Especialista em Ultrassonografia',
      crmv: 'CRMV-RJ 42.108',
      specialty: 'Pós-graduada em Ultrassonografia Abdominal e Obstétrica de Pequenos Animais. Foco em triagem de emergência A-FAST e T-FAST.',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80'
    },
    {
      name: 'Dr. Felipe Antunes',
      role: 'Radiologista Ortopédico',
      crmv: 'CRMV-MG 31.905',
      specialty: 'Especialista em Avaliação Radiográfica de Displasia Coxofemoral (Ângulo de Norberg) e Afecções Ortopédicas em Cães e Gatos.',
      image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&auto=format&fit=crop&q=80'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white scroll-smooth">
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
              Envio real de arquivos DICOM, visualizador web e laudos timbrados com CRMV em até <strong>2 horas</strong>.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/cadastro"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-cyan-500/25 transition active:scale-95 cursor-pointer"
              >
                <span>Cadastrar Minha Clínica</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <Link
                href={currentUser ? "/dashboard" : "/login"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm rounded-xl transition cursor-pointer"
              >
                <Building2 className="w-4 h-4 text-cyan-400" />
                <span>{currentUser ? "Ir para o Painel de Exames" : "Acessar Portal do Parceiro"}</span>
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
                  className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-emerald-500/30 hover:border-emerald-500 rounded-xl text-left transition group flex flex-col cursor-pointer"
                >
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">Terceiro / Clínica</span>
                  <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-300">Clínica VetLife</span>
                  <span className="text-[10px] text-slate-400">Solicitar exames & laudos</span>
                </button>

                <button
                  onClick={() => handleQuickLogin('radiologista@vetrad.com.br', 'Radiologista')}
                  className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-cyan-500/30 hover:border-cyan-500 rounded-xl text-left transition group flex flex-col cursor-pointer"
                >
                  <span className="text-[10px] font-bold text-cyan-400 uppercase">Especialista</span>
                  <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">Dra. Camila (CRMV)</span>
                  <span className="text-[10px] text-slate-400">Worklist & emitir laudos</span>
                </button>

                <button
                  onClick={() => handleQuickLogin('admin@vetrad.com.br', 'Admin')}
                  className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-purple-500/30 hover:border-purple-500 rounded-xl text-left transition group flex flex-col cursor-pointer"
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
      <section id="como-funciona" className="py-16 bg-slate-900/40 border-b border-slate-800">
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
                Envio das Imagens
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sua clínica faz o upload dos arquivos (DICOM ou imagens convencionais) com os dados clínicos do pet e suspeita diagnóstica.
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
                O exame entra imediatamente na Worklist dos nossos médicos veterinários radiologistas e ultrassonografistas plantonistas.
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
                O radiologista realiza medições anatômicas (VHS, Norberg), janelamento avançado e elabora o laudo médico estruturado.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative group hover:border-cyan-500/50 transition shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-black text-base mb-4 border border-cyan-500/20">
                4
              </div>
              <h3 className="font-bold text-base text-white mb-1">
                Laudo com CRMV &amp; PDF
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Receba o laudo timbrado com assinatura digital e carimbo oficial, pronto para download em PDF ou compartilhamento via WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Seção 2: Tabela de Preços & Planos */}
      <section id="precos" className="py-20 border-b border-slate-800 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2">
              Planos Transparentes e Sem Surpresas
            </h2>
            <p className="text-3xl font-black text-white">
              Valores por Laudo sob Medida para Sua Clínica
            </p>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Sem taxas ocultas, sem mensalidade obrigatória. Pague apenas pelos laudos que solicitar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Plano 1: Sob Demanda */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between hover:border-slate-700 transition shadow-xl">
              <div>
                <span className="px-3 py-1 bg-slate-800 text-slate-300 text-[11px] font-bold uppercase tracking-wider rounded-full">
                  Avulso / Flexível
                </span>
                <h3 className="text-2xl font-black text-white mt-4">Pré-Pago Sob Demanda</h3>
                <p className="text-xs text-slate-400 mt-1">Ideal para clínicas com volume inicial ou sazonal.</p>

                <div className="my-6 p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Raio-X (Rotina):</span>
                    <strong className="text-white font-mono text-base">R$ 45,00</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Ultrassom (USG):</span>
                    <strong className="text-teal-400 font-mono text-base">R$ 60,00</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                    <span className="text-slate-400">Adicional Urgência:</span>
                    <span className="text-amber-400 font-semibold">+ R$ 20,00</span>
                  </div>
                </div>

                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Sem taxa de adesão nem mensalidade</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Recargas instantâneas via PIX</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Laudos timbrados com CRMV oficial</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Exportação em PDF e envio no WhatsApp</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <Link
                  href="/cadastro"
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <span>Começar Sem Fidelidade</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Plano 2: Clínica Prime (Destaque) */}
            <div className="bg-gradient-to-b from-slate-900 to-cyan-950/40 border-2 border-cyan-500 rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-md">
                Mais Popular entre Clínicas
              </span>

              <div>
                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 text-[11px] font-bold uppercase tracking-wider rounded-full">
                  Volume Médio (&gt; 25 exames/mês)
                </span>
                <h3 className="text-2xl font-black text-white mt-4">Clínica Parceira Pro</h3>
                <p className="text-xs text-slate-300 mt-1">Descontos progressivos e canal de plantão dedicado.</p>

                <div className="my-6 p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Raio-X (Rotina):</span>
                    <strong className="text-cyan-300 font-mono text-base">R$ 38,00</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Ultrassom (USG):</span>
                    <strong className="text-teal-300 font-mono text-base">R$ 52,00</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                    <span className="text-slate-400">SLA Prioritário:</span>
                    <span className="text-emerald-400 font-semibold">Até 90 minutos</span>
                  </div>
                </div>

                <ul className="space-y-3 text-xs text-slate-200">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span><strong>15% de economia</strong> por exame emitido</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Canal direto no WhatsApp com o radiologista</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Prioridade na worklist 24h</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Suporte a múltiplos veterinários da equipe</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <Link
                  href="/cadastro"
                  className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition active:scale-95"
                >
                  <span>Cadastrar com Condições Pro</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Plano 3: Hospital 24h & Redes */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between hover:border-slate-700 transition shadow-xl">
              <div>
                <span className="px-3 py-1 bg-purple-500/10 text-purple-300 text-[11px] font-bold uppercase tracking-wider rounded-full border border-purple-500/20">
                  Alto Volume (&gt; 60 exames/mês)
                </span>
                <h3 className="text-2xl font-black text-white mt-4">Hospital 24h &amp; Redes</h3>
                <p className="text-xs text-slate-400 mt-1">Para operações contínuas que necessitam de SLA emergencial.</p>

                <div className="my-6 p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Raio-X (Rotina):</span>
                    <strong className="text-purple-300 font-mono text-base">R$ 32,00</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Ultrassom (USG):</span>
                    <strong className="text-purple-300 font-mono text-base">R$ 44,00</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                    <span className="text-slate-400">SLA Emergência:</span>
                    <span className="text-rose-400 font-semibold">Até 45 minutos</span>
                  </div>
                </div>

                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Faturamento quinzenal com boleto bancário</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Integração PACS/DICOM direta com seu aparelho</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Gestor de conta e SLA contratual garantido</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Plantão contínuo noturno, finais de semana e feriados</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <Link
                  href="/cadastro"
                  className="w-full py-3 bg-purple-900/50 hover:bg-purple-800/80 text-purple-200 border border-purple-500/30 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <span>Falar com Gerente Hospitalar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção 3: Calculadora de Economia para Clínicas */}
      <section id="calculadora" className="py-20 bg-slate-900/30 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-tr from-slate-900 via-slate-900 to-cyan-950/30 border border-slate-800 rounded-3xl p-8 lg:p-12 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Simulador de ROI e Economia</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                  Quanto sua clínica economiza com a VetTeleRad?
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Contratar um radiologista presencial em tempo integral gera altos custos com encargos trabalhistas, rescisões e horas ociosas. Ajuste o volume mensal estimado da sua clínica e veja a diferença real:
                </p>

                {/* Sliders */}
                <div className="space-y-5 bg-slate-950 p-6 rounded-2xl border border-slate-800">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-semibold text-slate-300">Volume de Raio-X por mês:</span>
                      <span className="font-black text-cyan-400 font-mono text-base">{calcXrays} exames</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="150"
                      step="5"
                      value={calcXrays}
                      onChange={e => setCalcXrays(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-semibold text-slate-300">Volume de Ultrassom (USG) por mês:</span>
                      <span className="font-black text-teal-400 font-mono text-base">{calcUltrasounds} exames</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={calcUltrasounds}
                      onChange={e => setCalcUltrasounds(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Card de Resultados */}
              <div className="lg:col-span-6">
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-500 block mb-1">Custo Médio Presencial</span>
                      <div className="text-xl font-black text-rose-400 font-mono">
                        R$ {calculationResults.inHouseCost.toLocaleString('pt-BR')},00
                      </div>
                      <span className="text-[10px] text-slate-500">Salário CLT + Encargos</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block mb-1">Custo com VetTeleRad</span>
                      <div className="text-xl font-black text-cyan-400 font-mono">
                        R$ {calculationResults.teleCost.toLocaleString('pt-BR')},00
                      </div>
                      <span className="text-[10px] text-slate-500">Paga apenas pelo que lauda</span>
                    </div>
                  </div>

                  {/* Grande destaque da economia */}
                  <div className="p-5 bg-gradient-to-r from-emerald-950/40 to-teal-950/30 border border-emerald-500/30 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                        Economia Estimada por Mês
                      </span>
                      <span className="text-xs font-black bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full">
                        {calculationResults.savingsPercent}% de Redução de Custo
                      </span>
                    </div>

                    <div className="text-3xl sm:text-4xl font-black text-white font-mono">
                      R$ {calculationResults.monthlySavings.toLocaleString('pt-BR')},00
                    </div>

                    <p className="text-[11px] text-slate-300">
                      Isso representa uma economia de aproximadamente{' '}
                      <strong className="text-emerald-400 font-mono">
                        R$ {calculationResults.annualSavings.toLocaleString('pt-BR')},00 ao ano
                      </strong>{' '}
                      para o fluxo de caixa da sua clínica.
                    </p>
                  </div>

                  <Link
                    href="/cadastro"
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition"
                  >
                    <span>Começar a Economizar Agora</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Seção 4: Corpo Clínico Especializado */}
      <section id="corpo-clinico" className="py-20 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2">
              Excelência Médica Veterinária
            </h2>
            <p className="text-3xl font-black text-white">
              Conheça Nossa Equipe de Especialistas
            </p>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Médicos veterinários pós-graduados e mestres pelas principais universidades do país, com CRMVs ativos e dedicação exclusiva.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.map((doc, idx) => (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-cyan-500/50 transition group flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="h-48 w-full overflow-hidden bg-slate-950 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={doc.image}
                      alt={doc.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="font-bold text-white text-base group-hover:text-cyan-300 transition">
                      {doc.name}
                    </h3>
                    <div className="text-xs font-bold text-cyan-400 font-mono">
                      {doc.crmv}
                    </div>
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {doc.role}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed pt-1">
                      {doc.specialty}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Plantonista Homologado</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Destaques Técnicos e Recursos */}
      <section className="py-16 bg-slate-900/40 border-b border-slate-800">
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
                Assinatura Digital &amp; CRMV
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Todos os laudos contêm registro de responsabilidade técnica no CRMV, hash criptográfico de autenticidade e formatação médica timbrada.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Seção 5: FAQ - Perguntas Frequentes */}
      <section id="faq" className="py-20 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2">
              Tire Suas Dúvidas
            </h2>
            <p className="text-3xl font-black text-white">
              Perguntas Frequentes (FAQ)
            </p>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Tudo o que você precisa saber sobre o funcionamento da Telerradiologia e Teleultrassonografia.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-850"
                  >
                    <span className="font-bold text-white text-sm flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-cyan-400' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-10 p-6 bg-slate-900/60 border border-slate-800 rounded-2xl text-center space-y-3">
            <span className="text-xs text-slate-400">Ainda tem alguma dúvida específica para o seu equipamento ou clínica?</span>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-cyan-400">
              <a href="mailto:contato@vettelerad.com.br" className="hover:underline flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> contato@vettelerad.com.br
              </a>
              <span className="text-slate-600">•</span>
              <a href="tel:1130039820" className="hover:underline flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5" /> (11) 3003-9820
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                <span className="font-black text-white text-base">VetTeleRad</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Plataforma líder em telerradiologia e teleultrassonografia veterinária para clínicas, centros de diagnóstico e hospitais 24h.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold text-xs mb-3 uppercase tracking-wider">Navegação</h4>
              <ul className="space-y-2 text-[11px]">
                <li><a href="#como-funciona" className="hover:text-cyan-400 transition">Como Funciona</a></li>
                <li><a href="#precos" className="hover:text-cyan-400 transition">Tabela de Preços</a></li>
                <li><a href="#calculadora" className="hover:text-cyan-400 transition">Simulador de Economia</a></li>
                <li><a href="#corpo-clinico" className="hover:text-cyan-400 transition">Corpo Clínico</a></li>
                <li><a href="#faq" className="hover:text-cyan-400 transition">Perguntas Frequentes</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-xs mb-3 uppercase tracking-wider">Acesso Rápido</h4>
              <ul className="space-y-2 text-[11px]">
                <li><Link href="/login" className="hover:text-cyan-400 transition">Entrar no Portal</Link></li>
                <li><Link href="/cadastro" className="hover:text-cyan-400 transition">Cadastrar Clínica Parceira</Link></li>
                <li><Link href="/dashboard" className="hover:text-cyan-400 transition">Worklist &amp; Laudos</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-xs mb-3 uppercase tracking-wider">Plantão e Contato</h4>
              <div className="space-y-1.5 text-[11px] text-slate-400">
                <div>Central 24h: (11) 3003-9820</div>
                <div>Suporte: contato@vettelerad.com.br</div>
                <div>São Paulo / SP — Atendimento Nacional</div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <div>
              © 2026 VetTeleRad Tecnologia Veterinária LTDA. Todos os direitos reservados.
            </div>
            <div>
              Desenvolvido com responsabilidade técnica e foco em medicina veterinária de precisão.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
