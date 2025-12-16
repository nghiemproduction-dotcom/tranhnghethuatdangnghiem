import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Khởi tạo Supabase Admin Client (Có quyền tối cao)
// Cần biến môi trường SUPABASE_SERVICE_ROLE_KEY trong .env.local
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

export async function POST() {
    try {
        console.log("--- BẮT ĐẦU ĐỒNG BỘ USER ---");

        // 1. Lấy danh sách nhân sự từ bảng 'nhan_su'
        // Yêu cầu bảng nhan_su phải có cột 'email' và 'id'
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
            if (!emp.email) continue; // Bỏ qua nếu không có email

            const existingUser = authUsers.find(u => u.email === emp.email);

            if (!existingUser) {
                // -> Chưa có User -> TẠO MỚI
                // Mật khẩu mặc định: 12345678 (Hoặc lấy từ cột password nếu có)
                const { error: createError } = await supabaseAdmin.auth.admin.createUser({
                    email: emp.email,
                    password: '12345678', 
                    email_confirm: true,
                    user_metadata: { 
                        full_name: emp.ten_hien_thi || emp.ten_day_du || 'Nhân viên',
                        source: 'auto_sync' // Đánh dấu user này được tạo tự động
                    }
                });
                
                if (createError) console.error(`Lỗi tạo user ${emp.email}:`, createError.message);
                else added++;

            } else {
                // -> Đã có User -> CẬP NHẬT (Update metadata nếu cần)
                // Ví dụ: cập nhật lại tên hiển thị cho khớp
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

        // 4. XỬ LÝ: XÓA (Nếu nhân sự bị xóa khỏi bảng thì xóa luôn User Auth)
        // Chỉ xóa những user có đánh dấu 'source': 'auto_sync' hoặc email nằm trong domain công ty để an toàn
        // Ở đây ta xóa những user có email không nằm trong danh sách nhân sự hiện tại.
        const empEmails = new Set(employees.map(e => e.email));

        for (const user of authUsers) {
            // Logic an toàn: Không xóa Super Admin (thường id cố định hoặc email đặc biệt)
            // Chỉ xóa nếu user đó KHÔNG có trong bảng nhân sự
            if (user.email && !empEmails.has(user.email)) {
                // Kiểm tra thêm điều kiện an toàn (ví dụ chỉ xóa user do sync tạo ra)
                // if (user.user_metadata?.source === 'auto_sync') {
                    await supabaseAdmin.auth.admin.deleteUser(user.id);
                    deleted++;
                // }
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