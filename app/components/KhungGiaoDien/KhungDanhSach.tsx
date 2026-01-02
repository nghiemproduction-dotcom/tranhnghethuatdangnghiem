"use client";

/**
 * ============================================================
 * KHUNG DANH SÁCH (FINAL VERSION)
 * ============================================================
 * * - Logic: Giữ nguyên 100% Props & Types từ code cũ.
 * - Giao diện: Tách làm 2 hàng (Header Info & Tabs).
 * - UI: Tối ưu Logo, Search, và Nút Chức Năng (Grid) ở cuối.
 */

import React, { useState, ReactNode } from "react";
import {
  Search,
  X,
  Plus,
  ArrowUpDown,
  CheckSquare,
  Trash2,
  Layers,
  Shield,
  Users,
  Briefcase,
  Package,
  Settings,
  Grid,
  Filter,
} from "lucide-react";

// ============================================================
// TYPES (GIỮ NGUYÊN)
// ============================================================

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

export interface SortOption {
  key: string;
  label: string;
}

export interface BulkAction {
  id: string;
  label: string;
  icon?: React.ElementType;
  color?: string;
  onClick: (selectedIds: string[]) => void;
}

export interface KhungDanhSachProps {
  // Header Info (Mới thêm để hiển thị Logo/Tên phòng)
  title?: string;
  onToggleMenu?: () => void; // Nút Grid Menu

  // Tabs
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;

  // Search
  onSearch?: (term: string) => void;

  // Sort
  sortOptions?: SortOption[];
  activeSort?: string;
  onSortChange?: (sortKey: string) => void;

  // Actions
  showAddButton?: boolean;
  onAdd?: () => void;

  // Bulk mode
  bulkMode?: boolean;
  onBulkModeToggle?: () => void;
  selectedCount?: number;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
  bulkActions?: BulkAction[];

  // Loading
  loading?: boolean;

  // Content
  children: ReactNode;

  // Style
  className?: string;
}

// ============================================================
// HELPER: XỬ LÝ LOGO PHÒNG
// ============================================================
const getRoomInfo = (title: string = "") => {
  const upperTitle = title.toUpperCase();
  let shortTitle = upperTitle
    .replace("PHÒNG ", "")
    .replace("QUẢN LÝ ", "")
    .replace("DANH SÁCH ", "");

  let Icon = Layers;

  if (upperTitle.includes("ADMIN") || upperTitle.includes("QUẢN TRỊ"))
    Icon = Shield;
  else if (upperTitle.includes("NHÂN SỰ")) Icon = Users;
  else if (upperTitle.includes("SALES") || upperTitle.includes("KINH DOANH"))
    Icon = Briefcase;
  else if (upperTitle.includes("KHO") || upperTitle.includes("VẬT TƯ"))
    Icon = Package;
  else if (upperTitle.includes("CẤU HÌNH")) Icon = Settings;

  return { Icon, shortTitle };
};

// ============================================================
// COMPONENT
// ============================================================

export default function KhungDanhSach({
  title = "DANH SÁCH",
  onToggleMenu,
  tabs = [],
  activeTab = "all",
  onTabChange,
  onSearch,
  sortOptions = [],
  activeSort,
  onSortChange,
  showAddButton = true,
  onAdd,
  bulkMode = false,
  onBulkModeToggle,
  selectedCount = 0,
  onSelectAll,
  onClearSelection,
  bulkActions = [],
  loading = false,
  children,
  className = "",
}: KhungDanhSachProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { Icon, shortTitle } = getRoomInfo(title);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearch?.(value);
  };

  return (
    <div
      className={`w-full h-full flex flex-col bg-[#050505] overflow-hidden ${className}`}
    >
      {/* ====== HÀNG 1: HEADER INFO + SEARCH + ACTIONS ====== */}
      <div className="shrink-0 h-[60px] flex items-center gap-3 px-3 border-b border-white/10 bg-[#0a0a0a] z-10">
        {/* A. LOGO + TÊN RÚT GỌN */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#C69C6D]/10 flex items-center justify-center text-[#C69C6D] border border-[#C69C6D]/20">
            <Icon size={18} />
          </div>
          {/* Ẩn chữ trên mobile nhỏ, hiện trên tablet trở lên */}
          <span className="font-black text-sm md:text-base tracking-wider text-white hidden sm:block">
            {shortTitle}
          </span>
        </div>

        <div className="w-[1px] h-6 bg-white/10 mx-1 hidden sm:block"></div>

        {/* B. SEARCH BAR (Co giãn flex-1) */}
        <div className="flex-1 min-w-0 max-w-md relative group">
          {onSearch && (
            <>
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C69C6D] transition-colors"
                size={14}
              />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-[#151515] border border-white/10 rounded-lg pl-9 pr-8 py-2 text-xs md:text-sm text-white focus:outline-none focus:border-[#C69C6D]/50 transition-all placeholder:text-white/20"
              />
              {searchTerm && (
                <button
                  onClick={() => handleSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  <X size={12} />
                </button>
              )}
            </>
          )}
        </div>

        {/* C. CÁC NÚT THAO TÁC (Dồn về bên phải) */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {/* Nút chọn nhiều (Bulk) */}
          {onBulkModeToggle && (
            <button
              onClick={onBulkModeToggle}
              className={`w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-lg transition-all border ${
                bulkMode
                  ? "bg-[#C69C6D] text-black border-[#C69C6D]"
                  : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
              }`}
              title="Chọn nhiều"
            >
              <CheckSquare size={16} />
            </button>
          )}

          {/* Nút Thêm Mới */}
          {showAddButton && onAdd && !bulkMode && (
            <button
              onClick={onAdd}
              className="h-8 md:h-9 px-3 bg-[#C69C6D] hover:bg-white text-black text-xs font-bold uppercase rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-[#C69C6D]/20 active:scale-95 whitespace-nowrap"
            >
              <Plus size={16} strokeWidth={3} />
              <span className="hidden sm:inline">THÊM</span>
            </button>
          )}

          {/* 🛑 NÚT MENU CHỨC NĂNG (CHỐT CHẶN CUỐI CÙNG) */}
          <div className="w-[1px] h-6 bg-white/10 mx-1"></div>
          <button
            onClick={onToggleMenu}
            className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-[#1a1a1a] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/30 transition-all active:scale-95"
            title="Menu Chức Năng"
          >
            <Grid size={18} />
          </button>
        </div>
      </div>

      {/* ====== HÀNG 2: TABS + SORT ====== */}
      <div className="shrink-0 h-[40px] flex items-center justify-between border-b border-white/5 bg-[#0f0f0f] px-3">
        {/* Tabs (Scrollable) */}
        <div className="flex-1 flex items-center gap-4 overflow-x-auto scrollbar-hide h-full min-w-0 mr-4">
          <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange?.(tab.id)}
              className={`relative h-full flex items-center gap-2 px-1 text-[10px] md:text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "text-[#C69C6D]"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[8px] ${
                    activeTab === tab.id
                      ? "bg-[#C69C6D]/20 text-[#C69C6D]"
                      : "bg-white/10 text-gray-500"
                  }`}
                >
                  {tab.count}
                </span>
              )}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C69C6D]" />
              )}
            </button>
          ))}
        </div>

        {/* Sort Dropdown (Cố định phải) */}
        {sortOptions.length > 0 && (
          <div className="shrink-0 flex items-center gap-2 pl-3 border-l border-white/5 h-full">
            <Filter size={12} className="text-gray-500" />
            <select
              value={activeSort}
              onChange={(e) => onSortChange?.(e.target.value)}
              className="bg-transparent text-[10px] md:text-xs font-bold text-gray-400 uppercase focus:outline-none cursor-pointer hover:text-white appearance-none py-1"
            >
              {sortOptions.map((opt) => (
                <option
                  key={opt.key}
                  value={opt.key}
                  className="bg-[#1a1a1a] text-gray-300"
                >
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ====== HÀNG 3: BULK ACTION BAR (Chỉ hiện khi bulkMode) ====== */}
      {bulkMode && selectedCount > 0 && (
        <div className="shrink-0 px-3 py-2 bg-[#C69C6D]/10 border-b border-[#C69C6D]/30 flex items-center justify-between gap-2 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <span className="text-[#C69C6D] font-bold text-[10px]">
              Đã chọn: {selectedCount}
            </span>
            <div className="h-3 w-[1px] bg-[#C69C6D]/30"></div>
            <button
              onClick={onSelectAll}
              className="text-[10px] text-white/60 hover:text-white hover:underline"
            >
              Tất cả
            </button>
            <button
              onClick={onClearSelection}
              className="text-[10px] text-white/60 hover:text-white hover:underline"
            >
              Bỏ chọn
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {bulkActions.map((action) => {
              const ActionIcon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => action.onClick([])}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-[10px] font-bold uppercase transition-all ${
                    action.color === "danger" || action.id === "delete"
                      ? "bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {ActionIcon && <ActionIcon size={12} />}
                  <span className="hidden xs:inline">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ====== HÀNG 4: CONTENT AREA ====== */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
            <div className="w-8 h-8 border-2 border-[#C69C6D] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
