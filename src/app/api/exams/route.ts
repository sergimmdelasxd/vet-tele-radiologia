import { NextResponse } from 'next/server';
import { getCurrentUserFromCookie } from '@/lib/auth';
import { getAllExams, createExam, findUserById, findUserByEmail, createUser, debitExamCost } from '@/lib/db';
import { recordAuditTrail } from '@/lib/audit';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUserFromCookie();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const priority = searchParams.get('priority') || undefined;
    const modality = searchParams.get('modality') || undefined;

    // Se for clínica, filtra apenas os exames dela
    const clinicFilter = user.role === 'CLINIC' ? user.userId : undefined;

    const exams = await getAllExams({
      clinicId: clinicFilter,
      status,
      priority,
      modality
    });

    return NextResponse.json({ exams });
  } catch (error) {
    console.error('Fetch exams error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar exames' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUserFromCookie();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      modality,
      patientName,
      species,
      breed,
      age,
      weight,
      gender,
      isCastrated,
      ownerName,
      ownerPhone,
      region,
      projections,
      clinicalHistory,
      suspectedDiagnosis,
      priority,
      requestingVet,
      clinicPhone,
      clinicLogo,
      fastingHours,
      trichotomyDone,
      ultrasoundType,
      images,
      clinicId,
      clinicName,
      newClinicData
    } = body;

    if (!patientName || !species || !region || !clinicalHistory) {
      return NextResponse.json(
        { error: 'Nome do paciente, espécie, região ou tipo de exame e histórico clínico são obrigatórios' },
        { status: 400 }
      );
    }

    let finalClinicId = user.userId;
    let finalClinicName = user.clinicName || user.name;
    let finalClinicPhone = clinicPhone || '';
    const userFromDb = await findUserById(user.userId);
    let finalClinicLogo = clinicLogo || user.clinicLogo || userFromDb?.clinicLogo || '';
    let finalRequestingVet = requestingVet || user.name;

    // Se for radiologista ou admin criando exame em nome de uma clínica
    if (user.role === 'RADIOLOGIST' || user.role === 'ADMIN') {
      if (newClinicData && newClinicData.clinicName) {
        const cleanClinic = newClinicData.clinicName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'clinica';
        const generatedEmail = newClinicData.email?.trim() || `contato@${cleanClinic}-${Date.now().toString().slice(-4)}.com.br`;
        
        let existingClinic = await findUserByEmail(generatedEmail);
        if (!existingClinic) {
          existingClinic = await createUser({
            name: newClinicData.responsibleVet || newClinicData.clinicName,
            clinicName: newClinicData.clinicName,
            email: generatedEmail,
            password: bcrypt.hashSync('123456', 10),
            role: 'CLINIC',
            phone: newClinicData.phone || '',
            clinicLogo: newClinicData.clinicLogo || clinicLogo || '',
            uf: newClinicData.uf || 'SP',
            crmv: newClinicData.crmv || '',
            cnpj: newClinicData.cnpj || ''
          });
        }
        finalClinicId = existingClinic.id;
        finalClinicName = existingClinic.clinicName || newClinicData.clinicName;
        finalClinicPhone = existingClinic.phone || newClinicData.phone || '';
        if (!finalClinicLogo && existingClinic.clinicLogo) {
          finalClinicLogo = existingClinic.clinicLogo;
        }
        finalRequestingVet = newClinicData.responsibleVet || requestingVet || 'Médico Veterinário';
      } else if (clinicId && clinicId !== 'new') {
        const existingClinic = await findUserById(clinicId);
        if (existingClinic) {
          finalClinicId = existingClinic.id;
          finalClinicName = existingClinic.clinicName || existingClinic.name;
          finalClinicPhone = existingClinic.phone || clinicPhone || '';
          if (!finalClinicLogo && existingClinic.clinicLogo) {
            finalClinicLogo = existingClinic.clinicLogo;
          }
          finalRequestingVet = requestingVet || existingClinic.name;
        } else if (clinicName) {
          finalClinicId = clinicId;
          finalClinicName = clinicName;
          finalClinicPhone = clinicPhone || '';
          finalRequestingVet = requestingVet || 'Médico Veterinário';
        }
      } else if (clinicName) {
        finalClinicName = clinicName;
        finalClinicPhone = clinicPhone || '';
        finalRequestingVet = requestingVet || 'Médico Veterinário';
      }
    }

    const newExam = await createExam({
      clinicId: finalClinicId,
      clinicName: finalClinicName,
      requestingVet: finalRequestingVet,
      clinicPhone: finalClinicPhone,
      clinicLogo: finalClinicLogo,
      modality: modality === 'ULTRASSOM' ? 'ULTRASSOM' : 'RADIOGRAFIA',
      patientName,
      species,
      breed: breed || 'SRD',
      age: age || 'Não informada',
      weight: weight || '',
      gender: gender || 'Macho',
      isCastrated: Boolean(isCastrated),
      ownerName: ownerName || 'Tutor não informado',
      ownerPhone: ownerPhone || undefined,
      region,
      projections: Array.isArray(projections) && projections.length > 0 ? projections : ['Geral'],
      clinicalHistory,
      suspectedDiagnosis: suspectedDiagnosis || '',
      priority: priority === 'URGENT' ? 'URGENT' : 'NORMAL',
      fastingHours: fastingHours || undefined,
      trichotomyDone: Boolean(trichotomyDone),
      ultrasoundType: ultrasoundType || undefined,
      images: Array.isArray(images) ? images : []
    });

    // Registra débito automático do custo do laudo na conta da clínica
    try {
      debitExamCost(finalClinicId, newExam.id, newExam.modality, newExam.priority);
    } catch (debitErr) {
      console.warn('Erro não bloqueante ao registrar débito:', debitErr);
    }

    // Registro de Auditoria LGPD
    recordAuditTrail({
      user: { id: user.userId, name: user.name, role: user.role, email: user.email },
      action: 'CREATE_EXAM',
      resourceType: 'EXAM',
      resourceId: newExam.id,
      details: `Exame ${newExam.modality} (${newExam.region}) cadastrado para paciente ${newExam.patientName} (${newExam.species}) pela clínica ${newExam.clinicName}.`,
      req: request
    });

    return NextResponse.json({ success: true, exam: newExam }, { status: 201 });
  } catch (error) {
    console.error('Create exam error:', error);
    return NextResponse.json(
      { error: 'Erro ao cadastrar novo exame' },
      { status: 500 }
    );
  }
}
