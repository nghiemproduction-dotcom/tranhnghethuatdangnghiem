"use client";

import React, { useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  Briefcase,
  User,
  MapPin,
  CreditCard,
  Building,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  Camera,
  Banknote,
  Clock,
  Percent,
  Image as ImageIcon,
  FileText,
} from "lucide-react";
import { compressImage } from "@/app/ThuVien/compressImage";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Constants cho Dropdown giống module chính
const VN_BANKS = [
  "Vietcombank",
  "VietinBank",
  "BIDV",
  "Agribank",
  "Techcombank",
  "MBBank",
  "ACB",
  "VPBank",
  "TPBank",
  "Sacombank",
  "HDBank",
  "VIB",
  "MSB",
  "SHB",
  "SeABank",
  "OCB",
  "Eximbank",
  "LienVietPostBank",
  "Nam A Bank",
  "Viet Capital Bank",
];

const PHAN_LOAI_OPTIONS = [
  "Tiềm năng",
  "Mới",
  "Thân thiết",
  "VIP",
  "Không hoạt động",
];

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export default function RegisterForm({
  onSuccess,
  onSwitchToLogin,
}: RegisterFormProps) {
  // State
  const [userType, setUserType] = useState<"nhan_su" | "khach_hang">(
    "khach_hang"
  );

  // Common Fields
  const [hoTen, setHoTen] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Staff Specific Fields (Đồng bộ với NhanSuChucNang)
  const [viTri, setViTri] = useState("");
  const [luongThang, setLuongThang] = useState<number | "">("");
  const [thuongDoanhThu, setThuongDoanhThu] = useState<number | "">("");
  const [nganHang, setNganHang] = useState("");
  const [soTaiKhoan, setSoTaiKhoan] = useState("");

  // Customer Specific Fields (Đồng bộ với KhachHangChucNang)
  const [diaChi, setDiaChi] = useState("");
  const [phanLoai, setPhanLoai] = useState("Mới");
  const [ghiChu, setGhiChu] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper tính lương giờ (giống NhanSuChucNang)
  const luongTheoGio = luongThang
    ? Math.round(Number(luongThang) / 24 / 8 / 1000) * 1000
    : 0;

  // Xử lý chọn ảnh
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
      setAvatarFile(file);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Validate cơ bản
      if (!hoTen.trim()) throw new Error("Vui lòng nhập Họ và Tên");
      if (!email.includes("@")) throw new Error("Email không hợp lệ");
      if (phone.length < 10) throw new Error("Số điện thoại không hợp lệ");
      if (password.length < 6) throw new Error("Mật khẩu phải từ 6 ký tự");
      if (password !== confirmPassword)
        throw new Error("Mật khẩu xác nhận không khớp");

      // 2. Validate theo loại user
      if (userType === "khach_hang" && !diaChi.trim())
        throw new Error("Vui lòng nhập địa chỉ");
      if (userType === "nhan_su" && !viTri.trim())
        throw new Error("Vui lòng nhập vị trí mong muốn");

      // 3. Kiểm tra user tồn tại
      const { data: existing } = await supabase
        .from(userType)
        .select("id")
        .or(`email.eq.${email.trim()},so_dien_thoai.eq.${phone.trim()}`)
        .maybeSingle();

      if (existing) {
        throw new Error("Email hoặc Số điện thoại đã tồn tại trong hệ thống.");
      }

      // 4. Upload ảnh (nếu có)
      let avatarUrl = null;
      if (avatarFile) {
        setIsUploading(true);
        const compressed = await compressImage(avatarFile, 0.7, 800);
        const fileName = `avatar_${Date.now()}_${avatarFile.name.replace(
          /\W/g,
          ""
        )}`;
        const { error: upErr } = await supabase.storage
          .from("avatar")
          .upload(fileName, compressed);
        if (upErr) throw upErr;

        const { data: urlData } = supabase.storage
          .from("avatar")
          .getPublicUrl(fileName);
        avatarUrl = urlData.publicUrl;
        setIsUploading(false);
      }

      // 5. Tạo Auth User
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            ho_ten: hoTen,
            phone: phone,
            user_type: userType,
            waiting_approval: true,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Không thể tạo tài khoản.");

      // 6. Lưu vào bảng user_registrations
      const registrationData = {
        auth_user_id: authData.user.id,
        ho_ten: hoTen.trim(),
        email: email.trim(),
        so_dien_thoai: phone.trim(),
        user_type: userType,
        hinh_anh: avatarUrl,
        // Dữ liệu chi tiết chuẩn theo schema DB
        details:
          userType === "nhan_su"
            ? {
                vi_tri: viTri,
                luong_thang: Number(luongThang) || 0,
                thuong_doanh_thu: Number(thuongDoanhThu) || 0,
                ngan_hang: nganHang,
                so_tai_khoan: soTaiKhoan,
              }
            : {
                dia_chi: diaChi,
                phan_loai: phanLoai,
                ghi_chu: ghiChu,
              },
        status: "pending",
        created_at: new Date().toISOString(),
      };

      const { error: regError } = await supabase
        .from("user_registrations")
        .insert(registrationData);

      if (regError) {
        console.warn("Lỗi lưu đơn đăng ký:", regError);
        // Fallback logic nếu cần
      }

      setSuccess(true);
      if (onSuccess) setTimeout(onSuccess, 3000);
    } catch (err: any) {
      setError(err.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
      setIsUploading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-8 text-center animate-in zoom-in duration-300 h-full">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={40} className="text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-[#C69C6D] mb-2">
          Đăng Ký Thành Công!
        </h2>
        <p className="text-white/70 mb-6 max-w-sm">
          Hồ sơ của bạn đã được gửi. Vui lòng chờ admin xác nhận.
        </p>
        <button
          onClick={onSwitchToLogin}
          className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold transition-all"
        >
          Quay lại Đăng Nhập
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row w-full h-full overflow-hidden">
      {/* CỘT TRÁI: QUY TRÌNH (Ẩn trên mobile để tiết kiệm chỗ, hoặc thu gọn) */}
      <div className="hidden lg:flex w-1/3 bg-[#111] border-r border-[#C69C6D]/30 p-6 flex-col">
        <h3 className="text-lg font-bold text-[#C69C6D] uppercase tracking-widest mb-6 flex items-center gap-2">
          <ShieldCheck size={20} /> Quy Trình
        </h3>

        <div className="flex-1 space-y-8 relative pl-2">
          <div className="absolute left-[19px] top-2 bottom-10 w-[1px] bg-white/10 z-0"></div>

          <StepItem
            number="1"
            title="Đăng Ký"
            desc="Điền thông tin hồ sơ theo mẫu bên phải."
            active={true}
          />
          <StepItem
            number="2"
            title="Xét Duyệt"
            desc="Admin kiểm tra và phân quyền."
          />
          <StepItem
            number="3"
            title="Sử Dụng"
            desc="Đăng nhập và bắt đầu làm việc."
          />
        </div>

        <div className="mt-auto pt-6 border-t border-white/10">
          <p className="text-white/40 text-xs italic">
            * Cam kết bảo mật thông tin tuyệt đối.
          </p>
        </div>
      </div>

      {/* CỘT PHẢI: FORM NHẬP LIỆU (Cuộn dọc được) */}
      <div className="w-full lg:w-2/3 flex flex-col h-full bg-[#0a0a0a]">
        {/* Header cố định */}
        <div className="shrink-0 px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#0a0a0a]/90 backdrop-blur z-10">
          <h2 className="text-xl font-bold text-white">Đăng Ký Tài Khoản</h2>
          {onSwitchToLogin && (
            <button
              onClick={onSwitchToLogin}
              className="text-xs text-[#C69C6D] hover:underline flex items-center gap-1"
            >
              Đăng nhập <ChevronRight size={14} />
            </button>
          )}
        </div>

        {/* Form Body - Cuộn được */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {error && (
            <div className="bg-red-900/30 border border-red-500/50 p-3 rounded-lg mb-6 text-red-200 text-sm flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
              <ShieldCheck size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6 pb-10">
            {/* 1. Chọn Loại & Avatar */}
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Avatar Upload */}
              <div className="shrink-0 flex flex-col items-center gap-2">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-full border-2 border-dashed border-white/20 hover:border-[#C69C6D] flex items-center justify-center cursor-pointer overflow-hidden bg-white/5 relative group transition-all"
                >
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera
                      className="text-white/30 group-hover:text-[#C69C6D]"
                      size={32}
                    />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <ImageIcon size={20} className="text-white" />
                  </div>
                </div>
                <span className="text-[10px] text-white/40 uppercase font-bold">
                  Ảnh đại diện
                </span>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              {/* Loại tài khoản */}
              <div className="flex-1">
                <label className="block text-white/60 text-xs font-bold uppercase mb-2">
                  Bạn là ai?
                </label>
                <div className="grid grid-cols-2 gap-3 h-[88px]">
                  <TypeButton
                    active={userType === "khach_hang"}
                    onClick={() => setUserType("khach_hang")}
                    icon={User}
                    label="Khách Hàng"
                  />
                  <TypeButton
                    active={userType === "nhan_su"}
                    onClick={() => setUserType("nhan_su")}
                    icon={Briefcase}
                    label="Nhân Sự"
                  />
                </div>
              </div>
            </div>

            {/* 2. Thông tin chung */}
            <div className="space-y-4">
              <p className="text-[#C69C6D] text-xs font-bold uppercase border-b border-white/10 pb-1">
                Thông tin đăng nhập
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputGroup label="Họ và Tên" icon={User} required>
                  <input
                    className="w-full bg-transparent outline-none text-white text-sm"
                    placeholder="Nguyễn Văn A"
                    value={hoTen}
                    onChange={(e) => setHoTen(e.target.value)}
                  />
                </InputGroup>
                <InputGroup label="Số Điện Thoại" icon={Phone} required>
                  <input
                    className="w-full bg-transparent outline-none text-white text-sm"
                    placeholder="09..."
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </InputGroup>
              </div>

              <InputGroup label="Email" icon={Mail} required>
                <input
                  className="w-full bg-transparent outline-none text-white text-sm"
                  placeholder="email@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </InputGroup>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputGroup label="Mật Khẩu" icon={Lock} required>
                  <div className="relative w-full">
                    <input
                      className="w-full bg-transparent outline-none text-white text-sm pr-8"
                      placeholder="••••••"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </InputGroup>
                <InputGroup label="Xác Nhận" icon={Lock} required>
                  <input
                    className="w-full bg-transparent outline-none text-white text-sm"
                    placeholder="••••••"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </InputGroup>
              </div>
            </div>

            {/* 3. Fields riêng (Dynamic) */}
            {userType === "khach_hang" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <p className="text-[#C69C6D] text-xs font-bold uppercase border-b border-white/10 pb-1">
                  Hồ sơ khách hàng
                </p>

                <InputGroup label="Địa Chỉ Giao Hàng" icon={MapPin} required>
                  <input
                    className="w-full bg-transparent outline-none text-white text-sm"
                    placeholder="Số nhà, đường, phường, quận..."
                    value={diaChi}
                    onChange={(e) => setDiaChi(e.target.value)}
                  />
                </InputGroup>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputGroup label="Phân Loại" icon={Briefcase}>
                    <select
                      className="w-full bg-transparent outline-none text-white text-sm appearance-none"
                      value={phanLoai}
                      onChange={(e) => setPhanLoai(e.target.value)}
                    >
                      {PHAN_LOAI_OPTIONS.map((opt) => (
                        <option key={opt} value={opt} className="bg-[#111]">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </InputGroup>
                  <InputGroup label="Ghi Chú" icon={FileText}>
                    <input
                      className="w-full bg-transparent outline-none text-white text-sm"
                      placeholder="Ghi chú thêm..."
                      value={ghiChu}
                      onChange={(e) => setGhiChu(e.target.value)}
                    />
                  </InputGroup>
                </div>
              </div>
            )}

            {userType === "nhan_su" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <p className="text-[#C69C6D] text-xs font-bold uppercase border-b border-white/10 pb-1">
                  Hồ sơ nhân sự
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputGroup
                    label="Vị Trí / Chức Vụ"
                    icon={Briefcase}
                    required
                  >
                    <input
                      className="w-full bg-transparent outline-none text-white text-sm"
                      placeholder="VD: Sales, Kế toán..."
                      value={viTri}
                      onChange={(e) => setViTri(e.target.value)}
                    />
                  </InputGroup>

                  <InputGroup label="Thưởng Doanh Số (%)" icon={Percent}>
                    <input
                      type="number"
                      className="w-full bg-transparent outline-none text-white text-sm"
                      placeholder="0 - 30"
                      value={thuongDoanhThu}
                      onChange={(e) =>
                        setThuongDoanhThu(Number(e.target.value))
                      }
                      max={30}
                    />
                  </InputGroup>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputGroup label="Lương Cứng (VNĐ)" icon={Banknote}>
                    <input
                      type="number"
                      className="w-full bg-transparent outline-none text-white text-sm"
                      placeholder="10,000,000"
                      value={luongThang}
                      onChange={(e) => setLuongThang(Number(e.target.value))}
                    />
                  </InputGroup>
                  <InputGroup label="Lương Theo Giờ (Auto)" icon={Clock}>
                    <input
                      className="w-full bg-transparent outline-none text-white/50 text-sm"
                      readOnly
                      value={
                        luongTheoGio
                          ? new Intl.NumberFormat("vi-VN").format(
                              luongTheoGio
                            ) + " đ/h"
                          : "---"
                      }
                    />
                  </InputGroup>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputGroup label="Ngân Hàng" icon={Building}>
                    <select
                      className="w-full bg-transparent outline-none text-white text-sm appearance-none"
                      value={nganHang}
                      onChange={(e) => setNganHang(e.target.value)}
                    >
                      <option value="" className="bg-[#111]">
                        -- Chọn ngân hàng --
                      </option>
                      {VN_BANKS.map((bank) => (
                        <option key={bank} value={bank} className="bg-[#111]">
                          {bank}
                        </option>
                      ))}
                    </select>
                  </InputGroup>
                  <InputGroup label="Số Tài Khoản" icon={CreditCard}>
                    <input
                      className="w-full bg-transparent outline-none text-white text-sm"
                      placeholder="STK nhận lương..."
                      value={soTaiKhoan}
                      onChange={(e) => setSoTaiKhoan(e.target.value)}
                    />
                  </InputGroup>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer Action - Cố định dưới cùng */}
        <div className="shrink-0 p-6 border-t border-white/10 bg-[#0a0a0a]">
          <button
            onClick={handleRegister}
            disabled={loading || isUploading}
            className="w-full py-3.5 bg-[#C69C6D] hover:bg-white text-black font-bold uppercase tracking-widest rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(198,156,109,0.3)] flex items-center justify-center gap-2"
          >
            {loading || isUploading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <UserPlus size={18} />
            )}
            Gửi Đơn Đăng Ký
          </button>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #111;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #c69c6d;
        }
      `}</style>
    </div>
  );
}

// Sub-components
function StepItem({ number, title, desc, active }: any) {
  return (
    <div className="relative flex gap-4 z-10">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 shrink-0 transition-colors ${
          active
            ? "bg-[#C69C6D] border-[#C69C6D] text-black"
            : "bg-[#111] border-white/20 text-white/40"
        }`}
      >
        {number}
      </div>
      <div>
        <h4
          className={`text-sm font-bold ${
            active ? "text-white" : "text-white/60"
          }`}
        >
          {title}
        </h4>
        <p className="text-xs text-white/40 mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function TypeButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-4 rounded-xl border flex flex-col items-center justify-center transition-all h-full ${
        active
          ? "bg-[#C69C6D]/20 border-[#C69C6D]"
          : "bg-white/5 border-white/10 hover:bg-white/10"
      }`}
    >
      <Icon
        size={24}
        className={`mb-2 ${active ? "text-[#C69C6D]" : "text-white/50"}`}
      />
      <div
        className={`font-bold text-sm ${
          active ? "text-white" : "text-white/70"
        }`}
      >
        {label}
      </div>
    </button>
  );
}

function InputGroup({ label, icon: Icon, required, children }: any) {
  return (
    <div className="group w-full">
      <label className="block text-white/60 text-[10px] font-bold uppercase mb-1.5 ml-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus-within:border-[#C69C6D] focus-within:bg-black transition-all">
        <Icon
          size={16}
          className="text-white/30 group-focus-within:text-[#C69C6D] transition-colors shrink-0"
        />
        {children}
      </div>
    </div>
  );
}
