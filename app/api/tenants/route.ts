import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { listTenants, createTenant } from '@/services/tenantService';

export async function GET() {
  try {
    const session = await getSession();
    const tenants = await listTenants(session.houseLordId);
    return NextResponse.json(tenants);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const data = await req.json();
    const tenant = await createTenant(session.houseLordId, data);
    return NextResponse.json(tenant, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
