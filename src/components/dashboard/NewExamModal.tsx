'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  UploadCloud, 
  AlertCircle, 
  Sparkles, 
  Clock, 
  Flame, 
  Plus, 
  Check, 
  FileText,
  Radio,
  Activity,
  Waves,
  Heart,
  Baby,
  Building2
} from 'lucide-react';
import { Exam, ExamImage, ExamModality, ExamPriority, Species, UserRole } from '@/types';
import { RegionSelector } from '@/components/common/RegionSelector';

interface NewExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExamCreated: (exam: Exam) => void;
  defaultClinicName?: string;
  defaultVetName?: string;
  defaultClinicLogo?: string;
  userRole?: UserRole;
}

export const NewExamModal: React.FC<NewExamModalProps> = ({
  isOpen,
  onClose,
  onExamCreated,
  defaultClinicName = '',
  defaultVetName = '',
  defaultClinicLogo = '',
  userRole = 'CLINIC'
}) => {
  // Modalidade: Radiografia ou Ultrassonografia
  const [modality, setModality] = useState<ExamModality>('RADIOGRAFIA');

  // Logotipo da clínica para o laudo
  const [clinicLogo, setClinicLogo] = useState(defaultClinicLogo || '');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoFileRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (defaultClinicLogo) {
      setClinicLogo(defaultClinicLogo);
    }
  }, [defaultClinicLogo]);

  const [patientName, setPatientName] = useState('');
  const [species, setSpecies] = useState<Species>('Canino');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState<'Macho' | 'Fêmea'>('Macho');
  const [isCastrated, setIsCastrated] = useState(false);
  const [ownerName, setOwnerName] = useState('');

  // Região e campos específicos
  const [region, setRegion] = useState('Tórax (3 projeções)');
  const [selectedProjections, setSelectedProjections] = useState<string[]>([
    'Laterolateral Direita (LL-D)',
    'Ventrodorsal (VD)'
  ]);

  // Específicos de Ultrassom
  const [ultrasoundType, setUltrasoundType] = useState('Ultrassonografia Abdominal Total');
  const [fastingHours, setFastingHours] = useState('8 horas');
  const [trichotomyDone, setTrichotomyDone] = useState(true);
  const [selectedOrgans, setSelectedOrgans] = useState<string[]>([
    'Fígado',
    'Vesícula Biliar',
    'Baço',
    'Rins',
    'Bexiga'
  ]);

  const [clinicalHistory, setClinicalHistory] = useState('');
  const [suspectedDiagnosis, setSuspectedDiagnosis] = useState('');
  const [requestingVet, setRequestingVet] = useState(defaultVetName);
  const [priority, setPriority] = useState<ExamPriority>('NORMAL');

  // Gestão de Clínica Solicitante (para Radiologistas e Admins)
  const [clinicsList, setClinicsList] = useState<Array<{ id: string; clinicName?: string; name: string; phone?: string; uf?: string }>>([]);
  const [clinicMode, setClinicMode] = useState<'SELECT' | 'NEW'>('SELECT');
  const [selectedClinicId, setSelectedClinicId] = useState<string>('');
  const [newClinicName, setNewClinicName] = useState('');
  const [newClinicVet, setNewClinicVet] = useState('');
  const [newClinicPhone, setNewClinicPhone] = useState('');
  const [newClinicUf, setNewClinicUf] = useState('SP');
  const [newClinicEmail, setNewClinicEmail] = useState('');
  const [isLoadingClinics, setIsLoadingClinics] = useState(false);

  useEffect(() => {
    if (isOpen && (userRole === 'RADIOLOGIST' || userRole === 'ADMIN')) {
      setIsLoadingClinics(true);
      fetch('/api/clinics')
        .then(res => res.json())
        .then(data => {
          if (data.clinics && data.clinics.length > 0) {
            setClinicsList(data.clinics);
            if (!selectedClinicId) {
              setSelectedClinicId(data.clinics[0].id);
              if (data.clinics[0].name) {
                setRequestingVet(data.clinics[0].name);
              }
            }
          }
        })
        .catch(console.error)
        .finally(() => setIsLoadingClinics(false));
    }
  }, [isOpen, userRole]);

  const handleClinicChange = (clinicId: string) => {
    setSelectedClinicId(clinicId);
    const found = clinicsList.find(c => c.id === clinicId);
    if (found && found.name) {
      setRequestingVet(found.name);
    }
  };

  // Imagens
  const [uploadedImages, setUploadedImages] = useState<ExamImage[]>([
    {
      id: `img-demo-${Date.now()}-1`,
      url: '/xrays/canine-thorax-lateral.svg',
      label: 'Projeção Laterolateral Direita',
      projection: 'LL-D',
      uploadedAt: new Date().toISOString()
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentExamPrice = modality === 'ULTRASSOM'
    ? (priority === 'URGENT' ? 85.00 : 60.00)
    : (priority === 'URGENT' ? 65.00 : 45.00);

  if (!isOpen) return null;

  const handleModalityChange = (newModality: ExamModality) => {
    setModality(newModality);
    if (newModality === 'ULTRASSOM') {
      setRegion('Ultrassonografia Abdominal Total');
      setUploadedImages([
        {
          id: `img-usg-${Date.now()}`,
          url: '/ultrasound/usg-abdominal-liver-kidney.svg',
          label: 'USG - Rim D & Fígado',
          projection: 'Corte Sagital',
          uploadedAt: new Date().toISOString()
        }
      ]);
    } else {
      setRegion('Tórax (3 projeções)');
      setUploadedImages([
        {
          id: `img-demo-${Date.now()}`,
          url: '/xrays/canine-thorax-lateral.svg',
          label: 'Projeção Laterolateral Direita',
          projection: 'LL-D',
          uploadedAt: new Date().toISOString()
        }
      ]);
    }
  };

  const toggleProjection = (proj: string) => {
    setSelectedProjections(prev =>
      prev.includes(proj) ? prev.filter(p => p !== proj) : [...prev, proj]
    );
  };

  const toggleOrgan = (organ: string) => {
    setSelectedOrgans(prev =>
      prev.includes(organ) ? prev.filter(o => o !== organ) : [...prev, organ]
    );
  };

  // Upload real de arquivos locais para o servidor (/api/upload)
  const uploadFilesToServer = async (fileList: FileList | File[]) => {
    if (!fileList || fileList.length === 0) return;
    setIsUploading(true);
    setErrorMsg(null);
    try {
      const formData = new FormData();
      Array.from(fileList).forEach(file => {
        formData.append('files', file);
      });

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao processar upload dos arquivos');
      }

      if (data.files && Array.isArray(data.files)) {
        const newImgs: ExamImage[] = data.files.map((f: any) => ({
          id: f.id,
          url: f.url,
          label: f.label || f.originalName,
          projection: modality === 'ULTRASSOM' ? 'Corte Ecográfico' : 'Projeção Padrão',
          isDicom: f.isDicom,
          fileSize: f.size,
          originalName: f.originalName,
          uploadedAt: f.uploadedAt
        }));
        setUploadedImages(prev => [...prev, ...newImgs]);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Falha ao enviar arquivo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFilesToServer(e.target.files);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('files', files[0]);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.files && data.files[0]) {
        setClinicLogo(data.files[0].url);
      }
    } catch (err) {
      console.error('Erro no upload do logotipo:', err);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFilesToServer(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Botões de carregar amostra rápida
  const addSampleImage = (type: string) => {
    const map: Record<string, { url: string; label: string; proj: string }> = {
      'thorax-lat': { url: '/xrays/canine-thorax-lateral.svg', label: 'Tórax LL Direita', proj: 'LL-D' },
      'thorax-vd': { url: '/xrays/canine-thorax-vd.svg', label: 'Tórax Ventrodorsal', proj: 'VD' },
      'fracture': { url: '/xrays/canine-limb-fracture.svg', label: 'Membro Torácico ML', proj: 'ML' },
      'usg-liver-kidney': { url: '/ultrasound/usg-abdominal-liver-kidney.svg', label: 'USG Fígado & Rim D', proj: 'Sagital' },
      'usg-gestational': { url: '/ultrasound/usg-gestational-fetus.svg', label: 'USG Gestacional / Feto', proj: 'Útero' },
      'usg-bladder': { url: '/ultrasound/usg-bladder-calculus.svg', label: 'USG Bexiga com Cálculo', proj: 'Transversal' }
    };
    const chosen = map[type];
    if (!chosen) return;

    const newImg: ExamImage = {
      id: `img-sample-${Date.now()}`,
      url: chosen.url,
      label: chosen.label,
      projection: chosen.proj,
      uploadedAt: new Date().toISOString()
    };
    setUploadedImages(prev => [...prev, newImg]);
  };

  const removeImage = (id: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const isRadiologistOrAdmin = userRole === 'RADIOLOGIST' || userRole === 'ADMIN';

    if (isRadiologistOrAdmin) {
      if (clinicMode === 'NEW') {
        if (!newClinicName.trim()) {
          setErrorMsg('Informe o nome da clínica parceira para cadastrá-la.');
          return;
        }
      } else {
        if (!selectedClinicId && clinicsList.length > 0) {
          setErrorMsg('Selecione uma clínica parceira para associar este exame.');
          return;
        }
      }
    }

    if (!patientName.trim()) {
      setErrorMsg('Informe o nome do paciente/animal.');
      return;
    }
    if (!clinicalHistory.trim()) {
      setErrorMsg('Descreva o histórico clínico e queixas do paciente.');
      return;
    }
    if (uploadedImages.length === 0) {
      setErrorMsg('Anexe ao menos uma imagem radiográfica ou corte ultrassonográfico.');
      return;
    }

    setIsLoading(true);
    try {
      const selectedClinicObj = clinicsList.find(c => c.id === selectedClinicId);

      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modality,
          patientName,
          species,
          breed: breed.trim() || 'SRD',
          age: age.trim() || 'Não informada',
          weight: weight.trim() ? `${weight} kg` : 'Não informado',
          gender,
          isCastrated,
          ownerName: ownerName.trim() || 'Tutor Responsável',
          region: modality === 'ULTRASSOM' ? ultrasoundType : region,
          projections: modality === 'ULTRASSOM' ? selectedOrgans : selectedProjections,
          clinicalHistory,
          suspectedDiagnosis,
          requestingVet: isRadiologistOrAdmin && clinicMode === 'NEW' && newClinicVet.trim()
            ? newClinicVet.trim()
            : (requestingVet || 'Médico Veterinário'),
          priority,
          fastingHours: modality === 'ULTRASSOM' ? fastingHours : undefined,
          trichotomyDone: modality === 'ULTRASSOM' ? trichotomyDone : undefined,
          ultrasoundType: modality === 'ULTRASSOM' ? ultrasoundType : undefined,
          clinicLogo: clinicLogo || undefined,
          images: uploadedImages,
          ...(isRadiologistOrAdmin ? {
            clinicId: clinicMode === 'SELECT' ? selectedClinicId : 'new',
            clinicName: clinicMode === 'SELECT'
              ? (selectedClinicObj?.clinicName || selectedClinicObj?.name || 'Clínica Parceira')
              : newClinicName.trim(),
            clinicPhone: clinicMode === 'SELECT'
              ? (selectedClinicObj?.phone || '')
              : newClinicPhone.trim(),
            newClinicData: clinicMode === 'NEW' ? {
              clinicName: newClinicName.trim(),
              responsibleVet: newClinicVet.trim() || requestingVet.trim(),
              phone: newClinicPhone.trim(),
              uf: newClinicUf,
              email: newClinicEmail.trim()
            } : undefined
          } : {})
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao cadastrar exame');
      }

      onExamCreated(data.exam);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao cadastrar exame';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-cyan-400" />
              {(userRole === 'RADIOLOGIST' || userRole === 'ADMIN')
                ? 'Cadastrar Novo Exame (Entrada de Caso)'
                : 'Novo Pedido de Diagnóstico por Imagem'}
            </h2>
            <p className="text-xs text-slate-400">
              {(userRole === 'RADIOLOGIST' || userRole === 'ADMIN')
                ? 'Cadastre o paciente, a clínica solicitante e as imagens para fila ou laudo'
                : (defaultClinicName ? `Solicitante: ${defaultClinicName}` : 'Envie os dados do animal e as imagens para laudo')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs text-slate-200">
          {errorMsg && (
            <div className="p-3 bg-rose-950/50 border border-rose-800 text-rose-300 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* SELETOR DE MODALIDADE: RAIO-X OU ULTRASSOM */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Selecione o Tipo de Exame:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleModalityChange('RADIOGRAFIA')}
                className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                  modality === 'RADIOGRAFIA'
                    ? 'bg-cyan-950/50 border-cyan-500 text-white ring-1 ring-cyan-500'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm">Raio-X (Radiografia)</div>
                  <div className="text-[10px] text-slate-400">Tórax, Membros, Coluna, Abdômen</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleModalityChange('ULTRASSOM')}
                className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                  modality === 'ULTRASSOM'
                    ? 'bg-blue-950/50 border-blue-500 text-white ring-1 ring-blue-500'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Waves className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm">Ultrassonografia (USG)</div>
                  <div className="text-[10px] text-slate-400">Abdominal, Gestacional, A-FAST, Rins</div>
                </div>
              </button>
            </div>
          </div>

          {/* Seletor de Prioridade / Urgência */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPriority('NORMAL')}
              className={`p-3 rounded-xl border text-left transition flex items-start gap-3 ${
                priority === 'NORMAL'
                  ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200 ring-1 ring-cyan-500'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Clock className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-100">Rotina (Padrão)</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Laudo completo entregue em até <strong>12 horas</strong>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPriority('URGENT')}
              className={`p-3 rounded-xl border text-left transition flex items-start gap-3 ${
                priority === 'URGENT'
                  ? 'bg-rose-950/50 border-rose-500 text-rose-200 ring-1 ring-rose-500'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Flame className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-rose-300 flex items-center gap-1.5">
                  Plantão de Urgência 24h
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-rose-900 text-rose-200 uppercase font-extrabold">Fast</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Prioridade máxima na fila • Entrega em até <strong>2 horas</strong>
                </div>
              </div>
            </button>
          </div>

          {/* SE RADIOLOGISTA OU ADMIN: CLÍNICA SOLICITANTE */}
          {(userRole === 'RADIOLOGIST' || userRole === 'ADMIN') && (
            <div className="bg-slate-950/60 p-4 rounded-xl border border-cyan-800/60 space-y-3 shadow-inner">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-cyan-400" />
                  1. Clínica Parceira Solicitante
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/60">
                  Modo Radiologista
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setClinicMode('SELECT')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                    clinicMode === 'SELECT'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Selecionar Clínica Existente</span>
                </button>

                <button
                  type="button"
                  onClick={() => setClinicMode('NEW')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                    clinicMode === 'NEW'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Cadastrar Nova Clínica</span>
                </button>
              </div>

              {clinicMode === 'SELECT' ? (
                <div className="space-y-2 pt-1">
                  <label className="block text-slate-400 text-[11px]">Selecione a Clínica Parceira *</label>
                  {isLoadingClinics ? (
                    <div className="text-slate-400 text-xs py-2 flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                      Carregando clínicas parceiras...
                    </div>
                  ) : clinicsList.length === 0 ? (
                    <div className="text-slate-400 text-xs py-2">
                      Nenhuma clínica encontrada. Use a opção &quot;+ Cadastrar Nova Clínica&quot; acima.
                    </div>
                  ) : (
                    <select
                      value={selectedClinicId}
                      onChange={e => handleClinicChange(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-cyan-500 cursor-pointer"
                    >
                      {clinicsList.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.clinicName || c.name} {c.uf ? `(${c.uf})` : ''} — Resp: {c.name}
                        </option>
                      ))}
                    </select>
                  )}
                  {selectedClinicId && (
                    <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-3 pt-1">
                      <span>Telefone: <strong className="text-slate-200">{clinicsList.find(c => c.id === selectedClinicId)?.phone || 'Não informado'}</strong></span>
                      <span>• UF: <strong className="text-slate-200">{clinicsList.find(c => c.id === selectedClinicId)?.uf || 'SP'}</strong></span>
                      <span>• Resp: <strong className="text-slate-200">{clinicsList.find(c => c.id === selectedClinicId)?.name}</strong></span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 mb-1">Nome da Nova Clínica Veterinária *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Centro de Diagnóstico Vet São Paulo"
                      value={newClinicName}
                      onChange={e => setNewClinicName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Veterinário Responsável / CRMV</label>
                    <input
                      type="text"
                      placeholder="Ex: Dr. André Silva (CRMV-SP 45.120)"
                      value={newClinicVet}
                      onChange={e => {
                        setNewClinicVet(e.target.value);
                        setRequestingVet(e.target.value);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Telefone / WhatsApp da Clínica</label>
                    <input
                      type="text"
                      placeholder="Ex: (11) 98765-4321"
                      value={newClinicPhone}
                      onChange={e => setNewClinicPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Estado (UF)</label>
                    <select
                      value={newClinicUf}
                      onChange={e => setNewClinicUf(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-cyan-500 cursor-pointer"
                    >
                      {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">E-mail para Login da Clínica (Opcional)</label>
                    <input
                      type="email"
                      placeholder="Ex: contato@vetsp.com.br"
                      value={newClinicEmail}
                      onChange={e => setNewClinicEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Dados do Paciente */}
          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              {(userRole === 'RADIOLOGIST' || userRole === 'ADMIN') ? '2. Dados do Paciente' : '1. Dados do Paciente'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Nome do Pet *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Thor, Mel, Pretinha"
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Espécie *</label>
                <select
                  value={species}
                  onChange={e => setSpecies(e.target.value as Species)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="Canino">Canino</option>
                  <option value="Felino">Felino</option>
                  <option value="Equino">Equino</option>
                  <option value="Bovino">Bovino</option>
                  <option value="Silvestre/Exótico">Silvestre / Exótico</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Raça</label>
                <input
                  type="text"
                  placeholder="Ex: Golden Retriever, SRD"
                  value={breed}
                  onChange={e => setBreed(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Idade</label>
                <input
                  type="text"
                  placeholder="Ex: 4 anos, 8 meses"
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Peso (kg)</label>
                <input
                  type="text"
                  placeholder="Ex: 14.5"
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Sexo / Castração</label>
                <div className="flex items-center gap-3 pt-1.5">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      checked={gender === 'Macho'}
                      onChange={() => setGender('Macho')}
                      className="accent-cyan-500"
                    />
                    <span>Macho</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      checked={gender === 'Fêmea'}
                      onChange={() => setGender('Fêmea')}
                      className="accent-cyan-500"
                    />
                    <span>Fêmea</span>
                  </label>
                  <label className="flex items-center gap-1.5 ml-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={isCastrated}
                      onChange={e => setIsCastrated(e.target.checked)}
                      className="accent-cyan-500 rounded"
                    />
                    <span>Castrado</span>
                  </label>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1">Nome do Tutor</label>
                <input
                  type="text"
                  placeholder="Ex: Maria Clara Fernandes"
                  value={ownerName}
                  onChange={e => setOwnerName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Veterinário Solicitante</label>
                <input
                  type="text"
                  placeholder="Ex: Dra. Juliana (CRMV-SP 12345)"
                  value={requestingVet}
                  onChange={e => setRequestingVet(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* DADOS ESPECÍFICOS DO EXAME CONFORME MODALIDADE */}
          {modality === 'ULTRASSOM' ? (
            /* Campos de Ultrassonografia */
            <div className="bg-slate-950/50 p-4 rounded-xl border border-blue-800/40 space-y-4">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5" /> {(userRole === 'RADIOLOGIST' || userRole === 'ADMIN') ? '3. ' : '2. '}Região e Protocolo de Ultrassonografia (USG)
              </h3>

              {/* Menu Interativo de Regiões */}
              <RegionSelector
                selectedRegion={ultrasoundType}
                currentModality="ULTRASSOM"
                onSelectRegion={(regName, defaultProjs, defaultFast, targetMod) => {
                  if (targetMod && targetMod !== 'ULTRASSOM') {
                    handleModalityChange(targetMod);
                    setRegion(regName);
                    if (defaultProjs && defaultProjs.length > 0) setSelectedProjections(defaultProjs);
                    return;
                  }
                  setUltrasoundType(regName);
                  if (defaultFast) setFastingHours(defaultFast);
                }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/60">
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1">Região / Protocolo Selecionado *</label>
                  <input
                    type="text"
                    required
                    value={ultrasoundType}
                    onChange={e => setUltrasoundType(e.target.value)}
                    placeholder="Ex: Ultrassom Abdominal, TFAST, AFAST, VetBlue..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-blue-500 font-semibold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Preparo do Paciente (Jejum Alimentar)</label>
                  <select
                    value={fastingHours}
                    onChange={e => setFastingHours(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="8 horas">Jejum alimentar de 8 horas</option>
                    <option value="12 horas">Jejum alimentar de 12 horas</option>
                    <option value="Sem jejum / Emergência">Sem jejum (caso emergencial)</option>
                    <option value="Não necessário">Não necessário</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={trichotomyDone}
                      onChange={e => setTrichotomyDone(e.target.checked)}
                      className="accent-blue-500 rounded"
                    />
                    <span>Tricotomia ampla prévia realizada</span>
                  </label>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1.5">Órgãos de Interesse / Foco Principal</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Fígado',
                      'Vesícula Biliar',
                      'Baço',
                      'Rins',
                      'Bexiga',
                      'Trato Digestório',
                      'Pâncreas',
                      'Adrenais',
                      'Útero/Ovários',
                      'Próstata'
                    ].map(organ => {
                      const isSelected = selectedOrgans.includes(organ);
                      return (
                        <button
                          key={organ}
                          type="button"
                          onClick={() => toggleOrgan(organ)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition ${
                            isSelected
                              ? 'bg-blue-950 border-blue-500 text-blue-300'
                              : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                          {organ}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1">Suspeita Clínica e Queixa Principal *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Nefropatia, Urolitíase, Pancreatite, Suspeita de Gestação, Líquido Livre"
                    value={suspectedDiagnosis}
                    onChange={e => setSuspectedDiagnosis(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1">Histórico Clínico e Sintomas *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Descreva sintomas: vômitos, diarreia, dor à palpação abdominal, hematúria, aumento de volume, data da cruza se gestacional..."
                    value={clinicalHistory}
                    onChange={e => setClinicalHistory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-100 outline-none focus:border-blue-500 leading-relaxed"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Campos de Radiografia (Raio-X) */
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" /> {(userRole === 'RADIOLOGIST' || userRole === 'ADMIN') ? '3. ' : '2. '}Região Anatômica e Detalhes da Radiografia (Raio-X)
              </h3>

              {/* Menu Interativo de Regiões */}
              <RegionSelector
                selectedRegion={region}
                currentModality="RADIOGRAFIA"
                onSelectRegion={(regName, defaultProjs, defaultFast, targetMod) => {
                  if (targetMod && targetMod !== 'RADIOGRAFIA') {
                    handleModalityChange(targetMod);
                    setUltrasoundType(regName);
                    if (defaultFast) setFastingHours(defaultFast);
                    return;
                  }
                  setRegion(regName);
                  if (defaultProjs && defaultProjs.length > 0) {
                    setSelectedProjections(defaultProjs);
                  }
                }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/60">
                <div>
                  <label className="block text-slate-400 mb-1">Região Anatômica Selecionada *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Pelve, Tórax, Abdômen, Coluna Lombar..."
                    value={region}
                    onChange={e => setRegion(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-cyan-500 font-semibold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Suspeita Clínica Principal</label>
                  <input
                    type="text"
                    placeholder="Ex: Cardiomegalia, Fratura, Corpo Estranho, Edema"
                    value={suspectedDiagnosis}
                    onChange={e => setSuspectedDiagnosis(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1.5">Projeções Realizadas</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Laterolateral Direita (LL-D)',
                      'Laterolateral Esquerda (LL-E)',
                      'Ventrodorsal (VD)',
                      'Dorsoventral (DV)',
                      'Mediolateral (ML)',
                      'Craniocaudal (CrCd)',
                      'Oblíqua'
                    ].map(proj => {
                      const isSelected = selectedProjections.includes(proj);
                      return (
                        <button
                          key={proj}
                          type="button"
                          onClick={() => toggleProjection(proj)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition ${
                            isSelected
                              ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                              : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                          {proj}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1">Histórico Clínico e Sintomas *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Descreva sintomas, tempo de evolução, dor, tosse, claudicação, medicações..."
                    value={clinicalHistory}
                    onChange={e => setClinicalHistory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-100 outline-none focus:border-cyan-500 leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Upload e Imagens */}
          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                {(userRole === 'RADIOLOGIST' || userRole === 'ADMIN') ? '4. Imagens / Cortes' : '3. Imagens / Cortes'} ({uploadedImages.length})
              </h3>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span>Amostras rápidas:</span>
                {modality === 'ULTRASSOM' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => addSampleImage('usg-liver-kidney')}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded"
                    >
                      + Fígado/Rim
                    </button>
                    <button
                      type="button"
                      onClick={() => addSampleImage('usg-gestational')}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-pink-300 rounded"
                    >
                      + Gestacional
                    </button>
                    <button
                      type="button"
                      onClick={() => addSampleImage('usg-bladder')}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded"
                    >
                      + Cálculos
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => addSampleImage('thorax-lat')}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded"
                    >
                      + Tórax
                    </button>
                    <button
                      type="button"
                      onClick={() => addSampleImage('fracture')}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded"
                    >
                      + Fratura
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Drag & Drop Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center gap-2 transition relative ${
                isDragging
                  ? 'border-cyan-400 bg-cyan-950/40 shadow-lg shadow-cyan-500/10'
                  : 'border-slate-700 hover:border-cyan-500/80 bg-slate-900/50 hover:bg-slate-900/80'
              }`}
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-2 py-3 text-cyan-400">
                  <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-semibold">Processando upload seguro dos arquivos...</span>
                </div>
              ) : (
                <>
                  <UploadCloud className={`w-8 h-8 transition ${isDragging ? 'text-cyan-400 scale-110' : 'text-slate-400'}`} />
                  <div className="text-center">
                    <label className="font-semibold text-slate-200 cursor-pointer hover:text-cyan-300 transition">
                      <span>Clique para escolher arquivos</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*,.dcm,.dicom"
                        onChange={handleFileInputChange}
                        className="hidden"
                      />
                    </label>
                    <span className="text-slate-400 text-xs"> ou arraste e solte aqui</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Suporta arquivos DICOM (.dcm), cortes de ultrassom, JPEG, PNG e WebP
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Imagens Anexadas */}
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {uploadedImages.map((img, idx) => (
                  <div
                    key={img.id}
                    className="relative group bg-slate-900 border border-slate-800 rounded-xl p-2 flex flex-col items-center"
                  >
                    {img.isDicom ? (
                      <div className="w-full h-24 rounded-lg bg-slate-950 flex flex-col items-center justify-center border border-cyan-500/30 text-cyan-300">
                        <Activity className="w-8 h-8 text-cyan-400 mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Arquivo DICOM</span>
                      </div>
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={img.url}
                        alt={img.label}
                        className="w-full h-24 object-contain rounded-lg bg-black"
                      />
                    )}
                    <span className="text-[10px] text-slate-300 truncate w-full text-center mt-1 font-medium">
                      {img.label || `Arquivo ${idx + 1}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeImage(img.id)}
                      className="absolute top-1 right-1 p-1 bg-rose-950/80 text-rose-300 hover:text-rose-100 rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer"
                      title="Remover anexo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* SEÇÃO: LOGOTIPO DA CLÍNICA PARA O LAUDO TIMBRADO */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-teal-400" />
                  <span>Logotipo da Clínica no Laudo (Opcional)</span>
                </label>
                {clinicLogo && (
                  <button
                    type="button"
                    onClick={() => setClinicLogo('')}
                    className="text-[11px] font-bold text-rose-400 hover:text-rose-300 transition cursor-pointer"
                  >
                    Remover deste pedido
                  </button>
                )}
              </div>

              <input
                ref={logoFileRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp"
                className="hidden"
                onChange={handleLogoUpload}
              />

              {clinicLogo ? (
                <div className="flex flex-col sm:flex-row items-center gap-3.5 p-3 bg-slate-900 border border-slate-700/80 rounded-xl">
                  <div className="h-12 w-28 p-1.5 bg-white rounded-lg border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={clinicLogo} alt="Logo da Clínica" className="max-h-full max-w-full object-contain" />
                  </div>
                  <div className="flex-1 text-xs text-center sm:text-left">
                    <span className="font-bold text-slate-100 block">Logotipo oficial anexado</span>
                    <span className="text-[11px] text-slate-400">
                      Será impresso no cabeçalho timbrado oficial deste laudo e no PDF para o tutor.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => logoFileRef.current?.click()}
                    disabled={isUploadingLogo}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-teal-300 rounded-lg border border-slate-700 transition cursor-pointer shrink-0"
                  >
                    {isUploadingLogo ? 'Carregando...' : 'Alterar Logo'}
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => logoFileRef.current?.click()}
                  className="border border-dashed border-slate-700 hover:border-teal-500/80 rounded-xl p-4 flex items-center justify-center gap-2.5 cursor-pointer bg-slate-900/40 hover:bg-teal-950/20 transition group"
                >
                  <UploadCloud className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs text-slate-300 font-medium">
                    {isUploadingLogo ? 'Enviando logotipo...' : '+ Anexar Logotipo da Clínica para o Laudo (PNG, SVG, JPG)'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Footer com Preço e Botões */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
            {/* Tag de Custo do Exame */}
            <div className="w-full sm:w-auto flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl text-xs">
              <span className="text-slate-400">Valor do Laudo:</span>
              <strong className="text-emerald-400 text-sm font-black font-mono">
                R$ {currentExamPrice.toFixed(2).replace('.', ',')}
              </strong>
              {priority === 'URGENT' && (
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 font-semibold">
                  SLA Urgência 2h
                </span>
              )}
            </div>

            <div className="w-full sm:w-auto flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading || isUploading}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition active:scale-95 text-xs cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submetendo Pedido...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>{(userRole === 'RADIOLOGIST' || userRole === 'ADMIN') ? 'Cadastrar Exame no Sistema' : 'Enviar para Central de Laudos'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
