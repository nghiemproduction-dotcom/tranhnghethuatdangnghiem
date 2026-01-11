import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Dùng Service Key để bypass RLS nếu cần
);

export async function POST(req: Request) {
    try {
        const { subscription, user_id, user_agent } = await req.json();

        if (!subscription || !subscription.endpoint || !user_id) {
            return NextResponse.json({ error: 'Missing data' }, { status: 400 });
        }

        // Lưu vào DB
        const { error } = await supabase.from('push_subscriptions').upsert({
            user_id,
            endpoint: subscription.endpoint,
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
            user_agent: user_agent,
            tao_luc: new Date().toISOString()
        }, { onConflict: 'user_id, endpoint' });

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Subscribe Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}