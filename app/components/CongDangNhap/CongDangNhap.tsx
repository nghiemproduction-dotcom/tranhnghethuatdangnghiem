// File: app/components/CongDangNhap/CongDangNhap.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { loginWithCode } from '@/app/actions/loginWithCode'
import { useRouter } from 'next/navigation'

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CongDangNhap({ isOpen, onClose }: Props) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Tự động focus vào ô nhập khi mở modal
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Hàm xử lý khi bấm Enter hoặc nút Đăng nhập
  const handleLogin = async () => {
    if (!code.trim()) return;
    
    setLoading(true);
    setError('');

    try {
      const result = await loginWithCode(code);
      
      if (result.success && result.redirectUrl) {
        // Chuyển hướng ngay lập tức
        router.push(result.redirectUrl);
      } else {
        setError(result.message || 'Lỗi không xác định');
        setLoading(false);
        // Rung lắc ô input hoặc hiệu ứng cảnh báo (nếu muốn)
      }
    } catch (e) {
      setError('Lỗi kết nối server');
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    // 1. Lớp nền đen mờ (Backdrop)
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm transition-all duration-300">
      
      {/* 2. Hộp nhập liệu */}
      <div className="w-full max-w-md p-8 text-center animate-in fade-in zoom-in duration-300">
        
        {/* Tiêu đề / Logo */}
        <h2 className="text-2xl font-bold text-white mb-2 tracking-widest uppercase">
          Cổng Nội Bộ
        </h2>
        <p className="text-gray-400 mb-8 text-sm">Nhập mã định danh để truy cập</p>

        {/* Ô nhập liệu duy nhất */}
        <div className="relative group">
          <input
            ref={inputRef}
            type="password" // Dùng password để che mã, hoặc text nếu muốn hiện
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="MẬT MÃ..."
            className="w-full bg-transparent border-b-2 border-gray-600 text-center text-3xl text-yellow-500 font-mono py-4 focus:outline-none focus:border-yellow-500 transition-colors placeholder:text-gray-700"
            disabled={loading}
          />
          
          {/* Icon loading hoặc mũi tên */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500">
            {loading && <span className="animate-spin text-yellow-500">↻</span>}
          </div>
        </div>

        {/* Thông báo lỗi */}
        {error && (
          <div className="mt-4 text-red-500 font-medium bg-red-900/20 py-2 px-4 rounded animate-pulse">
            ⚠️ {error}
          </div>
        )}

        {/* Nút đóng (Optional - để thoát ra nếu lỡ bấm nhầm) */}
        <button 
          onClick={onClose}
          className="mt-12 text-gray-600 hover:text-white text-sm transition-colors"
        >
          QUAY LẠI TRANG CHỦ
        </button>
      </div>
    </div>
  )
}