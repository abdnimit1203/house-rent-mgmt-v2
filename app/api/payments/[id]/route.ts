import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getPayment, deletePayment } from '@/services/paymentService';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const { id } = await params;
    const payment = await getPayment(session.houseLordId, id);
    if (!payment) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(payment);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const { id } = await params;
    await deletePayment(session.houseLordId, id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
