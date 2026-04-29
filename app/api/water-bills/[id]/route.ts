import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getWaterBill, deleteWaterBill } from '@/services/waterBillService';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const { id } = await params;
    const bill = await getWaterBill(session.houseLordId, id);
    if (!bill) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(bill);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const { id } = await params;
    await deleteWaterBill(session.houseLordId, id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
