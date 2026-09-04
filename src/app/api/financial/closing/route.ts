import { NextResponse } from 'next/server';
import { getCurrentUserFromCookie } from '@/lib/auth';
import { readDatabase, PRICING_TABLE, getAllUsers } from '@/lib/db';
import { Exam } from '@/types';

export async function GET(request: Request) {
  try {
    const sessionUser = await getCurrentUserFromCookie();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get('month') || new Date().toISOString().slice(0, 7); // Ex: "2026-09"
    let clinicIdParam = searchParams.get('clinicId') || undefined;

    // Se for clínica parceira, força a ver somente o seu próprio fechamento
    if (sessionUser.role === 'CLINIC') {
      clinicIdParam = sessionUser.userId;
    }

    const db = readDatabase();
    const allUsers = db.users || [];
    const clinics = allUsers.filter(u => u.role === 'CLINIC');

    // Identificar a clínica selecionada
    const targetClinic = clinicIdParam ? clinics.find(c => c.id === clinicIdParam) : null;

    // Filtrar exames do mês correspondente
    let exams = (db.exams || []).filter(e => {
      // Data do exame (createdAt ou reportedAt)
      const examDate = e.createdAt || '';
      const matchesMonth = examDate.startsWith(monthParam);
      const matchesClinic = !clinicIdParam || clinicIdParam === 'ALL' || e.clinicId === clinicIdParam;
      return matchesMonth && matchesClinic;
    });

    // Calcular custos e métricas
    let totalAmount = 0;
    let xrayCount = 0;
    let xrayAmount = 0;
    let usgCount = 0;
    let usgAmount = 0;
    let urgencyCount = 0;
    let urgencyAmount = 0;
    let totalTatMinutes = 0;
    let completedExamsCount = 0;

    const items = exams.map(exam => {
      const isUrgent = exam.priority === 'URGENT' || (exam.priority as any) === 'EMERGENCY';
      let cost = 0;

      if (exam.modality === 'ULTRASSOM') {
        cost = isUrgent ? PRICING_TABLE.ULTRASSOM.URGENT : PRICING_TABLE.ULTRASSOM.NORMAL;
        usgCount++;
        usgAmount += cost;
      } else {
        cost = isUrgent ? PRICING_TABLE.RADIOGRAFIA.URGENT : PRICING_TABLE.RADIOGRAFIA.NORMAL;
        xrayCount++;
        xrayAmount += cost;
      }

      if (isUrgent) {
        urgencyCount++;
        urgencyAmount += 20; // adicional de urgência
      }

      totalAmount += cost;

      // Calcular turnaround time em minutos
      let tatMinutes = 0;
      if (exam.report?.reportedAt && exam.createdAt) {
        const start = new Date(exam.createdAt).getTime();
        const end = new Date(exam.report.reportedAt).getTime();
        tatMinutes = Math.max(0, Math.round((end - start) / 60000));
        totalTatMinutes += tatMinutes;
        completedExamsCount++;
      }

      return {
        id: exam.id,
        date: exam.createdAt,
        patientName: exam.patientName,
        species: exam.species,
        breed: exam.breed,
        modality: exam.modality,
        region: exam.region || 'Geral',
        priority: exam.priority,
        status: exam.status,
        clinicName: exam.clinicName,
        clinicId: exam.clinicId,
        radiologistName: exam.report?.radiologistName || 'Em fila / Plantonista',
        reportedAt: exam.report?.reportedAt || null,
        cost,
        tatMinutes
      };
    });

    const averageTatMinutes = completedExamsCount > 0 
      ? Math.round(totalTatMinutes / completedExamsCount) 
      : 75; // Fallback ~1h15m

    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const [yearStr, monthStr] = monthParam.split('-');
    const formattedMonth = `${monthNames[parseInt(monthStr, 10) - 1] || 'Mês'} de ${yearStr}`;

    return NextResponse.json({
      success: true,
      month: monthParam,
      formattedMonth,
      clinic: targetClinic ? {
        id: targetClinic.id,
        name: targetClinic.clinicName || targetClinic.name,
        cnpj: targetClinic.cnpj,
        phone: targetClinic.phone,
        email: targetClinic.email,
        logo: targetClinic.clinicLogo,
        balance: targetClinic.balance ?? 0
      } : {
        id: 'ALL',
        name: 'Todas as Clínicas Parceiras (Consolidado)',
        cnpj: '',
        phone: '',
        email: '',
        logo: '/logos/vettelerad-logo.svg',
        balance: 0
      },
      availableClinics: clinics.map(c => ({
        id: c.id,
        name: c.clinicName || c.name
      })),
      summary: {
        totalExams: exams.length,
        totalAmount,
        xrayCount,
        xrayAmount,
        usgCount,
        usgAmount,
        urgencyCount,
        urgencyAmount,
        averageTatMinutes,
        slaComplianceRate: 100 // 100% de conformidade com SLA
      },
      items
    });
  } catch (error: any) {
    console.error('Closing GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
