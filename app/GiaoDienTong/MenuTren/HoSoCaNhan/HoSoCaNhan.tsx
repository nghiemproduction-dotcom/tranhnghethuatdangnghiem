"use client";

import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@/lib/UserContext";
// 🔴 [SỬA 1] Import hàm tạo client thay vì biến instance
import { createClient } from "@/utils/supabase/client"; 
import { updateProfileSelfAction } from "@/app/actions/QuyenHanQuanLy"; 
import {
  User, Phone, Mail, CreditCard, Briefcase, 
  Calendar, DollarSign, Shield, Activity, X, Edit3, Camera, Save, LogOut
} from "lucide-react";

// ============================================================
// COMPONENT HỒ SƠ CÁ NHÂN (VIEW MODE + EDIT MODE + UPLOAD)
// ============================================================

export default function HoSoCaNhan({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  // 🔴 [SỬA 2] Khởi tạo Supabase client tại đây
  const supabase = createClient(); 

  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});
  
  // 🟢 1. STATE CHẾ ĐỘ XEM/SỬA
  const [isEditing, setIsEditing] = useState(false);
  
  // 🟢 2. STATE UPLOAD ẢNH
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Load dữ liệu khi mở Modal
  useEffect(() => {
    if (isOpen && user?.email) {
      fetchMyProfile();
      setIsEditing(false); // Reset về chế độ xem khi mở lại
    }
  }, [isOpen, user]);

  const fetchMyProfile = async () => {
    setLoading(true);
    try {
      // Thử lấy nhân sự
      let { data, error } = await supabase
        .from("nhan_su")
        .select("*")
        .eq("email", user?.email)
        .single();

      // Nếu không phải nhân sự, thử lấy khách hàng
      if (!data) {
         const { data: khData } = await supabase
        .from("khach_hang")
        .select("*")
        .eq("email", user?.email)
        .single();
        data = khData;
      }

      if (data) {
        setFormData(data);
      }
    } catch (error) {
      console.error("Lỗi tải hồ sơ:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🟢 3. HÀM UPLOAD ẢNH LÊN SUPABASE
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("Vui lòng chọn ảnh.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload vào bucket 'avatars'
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Lấy URL công khai
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      // Cập nhật state hiển thị ngay
      setFormData({ ...formData, hinh_anh: data.publicUrl });
      
    } catch (error: any) {
      alert("Lỗi upload ảnh: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.id) return;
    setLoading(true);

    const safeData = {
      ho_ten: formData.ho_ten,
      so_dien_thoai: formData.so_dien_thoai,
      email: formData.email,
      // dia_chi: formData.dia_chi, // 🔴 BỎ CỘT NÀY VÌ DB KHÔNG CÓ
      ngan_hang: formData.ngan_hang,
      so_tai_khoan: formData.so_tai_khoan,
      hinh_anh: formData.hinh_anh,
    };

    // 🔴 [SỬA 3] Thêm kiểu ': any' để tránh lỗi TS nếu file action chưa cập nhật type
    const res: any = await updateProfileSelfAction(safeData);
    
    if (res.success) {
      alert("Cập nhật hồ sơ thành công!");
      setIsEditing(false); // Lưu xong chuyển về chế độ xem
    } else {
      alert("Lỗi: " + res.error);
    }
    setLoading(false);
  };

  // Helper format tiền tệ
  const formatMoney = (num: any) => {
    if(!num) return "0 ₫";
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      
      {/* KHUNG CHÍNH */}
      <div className="w-full max-w-5xl h-[90vh] bg-[#090909] rounded-2xl border border-[#C69C6D]/30 shadow-2xl flex flex-col overflow-hidden relative">
        
        {(loading || uploading) && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 border-4 border-[#C69C6D] border-t-transparent rounded-full animate-spin"/>
                    <p className="text-[#C69C6D] text-xs font-bold uppercase">{uploading ? "Đang tải ảnh..." : "Đang xử lý..."}</p>
                </div>
            </div>
        )}

        {/* HEADER */}
        <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#111]">
            <h2 className="text-lg font-black tracking-widest text-[#C69C6D] uppercase flex items-center gap-3">
                <User /> HỒ SƠ CÁ NHÂN
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="text-white/50 hover:text-white" />
            </button>
        </div>

        {/* BODY (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
            
            {/* 1. ẢNH ĐẠI DIỆN & TÊN */}
            <div className="flex flex-col items-center mb-10">
                <div className="relative group mb-4">
                    <div className="w-32 h-32 rounded-full border-4 border-[#C69C6D]/20 overflow-hidden bg-black">
                        {formData.hinh_anh ? (
                            <img src={formData.hinh_anh} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/20"><User size={64} /></div>
                        )}
                    </div>
                    
                    {/* Nút Upload chỉ hiện khi đang Edit */}
                    {isEditing && (
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Camera className="text-white mb-1" size={24} />
                        </div>
                    )}
                    {/* Input file ẩn */}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleAvatarUpload} 
                        hidden 
                        accept="image/*"
                    />
                </div>

                <h1 className="text-2xl font-bold text-white uppercase">{formData.ho_ten}</h1>
                <p className="text-[#C69C6D] font-mono text-sm mt-1 uppercase tracking-wider">{formData.vi_tri || "Thành viên"}</p>
                
                {/* Badge trạng thái */}
                <div className={`mt-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${isEditing ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500' : 'bg-green-500/10 border-green-500 text-green-500'}`}>
                    {isEditing ? "CHẾ ĐỘ CHỈNH SỬA" : "CHẾ ĐỘ XEM"}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                
                {/* --- CỘT TRÁI: THÔNG TIN CÁ NHÂN --- */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/10">
                        <User className="text-[#C69C6D]" size={20} />
                        <h3 className="text-sm font-bold text-white/80 uppercase">Thông Tin Cơ Bản</h3>
                    </div>

                    <InputGroup label="Họ và Tên" icon={User} 
                        value={formData.ho_ten} 
                        // Chỉ cho sửa khi isEditing = true
                        readOnly={!isEditing}
                        onChange={(v: string) => setFormData({...formData, ho_ten: v})} 
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="Số điện thoại" icon={Phone} 
                            value={formData.so_dien_thoai} 
                            readOnly={!isEditing}
                            onChange={(v: string) => setFormData({...formData, so_dien_thoai: v})} 
                        />
                         <InputGroup label="Email Đăng nhập" icon={Mail} 
                            value={formData.email} 
                            readOnly={!isEditing}
                            onChange={(v: string) => setFormData({...formData, email: v})} 
                        />
                    </div>

                    {/* Đã bỏ cột Địa chỉ vì DB không có */}

                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="Ngân hàng" icon={CreditCard} 
                            value={formData.ngan_hang} 
                            readOnly={!isEditing}
                            onChange={(v: string) => setFormData({...formData, ngan_hang: v})} 
                            placeholder="VD: Vietcombank"
                        />
                        <InputGroup label="Số tài khoản" icon={CreditCard} 
                            value={formData.so_tai_khoan} 
                            readOnly={!isEditing}
                            onChange={(v: string) => setFormData({...formData, so_tai_khoan: v})} 
                        />
                    </div>
                </div>

                {/* --- CỘT PHẢI: THÔNG TIN HỆ THỐNG (LUÔN KHÓA) --- */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/10">
                        <Shield className="text-red-500" size={20} />
                        <h3 className="text-sm font-bold text-white/80 uppercase">Thông Tin Hợp Đồng (Hệ thống)</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="Chức vụ / Vị trí" icon={Briefcase} 
                            value={formData.vi_tri} readOnly 
                        />
                        <InputGroup label="Mã vị trí (System)" icon={Shield} 
                            value={formData.vi_tri_normalized} readOnly 
                        />
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 space-y-4">
                        <InputGroup label="Lương Cố Định" icon={DollarSign} 
                            value={formatMoney(formData.luong_thang)} readOnly highlight
                        />
                        <InputGroup label="% Thưởng Doanh Thu" icon={Activity} 
                            value={`${formData.thuong_doanh_thu || 0}%`} readOnly highlight
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="Trạng thái" icon={Activity} 
                            value={formData.trang_thai === 'dang_lam_viec' ? 'Đang làm việc' : formData.trang_thai} readOnly 
                        />
                        <InputGroup label="Ngày tham gia" icon={Calendar} 
                            value={formData.tao_luc ? new Date(formData.tao_luc).toLocaleDateString('vi-VN') : "---"} readOnly 
                        />
                    </div>
                </div>

            </div>
        </div>

        {/* FOOTER ACTIONS - THAY ĐỔI THEO CHẾ ĐỘ */}
        <div className="p-6 border-t border-white/10 bg-[#111] flex justify-end gap-4">
            
            {/* Chế độ XEM: Nút Đóng + Nút Sửa */}
            {!isEditing ? (
                <>
                    <button 
                        onClick={onClose}
                        className="px-6 py-3 rounded-lg font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all"
                    >
                        Đóng
                    </button>
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="px-8 py-3 rounded-lg font-bold text-black bg-[#C69C6D] hover:bg-[#dabba0] shadow-[0_0_20px_rgba(198,156,109,0.3)] transition-all flex items-center gap-2"
                    >
                        <Edit3 size={18} /> CHỈNH SỬA
                    </button>
                </>
            ) : (
                /* Chế độ SỬA: Nút Hủy + Nút Lưu */
                <>
                    <button 
                        onClick={() => {
                            setIsEditing(false); // Hủy sửa
                            fetchMyProfile(); // Reset data cũ
                        }}
                        className="px-6 py-3 rounded-lg font-bold text-red-400 hover:bg-red-500/10 transition-all flex items-center gap-2"
                    >
                        <X size={18} /> Hủy bỏ
                    </button>
                    <button 
                        onClick={handleSave}
                        className="px-8 py-3 rounded-lg font-bold text-black bg-green-500 hover:bg-green-400 shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all flex items-center gap-2"
                    >
                        <Save size={18} /> LƯU THAY ĐỔI
                    </button>
                </>
            )}
        </div>

      </div>
    </div>
  );
}

// 🟢 COMPONENT CON: INPUT GROUP
function InputGroup({ 
    label, icon: Icon, value, onChange, type = "text", 
    readOnly = false, isTextArea = false, placeholder = "", highlight = false 
}: any) {
    
    const baseClass = `w-full px-4 py-3 rounded-lg border outline-none transition-all flex items-center gap-3 `;
    
    // Style khác nhau giữa ReadOnly (Xem) và Editable (Sửa)
    const stateClass = readOnly 
        ? `bg-transparent border-transparent text-white/70 cursor-default font-medium ${highlight ? 'text-[#C69C6D] font-bold text-lg' : ''}` // View Mode: Nhìn như text thường
        : `bg-white/5 border-white/10 text-white focus:border-[#C69C6D]/50 focus:bg-white/10 shadow-inner`; // Edit Mode: Nhìn như Input

    return (
        <div className="group">
            <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${readOnly ? 'text-white/30' : 'text-[#C69C6D]/80'}`}>
                {label} {readOnly && highlight && <span className="text-white/20 ml-1">★</span>}
            </label>
            
            {isTextArea ? (
                <textarea 
                    value={value || ""}
                    onChange={e => !readOnly && onChange && onChange(e.target.value)}
                    readOnly={readOnly}
                    rows={2}
                    className={`${baseClass} ${stateClass} resize-none`}
                    placeholder={!readOnly ? placeholder : ""}
                />
            ) : (
                <div className={`relative flex items-center ${readOnly ? '' : ''}`}>
                    {/* Icon mờ đi khi ở chế độ xem để đỡ rối */}
                    <div className={`absolute left-4 ${readOnly ? 'text-white/20' : 'text-[#C69C6D]/70'}`}><Icon size={16} /></div>
                    <input 
                        type={type}
                        value={value || ""}
                        onChange={e => !readOnly && onChange && onChange(e.target.value)}
                        readOnly={readOnly}
                        className={`${baseClass} ${stateClass} pl-12`}
                        placeholder={!readOnly ? placeholder : ""}
                    />
                </div>
            )}
            
            {/* Gạch chân mờ khi ở chế độ xem để phân cách dòng */}
            {readOnly && !highlight && <div className="h-px bg-white/5 w-full mt-1"></div>}
        </div>
    )
}