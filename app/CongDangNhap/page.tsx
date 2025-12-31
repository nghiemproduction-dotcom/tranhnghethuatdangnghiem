'use client';

import React from 'react';
import CongDangNhap from './CongDangNhap';

/**
 * 🔐 TRANG CỔNG ĐĂNG NHẬP
 * Route: /CongDangNhap
 * 
 * Sử dụng component CongDangNhap đã tối ưu giao diện
 * với đầy đủ tính năng: remember me, fullscreen, redirect đúng phòng
 */
export default function TrangCongDangNhap() {
  return <CongDangNhap isGateKeeper={true} />;
}