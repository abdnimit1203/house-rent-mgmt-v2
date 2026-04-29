import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { recordPayment } from '@/services/paymentService';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const { id } = await params;
    const { amountPaid } = await req.json();
    
    if (amountPaid === undefined || amountPaid < 0) {
      return NextResponse.json({ error: 'Valid amountPaid is required' }, { status: 400 });
    }
    
    const payment = await recordPayment(session.houseLordId, id, amountPaid);
    return NextResponse.json(payment);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
