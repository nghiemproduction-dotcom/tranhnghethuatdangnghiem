'use client';

/**
 * ============================================================
 * KHUNG CHI TIẾT
 * ============================================================
 * 
 * Panel chi tiết inline (không phải modal popup).
 * Style: Tab bar ngang + Actions góc phải (giống GenericDetailInline)
 */

import React, { ReactNode, useState } from 'react';
import { X, User, Edit3, Trash2, Loader2, Search, ArrowUpDown } from 'lucide-react';

// ============================================================
// TYPES
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
    searchTerm = '',
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
    className = '',
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
    const currentTabConfig = tabs.find(t => t.id === activeTab);
    const TAB_IDS = tabs.map(t => t.id);

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
        
        const currentIndex = TAB_IDS.indexOf(activeTab || '');
        
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
        <div className={`w-full h-full flex flex-col bg-[#050505] overflow-hidden ${className}`}>
            
            {/* ====== TAB BAR ====== */}
            <div className="shrink-0 h-[40px] flex items-center border-b border-white/5 bg-[#0a0a0a]">
                
                {/* Nút đóng + Avatar + Tên - cố định trái */}
                <div className="shrink-0 flex items-center gap-2 px-2 border-r border-white/5">
                    <button 
                        onClick={onClose} 
                        className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded transition-all"
                    >
                        <X size={14} />
                    </button>
                    <div className="flex items-center gap-2 pr-2">
                        <div className="w-6 h-6 rounded-full border border-[#C69C6D]/50 overflow-hidden bg-[#1a1a1a] shrink-0">
                            {avatar ? (
                                <img src={avatar} alt="" className="w-full h-full object-cover" />
                            ) : avatarFallback ? (
                                <div className="w-full h-full flex items-center justify-center">
                                    {avatarFallback}
                                </div>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <User size={10} className="text-[#C69C6D]/50" />
                                </div>
                            )}
                        </div>
                        <span className="text-[12px] font-bold text-[#C69C6D] uppercase tracking-wide max-w-[120px] truncate">
                            {title || '---'}
                        </span>
                    </div>
                </div>

                {/* Tabs - cuộn được */}
                <div className="flex-1 flex items-center gap-1 px-2 overflow-x-auto min-w-0 scrollbar-hide">
                    <style jsx>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
                    {tabs.map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => onTabChange?.(tab.id)}
                            className={`flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase transition-all rounded shrink-0 ${
                                activeTab === tab.id 
                                    ? 'text-[#C69C6D] bg-[#C69C6D]/10' 
                                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {tab.label}
                            <span className={`px-1 py-0.5 rounded text-[8px] ${
                                activeTab === tab.id 
                                    ? 'bg-[#C69C6D] text-black' 
                                    : 'bg-white/10 text-gray-400'
                            }`}>{tabCounts[tab.id] ?? tab.count ?? 0}</span>
                        </button>
                    ))}
                </div>

                {/* Actions - cố định phải */}
                <div className="shrink-0 flex items-center gap-1 px-2 border-l border-white/5">
                    
                    {/* Search (nếu tab hỗ trợ) */}
                    {currentTabConfig?.searchable && onSearch && (
                        <div className="relative flex items-center">
                            {showSearch ? (
                                <div className="flex items-center gap-1 animate-in slide-in-from-right-2">
                                    <input 
                                        autoFocus 
                                        type="text" 
                                        placeholder="Tìm..." 
                                        value={localSearchTerm} 
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="w-24 bg-white/5 border border-white/10 rounded pl-2 pr-6 py-1 text-[10px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#C69C6D]" 
                                    />
                                    <button 
                                        onClick={() => { setShowSearch(false); handleSearch(''); }} 
                                        className="absolute right-1 p-0.5 text-white/40 hover:text-white"
                                    >
                                        <X size={12}/>
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => setShowSearch(true)} 
                                    className="p-1.5 bg-white/5 hover:bg-white/10 text-white/60 rounded transition-all"
                                >
                                    <Search size={14}/>
                                </button>
                            )}
                        </div>
                    )}

                    {/* Sort (nếu tab hỗ trợ) */}
                    {currentTabConfig?.sortable && currentTabConfig.sortOptions && onSortChange && (
                        <div className="relative">
                            <button 
                                onClick={() => setShowSortMenu(!showSortMenu)} 
                                className="p-1.5 bg-white/5 hover:bg-white/10 text-white/60 rounded transition-all"
                            >
                                <ArrowUpDown size={14}/>
                            </button>
                            {showSortMenu && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowSortMenu(false)} />
                                    <div className="absolute top-full mt-1 right-0 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl z-[100] min-w-[100px] overflow-hidden">
                                        {currentTabConfig.sortOptions.map(opt => (
                                            <button 
                                                key={opt.key}
                                                onClick={() => { onSortChange(opt.key); setShowSortMenu(false); }} 
                                                className={`w-full text-left px-3 py-1.5 text-[10px] font-bold ${
                                                    sortBy === opt.key 
                                                        ? 'text-[#C69C6D] bg-[#C69C6D]/10' 
                                                        : 'text-white hover:bg-white/10'
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

                    {/* Nút SỬA */}
                    {showEditButton && onEdit && (
                        <button 
                            onClick={onEdit} 
                            className="p-1.5 bg-[#C69C6D] hover:bg-white text-black rounded transition-all" 
                            title="Sửa"
                        >
                            <Edit3 size={14}/>
                        </button>
                    )}

                    {/* Nút XÓA */}
                    {showDeleteButton && onDelete && (
                        <button 
                            onClick={onDelete} 
                            disabled={deleting} 
                            className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50 transition-all" 
                            title="Xóa"
                        >
                            {deleting ? <Loader2 size={14} className="animate-spin"/> : <Trash2 size={14}/>}
                        </button>
                    )}
                </div>
            </div>

            {/* ====== CONTENT AREA - Scroll dọc + Swipe ====== */}
            <div 
                className="flex-1 overflow-y-auto"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {children}
            </div>
        </div>
    );
}
