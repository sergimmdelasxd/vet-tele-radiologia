import { NextResponse } from 'next/server';
import { getCurrentUserFromCookie } from '@/lib/auth';
import { getExamById, updateExam } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const exam = await getExamById(id);

    if (!exam) {
      return NextResponse.json({ error: 'Exame não encontrado' }, { status: 404 });
    }

    const user = await getCurrentUserFromCookie();
    // Se não estiver logado, permite acesso apenas para exames concluídos (visualização pública de laudos via link/QR Code)
    if (!user) {
      if (exam.status === 'REPORTED') {
        return NextResponse.json({ exam });
      }
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
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

    const existingExam = await getExamById(id);
    if (!existingExam) {
      return NextResponse.json({ error: 'Exame não encontrado' }, { status: 404 });
    }

    // Se for clínica, só pode atualizar seu próprio exame
    if (user.role === 'CLINIC' && existingExam.clinicId !== user.userId) {
      return NextResponse.json({ error: 'Acesso negado a este exame' }, { status: 403 });
    }

    // Permite alteração de status operacional apenas por radiologista ou admin
    if (user.role === 'CLINIC' && body.status && body.status !== 'CANCELLED') {
      return NextResponse.json({ error: 'Clínica não pode alterar status operacional do exame' }, { status: 403 });
    }

    // Bloqueia alteração de logotipo quando o laudo já foi emitido (REPORTED)
    if (existingExam.status === 'REPORTED' && body.clinicLogo !== undefined && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Não é permitido alterar o logotipo de um laudo oficial já emitido e assinado.' },
        { status: 403 }
      );
    }

    const updated = await updateExam(id, body);
    return NextResponse.json({ success: true, exam: updated });
  } catch (error) {
    console.error('Update exam error:', error);
    return NextResponse.json({ error: 'Erro ao atualizar exame' }, { status: 500 });
  }
}
