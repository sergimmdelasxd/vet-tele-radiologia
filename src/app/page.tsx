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
    <div className="min-h-screen bg-[#fafbfc] text-slate-800 flex flex-col font-sans selection:bg-teal-500 selection:text-white scroll-smooth">
      <Navbar user={currentUser} />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200/80">
        {/* Ambient Pastel Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-sky-200/40 via-teal-100/40 to-amber-100/40 blur-[130px] pointer-events-none" />
        <div className="absolute top-12 left-10 w-80 h-80 bg-emerald-100/50 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-violet-100/40 blur-[110px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50/90 border border-teal-200/80 text-teal-800 text-xs font-semibold tracking-wide shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Telerradiologia &amp; Teleultrassonografia Veterinária Especializada</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.15]">
              Laudos de Raio-X e Ultrassom com{' '}
              <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 bg-clip-text text-transparent">
                Agilidade e Precisão
              </span>
            </h1>

            {/* Subhead */}
            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
              Conecte sua clínica ou hospital a médicos veterinários radiologistas e ultrassonografistas de plantão.
              Envio descomplicado de exames DICOM, visualizador web e laudos timbrados com CRMV em até <strong>2 horas</strong>.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <Link
                href="/cadastro"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-teal-500/25 transition-all active:scale-95 cursor-pointer"
              >
                <span>Cadastrar Minha Clínica</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <Link
                href={currentUser ? "/dashboard" : "/login"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200/90 font-semibold text-sm rounded-2xl shadow-xs transition cursor-pointer"
              >
                <Building2 className="w-4 h-4 text-teal-600" />
                <span>{currentUser ? "Ir para o Painel de Exames" : "Acessar Portal do Parceiro"}</span>
              </Link>
            </div>

            {/* Quick Demo Access (1-Click Test Drive) */}
            <div className="pt-8 border-t border-slate-200/80 max-w-xl mx-auto">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                ⚡ Teste Imediato (Acesso Demo em 1 clique)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  onClick={() => handleQuickLogin('clinica@vetlife.com.br', 'Clínica Parceira')}
                  className="p-3 bg-white hover:bg-emerald-50/50 border border-emerald-200/80 rounded-2xl text-left transition group flex flex-col shadow-xs cursor-pointer"
                >
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md w-fit uppercase">Clínica</span>
                  <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 mt-1">Clínica VetLife</span>
                  <span className="text-[10px] text-slate-500">Solicitar exames &amp; laudos</span>
                </button>

                <button
                  onClick={() => handleQuickLogin('radiologista@vetrad.com.br', 'Radiologista')}
                  className="p-3 bg-white hover:bg-sky-50/50 border border-sky-200/80 rounded-2xl text-left transition group flex flex-col shadow-xs cursor-pointer"
                >
                  <span className="text-[10px] font-bold text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded-md w-fit uppercase">Especialista</span>
                  <span className="text-xs font-bold text-slate-800 group-hover:text-sky-700 mt-1">Dra. Camila (CRMV)</span>
                  <span className="text-[10px] text-slate-500">Worklist &amp; emitir laudos</span>
                </button>

                <button
                  onClick={() => handleQuickLogin('admin@vetrad.com.br', 'Admin')}
                  className="p-3 bg-white hover:bg-purple-50/50 border border-purple-200/80 rounded-2xl text-left transition group flex flex-col shadow-xs cursor-pointer"
                >
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded-md w-fit uppercase">Central</span>
                  <span className="text-xs font-bold text-slate-800 group-hover:text-purple-700 mt-1">Dr. Ricardo (Admin)</span>
                  <span className="text-[10px] text-slate-500">Visão global &amp; métricas</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona o Fluxo */}
      <section id="como-funciona" className="py-16 bg-slate-50/60 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-teal-700 bg-teal-100/70 px-3 py-1 rounded-full mb-3">
              Fluxo Simplificado para Parceiros
            </span>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">
              Como funciona a Telerradiologia na sua rotina?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white border border-slate-200/90 p-6 rounded-3xl relative group hover:border-sky-300 hover:shadow-md transition shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-black text-base mb-4 border border-sky-200">
                1
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1.5">
                Envio das Imagens
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sua clínica faz o upload dos arquivos (DICOM ou imagens convencionais) com os dados clínicos do pet e suspeita diagnóstica.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 p-6 rounded-3xl relative group hover:border-teal-300 hover:shadow-md transition shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-black text-base mb-4 border border-teal-200">
                2
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1.5">
                Fila de Especialistas
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                O exame entra imediatamente na Worklist dos nossos médicos veterinários radiologistas e ultrassonografistas plantonistas.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 p-6 rounded-3xl relative group hover:border-violet-300 hover:shadow-md transition shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center font-black text-base mb-4 border border-violet-200">
                3
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1.5">
                Análise com PACS Web
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                O radiologista realiza medições anatômicas (VHS, Norberg), janelamento avançado e elabora o laudo médico estruturado.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 p-6 rounded-3xl relative group hover:border-emerald-300 hover:shadow-md transition shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-base mb-4 border border-emerald-200">
                4
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1.5">
                Laudo com CRMV &amp; PDF
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Receba o laudo timbrado com assinatura digital e carimbo oficial, pronto para download em PDF ou compartilhamento via WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Seção 2: Tabela de Preços & Planos */}
      <section id="precos" className="py-20 bg-[#fafbfc] border-b border-slate-200/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-teal-700 bg-teal-100/70 px-3 py-1 rounded-full mb-3">
              Planos Transparentes e Sem Surpresas
            </span>
            <p className="text-3xl font-black text-slate-900">
              Valores por Laudo sob Medida para Sua Clínica
            </p>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Sem taxas ocultas, sem mensalidade obrigatória. Pague apenas pelos laudos que solicitar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Plano 1: Sob Demanda */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-8 flex flex-col justify-between hover:shadow-lg transition-all duration-200 shadow-xs">
              <div>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 text-[11px] font-bold uppercase tracking-wider rounded-full border border-slate-200">
                  Avulso / Flexível
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-4">Pré-Pago Sob Demanda</h3>
                <p className="text-xs text-slate-500 mt-1">Ideal para clínicas com volume inicial ou sazonal.</p>

                <div className="my-6 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Raio-X (Rotina):</span>
                    <strong className="text-slate-900 font-mono text-base">R$ 45,00</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Ultrassom (USG):</span>
                    <strong className="text-teal-700 font-mono text-base">R$ 60,00</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
                    <span className="text-slate-500">Adicional Urgência:</span>
                    <span className="text-amber-700 font-bold">+ R$ 20,00</span>
                  </div>
                </div>

                <ul className="space-y-3 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Sem taxa de adesão nem mensalidade</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Recargas instantâneas via PIX</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Laudos timbrados com CRMV oficial</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Exportação em PDF e envio no WhatsApp</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <Link
                  href="/cadastro"
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-200 transition cursor-pointer"
                >
                  <span>Começar Sem Fidelidade</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Plano 2: Clínica Prime (Destaque) */}
            <div className="bg-gradient-to-b from-teal-50/60 via-white to-white border-2 border-teal-500 rounded-3xl p-8 flex flex-col justify-between shadow-xl shadow-teal-500/10 relative">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-md">
                Mais Popular entre Clínicas
              </span>

              <div>
                <span className="px-3 py-1 bg-teal-100 text-teal-800 text-[11px] font-bold uppercase tracking-wider rounded-full border border-teal-200">
                  Volume Médio (&gt; 25 exames/mês)
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-4">Clínica Parceira Pro</h3>
                <p className="text-xs text-slate-600 mt-1">Descontos progressivos e canal de plantão dedicado.</p>

                <div className="my-6 p-4 rounded-2xl bg-teal-50/80 border border-teal-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Raio-X (Rotina):</span>
                    <strong className="text-teal-800 font-mono text-base">R$ 38,00</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Ultrassom (USG):</span>
                    <strong className="text-cyan-800 font-mono text-base">R$ 52,00</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-teal-200">
                    <span className="text-slate-600">SLA Prioritário:</span>
                    <span className="text-emerald-700 font-bold">Até 90 minutos</span>
                  </div>
                </div>

                <ul className="space-y-3 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-teal-600 shrink-0" />
                    <span><strong>15% de economia</strong> por exame emitido</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Canal direto no WhatsApp com o radiologista</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Prioridade na worklist 24h</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Suporte a múltiplos veterinários da equipe</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <Link
                  href="/cadastro"
                  className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-500/25 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
                >
                  <span>Cadastrar com Condições Pro</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Plano 3: Hospital 24h & Redes */}
            <div className="bg-white border border-purple-200/90 rounded-3xl p-8 flex flex-col justify-between hover:shadow-lg transition-all duration-200 shadow-xs">
              <div>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-[11px] font-bold uppercase tracking-wider rounded-full border border-purple-200">
                  Alto Volume (&gt; 60 exames/mês)
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-4">Hospital 24h &amp; Redes</h3>
                <p className="text-xs text-slate-500 mt-1">Para operações contínuas que necessitam de SLA emergencial.</p>

                <div className="my-6 p-4 rounded-2xl bg-purple-50/70 border border-purple-200/70 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Raio-X (Rotina):</span>
                    <strong className="text-purple-800 font-mono text-base">R$ 32,00</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Ultrassom (USG):</span>
                    <strong className="text-purple-800 font-mono text-base">R$ 44,00</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-purple-200">
                    <span className="text-slate-600">SLA Emergência:</span>
                    <span className="text-rose-700 font-bold">Até 45 minutos</span>
                  </div>
                </div>

                <ul className="space-y-3 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Faturamento quinzenal com boleto bancário</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Integração PACS/DICOM direta com seu aparelho</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Gestor de conta e SLA contratual garantido</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Plantão contínuo noturno, finais de semana e feriados</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <Link
                  href="/cadastro"
                  className="w-full py-3 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
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
      <section id="calculadora" className="py-20 bg-slate-50/60 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-8 lg:p-12 shadow-xl shadow-slate-200/50">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              <div className="lg:col-span-6 space-y-6">
                <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Simulador de ROI e Economia</span>
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
                  Quanto sua clínica economiza com a VetTeleRad?
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Contratar um radiologista presencial em tempo integral gera altos custos com encargos trabalhistas, rescisões e horas ociosas. Ajuste o volume mensal estimado da sua clínica e veja a diferença real:
                </p>

                {/* Sliders */}
                <div className="space-y-5 bg-slate-50 border border-slate-200/90 p-6 rounded-2xl">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-semibold text-slate-700">Volume de Raio-X por mês:</span>
                      <span className="font-black text-teal-700 font-mono text-base">{calcXrays} exames</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="150"
                      step="5"
                      value={calcXrays}
                      onChange={e => setCalcXrays(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-semibold text-slate-700">Volume de Ultrassom (USG) por mês:</span>
                      <span className="font-black text-cyan-700 font-mono text-base">{calcUltrasounds} exames</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={calcUltrasounds}
                      onChange={e => setCalcUltrasounds(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                    />
                  </div>
                </div>
              </div>

              {/* Card de Resultados */}
              <div className="lg:col-span-6">
                <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-200 text-xs">
                    <div>
                      <span className="text-slate-500 block mb-1">Custo Médio Presencial</span>
                      <div className="text-xl font-black text-rose-600 font-mono">
                        R$ {calculationResults.inHouseCost.toLocaleString('pt-BR')},00
                      </div>
                      <span className="text-[10px] text-slate-500">Salário CLT + Encargos</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block mb-1">Custo com VetTeleRad</span>
                      <div className="text-xl font-black text-teal-700 font-mono">
                        R$ {calculationResults.teleCost.toLocaleString('pt-BR')},00
                      </div>
                      <span className="text-[10px] text-slate-500">Paga apenas pelo que lauda</span>
                    </div>
                  </div>

                  {/* Grande destaque da economia */}
                  <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                        Economia Estimada por Mês
                      </span>
                      <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {calculationResults.savingsPercent}% de Redução de Custo
                      </span>
                    </div>

                    <div className="text-3xl sm:text-4xl font-black text-emerald-700 font-mono">
                      R$ {calculationResults.monthlySavings.toLocaleString('pt-BR')},00
                    </div>

                    <p className="text-[11px] text-slate-600">
                      Isso representa uma economia de aproximadamente{' '}
                      <strong className="text-emerald-700 font-mono">
                        R$ {calculationResults.annualSavings.toLocaleString('pt-BR')},00 ao ano
                      </strong>{' '}
                      para o fluxo de caixa da sua clínica.
                    </p>
                  </div>

                  <Link
                    href="/cadastro"
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
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
      <section id="corpo-clinico" className="py-20 bg-[#fafbfc] border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-teal-700 bg-teal-100/70 px-3 py-1 rounded-full mb-3">
              Excelência Médica Veterinária
            </span>
            <p className="text-3xl font-black text-slate-900">
              Conheça Nossa Equipe de Especialistas
            </p>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Médicos veterinários pós-graduados e mestres pelas principais universidades do país, com CRMVs ativos e dedicação exclusiva.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.map((doc, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden hover:border-teal-300 hover:shadow-md transition-all duration-200 group flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="h-48 w-full overflow-hidden bg-slate-100 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={doc.image}
                      alt={doc.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-teal-700 transition">
                      {doc.name}
                    </h3>
                    <div className="text-xs font-bold text-teal-700 font-mono">
                      {doc.crmv}
                    </div>
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      {doc.role}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                      {doc.specialty}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200/80">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Plantonista Homologado</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Destaques Técnicos e Recursos */}
      <section className="py-16 bg-slate-50/60 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-rose-200/80 space-y-3 shadow-xs hover:shadow-md transition">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Plantão de Urgência em até 2h
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Para casos críticos de trauma, suspeita de torção gástrica (DVG), corpos estranhos obstrutivos e pneumotórax. Laudo prioritário dia e noite.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-sky-200/80 space-y-3 shadow-xs hover:shadow-md transition">
              <div className="w-10 h-10 rounded-2xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-600">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Cálculo de VHS e Medições
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Visualizador web integrado com régua milimétrica, Vertebral Heart Score (Buchanan) e ângulo de Norberg para displasia coxofemoral.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-emerald-200/80 space-y-3 shadow-xs hover:shadow-md transition">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Assinatura Digital &amp; CRMV
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Todos os laudos contêm registro de responsabilidade técnica no CRMV, hash criptográfico de autenticidade e formatação médica timbrada.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Seção 5: FAQ - Perguntas Frequentes */}
      <section id="faq" className="py-20 bg-[#fafbfc] border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-teal-700 bg-teal-100/70 px-3 py-1 rounded-full mb-3">
              Tire Suas Dúvidas
            </span>
            <p className="text-3xl font-black text-slate-900">
              Perguntas Frequentes (FAQ)
            </p>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Tudo o que você precisa saber sobre o funcionamento da Telerradiologia e Teleultrassonografia.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden hover:border-teal-300/80 transition shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition"
                  >
                    <span className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-teal-600 shrink-0" />
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-teal-600' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 pt-2 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/40">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-10 p-6 bg-teal-50/60 border border-teal-200/80 rounded-3xl text-center space-y-3">
            <span className="text-xs text-slate-600 font-medium">Ainda tem alguma dúvida específica para o seu equipamento ou clínica?</span>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-teal-700">
              <a href="mailto:contato@vettelerad.com.br" className="hover:underline flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> contato@vettelerad.com.br
              </a>
              <span className="text-slate-400">•</span>
              <a href="tel:1130039820" className="hover:underline flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5" /> (11) 3003-9820
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-slate-100/80 py-12 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-xs">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="font-black text-slate-900 text-base">VetTeleRad</span>
              </div>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                Plataforma líder em telerradiologia e teleultrassonografia veterinária para clínicas, centros de diagnóstico e hospitais 24h.
              </p>
            </div>

            <div>
              <h4 className="text-slate-800 font-bold text-xs mb-3 uppercase tracking-wider">Navegação</h4>
              <ul className="space-y-2 text-[11px]">
                <li><a href="#como-funciona" className="hover:text-teal-600 transition">Como Funciona</a></li>
                <li><a href="#precos" className="hover:text-teal-600 transition">Tabela de Preços</a></li>
                <li><a href="#calculadora" className="hover:text-teal-600 transition">Simulador de Economia</a></li>
                <li><a href="#corpo-clinico" className="hover:text-teal-600 transition">Corpo Clínico</a></li>
                <li><a href="#faq" className="hover:text-teal-600 transition">Perguntas Frequentes</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-slate-800 font-bold text-xs mb-3 uppercase tracking-wider">Acesso Rápido</h4>
              <ul className="space-y-2 text-[11px]">
                <li><Link href="/login" className="hover:text-teal-600 transition">Entrar no Portal</Link></li>
                <li><Link href="/cadastro" className="hover:text-teal-600 transition">Cadastrar Clínica Parceira</Link></li>
                <li><Link href="/dashboard" className="hover:text-teal-600 transition">Worklist &amp; Laudos</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-slate-800 font-bold text-xs mb-3 uppercase tracking-wider">Plantão e Contato</h4>
              <div className="space-y-1.5 text-[11px] text-slate-500">
                <div>Central 24h: (11) 3003-9820</div>
                <div>Suporte: contato@vettelerad.com.br</div>
                <div>São Paulo / SP — Atendimento Nacional</div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
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
