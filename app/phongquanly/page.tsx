'use client';

import React from 'react';
import DashboardBuilder from '@/app/GiaoDienTong/DashboardBuilder/DashboardBuilder';

export default function PhongQuanLy() {
  return (
    <DashboardBuilder 
        // 1. Định danh dữ liệu (Quan trọng để tải đúng module của phòng này)
        pageId="quanly" 
        
        // 2. Tên hiển thị trên thanh tiêu đề
        title="PHÒNG QUẢN LÝ ĐIỀU HÀNH" 
        
        // 3. Giấy phép ra vào (Quan trọng nhất)
        // Cho phép 'quanly' (từ database) và các cấp admin vào
        allowedRoles={['admin', 'adminsystem', 'quanly', 'manager', 'sep', 'boss']} 
    />
  );
}