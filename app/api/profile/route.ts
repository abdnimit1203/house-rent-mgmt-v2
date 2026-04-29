import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getHouseLord, updateHouseLord } from '@/services/houseLordService';

export async function GET() {
  try {
    const session = await getSession();
    const lord = await getHouseLord(session.houseLordId);
    return NextResponse.json(lord);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    const data = await req.json();
    const lord = await updateHouseLord(session.houseLordId, data);
    // Update session name if changed
    if (data.name) { session.name = data.name; await session.save(); }
    return NextResponse.json(lord);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
