import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// ĐỌC FILE (GET)
export async function POST(req: Request) {
    try {
        const { filePath, content } = await req.json();
        const fullPath = path.join(process.cwd(), filePath);

        // Nếu có content -> Là hành động GHI FILE
        if (content !== undefined) {
            fs.writeFileSync(fullPath, content, 'utf-8');
            return NextResponse.json({ success: true, message: 'Đã lưu file thành công!' });
        } 
        
        // Nếu không có content -> Là hành động ĐỌC FILE
        else {
            if (!fs.existsSync(fullPath)) {
                return NextResponse.json({ error: 'File không tồn tại' }, { status: 404 });
            }
            const fileContent = fs.readFileSync(fullPath, 'utf-8');
            return NextResponse.json({ content: fileContent });
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Lỗi thao tác file' }, { status: 500 });
    }
}