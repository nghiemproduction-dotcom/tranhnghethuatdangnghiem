'use client'
import { useState, useMemo, useEffect } from 'react'
import { FieldConfig } from '@/app/types/core'
import { Search, Plus, ArrowUpDown, ArrowUp, ArrowDown, User, Trophy, Star, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Trash2, CheckSquare, Square, ListChecks, Settings2, Check, X, Filter, ChevronDown, Edit3 } from 'lucide-react'
import { useUser } from '@/lib/UserContext'
import { createClient } from '@/utils/supabase/client' // [REALTIME]
import { useRouter } from 'next/navigation' // [REALTIME]

export interface GenericDisplayConfig {
  colTitle?: string;       
  colSubTitle?: string;    
  colImage?: string;       
  tabFilterKey?: string;   
  gamification?: {         
    hasRank: boolean;
    rankKey?: string;
    scoreKey?: string;
  };
}

// [GENERICS] Sử dụng T để định kiểu dữ liệu chặt chẽ hơn
interface GenericListProps<T extends { id: string; [key: string]: any }> {
  data: T[]
  fields: FieldConfig[]
  config?: GenericDisplayConfig 
  tableName?: string // [REALTIME] Cần tên bảng để subscribe
  
  onView: (item: T) => void
  onEdit: (item: T) => void
  onDelete: (id: string) => void
  onCloseParent: () => void
  onCreate: () => void
  onBulkDelete?: (ids: string[]) => void
}

const ITEMS_PER_PAGE = 12;

// [GENERICS] Component nhận Generic T
export default function GenericList<T extends { id: string; [key: string]: any }>({ 
  data, fields, config, tableName,
  onView, onEdit, onDelete, onCloseParent, onCreate, onBulkDelete 
}: GenericListProps<T>) {
  
  const { user } = useUser();
  const router = useRouter(); // [REALTIME]
  const supabase = createClient(); // [REALTIME]

  const rawRole = user?.phan_loai || user?.role || 'nhan_vien';
  const userRole = String(rawRole).toLowerCase().trim();
  const currentUserId = user?.id;

  const isAdmin = userRole === 'admin';
  const isManager = userRole === 'quanly' || userRole === 'quan_ly';
  const canCreate = isAdmin || isManager; 
  const canDeleteGlobal = isAdmin;        

  const displayFields = useMemo(() => {
    if (isAdmin || isManager) return fields; 
    return fields.filter(f => f.showInList);
  }, [fields, isAdmin, isManager]);

  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)
  const [showSortMenu, setShowSortMenu] = useState(false)
  
  const smartFilterField = useMemo(() => {
      if (config?.tabFilterKey) {
          return displayFields.find(f => f.key === config.tabFilterKey);
      }
      return displayFields.find(f => f.type === 'select' && f.showInList);
  }, [displayFields, config]);

  const [activeFilterValue, setActiveFilterValue] = useState<string>('all')
  const [showFilterMenu, setShowFilterMenu] = useState(false) 
  
  const [currentPage, setCurrentPage] = useState(1)
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const [showColumnMenu, setShowColumnMenu] = useState(false)
  const [visibleColumnKeys, setVisibleColumnKeys] = useState<Set<string>>(
      new Set(displayFields.filter(f => f.showInList).map(f => f.key))
  )

  useEffect(() => {
      setVisibleColumnKeys(new Set(displayFields.filter(f => f.showInList).map(f => f.key)));
  }, [displayFields]);

  useEffect(() => {
    setCurrentPage(1)
    setSelectedIds(new Set())
  }, [searchTerm, activeFilterValue, sortConfig])

  // --- [REALTIME] TÍCH HỢP LẮNG NGHE THAY ĐỔI ---
  useEffect(() => {
      if (!tableName) return;

      console.log(`📡 [Realtime] Đang lắng nghe bảng: ${tableName}`);
      const channel = supabase
          .channel(`realtime-${tableName}`)
          .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, (payload) => {
              console.log('⚡ Data thay đổi:', payload);
              router.refresh(); // Refresh dữ liệu server component
          })
          .subscribe();

      return () => {
          supabase.removeChannel(channel);
      };
  }, [tableName, router, supabase]);
  // ------------------------------------------------

  const getCategoryCount = (value: string) => {
      if (!smartFilterField) return 0;
      return data.filter(item => String(item[smartFilterField.key]) === value).length;
  }

  const getCurrentFilterLabel = () => {
      if (activeFilterValue === 'all') return 'TẤT CẢ';
      if (smartFilterField?.options) {
          const option = smartFilterField.options.find((o: any) => o.value === activeFilterValue);
          return option ? option.label : activeFilterValue;
      }
      return activeFilterValue;
  }

  const getLabel = (key: string, value: any) => {
     const field = displayFields.find(f => f.key === key)
     if (field?.type === 'select' && field.options) return field.options.find(o => o.value === value)?.label || value
     return value
  }

  const processedData = useMemo(() => {
    let result = [...(data || [])]
    
    if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase()
        result = result.filter(item => displayFields.filter(f => f.showInList).some(f => {
            const value = item[f.key]
            return value && String(value).toLowerCase().includes(lowerTerm)
        }))
    }

    if (smartFilterField && activeFilterValue !== 'all') {
        result = result.filter(item => String(item[smartFilterField.key]) === activeFilterValue)
    }

    if (sortConfig) {
        result.sort((a, b) => {
            const aValue = a[sortConfig.key] ?? ''
            const bValue = b[sortConfig.key] ?? ''
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
            return 0
        })
    }
    return result
  }, [data, searchTerm, sortConfig, activeFilterValue, displayFields, smartFilterField])

  const totalPages = Math.ceil(processedData.length / ITEMS_PER_PAGE)
  const paginatedData = processedData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handleSort = (key: string) => {
    setSortConfig(current => {
        if (current?.key === key) return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
        return { key, direction: 'asc' }
    })
    setShowSortMenu(false)
  }

  const toggleColumn = (key: string) => {
      const newSet = new Set(visibleColumnKeys);
      if (newSet.has(key)) newSet.delete(key);
      else newSet.add(key);
      setVisibleColumnKeys(newSet);
  }

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        if (currentPage <= 4) pages.push(1, 2, 3, 4, 5, '...', totalPages);
        else if (currentPage >= totalPages - 3) pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        else pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  }

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedIds(newSet)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedData.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(paginatedData.map(i => i.id)))
  }

  const filterOptions = useMemo(() => {
      if (!smartFilterField) return [];
      if (smartFilterField.options) return smartFilterField.options;
      const uniqueValues = Array.from(new Set(data.map(item => String(item[smartFilterField.key] || '')))).filter(Boolean);
      return uniqueValues.map(val => ({ value: val, label: val }));
  }, [smartFilterField, data]);

  const btnStyle = "flex shrink-0 items-center justify-center w-9 h-9 rounded-lg bg-[#1a1a1a] border border-[#C69C6D]/30 text-[#C69C6D] hover:bg-[#C69C6D] hover:text-black transition-all shadow-[0_0_10px_rgba(198,156,109,0.1)] active:scale-95";
  const btnActiveStyle = "flex shrink-0 items-center justify-center w-9 h-9 rounded-lg bg-[#C69C6D] border border-[#C69C6D] text-black shadow-[0_0_15px_rgba(198,156,109,0.4)] transition-all active:scale-95";

  return (
    <div className="flex flex-col h-full w-full bg-transparent animate-in fade-in duration-300">
        
        {/* === TOOLBAR === */}
        <div className="shrink-0 h-[50px] flex items-center justify-between px-3 md:px-4 relative z-20 gap-2 md:gap-4">
            
            {/* TRÁI: Filter Dropdown & Search */}
            <div className="flex-1 min-w-0">
                {showSearch ? (
                    <div className="flex items-center w-full animate-in slide-in-from-left-5 duration-200 gap-2 bg-[#111] p-1 rounded border border-[#C69C6D]/30">
                        <Search size={16} className="text-[#C69C6D] shrink-0 ml-2" />
                        <input 
                            autoFocus
                            type="text" 
                            placeholder="Nhập từ khóa..." 
                            className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-gray-600 font-bold py-1"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Escape' && setShowSearch(false)}
                        />
                        <button onClick={() => { setSearchTerm(''); setShowSearch(false) }} className="p-1 hover:bg-white/10 rounded text-red-500 shrink-0"><X size={16} /></button>
                    </div>
                ) : (
                    <div className="relative inline-block max-w-full">
                        <button 
                            onClick={() => setShowFilterMenu(!showFilterMenu)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs font-bold uppercase
                            ${activeFilterValue !== 'all' 
                                ? 'bg-[#C69C6D] text-black border-[#C69C6D] shadow-[0_0_10px_rgba(198,156,109,0.3)]' 
                                : 'bg-[#1a1a1a] text-[#C69C6D] border-[#C69C6D]/30 hover:border-[#C69C6D]'}`}
                        >
                            <Filter size={14} />
                            <span className="truncate max-w-[120px]">{getCurrentFilterLabel()}</span>
                            <span className="bg-black/20 px-1.5 py-0.5 rounded text-[10px]">
                                {activeFilterValue === 'all' ? (data?.length || 0) : getCategoryCount(activeFilterValue)}
                            </span>
                            <ChevronDown size={14} className={`transition-transform duration-200 ${showFilterMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {showFilterMenu && (
                            <>
                                <div className="fixed inset-0 z-30" onClick={() => setShowFilterMenu(false)}/>
                                <div className="absolute top-full left-0 mt-2 w-64 bg-[#0a0a0a] border border-[#333] rounded shadow-2xl z-40 py-1 animate-in zoom-in-95 origin-top-left max-h-[60vh] overflow-y-auto custom-scrollbar">
                                    <p className="px-3 py-2 text-[10px] uppercase font-bold text-gray-500 border-b border-white/5 sticky top-0 bg-[#0a0a0a] z-10">
                                        Lọc theo {smartFilterField?.label || 'Danh mục'}
                                    </p>
                                    <button 
                                        onClick={() => { setActiveFilterValue('all'); setShowFilterMenu(false); }}
                                        className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-300 hover:text-[#C69C6D] hover:bg-white/5 flex justify-between items-center uppercase border-b border-white/5"
                                    >
                                        <span>TẤT CẢ</span>
                                        <div className="flex items-center gap-2">
                                            <span className="bg-white/10 px-1.5 rounded text-[9px] text-gray-400">{data?.length || 0}</span>
                                            {activeFilterValue === 'all' && <Check size={14} className="text-[#C69C6D]"/>}
                                        </div>
                                    </button>
                                    {filterOptions.map((opt: any) => {
                                        const count = getCategoryCount(opt.value);
                                        return (
                                            <button 
                                                key={opt.value} 
                                                onClick={() => { setActiveFilterValue(opt.value); setShowFilterMenu(false); }}
                                                className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-300 hover:text-[#C69C6D] hover:bg-white/5 flex justify-between items-center uppercase border-b border-white/5 last:border-0"
                                            >
                                                <span className="truncate">{opt.label}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-white/10 px-1.5 rounded text-[9px] text-gray-400">{count}</span>
                                                    {activeFilterValue === opt.value && <Check size={14} className="text-[#C69C6D]"/>}
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* PHẢI: Buttons */}
            <div className="flex items-center gap-2 shrink-0">
                {!showSearch && <button onClick={() => setShowSearch(true)} className={btnStyle} title="Tìm kiếm"><Search size={16} /></button>}
                
                <div className="relative">
                    <button onClick={() => setShowSortMenu(!showSortMenu)} className={sortConfig ? btnActiveStyle : btnStyle} title="Sắp xếp"><ArrowUpDown size={16} /></button>
                    {showSortMenu && (
                        <>
                        <div className="fixed inset-0 z-30" onClick={() => setShowSortMenu(false)}/>
                        <div className="absolute top-full right-0 mt-2 w-48 bg-[#0a0a0a] border border-[#333] rounded shadow-2xl z-40 py-1 animate-in zoom-in-95 origin-top-right">
                            <p className="px-3 py-2 text-[10px] uppercase font-bold text-gray-500 border-b border-white/5">Sắp xếp theo</p>
                            {displayFields.filter(f => f.showInList).map(f => (
                                <button key={f.key} onClick={() => handleSort(f.key)} className="w-full text-left px-4 py-2 text-xs font-bold text-gray-300 hover:text-[#C69C6D] hover:bg-white/5 flex justify-between uppercase">
                                    {f.label}
                                    {sortConfig?.key === f.key && (sortConfig.direction === 'asc' ? <ArrowUp size={12}/> : <ArrowDown size={12}/>)}
                                </button>
                            ))}
                        </div>
                        </>
                    )}
                </div>

                <div className="relative">
                    <button onClick={() => setShowColumnMenu(!showColumnMenu)} className={btnStyle} title="Chọn cột hiển thị"><Settings2 size={18} /></button>
                    {showColumnMenu && (
                        <>
                        <div className="fixed inset-0 z-30" onClick={() => setShowColumnMenu(false)}/>
                        <div className="absolute top-full right-0 mt-2 w-56 bg-[#0a0a0a] border border-[#333] rounded shadow-2xl z-40 py-1 animate-in zoom-in-95 origin-top-right">
                            <p className="px-3 py-2 text-[10px] uppercase font-bold text-gray-500 border-b border-white/5">Hiển thị thông tin</p>
                            {displayFields.map(f => (
                                <button key={f.key} onClick={() => toggleColumn(f.key)} className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-300 hover:text-[#C69C6D] hover:bg-white/5 flex justify-between items-center uppercase border-b border-white/5 last:border-0">
                                    <span>{f.label}</span>
                                    {visibleColumnKeys.has(f.key) ? <CheckSquare size={14} className="text-[#C69C6D]"/> : <Square size={14} className="text-gray-600"/>}
                                </button>
                            ))}
                        </div>
                        </>
                    )}
                </div>

                {/* --- NHÓM NÚT CHỨC NĂNG THEO QUYỀN --- */}
                
                {/* 1. Nút Chọn Nhiều (Chỉ Admin/Quản lý) */}
                {(canCreate || canDeleteGlobal) && (
                    <>
                        <div className="w-[1px] h-5 bg-white/10 mx-1"></div>
                        <button onClick={() => { setIsSelectionMode(!isSelectionMode); if(isSelectionMode) setSelectedIds(new Set()); }} className={isSelectionMode ? btnActiveStyle : btnStyle} title="Chọn nhiều"><ListChecks size={16} /></button>
                    </>
                )}

                {/* 2. Select All & Bulk Delete */}
                {isSelectionMode && (
                    <>
                        <button onClick={toggleSelectAll} className={btnStyle} title="Chọn tất cả">{selectedIds.size === paginatedData.length && paginatedData.length > 0 ? <CheckSquare size={16}/> : <Square size={16}/>}</button>
                        
                        {canDeleteGlobal && selectedIds.size > 0 && (
                            <button onClick={() => { onBulkDelete?.(Array.from(selectedIds)); setSelectedIds(new Set()); }} className="flex shrink-0 items-center gap-2 px-3 h-9 bg-red-600 text-white border border-red-500 hover:bg-red-700 rounded-lg transition-all text-[10px] font-bold uppercase animate-in zoom-in shadow-[0_0_10px_rgba(220,38,38,0.4)]"><Trash2 size={14} /> <span className="hidden md:inline">XÓA ({selectedIds.size})</span></button>
                        )}
                    </>
                )}

                {/* 3. Nút Thêm Mới */}
                {canCreate && (
                    <button onClick={onCreate} className={btnActiveStyle} title="Thêm mới"><Plus size={18} strokeWidth={3} /></button>
                )}
            </div>
        </div>

        {/* === CONTENT AREA === */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] relative flex flex-col bg-transparent">
             {processedData.length === 0 ? (
                 <div className="flex-1 flex flex-col h-full w-full select-none bg-transparent">
                     <div className="flex-1 flex flex-col items-center justify-center w-full">
                        <div className="mb-6 p-8 rounded-full bg-[#0a0a0a]/50 border border-white/5 shadow-[0_0_60px_rgba(0,0,0,0.5)]">
                            <Trophy size={80} strokeWidth={0.5} className="text-[#C69C6D]/20 drop-shadow-[0_0_20px_rgba(198,156,109,0.1)]" />
                        </div>
                        <p className="text-xl font-black uppercase tracking-[0.25em] text-[#C69C6D] opacity-50 mb-2">Không tìm thấy dữ liệu</p>
                        <p className="text-xs text-gray-600 font-bold uppercase tracking-widest">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                     </div>
                     <div className="pb-5 w-full flex justify-center shrink-0">
                        <button onClick={() => { setSearchTerm(''); setActiveFilterValue('all'); }} className="px-10 py-3 bg-[#111] hover:bg-[#C69C6D] hover:text-black text-[#C69C6D] border border-[#C69C6D]/30 rounded-lg text-xs font-bold uppercase tracking-[0.15em] transition-all shadow-lg active:scale-95 hover:shadow-[0_0_20px_rgba(198,156,109,0.3)]">Reset Bộ Lọc</button>
                     </div>
                 </div>
             ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 pb-4">
                    {paginatedData.map((item, idx) => {
                        const isSelected = selectedIds.has(item.id);
                        
                        const titleKey = config?.colTitle || fields.find(f => f.type === 'text')?.key || 'id';
                        const subKey = config?.colSubTitle;
                        const imageKey = config?.colImage || 'hinh_anh';

                        const titleVal = item[titleKey] || '---';
                        const subVal = subKey ? getLabel(subKey, item[subKey]) : '';
                        const imageVal = item[imageKey] || item['avatar'] || item['image']; 

                        const gameConfig = config?.gamification;
                        const rankVal = gameConfig?.hasRank && gameConfig.rankKey ? item[gameConfig.rankKey] : null;
                        const scoreVal = gameConfig?.hasRank && gameConfig.scoreKey ? item[gameConfig.scoreKey] : null;

                        const canEditItem = isAdmin || isManager || item.id === currentUserId;

                        return (
                            <div 
                                key={item.id || idx} 
                                onClick={() => { 
                                    if (isSelectionMode) {
                                        toggleSelect(item.id); 
                                    } else {
                                        onView(item);
                                    }
                                }}
                                className={`group relative bg-[#111] rounded-lg border hover:shadow-[0_0_20px_rgba(198,156,109,0.2)] transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-[140px]
                                ${isSelected ? 'border-[#C69C6D] shadow-[0_0_15px_rgba(198,156,109,0.15)] bg-[#1a1a1a]' : 'border-white/5 hover:border-[#C69C6D]'}`}
                            >
                                <div className={`absolute left-0 top-0 bottom-0 w-[2px] transition-all ${isSelected ? 'bg-[#C69C6D] opacity-100' : 'bg-gradient-to-b from-[#C69C6D] to-transparent opacity-50 group-hover:opacity-100'}`}/>
                                {isSelectionMode && (
                                    <div className="absolute top-2 right-2 z-10 p-1 rounded hover:bg-black/50 transition-colors animate-in zoom-in">
                                        {isSelected ? <CheckSquare size={18} className="text-[#C69C6D]" /> : <Square size={18} className="text-gray-600" />}
                                    </div>
                                )}
                                {!isSelectionMode && (
                                    <div className="absolute top-2 right-2 z-10 flex gap-1">
                                         {/* Nút Edit nhanh */}
                                         {canEditItem && <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="p-1.5 rounded-md hover:bg-[#C69C6D] hover:text-black text-gray-500 transition-colors opacity-0 group-hover:opacity-100"><Edit3 size={14}/></button>}
                                         
                                         {/* Nút Delete nhanh (Cho Admin) */}
                                         {canDeleteGlobal && <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="p-1.5 rounded-md hover:bg-red-600 hover:text-white text-gray-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={14}/></button>}
                                    </div>
                                )}

                                <div className="p-4 flex items-center gap-4 border-b border-white/5 bg-gradient-to-r from-[#161616] to-transparent">
                                    {visibleColumnKeys.has(imageKey) && (
                                        <div className={`w-12 h-12 shrink-0 rounded-full border-2 overflow-hidden bg-black flex items-center justify-center transition-colors shadow-lg relative ${isSelected ? 'border-[#C69C6D]' : 'border-[#333] group-hover:border-[#C69C6D]'}`}>
                                            {imageVal ? <img src={imageVal} alt="img" className="w-full h-full object-cover" /> : <User size={24} className="text-gray-600 group-hover:text-[#C69C6D]" />}
                                        </div>
                                    )}
                                    
                                    <div className="flex flex-col min-w-0">
                                        <h3 className={`text-sm font-black uppercase truncate tracking-wide transition-colors ${isSelected ? 'text-[#C69C6D]' : 'text-gray-200 group-hover:text-[#C69C6D]'}`}>
                                            {titleVal}
                                        </h3>
                                        {subVal && (
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate">
                                                {subVal}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {(rankVal || scoreVal !== null) && (
                                    <div className="px-4 py-2 bg-[#0a0a0a] flex items-center justify-between gap-2 mt-auto">
                                        {rankVal && <div className="flex items-center gap-1.5 bg-[#1a1a1a] px-2 py-1 rounded border border-white/5"><Trophy size={10} className="text-yellow-500" /><span className="text-[9px] font-bold text-gray-300 uppercase">{rankVal}</span></div>}
                                        {scoreVal !== null && <div className="flex items-center gap-1.5 bg-[#1a1a1a] px-2 py-1 rounded border border-white/5"><Star size={10} className="text-[#C69C6D]" /><span className="text-[9px] font-bold text-[#C69C6D]">{scoreVal}</span></div>}
                                    </div>
                                )}
                                
                                <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-white/5 to-transparent pointer-events-none"/>
                            </div>
                        )
                    })}
                 </div>
             )}
        </div>

        {/* === PAGINATION FOOTER === */}
        {processedData.length > 0 && totalPages > 1 && (
            <div className="shrink-0 h-[50px] flex items-center justify-center gap-2 border-t border-white/5 bg-[#050505]/50 backdrop-blur-sm relative z-20">
                <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded bg-[#111] text-gray-500 hover:text-[#C69C6D] hover:bg-[#222] disabled:opacity-30 disabled:hover:bg-[#111] transition-all"><ChevronsLeft size={16} /></button>
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded bg-[#111] text-gray-500 hover:text-[#C69C6D] hover:bg-[#222] disabled:opacity-30 disabled:hover:bg-[#111] transition-all"><ChevronLeft size={16} /></button>
                <div className="flex items-center gap-1 mx-2">
                    {getPageNumbers().map((page, idx) => (
                        <button key={idx} onClick={() => typeof page === 'number' && setCurrentPage(page)} disabled={page === '...'} className={`min-w-[32px] h-8 px-2 flex items-center justify-center rounded text-xs font-bold transition-all ${page === currentPage ? 'bg-[#C69C6D] text-black shadow-[0_0_10px_rgba(198,156,109,0.4)] scale-110 z-10' : 'bg-[#111] text-gray-500 hover:text-white hover:bg-[#222]'} ${page === '...' ? 'cursor-default bg-transparent text-gray-700 hover:bg-transparent' : ''}`}>{page}</button>
                    ))}
                </div>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-8 h-8 flex items-center justify-center rounded bg-[#111] text-gray-500 hover:text-[#C69C6D] hover:bg-[#222] disabled:opacity-30 disabled:hover:bg-[#111] transition-all"><ChevronRight size={16} /></button>
                <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="w-8 h-8 flex items-center justify-center rounded bg-[#111] text-gray-500 hover:text-[#C69C6D] hover:bg-[#222] disabled:opacity-30 disabled:hover:bg-[#111] transition-all"><ChevronsRight size={16} /></button>
                <div className="absolute right-6 text-[10px] text-gray-600 font-bold uppercase tracking-widest hidden md:block">Page {currentPage} / {totalPages}</div>
            </div>
        )}
    </div>
  )
}