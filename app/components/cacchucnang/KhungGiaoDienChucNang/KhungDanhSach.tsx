"use client";

/**
 * ============================================================
 * KHUNG DANH SÁCH
 * ============================================================
 *
 * Khung giao diện chuẩn cho trang danh sách.
 * Style: Tab bar ngang + Actions góc phải (giống GenericManager)
 * 🟢 UPDATE: Tự động tính toán Count cho các Tab (Đã tối ưu hiệu năng)
 */

import React, { useState, ReactNode, useMemo } from "react";
import {
  Search,
  X,
  Plus,
  ArrowUpDown,
  CheckSquare,
} from "lucide-react";

// ============================================================
// TYPES
// ============================================================

// 🟢 MỚI: Định nghĩa cấu hình Tab (chỉ cần ID và Tên cột lọc)
export interface ListTabDef {
  id: string;
  label: string;
  filterField?: string; // Tên cột trong DB để lọc (VD: 'phan_loai')
  matchValue?: any;     // Giá trị để so sánh (Mặc định sẽ so sánh với id)
  // 🟢 UPDATE: Thêm thuộc tính count cho phép truyền thủ công
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

// 🟢 UPDATE: Dùng Generic <T> thay vì any
export interface KhungDanhSachProps<T = any> {
  // 🟢 THAY ĐỔI: Nhận Data gốc và Cấu hình Tab để tự tính toán
  data: T[]; 
  tabDefs: ListTabDef[]; 

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
  extraActions?: ReactNode; 

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
// COMPONENT
// ============================================================

export default function KhungDanhSach<T extends Record<string, any>>({
  data = [], // 🟢 Dữ liệu thô
  tabDefs = [], // 🟢 Cấu hình tab
  activeTab = "all",
  onTabChange,
  onSearch,
  sortOptions = [],
  activeSort,
  onSortChange,
  showAddButton = true,
  onAdd,
  extraActions,
  bulkMode = false,
  onBulkModeToggle,
  selectedCount = 0,
  onSelectAll,
  onClearSelection,
  bulkActions = [],
  loading = false,
  children,
  className = "",
}: KhungDanhSachProps<T>) {
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSortMenu, setShowSortMenu] = useState(false);

  // 🟢 LOGIC MỚI (TỐI ƯU): Tự động tính toán số lượng (Count) bằng 1 vòng lặp duy nhất
  const renderedTabs = useMemo(() => {
    // 1. Khởi tạo map đếm
    const countMap: Record<string, number> = { all: data.length };
    
    // Khởi tạo
    tabDefs.forEach((t) => (countMap[t.id] = 0));

    // 2. Chạy 1 vòng lặp qua Data để phân loại (O(N))
    data.forEach((item) => {
      tabDefs.forEach((tab) => {
        if (tab.filterField) {
          const itemValue = item[tab.filterField];
          // Giá trị so sánh: nếu không truyền matchValue thì so sánh với id của tab
          const targetValue = tab.matchValue !== undefined ? tab.matchValue : tab.id;
          
          if (itemValue === targetValue) {
            countMap[tab.id] = (countMap[tab.id] || 0) + 1;
          }
        }
      });
    });

    // 3. Map lại vào structure để render
    const allTab = { id: "all", label: "TẤT CẢ", count: countMap.all };
    
    const dynamicTabs = tabDefs.map((def) => {
      // 🟢 Ưu tiên: Nếu tab không có filterField nhưng có count truyền vào -> Dùng count đó
      let finalCount = countMap[def.id];
      if (!def.filterField && def.count !== undefined) {
        finalCount = def.count;
      }
      
      return {
        ...def,
        count: finalCount,
      };
    });

    return [allTab, ...dynamicTabs];
  }, [data, tabDefs]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearch?.(value);
  };

  const clearSearch = () => {
    setSearchTerm("");
    onSearch?.("");
    setShowSearch(false);
  };

  return (
    <div
      className={`w-full h-full flex flex-col bg-[#050505] overflow-hidden ${className}`}
    >
      {/* ====== TAB BAR ====== */}
      <div className="shrink-0 h-[40px] flex items-center border-b border-white/5 bg-[#0a0a0a]">
        {/* Tabs - cuộn được */}
        <div className="flex-1 flex items-center gap-1 px-2 overflow-x-auto min-w-0 scrollbar-hide">
          <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>
          
          {/* 🟢 Render danh sách tab đã tính toán */}
          {renderedTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange?.(tab.id)}
              className={`flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase whitespace-nowrap rounded transition-all shrink-0 ${
                activeTab === tab.id
                  ? "text-[#C69C6D] bg-[#C69C6D]/10"
                  : "text-gray-500 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.label}
              <span
                className={`px-1 py-0.5 rounded text-[8px] ${
                  activeTab === tab.id
                    ? "bg-[#C69C6D] text-black"
                    : "bg-white/10 text-gray-400"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Actions - cố định phải */}
        <div className="shrink-0 flex items-center gap-1 px-2 border-l border-white/5 bg-[#0a0a0a]">
          
          {/* Search */}
          {onSearch && (
            <div className="relative flex items-center">
              {showSearch ? (
                <div className="flex items-center gap-1 animate-in slide-in-from-right-2">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Tìm..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-28 bg-white/5 border border-white/10 rounded pl-2 pr-6 py-1 text-[10px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#C69C6D]"
                  />
                  <button
                    onClick={clearSearch}
                    className="absolute right-1 p-0.5 text-white/40 hover:text-white"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSearch(true)}
                  className="p-1.5 bg-white/5 hover:bg-white/10 text-white/60 rounded transition-all"
                >
                  <Search size={14} />
                </button>
              )}
            </div>
          )}

          {/* Sort */}
          {sortOptions.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="p-1.5 bg-white/5 hover:bg-white/10 text-white/60 rounded transition-all"
              >
                <ArrowUpDown size={14} />
              </button>
              {showSortMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowSortMenu(false)}
                  />
                  <div className="absolute top-full mt-1 right-0 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl z-[100] min-w-[90px] overflow-hidden">
                    {sortOptions.map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => {
                          onSortChange?.(opt.key);
                          setShowSortMenu(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-[10px] font-bold ${
                          activeSort === opt.key
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

          {/* EXTRA ACTIONS */}
          {extraActions && (
            <div className="flex items-center gap-1 pl-1 border-l border-white/5 ml-1">
               {extraActions}
            </div>
          )}

          {/* Bulk Mode Toggle */}
          {onBulkModeToggle && (
            <button
              onClick={onBulkModeToggle}
              className={`p-1.5 rounded transition-all ${
                bulkMode
                  ? "bg-[#C69C6D] text-black"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              <CheckSquare size={14} />
            </button>
          )}

          {/* Add */}
          {showAddButton && onAdd && (
            <button
              onClick={onAdd}
              className="p-1.5 bg-[#C69C6D] hover:bg-white text-black rounded transition-all active:scale-95"
            >
              <Plus size={14} strokeWidth={3} />
            </button>
          )}
        </div>
      </div>

      {/* ====== BULK BAR ====== */}
      {bulkMode && selectedCount > 0 && (
        <div className="shrink-0 px-3 py-1.5 bg-[#C69C6D]/10 border-b border-[#C69C6D]/30 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[#C69C6D] font-bold text-[10px]">
              Đã chọn: {selectedCount}
            </span>
            <button
              onClick={onSelectAll}
              className="text-[10px] text-white/60 hover:text-white underline"
            >
              Tất cả
            </button>
            <button
              onClick={onClearSelection}
              className="text-[10px] text-white/60 hover:text-white underline"
            >
              Bỏ chọn
            </button>
          </div>
          <div className="flex items-center gap-1">
            {bulkActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => action.onClick([])}
                  className={`p-1.5 rounded transition-all ${
                    action.color === "danger"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  {Icon && <Icon size={14} />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ====== CONTENT AREA ====== */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#C69C6D] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}