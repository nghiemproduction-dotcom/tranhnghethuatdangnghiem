'use server';

import postgres from 'postgres';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

async function getStaffUser() {
    const cookieStore = cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: { get(name: string) { return cookieStore.get(name)?.value }, set() {}, remove() {} },
        }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    
    // Lấy role
    const [ns] = await sql`SELECT id, vi_tri_normalized FROM nhan_su WHERE id = ${user.id} LIMIT 1`;
    if (!ns) throw new Error("Not a staff member");
    
    return ns;
}

// HÀM: Sales nhận cuộc hội thoại
export async function claimChatSessionAction(sessionId: string) {
    try {
        const staff = await getStaffUser();
        
        // 1. Kiểm tra xem session đã có ai nhận chưa
        const [session] = await sql`SELECT nhan_su_phu_trach_id FROM tu_van_sessions WHERE id = ${sessionId} LIMIT 1`;
        
        if (!session) throw new Error("Cuộc hội thoại không tồn tại");

        // Nếu đã có người nhận rồi
        if (session.nhan_su_phu_trach_id) {
            // Nếu là chính mình thì ok, người khác thì lỗi
            if (session.nhan_su_phu_trach_id !== staff.id) {
                // Nếu là Admin/Quản lý thì được quyền cướp/ghi đè (tùy logic, ở đây cho phép hỗ trợ)
                if (['admin', 'quanly', 'boss'].includes(staff.vi_tri_normalized)) {
                    // Admin được phép join
                } else {
                    return { success: false, error: "Cuộc hội thoại này đã có Sales khác hỗ trợ!" };
                }
            }
        }

        // 2. Cập nhật người phụ trách
        await sql`
            UPDATE tu_van_sessions 
            SET nhan_su_phu_trach_id = ${staff.id}, 
                trang_thai = 'dang_tu_van' 
            WHERE id = ${sessionId}
        `;

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}