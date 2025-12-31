import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 🛡️ CHỈ CHO PHÉP CHẠY KHI ĐANG DEV TRÊN MÁY LOCAL
const isDev = process.env.NODE_ENV === 'development';

export async function POST(req: Request) {
    if (!isDev) {
        return NextResponse.json({ error: 'Tính năng này bị vô hiệu hóa trên môi trường mạng.' }, { status: 403 });
    }

    try {
        const { filePath, content } = await req.json();
        
        // 🛡️ Sanitize Path: Chặn việc truy cập ra khỏi thư mục dự án (Directory Traversal)
        if (filePath.includes('..')) {
            return NextResponse.json({ error: 'Đường dẫn không hợp lệ' }, { status: 400 });
        }

        const fullPath = path.join(process.cwd(), filePath);

        if (content !== undefined) {
            fs.writeFileSync(fullPath, content, 'utf-8');
            return NextResponse.json({ success: true });
        } else {
            if (!fs.existsSync(fullPath)) return NextResponse.json({ error: 'File 404' }, { status: 404 });
            const fileContent = fs.readFileSync(fullPath, 'utf-8');
            return NextResponse.json({ content: fileContent });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}