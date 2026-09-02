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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs">Carregando laudo oficial...</span>
      </div>
    );
  }

  if (errorMsg || !exam) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full space-y-4 shadow-xl">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-base font-bold text-white">Não foi possível carregar o laudo</h2>
          <p className="text-xs text-slate-400">{errorMsg || 'Exame não localizado'}</p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold"
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
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Painel</span>
        </Link>
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <Activity className="w-4 h-4" />
          <span>VetTeleRad • Protocolo {exam.id}</span>
        </div>
      </div>

      <ReportDocument exam={exam} />
    </div>
  );
}
