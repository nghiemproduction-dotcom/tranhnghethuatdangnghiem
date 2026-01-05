"use client";

/**
 * ============================================================
 * KHUNG CHI TIẾT (COMPACT & CLEAN TABS)
 * ============================================================
 * * Update UI:
 * - Row 1 Height: 45px (Compact Header)
 * - Row 2 Height: 40px (Compact Tabs)
 * - Tabs Style: Text-only (No background buttons), simple underline.
 * 🟢 UPDATE: Tự động đếm số trường có dữ liệu cho từng tab
 */

import React, { ReactNode, useState, useMemo } from "react";
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
// TYPES
// ============================================================

export interface DetailTabDef {
  id: string;
  label: string;
  icon?: React.ElementType;
  
  // Mảng các tên trường cần kiểm tra để đếm (VD: ['email', 'phone'])
  checkFields?: string[]; 
  
  // 🟢 FIX LỖI TS: Thêm thuộc tính count (optional) để TS hiểu đây là biến được tính toán thêm
  count?: number; 

  searchable?: boolean;
  sortable?: boolean;
  sortOptions?: { key: string; label: string }[];
  showAddButton?: boolean;
}

// 🟢 UPDATE: Dùng Generic <T> thay vì any
export interface KhungChiTietProps<T = any> {
  data: T;
  onClose: () => void;
  avatar?: string;
  avatarFallback?: ReactNode;
  title?: string;
  
  tabDefs?: DetailTabDef[]; // Dùng tabDefs thay vì tabs cứng
  
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  
  searchTerm?: string;
  onSearch?: (term: string) => void;
  sortBy?: string;
  onSortChange?: (sortKey: string) => void;
  onAddInTab?: () => void;
  showEditButton?: boolean;
  showDeleteButton?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  deleting?: boolean;
  children: ReactNode;
  className?: string;
}

// ============================================================
// COMPONENT
// ============================================================

export default function KhungChiTiet<T extends Record<string, any>>({
  data,
  onClose,
  avatar,
  avatarFallback,
  title,
  tabDefs = [], 
  activeTab,
  onTabChange,
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
}: KhungChiTietProps<T>) {
  const [showSearch, setShowSearch] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Swipe gesture states
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const minSwipeDistance = 50;

  // 🟢 LOGIC MỚI: Tự động đếm số trường có dữ liệu
  const renderedTabs = useMemo(() => {
    if (!data) return tabDefs;

    return tabDefs.map(tab => {
      let count = tab.count ?? 0; // Ưu tiên count truyền vào từ ngoài (nếu có)
      
      // Nếu chưa có count và có checkFields thì tự đếm
      if (count === 0 && tab.checkFields && Array.isArray(tab.checkFields)) {
        count = tab.checkFields.filter(field => {
          const val = data[field];
          // 🟢 FIX: Chấp nhận số 0 là dữ liệu hợp lệ. Chỉ loại bỏ null, undefined, string rỗng.
          return val !== null && val !== undefined && val !== "";
        }).length;
      }
      return { ...tab, count };
    });
  }, [data, tabDefs]);

  if (!data) return null;

  const currentTabConfig = renderedTabs.find((t) => t.id === activeTab);
  const TAB_IDS = renderedTabs.map((t) => t.id);

  // Swipe handlers
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
      {/* ====== HEADER CONTAINER ====== */}
      <div className="shrink-0 flex flex-col bg-[#0a0a0a] border-b border-white/5 z-20 shadow-sm">
        {/* --- ROW 1: INFO & ACTIONS --- */}
        <div className="flex items-center justify-between px-4 h-[45px] border-b border-white/5">
          {/* LEFT: Avatar + Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full border border-[#C69C6D]/30 overflow-hidden bg-[#1a1a1a] shrink-0 p-0.5 shadow-lg shadow-[#C69C6D]/5">
              {avatar ? (
                <img
                  src={avatar}
                  alt=""
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#151515] rounded-full">
                  {avatarFallback || (
                    <User size={14} className="text-[#C69C6D]/50" />
                  )}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-black text-white uppercase tracking-wide truncate leading-tight">
                {title || "---"}
              </h2>
            </div>
          </div>

          {/* RIGHT: Global Actions */}
          <div className="flex items-center gap-1 shrink-0 ml-4">
            {showEditButton && onEdit && (
              <button
                onClick={onEdit}
                className="p-1.5 hover:text-[#C69C6D] text-gray-400 transition-all"
                title="Chỉnh sửa"
              >
                <Edit3 size={16} />
              </button>
            )}

            {showDeleteButton && onDelete && (
              <button
                onClick={onDelete}
                disabled={deleting}
                className="p-1.5 hover:text-red-500 text-gray-400 disabled:opacity-50 transition-all"
                title="Xóa"
              >
                {deleting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
              </button>
            )}

            <div className="w-[1px] h-4 bg-white/10 mx-1"></div>

            <button
              onClick={onClose}
              className="p-1.5 hover:text-white text-gray-400 transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* --- ROW 2: CLEAN TABS --- */}
        <div className="flex items-center justify-between h-[40px] px-2 relative">
          {/* Spacer Left */}
          <div className="w-[60px] shrink-0 hidden md:block"></div>

          {/* CENTER: Simple Text Tabs */}
          <div className="flex-1 flex items-center justify-center gap-6 h-full overflow-x-auto scrollbar-hide">
            <style jsx>{`
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
              .scrollbar-hide {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
            `}</style>
            
            {/* Render danh sách tab */}
            {renderedTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange?.(tab.id)}
                className={`relative h-full flex items-center gap-2 px-1 text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap group
                  ${
                    activeTab === tab.id
                      ? "text-[#C69C6D]"
                      : "text-gray-500 hover:text-white"
                  }
                `}
              >
                {tab.label}
                
                {/* 🟢 Hiển thị Count nếu có và > 0 */}
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`text-[9px] ${
                      activeTab === tab.id
                        ? "text-[#C69C6D]"
                        : "text-gray-600 group-hover:text-gray-400"
                    }`}
                  >
                    ({tab.count})
                  </span>
                )}

                {/* Active Indicator Line */}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C69C6D] shadow-[0_0_8px_#C69C6D]" />
                )}
              </button>
            ))}
          </div>

          {/* RIGHT: Search & Sort Tools */}
          <div className="w-[60px] shrink-0 flex items-center justify-end gap-1">
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
                      className="w-24 bg-transparent pl-2 pr-5 py-1 text-[10px] text-white placeholder:text-white/20 focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        setShowSearch(false);
                        handleSearch("");
                      }}
                      className="absolute right-1 p-0.5 text-white/40 hover:text-white"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowSearch(true)}
                    className="p-1.5 text-gray-500 hover:text-white transition-all"
                  >
                    <Search size={14} />
                  </button>
                )}
              </div>
            )}

            {currentTabConfig?.sortable &&
              currentTabConfig.sortOptions &&
              onSortChange && (
                <div className="relative">
                  <button
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="p-1.5 text-gray-500 hover:text-white transition-all"
                  >
                    <ArrowUpDown size={14} />
                  </button>
                  {showSortMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowSortMenu(false)}
                      />
                      <div className="absolute top-full mt-1 right-0 bg-[#1a1a1a] border border-white/10 rounded shadow-xl z-[100] min-w-[100px] overflow-hidden">
                        {currentTabConfig.sortOptions.map((opt) => (
                          <button
                            key={opt.key}
                            onClick={() => {
                              onSortChange(opt.key);
                              setShowSortMenu(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-[9px] font-bold border-b border-white/5 last:border-0 ${
                              sortBy === opt.key
                                ? "text-[#C69C6D]"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
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

      {/* ====== CONTENT AREA ====== */}
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