import { NextResponse } from 'next/server';
import { getCurrentUserFromCookie } from '@/lib/auth';
import { getAllTemplates, createTemplate } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const modality = searchParams.get('modality') || undefined;
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;

    const templates = getAllTemplates({ modality, category, search });
    return NextResponse.json({ success: true, templates });
  } catch (error: any) {
    console.error('Templates GET error:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar modelos de laudo', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const sessionUser = await getCurrentUserFromCookie();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (sessionUser.role !== 'ADMIN' && sessionUser.role !== 'RADIOLOGIST') {
      return NextResponse.json(
        { error: 'Apenas médicos veterinários especialistas e administradores podem cadastrar modelos de laudo.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      modality,
      title,
      category,
      technique,
      findings,
      conclusion,
      recommendations
    } = body;

    if (!modality || !title || !category || !technique || !findings || !conclusion) {
      return NextResponse.json(
        { error: 'Modalidade, título, categoria, técnica, achados e conclusão são obrigatórios.' },
        { status: 400 }
      );
    }

    const newTemplate = createTemplate({
      modality,
      title: title.trim(),
      category: category.trim(),
      technique: technique.trim(),
      findings: findings.trim(),
      conclusion: conclusion.trim(),
      recommendations: (recommendations || '').trim(),
      createdBy: sessionUser.name
    });

    return NextResponse.json({ success: true, template: newTemplate }, { status: 201 });
  } catch (error: any) {
    console.error('Templates POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao cadastrar modelo de laudo' },
      { status: 500 }
    );
  }
}
