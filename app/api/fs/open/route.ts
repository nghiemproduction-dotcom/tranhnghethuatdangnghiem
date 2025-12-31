import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

const isDev = process.env.NODE_ENV === 'development';

export async function POST(req: Request) {
    if (!isDev) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    try {
        const { filePath } = await req.json();
        if (filePath.includes('..')) return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
        
        const fullPath = path.join(process.cwd(), filePath); 

        let command = '';
        
        // 🛡️ BẢO MẬT: Chỉ cho phép mở file, không inject lệnh lạ
        // Sử dụng JSON.stringify để escape đường dẫn, tránh injection
        switch (process.platform) {
            case 'win32': 
                command = `explorer /select,${JSON.stringify(fullPath)}`; 
                break;
            case 'darwin': 
                command = `open -R ${JSON.stringify(fullPath)}`;
                break;
            default: 
                command = `xdg-open ${JSON.stringify(path.dirname(fullPath))}`;
        }

        exec(command, (error) => {
            if (error) console.error("Lỗi mở thư mục:", error);
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
    }
}