'use client';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Database, RefreshCw, Key, Type, Hash, Calendar, ToggleLeft, 
  Search, Loader2, AlertTriangle, Menu, X, Settings, 
  User, MoreHorizontal, Eye, Edit3
} from 'lucide-react';
import { 
    getTablesWithRLSAction, getTableSchemaAction, 
    getTableDataPaginatedAction, updateTableCellAction 
} from '@/app/actions/admindb';

// ... (Giữ nguyên các hàm helper và import cũ)

export default function DataCenter() {
  // ... (Giữ nguyên State logic: tables, data, pagination...)
  const [tables, setTables] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [columns, setColumns] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const pageSize = 20;

  // UI State
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [selectedRowDetail, setSelectedRowDetail] = useState<any>(null);

  useEffect(() => { loadTables(); }, []);
  
  useEffect(() => {
    if (selectedTable) {
      setCurrentPage(1);
      loadTableStructure(selectedTable);
      loadTableData(selectedTable, 1);
      setShowMobileSidebar(false);
    }
  }, [selectedTable]);

  // ... (Giữ nguyên logic API loadTables, loadTableData...)
  const loadTables = async () => {
      setLoading(true);
      try {
          const res = await getTablesWithRLSAction();
          if (res.success) setTables(res.data || []);
      } catch (e) {} finally { setLoading(false); }
  };

  const loadTableStructure = async (tableName: string) => {
      const res = await getTableSchemaAction(tableName);
      if (res.success) setColumns(res.data as any[]);
  };

  const loadTableData = async (tableName: string, page: number) => {
      setLoadingData(true);
      try {
          const res = await getTableDataPaginatedAction(tableName, page, pageSize);
          if (res.success) {
              const data = Array.isArray(res.data) ? res.data : [];
              if (page === 1) setTableData(data);
              else setTableData(prev => [...prev, ...data]);
              setTotalRows(res.total || 0);
          }
      } catch (e) {} finally { setLoadingData(false); }
  };

  // 🟢 HELPER: Map data types to icons
  const getTypeIcon = (dataType: string) => {
      if (dataType.includes('text') || dataType.includes('varchar')) return <Type size={14} />;
      if (dataType.includes('int') || dataType.includes('numeric') || dataType.includes('float')) return <Hash size={14} />;
      if (dataType.includes('bool')) return <ToggleLeft size={14} />;
      if (dataType.includes('timestamp') || dataType.includes('date')) return <Calendar size={14} />;
      if (dataType.includes('uuid')) return <Key size={14} />;
      return <Database size={14} />;
  };

  // 🟢 HELPER: Trích xuất thông tin hiển thị cho Card
  const getCardInfo = (row: any) => {
      // 1. Ảnh: Tìm cột có tên chứa 'anh', 'image', 'avatar'
      const imgKey = columns.find(c => /hinh_anh|avatar|image|photo|picture/i.test(c.column_name))?.column_name;
      
      // 2. Tên chính: Tìm cột 'ho_ten', 'name', 'title' hoặc cột text đầu tiên ko phải ID
      const nameKey = columns.find(c => /ho_ten|name|ten|title|tieu_de/i.test(c.column_name))?.column_name 
                      || columns.find(c => c.data_type.includes('text') && c.column_name !== 'id')?.column_name 
                      || 'id';
      
      // 3. Phụ đề: Vị trí, role, email...
      const subKey = columns.find(c => /vi_tri|role|chuc_vu|email|mo_ta/i.test(c.column_name) && c.column_name !== nameKey)?.column_name;

      return {
          img: imgKey ? row[imgKey] : null,
          title: row[nameKey] ? String(row[nameKey]) : 'NO NAME',
          subtitle: subKey ? String(row[subKey]) : '---',
          id: row.id
      };
  };

  return (
    <div className="w-full h-full flex flex-col bg-transparent relative">
        
        {/* MOBILE SIDEBAR (Drawer) */}
        {showMobileSidebar && (
            <div className="absolute inset-0 z-50 flex md:hidden">
                <div className="w-[240px] bg-[#0F0F0F]/95 backdrop-blur-xl border-r border-[#C69C6D]/30 flex flex-col h-full animate-hologram">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center">
                        <span className="text-xs font-black text-[#C69C6D] uppercase glow-text">SELECT DATABASE</span>
                        <button onClick={() => setShowMobileSidebar(false)}><X size={20} className="text-white"/></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2">
                        {tables.map((table) => (
                            <button key={table.table_name} onClick={() => setSelectedTable(table.table_name)}
                                className={`w-full flex items-center gap-3 px-4 py-3 mb-1 text-left clip-game-btn transition-all
                                    ${selectedTable === table.table_name 
                                        ? 'bg-[#C69C6D] text-black font-bold' 
                                        : 'bg-white/5 text-white/60 hover:text-white'
                                    }`}>
                                <Database size={14} />
                                <span className="flex-1 truncate text-[10px] font-mono uppercase">{table.table_name}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex-1 bg-black/80" onClick={() => setShowMobileSidebar(false)}></div>
            </div>
        )}

        {/* TOOLBAR */}
        <div className="h-[50px] flex items-center justify-between px-4 bg-[#0a0a0a]/80 backdrop-blur border-b border-white/5 shrink-0">
            <div className="flex items-center gap-3">
                <button onClick={() => setShowMobileSidebar(true)} className="md:hidden text-[#C69C6D] p-2 bg-[#C69C6D]/10 rounded clip-game-btn"><Menu size={18} /></button>
                {selectedTable ? (
                    <div className="flex flex-col">
                        <span className="text-[#C69C6D] font-black text-xs uppercase tracking-[0.1em] glow-text">{selectedTable}</span>
                        <span className="text-white/30 text-[9px] font-mono">{totalRows} ITEMS</span>
                    </div>
                ) : <span className="text-white/30 text-xs italic">Chưa chọn bảng</span>}
            </div>
            
            <div className="flex items-center gap-2">
                <button onClick={() => { setCurrentPage(1); loadTableData(selectedTable!, 1); }} className="p-2 text-white/50 hover:text-[#C69C6D]"><RefreshCw size={16} className={loadingData ? "animate-spin" : ""}/></button>
            </div>
        </div>

        {/* 🟢 CARD GRID (GAME STYLE) */}
        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
            {!selectedTable ? (
                <div className="h-full flex flex-col items-center justify-center text-white/20">
                    <Database size={64} className="mb-4 opacity-20"/>
                    <p className="text-xs uppercase tracking-widest">Select a data source</p>
                    <button onClick={() => setShowMobileSidebar(true)} className="mt-6 px-6 py-3 bg-[#C69C6D] text-black font-bold text-xs clip-game-btn glow-border">OPEN LIST</button>
                </div>
            ) : tableData.length === 0 && !loadingData ? (
                <div className="text-center py-20 text-white/30 text-xs">NO DATA FOUND</div>
            ) : (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 pb-10">
                        {tableData.map((row, idx) => {
                            const info = getCardInfo(row);
                            return (
                                <div key={idx} onClick={() => setSelectedRowDetail(row)}
                                    className="group relative aspect-square bg-[#121212] border border-white/10 hover:border-[#C69C6D] transition-all flex flex-col items-center justify-center p-5 animate-hologram clip-game-card cursor-pointer overflow-hidden"
                                    style={{ animationDelay: `${idx * 0.05}s` }}
                                >
                                    {/* Background Grid Effect */}
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/pixel-weave.png')] opacity-10 pointer-events-none"></div>
                                    
                                    {/* Avatar */}
                                    <div className="relative w-20 h-20 rounded-full border-2 border-[#C69C6D]/30 group-hover:border-[#C69C6D] p-0.5 transition-colors mb-3 shrink-0">
                                        {info.img ? (
                                            <img src={info.img} alt="img" className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full rounded-full bg-[#1a1a1a] flex items-center justify-center text-white/20"><User size={32}/></div>
                                        )}
                                        {/* Status Dot */}
                                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-black rounded-full shadow-[0_0_5px_lime]"></div>
                                    </div>

                                    {/* Info */}
                                    <div className="text-center w-full z-10">
                                        <h3 className="text-sm font-bold text-white truncate w-full mb-1 group-hover:text-[#C69C6D] transition-colors">{info.title}</h3>
                                        <p className="text-[10px] text-white/40 uppercase tracking-wide truncate w-full border-t border-white/5 pt-1.5">{info.subtitle}</p>
                                    </div>

                                    {/* Hover Actions */}
                                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                        <button className="text-[#C69C6D] hover:scale-125 transition-transform"><Eye size={20}/></button>
                                        <button className="text-white hover:scale-125 transition-transform"><Edit3 size={20}/></button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* LOAD MORE BUTTON */}
                    {tableData.length < totalRows && (
                        <div className="pb-8 pt-2">
                            <button 
                                onClick={() => { setCurrentPage(prev => prev + 1); loadTableData(selectedTable, currentPage + 1); }}
                                className="w-full py-3 bg-[#1a1a1a] border border-white/10 text-[#C69C6D] text-[10px] font-bold uppercase tracking-[0.2em] clip-game-btn hover:bg-[#C69C6D] hover:text-black transition-all"
                            >
                                {loadingData ? <Loader2 className="animate-spin mx-auto" size={16}/> : 'LOAD MORE DATA'}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>

        {/* MODAL DETAIL */}
        {selectedRowDetail && (
            <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-end sm:items-center justify-center animate-in fade-in">
                <div className="w-full sm:w-[450px] h-[70vh] sm:h-auto bg-[#0a0a0a] border-t sm:border border-[#C69C6D] shadow-[0_0_50px_rgba(198,156,109,0.2)] flex flex-col animate-in slide-in-from-bottom duration-300">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#111]">
                        <span className="text-xs font-black text-[#C69C6D] uppercase tracking-widest glow-text">DATA DETAILS</span>
                        <button onClick={() => setSelectedRowDetail(null)}><X size={20} className="text-white hover:text-red-500"/></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                        {columns.map(col => (
                            <div key={col.column_name} className="group">
                                <span className="text-[9px] text-[#C69C6D]/70 uppercase font-bold tracking-wider mb-1 flex items-center gap-2">
                                    {getTypeIcon(col.data_type)} {col.column_name}
                                </span>
                                <div className="text-sm text-white/90 font-mono bg-white/5 p-3 rounded border border-white/5 break-all group-hover:border-[#C69C6D]/30 transition-colors">
                                    {String(selectedRowDetail[col.column_name] ?? 'null')}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 bg-[#050505] border-t border-white/10 flex gap-3">
                        <button className="flex-1 py-3 bg-[#C69C6D] text-black font-bold text-xs uppercase clip-game-btn hover:brightness-110">EDIT</button>
                        <button onClick={() => setSelectedRowDetail(null)} className="flex-1 py-3 bg-white/10 text-white font-bold text-xs uppercase clip-game-btn hover:bg-white/20">CLOSE</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}