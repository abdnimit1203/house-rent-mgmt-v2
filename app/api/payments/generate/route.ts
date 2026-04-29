import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { generateBill } from '@/services/paymentService';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const { tenantId, month, year } = await req.json();
    
    if (!tenantId || !month || !year) {
      return NextResponse.json({ error: 'tenantId, month, and year are required' }, { status: 400 });
    }
    
    const payment = await generateBill(session.houseLordId, tenantId, month, year);
    return NextResponse.json(payment, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 }); /* Passes through water bill gate error message */
  }
}
