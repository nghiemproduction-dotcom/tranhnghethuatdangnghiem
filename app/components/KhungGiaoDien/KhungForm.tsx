"use client";

/**
 * ============================================================
 * KHUNG FORM (CORE COMPONENT)
 * ============================================================
 * * Panel form inline chuẩn cho toàn hệ thống.
 * * TÍNH NĂNG TÍCH HỢP SẴN:
 * 1. Giao diện Header/Footer chuẩn.
 * 2. Xác nhận khi đóng form nếu dữ liệu thay đổi (isDirty).
 * 3. Tự động Nén ảnh (<1MB) và Upload lên Supabase (nếu có prop uploadBucket).
 */

import React, { ReactNode, useState, useRef } from "react";
import { X, Save, Loader2, User, Camera } from "lucide-react";
import { supabase } from "@/app/ThuVien/ketNoiSupabase";
import { compressImage } from "@/app/ThuVien/compressImage";

// ============================================================
// TYPES
// ============================================================

export interface KhungFormProps {
  // Data
  isEditing?: boolean;
  data?: any;
  onClose: () => void;

  // Header Info
  title?: string;
  avatar?: string; // URL ảnh hiện tại
  avatarFallback?: ReactNode;

  // 🟢 CẤU HÌNH UPLOAD ẢNH TỰ ĐỘNG
  showAvatarUpload?: boolean;
  uploadBucket?: string; // Tên bucket trên Supabase (vd: 'images')
  onUploadComplete?: (url: string) => void; // Callback trả về URL sau khi upload xong
  onAvatarChange?: (file: File | null) => void; // (Legacy) Callback trả về file thô nếu muốn tự xử lý

  // Form Actions
  onSubmit?: () => void | Promise<void>;

  // State
  loading?: boolean; // Trạng thái đang lưu form
  isDirty?: boolean; // Trạng thái đã chỉnh sửa (để hiện confirm khi đóng)

  // Content
  children: ReactNode;
  className?: string;
}

// ============================================================
// COMPONENT
// ============================================================

export default function KhungForm({
  isEditing = false,
  onClose,
  title,
  avatar,
  avatarFallback,
  showAvatarUpload = false,
  uploadBucket, // 🟢 Nhận tên bucket để kích hoạt auto-upload
  onUploadComplete,
  onAvatarChange,
  onSubmit,
  loading = false,
  isDirty = false,
  children,
  className = "",
}: KhungFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // 🟢 State nội bộ để quản lý trạng thái upload ảnh
  const [isUploading, setIsUploading] = useState(false);

  // Xử lý đóng form an toàn
  const handleClose = () => {
    if (isUploading) return; // Không cho đóng khi đang upload dở
    if (isDirty) {
      setShowConfirm(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setShowConfirm(false);
    onClose();
  };

  // Xử lý submit form
  const handleSubmit = async () => {
    if (loading || isUploading) return; // Chặn nếu đang bận
    await onSubmit?.();
  };

  // Kích hoạt input file
  const handleAvatarClick = () => {
    if (!isUploading) fileInputRef.current?.click();
  };

  // 🟢 CORE LOGIC: XỬ LÝ ẢNH (Nén -> Upload -> Lấy URL)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Preview ngay lập tức cho mượt
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);

    // 2. Nếu có cấu hình bucket -> Tự động Nén & Upload
    if (uploadBucket) {
      try {
        setIsUploading(true); // Bật loading

        // A. Nén ảnh (Giảm dung lượng để tiết kiệm băng thông và Storage)
        // Quality 0.7, Max width 1200px là đủ nét cho web
        const compressedFile = await compressImage(file, 0.7, 1200);

        // B. Tạo tên file an toàn (Timestamp + Random + Extension)
        // Thay thế các ký tự đặc biệt để tránh lỗi URL
        const safeName = file.name.replace(/[^a-zA-Z0-9]/g, "_");
        const fileName = `img_${Date.now()}_${Math.floor(
          Math.random() * 1000
        )}_${safeName}.jpg`;

        // C. Upload lên Supabase
        const { error: uploadError } = await supabase.storage
          .from(uploadBucket)
          .upload(fileName, compressedFile, {
            upsert: true,
            contentType: "image/jpeg",
          });

        if (uploadError) throw uploadError;

        // D. Lấy URL công khai
        const { data: urlData } = supabase.storage
          .from(uploadBucket)
          .getPublicUrl(fileName);

        // E. Trả về URL cho form cha để lưu vào DB
        if (onUploadComplete) {
          onUploadComplete(urlData.publicUrl);
        }
      } catch (error: any) {
        console.error("🔥 Upload failed:", error);
        alert(`Lỗi tải ảnh: ${error.message || "Vui lòng kiểm tra kết nối"}`);
        setAvatarPreview(null); // Reset preview nếu lỗi
      } finally {
        setIsUploading(false); // Tắt loading dù thành công hay thất bại
      }
    }
    // 3. Nếu không cấu hình bucket -> Trả file thô về cho cha tự xử lý (Legacy support)
    else {
      onAvatarChange?.(file);
    }
  };

  // Ảnh hiển thị: Ưu tiên Preview mới chọn > Ảnh cũ từ DB
  const displayAvatar = avatarPreview || avatar;

  return (
    <div
      className={`w-full h-full flex flex-col bg-[#050505] overflow-hidden ${className}`}
    >
      {/* ====== HEADER BAR ====== */}
      <div className="shrink-0 h-[45px] flex items-center border-b border-white/5 bg-[#0a0a0a]">
        {/* TRÁI: Nút đóng + Info */}
        <div className="shrink-0 flex items-center gap-3 px-3 border-r border-white/5">
          <button
            onClick={handleClose}
            disabled={loading || isUploading}
            className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all disabled:opacity-50"
          >
            <X size={16} />
          </button>
          <div className="flex items-center gap-2 pr-2">
            {/* Avatar Mini trên thanh header */}
            <div className="relative w-7 h-7 rounded-full border border-[#C69C6D]/50 overflow-hidden bg-[#1a1a1a] shrink-0">
              {displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#C69C6D]/50">
                  <User size={12} />
                </div>
              )}
            </div>
            <span className="text-[11px] md:text-xs font-bold text-[#C69C6D] uppercase tracking-wider truncate max-w-[150px]">
              {isEditing ? title || "CẬP NHẬT" : title || "THÊM MỚI"}
            </span>
          </div>
        </div>

        <div className="flex-1" />

        {/* PHẢI: Actions Buttons */}
        <div className="shrink-0 flex items-center gap-2 px-3 border-l border-white/5">
          <button
            onClick={handleClose}
            disabled={loading || isUploading}
            className="hidden md:block px-4 py-1.5 bg-white/5 hover:bg-white/10 text-white/60 rounded-lg text-[10px] font-bold uppercase transition-all"
          >
            HỦY BỎ
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || isUploading}
            className={`
                            px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-2
                            ${
                              loading || isUploading
                                ? "bg-white/10 text-white/50 cursor-not-allowed"
                                : "bg-[#C69C6D] hover:bg-[#b58b5d] text-black shadow-[0_0_10px_rgba(198,156,109,0.3)]"
                            }
                        `}
          >
            {loading || isUploading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            <span>
              {isUploading
                ? "ĐANG TẢI ẢNH..."
                : loading
                ? "ĐANG LƯU..."
                : "LƯU LẠI"}
            </span>
          </button>
        </div>
      </div>

      {/* Hidden Input File */}
      {showAvatarUpload && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      )}

      {/* ====== CONTENT AREA ====== */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
        {/* Khu vực Upload Ảnh Lớn */}
        {showAvatarUpload && (
          <div className="flex justify-center mb-8">
            <div
              onClick={handleAvatarClick}
              className={`
                                relative w-28 h-28 rounded-full border-2 overflow-hidden bg-[#1a1a1a] group transition-all
                                ${
                                  isUploading
                                    ? "border-[#C69C6D] cursor-wait scale-95"
                                    : "border-[#C69C6D]/30 hover:border-[#C69C6D] cursor-pointer hover:shadow-lg"
                                }
                            `}
            >
              {displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt=""
                  className={`w-full h-full object-cover transition-opacity ${
                    isUploading ? "opacity-50" : "opacity-100"
                  }`}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#C69C6D]/30">
                  <User size={40} />
                </div>
              )}

              {/* Overlay hiệu ứng */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity">
                {isUploading ? (
                  <div className="text-[#C69C6D] flex flex-col items-center gap-1">
                    <Loader2 size={24} className="animate-spin" />
                    <span className="text-[8px] font-bold uppercase">
                      Uploading...
                    </span>
                  </div>
                ) : (
                  <div className="text-white flex flex-col items-center gap-1">
                    <Camera size={24} />
                    <span className="text-[8px] font-bold uppercase">
                      Thay đổi
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Form Fields Children */}
        {children}
      </div>

      {/* ====== CONFIRM DIALOG ====== */}
      {showConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 max-w-xs w-full text-center shadow-2xl">
            <h3 className="text-white font-bold text-lg mb-2">
              Dữ liệu chưa lưu
            </h3>
            <p className="text-white/60 text-sm mb-6">
              Bạn có chắc muốn đóng không? Mọi thay đổi sẽ bị mất.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-lg bg-white/5 text-white/70 font-bold text-xs uppercase hover:bg-white/10 transition-all"
              >
                Ở Lại
              </button>
              <button
                onClick={handleConfirmClose}
                className="flex-1 py-2.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white font-bold text-xs uppercase transition-all shadow-lg shadow-red-900/20"
              >
                Đóng & Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
