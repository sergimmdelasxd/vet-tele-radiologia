import { NextResponse } from 'next/server';
import { getCurrentUserFromCookie } from '@/lib/auth';
import { getExamById, updateExam } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUserFromCookie();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const exam = getExamById(id);

    if (!exam) {
      return NextResponse.json({ error: 'Exame não encontrado' }, { status: 404 });
    }

    // Se for clínica, só pode ver seu próprio exame
    if (user.role === 'CLINIC' && exam.clinicId !== user.userId) {
      return NextResponse.json({ error: 'Acesso negado a este exame' }, { status: 403 });
    }

    return NextResponse.json({ exam });
  } catch (error) {
    console.error('Fetch exam error:', error);
    return NextResponse.json({ error: 'Erro ao buscar exame' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUserFromCookie();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const existingExam = getExamById(id);
    if (!existingExam) {
      return NextResponse.json({ error: 'Exame não encontrado' }, { status: 404 });
    }

    // Permite alteração de status por radiologista ou admin
    if (user.role === 'CLINIC' && body.status && body.status !== 'CANCELLED') {
      return NextResponse.json({ error: 'Clínica não pode alterar status operacional do exame' }, { status: 403 });
    }

    const updated = updateExam(id, body);
    return NextResponse.json({ success: true, exam: updated });
  } catch (error) {
    console.error('Update exam error:', error);
    return NextResponse.json({ error: 'Erro ao atualizar exame' }, { status: 500 });
  }
}
