'use client';
import DashboardBuilder from '@/app/GiaoDienTong/DashboardBuilder';

export default function PhongAdmin() {
  return (
    <DashboardBuilder 
        pageId="admin" 
        title="PHÒNG QUẢN TRỊ HỆ THỐNG" 
        allowedRoles={['admin']} // Chỉ admin mới vào được
    />
  );
}