export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAvailableSlots } from '../../../lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');

    const slots = await getAvailableSlots(city || undefined);
    return NextResponse.json({ slots });
  } catch (error)
 {
    console.error('Error getting slots:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}