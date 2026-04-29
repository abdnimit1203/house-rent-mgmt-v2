import { NextRequest, NextResponse } from 'next/server';
import { createHouseLord } from '@/services/houseLordService';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }
    const lord = await createHouseLord({ name, email, password, phone });
    const session = await getSession();
    session.houseLordId = lord._id.toString();
    session.name = lord.name;
    session.email = lord.email;
    await session.save();
    return NextResponse.json(
      { user: { _id: lord._id, name: lord.name, email: lord.email } },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
