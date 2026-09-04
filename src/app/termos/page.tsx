import React from 'react';
import Link from 'next/link';
import { FileText, Shield, Stethoscope, CheckCircle2, ArrowLeft, Calendar, AlertTriangle, Building2, Lock } from 'lucide-react';

export const metadata = {
  title: 'Termos de Serviço e Custódia de Prontuários | VetTeleRad',
  description: 'Contrato de adesão, responsabilidade técnica médico-veterinária e normas de custódia segundo o CFMV.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-900 font-black text-lg">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <span>VetTeleRad <span className="text-teal-600 text-xs uppercase font-bold tracking-wider ml-1">Termos</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-teal-600 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao Início</span>
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 transition"
            >
              <span>Acessar Portal</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-850 to-slate-900 text-white py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Regulamentação Profissional CFMV &amp; CRMV</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Termos de Uso e Acordo de Nível de Serviço (SLA)
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Regras de prestação de serviços de telerradiologia e teleultrassonografia veterinária, responsabilidade técnica compartilhada e validade jurídica dos laudos digitais.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-teal-300/80 font-mono">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Vigência: 2026 • Versão 3.1
            </span>
            <span>•</span>
            <span>Resoluções CFMV nº 1.138/2016, 1.321/2020 e 1.475/2022</span>
          </div>
        </div>
      </section>

      {/* Conteúdo Principal */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        
        {/* Sumário */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">1. Objeto e Natureza do Serviço</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            A plataforma <strong>VetTeleRad</strong> disponibiliza serviços de consultoria e emissão de laudos radiográficos e ultrassonográficos veterinários à distância (Telerradiologia), interligando estabelecimentos médico-veterinários autorizados (clínicas, hospitais, ambulatórios e consultórios) a médicos veterinários especialistas com registro ativo em seus respectivos Conselhos Regionais de Medicina Veterinária (CRMV).
          </p>
        </div>

        {/* Artigo 2: Responsabilidade Técnica Compartilhada */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 font-black text-xs flex items-center justify-center">2</span>
            Divisão de Responsabilidade Técnica Médico-Veterinária
          </h2>
          <div className="text-xs sm:text-sm text-slate-600 space-y-4 leading-relaxed">
            <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-200/80 space-y-2">
              <strong className="text-teal-900 block text-xs">A) Responsabilidade do Médico Veterinário Solicitante (Clínica Parceira):</strong>
              <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700">
                <li>Realização física do exame clínico, anamnese, palpação e estabilização do paciente.</li>
                <li>Aquisição radiográfica ou ultrassonográfica em conformidade com as boas práticas de radioproteção e técnica imaginológica satisfatória (projeções ortogonais adequadas, colimação e densidade ótica).</li>
                <li>Fornecimento fidedigno do histórico clínico, suspeita diagnóstica e exames laboratoriais prévios na requisição.</li>
                <li>Correlação final dos achados do laudo à luz da evolução clínica e adoção da conduta terapêutica ou cirúrgica soberana.</li>
              </ul>
            </div>

            <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-200/80 space-y-2">
              <strong className="text-teal-900 block text-xs">B) Responsabilidade do Especialista Telerradiologista (VetTeleRad):</strong>
              <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700">
                <li>Interpretação técnica minuciosa das imagens submetidas em estações com monitores de grau médico ou calibrados.</li>
                <li>Emissão de laudo estruturado contendo técnica, achados descritivos, impressão diagnóstica conclusiva e recomendações complementares.</li>
                <li>Assinatura com registro CRMV válido e carimbo digital criptográfico verificável.</li>
                <li>Disponibilidade no canal de discussão de casos para esclarecimento de dúvidas pontuais entre veterinários.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Artigo 3: Acordo de Nível de Serviço (SLA) */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 font-black text-xs flex items-center justify-center">3</span>
            Prazos de Atendimento e Compromisso de SLA
          </h2>
          <div className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
            <p>
              Os prazos começam a contar a partir do momento em que o exame e todas as suas imagens mínimas exigidas forem completamente transmitidos:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900 text-xs flex items-center justify-between">
                  <span>Exames de Rotina (Normal)</span>
                  <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 text-[10px]">Até 12 horas</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Casos eletivos, avaliações pré-operatórias programadas e acompanhamentos pós-cirúrgicos sem agravo clínico iminente.
                </p>
              </div>

              <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-200/80 space-y-1">
                <div className="font-bold text-rose-900 text-xs flex items-center justify-between">
                  <span>Plantão de Urgência &amp; Emergência</span>
                  <span className="px-2 py-0.5 rounded bg-rose-200 text-rose-900 text-[10px] font-bold">Até 2 horas</span>
                </div>
                <p className="text-[11px] text-rose-800/80">
                  Casos de trauma, fraturas expostas, suspeita de torção gástrica (GDV), obstrução uretral, dispneia aguda ou abdômen agudo com triagem prioritária na fila do plantão 24 horas.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Artigo 4: Validade da Assinatura Digital e Hash Criptográfico */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 font-black text-xs flex items-center justify-center">4</span>
            Validade Jurídica dos Laudos Digitais
          </h2>
          <div className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
            <p>
              Em conformidade com a <strong>Medida Provisória nº 2.200-2/2001</strong> e com as <strong>Resoluções do CFMV sobre Prontuário Digital (nº 1.321/2020 e 1.475/2022)</strong>:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Todos os laudos emitidos possuem validade legal em todo o território nacional.</li>
              <li>A integridade do documento é atestada por um algoritmo de dispersão criptográfica <strong>SHA-256</strong> gerado no momento exato da liberação do laudo pelo radiologista, impossibilitando qualquer alteração ou adulteração posterior.</li>
              <li>Qualquer autoridade sanitária, fiscal do CRMV ou tutor pode verificar a autenticidade do laudo através do código de validação único impresso no rodapé do documento.</li>
            </ul>
          </div>
        </div>

        {/* Artigo 5: Custódia dos Prontuários e Sigilo */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 font-black text-xs flex items-center justify-center">5</span>
            Custódia Legal e Sigilo Médico-Veterinário
          </h2>
          <div className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
            <p>
              Em obediência ao artigo 15 do Código de Ética do Médico Veterinário (Resolução CFMV nº 1.138/2016), todos os relatórios, hipóteses diagnósticas e imagens radiográficas são cobertos por <strong>sigilo médico-veterinário irrestrito</strong>, podendo ser disponibilizados apenas:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Ao médico veterinário assistente ou à clínica solicitante;</li>
              <li>Ao tutor responsável pelo animal paciente;</li>
              <li>Mediante ordem judicial formal ou requerimento fundamentado de comissão de ética do CRMV/CFMV.</li>
            </ul>
            <p className="pt-1">
              A VetTeleRad garante o armazenamento seguro e redundante dos laudos e imagens pelo prazo mínimo de <strong>5 (cinco) anos</strong>, assegurando que o arquivo nunca seja perdido mesmo em caso de falha de hardware local na clínica parceira.
            </p>
          </div>
        </div>

        {/* Artigo 6: Pagamento, Créditos e Cancelamento */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 font-black text-xs flex items-center justify-center">6</span>
            Condições Comerciais, Saldo e Cancelamento
          </h2>
          <div className="text-xs sm:text-sm text-slate-600 space-y-2 leading-relaxed">
            <p>
              Os laudos podem ser faturados via saldo pré-pago recarregável (PIX ou Cartão com ativação instantânea) ou através de faturamento mensal pós-pago (Planos Pro e Hospitalar).
            </p>
            <p>
              O cancelamento de uma solicitação de laudo é permitido sem ônus desde que o especialista ainda não tenha iniciado a elaboração do laudo técnico (status PENDENTE). Caso o especialista já tenha aberto a worklist e iniciado o parecer (status EM ANDAMENTO), o valor referente ao laudo será integralmente faturado.
            </p>
          </div>
        </div>

        {/* Artigo 7: Foro */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
          <h2 className="text-base font-bold text-slate-900">7. Legislação Aplicável e Foro</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o Foro da Comarca da Capital do Estado de São Paulo como único competente para dirimir quaisquer litígios oriundos deste instrumento, com renúncia expressa a qualquer outro, por mais privilegiado que seja.
          </p>
        </div>

      </main>

      {/* Rodapé */}
      <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© 2026 VetTeleRad Tecnologia Veterinária LTDA. Todos os direitos reservados.</div>
          <div className="flex items-center gap-4">
            <Link href="/privacidade" className="text-teal-600 hover:underline">Política de Privacidade (LGPD)</Link>
            <span>•</span>
            <Link href="/auditoria" className="text-teal-600 hover:underline">Trilha de Auditoria</Link>
            <span>•</span>
            <Link href="/" className="text-teal-600 hover:underline">Página Inicial</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
