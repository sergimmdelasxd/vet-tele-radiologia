import React from 'react';
import Link from 'next/link';
import { Shield, Lock, FileText, CheckCircle2, ArrowLeft, Mail, Phone, ExternalLink, Calendar, Building2 } from 'lucide-react';

export const metadata = {
  title: 'Política de Privacidade e Proteção de Dados (LGPD) | VetTeleRad',
  description: 'Conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018) e guarda de prontuários veterinários pelo CFMV.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-900 font-black text-lg">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <span>VetTeleRad <span className="text-teal-600 text-xs uppercase font-bold tracking-wider ml-1">Jurídico</span></span>
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
      <section className="bg-gradient-to-b from-teal-900 via-slate-900 to-slate-900 text-white py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold">
            <Lock className="w-3.5 h-3.5" />
            <span>Conformidade Legal Rigorosa • Lei nº 13.709/2018 (LGPD)</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Política de Privacidade &amp; Governança de Dados
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Transparência absoluta sobre o tratamento, criptografia, sigilo médico-veterinário e custódia segura das imagens e laudos na plataforma VetTeleRad.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-teal-300/80 font-mono">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Última atualização: 03 de Setembro de 2026
            </span>
            <span>•</span>
            <span>Versão: 2.4 - Em conformidade com Resolução CFMV nº 1.475/2022</span>
          </div>
        </div>
      </section>

      {/* Conteúdo Principal */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        
        {/* Destaque Resumo */}
        <div className="bg-white p-6 rounded-2xl border border-teal-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-teal-800 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
            <span>Compromisso Fundamental da VetTeleRad com a Medicina Veterinária</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            A <strong>VetTeleRad Tecnologia Veterinária LTDA</strong> valoriza a privacidade dos dados de clínicas parceiras, médicos veterinários e tutores de animais. Operamos sob as premissas da <strong>Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)</strong>, do <strong>Código de Ética do Médico Veterinário (Resolução CFMV nº 1.138/2016)</strong> e das normas que regulam o prontuário eletrônico e a telerradiologia no Brasil.
          </p>
        </div>

        {/* Artigo 1 */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 font-black text-xs flex items-center justify-center">1</span>
            Papéis de Tratamento de Dados (Controlador vs. Operador)
          </h2>
          <div className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
            <p>
              Para os fins da legislação aplicável de proteção de dados:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>A Clínica Veterinária ou Hospital Solicitante</strong> atua como <strong>Controlador</strong> dos dados pessoais do tutor e dos dados do paciente animal sob sua tutela médica. É responsabilidade da clínica recolher o consentimento ou apoiar-se na base legal apropriada para o compartilhamento com a central de diagnóstico.
              </li>
              <li>
                <strong>A VetTeleRad</strong> atua como <strong>Operadora</strong> ao processar as requisições, armazenar os arquivos DICOM/imagens e disponibilizar os laudos emitidos pelos médicos veterinários especialistas.
              </li>
              <li>
                <strong>A VetTeleRad</strong> atua como <strong>Controladora</strong> exclusivamente quanto aos dados cadastrais das clínicas, usuários com login na plataforma e faturamento de serviços.
              </li>
            </ul>
          </div>
        </div>

        {/* Artigo 2 */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 font-black text-xs flex items-center justify-center">2</span>
            Dados Coletados e Finalidade Específica
          </h2>
          <div className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
            <p>
              Em obediência ao princípio da necessidade e minimização de dados (Art. 6º, III da LGPD), coletamos estritamente os dados essenciais para o diagnóstico médico-veterinário:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="font-bold text-slate-900 text-xs mb-1">Dados do Paciente Animal</div>
                <div className="text-[11px] text-slate-600 space-y-1">
                  <div>• Espécie, raça, sexo, idade e peso</div>
                  <div>• Suspeita clínica, anamnese e histórico</div>
                  <div>• Imagens radiográficas (DICOM/JPG/PNG) ou ultrassonográficas</div>
                  <div className="text-teal-700 font-medium pt-1">Finalidade: Emissão de laudo diagnóstico acurado.</div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="font-bold text-slate-900 text-xs mb-1">Dados do Tutor / Responsável Legal</div>
                <div className="text-[11px] text-slate-600 space-y-1">
                  <div>• Nome completo</div>
                  <div>• Telefone ou e-mail de contato</div>
                  <div>• CPF (quando exigido para emissão de nota fiscal de serviço)</div>
                  <div className="text-teal-700 font-medium pt-1">Finalidade: Identificação e rastreabilidade do prontuário.</div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="font-bold text-slate-900 text-xs mb-1">Dados do Médico Veterinário Solicitante</div>
                <div className="text-[11px] text-slate-600 space-y-1">
                  <div>• Nome completo e número de CRMV com UF</div>
                  <div>• Nome da clínica ou hospital veterinário parceiro</div>
                  <div>• Telefone profissional para contato de emergência/plantão</div>
                  <div className="text-teal-700 font-medium pt-1">Finalidade: Validação de exercício profissional legal.</div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="font-bold text-slate-900 text-xs mb-1">Logs de Auditoria &amp; Conexão</div>
                <div className="text-[11px] text-slate-600 space-y-1">
                  <div>• Endereço IP e porta lógica de acesso</div>
                  <div>• Data, horário e fuso horário da conexão</div>
                  <div>• Dispositivo, navegador e carimbo de assinatura SHA-256</div>
                  <div className="text-teal-700 font-medium pt-1">Finalidade: Marco Civil da Internet e Trilha de Auditoria LGPD.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Artigo 3 */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 font-black text-xs flex items-center justify-center">3</span>
            Bases Legais para o Tratamento de Dados
          </h2>
          <div className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
            <p>
              O tratamento de dados na plataforma baseia-se nas seguintes hipóteses legais da LGPD (Art. 7º):
            </p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                <strong>Execução de Contrato ou Procedimentos Preliminares (Art. 7º, V):</strong> Necessário para a prestação dos serviços de telerradiologia e elaboração técnica do laudo contratado pela clínica parceira.
              </li>
              <li>
                <strong>Cumprimento de Obrigação Legal e Regulatória (Art. 7º, II):</strong> Guarda de prontuários veterinários por período mínimo de 5 (cinco) anos, conforme Resolução CFMV nº 1.321/2020 e obrigações fiscais perante a Receita Federal do Brasil.
              </li>
              <li>
                <strong>Legítimo Interesse do Controlador (Art. 7º, IX):</strong> Para auditoria interna de segurança cibernética, prevenção contra fraudes e melhoria contínua da precisão diagnóstica através da casoteca veterinária anonimizada.
              </li>
            </ol>
          </div>
        </div>

        {/* Artigo 4 */}
        <div id="seguranca" className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 font-black text-xs flex items-center justify-center">4</span>
            Segurança da Informação, Criptografia e Armazenamento
          </h2>
          <div className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
            <p>
              Adotamos medidas técnicas e organizacionais de padrão internacional para proteção contra acessos não autorizados, vazamentos ou destruição acidental:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 text-xs">
                <strong className="text-emerald-900 block mb-1">Criptografia em Trânsito (TLS 1.3)</strong>
                <span>Todo o tráfego entre seu navegador ou PACS e os servidores é criptografado com certificados SSL/TLS modernos e HSTS ativado.</span>
              </div>
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 text-xs">
                <strong className="text-emerald-900 block mb-1">Criptografia em Repouso (AES-256)</strong>
                <span>Bancos de dados e buckets de armazenamento de exames mantêm dados protegidos por criptografia de chave de 256 bits.</span>
              </div>
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 text-xs">
                <strong className="text-emerald-900 block mb-1">Assinatura com Hash SHA-256</strong>
                <span>Cada laudo veterinário contém um hash criptográfico inviolável que atesta que o laudo não foi alterado após a assinatura do especialista.</span>
              </div>
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 text-xs">
                <strong className="text-emerald-900 block mb-1">Trilha de Auditoria Permanente</strong>
                <span>Cada visualização de prontuário, download de PDF ou alteração de dados gera um registro com carimbo de tempo, IP e identificação do CRMV.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Artigo 5 */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 font-black text-xs flex items-center justify-center">5</span>
            Direitos do Titular dos Dados Pessoais
          </h2>
          <div className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
            <p>
              Em conformidade com o Artigo 18 da LGPD, os titulares de dados pessoais podem exercer seus direitos a qualquer momento:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <strong>Confirmação e Acesso</strong>
                <p className="text-[11px] text-slate-500 mt-1">Saber se seus dados são tratados e obter cópia digital integral.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <strong>Correção de Dados</strong>
                <p className="text-[11px] text-slate-500 mt-1">Solicitar retificação de dados incompletos, inexatos ou desatualizados.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <strong>Portabilidade</strong>
                <p className="text-[11px] text-slate-500 mt-1">Receber os dados em formato estruturado interoperável (CSV ou JSON).</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 italic">
              *Nota legal: A eliminação definitiva de dados de prontuários médicos não poderá ser atendida quando houver dever legal de guarda (Resolução CFMV nº 1.321/2020), mantendo-se os dados bloqueados até o término do prazo decadencial.
            </p>
          </div>
        </div>

        {/* Artigo 6 */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 font-black text-xs flex items-center justify-center">6</span>
            Encarregado de Proteção de Dados (DPO) &amp; Contato Oficial
          </h2>
          <div className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
            <p>
              Nomeamos um Encarregado pelo Tratamento de Dados Pessoais (DPO) para intermediar as solicitações dos titulares e atuar junto à Autoridade Nacional de Proteção de Dados (ANPD):
            </p>
            <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-200/80 space-y-2 text-xs">
              <div><strong>Encarregado (DPO):</strong> Setor de Governança &amp; Compliance VetTeleRad</div>
              <div><strong>E-mail de Contato Direto:</strong> <a href="mailto:dpo@vettelerad.com.br" className="text-teal-700 font-bold underline">dpo@vettelerad.com.br</a></div>
              <div><strong>Canal de Suporte Geral:</strong> <a href="mailto:contato@vettelerad.com.br" className="text-teal-700 font-bold underline">contato@vettelerad.com.br</a> • Tel: (11) 3003-9820</div>
              <div><strong>Endereço Sede:</strong> Av. Paulista, 1000 - Bela Vista, São Paulo - SP, CEP: 01310-100</div>
            </div>
          </div>
        </div>

      </main>

      {/* Rodapé */}
      <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© 2026 VetTeleRad Tecnologia Veterinária LTDA. CNPJ: 12.345.678/0001-90</div>
          <div className="flex items-center gap-4">
            <Link href="/termos" className="text-teal-600 hover:underline">Termos de Uso</Link>
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
