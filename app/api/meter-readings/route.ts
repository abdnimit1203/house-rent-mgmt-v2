import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { listMeterReadings, createMeterReading } from '@/services/meterReadingService';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    
    const readings = await listMeterReadings(
      session.houseLordId, 
      month ? Number(month) : undefined, 
      year ? Number(year) : undefined
    );
    return NextResponse.json(readings);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const data = await req.json();
    const reading = await createMeterReading(session.houseLordId, data);
    return NextResponse.json(reading, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
