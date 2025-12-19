'use client';

import React from 'react';
import DashboardBuilder from '@/app/GiaoDienTong/DashboardBuilder/DashboardBuilder';

export default function PhongDemo() {
  return (
    <DashboardBuilder 
        // 1. Định danh
        pageId="demo" 
        
        // 2. Tên hiển thị
        title="PHÒNG DEMO TÍNH NĂNG" 
        
        // 3. Cấp quyền (Demo thường mở cho tất cả hoặc chỉ Admin tùy bạn)
        // Ở đây tôi để full quyền các vị trí để dễ test
        allowedRoles={[
            'admin', 'adminsystem', 
            'quanly', 'manager', 
            'sales', 'kinhdoanh', 
            'tho', 'thosanxuat', 
            'parttime', 'congtacvien'
        ]} 
    />
  );
}