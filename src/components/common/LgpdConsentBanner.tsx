'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, X, ArrowRight, Lock } from 'lucide-react';

export const LgpdConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('vettelerad_lgpd_consent');
      if (!consent) {
        setIsVisible(true);
      }
    } catch {}
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem('vettelerad_lgpd_consent', JSON.stringify({
        accepted: true,
        timestamp: new Date().toISOString()
      }));
    } catch {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside aria-label="Consentimento de Privacidade e Cookies" className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-xl z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900/95 backdrop-blur-md border border-teal-500/30 text-white p-4 sm:p-5 rounded-2xl shadow-2xl shadow-slate-950/60 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-white">
                Privacidade &amp; Conformidade LGPD
              </h4>
              <span className="text-[10px] text-teal-300 font-semibold block">
                Lei nº 13.709/2018 &amp; Resoluções CFMV
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsVisible(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            title="Fechar aviso"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Utilizamos criptografia de ponta a ponta (TLS 1.3 e repouso AES-256) e cookies essenciais para garantir a segurança dos prontuários veterinários, autenticação e custódia legal dos laudos radiográficos.
        </p>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-3 text-[11px]">
            <Link href="/privacidade" className="text-teal-400 hover:text-teal-300 underline font-medium">
              Política de Privacidade
            </Link>
            <span className="text-slate-600">•</span>
            <Link href="/termos" className="text-teal-400 hover:text-teal-300 underline font-medium">
              Termos de Uso
            </Link>
          </div>

          <button
            type="button"
            onClick={handleAccept}
            className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-500/20 transition cursor-pointer active:scale-95"
          >
            Entendi e Concordo
          </button>
        </div>
      </div>
    </aside>
  );
};
