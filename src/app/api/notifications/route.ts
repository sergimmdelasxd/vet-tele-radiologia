import { NextResponse } from 'next/server';
import { getCurrentUserFromCookie } from '@/lib/auth';
import { getNotifications, createNotification, markAllNotificationsAsRead } from '@/lib/db';

export async function GET() {
  try {
    const sessionUser = await getCurrentUserFromCookie();
    const role = sessionUser ? sessionUser.role : undefined;
    const userId = sessionUser ? sessionUser.userId : undefined;

    const notifications = getNotifications(role, userId);
    return NextResponse.json({ success: true, notifications });
  } catch (error: any) {
    console.error('Notifications GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sessionUser = await getCurrentUserFromCookie();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { type, title, message, targetRole, userId, examId, link } = body;

    if (!type || !title || !message) {
      return NextResponse.json({ error: 'Tipo, título e mensagem são obrigatórios' }, { status: 400 });
    }

    const newNotif = createNotification({
      type,
      title,
      message,
      targetRole: targetRole || 'ALL',
      userId,
      examId,
      link
    });

    return NextResponse.json({ success: true, notification: newNotif }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH() {
  try {
    const sessionUser = await getCurrentUserFromCookie();
    const role = sessionUser ? sessionUser.role : undefined;

    markAllNotificationsAsRead(role);
    return NextResponse.json({ success: true, message: 'Todas as notificações marcadas como lidas' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
