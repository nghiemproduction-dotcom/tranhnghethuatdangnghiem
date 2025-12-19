'use client';

import React from 'react';
import DashboardBuilder from '@/app/GiaoDienTong/DashboardBuilder/DashboardBuilder';

export default function PhongThietKePage() {
  return (
    <DashboardBuilder 
        // 1. ID duy nhất cho phòng này
        pageId="phong_thiet_ke" 
        
        // 2. Tiêu đề hiển thị
        title="Phòng Thiết Kế Sáng Tạo" 
        
        // 3. Ai được vào?
        allowedRoles={['admin', 'adminsystem', 'quanly', 'thietke', 'designer', 'hoa_si', 'boss']} 
    />
  );
}