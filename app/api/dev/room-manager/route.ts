import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// CẤM CACHE ĐỂ LUÔN CÓ DỮ LIỆU MỚI NHẤT
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SYSTEM_FOLDERS = ['phongadmin', 'api', 'components', 'lib', 'utils', 'hooks', 'types', 'globals.css', 'layout.tsx', 'page.tsx', 'fonts', 'favicon.ico'];

export async function GET() {
  const appDir = path.join(process.cwd(), 'app');
  
  if (!fs.existsSync(appDir)) return NextResponse.json({ rooms: [] });

  // 1. Quét tìm các folder Phòng
  const roomFolders = fs.readdirSync(appDir).filter(f => {
    try {
      if (!fs.statSync(path.join(appDir, f)).isDirectory()) return false;
    } catch (e) { return false; }
    if (SYSTEM_FOLDERS.includes(f)) return false;
    if (f.startsWith('.') || f.startsWith('_')) return false;
    if (!fs.existsSync(path.join(appDir, f, 'page.tsx'))) return false;
    return true;
  });

  // 2. Đọc chi tiết từng phòng (Roles & Features)
  const roomsData = roomFolders.map(roomName => {
    const roomPath = path.join(appDir, roomName);
    const pagePath = path.join(roomPath, 'page.tsx');
    const componentsPath = path.join(roomPath, 'components');

    let allowedRoles: string[] = [];
    let features: string[] = []; // 🟢 MỚI: Danh sách chức năng

    // A. Lấy Roles từ page.tsx
    try {
      const content = fs.readFileSync(pagePath, 'utf8');
      const match = content.match(/const\s+ALLOWED_ROLES\s*=\s*(\[[\s\S]*?\])/);
      if (match && match[1]) {
        const jsonString = match[1].replace(/'/g, '"').replace(/,\s*]/, ']');
        allowedRoles = JSON.parse(jsonString);
      }
    } catch (e) { console.error(`Lỗi đọc role phòng ${roomName}`, e); }

    // B. Lấy Features từ folder components
    try {
        if (fs.existsSync(componentsPath)) {
            // Quét các folder con trong components -> Đó chính là tên chức năng
            features = fs.readdirSync(componentsPath).filter(f => {
                return fs.statSync(path.join(componentsPath, f)).isDirectory();
            });
        }
    } catch (e) { console.error(`Lỗi đọc feature phòng ${roomName}`, e); }

    return {
      name: roomName,
      allowedRoles,
      features // Trả về danh sách chức năng
    };
  });
  
  return NextResponse.json({ rooms: roomsData });
}

export async function DELETE(req: Request) {
  const { roomName } = await req.json();
  if (roomName === 'phongadmin') return NextResponse.json({ error: 'Không thể xóa phòng Admin!' }, { status: 403 });

  const roomPath = path.join(process.cwd(), 'app', roomName);
  const routeFile = path.join(process.cwd(), 'app', 'app-routes.ts');

  try {
    if (fs.existsSync(roomPath)) fs.rmSync(roomPath, { recursive: true, force: true });

    if (fs.existsSync(routeFile)) {
      let content = fs.readFileSync(routeFile, 'utf8');
      const regex = new RegExp(`\\s*['"][^'"]+['"]:\\s*['"]/${roomName}['"],?`, 'g');
      content = content.replace(regex, '');
      fs.writeFileSync(routeFile, content);
    }
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}