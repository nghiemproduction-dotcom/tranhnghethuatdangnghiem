'use client';

/* =================================================================================
   FILE NGUYÊN KHỐI: LEVEL 1 (WIDGET) + LEVEL 2 (LIST) + LEVEL 3 (FORM CHI TIẾT)
   Mục đích: Chạy độc lập, không phụ thuộc file con. Dễ dàng copy/paste.
   =================================================================================
*/

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { 
    Loader2, Plus, Search, Trash2, Edit, X, Save, 
    ChevronLeft, ChevronRight, LayoutGrid, List as ListIcon, 
    MoreHorizontal, Filter, Database, User, FileText 
} from 'lucide-react';

// --- ĐỊNH NGHĨA TYPE (Để không phụ thuộc file ngoài) ---
export interface CotHienThi {
    key: string;
    label: string;
    kieuDuLieu: 'text' | 'number' | 'date' | 'boolean' | 'image' | 'select_dynamic' | 'textarea' | 'uuid';
    hienThiList?: boolean;
    hienThiDetail?: boolean;
    batBuoc?: boolean;
}

export interface ModuleConfig {
    id?: string;
    tieuDe: string;
    bangDuLieu: string; // Tên bảng trong Supabase
    icon?: any;
    danhSachCot?: CotHienThi[]; // Cấu hình cột tùy chỉnh (nếu có)
    mauSac?: string;
}

// =================================================================================
// PHẦN 1: LEVEL 3 - FORM CHI TIẾT (ADD / EDIT)
// =================================================================================

function Level3_Detail({ 
    isOpen, 
    onClose, 
    initialData, 
    config, 
    onSuccess 
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    initialData: any; 
    config: ModuleConfig; 
    onSuccess: () => void;
}) {
    const isCreateMode = !initialData?.id;
    const [formData, setFormData] = useState<any>({});
    
    // 1. Lấy Schema từ Database (Tự động hóa cấu trúc)
    const { data: dbCols = [] } = useQuery({
        queryKey: ['schema', config.bangDuLieu],
        queryFn: async () => {
            const { data, error } = await supabase.rpc('get_table_columns', { t_name: config.bangDuLieu });
            if (error) {
                console.error("Lỗi lấy schema:", error);
                return [];
            }
            return data || [];
        },
        enabled: isOpen,
        staleTime: Infinity
    });

    // 2. Merge cấu hình cột (Ưu tiên Config > DB)
    const columns: CotHienThi[] = useMemo(() => {
        const manualCols = config.danhSachCot || [];
        const manualKeys = manualCols.map(c => c.key);
        
        const autoCols = dbCols
            .filter((db: any) => !manualKeys.includes(db.column_name))
            .map((db: any) => {
                let type: any = 'text';
                if (db.data_type === 'integer' || db.data_type === 'bigint' || db.data_type === 'numeric') type = 'number';
                else if (db.data_type === 'boolean') type = 'boolean';
                else if (db.column_name.includes('anh') || db.column_name.includes('avatar')) type = 'image';
                else if (db.column_name.includes('ngay') || db.column_name.includes('time')) type = 'date';
                
                return {
                    key: db.column_name,
                    label: db.column_name.replaceAll('_', ' ').toUpperCase(),
                    kieuDuLieu: type,
                    hienThiDetail: true
                };
            });
        
        return [...manualCols, ...autoCols];
    }, [config.danhSachCot, dbCols]);

    // 3. Load dữ liệu chi tiết khi sửa
    useEffect(() => {
        if (isOpen) {
            if (isCreateMode) {
                setFormData({});
            } else {
                setFormData(initialData);
            }
        }
    }, [isOpen, isCreateMode, initialData]);

    // 4. Xử lý Lưu
    const handleSave = async () => {
        try {
            // Lọc bỏ các trường rỗng nếu là tạo mới để tận dụng DEFAULT của SQL
            const cleanData = { ...formData };
            Object.keys(cleanData).forEach(key => {
                if (cleanData[key] === '' || cleanData[key] === undefined) delete cleanData[key];
            });

            const { error } = isCreateMode
                ? await supabase.from(config.bangDuLieu).insert([cleanData])
                : await supabase.from(config.bangDuLieu).update(cleanData).eq('id', initialData.id);

            if (error) throw error;
            onSuccess();
            onClose();
        } catch (err: any) {
            alert('Lỗi lưu: ' + err.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
            <div className="w-full max-w-2xl bg-[#161210] border border-[#8B5E3C]/40 rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="p-4 border-b border-[#8B5E3C]/30 flex justify-between items-center bg-[#0a0807] rounded-t-xl">
                    <h3 className="text-lg font-bold text-[#C69C6D] uppercase flex items-center gap-2">
                        {isCreateMode ? <Plus size={20}/> : <Edit size={20}/>}
                        {isCreateMode ? 'Tạo Mới' : 'Cập Nhật'} - {config.tieuDe}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24}/></button>
                </div>

                {/* Form Body */}
                <div className="p-6 overflow-y-auto custom-scroll flex-1">
                    <div className="grid grid-cols-1 gap-4">
                        {columns.filter(c => c.hienThiDetail !== false && c.key !== 'id' && c.key !== 'tao_luc').map(col => (
                            <div key={col.key} className="flex flex-col gap-1">
                                <label className="text-xs font-mono text-gray-400 uppercase">{col.label}</label>
                                {col.kieuDuLieu === 'image' ? (
                                    <div className="flex items-center gap-3">
                                        {formData[col.key] && <img src={formData[col.key]} alt="" className="w-16 h-16 object-cover rounded border border-gray-600"/>}
                                        <input 
                                            type="text" 
                                            className="flex-1 bg-black/30 border border-gray-700 rounded p-2 text-[#E8D4B9] text-sm focus:border-[#C69C6D] outline-none"
                                            placeholder="Dán link ảnh vào đây..."
                                            value={formData[col.key] || ''}
                                            onChange={e => setFormData({...formData, [col.key]: e.target.value})}
                                        />
                                    </div>
                                ) : col.kieuDuLieu === 'boolean' ? (
                                    <input 
                                        type="checkbox" 
                                        className="w-5 h-5 accent-[#C69C6D]"
                                        checked={formData[col.key] || false}
                                        onChange={e => setFormData({...formData, [col.key]: e.target.checked})}
                                    />
                                ) : (
                                    <input 
                                        type={col.kieuDuLieu === 'number' ? 'number' : 'text'}
                                        className="w-full bg-black/30 border border-gray-700 rounded p-2 text-[#E8D4B9] text-sm focus:border-[#C69C6D] outline-none transition-colors"
                                        value={formData[col.key] || ''}
                                        onChange={e => setFormData({...formData, [col.key]: e.target.value})}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-[#8B5E3C]/30 bg-[#0a0807] flex justify-end gap-3 rounded-b-xl">
                    <button onClick={onClose} className="px-4 py-2 rounded text-gray-400 hover:text-white hover:bg-white/10 text-sm">Hủy</button>
                    <button onClick={handleSave} className="px-4 py-2 rounded bg-[#C69C6D] text-black font-bold hover:bg-[#b08b60] flex items-center gap-2">
                        <Save size={16}/> Lưu Dữ Liệu
                    </button>
                </div>
            </div>
        </div>
    );
}

// =================================================================================
// PHẦN 2: LEVEL 2 - DANH SÁCH & TABLE
// =================================================================================

function Level2_List({ 
    config, 
    onClose 
}: { 
    config: ModuleConfig; 
    onClose: () => void;
}) {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [selectedItem, setSelectedItem] = useState<any>(null); // Mở Level 3
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    
    // 1. Lấy Schema (Để biết hiển thị cột nào)
    const { data: schema = [] } = useQuery({
        queryKey: ['schema', config.bangDuLieu],
        queryFn: async () => {
            const { data } = await supabase.rpc('get_table_columns', { t_name: config.bangDuLieu });
            return data || [];
        },
        staleTime: Infinity
    });

    // 2. Lấy Danh Sách Data
    const { data: queryData, isLoading } = useQuery({
        queryKey: ['list', config.bangDuLieu, page, search],
        queryFn: async () => {
            let query = supabase.from(config.bangDuLieu).select('*', { count: 'exact' });
            
            if (search) {
                // Tìm kiếm text trên tất cả các cột text
                const textCols = schema.filter((c:any) => c.data_type === 'text').map((c:any) => `${c.column_name}.ilike.%${search}%`);
                if(textCols.length) query = query.or(textCols.join(','));
            }

            const from = (page - 1) * 20;
            const to = from + 20 - 1;
            
            // Ưu tiên sort theo tao_luc nếu có, không thì id
            const hasTaoLuc = schema.some((c:any) => c.column_name === 'tao_luc');
            if(hasTaoLuc) query = query.order('tao_luc', { ascending: false });
            else query = query.order('id', { ascending: false }); // Cảnh báo: ID UUID sort sẽ lộn xộn

            const { data, count, error } = await query.range(from, to);
            if (error) throw error;
            return { data, count };
        },
        placeholderData: keepPreviousData
    });

    const dataList = queryData?.data || [];
    const totalCount = queryData?.count || 0;
    const totalPages = Math.ceil(totalCount / 20);

    // 3. Xử lý xóa
    const handleDelete = async (id: string) => {
        if(!confirm('Xóa vĩnh viễn?')) return;
        const { error } = await supabase.from(config.bangDuLieu).delete().eq('id', id);
        if(!error) queryClient.invalidateQueries({ queryKey: ['list', config.bangDuLieu] });
        else alert(error.message);
    };

    return (
        <div className="fixed inset-0 z-[4000] bg-[#0f0c0b] flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header Level 2 */}
            <div className="h-16 border-b border-[#8B5E3C]/30 flex items-center justify-between px-4 bg-[#1a1614]">
                <div className="flex items-center gap-3">
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400"><ChevronLeft/></button>
                    <h2 className="text-xl font-bold text-[#E8D4B9] uppercase">{config.tieuDe}</h2>
                    <span className="text-xs bg-[#C69C6D]/20 text-[#C69C6D] px-2 py-0.5 rounded border border-[#C69C6D]/30">{totalCount} items</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16}/>
                        <input 
                            value={search} onChange={(e) => setSearch(e.target.value)}
                            placeholder="Tìm kiếm..." 
                            className="bg-black/30 border border-gray-700 rounded-full pl-9 pr-4 py-1.5 text-sm text-[#E8D4B9] focus:border-[#C69C6D] outline-none w-64"
                        />
                    </div>
                    <button 
                        onClick={() => { setSelectedItem(null); setIsDetailOpen(true); }}
                        className="bg-[#C69C6D] hover:bg-[#b08b60] text-black font-bold px-4 py-1.5 rounded-full flex items-center gap-2 text-sm transition-all"
                    >
                        <Plus size={16}/> Thêm Mới
                    </button>
                </div>
            </div>

            {/* Body Table */}
            <div className="flex-1 overflow-auto p-4 custom-scroll">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full text-[#C69C6D] gap-2"><Loader2 className="animate-spin"/> Đang tải dữ liệu...</div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-[#1f1a18] z-10 text-xs font-mono text-gray-400 uppercase">
                            <tr>
                                <th className="p-3 border-b border-gray-800">#</th>
                                {schema.slice(0, 5).map((col: any) => (
                                    <th key={col.column_name} className="p-3 border-b border-gray-800">{col.column_name.replaceAll('_',' ')}</th>
                                ))}
                                <th className="p-3 border-b border-gray-800 text-right">Tác vụ</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-[#E8D4B9]">
                            {dataList.map((item: any, idx: number) => (
                                <tr key={item.id} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors group">
                                    <td className="p-3 text-gray-500 font-mono text-xs">{(page-1)*20 + idx + 1}</td>
                                    {schema.slice(0, 5).map((col: any) => (
                                        <td key={col.column_name} className="p-3 truncate max-w-[200px]">
                                            {col.column_name.includes('anh') ? (
                                                <img src={item[col.column_name] || 'https://via.placeholder.com/30'} className="w-8 h-8 rounded object-cover border border-gray-700"/>
                                            ) : (
                                                item[col.column_name]?.toString()
                                            )}
                                        </td>
                                    ))}
                                    <td className="p-3 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setSelectedItem(item); setIsDetailOpen(true); }} className="p-1.5 text-blue-400 hover:bg-blue-900/30 rounded"><Edit size={16}/></button>
                                            <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-400 hover:bg-red-900/30 rounded"><Trash2 size={16}/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            <div className="h-12 border-t border-[#8B5E3C]/30 bg-[#1a1614] flex items-center justify-between px-4">
                <span className="text-xs text-gray-500">Trang {page} / {totalPages}</span>
                <div className="flex gap-2">
                    <button disabled={page===1} onClick={() => setPage(p=>p-1)} className="p-1 rounded hover:bg-white/10 disabled:opacity-30"><ChevronLeft size={20}/></button>
                    <button disabled={page===totalPages} onClick={() => setPage(p=>p+1)} className="p-1 rounded hover:bg-white/10 disabled:opacity-30"><ChevronRight size={20}/></button>
                </div>
            </div>

            {/* MODAL LEVEL 3 */}
            <Level3_Detail 
                isOpen={isDetailOpen} 
                onClose={() => setIsDetailOpen(false)} 
                initialData={selectedItem} 
                config={config}
                onSuccess={() => queryClient.invalidateQueries({ queryKey: ['list', config.bangDuLieu] })}
            />
        </div>
    );
}

// =================================================================================
// PHẦN 3: LEVEL 1 - WIDGET (Thẻ Thống Kê Bên Ngoài)
// =================================================================================

function Level1_Widget({ config, onClick }: { config: ModuleConfig, onClick: () => void }) {
    // Lấy tổng số lượng bản ghi để hiển thị
    const { data: count = 0, isLoading } = useQuery({
        queryKey: ['count', config.bangDuLieu],
        queryFn: async () => {
            const { count, error } = await supabase.from(config.bangDuLieu).select('*', { count: 'exact', head: true });
            if (error) return 0;
            return count || 0;
        }
    });

    return (
        <div 
            onClick={onClick}
            className="group relative h-[140px] bg-gradient-to-br from-[#1e1b19] to-[#0f0c0b] rounded-xl border border-[#8B5E3C]/30 hover:border-[#C69C6D] transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between p-5 hover:shadow-[0_0_20px_rgba(198,156,109,0.2)]"
        >
            <div className="flex justify-between items-start">
                <div className="p-2 bg-[#C69C6D]/10 rounded-lg text-[#C69C6D] group-hover:bg-[#C69C6D] group-hover:text-black transition-colors">
                    <Database size={24} />
                </div>
                {isLoading ? <Loader2 className="animate-spin text-gray-600"/> : <span className="text-3xl font-bold text-[#E8D4B9]">{count}</span>}
            </div>
            
            <div>
                <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">{config.tieuDe}</h3>
                <p className="text-[10px] text-gray-600 mt-1 font-mono">{config.bangDuLieu}</p>
            </div>

            {/* Decor */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#C69C6D]/5 rounded-full blur-2xl group-hover:bg-[#C69C6D]/10 transition-all"/>
        </div>
    );
}

// =================================================================================
// MAIN EXPORT (Duy nhất)
// =================================================================================

interface Props {
    config: ModuleConfig;
}

export default function Level1_Generic({ config }: Props) {
    const [showLevel2, setShowLevel2] = useState(false);
    const queryClient = useQueryClient();

    const handleCloseLevel2 = () => {
        setShowLevel2(false);
        // Làm mới Widget khi đóng danh sách
        queryClient.invalidateQueries({ queryKey: ['count', config.bangDuLieu] });
    };

    if (showLevel2) {
        return <Level2_List config={config} onClose={handleCloseLevel2} />;
    }

    return <Level1_Widget config={config} onClick={() => setShowLevel2(true)} />;
}