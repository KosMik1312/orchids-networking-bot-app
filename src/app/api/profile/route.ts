export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { saveProfile, getProfile, deleteProfile } from '../../../lib/api';

export async function POST(request: NextRequest) {
  try {
    const { userId, profile } = await request.json();

    if (!userId || typeof userId !== 'number' || !profile) {
      return NextResponse.json({ error: 'Invalid input: userId must be a number and profile must be provided.' }, { status: 400 });
    }

    const result = await saveProfile(userId, profile);
    return NextResponse.json({ success: result.success });

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

    const result = await getProfile(userId);
    return NextResponse.json({ profile: result.profile });

  } catch (error) {
    console.error('Error getting profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    const userIdStr = searchParams.get('userId');

    let userId: number | undefined;
    if (userIdStr) {
      userId = parseInt(userIdStr, 10);
      if (isNaN(userId)) userId = undefined;
    }

    const result = await deleteProfile(userId, authHeader?.replace('Bearer ', '') || '');
    return NextResponse.json({ success: result.success });

  } catch (error) {
    console.error('Error deleting profile:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}