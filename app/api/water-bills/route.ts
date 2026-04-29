import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { listWaterBills, upsertWaterBill } from '@/services/waterBillService';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    
    const bills = await listWaterBills(
      session.houseLordId, 
      month ? Number(month) : undefined, 
      year ? Number(year) : undefined
    );
    return NextResponse.json(bills);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const data = await req.json();
    const bill = await upsertWaterBill(session.houseLordId, data);
    return NextResponse.json(bill, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
