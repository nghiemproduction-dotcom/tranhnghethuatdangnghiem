import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, 
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

export async function POST(req: Request) {
    try {
        // 🛡️ BẢO MẬT: Kiểm tra Secret Key từ Header
        const authHeader = req.headers.get('x-admin-secret');
        if (authHeader !== process.env.ADMIN_SECRET_KEY) {
             console.warn("⚠️ Truy cập trái phép vào /api/sync-users");
             return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        console.log("--- BẮT ĐẦU ĐỒNG BỘ USER ---");

        // 1. Lấy danh sách nhân sự
        const { data: employees, error: empError } = await supabaseAdmin
            .from('nhan_su')
            .select('*');

        if (empError) throw new Error("Lỗi lấy dữ liệu nhân sự: " + empError.message);
        if (!employees) throw new Error("Không có dữ liệu nhân sự");

        // 2. Lấy danh sách Users hiện tại từ Auth
        const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
        if (authError) throw new Error("Lỗi lấy danh sách Auth Users: " + authError.message);

        let added = 0;
        let updated = 0;
        let deleted = 0;

        // 3. XỬ LÝ: THÊM HOẶC CẬP NHẬT
        for (const emp of employees) {
            if (!emp.email) continue; 

            const existingUser = authUsers.find(u => u.email === emp.email);

            if (!existingUser) {
                // -> Chưa có User -> TẠO MỚI
                const { error: createError } = await supabaseAdmin.auth.admin.createUser({
                    email: emp.email,
                    password: '12345678', 
                    email_confirm: true,
                    user_metadata: { 
                        full_name: emp.ten_hien_thi || emp.ten_day_du || 'Nhân viên',
                        source: 'auto_sync' 
                    }
                });
                
                if (createError) console.error(`Lỗi tạo user ${emp.email}:`, createError.message);
                else added++;

            } else {
                // -> Đã có User -> CẬP NHẬT
                const currentName = existingUser.user_metadata?.full_name;
                const newName = emp.ten_hien_thi || emp.ten_day_du;

                if (newName && currentName !== newName) {
                    await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
                        user_metadata: { ...existingUser.user_metadata, full_name: newName }
                    });
                    updated++;
                }
            }
        }

        // 4. XỬ LÝ: XÓA
        const empEmails = new Set(employees.map(e => e.email));

        for (const user of authUsers) {
            // Logic an toàn: Không xóa Super Admin (những user có email đặc biệt hoặc id cố định)
            // Ví dụ: Giữ lại admin@local
            if (user.email === 'admin@local') continue;

            if (user.email && !empEmails.has(user.email)) {
                 // Chỉ xóa user được tạo tự động để an toàn
                 if (user.user_metadata?.source === 'auto_sync') {
                    await supabaseAdmin.auth.admin.deleteUser(user.id);
                    deleted++;
                 }
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: "Đồng bộ thành công",
            added, 
            updated, 
            deleted 
        });

    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}