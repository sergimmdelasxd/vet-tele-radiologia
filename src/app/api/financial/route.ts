import { NextResponse } from 'next/server';
import { getCurrentUserFromCookie } from '@/lib/auth';
import { 
  getFinancialTransactions, 
  rechargeBalance, 
  findUserById, 
  PRICING_TABLE 
} from '@/lib/db';

export async function GET(request: Request) {
  try {
    const sessionUser = await getCurrentUserFromCookie();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const fullUser = await findUserById(sessionUser.userId);
    if (!fullUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Se for clínica, busca apenas dela; se for admin, pode ver tudo
    const clinicId = sessionUser.role === 'CLINIC' ? sessionUser.userId : undefined;
    const transactions = getFinancialTransactions(clinicId);

    return NextResponse.json({
      balance: fullUser.balance ?? 0,
      transactions,
      pricing: PRICING_TABLE,
      role: sessionUser.role
    });
  } catch (error: any) {
    console.error('Financial GET error:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar dados financeiros', details: error.message },
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

    const body = await request.json();
    const { action, amount, paymentMethod, targetClinicId } = body;

    if (action === 'recharge') {
      const parsedAmount = parseFloat(amount);
      if (!parsedAmount || parsedAmount <= 0) {
        return NextResponse.json(
          { error: 'Valor de recarga inválido' },
          { status: 400 }
        );
      }

      // Permite recarregar para si mesmo ou, se admin, para outra clínica
      const clinicIdToRecharge = 
        sessionUser.role === 'ADMIN' && targetClinicId 
          ? targetClinicId 
          : sessionUser.userId;

      const result = rechargeBalance(
        clinicIdToRecharge,
        parsedAmount,
        paymentMethod || 'PIX'
      );

      return NextResponse.json({
        success: true,
        newBalance: result.user.balance,
        transaction: result.transaction
      });
    }

    return NextResponse.json({ error: 'Ação não suportada' }, { status: 400 });
  } catch (error: any) {
    console.error('Financial POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar transação' },
      { status: 500 }
    );
  }
}
