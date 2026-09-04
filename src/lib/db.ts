import { supabase } from './supabase';
import { User, Exam, DashboardStats, Report, ExamImage } from '@/types';

// ==========================================
// MAPPERS (Snake_case Supabase <-> CamelCase)
// ==========================================

function mapUserFromDB(row: any): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    role: row.role,
    clinicName: row.clinic_name || undefined,
    crmv: row.crmv || undefined,
    cnpj: row.cnpj || undefined,
    phone: row.phone || undefined,
    uf: row.uf || undefined,
    avatar: row.avatar || undefined,
    createdAt: row.created_at
  };
}

function mapImageFromDB(row: any): ExamImage {
  return {
    id: row.id,
    url: row.url,
    label: row.label || '',
    projection: row.projection || undefined,
    thumbnailUrl: row.thumbnail_url || undefined,
    uploadedAt: row.uploaded_at
  };
}

function mapReportFromDB(row: any): Report {
  return {
    id: row.id,
    examId: row.exam_id,
    radiologistId: row.radiologist_id,
    radiologistName: row.radiologist_name,
    radiologistCrmv: row.radiologist_crmv,
    technique: row.technique || '',
    findings: row.findings || '',
    conclusion: row.conclusion || '',
    recommendations: row.recommendations || '',
    vhsScore: row.vhs_score || undefined,
    norbergAngle: row.norberg_angle || undefined,
    ultrasoundOrgans: row.ultrasound_organs || [],
    keyImageIds: row.key_image_ids || [],
    reportedAt: row.reported_at,
    digitalSignatureHash: row.digital_signature_hash
  };
}

function mapExamFromDB(row: any): Exam {
  const images = Array.isArray(row.exam_images) 
    ? row.exam_images.map(mapImageFromDB)
    : [];

  let report: Report | undefined = undefined;
  if (row.reports) {
    if (Array.isArray(row.reports) && row.reports.length > 0) {
      report = mapReportFromDB(row.reports[0]);
    } else if (typeof row.reports === 'object' && row.reports.id) {
      report = mapReportFromDB(row.reports);
    }
  }

  return {
    id: row.id,
    clinicId: row.clinic_id,
    clinicName: row.clinic_name,
    requestingVet: row.requesting_vet,
    clinicPhone: row.clinic_phone || undefined,
    modality: row.modality,
    patientName: row.patient_name,
    species: row.species,
    breed: row.breed || 'SRD',
    age: row.age || 'Não informada',
    weight: row.weight || '',
    gender: row.gender || 'Macho',
    isCastrated: Boolean(row.is_castrated),
    ownerName: row.owner_name || 'Tutor não informado',
    region: row.region,
    projections: row.projections || [],
    clinicalHistory: row.clinical_history || '',
    suspectedDiagnosis: row.suspected_diagnosis || '',
    priority: row.priority || 'NORMAL',
    status: row.status || 'PENDING',
    fastingHours: row.fasting_hours || undefined,
    trichotomyDone: row.trichotomy_done !== null ? row.trichotomy_done : undefined,
    ultrasoundType: row.ultrasound_type || undefined,
    images,
    report,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deadline: row.deadline
  };
}

// ==========================================
// USER METHODS
// ==========================================

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .ilike('email', email.trim())
    .maybeSingle();

  if (error || !data) return undefined;
  return mapUserFromDB(data);
}

export async function findUserById(id: string): Promise<User | undefined> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return undefined;
  return mapUserFromDB(data);
}

export async function getAllUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map(mapUserFromDB).map(({ password: _, ...u }) => u as User);
}

export async function createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
  const id = `user-${Date.now()}`;
  const now = new Date().toISOString();

  const dbPayload = {
    id,
    name: userData.name,
    email: userData.email.toLowerCase(),
    password: userData.password,
    role: userData.role,
    clinic_name: userData.clinicName || null,
    crmv: userData.crmv || null,
    cnpj: userData.cnpj || null,
    phone: userData.phone || null,
    uf: userData.uf || 'SP',
    avatar: userData.avatar || null,
    created_at: now
  };

  const { data, error } = await supabase
    .from('users')
    .insert(dbPayload)
    .select()
    .single();

  if (error) {
    console.error('Error creating user in Supabase:', error);
    throw new Error(error.message);
  }

  const created = mapUserFromDB(data);
  const { password: _, ...userWithoutPassword } = created;
  return userWithoutPassword as User;
}

// ==========================================
// EXAM METHODS
// ==========================================

export async function getAllExams(filters?: {
  clinicId?: string;
  status?: string;
  priority?: string;
  modality?: string;
}): Promise<Exam[]> {
  let query = supabase
    .from('exams')
    .select('*, exam_images(*), reports(*)');

  if (filters?.clinicId) {
    query = query.eq('clinic_id', filters.clinicId);
  }

  if (filters?.status && filters.status !== 'ALL') {
    query = query.eq('status', filters.status);
  }

  if (filters?.priority && filters.priority !== 'ALL') {
    query = query.eq('priority', filters.priority);
  }

  if (filters?.modality && filters.modality !== 'ALL') {
    query = query.eq('modality', filters.modality);
  }

  const { data, error } = await query;
  if (error || !data) {
    console.error('Error fetching exams from Supabase:', error);
    return [];
  }

  const exams = data.map(mapExamFromDB);

  // Ordena prioridade URGENT primeiro, depois mais recentes
  return exams.sort((a, b) => {
    if (a.priority === 'URGENT' && b.priority !== 'URGENT') return -1;
    if (b.priority === 'URGENT' && a.priority !== 'URGENT') return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export async function getExamById(id: string): Promise<Exam | undefined> {
  const { data, error } = await supabase
    .from('exams')
    .select('*, exam_images(*), reports(*)')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return undefined;
  return mapExamFromDB(data);
}

export async function createExam(examData: Partial<Exam>): Promise<Exam> {
  // Contar quantidade de exames para gerar ID
  const { count } = await supabase.from('exams').select('*', { count: 'exact', head: true });
  const nextNum = (count || 0) + 101;
  const examId = `VET-2026-${nextNum}`;

  const now = new Date();
  const isUrgent = examData.priority === 'URGENT';
  const deadlineDate = new Date(now.getTime() + (isUrgent ? 2 * 3600 * 1000 : 12 * 3600 * 1000));

  const dbExam = {
    id: examId,
    clinic_id: examData.clinicId || 'unknown',
    clinic_name: examData.clinicName || 'Clínica Conveniada',
    requesting_vet: examData.requestingVet || 'Médico Veterinário',
    clinic_phone: examData.clinicPhone || null,
    modality: examData.modality || 'RADIOGRAFIA',
    patient_name: examData.patientName || 'Paciente',
    species: examData.species || 'Canino',
    breed: examData.breed || 'SRD',
    age: examData.age || 'Não informada',
    weight: examData.weight || '',
    gender: examData.gender || 'Macho',
    is_castrated: examData.isCastrated ?? false,
    owner_name: examData.ownerName || 'Tutor Responsável',
    region: examData.region || (examData.modality === 'ULTRASSOM' ? 'Ultrassonografia Abdominal Total' : 'Radiografia Geral'),
    projections: examData.projections || ['Ortogonal'],
    clinical_history: examData.clinicalHistory || '',
    suspected_diagnosis: examData.suspectedDiagnosis || null,
    priority: examData.priority || 'NORMAL',
    status: 'PENDING',
    fasting_hours: examData.fastingHours || null,
    trichotomy_done: examData.trichotomyDone ?? null,
    ultrasound_type: examData.ultrasoundType || null,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    deadline: deadlineDate.toISOString()
  };

  const { error: insertErr } = await supabase.from('exams').insert(dbExam);
  if (insertErr) {
    console.error('Error inserting exam in Supabase:', insertErr);
    throw new Error(insertErr.message);
  }

  // Inserir imagens anexadas, se houver
  const imagesToInsert = examData.images || [];
  if (imagesToInsert.length > 0) {
    const dbImages = imagesToInsert.map(img => ({
      id: img.id || `img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      exam_id: examId,
      url: img.url,
      label: img.label || null,
      projection: img.projection || null,
      thumbnail_url: img.thumbnailUrl || null,
      uploaded_at: img.uploadedAt || now.toISOString()
    }));

    await supabase.from('exam_images').insert(dbImages);
  }

  const createdExam = await getExamById(examId);
  if (!createdExam) throw new Error('Falha ao recuperar exame criado');
  return createdExam;
}

export async function updateExam(id: string, updates: Partial<Exam>): Promise<Exam | null> {
  const dbUpdates: any = {
    updated_at: new Date().toISOString()
  };

  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
  if (updates.patientName !== undefined) dbUpdates.patient_name = updates.patientName;
  if (updates.species !== undefined) dbUpdates.species = updates.species;
  if (updates.breed !== undefined) dbUpdates.breed = updates.breed;
  if (updates.age !== undefined) dbUpdates.age = updates.age;
  if (updates.weight !== undefined) dbUpdates.weight = updates.weight;
  if (updates.gender !== undefined) dbUpdates.gender = updates.gender;
  if (updates.isCastrated !== undefined) dbUpdates.is_castrated = updates.isCastrated;
  if (updates.clinicalHistory !== undefined) dbUpdates.clinical_history = updates.clinicalHistory;
  if (updates.suspectedDiagnosis !== undefined) dbUpdates.suspected_diagnosis = updates.suspectedDiagnosis;
  if (updates.region !== undefined) dbUpdates.region = updates.region;
  if (updates.projections !== undefined) dbUpdates.projections = updates.projections;

  const { error } = await supabase
    .from('exams')
    .update(dbUpdates)
    .eq('id', id);

  if (error) {
    console.error('Error updating exam in Supabase:', error);
    return null;
  }

  return (await getExamById(id)) || null;
}

export async function saveReport(
  examId: string, 
  reportData: Omit<Report, 'id' | 'digitalSignatureHash' | 'reportedAt'>
): Promise<Exam | null> {
  const now = new Date().toISOString();
  const hash = `VET-SIGN-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  const reportId = `rep-${Date.now()}`;

  const dbReport = {
    id: reportId,
    exam_id: examId,
    radiologist_id: reportData.radiologistId || null,
    radiologist_name: reportData.radiologistName,
    radiologist_crmv: reportData.radiologistCrmv,
    technique: reportData.technique || null,
    findings: reportData.findings,
    conclusion: reportData.conclusion,
    recommendations: reportData.recommendations || null,
    vhs_score: reportData.vhsScore || null,
    norberg_angle: reportData.norbergAngle || null,
    ultrasound_organs: reportData.ultrasoundOrgans || [],
    key_image_ids: reportData.keyImageIds || [],
    reported_at: now,
    digital_signature_hash: hash
  };

  const { error: repErr } = await supabase
    .from('reports')
    .upsert(dbReport);

  if (repErr) {
    console.error('Error saving report in Supabase:', repErr);
    return null;
  }

  // Atualiza status do exame para REPORTED
  await supabase
    .from('exams')
    .update({ status: 'REPORTED', updated_at: now })
    .eq('id', examId);

  return (await getExamById(examId)) || null;
}

export async function getStats(): Promise<DashboardStats> {
  const { data: exams, error: exErr } = await supabase.from('exams').select('status, priority, modality');
  const { data: users, error: usErr } = await supabase.from('users').select('id, role');

  if (exErr || !exams || usErr || !users) {
    return {
      totalExams: 0,
      pendingExams: 0,
      inProgressExams: 0,
      completedExams: 0,
      urgentExams: 0,
      radiographyCount: 0,
      ultrasoundCount: 0,
      averageTurnaroundMinutes: 48,
      clinicsCount: 0,
      radiologistsCount: 0
    };
  }

  const totalExams = exams.length;
  const pendingExams = exams.filter(e => e.status === 'PENDING').length;
  const inProgressExams = exams.filter(e => e.status === 'IN_PROGRESS').length;
  const completedExams = exams.filter(e => e.status === 'REPORTED').length;
  const urgentExams = exams.filter(e => e.priority === 'URGENT' && e.status !== 'REPORTED').length;
  const radiographyCount = exams.filter(e => e.modality === 'RADIOGRAFIA').length;
  const ultrasoundCount = exams.filter(e => e.modality === 'ULTRASSOM').length;

  const clinics = new Set(users.filter(u => u.role === 'CLINIC').map(u => u.id));
  const radiologists = new Set(users.filter(u => u.role === 'RADIOLOGIST').map(u => u.id));

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
