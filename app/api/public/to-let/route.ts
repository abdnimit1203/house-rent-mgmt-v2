import { NextRequest, NextResponse } from 'next/server';
import { getPublicAdvertisements } from '@/services/advertisementService';

export async function GET() {
  try {
    const ads = await getPublicAdvertisements();
    return NextResponse.json(ads);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
