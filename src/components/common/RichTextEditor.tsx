'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify, 
  RemoveFormatting, 
  Type, 
  Sparkles,
  Plus,
  Mic,
  MicOff,
  Zap,
  Check
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
}

const QUICK_MACROS = [
  {
    category: 'Tórax & Coração (RX)',
    items: [
      { label: 'Tórax Normal', text: '<p>Silhueta cardíaca com dimensões e conformação habituais. Campos pulmonares com radiopacidade e trama broncovascular preservadas. Traqueia torácica e cúpula diafragmática íntegras.</p>' },
      { label: 'Cardiomegalia / VHS Elevado', text: '<p>Aumento da silhueta cardíaca com elevação da traqueia torácica e contato esternal aumentado. VHS acima dos limites fisiológicos da espécie.</p>' },
      { label: 'Padrão Broncoalveolar', text: '<p>Aumento da radiopacidade pulmonar com infiltrado de padrão misto broncoalveolar e reforço peribrônquico difuso, sugerindo processo inflamatório/infeccioso.</p>' }
    ]
  },
  {
    category: 'Abdômen & Órgãos (RX/USG)',
    items: [
      { label: 'Abdômen Normal (RX)', text: '<p>Órgãos abdominais com distribuição gasosa fisiológica. Contraste seroso e detalhes peritoneais preservados. Ausência de corpos estranhos radiopacos evidentes.</p>' },
      { label: 'Ultrassom Abdominal Normal', text: '<p>Fígado com dimensões preservadas e ecotextura homogênea. Vesícula biliar repleta com conteúdo anecogênico e paredes finas. Baço, rins e bexiga sem alterações ecográficas.</p>' },
      { label: 'Sedimento / Cistite (USG)', text: '<p>Vesícula urinária moderadamente repleta, apresentando discreto espessamento parietal irregular e quantidade moderada de sedimento ecogênico em suspensão.</p>' }
    ]
  },
  {
    category: 'Ortopedia & Coluna',
    items: [
      { label: 'Espondilose Deformante', text: '<p>Presença de osteófitos ventromarginais em pontes ósseas (espondilose deformante) em corpos vertebrais lombares, sem sinais de lise óssea ativa.</p>' },
      { label: 'Displasia Coxofemoral', text: '<p>Incongruência articular coxofemoral bilateral com arrasamento acetabular, espessamento de colos e esclerose marginal da cabeça femoral.</p>' },
      { label: 'Sem Sinais de Fratura', text: '<p>Ausência de soluções de continuidade óssea, desvios axiais ou lesões líticas/proliferativas agressivas nas estruturas esqueléticas avaliadas.</p>' }
    ]
  }
];

const FONT_FAMILIES = [
  { label: 'Padrão (Inter / Sans)', value: 'Inter, system-ui, -apple-system, sans-serif' },
  { label: 'Arial (Corporativo)', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Times New Roman (Acadêmico)', value: "'Times New Roman', Times, serif" },
  { label: 'Calibri (Médico Suave)', value: 'Calibri, Candara, Segoe, sans-serif' },
  { label: 'Georgia (Editorial Serif)', value: 'Georgia, serif' },
  { label: 'Courier New (Laudo Técnico)', value: "'Courier New', Courier, monospace" }
];

const FONT_SIZES = [
  { label: 'Pequeno (11px)', value: '11px' },
  { label: 'Padrão (13px)', value: '13px' },
  { label: 'Médio (15px)', value: '15px' },
  { label: 'Destaque (17px)', value: '17px' },
  { label: 'Subtítulo (20px)', value: '20px' },
  { label: 'Título (24px)', value: '24px' }
];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Descreva os achados radiográficos/ecográficos e a impressão diagnóstica...',
  minHeight = '360px',
  className = ''
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [selectedFont, setSelectedFont] = useState<string>(FONT_FAMILIES[0].value);
  const [selectedSize, setSelectedSize] = useState<string>(FONT_SIZES[1].value);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      if (html === '<br>' || html === '<p><br></p>' || html === '<div><br></div>') {
        onChange('');
      } else {
        onChange(html);
      }
    }
  }, [onChange]);

  // Inicializar Web Speech Recognition (Ditado por Voz para Laudos)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'pt-BR';

        recognition.onresult = (event: any) => {
          const results = event.results;
          const transcript = results[results.length - 1][0].transcript;
          if (transcript && transcript.trim()) {
            editorRef.current?.focus();
            const textToInsert = ' ' + transcript.trim() + '. ';
            document.execCommand('insertText', false, textToInsert);
            handleInput();
          }
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setSpeechError('Não foi possível capturar o áudio. Verifique o microfone.');
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [handleInput]);

  const toggleListening = () => {
    setSpeechError(null);
    if (!speechSupported) {
      alert('O seu navegador atual não suporta a API nativa de reconhecimento de voz. Recomendamos utilizar o Google Chrome ou Microsoft Edge para usar o ditado por voz.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      editorRef.current?.focus();
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error('Falha ao iniciar reconhecimento:', err);
      }
    }
  };

  // Inserir trecho HTML na posição do cursor
  const insertHtmlSnippet = (html: string) => {
    editorRef.current?.focus();
    document.execCommand('insertHTML', false, html);
    handleInput();
  };

  // Sincronizar o valor externo apenas quando houver diferença real
  useEffect(() => {
    if (editorRef.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  // Executar comandos padrão de formatação
  const execCmd = (command: string, arg: string = '') => {
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    handleInput();
  };

  // Alterar tamanho da fonte com precisão em px
  const applyFontSize = (sizePx: string) => {
    setSelectedSize(sizePx);
    editorRef.current?.focus();
    document.execCommand('fontSize', false, '7');
    
    if (editorRef.current) {
      const fontTags = editorRef.current.getElementsByTagName('font');
      for (let i = 0; i < fontTags.length; i++) {
        const font = fontTags[i];
        if (font.getAttribute('size') === '7') {
          font.removeAttribute('size');
          font.style.fontSize = sizePx;
        }
      }
    }
    handleInput();
  };

  // Alterar família de fonte
  const applyFontFamily = (family: string) => {
    setSelectedFont(family);
    editorRef.current?.focus();
    document.execCommand('fontName', false, family);
    handleInput();
  };

  // Inserir títulos de seções padronizadas do laudo com 1 clique (sem tabelas verdes)
  const insertSectionTitle = (title: string) => {
    editorRef.current?.focus();
    const snippet = `<p style="margin-top: 14px; margin-bottom: 6px;"><strong style="color: #0f172a; font-size: 13px; text-decoration: underline;">${title}</strong></p><p><br></p>`;
    document.execCommand('insertHTML', false, snippet);
    handleInput();
  };

  return (
    <div className={`flex flex-col border rounded-2xl overflow-hidden transition-all duration-200 bg-white shadow-xs ${
      isFocused ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-slate-200/90'
    } ${className}`}>
      {/* BARRA DE FERRAMENTAS DO EDITOR */}
      <div 
        className="flex flex-wrap items-center gap-1.5 p-2.5 bg-slate-50 border-b border-slate-200 text-slate-700 select-none"
        onMouseDown={(e) => {
          if ((e.target as HTMLElement).tagName !== 'SELECT') {
            e.preventDefault();
          }
        }}
      >
        {/* Seletor de Família de Fonte */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2 py-1 shadow-2xs">
          <Type className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <select
            value={selectedFont}
            onChange={(e) => applyFontFamily(e.target.value)}
            className="bg-transparent text-xs text-slate-800 font-medium outline-none cursor-pointer pr-1"
            title="Mudar Família da Fonte"
          >
            {FONT_FAMILIES.map((font) => (
              <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                {font.label}
              </option>
            ))}
          </select>
        </div>

        {/* Seletor de Tamanho de Fonte */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2 py-1 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 shrink-0">Tam:</span>
          <select
            value={selectedSize}
            onChange={(e) => applyFontSize(e.target.value)}
            className="bg-transparent text-xs text-slate-800 font-medium outline-none cursor-pointer pr-1"
            title="Mudar Tamanho da Fonte"
          >
            {FONT_SIZES.map((size) => (
              <option key={size.value} value={size.value}>
                {size.label}
              </option>
            ))}
          </select>
        </div>

        <div className="h-5 w-px bg-slate-200 mx-0.5" />

        {/* Formatação Básica: Negrito, Itálico, Sublinhado */}
        <div className="flex items-center gap-0.5 bg-white border border-slate-200 rounded-xl p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={() => execCmd('bold')}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 hover:text-slate-900 transition font-bold cursor-pointer"
            title="Negrito (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('italic')}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 hover:text-slate-900 transition italic cursor-pointer"
            title="Itálico (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('underline')}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 hover:text-slate-900 transition underline cursor-pointer"
            title="Sublinhado (Ctrl+U)"
          >
            <Underline className="w-4 h-4" />
          </button>
        </div>

        <div className="h-5 w-px bg-slate-200 mx-0.5" />

        {/* Listas */}
        <div className="flex items-center gap-0.5 bg-white border border-slate-200 rounded-xl p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={() => execCmd('insertUnorderedList')}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 hover:text-slate-900 transition cursor-pointer"
            title="Lista com Marcadores"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('insertOrderedList')}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 hover:text-slate-900 transition cursor-pointer"
            title="Lista Numerada"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
        </div>

        {/* Alinhamento */}
        <div className="hidden sm:flex items-center gap-0.5 bg-white border border-slate-200 rounded-xl p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={() => execCmd('justifyLeft')}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 hover:text-slate-900 transition cursor-pointer"
            title="Alinhar à Esquerda"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('justifyCenter')}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 hover:text-slate-900 transition cursor-pointer"
            title="Centralizar"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('justifyRight')}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 hover:text-slate-900 transition cursor-pointer"
            title="Alinhar à Direita"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('justifyFull')}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 hover:text-slate-900 transition cursor-pointer"
            title="Justificar"
          >
            <AlignJustify className="w-4 h-4" />
          </button>
        </div>

        {/* Limpar Formatação */}
        <button
          type="button"
          onClick={() => execCmd('removeFormat')}
          className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 transition cursor-pointer shadow-2xs"
          title="Limpar Formatação da Seleção"
        >
          <RemoveFormatting className="w-4 h-4" />
        </button>

        <div className="h-5 w-px bg-slate-200 mx-0.5" />

        {/* DITADO POR VOZ */}
        <button
          type="button"
          onClick={toggleListening}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer ${
            isListening 
              ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse ring-2 ring-rose-300' 
              : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
          }`}
          title={isListening ? "Clique para pausar o ditado por voz" : "Clique e fale para ditar o laudo por voz"}
        >
          {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          <span>{isListening ? 'Ouvindo...' : 'Ditar por Voz'}</span>
        </button>

        {/* MENU DE FRASES RÁPIDAS / MACROS */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2 py-1 shadow-2xs">
          <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <select
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                insertHtmlSnippet(e.target.value);
                e.target.value = '';
              }
            }}
            className="bg-transparent text-xs text-slate-800 font-medium outline-none cursor-pointer pr-1 max-w-[170px]"
            title="Inserir Frase Rápida / Macro Pré-configurada"
          >
            <option value="" disabled>⚡ Frases Rápidas...</option>
            {QUICK_MACROS.map((group) => (
              <optgroup key={group.category} label={group.category}>
                {group.items.map((item) => (
                  <option key={item.label} value={item.text}>
                    {item.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* ATALHOS RÁPIDOS DE SEÇÃO */}
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden xl:inline">
            Títulos:
          </span>
          <button
            type="button"
            onClick={() => insertSectionTitle('DESCRIÇÃO DOS ACHADOS:')}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 transition cursor-pointer shadow-2xs"
            title="Inserir cabeçalho de Achados"
          >
            <Plus className="w-3 h-3 text-slate-500" />
            <span>+ Achados</span>
          </button>
          <button
            type="button"
            onClick={() => insertSectionTitle('IMPRESSÃO DIAGNÓSTICA:')}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl text-[11px] font-bold text-teal-800 transition cursor-pointer shadow-2xs"
            title="Inserir cabeçalho de Impressão Diagnóstica"
          >
            <Sparkles className="w-3 h-3 text-teal-600" />
            <span>+ Impressão</span>
          </button>
        </div>
      </div>

      {/* STATUS DE DITADO ATIVO */}
      {isListening && (
        <div className="px-4 py-2 bg-rose-50 border-b border-rose-200/80 flex items-center justify-between text-xs text-rose-800 animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span className="font-semibold">Microfone ativo: Fale pausadamente os achados clínicos e diagnósticos...</span>
          </div>
          <button 
            type="button" 
            onClick={toggleListening}
            className="text-[11px] font-bold text-rose-700 hover:text-rose-900 underline cursor-pointer"
          >
            Pausar Gravação
          </button>
        </div>
      )}

      {speechError && (
        <div className="px-4 py-1.5 bg-amber-50 border-b border-amber-200 text-xs text-amber-800 flex items-center justify-between">
          <span>{speechError}</span>
          <button type="button" onClick={() => setSpeechError(null)} className="font-bold ml-2">✕</button>
        </div>
      )}

      {/* ÁREA EDITÁVEL DO LAUDO (CONTENT EDITABLE) */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{ minHeight }}
        className="w-full p-5 text-slate-900 text-xs sm:text-sm leading-relaxed outline-none overflow-y-auto focus:bg-white font-sans selection:bg-teal-500 selection:text-white"
        data-placeholder={placeholder}
      />
    </div>
  );
};
