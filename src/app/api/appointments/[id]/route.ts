import { NextResponse } from 'next/server';
import { getCurrentUserFromCookie } from '@/lib/auth';
import { 
  getAppointmentById, 
  updateAppointment, 
  deleteAppointment, 
  convertAppointmentToExam 
} from '@/lib/db';

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
    const appointment = getAppointmentById(id);

    if (!appointment) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ appointment });
  } catch (error: any) {
    return NextResponse.json({ error: 'Erro ao buscar agendamento', details: error.message }, { status: 500 });
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
    const updates = await request.json();

    const updated = updateAppointment(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, appointment: updated });
  } catch (error: any) {
    return NextResponse.json({ error: 'Erro ao atualizar agendamento', details: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUserFromCookie();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const deleted = deleteAppointment(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Agendamento cancelado/excluído com sucesso' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Erro ao excluir agendamento', details: error.message }, { status: 500 });
  }
}

export async function POST(
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

    if (body.action === 'convert-to-exam') {
      const result = convertAppointmentToExam(id);
      if (!result) {
        return NextResponse.json({ error: 'Não foi possível converter o agendamento em exame' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        appointment: result.appointment,
        exam: result.exam
      });
    }

    return NextResponse.json({ error: 'Ação não suportada' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Erro ao processar conversão', details: error.message }, { status: 500 });
  }
}
