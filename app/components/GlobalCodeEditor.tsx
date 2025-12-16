'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import TrinhSuaCodeNhanh from './TrinhSuaCodeNhanh';

export default function GlobalCodeEditor() {
    const pathname = usePathname();

    // Logic lấy tên phòng từ URL:
    // Ví dụ: /phongdemo -> roomName = "phongdemo"
    // Ví dụ: / -> roomName = "TRANG_CHU"
    const segments = pathname?.split('/').filter(Boolean) || [];
    const currentRoom = segments.length > 0 ? segments[0] : 'TRANG_CHU';

    return (
        <TrinhSuaCodeNhanh roomName={currentRoom} />
    );
}