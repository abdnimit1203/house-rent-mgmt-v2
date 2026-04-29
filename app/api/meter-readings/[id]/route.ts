import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getMeterReading, updateMeterReading, deleteMeterReading } from '@/services/meterReadingService';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const { id } = await params;
    const reading = await getMeterReading(session.houseLordId, id);
    if (!reading) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(reading);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const { id } = await params;
    const data = await req.json();
    const reading = await updateMeterReading(session.houseLordId, id, data);
    return NextResponse.json(reading);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const { id } = await params;
    await deleteMeterReading(session.houseLordId, id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
