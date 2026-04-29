import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getAdvertisements, createAdvertisement } from '@/services/advertisementService';

export async function GET() {
  try {
    const session = await getSession();
    const ads = await getAdvertisements(session.houseLordId);
    return NextResponse.json(ads);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const data = await req.json();
    const ad = await createAdvertisement(session.houseLordId, data);
    return NextResponse.json(ad, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
