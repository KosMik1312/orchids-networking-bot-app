export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getUserBookings, createBooking } from '../../../lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdStr = searchParams.get('userId');

    if (!userIdStr) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }
    
    const userId = parseInt(userIdStr, 10);
    if (isNaN(userId)) {
        return NextResponse.json({ error: 'Invalid userId: must be a number.' }, { status: 400 });
    }

    // TODO: [Безопасность] `userId` приходит от клиента.
    const bookings = await getUserBookings(userId);
    return NextResponse.json({ bookings });

  } catch (error) {
    console.error('Error getting bookings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, slotId } = await request.json();

    if (!userId || typeof userId !== 'number' || !slotId || typeof slotId !== 'number') {
      return NextResponse.json({ error: 'Invalid input: userId and slotId must be numbers.' }, { status: 400 });
    }

    // TODO: [Безопасность] `userId` приходит от клиента.
    const success = await createBooking(userId, slotId);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Failed to create booking. The slot may be full, or you have already booked it.' }, { status: 409 }); // 409 Conflict
    }

  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
