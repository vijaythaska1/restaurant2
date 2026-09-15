import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key } = body;

    if (!key || typeof key !== 'string') {
      return NextResponse.json(
        { error: 'Secret key is required' },
        { status: 400 },
      );
    }

    const configuredKey = process.env.ADMIN_SECRET_KEY || 'admin786';

    if (key.trim() !== configuredKey.trim()) {
      return NextResponse.json(
        { error: 'Incorrect Secret Key! Access Denied.' },
        { status: 401 },
      );
    }

    // Return the admin key so frontend can use it for API headers
    // This is safe because only someone with the correct key can get it back
    return NextResponse.json({
      success: true,
      adminKey: configuredKey,
      message: 'Admin access granted',
    });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 },
    );
  }
}
