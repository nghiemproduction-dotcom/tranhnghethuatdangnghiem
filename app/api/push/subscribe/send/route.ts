import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webPush from 'web-push';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Cấu hình Web Push
webPush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
    try {
        // userId: Người nhận, title: Tiêu đề, body: Nội dung, url: Link đích
        const { userId, title, body, url } = await req.json();

        // 1. Lấy danh sách thiết bị của User đó
        const { data: subs } = await supabase
            .from('push_subscriptions')
            .select('*')
            .eq('user_id', userId);

        if (!subs || subs.length === 0) {
            return NextResponse.json({ message: 'User has no subscriptions' });
        }

        // 2. Gửi thông báo đến TẤT CẢ thiết bị của họ
        const notifications = subs.map(sub => {
            const pushConfig = {
                endpoint: sub.endpoint,
                keys: { auth: sub.auth, p256dh: sub.p256dh }
            };
            const payload = JSON.stringify({ title, body, url });

            return webPush.sendNotification(pushConfig, payload).catch(err => {
                if (err.statusCode === 410 || err.statusCode === 404) {
                    // Thiết bị đã hủy đăng ký hoặc lỗi -> Xóa khỏi DB cho sạch
                    console.log('Subscription expired, deleting from DB:', sub.id);
                    supabase.from('push_subscriptions').delete().eq('id', sub.id).then();
                }
            });
        });

        await Promise.all(notifications);

        return NextResponse.json({ success: true, count: subs.length });
    } catch (error: any) {
        console.error('Push Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}