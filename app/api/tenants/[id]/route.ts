import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getTenant, updateTenant, deleteTenant } from '@/services/tenantService';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const { id } = await params;
    const tenant = await getTenant(session.houseLordId, id);
    if (!tenant) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(tenant);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const { id } = await params;
    const data = await req.json();
    const tenant = await updateTenant(session.houseLordId, id, data);
    return NextResponse.json(tenant);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const { id } = await params;
    await deleteTenant(session.houseLordId, id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
