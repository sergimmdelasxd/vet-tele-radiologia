'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Building2, 
  Stethoscope, 
  Sparkles, 
  Check, 
  AlertCircle, 
  Activity, 
  Waves,
  Plus
} from 'lucide-react';
import { Appointment, ExamModality, Species, User as UserType } from '@/types';
import { RegionSelector } from '@/components/common/RegionSelector';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAppointmentCreated: (appointment: Appointment) => void;
  currentUser: UserType;
  initialDate?: string;
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  isOpen,
  onClose,
  onAppointmentCreated,
  currentUser,
  initialDate
}) => {
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00');
  const [durationMinutes, setDurationMinutes] = useState(30);

  const [modality, setModality] = useState<ExamModality>('ULTRASSOM');
  const [region, setRegion] = useState('Ultrassonografia Abdominal Total');

  // Dados do paciente
  const [patientName, setPatientName] = useState('');
  const [species, setSpecies] = useState<Species>('Canino');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');

  // Clínica & Solicitante
  const [clinicsList, setClinicsList] = useState<Array<{ id: string; clinicName?: string; name: string; phone?: string }>>([]);
  const [selectedClinicId, setSelectedClinicId] = useState('');
  const [requestingVet, setRequestingVet] = useState('');

  // Especialista
  const [specialistName, setSpecialistName] = useState(
    currentUser.role === 'RADIOLOGIST' ? currentUser.name : 'Dra. Camila Siqueira (CRMV-SP 38.412)'
  );

  // Preparo e notas
  const [preparationInstructions, setPreparationInstructions] = useState('Jejum alimentar de 8 horas e bexiga cheia.');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialDate) {
      setDate(initialDate);
    }
  }, [initialDate]);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/clinics')
        .then(res => res.json())
        .then(data => {
          if (data.clinics && data.clinics.length > 0) {
            setClinicsList(data.clinics);
            if (!selectedClinicId) {
              setSelectedClinicId(data.clinics[0].id);
              setRequestingVet(data.clinics[0].name || 'Médico Veterinário');
            }
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleModalityChange = (newModality: ExamModality) => {
    setModality(newModality);
    if (newModality === 'ULTRASSOM') {
      setRegion('Ultrassonografia Abdominal Total');
      setPreparationInstructions('Jejum alimentar de 8 horas e bexiga moderadamente repleta.');
    } else {
      setRegion('Tórax (3 projeções: LL-D, LL-E e VD)');
      setPreparationInstructions('Não necessita jejum alimentar. Tutor pode acompanhar posicionamento.');
    }
  };

  const handleClinicChange = (cId: string) => {
    setSelectedClinicId(cId);
    const found = clinicsList.find(c => c.id === cId);
    if (found) {
      setRequestingVet(found.name || 'Médico Veterinário');
    }
  };

  const addPrepTag = (tag: string) => {
    if (!preparationInstructions) {
      setPreparationInstructions(tag);
    } else if (!preparationInstructions.includes(tag)) {
      setPreparationInstructions(prev => `${prev}, ${tag}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!patientName.trim()) {
      setErrorMsg('Informe o nome do paciente/animal.');
      return;
    }
    if (!date || !time) {
      setErrorMsg('Informe a data e o horário do agendamento.');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedClinic = clinicsList.find(c => c.id === selectedClinicId);

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          time,
          durationMinutes,
          clinicId: selectedClinic?.id || 'user-clinic-vetlife',
          clinicName: selectedClinic?.clinicName || selectedClinic?.name || 'Clínica Parceira',
          requestingVet,
          specialistName,
          specialistId: currentUser.role === 'RADIOLOGIST' ? currentUser.id : 'user-rad-camila',
          patientName,
          species,
          breed: breed || 'SRD',
          age,
          weight,
          ownerName,
          ownerPhone,
          modality,
          region,
          preparationInstructions,
          notes,
          status: 'SCHEDULED'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao cadastrar agendamento');
      }

      onAppointmentCreated(data.appointment);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao salvar agendamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-auto">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span>Novo Agendamento na Rotina</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Agenda de Exames
                </span>
              </h2>
              <p className="text-xs text-slate-400">Cadastre exames previstos para o fluxo diário ou semanal</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          
          {/* Seletor de Modalidade */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
              Modalidade do Exame
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleModalityChange('RADIOGRAFIA')}
                className={`p-3 rounded-2xl border flex items-center justify-center gap-2.5 font-bold transition cursor-pointer ${
                  modality === 'RADIOGRAFIA'
                    ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Radiografia (Raio-X)</span>
              </button>

              <button
                type="button"
                onClick={() => handleModalityChange('ULTRASSOM')}
                className={`p-3 rounded-2xl border flex items-center justify-center gap-2.5 font-bold transition cursor-pointer ${
                  modality === 'ULTRASSOM'
                    ? 'bg-teal-950/40 border-teal-500 text-teal-300 shadow-md shadow-teal-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Waves className="w-4 h-4 text-teal-400" />
                <span>Ultrassonografia (USG)</span>
              </button>
            </div>
          </div>

          {/* Data, Horário e Duração */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Data do Exame *</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Horário *</label>
              <input
                type="time"
                required
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Duração Estimada</label>
              <select
                value={durationMinutes}
                onChange={e => setDurationMinutes(parseInt(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
              >
                <option value={20}>20 minutos</option>
                <option value={30}>30 minutos (Padrão)</option>
                <option value={45}>45 minutos</option>
                <option value={60}>1 hora (Completo)</option>
              </select>
            </div>
          </div>

          {/* Clínica Parceira e Especialista */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Clínica Requisitante</label>
              <select
                value={selectedClinicId}
                onChange={e => handleClinicChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
              >
                {clinicsList.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.clinicName || c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Especialista Designado</label>
              <select
                value={specialistName}
                onChange={e => setSpecialistName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
              >
                <option value="Dra. Camila Siqueira (CRMV-SP 38.412)">Dra. Camila Siqueira (CRMV-SP 38.412)</option>
                <option value="Dr. Ricardo Valença (CRMV-SP 21.050)">Dr. Ricardo Valença (CRMV-SP 21.050)</option>
                <option value="Dra. Juliana Barros (CRMV-RJ 42.108)">Dra. Juliana Barros (CRMV-RJ 42.108)</option>
                <option value="Dr. Felipe Antunes (CRMV-MG 31.905)">Dr. Felipe Antunes (CRMV-MG 31.905)</option>
              </select>
            </div>
          </div>

          {/* Dados do Paciente e Tutor */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 block">
              Dados do Paciente &amp; Tutor
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Nome do Pet *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Rex, Mel, Thor"
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Espécie *</label>
                <select
                  value={species}
                  onChange={e => setSpecies(e.target.value as Species)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                >
                  <option value="Canino">Canino</option>
                  <option value="Felino">Felino</option>
                  <option value="Equino">Equino</option>
                  <option value="Silvestre/Exótico">Silvestre/Exótico</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Raça</label>
                <input
                  type="text"
                  placeholder="Ex: Golden, SRD, Siamês"
                  value={breed}
                  onChange={e => setBreed(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Nome do Tutor</label>
                <input
                  type="text"
                  placeholder="Nome do responsável"
                  value={ownerName}
                  onChange={e => setOwnerName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1">WhatsApp / Telefone do Tutor</label>
                <input
                  type="text"
                  placeholder="(11) 98765-4321 (para envio de lembrete)"
                  value={ownerPhone}
                  onChange={e => setOwnerPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Menu Interativo de Região e Exame */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <RegionSelector
              selectedRegion={region}
              currentModality={modality}
              onSelectRegion={(regName, defaultProjs, defaultFast, targetMod) => {
                if (targetMod) {
                  setModality(targetMod);
                }
                setRegion(regName);
                if (defaultFast && !preparationInstructions.includes(defaultFast)) {
                  setPreparationInstructions(prev => prev ? `${prev} • ${defaultFast}` : defaultFast);
                }
              }}
            />

            <div>
              <label className="block text-slate-400 mb-1 font-medium text-xs">Região Anatômica Selecionada *</label>
              <input
                type="text"
                required
                value={region}
                onChange={e => setRegion(e.target.value)}
                placeholder={modality === 'ULTRASSOM' ? 'Ex: Ultrassom Abdominal, TFAST, AFAST...' : 'Ex: Pelve, Tórax, Coluna Lombar...'}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500 font-semibold text-xs"
              />
            </div>
          </div>

          {/* Preparo e Recomendações */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-400 font-medium">Orientações de Preparo para a Clínica/Tutor</label>
              <span className="text-[10px] text-cyan-400">Clique para inserir:</span>
            </div>
            
            <div className="flex flex-wrap gap-1.5 mb-2">
              {[
                'Jejum alimentar de 8h',
                'Bexiga cheia (reter urina 2h)',
                'Tricotomia abdominal',
                'Sedação prévia autorizada',
                'Sem jejum (emergência)'
              ].map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addPrepTag(tag)}
                  className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 transition cursor-pointer"
                >
                  + {tag}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={preparationInstructions}
              onChange={e => setPreparationInstructions(e.target.value)}
              placeholder="Ex: Jejum alimentar de 8h, bexiga cheia..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
            />
          </div>

          {/* Observações da Rotina */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Observações Clínicas / Queixas</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ex: Animal agitado, histórico de êmese, claudicação em membro pélvico direito..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-cyan-500"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/25 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Confirmar Agendamento</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
