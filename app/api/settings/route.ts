import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getSettings, updateSettings } from '@/services/settingsService';

export async function GET() {
  try {
    const session = await getSession();
    const settings = await getSettings(session.houseLordId);
    return NextResponse.json(settings);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    const data = await req.json();
    const settings = await updateSettings(session.houseLordId, data);
    return NextResponse.json(settings);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
