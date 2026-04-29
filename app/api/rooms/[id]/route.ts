import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getRoom, updateRoom, deleteRoom } from '@/services/roomService';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const { id } = await params;
    const room = await getRoom(session.houseLordId, id);
    if (!room) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(room);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const { id } = await params;
    const data = await req.json();
    const room = await updateRoom(session.houseLordId, id, data);
    return NextResponse.json(room);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const { id } = await params;
    await deleteRoom(session.houseLordId, id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
