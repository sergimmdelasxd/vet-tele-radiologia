import { NextResponse } from 'next/server';
import { getCurrentUserFromCookie } from '@/lib/auth';
import { getQuickPhrases, createQuickPhrase } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search')?.toLowerCase();

    let phrases = getQuickPhrases();

    if (category && category !== 'ALL') {
      phrases = phrases.filter(p => p.category === category);
    }

    if (search) {
      phrases = phrases.filter(p => 
        p.title.toLowerCase().includes(search) ||
        p.shortcut.toLowerCase().includes(search) ||
        p.category.toLowerCase().includes(search) ||
        p.content.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ success: true, phrases });
  } catch (error: any) {
    console.error('Macros GET error:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar frases rápidas', details: error.message },
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

    // Apenas veterinários e admins podem gerenciar frases rápidas
    if (sessionUser.role !== 'ADMIN' && sessionUser.role !== 'RADIOLOGIST') {
      return NextResponse.json(
        { error: 'Apenas veterinários e administradores podem criar frases rápidas.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { shortcut, title, category, content } = body;

    if (!shortcut || !title || !category || !content) {
      return NextResponse.json(
        { error: 'Atalho (/), título, categoria e conteúdo são obrigatórios.' },
        { status: 400 }
      );
    }

    const newPhrase = createQuickPhrase({
      shortcut: shortcut.trim(),
      title: title.trim(),
      category: category.trim(),
      content: content.trim(),
      createdBy: sessionUser.name
    });

    return NextResponse.json({ success: true, phrase: newPhrase }, { status: 201 });
  } catch (error: any) {
    console.error('Macros POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao cadastrar frase rápida' },
      { status: 500 }
    );
  }
}
