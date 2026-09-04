import { NextResponse } from 'next/server';
import { getCurrentUserFromCookie } from '@/lib/auth';
import { saveReport, getExamById } from '@/lib/db';
import { recordAuditTrail } from '@/lib/audit';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUserFromCookie();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (user.role !== 'RADIOLOGIST' && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Apenas médicos veterinários radiologistas podem emitir laudos' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const exam = await getExamById(id);
    if (!exam) {
      return NextResponse.json({ error: 'Exame não encontrado' }, { status: 404 });
    }

    const body = await request.json();
    const {
      technique,
      findings,
      conclusion,
      recommendations,
      vhsScore,
      norbergAngle,
      keyImageIds
    } = body;

    const reportContent = findings || conclusion;
    if (!reportContent || !reportContent.trim()) {
      return NextResponse.json(
        { error: 'O conteúdo do laudo com achados e impressão diagnóstica é obrigatório' },
        { status: 400 }
      );
    }

    const updatedExam = await saveReport(id, {
      examId: id,
      radiologistId: user.userId,
      radiologistName: user.name,
      radiologistCrmv: user.crmv || 'CRMV Veterinário',
      technique: technique || 'Estudo radiográfico padrão em projeções ortogonais.',
      findings: findings || reportContent,
      conclusion: conclusion || findings || reportContent,
      recommendations: recommendations || 'Correlação com a evolução clínica e novos exames complementares a critério médico veterinário.',
      vhsScore: vhsScore || undefined,
      norbergAngle: norbergAngle || undefined,
      keyImageIds: Array.isArray(keyImageIds) ? keyImageIds : []
    });

    // Trilha de Auditoria LGPD
    recordAuditTrail({
      user: { id: user.userId, name: user.name, role: user.role, email: user.email },
      action: 'CREATE_REPORT',
      resourceType: 'REPORT',
      resourceId: updatedExam?.report?.id || id,
      details: `Emissão e assinatura digital do laudo do exame ${id} (${exam.patientName} / ${exam.species}) por ${user.name} (${user.crmv || 'CRMV'}).`,
      req: request
    });

    return NextResponse.json({
      success: true,
      exam: updatedExam,
      message: 'Laudo veterinário emitido e assinado com sucesso'
    });
  } catch (error) {
    console.error('Report submission error:', error);
    return NextResponse.json(
      { error: 'Erro ao emitir laudo veterinário' },
      { status: 500 }
    );
  }
}
