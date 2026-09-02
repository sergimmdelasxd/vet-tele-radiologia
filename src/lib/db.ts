import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { User, Exam, DashboardStats, Report, ExamModality } from '@/types';

const DB_PATH = path.join(process.cwd(), 'src', 'data', 'db.json');

interface DatabaseSchema {
  users: User[];
  exams: Exam[];
}

function ensureDataDirectory() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
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

  const db: DatabaseSchema = { users, exams };
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
    const parsed = JSON.parse(raw);
    // Se não tiver a propriedade modality nos exames, atualiza
    if (!parsed.exams || parsed.exams.length === 0 || !parsed.exams[0].modality) {
      return seedDatabase();
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

  const newExam: Exam = {
    id: examId,
    clinicId: examData.clinicId || 'unknown',
    clinicName: examData.clinicName || 'Clínica Conveniada',
    requestingVet: examData.requestingVet || 'Médico Veterinário',
    clinicPhone: examData.clinicPhone || '',
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
