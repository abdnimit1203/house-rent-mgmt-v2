import { NextRequest, NextResponse } from 'next/server';
import { authenticateHouseLord } from '@/services/houseLordService';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }
    const lord = await authenticateHouseLord(email, password);
    const session = await getSession();
    session.houseLordId = lord._id.toString();
    session.name = lord.name;
    session.email = lord.email;
    await session.save();
    return NextResponse.json({
      user: { _id: lord._id, name: lord.name, email: lord.email },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
