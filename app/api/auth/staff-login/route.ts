// Deprecated: staff-login method replaced by Supabase OAuth flow.
// Retained for reference; not used by the current UI.

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ error: 'Deprecated' }, { status: 410 });
}