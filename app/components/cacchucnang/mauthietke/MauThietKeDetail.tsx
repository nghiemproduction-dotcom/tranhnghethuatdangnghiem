"use client";

import React, { useState } from "react";
import {
  Tag,
  User,
  Calendar,
  Link as LinkIcon,
  Palette,
  Download,
  ExternalLink,
} from "lucide-react";
import { KhungChiTiet } from "@/app/components/KhungGiaoDien";
import { MauThietKe, createMauThietKeConfig } from "./config";

interface Props {
  data: MauThietKe;
  onClose: () => void;
  allowEdit: boolean;
  allowDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export default function MauThietKeDetail({
  data,
  onClose,
  allowEdit,
  allowDelete,
  onEdit,
  onDelete,
}: Props) {
  const config = createMauThietKeConfig();
  const [activeTab, setActiveTab] = useState("thongtin");
  const tabs = config.detailTabs.map((t) => ({ ...t, id: t.id || "" }));

  // 🟢 HELPER THÔNG MINH: Parse dữ liệu file thiết kế (Xử lý cả mảng và chuỗi JSON)
  const getDesignFiles = (): string[] => {
    if (!data) return [];

    const rawData = (data as any).file_thiet_ke;

    // Trường hợp 1: Không có dữ liệu
    if (!rawData) return [];

    // Trường hợp 2: Đã là mảng
    if (Array.isArray(rawData))
      return rawData.filter((u: string) => u.trim() !== "");

    // Trường hợp 3: Là chuỗi JSON (do lưu trong DB dạng text/jsonb)
    if (typeof rawData === "string") {
      try {
        const parsed = JSON.parse(rawData);
        if (Array.isArray(parsed))
          return parsed.filter((u: string) => u.trim() !== "");
      } catch (e) {
        console.error("Lỗi parse file_thiet_ke:", e);
        return [];
      }
    }

    return [];
  };

  const designFiles = getDesignFiles();

  return (
    <KhungChiTiet
      data={data}
      onClose={onClose}
      avatar={data.hinh_anh}
      title={data.mo_ta}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      showEditButton={allowEdit}
      showDeleteButton={allowDelete}
      onEdit={onEdit}
      onDelete={onDelete}
    >
      <div className="p-4 space-y-4">
        {/* 1. Phần hiển thị hình ảnh lớn */}
        <div className="aspect-video w-full rounded-xl overflow-hidden bg-[#1a1a1a] border border-white/10 relative group">
          {data.hinh_anh ? (
            <img
              src={data.hinh_anh}
              alt=""
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/20">
              <Palette size={48} />
            </div>
          )}
        </div>

        {/* 2. Danh sách File thiết kế */}
        {designFiles.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-white/40 font-bold uppercase">
                File Thiết Kế Gốc ({designFiles.length})
              </label>
            </div>

            <div className="grid gap-2">
              {designFiles.map((url, idx) => (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 p-3 bg-[#151515] hover:bg-[#C69C6D] border border-white/10 hover:border-[#C69C6D] rounded-lg transition-all"
                >
                  <div className="w-8 h-8 rounded bg-black/20 flex items-center justify-center text-[#C69C6D] group-hover:text-black">
                    <LinkIcon size={14} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs text-[#C69C6D] group-hover:text-black font-mono truncate">
                      {url}
                    </p>
                    <p className="text-[9px] text-white/40 group-hover:text-black/60 uppercase font-bold mt-0.5">
                      Nhấn để mở / tải về
                    </p>
                  </div>
                  <ExternalLink
                    size={14}
                    className="text-white/20 group-hover:text-black/40"
                  />
                </a>
              ))}
            </div>
          </div>
        ) : (
          // Hiển thị nếu chưa có file
          <div className="p-3 rounded-lg border border-dashed border-white/10 flex items-center justify-center gap-2 text-white/20">
            <LinkIcon size={14} />
            <span className="text-xs italic">Chưa có file thiết kế nào</span>
          </div>
        )}

        {/* 3. Phần thông tin thuộc tính */}
        <div className="grid gap-3 pt-2 border-t border-white/5">
          {/* Phân loại */}
          <div className="p-3 bg-[#151515] rounded-xl border border-white/5 flex items-center gap-3">
            <Tag className="text-[#C69C6D]" size={18} />
            <div>
              <p className="text-[10px] text-white/40 font-bold uppercase">
                Phân loại
              </p>
              <p className="text-white text-sm">{data.phan_loai}</p>
            </div>
          </div>

          {/* Người thiết kế */}
          <div className="p-3 bg-[#151515] rounded-xl border border-white/5 flex items-center gap-3">
            <User className="text-[#C69C6D]" size={18} />
            <div>
              <p className="text-[10px] text-white/40 font-bold uppercase">
                Người thiết kế
              </p>
              <p className="text-white text-sm">
                {data.ten_nguoi_tao || "---"}
              </p>
            </div>
          </div>

          {/* Ngày tạo */}
          <div className="p-3 bg-[#151515] rounded-xl border border-white/5 flex items-center gap-3">
            <Calendar className="text-[#C69C6D]" size={18} />
            <div>
              <p className="text-[10px] text-white/40 font-bold uppercase">
                Ngày tạo
              </p>
              <p className="text-white text-sm">
                {new Date(data.tao_luc).toLocaleDateString("vi-VN")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </KhungChiTiet>
  );
}
