import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { 
  User, 
  Exam, 
  DashboardStats, 
  Report, 
  ExamModality, 
  ExamPriority, 
  FinancialTransaction, 
  PaymentMethod, 
  Appointment, 
  AppointmentStatus, 
  ClinicPlan, 
  ClinicFinancialSummary, 
  PlatformFinancialAnalytics,
  ReportTemplate,
  QuickPhrase,
  TeachingCase,
  AppNotification
} from '@/types';
import { REPORT_TEMPLATES } from '@/data/templates';

const DB_PATH = path.join(process.cwd(), 'src', 'data', 'db.json');

export const PRICING_TABLE = {
  RADIOGRAFIA: {
    NORMAL: 45.00,
    URGENT: 65.00
  },
  ULTRASSOM: {
    NORMAL: 60.00,
    URGENT: 85.00
  }
};

interface DatabaseSchema {
  users: User[];
  exams: Exam[];
  transactions?: FinancialTransaction[];
  appointments?: Appointment[];
  templates?: ReportTemplate[];
  quickPhrases?: QuickPhrase[];
  teachingCases?: TeachingCase[];
  notifications?: AppNotification[];
}

function ensureDataDirectory() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function seedTransactions(): FinancialTransaction[] {
  return [
    {
      id: 'tx-seed-1',
      clinicId: 'user-clinic-vetlife',
      clinicName: 'Clínica Veterinária VetLife 24h',
      type: 'CREDIT_PURCHASE',
      amount: 500.00,
      description: 'Recarga de Créditos via PIX Instantâneo',
      paymentMethod: 'PIX',
      status: 'COMPLETED',
      createdAt: '2026-08-25T11:00:00Z'
    },
    {
      id: 'tx-seed-2',
      clinicId: 'user-clinic-vetlife',
      clinicName: 'Clínica Veterinária VetLife 24h',
      examId: 'VET-2026-101',
      type: 'EXAM_DEBIT',
      amount: 45.00,
      description: 'Laudo Radiográfico Tórax — Thor (VET-2026-101)',
      paymentMethod: 'SALDO',
      status: 'COMPLETED',
      createdAt: '2026-09-01T20:15:00Z'
    },
    {
      id: 'tx-seed-3',
      clinicId: 'user-clinic-vetlife',
      clinicName: 'Clínica Veterinária VetLife 24h',
      type: 'EXAM_DEBIT',
      amount: 75.00,
      description: 'Laudo Ultrassonográfico de Urgência — Luna',
      paymentMethod: 'SALDO',
      status: 'COMPLETED',
      createdAt: '2026-09-01T22:30:00Z'
    },
    {
      id: 'tx-seed-4',
      clinicId: 'user-clinic-petcare',
      clinicName: 'Hospital Veterinário PetCare',
      type: 'CREDIT_PURCHASE',
      amount: 300.00,
      description: 'Recarga Inicial via Cartão de Crédito',
      paymentMethod: 'CREDIT_CARD',
      status: 'COMPLETED',
      createdAt: '2026-08-28T09:30:00Z'
    },
    {
      id: 'tx-seed-5',
      clinicId: 'user-clinic-petcare',
      clinicName: 'Hospital Veterinário PetCare',
      type: 'EXAM_DEBIT',
      amount: 100.00,
      description: 'Débito 2 Laudos Radiográficos Ortopédicos',
      paymentMethod: 'SALDO',
      status: 'COMPLETED',
      createdAt: '2026-08-30T16:00:00Z'
    }
  ];
}

function seedAppointments(): Appointment[] {
  return [
    {
      id: 'AG-2026-01',
      date: '2026-09-02',
      time: '08:30',
      durationMinutes: 30,
      clinicId: 'user-clinic-vetlife',
      clinicName: 'Clínica Veterinária VetLife 24h',
      requestingVet: 'Dra. Mariana Souza',
      specialistId: 'user-rad-camila',
      specialistName: 'Dra. Camila Siqueira',
      patientName: 'Rex',
      species: 'Canino',
      breed: 'Pastor Alemão',
      age: '5 anos',
      weight: '36.0 kg',
      ownerName: 'Fernando Alencar',
      ownerPhone: '(11) 98111-2233',
      modality: 'RADIOGRAFIA',
      region: 'Pelve e Coxofemoral (Ângulo de Norberg)',
      preparationInstructions: 'Sedação leve autorizada pelo tutor. Não requer jejum hídrico.',
      notes: 'Avaliação preventiva de displasia coxofemoral. Leve claudicação pós-esforço.',
      status: 'COMPLETED',
      createdAt: '2026-09-01T14:00:00Z',
      updatedAt: '2026-09-02T09:15:00Z'
    },
    {
      id: 'AG-2026-02',
      date: '2026-09-02',
      time: '10:00',
      durationMinutes: 40,
      clinicId: 'user-clinic-petcare',
      clinicName: 'Hospital Veterinário PetCare',
      requestingVet: 'Dr. Lucas Silveira',
      specialistId: 'user-rad-camila',
      specialistName: 'Dra. Camila Siqueira',
      patientName: 'Nina',
      species: 'Felino',
      breed: 'Siamês',
      age: '8 anos',
      weight: '4.1 kg',
      ownerName: 'Patrícia Guimarães',
      ownerPhone: '(21) 97654-3210',
      modality: 'ULTRASSOM',
      region: 'Ultrassonografia Abdominal Total',
      preparationInstructions: 'Jejum alimentar estrito de 8h, bexiga cheia e tricotomia prévia.',
      notes: 'Vômitos frequentes e perda de peso nos últimos 4 dias.',
      status: 'IN_PROGRESS',
      createdAt: '2026-09-01T16:30:00Z',
      updatedAt: '2026-09-02T10:05:00Z'
    },
    {
      id: 'AG-2026-03',
      date: '2026-09-02',
      time: '11:30',
      durationMinutes: 30,
      clinicId: 'user-clinic-vetlife',
      clinicName: 'Clínica Veterinária VetLife 24h',
      requestingVet: 'Dra. Mariana Souza',
      specialistId: 'user-admin-ricardo',
      specialistName: 'Dr. Ricardo Valença',
      patientName: 'Bob',
      species: 'Canino',
      breed: 'Shih Tzu',
      age: '3 anos',
      weight: '6.5 kg',
      ownerName: 'Renata Vasconcelos',
      ownerPhone: '(11) 99888-4455',
      modality: 'ULTRASSOM',
      region: 'Ultrassonografia do Trato Urinário (Rins e Bexiga)',
      preparationInstructions: 'Reter micção por no mínimo 2 horas para avaliação vesical repleta.',
      notes: 'Disúria, hematúria e histórico prévio de cálculos vesicais.',
      status: 'CONFIRMED',
      createdAt: '2026-09-01T18:00:00Z',
      updatedAt: '2026-09-02T08:00:00Z'
    },
    {
      id: 'AG-2026-04',
      date: '2026-09-02',
      time: '14:00',
      durationMinutes: 30,
      clinicId: 'user-clinic-vetlife',
      clinicName: 'Clínica Veterinária VetLife 24h',
      requestingVet: 'Dra. Mariana Souza',
      specialistId: 'user-rad-camila',
      specialistName: 'Dra. Camila Siqueira',
      patientName: 'Luke',
      species: 'Canino',
      breed: 'Golden Retriever',
      age: '2 anos',
      weight: '31.0 kg',
      ownerName: 'Marcos Vinícius',
      ownerPhone: '(11) 98777-6655',
      modality: 'RADIOGRAFIA',
      region: 'Tórax (3 projeções: LL-D, LL-E e VD)',
      preparationInstructions: 'Recomenda-se tutor acompanhar o posicionamento. Sem jejum alimentar.',
      notes: 'Tosse seca e intolerância a esforço físico.',
      status: 'SCHEDULED',
      createdAt: '2026-09-02T08:30:00Z',
      updatedAt: '2026-09-02T08:30:00Z'
    },
    {
      id: 'AG-2026-05',
      date: '2026-09-02',
      time: '16:00',
      durationMinutes: 40,
      clinicId: 'user-clinic-petcare',
      clinicName: 'Hospital Veterinário PetCare',
      requestingVet: 'Dr. Lucas Silveira',
      specialistId: 'user-rad-camila',
      specialistName: 'Dra. Camila Siqueira',
      patientName: 'Mel',
      species: 'Felino',
      breed: 'Persa',
      age: '4 anos',
      weight: '3.8 kg',
      ownerName: 'Cláudia Ramos',
      ownerPhone: '(21) 98123-4567',
      modality: 'ULTRASSOM',
      region: 'Ultrassonografia Gestacional (Viabilidade Fetal)',
      preparationInstructions: 'Tricotomia abdominal sutil. Jejum curto de 4h.',
      notes: 'Gestação aos 45 dias. Contagem de fetos e batimentos cardíacos fetais.',
      status: 'SCHEDULED',
      createdAt: '2026-09-02T09:00:00Z',
      updatedAt: '2026-09-02T09:00:00Z'
    },
    {
      id: 'AG-2026-06',
      date: '2026-09-03',
      time: '09:00',
      durationMinutes: 30,
      clinicId: 'user-clinic-vetlife',
      clinicName: 'Clínica Veterinária VetLife 24h',
      requestingVet: 'Dra. Mariana Souza',
      specialistId: 'user-rad-camila',
      specialistName: 'Dra. Camila Siqueira',
      patientName: 'Toby',
      species: 'Canino',
      breed: 'Beagle',
      age: '7 anos',
      weight: '14.2 kg',
      ownerName: 'Rodrigo Faro',
      ownerPhone: '(11) 99123-8877',
      modality: 'RADIOGRAFIA',
      region: 'Coluna Toracolombar e Lombar',
      preparationInstructions: 'Manipulação cautelosa durante o transporte e contenção.',
      notes: 'Dor intensa à palpação vertebral e relutância em subir escadas.',
      status: 'CONFIRMED',
      createdAt: '2026-09-02T10:00:00Z',
      updatedAt: '2026-09-02T10:00:00Z'
    }
  ];
}

function seedDatabase(): DatabaseSchema {
  const defaultPasswordHash = bcrypt.hashSync('123456', 10);
  const adminPasswordHash = bcrypt.hashSync('admin123', 10);

  const users: User[] = [
    {
      id: 'user-clinic-vetlife',
      name: 'Dra. Mariana Souza (VetLife)',
      email: 'clinica@vetlife.com.br',
      password: defaultPasswordHash,
      role: 'CLINIC',
      clinicName: 'Clínica Veterinária VetLife 24h',
      crmv: 'CRMV-SP 33.120',
      cnpj: '12.345.678/0001-90',
      phone: '(11) 98765-4321',
      uf: 'SP',
      balance: 380.00,
      plan: 'PRO',
      createdAt: '2026-08-01T10:00:00Z'
    },
    {
      id: 'user-clinic-petcare',
      name: 'Dr. Lucas Silveira (PetCare)',
      email: 'contato@petcare24h.com.br',
      password: defaultPasswordHash,
      role: 'CLINIC',
      clinicName: 'Hospital Veterinário PetCare',
      crmv: 'CRMV-RJ 28.940',
      cnpj: '98.765.432/0001-11',
      phone: '(21) 99888-7766',
      uf: 'RJ',
      balance: 200.00,
      plan: 'HOSPITAL',
      createdAt: '2026-08-10T14:30:00Z'
    },
    {
      id: 'user-rad-camila',
      name: 'Dra. Camila Siqueira',
      email: 'radiologista@vetrad.com.br',
      password: defaultPasswordHash,
      role: 'RADIOLOGIST',
      crmv: 'CRMV-SP 38.412',
      phone: '(11) 97111-2233',
      uf: 'SP',
      createdAt: '2026-07-15T08:00:00Z'
    },
    {
      id: 'user-admin-ricardo',
      name: 'Dr. Ricardo Valença',
      email: 'admin@vetrad.com.br',
      password: adminPasswordHash,
      role: 'ADMIN',
      crmv: 'CRMV-SP 21.050',
      phone: '(11) 99999-0000',
      uf: 'SP',
      createdAt: '2026-06-01T09:00:00Z'
    }
  ];

  const exams: Exam[] = [
    {
      id: 'VET-2026-101',
      clinicId: 'user-clinic-vetlife',
      clinicName: 'Clínica Veterinária VetLife 24h',
      requestingVet: 'Dra. Mariana Souza - CRMV-SP 33.120',
      clinicPhone: '(11) 98765-4321',
      modality: 'RADIOGRAFIA',
      patientName: 'Thor',
      species: 'Canino',
      breed: 'Golden Retriever',
      age: '4 anos',
      weight: '32.5 kg',
      gender: 'Macho',
      isCastrated: true,
      ownerName: 'Carlos Eduardo Mendes',
      region: 'Tórax (3 projeções)',
      projections: ['Laterolateral Direita (LL-D)', 'Ventrodorsal (VD)'],
      clinicalHistory: 'Tosse seca há 5 dias, cansaço fácil após passeios leves e episódio único de engasgo.',
      suspectedDiagnosis: 'Cardiopatia / Broncopatia alérgica / Corpo estranho esofágico',
      priority: 'NORMAL',
      status: 'REPORTED',
      images: [
        {
          id: 'img-101-1',
          url: '/xrays/canine-thorax-lateral.svg',
          label: 'Tórax - Projeção Laterolateral Direita',
          projection: 'LL-D',
          uploadedAt: '2026-08-30T10:15:00Z'
        },
        {
          id: 'img-101-2',
          url: '/xrays/canine-thorax-vd.svg',
          label: 'Tórax - Projeção Ventrodorsal',
          projection: 'VD',
          uploadedAt: '2026-08-30T10:16:00Z'
        }
      ],
      report: {
        id: 'rep-101',
        examId: 'VET-2026-101',
        radiologistId: 'user-rad-camila',
        radiologistName: 'Dra. Camila Siqueira',
        radiologistCrmv: 'CRMV-SP 38.412',
        technique: 'Estudo radiográfico do tórax obtido em projeções ortogonais LL-D e VD, com boa técnica e contraste satisfatório.',
        findings: 'Campos pulmonares apresentando radiopacidade preservada, sem evidências de infiltrados alveolares, brônquicos ou nodulares ativos.\nSilhueta cardíaca com dimensões e contornos anatômicos normais para o biótipo da raça. Traqueia torácica com trajeto e calibre normais.\nEspaço pleural livre de efusões ou pneumotórax. Cúpula diafragmática com integridade mantida.\nEstruturas ósseas da caixa torácica e vértebras sem alterações patológicas detectáveis.',
        conclusion: 'Estudo radiográfico do tórax dentro dos padrões de normalidade radiográfica no momento do exame.',
        recommendations: 'Correlação com ausculta minuciosa e pesquisa de causas respiratórias de vias aéreas superiores (colapso de traqueia cervical ou tosse dos canis).',
        vhsScore: '9.6 v (Normal para a raça Golden: até 10.3 v)',
        keyImageIds: ['img-101-1'],
        reportedAt: '2026-08-30T11:45:00Z',
        digitalSignatureHash: 'VET-SHA256-a78b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b'
      },
      createdAt: '2026-08-30T10:15:00Z',
      updatedAt: '2026-08-30T11:45:00Z',
      deadline: '2026-08-30T22:15:00Z'
    },
    {
      id: 'VET-2026-102',
      clinicId: 'user-clinic-vetlife',
      clinicName: 'Clínica Veterinária VetLife 24h',
      requestingVet: 'Dra. Mariana Souza - CRMV-SP 33.120',
      clinicPhone: '(11) 98765-4321',
      modality: 'RADIOGRAFIA',
      patientName: 'Bob',
      species: 'Canino',
      breed: 'Bulldog Francês',
      age: '2 anos',
      weight: '12.8 kg',
      gender: 'Macho',
      isCastrated: false,
      ownerName: 'Juliana Paes Correia',
      region: 'Membro Torácico Direito (Rádio e Ulna)',
      projections: ['Mediolateral (ML)', 'Craniocaudal (CrCd)'],
      clinicalHistory: 'Queda do sofá há 1 hora. Claudicação de grau IV em membro torácico direito, dor intensa à palpação e crepitação óssea.',
      suspectedDiagnosis: 'Fratura óssea de rádio e ulna',
      priority: 'URGENT',
      status: 'PENDING',
      images: [
        {
          id: 'img-102-1',
          url: '/xrays/canine-limb-fracture.svg',
          label: 'Membro Torácico Direito - Projeção Mediolateral',
          projection: 'ML',
          uploadedAt: '2026-09-01T22:00:00Z'
        }
      ],
      createdAt: '2026-09-01T22:00:00Z',
      updatedAt: '2026-09-01T22:00:00Z',
      deadline: '2026-09-02T00:00:00Z' // Urgência: 2 horas SLA
    },
    {
      id: 'VET-2026-103',
      clinicId: 'user-clinic-petcare',
      clinicName: 'Hospital Veterinário PetCare',
      requestingVet: 'Dr. Lucas Silveira - CRMV-RJ 28.940',
      clinicPhone: '(21) 99888-7766',
      modality: 'ULTRASSOM',
      ultrasoundType: 'Ultrassonografia Abdominal Total',
      fastingHours: 'Jejum alimentar de 8 horas',
      trichotomyDone: true,
      patientName: 'Mel',
      species: 'Felino',
      breed: 'Persa',
      age: '5 anos',
      weight: '4.1 kg',
      gender: 'Fêmea',
      isCastrated: true,
      ownerName: 'Fernanda Montenegro Lima',
      region: 'Ultrassonografia Abdominal Total',
      projections: ['Fígado', 'Vesícula Biliar', 'Baço', 'Rins', 'Bexiga'],
      clinicalHistory: 'Poliúria, polidipsia e perda ponderal progressiva nos últimos 2 meses. Creatinina sérica 3.4 mg/dL.',
      suspectedDiagnosis: 'Doença Renal Crônica (DRC) / Nefropatia / Cistos Renais',
      priority: 'NORMAL',
      status: 'REPORTED',
      images: [
        {
          id: 'img-103-1',
          url: '/ultrasound/usg-abdominal-liver-kidney.svg',
          label: 'USG - Rim Direito e Parênquima Hepático',
          projection: 'Rim D / Fígado',
          uploadedAt: '2026-09-01T21:30:00Z'
        }
      ],
      report: {
        id: 'rep-103',
        examId: 'VET-2026-103',
        radiologistId: 'user-rad-camila',
        radiologistName: 'Dra. Camila Siqueira',
        radiologistCrmv: 'CRMV-SP 38.412',
        technique: 'Ultrassonografia abdominal completa realizada com transdutor microconvexo de alta frequência (7.5 a 10.0 MHz).',
        findings: 'FÍGADO: Dimensões anatômicas normais, bordos afilados, ecotextura homogênea fina e ecogenicidade fisiológica.\nRINS: Dimensões limítrofes inferiores (D: 3.2 cm, E: 3.1 cm), contornos discretamente irregulares. Córtex renal com ecogenicidade aumentada bilateralmente com atenuação da definição córtico-medular e sinal da linha medular discreto. Pelve renal preservada.\nBAÇO E BEXIGA: Normoecogênicos, sem evidências de lesões focais ou litíase.\nLÍQUIDO LIVRE: Ausência de efusões livres na cavidade peritoneal.',
        conclusion: 'Achados ultrassonográficos renais compatíveis com Nefropatia Crônica (DRC) bilateral em estágio moderado a avançado.',
        recommendations: 'Acompanhamento nefrológico contínuo, controle da pressão arterial sistêmica (PAS), estadiamento IRIS e urinálise com UPC.',
        reportedAt: '2026-09-01T22:40:00Z',
        digitalSignatureHash: 'VET-SHA256-d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5'
      },
      createdAt: '2026-09-01T21:30:00Z',
      updatedAt: '2026-09-01T22:40:00Z',
      deadline: '2026-09-02T09:30:00Z'
    },
    {
      id: 'VET-2026-104',
      clinicId: 'user-clinic-vetlife',
      clinicName: 'Clínica Veterinária VetLife 24h',
      requestingVet: 'Dra. Mariana Souza - CRMV-SP 33.120',
      clinicPhone: '(11) 98765-4321',
      modality: 'ULTRASSOM',
      ultrasoundType: 'Acompanhamento Obstétrico / Gestacional',
      fastingHours: 'Não necessário',
      trichotomyDone: true,
      patientName: 'Luna',
      species: 'Canino',
      breed: 'Shih-tzu',
      age: '3 anos',
      weight: '5.8 kg',
      gender: 'Fêmea',
      isCastrated: false,
      ownerName: 'Patrícia Abravanel Silva',
      region: 'Ultrassom Gestacional Obstétrico',
      projections: ['Útero Grávido', 'Câmaras Amnióticas', 'Doppler Fetal'],
      clinicalHistory: 'Cobertura confirmada há aproximadamente 35 dias. Avaliação de prenhez, número aproximado de vesículas e viabilidade fetal.',
      suspectedDiagnosis: 'Confirmação de gestação e viabilidade fetal',
      priority: 'NORMAL',
      status: 'PENDING',
      images: [
        {
          id: 'img-104-1',
          url: '/ultrasound/usg-gestational-fetus.svg',
          label: 'USG Gestacional - Vesícula e Feto 1',
          projection: 'Útero Gestacional',
          uploadedAt: '2026-09-01T22:15:00Z'
        }
      ],
      createdAt: '2026-09-01T22:15:00Z',
      updatedAt: '2026-09-01T22:15:00Z',
      deadline: '2026-09-02T10:15:00Z'
    },
    {
      id: 'VET-2026-105',
      clinicId: 'user-clinic-vetlife',
      clinicName: 'Clínica Veterinária VetLife 24h',
      requestingVet: 'Dra. Mariana Souza - CRMV-SP 33.120',
      clinicPhone: '(11) 98765-4321',
      modality: 'ULTRASSOM',
      ultrasoundType: 'Ultrassom Abdominal / Trato Urinário',
      fastingHours: '6 horas',
      trichotomyDone: true,
      patientName: 'Spike',
      species: 'Canino',
      breed: 'Pug',
      age: '6 anos',
      weight: '9.2 kg',
      gender: 'Macho',
      isCastrated: true,
      ownerName: 'Marcelo Rezende Lima',
      region: 'Trato Urinário (Bexiga e Rins)',
      projections: ['Bexiga Transversal', 'Bexiga Longitudinal', 'Rins'],
      clinicalHistory: 'Disúria, estrangúria e hematúria franca há 2 dias. Animal faz força intensa para urinar com gotas frequentes.',
      suspectedDiagnosis: 'Urolitíase vesical / Cistite hemorrágica',
      priority: 'URGENT',
      status: 'PENDING',
      images: [
        {
          id: 'img-105-1',
          url: '/ultrasound/usg-bladder-calculus.svg',
          label: 'USG - Bexiga com Cálculo e Sombra Acústica',
          projection: 'Bexiga Transversal',
          uploadedAt: '2026-09-01T23:10:00Z'
        }
      ],
      createdAt: '2026-09-01T23:10:00Z',
      updatedAt: '2026-09-01T23:10:00Z',
      deadline: '2026-09-02T01:10:00Z' // Urgência: 2 horas SLA
    }
  ];

  const db: DatabaseSchema = { 
    users, 
    exams, 
    transactions: seedTransactions(), 
    appointments: seedAppointments(),
    templates: [...REPORT_TEMPLATES]
  };
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  return db;
}

export function readDatabase(): DatabaseSchema {
  ensureDataDirectory();
  if (!fs.existsSync(DB_PATH)) {
    return seedDatabase();
  }

  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    const parsed: DatabaseSchema = JSON.parse(raw);
    // Se não tiver a propriedade modality nos exames, atualiza
    if (!parsed.exams || parsed.exams.length === 0 || !parsed.exams[0].modality) {
      return seedDatabase();
    }

    let shouldSave = false;
    if (!parsed.transactions || parsed.transactions.length === 0) {
      parsed.transactions = seedTransactions();
      shouldSave = true;
    }

    if (!parsed.appointments || parsed.appointments.length === 0) {
      parsed.appointments = seedAppointments();
      shouldSave = true;
    }

    if (!parsed.templates || parsed.templates.length === 0) {
      parsed.templates = [...REPORT_TEMPLATES];
      shouldSave = true;
    }

    for (const u of parsed.users) {
      if (u.role === 'CLINIC') {
        if (u.balance === undefined || u.balance === null) {
          u.balance = u.id === 'user-clinic-vetlife' ? 380.00 : 200.00;
          shouldSave = true;
        }
        if (!u.plan) {
          u.plan = u.id === 'user-clinic-petcare' ? 'HOSPITAL' : (u.id === 'user-clinic-vetlife' ? 'PRO' : 'AVULSO');
          shouldSave = true;
        }
        if (!u.clinicLogo) {
          if (u.id === 'user-clinic-vetlife') {
            u.clinicLogo = '/logos/vetlife-logo.svg';
            shouldSave = true;
          } else if (u.id === 'user-clinic-petcare') {
            u.clinicLogo = '/logos/petcare-logo.svg';
            shouldSave = true;
          }
        }
      }
    }

    if (parsed.exams) {
      for (const e of parsed.exams) {
        if (!e.clinicLogo) {
          const ownerClinic = parsed.users.find(u => u.id === e.clinicId || (u.clinicName && u.clinicName === e.clinicName));
          if (ownerClinic?.clinicLogo) {
            e.clinicLogo = ownerClinic.clinicLogo;
            shouldSave = true;
          }
        }
      }
    }

    if (shouldSave) {
      writeDatabase(parsed);
    }

    return parsed;
  } catch {
    return seedDatabase();
  }
}

export function writeDatabase(data: DatabaseSchema): void {
  ensureDataDirectory();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// User methods
export function findUserByEmail(email: string): User | undefined {
  const db = readDatabase();
  return db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id: string): User | undefined {
  const db = readDatabase();
  return db.users.find(u => u.id === id);
}

export function getAllUsers(): User[] {
  const db = readDatabase();
  return db.users.map(({ password: _, ...user }) => user as User);
}

export function createUser(userData: Omit<User, 'id' | 'createdAt'>): User {
  const db = readDatabase();
  const newUser: User = {
    ...userData,
    id: `user-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  db.users.push(newUser);
  writeDatabase(db);
  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword as User;
}

export function updateUser(id: string, updates: Partial<User>): User | null {
  const db = readDatabase();
  const index = db.users.findIndex(u => u.id === id);
  if (index === -1) return null;

  db.users[index] = {
    ...db.users[index],
    ...updates
  };
  writeDatabase(db);
  const { password: _, ...userWithoutPassword } = db.users[index];
  return userWithoutPassword as User;
}

// Exam methods
export function getAllExams(filters?: {
  clinicId?: string;
  status?: string;
  priority?: string;
  modality?: string;
}): Exam[] {
  const db = readDatabase();
  let results = [...db.exams];

  if (filters?.clinicId) {
    results = results.filter(e => e.clinicId === filters.clinicId);
  }

  if (filters?.status && filters.status !== 'ALL') {
    results = results.filter(e => e.status === filters.status);
  }

  if (filters?.priority && filters.priority !== 'ALL') {
    results = results.filter(e => e.priority === filters.priority);
  }

  if (filters?.modality && filters.modality !== 'ALL') {
    results = results.filter(e => e.modality === filters.modality);
  }

  // Sort by priority URGENT first, then newest
  return results.sort((a, b) => {
    if (a.priority === 'URGENT' && b.priority !== 'URGENT') return -1;
    if (b.priority === 'URGENT' && a.priority !== 'URGENT') return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function getExamById(id: string): Exam | undefined {
  const db = readDatabase();
  return db.exams.find(e => e.id === id);
}

export function createExam(examData: Partial<Exam>): Exam {
  const db = readDatabase();
  const nextNum = db.exams.length + 101;
  const examId = `VET-2026-${nextNum}`;
  
  const now = new Date();
  const isUrgent = examData.priority === 'URGENT';
  const deadlineDate = new Date(now.getTime() + (isUrgent ? 2 * 3600 * 1000 : 12 * 3600 * 1000));

  // Se a clínica já possui logotipo no perfil, herda automaticamente caso não seja enviado no exame
  const clinicUser = db.users.find(u => u.id === examData.clinicId || (u.clinicName && u.clinicName === examData.clinicName));
  const finalClinicLogo = examData.clinicLogo || clinicUser?.clinicLogo || '';

  const newExam: Exam = {
    id: examId,
    clinicId: examData.clinicId || 'unknown',
    clinicName: examData.clinicName || 'Clínica Conveniada',
    requestingVet: examData.requestingVet || 'Médico Veterinário',
    clinicPhone: examData.clinicPhone || '',
    clinicLogo: finalClinicLogo,
    modality: examData.modality || 'RADIOGRAFIA',
    patientName: examData.patientName || 'Paciente',
    species: examData.species || 'Canino',
    breed: examData.breed || 'SRD',
    age: examData.age || 'Não informada',
    weight: examData.weight || 'Não informado',
    gender: examData.gender || 'Macho',
    isCastrated: examData.isCastrated ?? false,
    ownerName: examData.ownerName || 'Tutor Responsável',
    region: examData.region || (examData.modality === 'ULTRASSOM' ? 'Ultrassonografia Abdominal Total' : 'Radiografia Geral'),
    projections: examData.projections || ['Ortogonal'],
    clinicalHistory: examData.clinicalHistory || '',
    suspectedDiagnosis: examData.suspectedDiagnosis || '',
    priority: examData.priority || 'NORMAL',
    status: 'PENDING',
    fastingHours: examData.fastingHours,
    trichotomyDone: examData.trichotomyDone,
    ultrasoundType: examData.ultrasoundType,
    images: examData.images || [],
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    deadline: deadlineDate.toISOString()
  };

  db.exams.unshift(newExam);
  writeDatabase(db);
  return newExam;
}

export function updateExam(id: string, updates: Partial<Exam>): Exam | null {
  const db = readDatabase();
  const index = db.exams.findIndex(e => e.id === id);
  if (index === -1) return null;

  db.exams[index] = {
    ...db.exams[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  writeDatabase(db);
  return db.exams[index];
}

export function saveReport(examId: string, reportData: Omit<Report, 'id' | 'digitalSignatureHash' | 'reportedAt'>): Exam | null {
  const db = readDatabase();
  const index = db.exams.findIndex(e => e.id === examId);
  if (index === -1) return null;

  const now = new Date().toISOString();
  const hash = `VET-SIGN-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

  const fullReport: Report = {
    ...reportData,
    id: `rep-${Date.now()}`,
    reportedAt: now,
    digitalSignatureHash: hash
  };

  db.exams[index].report = fullReport;
  db.exams[index].status = 'REPORTED';
  db.exams[index].updatedAt = now;

  writeDatabase(db);
  return db.exams[index];
}

export function getStats(): DashboardStats {
  const db = readDatabase();
  const totalExams = db.exams.length;
  const pendingExams = db.exams.filter(e => e.status === 'PENDING').length;
  const inProgressExams = db.exams.filter(e => e.status === 'IN_PROGRESS').length;
  const completedExams = db.exams.filter(e => e.status === 'REPORTED').length;
  const urgentExams = db.exams.filter(e => e.priority === 'URGENT' && e.status !== 'REPORTED').length;
  const radiographyCount = db.exams.filter(e => e.modality === 'RADIOGRAFIA').length;
  const ultrasoundCount = db.exams.filter(e => e.modality === 'ULTRASSOM').length;
  
  const clinics = new Set(db.users.filter(u => u.role === 'CLINIC').map(u => u.id));
  const radiologists = new Set(db.users.filter(u => u.role === 'RADIOLOGIST').map(u => u.id));

  return {
    totalExams,
    pendingExams,
    inProgressExams,
    completedExams,
    urgentExams,
    radiographyCount,
    ultrasoundCount,
    averageTurnaroundMinutes: 48,
    clinicsCount: clinics.size,
    radiologistsCount: radiologists.size
  };
}

// Financial Methods
export function getExamPrice(modality: ExamModality, priority: ExamPriority): number {
  const base = modality === 'ULTRASSOM' ? PRICING_TABLE.ULTRASSOM : PRICING_TABLE.RADIOGRAFIA;
  return priority === 'URGENT' ? base.URGENT : base.NORMAL;
}

export function getFinancialTransactions(clinicId?: string): FinancialTransaction[] {
  const db = readDatabase();
  const txs = db.transactions || [];
  if (clinicId) {
    return txs
      .filter(t => t.clinicId === clinicId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  return txs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function rechargeBalance(
  clinicId: string,
  amount: number,
  paymentMethod: PaymentMethod
): { user: User; transaction: FinancialTransaction } {
  const db = readDatabase();
  const user = db.users.find(u => u.id === clinicId);
  if (!user) {
    throw new Error('Clínica não encontrada no sistema');
  }

  const currentBalance = typeof user.balance === 'number' ? user.balance : 0;
  user.balance = Number((currentBalance + amount).toFixed(2));

  const transaction: FinancialTransaction = {
    id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    clinicId: user.id,
    clinicName: user.clinicName || user.name,
    type: 'CREDIT_PURCHASE',
    amount: Number(amount.toFixed(2)),
    description: `Recarga de Créditos via ${paymentMethod === 'PIX' ? 'PIX Instantâneo' : 'Cartão de Crédito'}`,
    paymentMethod,
    status: 'COMPLETED',
    createdAt: new Date().toISOString()
  };

  if (!db.transactions) db.transactions = [];
  db.transactions.unshift(transaction);
  writeDatabase(db);

  return { user, transaction };
}

export function debitExamCost(
  clinicId: string,
  examId: string,
  modality: ExamModality,
  priority: ExamPriority
): { user?: User; transaction?: FinancialTransaction; price: number } {
  const db = readDatabase();
  const user = db.users.find(u => u.id === clinicId);
  const cost = getExamPrice(modality, priority);

  if (!user) {
    return { price: cost };
  }

  const currentBalance = typeof user.balance === 'number' ? user.balance : 0;
  user.balance = Number((currentBalance - cost).toFixed(2));

  const transaction: FinancialTransaction = {
    id: `tx-deb-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    clinicId: user.id,
    clinicName: user.clinicName || user.name,
    examId,
    type: 'EXAM_DEBIT',
    amount: cost,
    description: `Laudo ${modality === 'ULTRASSOM' ? 'Ultrassom' : 'Raio-X'} (${priority === 'URGENT' ? 'Plantão Urgência' : 'Rotina'}) — Exame ${examId}`,
    paymentMethod: 'SALDO',
    status: 'COMPLETED',
    createdAt: new Date().toISOString()
  };

  if (!db.transactions) db.transactions = [];
  db.transactions.unshift(transaction);
  writeDatabase(db);

  return { user, transaction, price: cost };
}

// Appointment Methods (Agenda & Rotina)
export function getAllAppointments(filters?: {
  date?: string;
  specialistId?: string;
  clinicId?: string;
  status?: string;
  modality?: string;
}): Appointment[] {
  const db = readDatabase();
  let list = db.appointments || [];

  if (filters?.date) {
    list = list.filter(a => a.date === filters.date);
  }
  if (filters?.specialistId && filters.specialistId !== 'ALL') {
    list = list.filter(a => a.specialistId === filters.specialistId);
  }
  if (filters?.clinicId && filters.clinicId !== 'ALL') {
    list = list.filter(a => a.clinicId === filters.clinicId);
  }
  if (filters?.status && filters.status !== 'ALL') {
    list = list.filter(a => a.status === filters.status);
  }
  if (filters?.modality && filters.modality !== 'ALL') {
    list = list.filter(a => a.modality === filters.modality);
  }

  return list.sort((a, b) => {
    const dateComp = a.date.localeCompare(b.date);
    if (dateComp !== 0) return dateComp;
    return a.time.localeCompare(b.time);
  });
}

export function getAppointmentById(id: string): Appointment | undefined {
  const db = readDatabase();
  return (db.appointments || []).find(a => a.id === id);
}

export function createAppointment(data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Appointment {
  const db = readDatabase();
  if (!db.appointments) db.appointments = [];

  const newAppointment: Appointment = {
    ...data,
    id: `AG-${new Date().getFullYear()}-${String(db.appointments.length + 1).padStart(2, '0')}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.appointments.push(newAppointment);
  writeDatabase(db);
  return newAppointment;
}

export function updateAppointment(id: string, updates: Partial<Appointment>): Appointment | null {
  const db = readDatabase();
  if (!db.appointments) return null;
  const index = db.appointments.findIndex(a => a.id === id);
  if (index === -1) return null;

  db.appointments[index] = {
    ...db.appointments[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  writeDatabase(db);
  return db.appointments[index];
}

export function deleteAppointment(id: string): boolean {
  const db = readDatabase();
  if (!db.appointments) return false;
  const initLen = db.appointments.length;
  db.appointments = db.appointments.filter(a => a.id !== id);
  if (db.appointments.length !== initLen) {
    writeDatabase(db);
    return true;
  }
  return false;
}

export function convertAppointmentToExam(appointmentId: string): { appointment: Appointment; exam: Exam } | null {
  const db = readDatabase();
  if (!db.appointments) return null;
  const appIndex = db.appointments.findIndex(a => a.id === appointmentId);
  if (appIndex === -1) return null;

  const app = db.appointments[appIndex];
  
  // Criar o exame oficial na worklist
  const newExam = createExam({
    clinicId: app.clinicId,
    clinicName: app.clinicName,
    requestingVet: app.requestingVet,
    clinicPhone: app.ownerPhone || '',
    modality: app.modality,
    patientName: app.patientName,
    species: app.species,
    breed: app.breed,
    age: app.age || 'Não informada',
    weight: app.weight || '',
    gender: 'Macho',
    isCastrated: false,
    ownerName: app.ownerName,
    region: app.region,
    projections: app.modality === 'ULTRASSOM' ? ['Varredura Completa'] : ['Projeções de Rotina'],
    clinicalHistory: `Exame originado do agendamento de rotina (${app.date} às ${app.time}). ${app.notes || ''}`,
    suspectedDiagnosis: app.notes || 'Rotina preventiva/investigativa',
    priority: 'NORMAL',
    fastingHours: app.preparationInstructions,
    images: []
  });

  // Atualizar o status do agendamento
  db.appointments[appIndex].status = 'COMPLETED';
  db.appointments[appIndex].examId = newExam.id;
  db.appointments[appIndex].updatedAt = new Date().toISOString();
  writeDatabase(db);

  return { appointment: db.appointments[appIndex], exam: newExam };
}

// Financial Analytics for Admin & Radiologists
export function updateClinicPlan(clinicId: string, plan: ClinicPlan): User | null {
  const db = readDatabase();
  const userIndex = db.users.findIndex(u => u.id === clinicId);
  if (userIndex === -1) return null;

  db.users[userIndex].plan = plan;
  writeDatabase(db);
  const { password: _, ...userWithoutPass } = db.users[userIndex];
  return userWithoutPass as User;
}

export function adjustClinicBalance(clinicId: string, amount: number, reason: string): { user: User; transaction: FinancialTransaction } {
  const db = readDatabase();
  const user = db.users.find(u => u.id === clinicId);
  if (!user) throw new Error('Clínica não encontrada');

  const currentBalance = typeof user.balance === 'number' ? user.balance : 0;
  user.balance = Number((currentBalance + amount).toFixed(2));

  const transaction: FinancialTransaction = {
    id: `tx-adj-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    clinicId: user.id,
    clinicName: user.clinicName || user.name,
    type: amount >= 0 ? 'CREDIT_PURCHASE' : 'EXAM_DEBIT',
    amount: Math.abs(amount),
    description: `Ajuste Administrativo de Saldo: ${reason}`,
    paymentMethod: 'SALDO',
    status: 'COMPLETED',
    createdAt: new Date().toISOString()
  };

  if (!db.transactions) db.transactions = [];
  db.transactions.unshift(transaction);
  writeDatabase(db);

  return { user, transaction };
}

export function getPlatformFinancialAnalytics(): PlatformFinancialAnalytics {
  const db = readDatabase();
  const clinics = db.users.filter(u => u.role === 'CLINIC');
  const exams = db.exams || [];
  const transactions = db.transactions || [];

  // Resumo por clínica
  const clinicsSummary: ClinicFinancialSummary[] = clinics.map(c => {
    const clinicExams = exams.filter(e => e.clinicId === c.id);
    const radCount = clinicExams.filter(e => e.modality === 'RADIOGRAFIA').length;
    const usgCount = clinicExams.filter(e => e.modality === 'ULTRASSOM').length;
    const urgCount = clinicExams.filter(e => e.priority === 'URGENT').length;

    // Débitos reais ou calculados
    const debits = transactions.filter(t => t.clinicId === c.id && t.type === 'EXAM_DEBIT');
    let clinicRevenue = debits.reduce((acc, t) => acc + t.amount, 0);

    if (clinicRevenue === 0 && clinicExams.length > 0) {
      clinicRevenue = (radCount * 45) + (usgCount * 60) + (urgCount * 20);
    }

    const sortedExams = [...clinicExams].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const lastExam = sortedExams[0];

    return {
      clinicId: c.id,
      clinicName: c.clinicName || c.name,
      contactName: c.name,
      email: c.email,
      phone: c.phone,
      uf: c.uf || 'SP',
      plan: c.plan || 'AVULSO',
      balance: c.balance ?? 0,
      totalExams: clinicExams.length,
      radiographyCount: radCount,
      ultrasoundCount: usgCount,
      urgentCount: urgCount,
      totalRevenue: Number(clinicRevenue.toFixed(2)),
      lastExamDate: lastExam?.createdAt
    };
  });

  clinicsSummary.sort((a, b) => b.totalRevenue - a.totalRevenue);

  const totalExamsBilled = exams.length;
  const radExamsCount = exams.filter(e => e.modality === 'RADIOGRAFIA').length;
  const usgExamsCount = exams.filter(e => e.modality === 'ULTRASSOM').length;
  const urgExamsCount = exams.filter(e => e.priority === 'URGENT').length;

  const baseRadRev = (radExamsCount * 45);
  const baseUsgRev = (usgExamsCount * 60);
  const urgencyRevenue = urgExamsCount * 20;
  const radiographyRevenue = baseRadRev;
  const ultrasoundRevenue = baseUsgRev;
  const totalRevenue = radiographyRevenue + ultrasoundRevenue + urgencyRevenue;
  const averageTicket = totalExamsBilled > 0 ? Number((totalRevenue / totalExamsBilled).toFixed(2)) : 52.50;
  const totalActiveBalance = clinics.reduce((acc, c) => acc + (c.balance ?? 0), 0);

  // Evolução Mensal Histórica da Plataforma
  const monthlyRevenue = [
    { month: 'Abr', radiography: 2800, ultrasound: 3400, total: 6200 },
    { month: 'Mai', radiography: 3500, ultrasound: 4500, total: 8000 },
    { month: 'Jun', radiography: 4200, ultrasound: 5600, total: 9800 },
    { month: 'Jul', radiography: 4900, ultrasound: 6800, total: 11700 },
    { month: 'Ago', radiography: 5800, ultrasound: 8100, total: 13900 },
    { 
      month: 'Set', 
      radiography: Math.max(radiographyRevenue, 6400), 
      ultrasound: Math.max(ultrasoundRevenue, 9200), 
      total: Math.max(radiographyRevenue, 6400) + Math.max(ultrasoundRevenue, 9200) 
    }
  ];

  const planCounts: Record<ClinicPlan, number> = { AVULSO: 0, PRO: 0, HOSPITAL: 0 };
  clinics.forEach(c => {
    const p = c.plan || 'AVULSO';
    planCounts[p] = (planCounts[p] || 0) + 1;
  });

  const totalClinics = Math.max(1, clinics.length);
  const planDistribution = [
    {
      plan: 'PRO' as ClinicPlan,
      label: 'Clínica Parceira Pro',
      count: planCounts.PRO,
      percentage: Math.round((planCounts.PRO / totalClinics) * 100),
      color: '#06b6d4'
    },
    {
      plan: 'HOSPITAL' as ClinicPlan,
      label: 'Hospital 24h & Redes',
      count: planCounts.HOSPITAL,
      percentage: Math.round((planCounts.HOSPITAL / totalClinics) * 100),
      color: '#a855f7'
    },
    {
      plan: 'AVULSO' as ClinicPlan,
      label: 'Pré-Pago / Avulso',
      count: planCounts.AVULSO,
      percentage: Math.round((planCounts.AVULSO / totalClinics) * 100),
      color: '#10b981'
    }
  ];

  return {
    totalRevenue: Number(totalRevenue.toFixed(2)),
    totalExamsBilled,
    radiographyRevenue: Number(radiographyRevenue.toFixed(2)),
    ultrasoundRevenue: Number(ultrasoundRevenue.toFixed(2)),
    urgencyRevenue: Number(urgencyRevenue.toFixed(2)),
    averageTicket,
    totalActiveBalance: Number(totalActiveBalance.toFixed(2)),
    clinicsCount: clinics.length,
    clinicsSummary,
    monthlyRevenue,
    planDistribution
  };
}

// Report Templates Methods
export function getAllTemplates(filters?: {
  modality?: string;
  category?: string;
  search?: string;
}): ReportTemplate[] {
  const db = readDatabase();
  let list = db.templates || [...REPORT_TEMPLATES];

  if (filters?.modality && filters.modality !== 'ALL') {
    list = list.filter(t => t.modality === filters.modality);
  }

  if (filters?.category && filters.category !== 'ALL') {
    list = list.filter(t => t.category.toLowerCase() === filters.category!.toLowerCase());
  }

  if (filters?.search && filters.search.trim()) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      t =>
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.findings.toLowerCase().includes(q) ||
        t.conclusion.toLowerCase().includes(q)
    );
  }

  return list;
}

export function getTemplateById(id: string): ReportTemplate | undefined {
  const db = readDatabase();
  const list = db.templates || [...REPORT_TEMPLATES];
  return list.find(t => t.id === id);
}

export function createTemplate(data: Omit<ReportTemplate, 'id' | 'createdAt' | 'updatedAt'>): ReportTemplate {
  const db = readDatabase();
  if (!db.templates) db.templates = [...REPORT_TEMPLATES];

  const newTemplate: ReportTemplate = {
    ...data,
    id: `tpl-custom-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.templates.unshift(newTemplate);
  writeDatabase(db);
  return newTemplate;
}

export function updateTemplate(id: string, updates: Partial<ReportTemplate>): ReportTemplate | null {
  const db = readDatabase();
  if (!db.templates) db.templates = [...REPORT_TEMPLATES];

  const index = db.templates.findIndex(t => t.id === id);
  if (index === -1) return null;

  db.templates[index] = {
    ...db.templates[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  writeDatabase(db);
  return db.templates[index];
}

export function deleteTemplate(id: string): boolean {
  const db = readDatabase();
  if (!db.templates) return false;

  const initLen = db.templates.length;
  db.templates = db.templates.filter(t => t.id !== id);

  if (db.templates.length !== initLen) {
    writeDatabase(db);
    return true;
  }
  return false;
}

// ==========================================
// MÓDULO DE FRASES RÁPIDAS & MACROS MÉDICAS
// ==========================================

export const DEFAULT_QUICK_PHRASES: QuickPhrase[] = [
  {
    id: 'macro-torax-normal',
    shortcut: '/torax-normal',
    title: 'Tórax Normal (RX)',
    category: 'Tórax & Coração',
    content: '<p>Silhueta cardíaca com dimensões e conformação anatômica habituais. Campos pulmonares com radiopacidade e trama broncovascular preservadas. Traqueia torácica retilínea e cúpula diafragmática íntegra e de contornos regulares.</p>',
    createdAt: '2026-09-01T08:00:00.000Z'
  },
  {
    id: 'macro-cardio-vhs',
    shortcut: '/cardiomegalia',
    title: 'Cardiomegalia / VHS Elevado',
    category: 'Tórax & Coração',
    content: '<p>Aumento global da silhueta cardíaca com elevação dorsal da traqueia torácica e perda do espaço retroesternal. Vertebral Heart Score (VHS) aumentado para a conformação torácica da espécie.</p>',
    createdAt: '2026-09-01T08:05:00.000Z'
  },
  {
    id: 'macro-broncopneumonia',
    shortcut: '/broncopneumonia',
    title: 'Padrão Broncoalveolar / Infiltrado',
    category: 'Tórax & Coração',
    content: '<p>Opacificação em campos pulmonares com predomínio cranioventral, evidenciando padrão alveolar com broncogramas aéreos associado a reforço peribrônquico difuso, sugerindo processo inflamatório/infeccioso ativo.</p>',
    createdAt: '2026-09-01T08:10:00.000Z'
  },
  {
    id: 'macro-pneumotorax',
    shortcut: '/pneumotorax',
    title: 'Pneumotórax / Efusão Pleural',
    category: 'Tórax & Coração',
    content: '<p>Elevação dorsal da silhueta cardíaca em relação ao esterno com presença de ar livre no espaço pleural (pneumotórax), associado a colabamento parcial de lobos pulmonares caudais.</p>',
    createdAt: '2026-09-01T08:15:00.000Z'
  },
  {
    id: 'macro-abd-normal',
    shortcut: '/abdome-normal',
    title: 'Abdômen Normal (RX)',
    category: 'Abdômen & Órgãos',
    content: '<p>Órgãos abdominais com dimensões e posicionamento habituais. Distribuição gasosa fisiológica em alças intestinais, com contraste seroso e detalhamento peritoneal preservados. Ausência de corpos estranhos radiopacos ou massas obstrutivas.</p>',
    createdAt: '2026-09-01T08:20:00.000Z'
  },
  {
    id: 'macro-usg-normal',
    shortcut: '/usg-normal',
    title: 'Ultrassom Abdominal Normal',
    category: 'Abdômen & Órgãos',
    content: '<p>Fígado com dimensões preservadas, bordos afilados e ecotextura homogênea. Vesícula biliar repleta com conteúdo anecogênico e paredes finas. Baço, rins, trato gastrintestinal e vesícula urinária sem alterações ecográficas dignas de nota.</p>',
    createdAt: '2026-09-01T08:25:00.000Z'
  },
  {
    id: 'macro-cistite',
    shortcut: '/cistite',
    title: 'Sedimento Urinário / Cistite (USG)',
    category: 'Abdômen & Órgãos',
    content: '<p>Vesícula urinária moderadamente repleta, apresentando discreto espessamento parietal irregular difuso com ecogenicidade de mucosa alterada e moderada quantidade de sedimento ecogênico em suspensão (sedimento urinário/cistite).</p>',
    createdAt: '2026-09-01T08:30:00.000Z'
  },
  {
    id: 'macro-displasia',
    shortcut: '/displasia',
    title: 'Displasia Coxofemoral Avançada',
    category: 'Ortopedia & Coluna',
    content: '<p>Incongruência articular coxofemoral bilateral acentuada com arrasamento de cavidades acetabulares, subluxação e remodelamento das cabeças femorais associado a osteófitos marginais (doença articular degenerativa avançada / displasia).</p>',
    createdAt: '2026-09-01T08:35:00.000Z'
  },
  {
    id: 'macro-espondilose',
    shortcut: '/espondilose',
    title: 'Espondilose Deformante Ventrolateral',
    category: 'Ortopedia & Coluna',
    content: '<p>Presença de osteófitos ventromarginais formando pontes ósseas contíguas entre corpos vertebrais lombares (espondilose anquilosante deformante), sem sinais de lise óssea ativa ou desalinhamento do canal vertebral.</p>',
    createdAt: '2026-09-01T08:40:00.000Z'
  },
  {
    id: 'macro-sem-fratura',
    shortcut: '/sem-fratura',
    title: 'Sem Fraturas / Estruturas Íntegras',
    category: 'Ortopedia & Coluna',
    content: '<p>Estruturas ósseas e articulares avaliadas íntegras, sem evidência de soluções de continuidade (fraturas), fissuras, luxações ou reações periosteais atípicas.</p>',
    createdAt: '2026-09-01T08:45:00.000Z'
  }
];

export function getQuickPhrases(): QuickPhrase[] {
  const db = readDatabase();
  if (!db.quickPhrases || db.quickPhrases.length === 0) {
    db.quickPhrases = [...DEFAULT_QUICK_PHRASES];
    writeDatabase(db);
  }
  return db.quickPhrases;
}

export function getQuickPhraseById(id: string): QuickPhrase | null {
  const phrases = getQuickPhrases();
  return phrases.find(p => p.id === id) || null;
}

export function createQuickPhrase(data: Omit<QuickPhrase, 'id' | 'createdAt'>): QuickPhrase {
  const db = readDatabase();
  if (!db.quickPhrases) db.quickPhrases = [...DEFAULT_QUICK_PHRASES];

  let shortcut = data.shortcut.trim();
  if (!shortcut.startsWith('/')) {
    shortcut = `/${shortcut}`;
  }

  const newPhrase: QuickPhrase = {
    id: `macro-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    ...data,
    shortcut,
    createdAt: new Date().toISOString()
  };

  db.quickPhrases.push(newPhrase);
  writeDatabase(db);
  return newPhrase;
}

export function updateQuickPhrase(id: string, updates: Partial<QuickPhrase>): QuickPhrase | null {
  const db = readDatabase();
  if (!db.quickPhrases) db.quickPhrases = [...DEFAULT_QUICK_PHRASES];

  const index = db.quickPhrases.findIndex(p => p.id === id);
  if (index === -1) return null;

  if (updates.shortcut && !updates.shortcut.startsWith('/')) {
    updates.shortcut = `/${updates.shortcut.trim()}`;
  }

  db.quickPhrases[index] = {
    ...db.quickPhrases[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  writeDatabase(db);
  return db.quickPhrases[index];
}

export function deleteQuickPhrase(id: string): boolean {
  const db = readDatabase();
  if (!db.quickPhrases) return false;

  const initLen = db.quickPhrases.length;
  db.quickPhrases = db.quickPhrases.filter(p => p.id !== id);

  if (db.quickPhrases.length !== initLen) {
    writeDatabase(db);
    return true;
  }
  return false;
}

// ==========================================
// MÓDULO DE CASOTECA & ATLAS RADIOLÓGICO
// ==========================================

export const DEFAULT_TEACHING_CASES: TeachingCase[] = [
  {
    id: 'case-gdv-1',
    title: 'Torção Gástrica (GDV) com "Sinal do C-Invertido" / Dobra de Popeye',
    species: 'Canino',
    breed: 'Dogue Alemão',
    age: '6 anos',
    category: 'Abdômen & Órgãos',
    modality: 'RADIOGRAFIA',
    difficulty: 'Intermediário',
    summary: 'Dilatação vólvulo-gástrica aguda confirmada em projeção laterolateral direita.',
    clinicalHistory: 'Paciente deu entrada com distensão abdominal aguda, tentativas improdutivas de vômito, sialorreia e taquicardia após refeição copiosa e exercício.',
    findings: 'Estômago acentuadamente distendido por conteúdo gasoso e líquido. Em decúbito lateral direito, observa-se compartimentalização gasosa com o piloro deslocado dorsocranialmente à esquerda, separado do fundo gástrico por uma banda de tecido mole (Sinal do C-Invertido ou Braço do Popeye). Baço deslocado com esplenomegalia congestiva associada.',
    diagnosis: 'Dilatação Vólvulo-Gástrica (DVG/GDV) aguda com torção de 180° no sentido horário.',
    keyPoints: [
      'A projeção Laterolateral Direita é a técnica ouro obrigatória para diferenciar dilatação simples de torção gástrica.',
      'O compartimento pilórico preenchido por gás posicionado dorsocranialmente confirma a rotação anatômica.',
      'Emergência cirúrgica imediata com descompressão gástrica percutânea ou por sonda orogástrica.'
    ],
    differentialDiagnosis: ['Dilatação Gástrica Aguda sem Vólvulo', 'Obstrução Mecânica por Corpo Estranho Pilórico'],
    images: [
      {
        id: 'img-gdv-1',
        url: 'https://images.unsplash.com/photo-1516382799247-87df95d790b7?auto=format&fit=crop&q=80&w=1200',
        label: 'LL Direita: Compartimentalização e Sinal do C-Invertido'
      }
    ],
    createdBy: 'Dra. Camila Nogueira (CRMV-SP 38.192)',
    createdAt: '2026-08-15T14:30:00.000Z',
    viewsCount: 142
  },
  {
    id: 'case-ppdh-2',
    title: 'Hérnia Peritoneopericárdica Diafragmática (PPDH) Congênita',
    species: 'Felino',
    breed: 'Persa',
    age: '2 anos',
    category: 'Tórax & Coração',
    modality: 'RADIOGRAFIA',
    difficulty: 'Caso Raro',
    summary: 'Presença de alças intestinais e gordura intra-abdominal no interior da cavidade pericárdica.',
    clinicalHistory: 'Encaminhado para avaliação radiológica de rotina pré-castração eletiva. Paciente assintomático com sopro sistólico brando.',
    findings: 'Aumento severo da silhueta cardíaca com perda dos contornos regulares da cúpula diafragmática ventral. Identificam-se estruturas radiopacas heterogêneas e gás intraluminal tubular no interior do saco pericárdico, em contiguidade com o abdômen cranial. Alinhamento esternal e cúpula diafragmática dorsal preservados.',
    diagnosis: 'Hérnia Diafragmática Peritoneopericárdica (PPDH) congênita com encarceramento parcial de alça intestinal e omento.',
    keyPoints: [
      'Anomalia do desenvolvimento embrionário da porção ventral do diafragma e saco pericárdico.',
      'Comum em felinos, em especial Persas e Siberianos, frequentemente detectada incidentalmente.',
      'A ultrassonografia e radiografia contrastada com bário podem auxiliar na confirmação da presença de alças gástricas ou intestinais.'
    ],
    differentialDiagnosis: ['Cardiomegalia Severa / Cardiomiopatia Hipertrófica', 'Efusão Pericárdica Maciça', 'Hérnia Diafragmática Traumática'],
    images: [
      {
        id: 'img-ppdh-1',
        url: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&q=80&w=1200',
        label: 'Projeção Torácica Laterolateral: Gás intestinal em saco pericárdico'
      }
    ],
    createdBy: 'Dr. Roberto Mendonça (CRMV-SP 41.205)',
    createdAt: '2026-08-20T10:15:00.000Z',
    viewsCount: 98
  },
  {
    id: 'case-osa-3',
    title: 'Osteossarcoma Apendicular ("Longe do Cotovelo, Perto do Joelho")',
    species: 'Canino',
    breed: 'Rottweiler',
    age: '8 anos',
    category: 'Ortopedia & Coluna',
    modality: 'RADIOGRAFIA',
    difficulty: 'Básico / Ensino',
    summary: 'Lesão óssea agressiva clássica com padrão misto e Triângulo de Codman.',
    clinicalHistory: 'Claudicação de membro pélvico esquerdo progressiva há 3 semanas com aumento de volume doloroso em tíbia proximal.',
    findings: 'Reação periosteal agressiva mista (lítica e proliferativa) em metáfise proximal da tíbia esquerda. Presença de elevação periosteal triangular patognomônica (Triângulo de Codman) associada a padrão apolillado de lise cortical e áreas de reação periosteal em "raios de sol" (sunburst). A articulação femorotibiopatelar encontra-se preservada, sem invasão óssea articular contraposta.',
    diagnosis: 'Neoplasia óssea primária agressiva altamente sugestiva de Osteossarcoma Apendicular.',
    keyPoints: [
      'Neoplasias ósseas primárias (como osteossarcoma) clássicamente "não cruzam a linha articular".',
      'Distribuição típica em metáfises de ossos longos: longe do cotovelo (úmero proximal e rádio distal) e perto do joelho (fêmur distal e tíbia proximal).',
      'Obrigatória radiografia de tórax em 3 projeções (LL Direita, LL Esquerda e VD) para estadiamento de metástases pulmonares.'
    ],
    differentialDiagnosis: ['Osteomielite Fúngica ou Bacteriana', 'Fibrossarcoma Ósseo', 'Condrossarcoma'],
    images: [
      {
        id: 'img-osa-1',
        url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=1200',
        label: 'Tíbia Esquerda ML e AP: Padrão apolillado e Triângulo de Codman'
      }
    ],
    createdBy: 'Dra. Beatriz Albuquerque (CRMV-RJ 22.840)',
    createdAt: '2026-08-25T16:00:00.000Z',
    viewsCount: 215
  },
  {
    id: 'case-calculus-4',
    title: 'Calculose Uretral Obstrutiva no Arco Isquiático com Bexiga de Esforço',
    species: 'Canino',
    breed: 'Schnauzer Miniatura',
    age: '5 anos',
    category: 'Abdômen & Órgãos',
    modality: 'RADIOGRAFIA',
    difficulty: 'Intermediário',
    summary: 'Múltiplos urólitos radiopacos com impactação obstrutiva caudal.',
    clinicalHistory: 'Estrangúria, hematúria e anúria nas últimas 14 horas com distensão abdominal dolorosa.',
    findings: 'Vesícula urinária severamente repleta ocupando quase a totalidade da cavidade abdominal média e caudal. Notam-se numerosas estruturas com radiopacidade mineral no interior do lúmen vesical, além de duas concreções radiopacas alojadas no trajeto da uretra membranosa ao nível do arco isquiático, causando obstrução mecânica completa.',
    diagnosis: 'Urolitíase Vesical e Uretral Obstrutiva por cálculos radiopacos (suspeita de Oxalato de Cálcio ou Estruvita).',
    keyPoints: [
      'Ao radiografar suspeita de obstrução urinária em machos, a radiografia NUNCA deve cortar a flexura isquiática ou a base peniana.',
      'A projeção com membros pélvicos tracionados cranialmente ou projeção específica perineal evita a sobreposição dos fêmures sobre a uretra isquiática.'
    ],
    differentialDiagnosis: ['Estenose Uretral', 'Neoplasia Vesicouretral (Carcinoma de Células Transicionais)'],
    images: [
      {
        id: 'img-calc-1',
        url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=1200',
        label: 'Pelve e Uretra Caudal: Cálculos radiopacos retidos no arco isquiático'
      }
    ],
    createdBy: 'Dr. Roberto Mendonça (CRMV-SP 41.205)',
    createdAt: '2026-09-01T11:20:00.000Z',
    viewsCount: 167
  }
];

export function getTeachingCases(filters?: { category?: string; species?: string; search?: string }): TeachingCase[] {
  const db = readDatabase();
  if (!db.teachingCases || db.teachingCases.length === 0) {
    db.teachingCases = [...DEFAULT_TEACHING_CASES];
    writeDatabase(db);
  }

  let cases = db.teachingCases;

  if (filters?.category && filters.category !== 'ALL') {
    cases = cases.filter(c => c.category === filters.category);
  }

  if (filters?.species && filters.species !== 'ALL') {
    cases = cases.filter(c => c.species === filters.species);
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    cases = cases.filter(c => 
      c.title.toLowerCase().includes(q) ||
      c.summary.toLowerCase().includes(q) ||
      c.findings.toLowerCase().includes(q) ||
      c.diagnosis.toLowerCase().includes(q) ||
      c.breed.toLowerCase().includes(q)
    );
  }

  return cases;
}

export function getTeachingCaseById(id: string): TeachingCase | null {
  const db = readDatabase();
  if (!db.teachingCases) db.teachingCases = [...DEFAULT_TEACHING_CASES];
  const found = db.teachingCases.find(c => c.id === id);
  if (found) {
    found.viewsCount = (found.viewsCount || 0) + 1;
    writeDatabase(db);
    return found;
  }
  return null;
}

export function createTeachingCase(data: Omit<TeachingCase, 'id' | 'createdAt' | 'viewsCount'>): TeachingCase {
  const db = readDatabase();
  if (!db.teachingCases) db.teachingCases = [...DEFAULT_TEACHING_CASES];

  const newCase: TeachingCase = {
    id: `case-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    ...data,
    viewsCount: 0,
    createdAt: new Date().toISOString()
  };

  db.teachingCases.unshift(newCase);
  writeDatabase(db);
  return newCase;
}

export function updateTeachingCase(id: string, updates: Partial<TeachingCase>): TeachingCase | null {
  const db = readDatabase();
  if (!db.teachingCases) db.teachingCases = [...DEFAULT_TEACHING_CASES];

  const index = db.teachingCases.findIndex(c => c.id === id);
  if (index === -1) return null;

  db.teachingCases[index] = {
    ...db.teachingCases[index],
    ...updates
  };

  writeDatabase(db);
  return db.teachingCases[index];
}

export function deleteTeachingCase(id: string): boolean {
  const db = readDatabase();
  if (!db.teachingCases) return false;

  const initLen = db.teachingCases.length;
  db.teachingCases = db.teachingCases.filter(c => c.id !== id);

  if (db.teachingCases.length !== initLen) {
    writeDatabase(db);
    return true;
  }
  return false;
}

// ==========================================
// MÓDULO DE NOTIFICAÇÕES EM TEMPO REAL
// ==========================================

export const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'NEW_URGENT_EXAM',
    title: '⚠️ Exame de Urgência Recebido (SLA: 2h)',
    message: 'Thor (Boxer / Canino) submetido pela Clínica VetLife 24h para Radiografia de Tórax.',
    targetRole: 'RADIOLOGIST',
    link: '/dashboard',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString()
  },
  {
    id: 'notif-2',
    type: 'REPORT_READY',
    title: '✅ Laudo Assinado & Liberado',
    message: 'O laudo do exame VET-2026-109 (Luna / Felino) foi concluído e assinado digitalmente.',
    targetRole: 'CLINIC',
    link: '/laudo/VET-2026-109',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString()
  },
  {
    id: 'notif-3',
    type: 'PAYMENT_CREDITED',
    title: '💳 Recarga Pix Confirmada',
    message: 'Crédito de R$ 300,00 aprovado instantaneamente via PIX e adicionado ao seu saldo.',
    targetRole: 'CLINIC',
    link: '/dashboard',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString()
  },
  {
    id: 'notif-4',
    type: 'SLA_WARNING',
    title: '⏱️ Atenção ao SLA de Urgência',
    message: 'Exame VET-2026-108 possui menos de 45 minutos para conclusão da análise.',
    targetRole: 'RADIOLOGIST',
    link: '/dashboard',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString()
  }
];

export function getNotifications(userRole?: string, userId?: string): AppNotification[] {
  const db = readDatabase();
  if (!db.notifications || db.notifications.length === 0) {
    db.notifications = [...DEFAULT_NOTIFICATIONS];
    writeDatabase(db);
  }

  return db.notifications.filter(n => {
    if (!userRole) return true;
    if (userRole === 'ADMIN') return true;
    if (n.targetRole === 'ALL') return true;
    if (n.targetRole === userRole) return true;
    if (userId && n.userId === userId) return true;
    return false;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createNotification(data: Omit<AppNotification, 'id' | 'createdAt' | 'read'>): AppNotification {
  const db = readDatabase();
  if (!db.notifications) db.notifications = [...DEFAULT_NOTIFICATIONS];

  const newNotif: AppNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    ...data,
    read: false,
    createdAt: new Date().toISOString()
  };

  db.notifications.unshift(newNotif);
  writeDatabase(db);
  return newNotif;
}

export function markNotificationAsRead(id: string): boolean {
  const db = readDatabase();
  if (!db.notifications) return false;

  const notif = db.notifications.find(n => n.id === id);
  if (notif) {
    notif.read = true;
    writeDatabase(db);
    return true;
  }
  return false;
}

export function markAllNotificationsAsRead(userRole?: string): boolean {
  const db = readDatabase();
  if (!db.notifications) return false;

  db.notifications.forEach(n => {
    if (!userRole || userRole === 'ADMIN' || n.targetRole === 'ALL' || n.targetRole === userRole) {
      n.read = true;
    }
  });

  writeDatabase(db);
  return true;
}

export function deleteNotification(id: string): boolean {
  const db = readDatabase();
  if (!db.notifications) return false;

  const initLen = db.notifications.length;
  db.notifications = db.notifications.filter(n => n.id !== id);

  if (db.notifications.length !== initLen) {
    writeDatabase(db);
    return true;
  }
  return false;
}

