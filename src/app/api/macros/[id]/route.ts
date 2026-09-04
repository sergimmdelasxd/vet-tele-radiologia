import { NextResponse } from 'next/server';
import { getCurrentUserFromCookie } from '@/lib/auth';
import { getQuickPhraseById, updateQuickPhrase, deleteQuickPhrase } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const phrase = getQuickPhraseById(id);
    if (!phrase) {
      return NextResponse.json({ error: 'Frase rápida não encontrada' }, { status: 404 });
    }
    return NextResponse.json({ success: true, phrase });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getCurrentUserFromCookie();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (sessionUser.role !== 'ADMIN' && sessionUser.role !== 'RADIOLOGIST') {
      return NextResponse.json(
        { error: 'Apenas veterinários e administradores podem editar frases rápidas.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const updated = updateQuickPhrase(id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Frase rápida não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ success: true, phrase: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getCurrentUserFromCookie();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (sessionUser.role !== 'ADMIN' && sessionUser.role !== 'RADIOLOGIST') {
      return NextResponse.json(
        { error: 'Apenas veterinários e administradores podem excluir frases rápidas.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const deleted = deleteQuickPhrase(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Frase rápida não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Frase rápida excluída com sucesso' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
