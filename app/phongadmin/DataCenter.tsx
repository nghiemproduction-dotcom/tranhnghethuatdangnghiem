'use client';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Database, Table2, Settings, RefreshCw, ChevronRight, ChevronLeft,
  Edit3, Key, Type, Hash, Calendar, ToggleLeft, Search, LayoutGrid, Loader2, AlertTriangle, CheckCircle2,
  Filter, Download, MoreHorizontal // Import thêm icon giống Dashboard
} from 'lucide-react';
import { 
    getTablesWithRLSAction, 
    getTableSchemaAction, 
    getTableDataPaginatedAction,
    updateTableCellAction 
} from '@/app/actions/admindb';

interface TableInfo { table_name: string; rls_enabled: boolean; }
interface ColumnInfo { column_name: string; data_type: string; is_nullable: string; column_default: string | null; }
interface TableData { [key: string]: any; }

const getTypeIcon = (type: string) => {
  const lowerType = type?.toLowerCase() || '';
  if (lowerType.includes('int') || lowerType.includes('numeric') || lowerType.includes('float')) return <Hash size={14} className="text-blue-400" />;
  if (lowerType.includes('text') || lowerType.includes('varchar') || lowerType.includes('char')) return <Type size={14} className="text-green-400" />;
  if (lowerType.includes('bool')) return <ToggleLeft size={14} className="text-purple-400" />;
  if (lowerType.includes('date') || lowerType.includes('time') || lowerType.includes('timestamp')) return <Calendar size={14} className="text-orange-400" />;
  if (lowerType.includes('uuid')) return <Key size={14} className="text-yellow-400" />;
  return <Type size={14} className="text-gray-400" />;
};

export default function DataCenter() {
  // --- STATE ---
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [tableData, setTableData] = useState<TableData[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [tableSearchTerm, setTableSearchTerm] = useState(''); // Tìm tên bảng
  const [dataSearchTerm, setDataSearchTerm] = useState('');   // Tìm dữ liệu trong bảng
  
  const [viewMode, setViewMode] = useState<'data' | 'structure'>('data'); // Mặc định vào xem Data luôn cho tiện
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalRows, setTotalRows] = useState(0);
  
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; colName: string; value: any } | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // --- EFFECTS ---
  useEffect(() => { loadTables(); }, []);
  
  useEffect(() => {
    if (selectedTable) {
      setCurrentPage(1);
      loadTableStructure(selectedTable);
      if (viewMode === 'data') loadTableData(selectedTable, 1);
      setEditingCell(null);
    }
  }, [selectedTable]);

  useEffect(() => {
    if (selectedTable && viewMode === 'data') {
        loadTableData(selectedTable, currentPage);
    }
  }, [viewMode, currentPage]);

  useEffect(() => {
    if (editingCell && editInputRef.current) editInputRef.current.focus();
  }, [editingCell]);

  useEffect(() => {
      if (successMsg) {
          const timer = setTimeout(() => setSuccessMsg(null), 3000);
          return () => clearTimeout(timer);
      }
  }, [successMsg]);

  // --- API ACTIONS ---
  const loadTables = async () => {
    setLoading(true); setErrorMsg(null);
    try {
      const res = await getTablesWithRLSAction();
      if (res.success && res.data) setTables(res.data);
      else throw new Error(res.error || "Lỗi tải bảng");
    } catch (err: any) { setErrorMsg(err.message); } finally { setLoading(false); }
  };

  const loadTableStructure = async (tableName: string) => {
    try {
      const res = await getTableSchemaAction(tableName);
      if (res.success && res.data) setColumns(res.data as ColumnInfo[]);
    } catch (err) { console.error(err); }
  };

  const loadTableData = async (tableName: string, page: number) => {
    setLoadingData(true);
    try {
      const res = await getTableDataPaginatedAction(tableName, page, pageSize);
      if (res.success && res.data) {
         setTableData(res.data);
         setTotalRows(res.total || 0);
      } else {
         setErrorMsg("Lỗi tải dữ liệu: " + res.error);
         setTableData([]);
      }
    } catch (err) { setTableData([]); } 
    finally { setLoadingData(false); }
  };

  const startEditing = (rowIndex: number, colName: string, currentValue: any) => {
      if (colName === 'id' || colName === 'tao_luc') return;
      setEditingCell({ rowIndex, colName, value: currentValue });
  };

  const handleSaveCell = async () => {
      if (!editingCell || !selectedTable) return;
      const { rowIndex, colName, value } = editingCell;
      const rowId = tableData[rowIndex]?.id;
      const oldData = [...tableData];
      const newData = [...tableData];
      newData[rowIndex] = { ...newData[rowIndex], [colName]: value };
      setTableData(newData);
      setEditingCell(null);

      try {
          const res = await updateTableCellAction(selectedTable, rowId, colName, value);
          if (res.success) setSuccessMsg("Đã lưu thay đổi");
          else throw new Error(res.error);
      } catch (err: any) {
          alert("Lỗi cập nhật: " + err.message);
          setTableData(oldData);
      }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSaveCell();
      if (e.key === 'Escape') setEditingCell(null);
  };

  // Filter tables in sidebar
  const filteredTables = tables.filter(t => t.table_name.toLowerCase().includes(tableSearchTerm.toLowerCase()));
  const totalPages = Math.ceil(totalRows / pageSize);

  return (
    <div className="w-full h-full flex overflow-hidden bg-[#121212]">
        
        {/* =====================================================================================
            SIDEBAR: DANH SÁCH BẢNG (Giữ lại để điều hướng)
           ===================================================================================== */}
        <div className="w-64 bg-[#0a0a0a] border-r border-white/10 flex flex-col z-20 shrink-0">
            <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-2 mb-4">
                    <Database className="text-[#C69C6D]" size={20} />
                    <h1 className="text-sm font-bold font-serif text-[#C69C6D] uppercase tracking-wider">DATABASE</h1>
                </div>
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[#C69C6D] transition-colors" size={14} />
                    <input 
                        type="text" 
                        placeholder="Tìm bảng..." 
                        value={tableSearchTerm} 
                        onChange={(e) => setTableSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#C69C6D]/50 focus:bg-black transition-all" 
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                {loading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#C69C6D] w-6 h-6"/></div> : 
                <div className="space-y-1">
                    {filteredTables.map((table) => (
                        <button key={table.table_name} onClick={() => setSelectedTable(table.table_name)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all group ${selectedTable === table.table_name ? 'bg-[#C69C6D] text-black font-bold shadow-md' : 'hover:bg-white/5 text-white/60 hover:text-white'}`}>
                            <Table2 size={16} className={selectedTable === table.table_name ? 'text-black' : 'text-white/40 group-hover:text-white'} />
                            <span className="flex-1 truncate text-xs font-mono">{table.table_name}</span>
                            {table.rls_enabled && (
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${selectedTable === table.table_name ? 'bg-black/20 text-black' : 'bg-green-900/30 text-green-400 border border-green-500/20'}`}>RLS</span>
                            )}
                        </button>
                    ))}
                </div>}
            </div>
        </div>

        {/* =====================================================================================
            MAIN CONTENT: GIAO DIỆN GIỐNG DASHBOARD PHÒNG QUẢN LÝ
           ===================================================================================== */}
        <div className="flex-1 flex flex-col bg-[#121212] relative z-10 min-w-0">
            {selectedTable ? (
                <>
                {/* 1. HEADER CÔNG CỤ (Giống Dashboard) */}
                <div className="p-4 border-b border-white/10 bg-[#1a1a1a] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
                    
                    {/* Tabs con: Dữ Liệu vs Cấu Trúc */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setViewMode('data')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border
                                ${viewMode === 'data' 
                                    ? 'bg-[#C69C6D]/10 border-[#C69C6D] text-[#C69C6D]' 
                                    : 'bg-transparent border-transparent text-white/60 hover:bg-white/5 hover:text-white'
                                }
                            `}
                        >
                            <LayoutGrid size={14} /> DỮ LIỆU ({totalRows})
                        </button>
                        <button
                            onClick={() => setViewMode('structure')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border
                                ${viewMode === 'structure' 
                                    ? 'bg-[#C69C6D]/10 border-[#C69C6D] text-[#C69C6D]' 
                                    : 'bg-transparent border-transparent text-white/60 hover:bg-white/5 hover:text-white'
                                }
                            `}
                        >
                            <Settings size={14} /> CẤU TRÚC ({columns.length})
                        </button>
                    </div>

                    {/* Search & Actions (Giống Dashboard) */}
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        {/* Search Bar */}
                        <div className="relative group flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[#C69C6D] transition-colors" size={16} />
                            <input 
                                type="text" 
                                placeholder={`Tìm trong ${selectedTable}...`} 
                                value={dataSearchTerm}
                                onChange={(e) => setDataSearchTerm(e.target.value)}
                                className="w-full bg-black/30 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-[#C69C6D] transition-all"
                            />
                        </div>
                        
                        {/* Action Buttons */}
                        <button 
                            onClick={() => viewMode === 'data' ? loadTableData(selectedTable, currentPage) : loadTableStructure(selectedTable)}
                            className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-white/80 transition-colors"
                            title="Làm mới"
                        >
                            <RefreshCw size={16} className={loadingData ? "animate-spin" : ""} />
                        </button>
                        
                        {/* Thông báo thành công/lỗi nhỏ gọn */}
                        {successMsg && <span className="text-green-400 text-xs flex items-center animate-fade-in"><CheckCircle2 size={14} className="mr-1"/> Đã lưu</span>}
                        {errorMsg && <span className="text-red-400 text-xs flex items-center animate-fade-in"><AlertTriangle size={14} className="mr-1"/> Lỗi</span>}
                    </div>
                </div>

                {/* 2. BẢNG DỮ LIỆU (Giống Dashboard) */}
                <div className="flex-1 overflow-auto bg-[#0a0a0a] relative custom-scrollbar">
                    <table className="w-full border-collapse min-w-[1000px]">
                        {/* Header Sticky */}
                        <thead className="sticky top-0 z-10 bg-[#151515] shadow-md border-b border-white/10">
                            {viewMode === 'structure' ? (
                                <tr>
                                    <th className="px-6 py-3 text-center text-xs font-bold text-[#C69C6D] uppercase tracking-wider w-16">#</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-[#C69C6D] uppercase tracking-wider">Tên Cột</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-[#C69C6D] uppercase tracking-wider">Kiểu Dữ Liệu</th>
                                    <th className="px-6 py-3 text-center text-xs font-bold text-[#C69C6D] uppercase tracking-wider">Nullable</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-[#C69C6D] uppercase tracking-wider">Mặc Định</th>
                                </tr>
                            ) : (
                                <tr>
                                    <th className="sticky left-0 z-20 bg-[#151515] px-4 py-3 text-center text-xs font-bold text-[#C69C6D] uppercase tracking-wider w-16 shadow-[2px_0_5px_rgba(0,0,0,0.5)]">#</th>
                                    {columns.map(c => (
                                        <th key={c.column_name} className="px-6 py-3 text-left text-xs font-bold text-[#C69C6D] uppercase tracking-wider whitespace-nowrap bg-[#151515] border-r border-white/5 group cursor-help" title={c.data_type}>
                                            <div className="flex items-center gap-2">
                                                {getTypeIcon(c.data_type)} {c.column_name}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            )}
                        </thead>

                        {/* Body */}
                        <tbody className="divide-y divide-white/5">
                            {viewMode === 'structure' ? (
                                columns.map((col, idx) => (
                                    <tr key={col.column_name} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 text-xs font-mono text-white/40 text-center">{idx + 1}</td>
                                        <td className="px-6 py-4 text-xs font-mono font-bold text-white">{col.column_name}</td>
                                        <td className="px-6 py-4"><div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded w-fit border border-white/5">{getTypeIcon(col.data_type)}<span className="text-xs text-white/80">{col.data_type}</span></div></td>
                                        <td className="px-6 py-4 text-center">{col.is_nullable === 'YES' ? <span className="text-green-500 text-xs">✓</span> : <span className="text-red-500 text-xs">✕</span>}</td>
                                        <td className="px-6 py-4 text-xs text-white/50 font-mono">{col.column_default || '-'}</td>
                                    </tr>
                                ))
                            ) : loadingData ? (
                                <tr><td colSpan={columns.length + 1} className="text-center py-20"><Loader2 className="animate-spin inline text-[#C69C6D] w-8 h-8"/></td></tr>
                            ) : tableData.length === 0 ? (
                                <tr><td colSpan={columns.length + 1} className="text-center py-20 text-white/30 text-sm">Chưa có dữ liệu</td></tr>
                            ) : (
                                tableData.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-white/5 transition-colors group h-12">
                                        <td className="sticky left-0 z-10 bg-[#0a0a0a] group-hover:bg-[#1a1a1a] border-r border-white/10 px-4 py-3 text-xs text-white/40 font-mono text-center shadow-[2px_0_5px_rgba(0,0,0,0.5)]">
                                            {(currentPage - 1) * pageSize + idx + 1}
                                        </td>
                                        {columns.map(col => {
                                            const isEditing = editingCell?.rowIndex === idx && editingCell?.colName === col.column_name;
                                            const isEditable = col.column_name !== 'id' && col.column_name !== 'tao_luc';
                                            return (
                                                <td key={col.column_name} 
                                                    className={`px-6 py-3 text-xs font-mono border-r border-white/5 whitespace-nowrap relative
                                                        ${isEditable ? 'cursor-pointer hover:bg-white/10' : 'cursor-default opacity-50'}
                                                        ${isEditing ? 'p-0 bg-[#C69C6D]/10 ring-1 ring-[#C69C6D] z-10' : 'text-white/80'}
                                                    `}
                                                    onClick={() => isEditable && !isEditing && startEditing(idx, col.column_name, row[col.column_name])}
                                                >
                                                    {isEditing ? (
                                                        <input ref={editInputRef} type="text" className="w-full h-full bg-[#1a1a1a] text-white px-4 outline-none absolute inset-0"
                                                            value={editingCell.value ?? ''} onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
                                                            onBlur={handleSaveCell} onKeyDown={handleKeyDown} />
                                                    ) : (
                                                        <span className="block max-w-[250px] truncate">{String(row[col.column_name] ?? '')}</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    {/* Spacer cuối bảng */}
                    <div className="h-10 w-full"></div>
                </div>

                {/* 3. FOOTER PAGINATION (Giống Dashboard) */}
                {viewMode === 'data' && (
                    <div className="p-3 border-t border-white/10 bg-[#1a1a1a] flex justify-between items-center shrink-0 text-xs text-white/60">
                        <div className="font-medium">
                            Hiển thị <span className="text-white">{(currentPage - 1) * pageSize + 1}</span> - <span className="text-white">{Math.min(currentPage * pageSize, totalRows)}</span> / <span className="text-[#C69C6D] font-bold">{totalRows}</span> dòng
                        </div>
                        <div className="flex gap-2">
                            <button 
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded disabled:opacity-50 transition-colors flex items-center"
                            >
                                <ChevronLeft size={14}/> Trước
                            </button>
                            
                            <span className="px-3 py-1.5 bg-[#C69C6D] text-black rounded font-bold shadow-md">{currentPage}</span>
                            
                            <button 
                                disabled={currentPage >= totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}
                                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded disabled:opacity-50 transition-colors flex items-center"
                            >
                                Sau <ChevronRight size={14}/>
                            </button>
                        </div>
                    </div>
                )}
                </>
            ) : (
                // EMPTY STATE
                <div className="flex-1 flex items-center justify-center flex-col text-white/20 animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-[0_0_60px_rgba(255,255,255,0.05)] border border-white/5">
                        <Database size={48} className="opacity-50 text-[#C69C6D]"/>
                    </div>
                    <h3 className="text-xl font-serif text-white/40 mb-2">Trung Tâm Dữ Liệu</h3>
                    <p className="text-sm text-white/30">Vui lòng chọn bảng từ danh sách bên trái</p>
                </div>
            )}
        </div>
    </div>
  );
}