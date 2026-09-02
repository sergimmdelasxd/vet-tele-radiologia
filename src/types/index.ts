export type UserRole = 'CLINIC' | 'RADIOLOGIST' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  clinicName?: string;
  crmv?: string; // Ex: CRMV-SP 45.291
  phone?: string;
  uf?: string;
  cnpj?: string;
  avatar?: string;
  createdAt: string;
}

export type Species = 'Canino' | 'Felino' | 'Equino' | 'Bovino' | 'Silvestre/Exótico';

export type ExamPriority = 'NORMAL' | 'URGENT';

export type ExamStatus = 'PENDING' | 'IN_PROGRESS' | 'REPORTED' | 'CANCELLED';

export type ExamModality = 'RADIOGRAFIA' | 'ULTRASSOM';

export interface ExamImage {
  id: string;
  url: string;
  label: string; // Ex: "Tórax - Projeção Laterolateral Direita" ou "USG - Parênquima Hepático"
  projection?: string;
  thumbnailUrl?: string;
  uploadedAt: string;
}

export interface Report {
  id: string;
  examId: string;
  radiologistId: string;
  radiologistName: string;
  radiologistCrmv: string;
  technique: string;
  findings: string;
  conclusion: string;
  recommendations: string;
  vhsScore?: string; // Ex: "9.7 v (Normal para a raça: < 10.5v)"
  norbergAngle?: string;
  ultrasoundOrgans?: string[];
  keyImageIds?: string[];
  reportedAt: string;
  digitalSignatureHash: string;
}

export interface Exam {
  id: string; // Ex: "VET-2026-101"
  clinicId: string;
  clinicName: string;
  requestingVet: string; // Médico solicitante
  clinicPhone?: string;
  
  // Modalidade: Radiografia ou Ultrassom
  modality: ExamModality;
  
  // Dados do animal/paciente
  patientName: string;
  species: Species;
  breed: string;
  age: string;
  weight: string; // Ex: "18.5 kg"
  gender: 'Macho' | 'Fêmea';
  isCastrated: boolean;
  ownerName: string;
  
  // Dados do exame
  region: string; // Ex: "Tórax (3 projeções)", "Abdômen Total", "USG Gestacional"
  projections: string[]; // No USG: órgãos avaliados ou cortes
  clinicalHistory: string;
  suspectedDiagnosis: string;
  priority: ExamPriority; // NORMAL (até 12h) | URGENT (até 2h / plantão)
  status: ExamStatus;

  // Campos específicos de Ultrassonografia
  fastingHours?: string; // Ex: "8 horas", "12 horas", "Não realizado"
  trichotomyDone?: boolean; // Tricotomia realizada
  ultrasoundType?: string; // "Abdominal Total", "Gestacional", "A-FAST Emergencial", "Cervical"
  
  images: ExamImage[];
  report?: Report;
  
  createdAt: string;
  updatedAt: string;
  deadline: string; // Previsão de entrega
}

export interface ReportTemplate {
  id: string;
  modality: ExamModality;
  title: string;
  category: string; // Ex: "Tórax", "Abdômen", "USG Abdominal", "USG Gestacional", "USG Urgência"
  technique: string;
  findings: string;
  conclusion: string;
  recommendations: string;
}

export interface DashboardStats {
  totalExams: number;
  pendingExams: number;
  inProgressExams: number;
  completedExams: number;
  urgentExams: number;
  radiographyCount: number;
  ultrasoundCount: number;
  averageTurnaroundMinutes: number;
  clinicsCount: number;
  radiologistsCount: number;
}
