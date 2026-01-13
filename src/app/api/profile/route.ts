export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { saveUserProfile, getUserProfile } from '../../../lib/database';

export async function POST(request: NextRequest) {
  try {
    const { userId, profile } = await request.json();

    // Валидация входных данных
    if (!userId || typeof userId !== 'number' || !profile) {
      return NextResponse.json({ error: 'Invalid input: userId must be a number and profile must be provided.' }, { status: 400 });
    }
    
    // TODO: [Безопасность] `userId` приходит от клиента. В рабочей системе идентификация
    // пользователя должна происходить на сервере через сессию или токен.
    await saveUserProfile(userId, profile);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error saving profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

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

    // TODO: [Безопасность] `userId` приходит от клиента. В рабочей системе идентификация
    // пользователя должна происходить на сервере через сессию или токен.
    const profile = await getUserProfile(userId);
    
    if (!profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ profile });

  } catch (error) {
    console.error('Error getting profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}