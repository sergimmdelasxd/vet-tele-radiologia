'use client';

import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  Waves, 
  Check, 
  Search, 
  Zap, 
  Layers, 
  Bone, 
  Stethoscope,
  Sparkles
} from 'lucide-react';
import { ExamModality } from '@/types';

export interface AnatomicalRegion {
  id: string;
  name: string;
  modality: ExamModality;
  category: 'Cavidades & Tronco' | 'Coluna Vertebral' | 'Membros & Articulações' | 'Cabeça' | 'Protocolos de Emergência (POCUS)';
  description: string;
  defaultProjections?: string[];
  defaultFasting?: string;
}

export const PREDEFINED_REGIONS: AnatomicalRegion[] = [
  // Raio-X - Cavidades & Tronco
  {
    id: 'torax',
    name: 'Tórax',
    modality: 'RADIOGRAFIA',
    category: 'Cavidades & Tronco',
    description: 'Campos pulmonares, silhueta cardíaca, traqueia e grandes vasos (3 projeções)',
    defaultProjections: ['Laterolateral Direita (LL-D)', 'Laterolateral Esquerda (LL-E)', 'Ventrodorsal (VD)']
  },
  {
    id: 'abdomen-rx',
    name: 'Abdômen',
    modality: 'RADIOGRAFIA',
    category: 'Cavidades & Tronco',
    description: 'Silhuetas orgânicas, contraste peritoneal e padrão gasoso gastrointestinal',
    defaultProjections: ['Laterolateral Direita (LL-D)', 'Ventrodorsal (VD)']
  },

  // Raio-X - Coluna Vertebral
  {
    id: 'coluna-cervical',
    name: 'Coluna Cervical',
    modality: 'RADIOGRAFIA',
    category: 'Coluna Vertebral',
    description: 'Vértebras C1 a C7, alinhamento cervical e forames intervertebrais',
    defaultProjections: ['Laterolateral (LL)', 'Ventrodorsal (VD)']
  },
  {
    id: 'coluna-toracica',
    name: 'Coluna Torácica',
    modality: 'RADIOGRAFIA',
    category: 'Coluna Vertebral',
    description: 'Vértebras T1 a T13, articulações costovertebrais e espondilose anquilosante',
    defaultProjections: ['Laterolateral (LL)', 'Ventrodorsal (VD)']
  },
  {
    id: 'coluna-toracolombar',
    name: 'Coluna Toracolombar',
    modality: 'RADIOGRAFIA',
    category: 'Coluna Vertebral',
    description: 'Transição T11 a L3 (alta prevalência de discopatias e compressões)',
    defaultProjections: ['Laterolateral (LL)', 'Ventrodorsal (VD)']
  },
  {
    id: 'coluna-lombar',
    name: 'Coluna Lombar',
    modality: 'RADIOGRAFIA',
    category: 'Coluna Vertebral',
    description: 'Vértebras L1 a L7 e junção lombossacra (L7-S1 / síndrome da cauda equina)',
    defaultProjections: ['Laterolateral (LL)', 'Ventrodorsal (VD)']
  },

  // Raio-X - Membros & Articulações
  {
    id: 'pelve',
    name: 'Pelve',
    modality: 'RADIOGRAFIA',
    category: 'Membros & Articulações',
    description: 'Articulações coxofemorais, acetábulo e triagem de displasia (Ângulo de Norberg)',
    defaultProjections: ['Ventrodorsal (VD)', 'Ventrodorsal com Membros Estendidos']
  },
  {
    id: 'cotovelo',
    name: 'Cotovelo',
    modality: 'RADIOGRAFIA',
    category: 'Membros & Articulações',
    description: 'Avaliação de displasia de cotovelo, processo ancôneo e coronóide medial',
    defaultProjections: ['Mediolateral (ML) Flexionada', 'Craniocaudal (CrCd)']
  },
  {
    id: 'carpo',
    name: 'Carpo',
    modality: 'RADIOGRAFIA',
    category: 'Membros & Articulações',
    description: 'Articulação radiocárpica, ossos do carpo e metacarpos',
    defaultProjections: ['Dorsopalmar (DP)', 'Mediolateral (ML)']
  },
  {
    id: 'joelho',
    name: 'Joelho',
    modality: 'RADIOGRAFIA',
    category: 'Membros & Articulações',
    description: 'Articulação femorotibiopatelar, ligamento cruzado cranial (RLCC) e fabelas',
    defaultProjections: ['Mediolateral (ML) 90°', 'Caudocranial (CdCr)']
  },
  {
    id: 'radio-ulna',
    name: 'Rádio e Ulna',
    modality: 'RADIOGRAFIA',
    category: 'Membros & Articulações',
    description: 'Diáfise de rádio e ulna, alinhamento ósseo e linhas de fratura',
    defaultProjections: ['Mediolateral (ML)', 'Craniocaudal (CrCd)']
  },

  // Raio-X - Cabeça
  {
    id: 'cranio',
    name: 'Crânio',
    modality: 'RADIOGRAFIA',
    category: 'Cabeça',
    description: 'Calota craniana, seios nasais, bulas timpânicas, mandíbula e maxila',
    defaultProjections: ['Laterolateral (LL)', 'Dorsoventral (DV)', 'Rostrocaudal']
  },

  // Ultrassonografia (USG)
  {
    id: 'usg-abdominal',
    name: 'Ultrassom Abdominal',
    modality: 'ULTRASSOM',
    category: 'Cavidades & Tronco',
    description: 'Varredura ecográfica completa: fígado, baço, rins, bexiga, TGI e adrenais',
    defaultFasting: '8 horas'
  },
  {
    id: 'tfast',
    name: 'TFAST',
    modality: 'ULTRASSOM',
    category: 'Protocolos de Emergência (POCUS)',
    description: 'Thoracic Focused Assessment - Pneumotórax, efusão pleural e tamponamento',
    defaultFasting: 'Sem jejum / Emergência'
  },
  {
    id: 'afast',
    name: 'AFAST',
    modality: 'ULTRASSOM',
    category: 'Protocolos de Emergência (POCUS)',
    description: 'Abdominal Focused Assessment - Detecção de líquido livre nos 4 sítios acústicos',
    defaultFasting: 'Sem jejum / Emergência'
  },
  {
    id: 'vetblue',
    name: 'VetBlue',
    modality: 'ULTRASSOM',
    category: 'Protocolos de Emergência (POCUS)',
    description: 'Veterinary Bedside Lung Ultrasound - Linhas B, contusão pulmonar e consolidações',
    defaultFasting: 'Sem jejum / Emergência'
  }
];

interface RegionSelectorProps {
  selectedRegion: string;
  onSelectRegion: (
    regionName: string, 
    defaultProjections?: string[], 
    defaultFasting?: string, 
    modality?: ExamModality
  ) => void;
  currentModality: ExamModality;
}

export const RegionSelector: React.FC<RegionSelectorProps> = ({
  selectedRegion,
  onSelectRegion,
  currentModality
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const categories = [
    { id: 'ALL', label: 'Todas as Regiões' },
    { id: 'Cavidades & Tronco', label: 'Cavidades & Tronco' },
    { id: 'Coluna Vertebral', label: 'Coluna Vertebral' },
    { id: 'Membros & Articulações', label: 'Membros & Articulações' },
    { id: 'Protocolos de Emergência (POCUS)', label: 'Protocolos FAST / POCUS' },
    { id: 'Cabeça', label: 'Crânio / Cabeça' }
  ];

  const filteredRegions = useMemo(() => {
    return PREDEFINED_REGIONS.filter(item => {
      const matchCategory = activeCategory === 'ALL' || item.category === activeCategory;
      const q = searchTerm.toLowerCase();
      const matchSearch =
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);

      return matchCategory && matchSearch;
    });
  }, [activeCategory, searchTerm]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <label className="text-slate-300 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Menu Interativo de Regiões Requisitadas</span>
        </label>
        <span className="text-[11px] text-slate-400">
          Selecione uma das 16 regiões padronizadas:
        </span>
      </div>

      {/* Barra de Busca e Filtro de Categoria */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar região (ex: pelve, carpo, joelho, TFAST, coluna)..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white outline-none focus:border-cyan-500 placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grade de Regiões Interativas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1">
        {filteredRegions.map(reg => {
          const isSelected = selectedRegion.toLowerCase().includes(reg.name.toLowerCase()) || selectedRegion === reg.name;
          const isUsg = reg.modality === 'ULTRASSOM';

          return (
            <button
              key={reg.id}
              type="button"
              onClick={() => onSelectRegion(reg.name, reg.defaultProjections, reg.defaultFasting, reg.modality)}
              className={`p-2.5 rounded-2xl border text-left transition-all duration-150 relative group cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? isUsg
                    ? 'bg-teal-950/60 border-teal-500 text-white shadow-md shadow-teal-500/10 ring-1 ring-teal-500'
                    : 'bg-cyan-950/60 border-cyan-500 text-white shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500'
                  : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      isUsg ? 'bg-teal-500/20 text-teal-300' : 'bg-cyan-500/20 text-cyan-300'
                    }`}
                  >
                    {isUsg ? <Waves className="w-2.5 h-2.5" /> : <Activity className="w-2.5 h-2.5" />}
                    {isUsg ? 'USG' : 'RX'}
                  </span>

                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>

                <div className="font-bold text-xs leading-tight text-white group-hover:text-cyan-300 transition-colors">
                  {reg.name}
                </div>
              </div>

              <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                {reg.description}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
