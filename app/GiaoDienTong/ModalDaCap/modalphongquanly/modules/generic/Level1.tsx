'use client';
import React, { useState } from 'react';
import { ModuleConfig } from '@/app/GiaoDienTong/DashboardBuilder/KieuDuLieuModule';
import Level1_Widget_Generic from './Level1_Widget';
import Level2_Generic from './Level2';

interface Props {
    config: ModuleConfig;
}

export default function Level1_Generic({ config }: Props) {
    const [showLevel2, setShowLevel2] = useState(false);

    // 🟢 NẾU ĐANG MỞ DANH SÁCH (LEVEL 2)
    if (showLevel2) {
        return (
            <Level2_Generic 
                isOpen={true}                        // 🟢 Mới: Bắt buộc phải có
                config={config} 
                onClose={() => setShowLevel2(false)} // 🟢 Mới: Dùng onClose thay vì onBack
                // isEmbedded={true}                 // Tùy chọn: Nếu muốn nó nằm lọt thỏm trong ô grid thay vì bung full màn hình thì bỏ comment dòng này
            />
        );
    }

    // 🟢 MẶC ĐỊNH HIỂN THỊ WIDGET (LEVEL 1)
    return (
        <Level1_Widget_Generic 
            config={config} 
            onClick={() => setShowLevel2(true)} 
        />
    );
}