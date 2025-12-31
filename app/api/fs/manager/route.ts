import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 🛡️ BẢO MẬT
const isDev = process.env.NODE_ENV === 'development';

export async function POST(req: Request) {
    // 🛑 CHẶN TUYỆT ĐỐI
    if (!isDev) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const { action, path: targetPath, newName, type } = await req.json();
        
        // 🛡️ BẢO MẬT PATH
        if (targetPath.includes('..')) return NextResponse.json({ error: 'Invalid path' }, { status: 400 });

        const fullPath = path.join(process.cwd(), targetPath);

        switch (action) {
            case 'create':
                if (type === 'folder') {
                    if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
                } else {
                    if (!fs.existsSync(fullPath)) fs.writeFileSync(fullPath, '', 'utf-8');
                }
                break;

            case 'rename':
                // 🛡️ Bảo mật tên mới
                if (!newName || newName.includes('/') || newName.includes('\\')) {
                    return NextResponse.json({ error: 'Tên file không hợp lệ' }, { status: 400 });
                }
                const newPath = path.join(path.dirname(fullPath), newName);
                if (fs.existsSync(fullPath)) fs.renameSync(fullPath, newPath);
                break;

            case 'delete':
                if (fs.existsSync(fullPath)) {
                    // 🛡️ CHỐNG XÓA NHẦM FILE HỆ THỐNG
                    if (fullPath === process.cwd()) {
                         return NextResponse.json({ error: 'Không thể xóa root' }, { status: 403 });
                    }
                    fs.rmSync(fullPath, { recursive: true, force: true });
                }
                break;
                
            default:
                return NextResponse.json({ error: 'Hành động không hợp lệ' }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}