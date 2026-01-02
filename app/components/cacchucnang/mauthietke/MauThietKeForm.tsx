"use client";

import React, { useState } from "react";
import { Plus, Link as LinkIcon, Trash2 } from "lucide-react";
import { KhungForm } from "@/app/components/KhungGiaoDien";
import { MauThietKe, createMauThietKeConfig } from "./config";

interface Props {
  data: MauThietKe | null; // null = Tạo mới
  onClose: () => void;
  onSubmit: (formData: any) => Promise<void>;
  loading: boolean;
}

export default function MauThietKeForm({
  data,
  onClose,
  onSubmit,
  loading,
}: Props) {
  const config = createMauThietKeConfig();

  // Khởi tạo state form
  const [formData, setFormData] = useState<
    Partial<MauThietKe> & { file_thiet_ke?: string[] }
  >(() => {
    // Parse file_thiet_ke từ JSON nếu có
    let files: string[] = [];
    if (data && (data as any).file_thiet_ke) {
      try {
        files = Array.isArray((data as any).file_thiet_ke)
          ? (data as any).file_thiet_ke
          : JSON.parse((data as any).file_thiet_ke);
      } catch {}
    }
    // 🟢 SỬA: Không tự động push dòng trống [""] nữa để tránh lỗi validate oan
    // Người dùng muốn thêm thì bấm nút (+)
    return data ? { ...data, file_thiet_ke: files } : { file_thiet_ke: [] };
  });

  // Handlers cho File Thiết Kế
  const handleFileUrlChange = (index: number, value: string) => {
    const newFiles = [...(formData.file_thiet_ke || [])];
    newFiles[index] = value;
    setFormData({ ...formData, file_thiet_ke: newFiles });
  };

  const addFileUrl = () => {
    setFormData({
      ...formData,
      file_thiet_ke: [...(formData.file_thiet_ke || []), ""],
    });
  };

  const removeFileUrl = (index: number) => {
    const newFiles = [...(formData.file_thiet_ke || [])];
    newFiles.splice(index, 1);
    setFormData({ ...formData, file_thiet_ke: newFiles });
  };

  const handleSubmit = async () => {
    // 🟢 1. VALIDATE CƠ BẢN
    if (!formData.mo_ta?.trim()) {
      alert("Vui lòng nhập Tên mẫu thiết kế!");
      return;
    }
    if (!formData.phan_loai) {
      alert("Vui lòng chọn Phân loại!");
      return;
    }

    // 🟢 2. VALIDATE FILE THIẾT KẾ (BẮT BUỘC KHÔNG ĐƯỢC RỖNG)
    const currentFiles = formData.file_thiet_ke || [];
    // Kiểm tra xem có dòng nào chứa chuỗi rỗng không
    const hasEmptyUrl = currentFiles.some((url) => url.trim() === "");

    if (hasEmptyUrl) {
      alert(
        "Vui lòng điền đầy đủ đường dẫn File Thiết Kế hoặc xóa các dòng trống!"
      );
      return; // Chặn lưu
    }

    // Nếu mọi thứ ok -> Submit (Gửi nguyên mảng đã validate)
    await onSubmit(formData);
  };

  return (
    <KhungForm
      onClose={onClose}
      title={data ? "SỬA MẪU" : "THÊM MẪU MỚI"}
      onSubmit={handleSubmit}
      loading={loading}
      isDirty={true} // Luôn bật confirm close
      // Auto Upload Config
      showAvatarUpload={true}
      uploadBucket="images"
      avatar={formData.hinh_anh}
      onUploadComplete={(url) =>
        setFormData((prev) => ({ ...prev, hinh_anh: url }))
      }
    >
      <div className="space-y-4">
        {/* Tên mẫu */}
        <div>
          <label className="text-xs font-bold text-white/60 mb-2 block uppercase">
            Tên mẫu thiết kế <span className="text-red-500">*</span>
          </label>
          <input
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#C69C6D] outline-none placeholder-white/20"
            value={formData.mo_ta || ""}
            onChange={(e) =>
              setFormData({ ...formData, mo_ta: e.target.value })
            }
            placeholder="Nhập tên mẫu..."
          />
        </div>

        {/* Phân loại */}
        <div>
          <label className="text-xs font-bold text-white/60 mb-2 block uppercase">
            Phân loại <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              className="w-full bg-[#1a1a1a] text-white border border-white/10 rounded-lg px-4 py-3 focus:border-[#C69C6D] outline-none appearance-none"
              value={formData.phan_loai || ""}
              onChange={(e) =>
                setFormData({ ...formData, phan_loai: e.target.value })
              }
            >
              <option value="" className="bg-[#1a1a1a] text-gray-500">
                -- Chọn loại --
              </option>
              {config.fields
                .find((f) => f.key === "phan_loai")
                ?.options?.map((opt: any) => (
                  <option
                    key={opt}
                    value={opt}
                    className="bg-[#1a1a1a] text-white py-2"
                  >
                    {opt}
                  </option>
                ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50 text-xs">
              ▼
            </div>
          </div>
        </div>

        {/* File Thiết Kế (Multi-URL) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-white/60 uppercase">
              File Thiết Kế (Google Drive)
            </label>
            <button
              type="button"
              onClick={addFileUrl}
              className="flex items-center gap-1 text-[10px] bg-[#C69C6D]/20 text-[#C69C6D] hover:bg-[#C69C6D] hover:text-black px-2 py-1 rounded transition-all font-bold"
            >
              <Plus size={12} /> THÊM LINK
            </button>
          </div>

          <div className="space-y-2">
            {(formData.file_thiet_ke || []).map((url, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <div className="flex-1 relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#C69C6D] transition-colors">
                    <LinkIcon size={14} />
                  </div>
                  {/* Ô nhập liệu có viền đỏ nếu rỗng (tuỳ chọn UI, ở đây dùng border chuẩn) */}
                  <input
                    className={`
                        w-full bg-white/5 border rounded-lg pl-9 pr-4 py-2.5 text-white text-xs outline-none placeholder-white/20 transition-all
                        ${
                          url.trim() === ""
                            ? "border-red-500/50 focus:border-red-500"
                            : "border-white/10 focus:border-[#C69C6D]"
                        }
                    `}
                    value={url}
                    onChange={(e) => handleFileUrlChange(idx, e.target.value)}
                    placeholder="Dán link Google Drive..."
                    autoFocus={url === ""} // Tự focus vào dòng mới
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeFileUrl(idx)}
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {(formData.file_thiet_ke || []).length === 0 && (
              <div className="text-[10px] text-white/20 italic text-center py-2 border border-dashed border-white/10 rounded-lg">
                Chưa có link thiết kế nào.
              </div>
            )}
          </div>
        </div>
      </div>
    </KhungForm>
  );
}
