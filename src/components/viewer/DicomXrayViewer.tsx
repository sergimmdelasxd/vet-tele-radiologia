'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  FlipHorizontal, 
  Sun, 
  Contrast, 
  RefreshCw, 
  Maximize2, 
  Minimize2,
  Ruler,
  Heart,
  Eye,
  Camera,
  Layers,
  Sparkles,
  Columns2
} from 'lucide-react';
import { ExamImage } from '@/types';

interface DicomViewerProps {
  images: ExamImage[];
  patientName?: string;
  onCaptureKeyImage?: (image: ExamImage) => void;
  initialVhs?: string;
  onVhsCalculated?: (vhs: string) => void;
}

export const DicomXrayViewer: React.FC<DicomViewerProps> = ({
  images,
  patientName = 'Paciente',
  onCaptureKeyImage,
  onVhsCalculated
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSplitView, setIsSplitView] = useState(false);
  const [secondIndex, setSecondIndex] = useState(images.length > 1 ? 1 : 0);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [isInverted, setIsInverted] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Modos de ferramentas
  const [activeTool, setActiveTool] = useState<'pan' | 'ruler' | 'vhs'>('pan');
  
  // Medição com Régua
  const [rulerPoints, setRulerPoints] = useState<{ x: number; y: number }[]>([]);
  const [rulerDistance, setRulerDistance] = useState<number | null>(null);

  // Ferramenta VHS (Vertebral Heart Score)
  const [vhsLongAxis, setVhsLongAxis] = useState<number>(5.4);
  const [vhsShortAxis, setVhsShortAxis] = useState<number>(4.2);
  const [vhsModalOpen, setVhsModalOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const currentImage = images[currentIndex] || images[0];

  // Presets radiográficos
  const applyPreset = (preset: 'bone' | 'lung' | 'soft-tissue' | 'default') => {
    switch (preset) {
      case 'bone':
        setBrightness(115);
        setContrast(170);
        setIsInverted(false);
        break;
      case 'lung':
        setBrightness(90);
        setContrast(140);
        setIsInverted(false);
        break;
      case 'soft-tissue':
        setBrightness(110);
        setContrast(120);
        setIsInverted(false);
        break;
      case 'default':
      default:
        setBrightness(100);
        setContrast(100);
        setIsInverted(false);
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setRotation(0);
        setRulerPoints([]);
        setRulerDistance(null);
        break;
    }
  };

  // Drag / Pan logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool === 'pan') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    } else if (activeTool === 'ruler') {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (rulerPoints.length >= 2) {
        setRulerPoints([{ x, y }]);
        setRulerDistance(null);
      } else {
        const nextPoints = [...rulerPoints, { x, y }];
        setRulerPoints(nextPoints);
        if (nextPoints.length === 2) {
          const dx = nextPoints[1].x - nextPoints[0].x;
          const dy = nextPoints[1].y - nextPoints[0].y;
          const distPx = Math.sqrt(dx * dx + dy * dy);
          // Calibração aproximada: 80px = 10cm na escala do raio-x
          const distCm = (distPx / 8).toFixed(1);
          setRulerDistance(parseFloat(distCm));
        }
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && activeTool === 'pan') {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.0015;
    setZoom(prev => Math.min(Math.max(0.5, prev + delta), 4.5));
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleApplyVhs = () => {
    const totalVhs = (vhsLongAxis + vhsShortAxis).toFixed(1);
    const result = `${totalVhs} v (L: ${vhsLongAxis}v + C: ${vhsShortAxis}v)`;
    if (onVhsCalculated) {
      onVhsCalculated(result);
    }
    setVhsModalOpen(false);
  };

  if (!currentImage) {
    return (
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        Nenhuma imagem radiográfica disponível para este exame.
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`bg-slate-950 border border-slate-800 rounded-2xl flex flex-col overflow-hidden select-none shadow-2xl relative ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-0' : 'h-[650px] w-full'
      }`}
    >
      {/* Top Toolbar */}
      <div className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 z-20">
        {/* Info do Paciente e Projeção */}
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-slate-200 tracking-wide">
            {patientName.toUpperCase()}
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline">|</span>
          <span className="text-xs text-cyan-400 font-medium truncate max-w-[200px]">
            {currentImage.label || currentImage.projection || `Imagem ${currentIndex + 1}/${images.length}`}
          </span>
        </div>

        {/* Ferramentas Principais */}
        <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTool('pan')}
            className={`p-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
              activeTool === 'pan' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Mover / Pan"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Visualizar</span>
          </button>

          <button
            onClick={() => setActiveTool('ruler')}
            className={`p-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
              activeTool === 'ruler' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Régua Calibrada (clique 2 pontos)"
          >
            <Ruler className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Régua</span>
          </button>

          <button
            onClick={() => setVhsModalOpen(true)}
            className="p-1.5 rounded-lg text-xs font-medium bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 transition flex items-center gap-1"
            title="Calcular VHS (Vertebral Heart Score)"
          >
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden md:inline font-semibold">Cálculo VHS</span>
          </button>

          {images.length > 1 && (
            <button
              onClick={() => setIsSplitView(prev => !prev)}
              className={`p-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                isSplitView 
                  ? 'bg-teal-600 text-white shadow-sm ring-1 ring-teal-400' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
              title="Comparar duas projeções lado a lado (Split View)"
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isSplitView ? 'Tela Única' : 'Lado a Lado'}</span>
            </button>
          )}
        </div>

        {/* Controles de Imagem (Zoom, Rotação, Inversão, Reset) */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom(z => Math.max(0.5, z - 0.2))}
            title="Diminuir Zoom"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono text-slate-400 px-1 min-w-[36px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(z => Math.min(4.5, z + 0.2))}
            title="Aumentar Zoom"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-700 mx-1" />

          <button
            onClick={() => setRotation(r => (r + 90) % 360)}
            title="Girar 90°"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsFlipped(f => !f)}
            title="Inverter Horizontalmente"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition"
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsInverted(inv => !inv)}
            title="Inverter Cores (Negativo / Positivo)"
            className={`p-1.5 rounded-lg text-xs transition ${
              isInverted ? 'bg-amber-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => applyPreset('default')}
            title="Resetar Ajustes"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Sair de Tela Cheia' : 'Tela Cheia'}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {onCaptureKeyImage && (
            <button
              onClick={() => onCaptureKeyImage(currentImage)}
              title="Fixar esta imagem no laudo"
              className="ml-1 px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm transition"
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Anexar ao Laudo</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Radiograph Canvas Area */}
      {isSplitView && images.length > 1 ? (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 p-2 bg-black overflow-hidden h-full">
          {/* Painel Esquerdo (Imagem A) */}
          <div className="relative border border-slate-800 rounded-xl overflow-hidden flex flex-col bg-slate-950">
            <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-700 text-[11px] font-mono text-teal-300">
              <span className="font-bold">Esq:</span>
              <select
                value={currentIndex}
                onChange={e => setCurrentIndex(Number(e.target.value))}
                className="bg-transparent text-slate-200 outline-none cursor-pointer"
              >
                {images.map((img, idx) => (
                  <option key={img.id || idx} value={idx} className="bg-slate-900 text-white">
                    {img.projection || img.label || `Projeção ${idx + 1}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 flex items-center justify-center overflow-hidden p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[currentIndex]?.url}
                alt="Projeção 1"
                style={{
                  filter: `brightness(${brightness}%) contrast(${contrast}%) ${isInverted ? 'invert(1)' : ''}`,
                  transform: `scale(${zoom}) rotate(${rotation}deg) scaleX(${isFlipped ? -1 : 1})`
                }}
                className="max-h-[520px] max-w-full object-contain pointer-events-none shadow-2xl transition"
              />
            </div>
          </div>

          {/* Painel Direito (Imagem B) */}
          <div className="relative border border-slate-800 rounded-xl overflow-hidden flex flex-col bg-slate-950">
            <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-700 text-[11px] font-mono text-sky-300">
              <span className="font-bold">Dir:</span>
              <select
                value={secondIndex}
                onChange={e => setSecondIndex(Number(e.target.value))}
                className="bg-transparent text-slate-200 outline-none cursor-pointer"
              >
                {images.map((img, idx) => (
                  <option key={img.id || idx} value={idx} className="bg-slate-900 text-white">
                    {img.projection || img.label || `Projeção ${idx + 1}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 flex items-center justify-center overflow-hidden p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[secondIndex]?.url}
                alt="Projeção 2"
                style={{
                  filter: `brightness(${brightness}%) contrast(${contrast}%) ${isInverted ? 'invert(1)' : ''}`,
                  transform: `scale(${zoom}) rotate(${rotation}deg) scaleX(${isFlipped ? -1 : 1})`
                }}
                className="max-h-[520px] max-w-full object-contain pointer-events-none shadow-2xl transition"
              />
            </div>
          </div>
        </div>
      ) : (
        <div 
          className="flex-1 relative overflow-hidden flex items-center justify-center cursor-crosshair bg-black"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
        >
          {/* Imagem com transformações aplicadas */}
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg) scaleX(${isFlipped ? -1 : 1})`,
              filter: `brightness(${brightness}%) contrast(${contrast}%) ${isInverted ? 'invert(1)' : ''}`,
              transition: isDragging ? 'none' : 'transform 0.1s ease-out, filter 0.15s ease'
            }}
            className="relative max-w-full max-h-full flex items-center justify-center pointer-events-none"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentImage.url}
              alt={currentImage.label || 'Radiografia Veterinária'}
              className="max-h-[560px] object-contain pointer-events-none shadow-2xl"
            />
          </div>

        {/* Linhas de Medição da Régua desenhadas por cima */}
        {activeTool === 'ruler' && rulerPoints.length > 0 && (
          <svg className="absolute inset-0 pointer-events-none w-full h-full z-10">
            {rulerPoints.map((pt, idx) => (
              <circle key={idx} cx={pt.x} cy={pt.y} r={4} fill="#06b6d4" stroke="#ffffff" strokeWidth={1.5} />
            ))}
            {rulerPoints.length === 2 && (
              <>
                <line
                  x1={rulerPoints[0].x}
                  y1={rulerPoints[0].y}
                  x2={rulerPoints[1].x}
                  y2={rulerPoints[1].y}
                  stroke="#06b6d4"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
                <rect
                  x={(rulerPoints[0].x + rulerPoints[1].x) / 2 - 35}
                  y={(rulerPoints[0].y + rulerPoints[1].y) / 2 - 25}
                  width={70}
                  height={22}
                  rx={4}
                  fill="#0f172a"
                  stroke="#06b6d4"
                  strokeWidth={1}
                />
                <text
                  x={(rulerPoints[0].x + rulerPoints[1].x) / 2}
                  y={(rulerPoints[0].y + rulerPoints[1].y) / 2 - 10}
                  fill="#f8fafc"
                  fontSize={11}
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {rulerDistance} cm
                </text>
              </>
            )}
          </svg>
        )}

        {/* Indicadores de Visualização na tela */}
        <div className="absolute top-4 left-4 pointer-events-none bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300">
          <div>BRILHO: {brightness}% | CONTRASTE: {contrast}%</div>
          <div>INVERTIDO: {isInverted ? 'SIM' : 'NÃO'} | ROTAÇÃO: {rotation}°</div>
        </div>

        {activeTool === 'ruler' && (
          <div className="absolute top-4 right-4 pointer-events-none bg-cyan-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-800 text-xs font-medium text-cyan-300">
            Régua Ativa: Clique em 2 pontos da imagem para mensurar
          </div>
        )}
      </div>
      )}

      {/* Bottom Bar: Presets & Carrossel de Miniaturas */}
      <div className="bg-slate-900 border-t border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 z-20">
        {/* Presets Rápidos de Janelamento Radiológico */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-[11px] text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Janela:
          </span>
          <button
            onClick={() => applyPreset('bone')}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] transition"
          >
            Ósseo
          </button>
          <button
            onClick={() => applyPreset('lung')}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] transition"
          >
            Pulmonar
          </button>
          <button
            onClick={() => applyPreset('soft-tissue')}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] transition"
          >
            Partes Moles
          </button>
        </div>

        {/* Sliders Rápidos de Brilho e Contraste */}
        <div className="hidden lg:flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <input
              type="range"
              min="50"
              max="180"
              value={brightness}
              onChange={e => setBrightness(Number(e.target.value))}
              className="w-20 accent-cyan-500 cursor-pointer h-1"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Contrast className="w-3.5 h-3.5 text-cyan-400" />
            <input
              type="range"
              min="50"
              max="220"
              value={contrast}
              onChange={e => setContrast(Number(e.target.value))}
              className="w-20 accent-cyan-500 cursor-pointer h-1"
            />
          </div>
        </div>

        {/* Miniaturas de Projeções do Exame */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full py-0.5">
          {images.map((img, idx) => (
            <button
              key={img.id || idx}
              onClick={() => {
                setCurrentIndex(idx);
                setRulerPoints([]);
                setRulerDistance(null);
              }}
              className={`relative rounded-lg overflow-hidden border-2 transition shrink-0 ${
                currentIndex === idx 
                  ? 'border-cyan-400 ring-2 ring-cyan-500/30' 
                  : 'border-slate-800 hover:border-slate-600 opacity-60 hover:opacity-100'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.label || `Projeção ${idx + 1}`}
                className="w-12 h-10 object-cover bg-black"
              />
              <span className="absolute bottom-0 inset-x-0 bg-slate-900/90 text-[9px] text-slate-200 text-center truncate px-0.5">
                {img.projection || `V${idx + 1}`}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Modal / Calculadora VHS (Vertebral Heart Score) */}
      {vhsModalOpen && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-2 text-rose-400 mb-2">
              <Heart className="w-5 h-5 fill-rose-500/20" />
              <h3 className="font-bold text-base text-slate-100">
                Calculadora VHS (Vertebral Heart Score)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Método padronizado de Buchanan & Bücheler. Meça o eixo longo e o eixo curto da silhueta cardíaca e transponha para a coluna vertebral torácica a partir de T4.
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Eixo Longo (L - carina até o ápice): <span className="text-cyan-400 font-bold">{vhsLongAxis} vértebras</span>
                </label>
                <input
                  type="range"
                  min="3.0"
                  max="8.0"
                  step="0.1"
                  value={vhsLongAxis}
                  onChange={e => setVhsLongAxis(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Eixo Curto (S - diâmetro transverso perpendicular): <span className="text-cyan-400 font-bold">{vhsShortAxis} vértebras</span>
                </label>
                <input
                  type="range"
                  min="2.0"
                  max="6.0"
                  step="0.1"
                  value={vhsShortAxis}
                  onChange={e => setVhsShortAxis(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Score Total VHS</span>
                  <span className="text-xl font-black text-rose-400">
                    {(vhsLongAxis + vhsShortAxis).toFixed(1)} v
                  </span>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  <span>Referência Canina: <strong>8.5 - 10.5 v</strong></span>
                  <br />
                  <span>Referência Felina: <strong>6.8 - 8.1 v</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                onClick={() => setVhsModalOpen(false)}
                className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleApplyVhs}
                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow-md transition"
              >
                Inserir no Laudo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
