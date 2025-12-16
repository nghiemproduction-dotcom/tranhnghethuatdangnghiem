import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
    try {
        const { action, path: targetPath, newName, type } = await req.json();
        const fullPath = path.join(process.cwd(), targetPath);

        switch (action) {
            case 'create':
                if (type === 'folder') {
                    if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
                } else {
                    // Tạo file rỗng nếu chưa có
                    if (!fs.existsSync(fullPath)) fs.writeFileSync(fullPath, '', 'utf-8');
                }
                break;

            case 'rename':
                const newPath = path.join(path.dirname(fullPath), newName);
                if (fs.existsSync(fullPath)) fs.renameSync(fullPath, newPath);
                break;

            case 'delete':
                if (fs.existsSync(fullPath)) {
                    // Xóa để quy (nếu là folder có file con)
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