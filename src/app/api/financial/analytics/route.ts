import { NextResponse } from 'next/server';
import { getCurrentUserFromCookie } from '@/lib/auth';
import { 
  getPlatformFinancialAnalytics, 
  updateClinicPlan, 
  adjustClinicBalance,
  updateClinicPricing
} from '@/lib/db';

export async function GET() {
  try {
    const sessionUser = await getCurrentUserFromCookie();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (sessionUser.role !== 'ADMIN' && sessionUser.role !== 'RADIOLOGIST') {
      return NextResponse.json(
        { error: 'Acesso restrito para Administradores e Médicos Veterinários Especialistas.' },
        { status: 403 }
      );
    }

    const analytics = getPlatformFinancialAnalytics();

    return NextResponse.json({
      success: true,
      analytics
    });
  } catch (error: any) {
    console.error('Analytics GET error:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar dados analíticos financeiros', details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const sessionUser = await getCurrentUserFromCookie();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (sessionUser.role !== 'ADMIN' && sessionUser.role !== 'RADIOLOGIST') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await request.json();
    const { action, clinicId, plan, amount, reason } = body;

    if (action === 'update-plan') {
      if (!clinicId || !plan) {
        return NextResponse.json({ error: 'Clínica e plano são obrigatórios' }, { status: 400 });
      }

      const updatedUser = updateClinicPlan(clinicId, plan);
      if (!updatedUser) {
        return NextResponse.json({ error: 'Clínica não encontrada' }, { status: 404 });
      }

      return NextResponse.json({ success: true, user: updatedUser });
    }

    if (action === 'adjust-balance') {
      if (!clinicId || typeof amount !== 'number') {
        return NextResponse.json({ error: 'Clínica e valor numérico são obrigatórios' }, { status: 400 });
      }

      const result = adjustClinicBalance(clinicId, amount, reason || 'Ajuste manual');
      return NextResponse.json({ success: true, ...result });
    }

    if (action === 'update-pricing') {
      const { customPricing } = body;
      if (!clinicId || !customPricing) {
        return NextResponse.json({ error: 'Clínica e tabela de preços são obrigatórios' }, { status: 400 });
      }

      const updatedUser = await updateClinicPricing(clinicId, customPricing);
      if (!updatedUser) {
        return NextResponse.json({ error: 'Clínica não encontrada' }, { status: 404 });
      }

      return NextResponse.json({ success: true, user: updatedUser });
    }

    return NextResponse.json({ error: 'Ação não suportada' }, { status: 400 });
  } catch (error: any) {
    console.error('Analytics PATCH error:', error);
    return NextResponse.json({ error: error.message || 'Erro ao processar alteração' }, { status: 500 });
  }
}
