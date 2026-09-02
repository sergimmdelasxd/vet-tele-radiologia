import { NextResponse } from 'next/server';
import { getCurrentUserFromCookie } from '@/lib/auth';
import { saveReport, getExamById } from '@/lib/db';

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
    const exam = getExamById(id);
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

    if (!findings || !conclusion) {
      return NextResponse.json(
        { error: 'Os campos de Descrição dos Achados e Conclusão Diagnóstica são obrigatórios' },
        { status: 400 }
      );
    }

    const updatedExam = saveReport(id, {
      examId: id,
      radiologistId: user.userId,
      radiologistName: user.name,
      radiologistCrmv: user.crmv || 'CRMV Veterinário',
      technique: technique || 'Estudo radiográfico padrão em projeções ortogonais.',
      findings,
      conclusion,
      recommendations: recommendations || 'Correlação com a evolução clínica e novos exames complementares a critério médico veterinário.',
      vhsScore: vhsScore || undefined,
      norbergAngle: norbergAngle || undefined,
      keyImageIds: Array.isArray(keyImageIds) ? keyImageIds : []
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
