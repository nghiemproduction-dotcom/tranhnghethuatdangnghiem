"use client";

/**
 * ============================================================
 * KHUNG CHI TIẾT (FINAL VERSION)
 * ============================================================
 * * - Logic: Giữ nguyên 100% từ mã gốc (Swipe, Search, Sort...).
 * - UI: Tách Header thành 2 dòng (Info line & Tab line) để thoáng hơn.
 */

import React, { ReactNode, useState } from "react";
import {
  X,
  User,
  Edit3,
  Trash2,
  Loader2,
  Search,
  ArrowUpDown,
} from "lucide-react";

// ============================================================
// TYPES (GIỮ NGUYÊN)
// ============================================================

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ElementType;
  count?: number;
  searchable?: boolean;
  sortable?: boolean;
  sortOptions?: { key: string; label: string }[];
  showAddButton?: boolean;
}

export interface KhungChiTietProps {
  // Data
  data: any;
  onClose: () => void;

  // Header
  avatar?: string;
  avatarFallback?: ReactNode;
  title?: string;

  // Tabs
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  tabCounts?: Record<string, number>;

  // Tab actions
  searchTerm?: string;
  onSearch?: (term: string) => void;
  sortBy?: string;
  onSortChange?: (sortKey: string) => void;
  onAddInTab?: () => void;

  // Actions
  showEditButton?: boolean;
  showDeleteButton?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  deleting?: boolean;

  // Content
  children: ReactNode;

  // Style
  className?: string;
}

// ============================================================
// COMPONENT
// ============================================================

export default function KhungChiTiet({
  data,
  onClose,
  avatar,
  avatarFallback,
  title,
  tabs = [],
  activeTab,
  onTabChange,
  tabCounts = {},
  searchTerm = "",
  onSearch,
  sortBy,
  onSortChange,
  onAddInTab,
  showEditButton = true,
  showDeleteButton = false,
  onEdit,
  onDelete,
  deleting = false,
  children,
  className = "",
}: KhungChiTietProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Swipe gesture states
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const minSwipeDistance = 50;

  if (!data) return null;

  // Get current tab config
  const currentTabConfig = tabs.find((t) => t.id === activeTab);
  const TAB_IDS = tabs.map((t) => t.id);

  // Swipe handlers (Logic giữ nguyên)
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX || !onTabChange) return;

    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    const currentIndex = TAB_IDS.indexOf(activeTab || "");

    if (isLeftSwipe && currentIndex < TAB_IDS.length - 1) {
      onTabChange(TAB_IDS[currentIndex + 1]);
    } else if (isRightSwipe && currentIndex > 0) {
      onTabChange(TAB_IDS[currentIndex - 1]);
    }

    setTouchStartX(null);
    setTouchEndX(null);
  };

  const handleSearch = (value: string) => {
    setLocalSearchTerm(value);
    onSearch?.(value);
  };

  return (
    <div
      className={`w-full h-full flex flex-col bg-[#050505] overflow-hidden ${className}`}
    >
      {/* ====== HEADER SECTION (TÁCH LÀM 2 DÒNG) ====== */}
      <div className="shrink-0 bg-[#0a0a0a] border-b border-white/5 z-20 shadow-sm">
        {/* --- DÒNG 1: INFO + GLOBAL ACTIONS --- */}
        <div className="flex items-center justify-between p-3 pb-1">
          {/* Left: Avatar + Title */}
          <div className="flex items-center gap-3">
            {/* Nút đóng (Move here for better UX on mobile) */}
            <button
              onClick={onClose}
              className="md:hidden p-1.5 text-white/40 hover:text-white rounded"
            >
              <X size={18} />
            </button>

            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full border border-[#C69C6D]/30 overflow-hidden bg-[#1a1a1a] shrink-0 p-0.5">
              {avatar ? (
                <img
                  src={avatar}
                  alt=""
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#151515] rounded-full">
                  {avatarFallback || (
                    <User size={16} className="text-[#C69C6D]/50" />
                  )}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-sm md:text-base font-black text-white uppercase tracking-wide max-w-[200px] truncate leading-tight">
                {title || "---"}
              </h2>
              {/* Có thể thêm subtitle nếu cần */}
            </div>
          </div>

          {/* Right: Actions (Edit/Delete/Close) */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Nút SỬA */}
            {showEditButton && onEdit && (
              <button
                onClick={onEdit}
                className="p-2 bg-[#C69C6D]/10 hover:bg-[#C69C6D] text-[#C69C6D] hover:text-black rounded-lg transition-all"
                title="Sửa"
              >
                <Edit3 size={16} />
              </button>
            )}

            {/* Nút XÓA */}
            {showDeleteButton && onDelete && (
              <button
                onClick={onDelete}
                disabled={deleting}
                className="p-2 bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white rounded-lg disabled:opacity-50 transition-all"
                title="Xóa"
              >
                {deleting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
              </button>
            )}

            <div className="w-[1px] h-6 bg-white/10 mx-1 hidden md:block"></div>

            {/* Nút Đóng (Desktop) */}
            <button
              onClick={onClose}
              className="hidden md:flex p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* --- DÒNG 2: TABS (CÂN GIỮA) + TAB ACTIONS (SEARCH/SORT) --- */}
        <div className="flex items-center justify-between px-2 md:px-4 h-[44px]">
          {/* Placeholder bên trái để cân bằng layout (nếu cần) */}
          <div className="w-[80px] hidden md:block"></div>

          {/* CENTER: TABS */}
          <div className="flex-1 flex items-center justify-center gap-4 overflow-x-auto scrollbar-hide h-full">
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
                className={`relative h-full flex items-center gap-2 px-2 text-[11px] md:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap
                                    ${
                                      activeTab === tab.id
                                        ? "text-[#C69C6D]"
                                        : "text-gray-500 hover:text-gray-300"
                                    }
                                `}
              >
                {tab.label}
                {(tabCounts[tab.id] !== undefined ||
                  tab.count !== undefined) && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] ${
                      activeTab === tab.id
                        ? "bg-[#C69C6D]/20 text-[#C69C6D]"
                        : "bg-white/10 text-gray-500"
                    }`}
                  >
                    {tabCounts[tab.id] ?? tab.count ?? 0}
                  </span>
                )}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#C69C6D] rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          {/* RIGHT: SEARCH & SORT (Tab specific) */}
          <div className="w-[80px] flex items-center justify-end gap-1">
            {/* Search */}
            {currentTabConfig?.searchable && onSearch && (
              <div className="relative flex items-center">
                {showSearch ? (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center bg-[#1a1a1a] border border-white/20 rounded z-10 animate-in slide-in-from-right-5 shadow-xl">
                    <input
                      autoFocus
                      type="text"
                      placeholder="Tìm..."
                      value={localSearchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-32 bg-transparent pl-2 pr-6 py-1.5 text-[11px] text-white placeholder:text-white/20 focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        setShowSearch(false);
                        handleSearch("");
                      }}
                      className="absolute right-1 p-0.5 text-white/40 hover:text-white"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowSearch(true)}
                    className="p-1.5 text-gray-400 hover:text-white rounded transition-all"
                  >
                    <Search size={16} />
                  </button>
                )}
              </div>
            )}

            {/* Sort */}
            {currentTabConfig?.sortable &&
              currentTabConfig.sortOptions &&
              onSortChange && (
                <div className="relative">
                  <button
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="p-1.5 text-gray-400 hover:text-white rounded transition-all"
                  >
                    <ArrowUpDown size={16} />
                  </button>
                  {showSortMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowSortMenu(false)}
                      />
                      <div className="absolute top-full mt-1 right-0 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl z-[100] min-w-[110px] overflow-hidden">
                        {currentTabConfig.sortOptions.map((opt) => (
                          <button
                            key={opt.key}
                            onClick={() => {
                              onSortChange(opt.key);
                              setShowSortMenu(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-[10px] font-bold ${
                              sortBy === opt.key
                                ? "text-[#C69C6D] bg-[#C69C6D]/10"
                                : "text-white hover:bg-white/10"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
          </div>
        </div>
      </div>

      {/* ====== CONTENT AREA (SWIPE SUPPORT) ====== */}
      <div
        className="flex-1 overflow-y-auto custom-scrollbar bg-[#050505]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}
