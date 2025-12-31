'use client';

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Mail, Phone, Lock, Eye, EyeOff, UserPlus, Users, Briefcase } from 'lucide-react';
import { DataNormalizer } from '@/app/ThuVien/DataNormalizer';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export default function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [userType, setUserType] = useState<'nhan_su' | 'khach_hang'>('khach_hang');
  
  const [hoTen, setHoTen] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [requestedViTri, setRequestedViTri] = useState('Sales'); // For nhan_su
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Frontend validation
      if (!hoTen || hoTen.length < 3) {
        setError('Họ tên phải có ít nhất 3 ký tự');
        setLoading(false);
        return;
      }

      if (!email || !email.includes('@')) {
        setError('Email không hợp lệ');
        setLoading(false);
        return;
      }

      if (!phone || phone.length < 10) {
        setError('Số điện thoại không hợp lệ');
        setLoading(false);
        return;
      }

      if (!password || password.length < 6) {
        setError('Mật khẩu phải có ít nhất 6 ký tự');
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError('Mật khẩu xác nhận không khớp');
        setLoading(false);
        return;
      }

      // Check if user already exists (direct query)
      const { data: existingNhanSu } = await supabase
        .from('nhan_su')
        .select('id')
        .or(`email.eq.${email.trim().toLowerCase()},so_dien_thoai.eq.${phone.trim()}`)
        .single();

      if (existingNhanSu) {
        setError('Email hoặc số điện thoại đã được sử dụng');
        setLoading(false);
        return;
      }

      const { data: existingKhachHang } = await supabase
        .from('khach_hang')
        .select('id')
        .or(`email.eq.${email.trim().toLowerCase()},so_dien_thoai.eq.${phone.trim()}`)
        .single();

      if (existingKhachHang) {
        setError('Email hoặc số điện thoại đã được sử dụng');
        setLoading(false);
        return;
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim(),
      });

      if (authError) {
        setError('Lỗi đăng ký: ' + authError.message);
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setError('Không thể tạo tài khoản');
        setLoading(false);
        return;
      }

      // Create registration request
      const { error: regError } = await supabase.from('user_registrations').insert({
        auth_user_id: authData.user.id,
        ho_ten: hoTen.trim(),
        email: email.trim().toLowerCase(),
        so_dien_thoai: phone.trim(),
        user_type: userType,
        requested_vi_tri: userType === 'nhan_su' ? requestedViTri : null,
        requested_phan_loai: userType === 'khach_hang' ? 'KH Trọng tâm' : null,
        status: 'pending',
      });

      if (regError) {
        setError('Lỗi tạo đơn đăng ký: ' + regError.message);
        setLoading(false);
        return;
      }

      // Success
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
      }, 3000);
    } catch (err: any) {
      setError('Lỗi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md bg-[#1a120f] border border-[#C69C6D]/30 rounded-xl p-8 shadow-2xl text-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserPlus size={32} className="text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-[#C69C6D] mb-2">Đăng ký thành công!</h2>
        <p className="text-white/70 text-sm mb-4">
          Đơn đăng ký của bạn đã được gửi. Vui lòng chờ admin xét duyệt.
        </p>
        <p className="text-white/50 text-xs">Bạn sẽ nhận được email thông báo khi tài khoản được kích hoạt.</p>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="w-full max-w-md bg-[#1a120f] border border-[#C69C6D]/30 rounded-xl p-8 shadow-2xl">
        <h2 className="text-3xl font-bold text-[#C69C6D] mb-2 text-center">Đăng ký tài khoản</h2>
        <p className="text-white/50 text-sm text-center mb-6">Chọn loại tài khoản bạn muốn đăng ký</p>

        <div className="space-y-4">
          <button
            onClick={() => {
              setUserType('khach_hang');
              setStep(2);
            }}
            className="w-full bg-white/5 hover:bg-[#C69C6D]/20 border border-[#C69C6D]/30 hover:border-[#C69C6D] rounded-xl p-6 transition-all active:scale-95 group"
          >
            <Users size={32} className="text-[#C69C6D] mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-bold text-lg mb-1">Khách hàng</h3>
            <p className="text-white/50 text-sm">Dành cho khách hàng mua hàng, xem sản phẩm</p>
          </button>

          <button
            onClick={() => {
              setUserType('nhan_su');
              setStep(2);
            }}
            className="w-full bg-white/5 hover:bg-[#C69C6D]/20 border border-[#C69C6D]/30 hover:border-[#C69C6D] rounded-xl p-6 transition-all active:scale-95 group"
          >
            <Briefcase size={32} className="text-[#C69C6D] mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-bold text-lg mb-1">Nhân sự</h3>
            <p className="text-white/50 text-sm">Dành cho nhân viên, quản lý, admin</p>
          </button>
        </div>

        {onSwitchToLogin && (
          <div className="mt-6 text-center">
            <p className="text-white/50 text-sm">
              Đã có tài khoản?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-[#C69C6D] hover:text-white font-bold transition-colors"
              >
                Đăng nhập ngay
              </button>
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-[#1a120f] border border-[#C69C6D]/30 rounded-xl p-8 shadow-2xl">
      <button
        onClick={() => setStep(1)}
        className="text-white/50 hover:text-white text-sm mb-4 transition-colors"
      >
        ← Quay lại
      </button>

      <h2 className="text-3xl font-bold text-[#C69C6D] mb-2 text-center">
        Đăng ký {userType === 'nhan_su' ? 'Nhân sự' : 'Khách hàng'}
      </h2>
      <p className="text-white/50 text-sm text-center mb-6">Điền thông tin của bạn</p>

      {error && (
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-3 mb-4 text-red-200 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-white/70 text-sm font-bold mb-2">Họ và tên</label>
          <input
            type="text"
            value={hoTen}
            onChange={(e) => setHoTen(e.target.value)}
            placeholder="Nguyễn Văn A"
            className="w-full bg-black/40 border border-[#8B5E3C]/30 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#C69C6D] transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-white/70 text-sm font-bold mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            className="w-full bg-black/40 border border-[#8B5E3C]/30 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#C69C6D] transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-white/70 text-sm font-bold mb-2">Số điện thoại</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0123456789"
            className="w-full bg-black/40 border border-[#8B5E3C]/30 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#C69C6D] transition-all"
            required
          />
        </div>

        {userType === 'nhan_su' && (
          <div>
            <label className="block text-white/70 text-sm font-bold mb-2">Vị trí mong muốn</label>
            <select
              value={requestedViTri}
              onChange={(e) => setRequestedViTri(e.target.value)}
              className="w-full bg-black/40 border border-[#8B5E3C]/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#C69C6D] transition-all"
            >
              <option value="Sales">Sales</option>
              <option value="Quản lý">Quản lý</option>
            </select>
            <p className="text-white/40 text-xs mt-1">* Vị trí Admin do admin chỉ định</p>
          </div>
        )}

        <div>
          <label className="block text-white/70 text-sm font-bold mb-2">Mật khẩu</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-black/40 border border-[#8B5E3C]/30 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#C69C6D] transition-all pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-white/70 text-sm font-bold mb-2">Xác nhận mật khẩu</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-black/40 border border-[#8B5E3C]/30 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#C69C6D] transition-all"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#C69C6D] hover:bg-[#B58B5D] text-black font-bold py-3 rounded-lg uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              Đang đăng ký...
            </>
          ) : (
            <>
              <UserPlus size={18} />
              Đăng ký
            </>
          )}
        </button>
      </form>
    </div>
  );
}
