export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getSlots } from '../../../lib/api';

export async function GET(request: NextRequest) {
  console.log('🚀 Роут /api/slots вызван');
  
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    console.log('🏙️ Город:', city);

    const result = await getSlots(city || undefined);
    console.log('✅ Получены слоты:', result);
    
    return NextResponse.json({ slots: result.slots });
  } catch (error) {
    console.error('❌ Ошибка в роуте:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}