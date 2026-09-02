export type UserRole = 'CLINIC' | 'RADIOLOGIST' | 'ADMIN';

export type ClinicPlan = 'AVULSO' | 'PRO' | 'HOSPITAL';

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
  balance?: number; // Saldo em conta para laudos (em R$)
  plan?: ClinicPlan; // Plano da clínica parceira
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
  isDicom?: boolean;
  fileSize?: number;
  originalName?: string;
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

// Módulo Financeiro
export type TransactionType = 'CREDIT_PURCHASE' | 'EXAM_DEBIT' | 'REFUND';
export type PaymentMethod = 'PIX' | 'CREDIT_CARD' | 'BOLETO' | 'SALDO';

export interface FinancialTransaction {
  id: string;
  clinicId: string;
  clinicName: string;
  examId?: string;
  type: TransactionType;
  amount: number; // Ex: 45.00
  description: string;
  paymentMethod: PaymentMethod;
  status: 'COMPLETED' | 'PENDING';
  createdAt: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  badge?: string;
  description: string;
  radiographyPrice: number;
  ultrasoundPrice: number;
  urgentFee: number;
  slaRoutine: string;
  slaUrgent: string;
  features: string[];
  recommended?: boolean;
}

// Módulo de Agenda & Rotina Veterinária
export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Appointment {
  id: string; // Ex: "AG-2026-01"
  date: string; // YYYY-MM-DD
  time: string; // HH:mm (Ex: "09:30")
  durationMinutes?: number; // Padrão: 30 minutos
  clinicId: string;
  clinicName: string;
  requestingVet: string;
  specialistId?: string;
  specialistName?: string;
  
  patientName: string;
  species: Species;
  breed: string;
  age?: string;
  weight?: string;
  ownerName: string;
  ownerPhone?: string;
  
  modality: ExamModality;
  region: string;
  preparationInstructions?: string; // Ex: "Jejum de 8h, reter urina por 2h"
  notes?: string;
  
  status: AppointmentStatus;
  examId?: string; // ID do exame associado se já tiver sido gerado para laudo
  createdAt: string;
  updatedAt: string;
}

// Analytics Financeiro para Gestão
export interface ClinicFinancialSummary {
  clinicId: string;
  clinicName: string;
  contactName: string;
  email: string;
  phone?: string;
  uf?: string;
  plan: ClinicPlan;
  balance: number;
  totalExams: number;
  radiographyCount: number;
  ultrasoundCount: number;
  urgentCount: number;
  totalRevenue: number;
  lastExamDate?: string;
}

export interface PlatformFinancialAnalytics {
  totalRevenue: number;
  totalExamsBilled: number;
  radiographyRevenue: number;
  ultrasoundRevenue: number;
  urgencyRevenue: number;
  averageTicket: number;
  totalActiveBalance: number;
  clinicsCount: number;
  clinicsSummary: ClinicFinancialSummary[];
  monthlyRevenue: Array<{
    month: string;
    radiography: number;
    ultrasound: number;
    total: number;
  }>;
  planDistribution: Array<{
    plan: ClinicPlan;
    label: string;
    count: number;
    percentage: number;
    color: string;
  }>;
}


