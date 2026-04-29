import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { listRooms, createRoom } from '@/services/roomService';

export async function GET() {
  try {
    const session = await getSession();
    const rooms = await listRooms(session.houseLordId);
    return NextResponse.json(rooms);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const data = await req.json();
    const room = await createRoom(session.houseLordId, data);
    return NextResponse.json(room, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
