"use client";

import React, { useState } from "react";
import { Plus, Link as LinkIcon, Trash2, Type } from "lucide-react";
import { KhungForm } from "@/app/components/cacchucnang/KhungGiaoDienChucNang";
import { MauThietKe, createMauThietKeConfig } from "./config";

interface Props {
  data: MauThietKe | null; // null = Tạo mới
  onClose: () => void;
  onSuccess: () => void;
}

// 1. Định nghĩa kiểu dữ liệu cho file thiết kế
interface FileItem {
  ten: string;
  url: string;
}

// 2. Định nghĩa kiểu State cho Form (Tránh xung đột Type)
interface FormState extends Omit<Partial<MauThietKe>, "file_thiet_ke"> {
  file_thiet_ke: FileItem[];
}

export default function MauThietKeForm({
  data,
  onClose,
  onSuccess,
}: Props) {
  const config = createMauThietKeConfig();

  // 3. Khởi tạo state
  const [formData, setFormData] = useState<FormState>(() => {
    let files: FileItem[] = [];

    // Logic parse dữ liệu cũ
    if (data && (data as any).file_thiet_ke) {
      try {
        const raw = (data as any).file_thiet_ke;
        let parsed: any[] = [];

        if (Array.isArray(raw)) {
          parsed = raw;
        } else if (typeof raw === "string") {
          parsed = JSON.parse(raw);
        }

        // Convert sang chuẩn { ten, url }
        files = parsed.map((item: any) => {
          if (typeof item === "string") return { ten: "", url: item };
          if (typeof item === "object")
            return { ten: item.ten || "", url: item.url || "" };
          return { ten: "", url: "" };
        });
      } catch {}
    }

    return data ? { ...data, file_thiet_ke: files } : { file_thiet_ke: [] };
  });

  // --- HANDLERS ---

  const handleChange = (field: keyof FormState, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (
    index: number,
    field: keyof FileItem,
    value: string
  ) => {
    const newFiles = [...formData.file_thiet_ke];
    if (!newFiles[index]) return;
    newFiles[index] = { ...newFiles[index], [field]: value };
    setFormData((prev) => ({ ...prev, file_thiet_ke: newFiles }));
  };

  const addFileRow = () => {
    setFormData((prev) => ({
      ...prev,
      file_thiet_ke: [...prev.file_thiet_ke, { ten: "", url: "" }],
    }));
  };

  const removeFileRow = (index: number) => {
    const newFiles = [...formData.file_thiet_ke];
    newFiles.splice(index, 1);
    setFormData((prev) => ({ ...prev, file_thiet_ke: newFiles }));
  };

  return (
    <KhungForm
      isEditing={!!data}
      data={formData}
      onClose={onClose}
      title={data ? "SỬA MẪU" : "THÊM MẪU MỚI"}
      
      // 🟢 Cấu hình Upload
      showAvatarUpload={true}
      uploadBucket="images"
      avatar={formData.hinh_anh}
      onUploadComplete={(url: string) => handleChange("hinh_anh", url)}

      // 🟢 SMART SAVE ACTION
      action={{
        validate: (currData: FormState) => {
            // 1. Validate thông tin chung
            if (!currData.mo_ta?.trim()) return "Vui lòng nhập Tên mẫu thiết kế!";
            if (!currData.phan_loai) return "Vui lòng chọn Phân loại!";

            // 2. Validate file
            const validFiles = currData.file_thiet_ke.filter(
                (f) => f.ten.trim() !== "" || f.url.trim() !== ""
            );
            const hasError = validFiles.some(
                (f) => f.ten.trim() === "" || f.url.trim() === ""
            );

            if (hasError) {
                return "Vui lòng nhập đầy đủ TÊN HIỂN THỊ và ĐƯỜNG DẪN cho file thiết kế!";
            }
            return null;
        },
        onSave: async (currData: FormState) => {
            // Lọc bỏ các dòng file rỗng
            const validFiles = currData.file_thiet_ke.filter(
                (f) => f.ten.trim() !== "" || f.url.trim() !== ""
            );

            // 🟢 FIX LỖI TYPE: Ép kiểu as any để TS không bắt lỗi FileItem[] vs string[]
            // Đồng thời JSON.stringify để lưu vào DB an toàn
            const finalData = {
                ...currData,
                file_thiet_ke: JSON.stringify(validFiles) as any, 
            };

            if (data?.id) {
                return await config.dataSource?.update?.(data.id, finalData);
            } else {
                return await config.dataSource?.create?.(finalData);
            }
        },
        onSuccess: onSuccess
      }}

      isDirty={true}
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
            onChange={(e) => handleChange("mo_ta", e.target.value)}
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
              onChange={(e) => handleChange("phan_loai", e.target.value)}
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

        {/* File Thiết Kế */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-white/60 uppercase">
              File Thiết Kế (Google Drive)
            </label>
            <button
              type="button"
              onClick={addFileRow}
              className="flex items-center gap-1 text-[10px] bg-[#C69C6D]/20 text-[#C69C6D] hover:bg-[#C69C6D] hover:text-black px-2 py-1 rounded transition-all font-bold"
            >
              <Plus size={12} /> THÊM FILE
            </button>
          </div>

          <div className="space-y-2">
            {formData.file_thiet_ke.map((file, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                {/* Tên */}
                <div className="w-1/3 relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
                    <Type size={14} />
                  </div>
                  <input
                    className={`w-full bg-white/5 border rounded-lg pl-9 pr-3 py-2.5 text-white text-xs outline-none placeholder-white/20 transition-all ${
                      file.ten.trim() === "" && file.url.trim() !== ""
                        ? "border-red-500/50 focus:border-red-500"
                        : "border-white/10 focus:border-[#C69C6D]"
                    }`}
                    placeholder="Tên hiển thị..."
                    value={file.ten}
                    onChange={(e) =>
                      handleFileChange(idx, "ten", e.target.value)
                    }
                  />
                </div>
                {/* Link */}
                <div className="flex-1 relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#C69C6D] transition-colors">
                    <LinkIcon size={14} />
                  </div>
                  <input
                    className={`
                        w-full bg-white/5 border rounded-lg pl-9 pr-4 py-2.5 text-white text-xs outline-none placeholder-white/20 transition-all
                        ${
                          file.url.trim() === "" && file.ten.trim() !== ""
                            ? "border-red-500/50 focus:border-red-500"
                            : "border-white/10 focus:border-[#C69C6D]"
                        }
                    `}
                    value={file.url}
                    onChange={(e) =>
                      handleFileChange(idx, "url", e.target.value)
                    }
                    placeholder="Dán link Google Drive..."
                  />
                </div>
                {/* Xóa */}
                <button
                  type="button"
                  onClick={() => removeFileRow(idx)}
                  className="p-2 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0 mt-[2px]"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            {formData.file_thiet_ke.length === 0 && (
              <div
                onClick={addFileRow}
                className="text-[10px] text-white/20 italic text-center py-3 border border-dashed border-white/10 rounded-lg cursor-pointer hover:border-white/30 transition-colors"
              >
                Chưa có file nào. Nhấn để thêm.
              </div>
            )}
          </div>
        </div>
      </div>
    </KhungForm>
  );
}