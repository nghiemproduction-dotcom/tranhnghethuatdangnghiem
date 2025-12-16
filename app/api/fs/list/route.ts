import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Hàm đệ quy quét file
const getFiles = (dir: string, fileList: string[] = [], rootDir: string) => {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        // Bỏ qua các thư mục rác hệ thống
        if (file === 'node_modules' || file === '.next' || file === '.git' || file === '.vscode') {
            return;
        }

        if (stat.isDirectory()) {
            getFiles(filePath, fileList, rootDir);
        } else {
            // Chỉ lấy đường dẫn tương đối để hiển thị cho đẹp
            // Ví dụ: app/page.tsx thay vì C:/Users/.../app/page.tsx
            const relativePath = path.relative(rootDir, filePath).replace(/\\/g, '/');
            fileList.push(relativePath);
        }
    });

    return fileList;
};

export async function GET() {
    try {
        const rootDir = process.cwd(); // Lấy thư mục gốc của dự án
        const files = getFiles(rootDir, [], rootDir);
        return NextResponse.json({ files });
    } catch (error) {
        return NextResponse.json({ error: 'Lỗi đọc file hệ thống' }, { status: 500 });
    }
}