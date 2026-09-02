'use client';

import React from 'react';
import { 
  Printer, 
  ShieldCheck, 
  Activity, 
  User, 
  Building2, 
  Stethoscope, 
  Heart,
  QrCode,
  Waves
} from 'lucide-react';
import { Exam } from '@/types';

interface ReportDocumentProps {
  exam: Exam;
  onClose?: () => void;
}

export const ReportDocument: React.FC<ReportDocumentProps> = ({ exam, onClose }) => {
  const report = exam.report;
  const isUltrasound = exam.modality === 'ULTRASSOM';

  if (!report) {
    return (
      <div className="p-8 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-400">
        Este exame ainda não possui laudo emitido.
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  // Imagens-chave anexadas
  const keyImages = exam.images.filter(
    img => !report.keyImageIds || report.keyImageIds.length === 0 || report.keyImageIds.includes(img.id)
  );

  return (
    <div className="space-y-4">
      {/* Barra de Ações (Oculta na Impressão) */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-xl print:hidden">
        <div className="flex items-center gap-2 text-slate-200 text-sm">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <span className="font-semibold">
            {isUltrasound ? 'Laudo Ultrassonográfico Concluído' : 'Laudo Radiográfico Concluído'} • Assinado Digitalmente
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onClose && (
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              Fechar
            </button>
          )}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold shadow-md shadow-cyan-500/20 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Salvar em PDF</span>
          </button>
        </div>
      </div>

      {/* Papel Timbrado do Laudo (Estilo A4 Médico) */}
      <div className="bg-white text-slate-900 p-8 sm:p-12 rounded-2xl shadow-2xl max-w-4xl mx-auto border border-slate-200 print:border-0 print:shadow-none print:p-0 print:m-0 font-sans">
        
        {/* Cabeçalho Oficial */}
        <div className="border-b-2 border-cyan-600 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md">
              {isUltrasound ? <Waves className="w-7 h-7" /> : <Activity className="w-7 h-7" />}
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Vet<span className="text-cyan-600">Tele</span>Rad
              </h1>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {isUltrasound
                  ? 'Centro Especializado de Ultrassonografia Veterinária'
                  : 'Centro Especializado de Telerradiologia Veterinária'}
              </p>
            </div>
          </div>

          <div className="text-right text-xs text-slate-500 sm:border-l sm:border-slate-200 sm:pl-4">
            <div className="font-bold text-slate-700">Central Nacional de Laudos</div>
            <div>contato@vettelerad.com.br • (11) 3003-9820</div>
            <div className="font-mono text-[11px] text-slate-400 mt-0.5">
              Protocolo: <strong>{exam.id}</strong> | Tipo: <strong>{isUltrasound ? 'ULTRASSOM' : 'RAIO-X'}</strong>
            </div>
          </div>
        </div>

        {/* Título do Laudo */}
        <div className="mt-4 text-center">
          <span className="inline-block px-3 py-1 bg-slate-100 text-slate-800 text-[11px] font-black uppercase tracking-widest rounded-full border border-slate-300">
            {isUltrasound
              ? 'LAUDO DE ULTRASSONOGRAFIA VETERINÁRIA'
              : 'LAUDO DE RADIOGRAFIA VETERINÁRIA'}
          </span>
        </div>

        {/* Informações do Paciente e da Clínica */}
        <div className="my-5 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
          {/* Dados do Paciente */}
          <div className="space-y-1.5 border-b md:border-b-0 md:border-r border-slate-200 pb-3 md:pb-0 md:pr-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-800 flex items-center gap-1">
              <User className="w-3.5 h-3.5" /> Dados do Paciente
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              <div><span className="text-slate-500">Nome:</span> <strong className="text-slate-900">{exam.patientName}</strong></div>
              <div><span className="text-slate-500">Espécie:</span> <strong className="text-slate-900">{exam.species}</strong></div>
              <div><span className="text-slate-500">Raça:</span> <strong>{exam.breed}</strong></div>
              <div><span className="text-slate-500">Idade:</span> <strong>{exam.age}</strong></div>
              <div><span className="text-slate-500">Sexo / Castrado:</span> <strong>{exam.gender} ({exam.isCastrated ? 'Castrado' : 'Inteiro'})</strong></div>
              <div><span className="text-slate-500">Peso:</span> <strong>{exam.weight}</strong></div>
              <div className="col-span-2"><span className="text-slate-500">Tutor:</span> <strong>{exam.ownerName}</strong></div>
            </div>
          </div>

          {/* Dados da Clínica e Solicitante */}
          <div className="space-y-1.5 md:pl-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-800 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" /> Clínica Solicitante
            </div>
            <div className="space-y-1">
              <div><span className="text-slate-500">Estabelecimento:</span> <strong className="text-slate-900">{exam.clinicName}</strong></div>
              <div><span className="text-slate-500">Médico Solicitante:</span> <strong>{exam.requestingVet}</strong></div>
              <div><span className="text-slate-500">Exame Realizado:</span> <strong className="text-cyan-700">{exam.region}</strong></div>
              {isUltrasound && exam.fastingHours && (
                <div><span className="text-slate-500">Preparo Clínico:</span> <strong>{exam.fastingHours}</strong></div>
              )}
              <div><span className="text-slate-500">Data do Exame:</span> <strong>{new Date(exam.createdAt).toLocaleDateString('pt-BR')}</strong></div>
            </div>
          </div>
        </div>

        {/* Histórico Clínico Informado */}
        {exam.clinicalHistory && (
          <div className="mb-5 bg-amber-50/70 border border-amber-200/80 p-3 rounded-lg text-xs">
            <span className="font-bold text-amber-900 block mb-0.5">Histórico Clínico e Suspeita:</span>
            <p className="text-slate-700 italic">
              &quot;{exam.clinicalHistory}&quot; {exam.suspectedDiagnosis ? `— Suspeita: ${exam.suspectedDiagnosis}` : ''}
            </p>
          </div>
        )}

        {/* Seções do Laudo */}
        <div className="space-y-6 text-xs text-slate-800 leading-relaxed">
          {/* Técnica */}
          <div>
            <h2 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2">
              {isUltrasound ? '1. Técnica e Equipamentos Utilizados' : '1. Técnica Radiográfica'}
            </h2>
            <p className="text-slate-700">{report.technique}</p>
          </div>

          {/* Descrição dos Achados */}
          <div>
            <h2 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2">
              {isUltrasound ? '2. Descrição dos Achados Ecográficos dos Órgãos' : '2. Descrição dos Achados Radiográficos'}
            </h2>
            <div className="whitespace-pre-line text-slate-800 font-normal space-y-2">
              {report.findings}
            </div>
          </div>

          {/* Mensurações Especiais de Radiografia (VHS) */}
          {!isUltrasound && (report.vhsScore || report.norbergAngle) && (
            <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-xl flex items-center gap-6">
              {report.vhsScore && (
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-cyan-900 block">VHS (Buchanan & Bücheler)</span>
                    <strong className="text-sm text-slate-900">{report.vhsScore}</strong>
                  </div>
                </div>
              )}
              {report.norbergAngle && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-cyan-900 block">Ângulo de Norberg</span>
                  <strong className="text-sm text-slate-900">{report.norbergAngle}</strong>
                </div>
              )}
            </div>
          )}

          {/* Conclusão Diagnóstica */}
          <div className="p-4 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 print:bg-slate-100 print:text-slate-900 print:border-slate-300">
            <h2 className="text-xs font-bold text-cyan-400 print:text-cyan-800 uppercase tracking-wider mb-1.5">
              3. Conclusão Diagnóstica
            </h2>
            <div className="whitespace-pre-line font-semibold text-xs leading-relaxed">
              {report.conclusion}
            </div>
          </div>

          {/* Recomendações */}
          {report.recommendations && (
            <div>
              <h2 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2">
                4. Recomendações e Considerações Finais
              </h2>
              <p className="text-slate-700">{report.recommendations}</p>
            </div>
          )}

          {/* Imagens Anexas */}
          {keyImages.length > 0 && (
            <div className="pt-2 print:page-break-before-auto">
              <h2 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200 pb-1 mb-3">
                {isUltrasound ? 'Cortes Ecográficos Selecionados de Referência' : 'Imagens Radiográficas de Referência'}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {keyImages.map((img, idx) => (
                  <div key={img.id || idx} className="border border-slate-200 rounded-xl p-2 bg-slate-50 flex flex-col items-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={img.url} 
                      alt={img.label} 
                      className="max-h-48 w-auto object-contain rounded-lg bg-black shadow-sm"
                    />
                    <span className="text-[10px] text-slate-500 font-medium mt-1.5 text-center">
                      {img.label || `Corte ${idx + 1}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Rodapé e Carimbo */}
        <div className="mt-10 pt-6 border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Autenticação Digital e QR Code */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-slate-100 border border-slate-300 rounded-lg flex items-center justify-center text-slate-700">
              <QrCode className="w-10 h-10" />
            </div>
            <div className="text-[10px] text-slate-500 space-y-0.5">
              <div className="font-bold text-slate-700">Autenticidade Verificada</div>
              <div>Emitido em: {new Date(report.reportedAt).toLocaleString('pt-BR')}</div>
              <div className="font-mono text-[9px] text-slate-400 max-w-[220px] truncate">
                Hash: {report.digitalSignatureHash}
              </div>
            </div>
          </div>

          {/* Carimbo / Assinatura do Especialista */}
          <div className="text-center sm:text-right border-t sm:border-t-0 sm:border-l border-slate-200 pt-4 sm:pt-0 sm:pl-6">
            <div className="font-serif italic text-lg text-slate-700 font-semibold mb-1">
              {report.radiologistName}
            </div>
            <div className="text-xs font-bold text-slate-900">
              {report.radiologistName}
            </div>
            <div className="text-xs text-cyan-700 font-mono font-medium">
              {report.radiologistCrmv}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
              {isUltrasound ? 'Médica Veterinária Ultrassonografista' : 'Médica Veterinária Radiologista'}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
