import { NextRequest, NextResponse } from 'next/server';
import { getSlotContacts } from '../../../lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slotIdStr = searchParams.get('slotId');
    const userIdStr = searchParams.get('userId');

    if (!slotIdStr || !userIdStr) {
      return NextResponse.json({ error: 'Missing slotId or userId' }, { status: 400 });
    }

    const slotId = parseInt(slotIdStr, 10);
    const userId = parseInt(userIdStr, 10);

    if (isNaN(slotId) || isNaN(userId)) {
        return NextResponse.json({ error: 'Invalid input: slotId and userId must be numbers.' }, { status: 400 });
    }

    // TODO: [Безопасность] `userId` приходит от клиента.
    const contacts = await getSlotContacts(slotId, userId);
    return NextResponse.json({ contacts });
    
  } catch (error) {
    console.error('Error getting contacts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}