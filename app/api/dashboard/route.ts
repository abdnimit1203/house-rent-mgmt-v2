import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getDashboardStats } from '@/services/dashboardService';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    
    if (!month || !year) {
      return NextResponse.json({ error: 'Month and year are required' }, { status: 400 });
    }
    
    const stats = await getDashboardStats(session.houseLordId, Number(month), Number(year));
    return NextResponse.json(stats);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
