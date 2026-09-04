'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
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
  Check,
  Settings,
  ExternalLink
} from 'lucide-react';
import { QuickPhrase } from '@/types';

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

  // Estados de Frases Rápidas e Comando / (Slash Command)
  const [dbPhrases, setDbPhrases] = useState<QuickPhrase[]>([]);
  const [isSlashOpen, setIsSlashOpen] = useState<boolean>(false);
  const [slashQuery, setSlashQuery] = useState<string>('');
  const [slashSelectedIndex, setSlashSelectedIndex] = useState<number>(0);
  const [slashPos, setSlashPos] = useState<{ top: number; left: number } | null>(null);

  // Carregar frases rápidas cadastradas do banco de dados
  useEffect(() => {
    fetch('/api/macros')
      .then(res => res.json())
      .then(data => {
        if (data.phrases && data.phrases.length > 0) {
          setDbPhrases(data.phrases);
        }
      })
      .catch(() => {});
  }, []);

  // Lista unificada de macros disponíveis
  const availableMacros = useMemo(() => {
    if (dbPhrases.length > 0) return dbPhrases;
    const fallbackList: QuickPhrase[] = [];
    QUICK_MACROS.forEach(cat => {
      cat.items.forEach(item => {
        fallbackList.push({
          id: item.label,
          shortcut: '/' + item.label.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 15),
          title: item.label,
          category: cat.category,
          content: item.text,
          createdAt: ''
        });
      });
    });
    return fallbackList;
  }, [dbPhrases]);

  // Filtro dinâmico para o menu flutuante acionado por /
  const filteredMacros = useMemo(() => {
    if (!slashQuery) return availableMacros.slice(0, 8);
    const q = slashQuery.toLowerCase();
    return availableMacros
      .filter(m => 
        m.shortcut.toLowerCase().includes(q) ||
        m.title.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [availableMacros, slashQuery]);

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

  // Detectar se o usuário digitou "/" e obter coordenadas para exibir o menu flutuante
  const checkSlashTrigger = () => {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) {
      setIsSlashOpen(false);
      return;
    }

    const range = sel.getRangeAt(0);
    const textNode = range.startContainer;
    if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
      setIsSlashOpen(false);
      return;
    }

    const fullText = textNode.textContent || '';
    const offset = range.startOffset;
    const textBefore = fullText.slice(0, offset);

    const lastSlash = textBefore.lastIndexOf('/');
    if (lastSlash === -1) {
      setIsSlashOpen(false);
      return;
    }

    const charBefore = lastSlash > 0 ? textBefore[lastSlash - 1] : ' ';
    if (charBefore !== ' ' && charBefore !== '\n' && charBefore !== '\u00A0' && lastSlash !== 0) {
      setIsSlashOpen(false);
      return;
    }

    const query = textBefore.slice(lastSlash + 1);
    if (query.includes(' ') || query.includes('\n') || query.length > 25) {
      setIsSlashOpen(false);
      return;
    }

    setSlashQuery(query.toLowerCase());
    setIsSlashOpen(true);
    setSlashSelectedIndex(0);

    const rect = range.getBoundingClientRect();
    const containerRect = editorRef.current?.getBoundingClientRect();
    if (rect && containerRect) {
      const top = Math.max(10, rect.bottom - containerRect.top + 8);
      const left = Math.min(Math.max(8, rect.left - containerRect.left), Math.max(10, (containerRect.width || 400) - 340));
      setSlashPos({ top, left });
    }
  };

  // Inserir macro substituindo o termo "/termo" digitado
  const insertSelectedMacro = (macro: { content: string }) => {
    if (!macro) return;
    const sel = window.getSelection();
    if (sel && sel.rangeCount) {
      const range = sel.getRangeAt(0);
      const textNode = range.startContainer;
      if (textNode && textNode.nodeType === Node.TEXT_NODE) {
        const fullText = textNode.textContent || '';
        const offset = range.startOffset;
        const lastSlash = fullText.lastIndexOf('/', offset - 1);
        if (lastSlash !== -1) {
          const deleteRange = document.createRange();
          deleteRange.setStart(textNode, lastSlash);
          deleteRange.setEnd(textNode, offset);
          deleteRange.deleteContents();
          sel.removeAllRanges();
          sel.addRange(deleteRange);
        }
      }
    }

    editorRef.current?.focus();
    document.execCommand('insertHTML', false, macro.content);
    setIsSlashOpen(false);
    setSlashQuery('');
    handleInput();
  };

  // Navegação por teclado no menu / (Setas Cima/Baixo, Enter, Tab e Esc)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isSlashOpen && filteredMacros.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSlashSelectedIndex(prev => (prev + 1) % filteredMacros.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSlashSelectedIndex(prev => (prev - 1 + filteredMacros.length) % filteredMacros.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertSelectedMacro(filteredMacros[slashSelectedIndex]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsSlashOpen(false);
        return;
      }
    }
  };

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
            className="bg-transparent text-xs text-slate-800 font-medium outline-none cursor-pointer pr-1 max-w-[145px]"
            title="Inserir Frase Rápida / Macro Pré-configurada (ou digite / no laudo)"
          >
            <option value="" disabled>⚡ Frases (/) ...</option>
            {Object.entries(
              availableMacros.reduce<Record<string, typeof availableMacros>>((acc, item) => {
                acc[item.category] = acc[item.category] || [];
                acc[item.category].push(item);
                return acc;
              }, {})
            ).map(([category, items]) => (
              <optgroup key={category} label={category}>
                {items.map((item) => (
                  <option key={item.id || item.shortcut} value={item.content}>
                    {item.shortcut} - {item.title}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <a
            href="/frases-rapidas"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-teal-700 transition"
            title="Gerenciar e cadastrar novas frases rápidas"
          >
            <Settings className="w-3 h-3" />
          </a>
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

      {/* ÁREA EDITÁVEL DO LAUDO (CONTENT EDITABLE) COM MENU FLUTUANTE DE / */}
      <div className="relative flex-1 flex flex-col">
        <div
          ref={editorRef}
          contentEditable
          onInput={() => {
            handleInput();
            checkSlashTrigger();
          }}
          onKeyUp={checkSlashTrigger}
          onKeyDown={handleKeyDown}
          onClick={checkSlashTrigger}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            setTimeout(() => setIsSlashOpen(false), 250);
          }}
          style={{ minHeight }}
          className="w-full p-5 text-slate-900 text-xs sm:text-sm leading-relaxed outline-none overflow-y-auto focus:bg-white font-sans selection:bg-teal-500 selection:text-white flex-1"
          data-placeholder={placeholder}
        />

        {/* MENU FLUTUANTE DE COMANDO / (SLASH COMMAND POPOVER) */}
        {isSlashOpen && filteredMacros.length > 0 && (
          <div
            style={{
              top: slashPos?.top ?? 30,
              left: slashPos?.left ?? 20
            }}
            className="absolute z-50 w-80 max-w-[90vw] bg-white border border-slate-200/90 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col"
            onMouseDown={e => e.preventDefault()}
          >
            {/* Header do Menu */}
            <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5 font-bold text-slate-700">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Frases Rápidas {slashQuery ? `(/${slashQuery})` : ''}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">↑ ↓ Enter</span>
            </div>

            {/* Lista de Macros filtradas */}
            <div className="max-h-60 overflow-y-auto p-1 space-y-0.5">
              {filteredMacros.map((macro, idx) => (
                <button
                  key={macro.id || idx}
                  type="button"
                  onClick={() => insertSelectedMacro(macro)}
                  onMouseEnter={() => setSlashSelectedIndex(idx)}
                  className={`w-full text-left p-2 rounded-xl transition flex flex-col gap-0.5 cursor-pointer ${
                    idx === slashSelectedIndex
                      ? 'bg-teal-50 text-teal-900 border border-teal-200'
                      : 'hover:bg-slate-50 text-slate-800 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs truncate">{macro.title}</span>
                    <span className="font-mono text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200/80 shrink-0">
                      {macro.shortcut}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>{macro.category}</span>
                    <span className="text-[9px] text-teal-700 font-semibold">{idx === slashSelectedIndex ? 'Enter ↵' : ''}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Footer do Menu com link para gerenciar */}
            <div className="px-3 py-1.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
              <span>Use <strong>Esc</strong> para fechar</span>
              <a
                href="/frases-rapidas"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-700 hover:text-teal-900 font-bold hover:underline inline-flex items-center gap-1"
              >
                <span>Gerenciar Frases</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
