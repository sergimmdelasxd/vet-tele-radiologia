import { NextResponse } from 'next/server';
import { getCurrentUserFromCookie } from '@/lib/auth';
import { getTemplateById, updateTemplate, deleteTemplate } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const template = getTemplateById(id);
    if (!template) {
      return NextResponse.json({ error: 'Modelo não encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, template });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao buscar modelo' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getCurrentUserFromCookie();
    if (!sessionUser || (sessionUser.role !== 'ADMIN' && sessionUser.role !== 'RADIOLOGIST')) {
      return NextResponse.json({ error: 'Acesso restrito' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const updated = updateTemplate(id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Modelo não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, template: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao atualizar modelo' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getCurrentUserFromCookie();
    if (!sessionUser || (sessionUser.role !== 'ADMIN' && sessionUser.role !== 'RADIOLOGIST')) {
      return NextResponse.json({ error: 'Acesso restrito' }, { status: 403 });
    }

    const { id } = await params;
    const deleted = deleteTemplate(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Modelo não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Modelo removido com sucesso' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao excluir modelo' }, { status: 500 });
  }
}
