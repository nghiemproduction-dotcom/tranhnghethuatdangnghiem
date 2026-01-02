"use client";

import React from "react";
import { Palette, User, Link as LinkIcon } from "lucide-react";
import { MauThietKe } from "./config";

interface Props {
  items: MauThietKe[];
  bulkMode: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onClickItem: (item: MauThietKe) => void;
}

export default function MauThietKeList({
  items,
  bulkMode,
  selectedIds,
  onToggleSelect,
  onClickItem,
}: Props) {
  // Helper: Đếm số lượng file thiết kế
  const getFileCount = (item: MauThietKe) => {
    const files = item.file_thiet_ke;
    if (Array.isArray(files))
      return files.filter((f) => f && f.trim() !== "").length;
    if (typeof files === "string") {
      try {
        const parsed = JSON.parse(files);
        return Array.isArray(parsed)
          ? parsed.filter((f: any) => f && f.trim() !== "").length
          : 0;
      } catch {
        return 0;
      }
    }
    return 0;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 p-2 md:p-4">
      {items.map((item) => {
        const fileCount = getFileCount(item);

        return (
          <div
            key={item.id}
            onClick={(e) => {
              if (bulkMode) {
                e.stopPropagation();
                onToggleSelect(item.id);
              } else {
                onClickItem(item);
              }
            }}
            className={`
                group relative bg-[#0f0f0f] border border-white/10 rounded-lg overflow-hidden cursor-pointer 
                hover:border-[#C69C6D]/50 transition-all 
                ${
                  selectedIds.has(item.id)
                    ? "border-[#C69C6D] bg-[#C69C6D]/10"
                    : ""
                }
            `}
          >
            {/* 🟢 HIỂN THỊ SỐ LƯỢNG FILE THIẾT KẾ (Badge) */}
            {fileCount > 0 && (
              <div className="absolute top-1 left-1 z-10 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] font-bold text-[#C69C6D] border border-white/10 shadow-sm">
                <LinkIcon size={10} />
                <span>{fileCount}</span>
              </div>
            )}

            {/* Checkbox Bulk Mode */}
            {bulkMode && (
              <div className="absolute top-1 right-1 z-10 w-5 h-5 border-2 rounded flex items-center justify-center transition-colors border-white/30 bg-black/50">
                {selectedIds.has(item.id) && (
                  <span className="text-[#C69C6D] font-bold text-xs">✓</span>
                )}
              </div>
            )}

            {/* Hình ảnh */}
            <div className="aspect-square w-full bg-[#1a1a1a] relative group-hover:opacity-90 transition-opacity">
              {item.hinh_anh ? (
                <img
                  src={item.hinh_anh}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/10">
                  <Palette size={24} />
                </div>
              )}
            </div>

            {/* Nội dung (Đã căn giữa) */}
            <div className="p-2 text-center">
              <h3 className="font-bold text-white truncate text-xs leading-tight">
                {item.mo_ta}
              </h3>
              <p className="text-[9px] text-[#C69C6D] mt-0.5 truncate uppercase opacity-80">
                {item.phan_loai}
              </p>
              <div className="mt-1 flex items-center justify-center gap-1 text-[9px] text-white/30 truncate">
                <User size={8} />
                <span className="truncate">{item.ten_nguoi_tao || "---"}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
