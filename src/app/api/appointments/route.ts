import { NextResponse } from 'next/server';
import { getCurrentUserFromCookie } from '@/lib/auth';
import { getAllAppointments, createAppointment } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUserFromCookie();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || undefined;
    const specialistId = searchParams.get('specialistId') || undefined;
    const clinicId = searchParams.get('clinicId') || undefined;
    const status = searchParams.get('status') || undefined;
    const modality = searchParams.get('modality') || undefined;

    // Se for clínica, pode visualizar apenas os agendamentos dela
    const finalClinicId = user.role === 'CLINIC' ? user.userId : clinicId;

    const appointments = getAllAppointments({
      date,
      specialistId,
      clinicId: finalClinicId,
      status,
      modality
    });

    return NextResponse.json({ appointments });
  } catch (error: any) {
    console.error('Fetch appointments error:', error);
    return NextResponse.json(
      { error: 'Erro ao listar agendamentos', details: error.message },
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
      date,
      time,
      durationMinutes,
      clinicId,
      clinicName,
      requestingVet,
      specialistId,
      specialistName,
      patientName,
      species,
      breed,
      age,
      weight,
      ownerName,
      ownerPhone,
      modality,
      region,
      preparationInstructions,
      notes,
      status
    } = body;

    if (!date || !time || !patientName || !species || !region) {
      return NextResponse.json(
        { error: 'Data, horário, nome do paciente, espécie e exame/região são obrigatórios.' },
        { status: 400 }
      );
    }

    const newAppointment = createAppointment({
      date,
      time,
      durationMinutes: durationMinutes || 30,
      clinicId: clinicId || (user.role === 'CLINIC' ? user.userId : 'user-clinic-vetlife'),
      clinicName: clinicName || (user.role === 'CLINIC' ? (user.clinicName || user.name) : 'Clínica Parceira'),
      requestingVet: requestingVet || user.name,
      specialistId: specialistId || (user.role === 'RADIOLOGIST' ? user.userId : undefined),
      specialistName: specialistName || (user.role === 'RADIOLOGIST' ? user.name : undefined),
      patientName,
      species,
      breed: breed || 'SRD',
      age: age || '',
      weight: weight || '',
      ownerName: ownerName || 'Tutor Responsável',
      ownerPhone: ownerPhone || '',
      modality: modality || 'RADIOGRAFIA',
      region,
      preparationInstructions: preparationInstructions || '',
      notes: notes || '',
      status: status || 'SCHEDULED'
    });

    return NextResponse.json({ success: true, appointment: newAppointment }, { status: 201 });
  } catch (error: any) {
    console.error('Create appointment error:', error);
    return NextResponse.json(
      { error: 'Erro ao cadastrar agendamento', details: error.message },
      { status: 500 }
    );
  }
}
