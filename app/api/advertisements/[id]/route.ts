import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getAdvertisement, updateAdvertisement, deleteAdvertisement } from '@/services/advertisementService';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const { id } = await params;
    const ad = await getAdvertisement(session.houseLordId, id);
    if (!ad) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(ad);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const { id } = await params;
    const data = await req.json();
    const ad = await updateAdvertisement(session.houseLordId, id, data);
    return NextResponse.json(ad);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const { id } = await params;
    await deleteAdvertisement(session.houseLordId, id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
