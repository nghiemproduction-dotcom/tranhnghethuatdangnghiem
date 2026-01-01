'use client';
import { useEffect } from 'react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { useUser } from '@/app/ThuVien/UserContext';

export default function StaffPresence() {
    const { user } = useUser();

    useEffect(() => {
        // Chỉ chạy nếu là nhân sự
        if (!user || user.userType !== 'nhan_su') return;

        // Tạo kênh 'online-users'
        const channel = supabase.channel('online-users', {
            config: {
                presence: {
                    key: user.id, // ID định danh
                },
            },
        });

        channel
            .on('presence', { event: 'sync' }, () => {
                // Console log để debug chơi thôi
                console.log('📡 Đã phát tín hiệu online:', user.ho_ten);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    // Gửi thông tin nhân viên lên kênh
                    await channel.track({
                        id: user.id,
                        name: user.ho_ten,
                        role: user.role, // 'admin', 'quanly', 'sales'
                        online_at: new Date().toISOString(),
                    });
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    return null; // Component này không hiện gì cả, chỉ chạy ngầm
}