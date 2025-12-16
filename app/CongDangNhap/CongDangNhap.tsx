'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../ThuVien/ketNoiSupabase'; 
import { X } from 'lucide-react';

import NenHieuUng from './NenHieuUng';
import TieuDe from './TieuDe';
import ONhapLieu from './ONhapLieu';
import NutXacNhan from './NutXacNhan';
import ChanForm from './ChanForm';

export default function CongDangNhap({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const router = useRouter();
  
  const [user, setUser] = useState({ name: '', pass: '' });
  const [flags, setFlags] = useState({ showPass: false, loading: false, anim: false });
  const [isError, setIsError] = useState(false);

  const isModal = typeof isOpen === 'boolean';
  
  useEffect(() => {
    if (isOpen) setTimeout(() => setFlags(p => ({...p, anim: true})), 50);
    else setFlags(p => ({...p, anim: false}));
  }, [isOpen]);

  if (isModal && !isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFlags(p => ({...p, loading: true})); 
    setIsError(false);

    const email = user.name.trim();
    const pass = user.pass;

    // 1. CỬA SAU ADMIN (Giữ nguyên để ông test nhanh)
    if (email === 'admin' && pass === 'admin') {
        if (typeof window !== 'undefined') {
            localStorage.setItem('LA_ADMIN_CUNG', 'true');
            localStorage.setItem('USER_ROLE', 'admin'); // Lưu quyền admin
        }
        setTimeout(() => { router.replace('/phongquanly'); setFlags(p => ({...p, loading: false})); }, 800);
        return;
    }

    // 2. ĐĂNG NHẬP HỆ THỐNG
    try {
        // Bước A: Xác thực Auth
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (authError) throw authError;

        // Bước B: Lấy thông tin vị trí từ bảng nhan_su
        // 🟢 LƯU Ý: Đảm bảo cột trong DB tên là 'vi_tri' (như hình ông gửi)
        const { data: nhanVien, error: dbError } = await supabase
            .from('nhan_su')
            .select('vi_tri') 
            .eq('email', email)
            .single();

        if (dbError || !nhanVien) throw new Error("Không tìm thấy thông tin nhân sự");

        // Chuẩn hóa vị trí (về chữ thường, bỏ khoảng trắng)
        const viTri = (nhanVien.vi_tri || '').toLowerCase().trim();

        // 🟢 LƯU QUYỀN VÀO MÁY (Để các phòng khác check bảo mật)
        localStorage.removeItem('LA_ADMIN_CUNG'); // Xóa admin cứng
        localStorage.setItem('USER_ROLE', viTri);

        console.log(`Đăng nhập thành công. Vị trí: ${viTri}`);

        // 🟢 BƯỚC C: ĐIỀU PHỐI VỀ ĐÚNG PHÒNG
        switch (viTri) {
            case 'admin':
            case 'quanly':
            case 'manager':
                // Admin/Quản lý -> Vào thẳng đầu não
                router.replace('/phongquanly');
                break;

            case 'sales':
                // Sales -> Vào phòng Sales (Được đi các phòng khác trừ quản lý - xử lý ở middleware sau)
                router.replace('/phongsales');
                break;

            case 'thosanxuat':
                // Thợ sản xuất -> Vào phòng Sản Xuất
                router.replace('/phongsanxuat');
                break;

            case 'parttime':
                // Parttime -> Vào phòng Parttime
                router.replace('/phongparttime');
                break;

            case 'congtacvien':
                // Cộng tác viên -> Vào phòng CTV
                router.replace('/phongcongtacvien');
                break;

            default:
                // Nếu không có chức vụ cụ thể -> Về trang chủ xem tranh
                console.log("Chức vụ không xác định, về trang chủ.");
                router.replace('/'); 
        }
        
        router.refresh();

    } catch (err: any) { 
        console.error("Lỗi:", err.message);
        alert(`Đăng nhập thất bại: ${err.message}`); 
        setIsError(true); 
    } finally { 
        setFlags(p => ({...p, loading: false})); 
    }
  };

  const handleClose = () => { 
      setFlags(p => ({...p, anim: false})); 
      setTimeout(() => onClose && onClose(), 300); 
  };
  
  const handleRegister = () => alert("Vui lòng liên hệ Quản lý để cấp tài khoản.");
  const handleForgot = () => alert("Vui lòng liên hệ Quản lý để cấp lại mật khẩu.");

  return (
    <div className={`fixed inset-0 z-[9999] w-screen h-[100dvh] font-sans text-white overflow-hidden bg-black/90 backdrop-blur-sm`}>
      <div className="opacity-50"><NenHieuUng isModalMode={isModal} /></div>

      <div className={`relative w-full h-full transition-all duration-700 ease-out transform ${isModal ? (flags.anim ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-xl scale-110') : 'opacity-100'}`}>
        
        {isModal && (
            <button onClick={handleClose} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors p-2 z-50 bg-black/20 rounded-full">
                <X size={32} strokeWidth={1.5} />
            </button>
        )}

        <form onSubmit={handleSubmit} className="w-full h-full flex flex-col justify-between items-center py-8 md:py-12">
            <div className="flex-none h-10 md:h-16" /> 

            <div className="flex-1 w-full max-w-[420px] flex flex-col justify-center px-8 gap-8 md:gap-10">
                <div className={`${isError ? 'animate-shake' : ''}`}>
                    <TieuDe />
                </div>

                <div className={`flex flex-col gap-6 ${isError ? 'animate-shake' : ''}`}>
                    <ONhapLieu id="inp_email" label="EMAIL" value={user.name} onChange={v => setUser(p => ({...p, name: v}))} />
                    <ONhapLieu id="inp_pass" label="PASSWORD" value={user.pass} onChange={v => setUser(p => ({...p, pass: v}))} showEye={true} isPasswordVisible={flags.showPass} onToggleEye={() => setFlags(p => ({...p, showPass: !p.showPass}))} />
                    <ChanForm onRegisterClick={handleRegister} onForgotPasswordClick={handleForgot} />
                </div>
            </div>

            <div className="flex-none w-full flex justify-center pb-4 md:pb-8">
                 <NutXacNhan isLoading={flags.loading} />
            </div>
        </form>
      </div>
      <style jsx global>{` @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } } .animate-shake { animation: shake 0.3s ease-in-out; } `}</style>
    </div>
  );
}