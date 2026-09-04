import { NextResponse } from 'next/server';
import { getCurrentUserFromCookie } from '@/lib/auth';
import { getTeachingCaseById, updateTeachingCase, deleteTeachingCase } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const foundCase = getTeachingCaseById(id);
    if (!foundCase) {
      return NextResponse.json({ error: 'Caso não encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, case: foundCase });
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
      return NextResponse.json({ error: 'Apenas veterinários e admins podem editar casos' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const updated = updateTeachingCase(id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Caso não encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, case: updated });
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
    if (!sessionUser || sessionUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Apenas o administrador pode excluir casos de ensino' }, { status: 403 });
    }

    const { id } = await params;
    const deleted = deleteTeachingCase(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Caso não encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Caso excluído com sucesso' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
