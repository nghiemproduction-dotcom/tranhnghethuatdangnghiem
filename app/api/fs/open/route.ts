import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

export async function POST(req: Request) {
    try {
        const { filePath } = await req.json();
        const fullPath = path.join(process.cwd(), filePath); // Đường dẫn tuyệt đối

        let command = '';
        
        // Kiểm tra hệ điều hành để ra lệnh phù hợp
        switch (process.platform) {
            case 'win32': // Windows
                // Lệnh /select giúp mở thư mục và bôi đen sẵn file đó
                command = `explorer /select,"${fullPath.replace(/\//g, '\\')}"`; 
                break;
            case 'darwin': // Mac
                command = `open -R "${fullPath}"`;
                break;
            default: // Linux
                command = `xdg-open "${path.dirname(fullPath)}"`;
        }

        exec(command, (error) => {
            if (error) console.error("Lỗi mở thư mục:", error);
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
    }
}