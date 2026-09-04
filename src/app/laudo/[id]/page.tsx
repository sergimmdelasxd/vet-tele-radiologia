'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Activity, ArrowLeft, AlertCircle } from 'lucide-react';
import { ReportDocument } from '@/components/report/ReportDocument';
import { Exam } from '@/types';

export default function StandaloneReportPage() {
  const params = useParams();
  const id = params?.id as string;

  const [exam, setExam] = useState<Exam | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/exams/${id}`)
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Exame não encontrado ou acesso restrito');
        }
        setExam(data.exam);
      })
      .catch(err => {
        setErrorMsg(err.message);
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafbfc] flex flex-col items-center justify-center text-slate-500 gap-3">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-medium">Carregando laudo oficial...</span>
      </div>
    );
  }

  if (errorMsg || !exam) {
    return (
      <div className="min-h-screen bg-[#fafbfc] flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-white border border-slate-200/90 p-8 rounded-3xl max-w-md w-full space-y-4 shadow-xl shadow-slate-200/50">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-base font-bold text-slate-900">Não foi possível carregar o laudo</h2>
          <p className="text-xs text-slate-600">{errorMsg || 'Exame não localizado'}</p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-500/20 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Fazer Login no Portal</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-800 py-8 px-4 sm:px-6 lg:px-8 font-sans print:bg-white print:p-0 relative selection:bg-teal-500 selection:text-white">
      {/* Brilhos Ambientais Pastéis (Ocultos na Impressão) */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-gradient-to-tr from-sky-100/50 via-teal-100/40 to-amber-50/40 blur-[120px] pointer-events-none print:hidden" />

      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden relative z-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200/90 px-3.5 py-2 rounded-xl shadow-xs transition"
        >
          <ArrowLeft className="w-4 h-4 text-teal-600" />
          <span>Voltar à Worklist</span>
        </Link>
        <div className="flex items-center gap-2 text-xs font-mono bg-teal-50 text-teal-800 border border-teal-200/80 px-3 py-1.5 rounded-xl font-bold shadow-xs">
          <Activity className="w-4 h-4 text-teal-600" />
          <span>VetTeleRad • Protocolo {exam.id}</span>
        </div>
      </div>

      <div className="relative z-10">
        <ReportDocument exam={exam} />
      </div>
    </div>
  );
}
