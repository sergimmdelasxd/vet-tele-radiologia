import { NextResponse } from 'next/server';
import { getCurrentUserFromCookie } from '@/lib/auth';
import { getTeachingCases, createTeachingCase } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const species = searchParams.get('species') || undefined;
    const search = searchParams.get('search') || undefined;

    const cases = getTeachingCases({ category, species, search });
    return NextResponse.json({ success: true, cases });
  } catch (error: any) {
    console.error('Cases GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
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
        { error: 'Apenas veterinários e administradores podem cadastrar casos na casoteca.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      species,
      breed,
      age,
      category,
      modality,
      difficulty,
      summary,
      clinicalHistory,
      findings,
      diagnosis,
      keyPoints,
      differentialDiagnosis,
      images
    } = body;

    if (!title || !species || !breed || !category || !modality || !findings || !diagnosis) {
      return NextResponse.json(
        { error: 'Campos obrigatórios ausentes para o caso de ensino.' },
        { status: 400 }
      );
    }

    const newCase = createTeachingCase({
      title: title.trim(),
      species,
      breed: breed.trim(),
      age: age ? age.trim() : undefined,
      category,
      modality,
      difficulty: difficulty || 'Intermediário',
      summary: summary ? summary.trim() : '',
      clinicalHistory: clinicalHistory ? clinicalHistory.trim() : '',
      findings: findings.trim(),
      diagnosis: diagnosis.trim(),
      keyPoints: Array.isArray(keyPoints) ? keyPoints : [],
      differentialDiagnosis: Array.isArray(differentialDiagnosis) ? differentialDiagnosis : [],
      images: Array.isArray(images) ? images : [],
      createdBy: `${sessionUser.name}${sessionUser.crmv ? ' (' + sessionUser.crmv + ')' : ''}`
    });

    return NextResponse.json({ success: true, case: newCase }, { status: 201 });
  } catch (error: any) {
    console.error('Cases POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
