import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { changePassword } from '@/services/houseLordService';

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Both passwords are required' }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
    }
    await changePassword(session.houseLordId, currentPassword, newPassword);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
