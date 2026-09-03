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
  Plus
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
}

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

  // Sincronizar o valor externo apenas quando houver diferença real
  useEffect(() => {
    if (editorRef.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

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

  // Inserir títulos de seções padronizadas do laudo com 1 clique
  const insertSectionTitle = (title: string, isMintHighlight: boolean = false) => {
    editorRef.current?.focus();
    let snippet = '';
    if (isMintHighlight) {
      snippet = `<p style="margin-top: 14px; margin-bottom: 6px;"><strong style="color: #0f766e; background-color: #f0fdf4; padding: 3px 8px; border-radius: 6px; border: 1px solid #a7f3d0; font-size: 13px;">${title}</strong></p><p><br></p>`;
    } else {
      snippet = `<p style="margin-top: 14px; margin-bottom: 6px;"><strong style="color: #0f172a; font-size: 13px; text-decoration: underline;">${title}</strong></p><p><br></p>`;
    }
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

        {/* ATALHOS RÁPIDOS DE SEÇÃO */}
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden lg:inline">
            Atalhos:
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
            onClick={() => insertSectionTitle('IMPRESSÃO DIAGNÓSTICA:', true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-[11px] font-bold text-emerald-800 transition cursor-pointer shadow-2xs"
            title="Inserir cabeçalho de Impressão Diagnóstica"
          >
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>+ Impressão Diagnóstica</span>
          </button>
        </div>
      </div>

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
