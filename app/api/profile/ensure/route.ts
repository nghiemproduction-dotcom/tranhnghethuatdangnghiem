import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const email = user?.email;

  if (!email) return NextResponse.json({ error: 'No user session' }, { status: 401 });

  try {
    const { getProfileByEmail } = await import('@/lib/dal');
    let profile = await getProfileByEmail(email);

    if (!profile) {
      const isAdminWhitelisted = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .includes(email.toLowerCase());

      const roleToCreate = isAdminWhitelisted ? 'admin' : 'user';

      const { data: inserted } = await supabase
        .from('profiles')
        .insert({ email, role: roleToCreate })
        .select('*')
        .single();

      profile = inserted;
    }

    return NextResponse.json({ profile });
  } catch (e) {
    console.error('[api/profile/ensure] error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
