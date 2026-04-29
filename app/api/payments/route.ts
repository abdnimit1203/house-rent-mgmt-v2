import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { listPayments } from '@/services/paymentService';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    
    const payments = await listPayments(
      session.houseLordId, 
      month ? Number(month) : undefined, 
      year ? Number(year) : undefined
    );
    return NextResponse.json(payments);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
