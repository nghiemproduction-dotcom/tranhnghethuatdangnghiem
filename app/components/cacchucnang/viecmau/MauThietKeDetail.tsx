"use client";

import React, { useState } from "react";
import {
  Tag,
  User,
  Calendar,
  Link as LinkIcon,
  Palette,
  ExternalLink,
  Clock,
} from "lucide-react";
import { KhungChiTiet } from "@/app/components/cacchucnang/KhungGiaoDienChucNang";
import { MauThietKe, createMauThietKeConfig } from "./config";

interface Props {
  data: MauThietKe;
  onClose: () => void;
  allowEdit: boolean;
  allowDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

// Interface mở rộng để hứng các trường mới từ backend
interface FileItem {
  ten: string;
  url: string;
  nguoi_dang?: string; // Tên người upload
  last_modified?: string; // Thời gian upload
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

  const item = data as any;

  // Helper format thời gian ngắn gọn (VD: 14:30 25/12)
  const formatTime = (isoString?: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric", // Có thể bỏ year nếu muốn gọn hơn
    });
  };

  const getFileNameFromUrl = (url: string) => {
    try {
      return decodeURIComponent(url).split("?")[0].split("/").pop() || url;
    } catch {
      return url;
    }
  };

  const getDesignFiles = (): FileItem[] => {
    if (!item || !item.file_thiet_ke) return [];
    let parsed: any[] = [];
    const rawData = item.file_thiet_ke;

    try {
      if (Array.isArray(rawData)) parsed = rawData;
      else if (typeof rawData === "string" && rawData.trim()) {
        const result = JSON.parse(rawData);
        if (Array.isArray(result)) parsed = result;
      }
    } catch {
      return [];
    }

    return parsed
      .map((entry: any) => {
        // Data cũ (String)
        if (typeof entry === "string") {
          return { ten: getFileNameFromUrl(entry), url: entry };
        }
        // Data mới (Object)
        if (typeof entry === "object" && entry !== null) {
          return {
            ten:
              entry.ten ||
              getFileNameFromUrl(entry.url || "") ||
              "File đính kèm",
            url: entry.url || "",
            nguoi_dang: entry.nguoi_dang,
            last_modified: entry.last_modified,
          };
        }
        return null;
      })
      .filter((f): f is FileItem => f !== null && f.url.trim() !== "");
  };

  const designFiles = getDesignFiles();

  return (
    <KhungChiTiet
      data={data}
      onClose={onClose}
      avatar={item.hinh_anh}
      title={item.ten || item.mo_ta || "Chi tiết mẫu"}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      showEditButton={allowEdit}
      showDeleteButton={allowDelete}
      onEdit={onEdit}
      onDelete={onDelete}
    >
      <div className="p-4 space-y-4">
        {/* HÌNH ẢNH */}
        <div className="aspect-video w-full rounded-xl overflow-hidden bg-[#1a1a1a] border border-white/10 relative group">
          {item.hinh_anh ? (
            <img
              src={item.hinh_anh}
              alt=""
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/20">
              <Palette size={48} />
            </div>
          )}
        </div>

        {/* DANH SÁCH FILE - GIAO DIỆN MỚI */}
        {designFiles.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-white/40 font-bold uppercase">
                File Thiết Kế Gốc ({designFiles.length})
              </label>
            </div>

            <div className="grid gap-2">
              {designFiles.map((file, idx) => (
                <a
                  key={idx}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 p-3 bg-[#151515] hover:bg-[#C69C6D] border border-white/10 hover:border-[#C69C6D] rounded-lg transition-all relative overflow-hidden"
                  title={file.url}
                >
                  {/* Icon File */}
                  <div className="w-10 h-10 rounded bg-black/20 flex items-center justify-center text-[#C69C6D] group-hover:text-black shrink-0">
                    <LinkIcon size={18} />
                  </div>

                  {/* Thông tin chính */}
                  <div className="flex-1 overflow-hidden">
                    {/* Tên File */}
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-[#C69C6D] group-hover:text-black truncate">
                        {file.ten}
                      </p>
                    </div>

                    {/* Metadata: Người đăng - Thời gian */}
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-white/40 group-hover:text-black/70 font-mono">
                      {file.nguoi_dang && (
                        <span className="flex items-center gap-1">
                          <User size={10} /> {file.nguoi_dang}
                        </span>
                      )}

                      {file.nguoi_dang && file.last_modified && <span>•</span>}

                      {file.last_modified && (
                        <span className="flex items-center gap-1">
                          <Clock size={10} /> {formatTime(file.last_modified)}
                        </span>
                      )}
                    </div>
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
          <div className="p-3 rounded-lg border border-dashed border-white/10 flex items-center justify-center gap-2 text-white/20">
            <LinkIcon size={14} />
            <span className="text-xs italic">Chưa có file thiết kế nào</span>
          </div>
        )}

        {/* THÔNG TIN KHÁC */}
        <div className="grid gap-3 pt-2 border-t border-white/5">
          <DetailRow
            icon={<Tag size={18} />}
            label="Phân loại"
            value={item.phan_loai}
          />
          <DetailRow
            icon={<User size={18} />}
            label="Người tạo mẫu"
            value={item.ten_nguoi_tao}
          />
          <DetailRow
            icon={<Calendar size={18} />}
            label="Ngày tạo mẫu"
            value={
              item.tao_luc || item.created_at
                ? new Date(item.tao_luc || item.created_at).toLocaleDateString(
                    "vi-VN"
                  )
                : "---"
            }
          />
        </div>
      </div>
    </KhungChiTiet>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="p-3 bg-[#151515] rounded-xl border border-white/5 flex items-center gap-3">
      <div className="text-[#C69C6D]">{icon}</div>
      <div>
        <p className="text-[10px] text-white/40 font-bold uppercase">{label}</p>
        <p className="text-white text-sm">{value || "---"}</p>
      </div>
    </div>
  );
}
