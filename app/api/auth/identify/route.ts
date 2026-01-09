import { NextResponse } from 'next/server';
import { identifyUserByEmail } from '@/lib/dal';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = url.searchParams.get('email');

  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });

  try {
    const user = await identifyUserByEmail(email);
    return NextResponse.json({ user });
  } catch (e) {
    console.error('[api/auth/identify] error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
