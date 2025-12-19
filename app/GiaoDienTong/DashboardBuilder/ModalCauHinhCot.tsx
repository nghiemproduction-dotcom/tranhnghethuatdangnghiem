'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, RefreshCw, Settings, Database, Layout } from 'lucide-react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { ModuleConfig, CotHienThi } from '../KieuDuLieuModule';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    module: ModuleConfig;
    onSave: (newConfig: ModuleConfig) => void;
}

const TYPE_OPTIONS = [
    { value: 'text', label: 'Văn bản (Text)' },
    { value: 'number', label: 'Số (Number)' },
    { value: 'image', label: 'Hình ảnh (Image)' },
    { value: 'date', label: 'Ngày tháng (Date)' },
    { value: 'boolean', label: 'Bật/Tắt (Switch)' },
    { value: 'select_dynamic', label: 'Danh sách chọn (Dropdown DB)' },
    { value: 'link_array', label: 'Mảng Link (Files)' },
    { value: 'textarea', label: 'Văn bản dài (Textarea)' },
    { value: 'readonly', label: 'Chỉ xem (Tự động)' },
];

export default function ModalCauHinhCot({ isOpen, onClose, module, onSave }: Props) {
    const [columns, setColumns] = useState<CotHienThi[]>([]);
    const [dbColumns, setDbColumns] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && module) {
            setColumns(module.danhSachCot || []);
            fetchDbStructure();
        }
    }, [isOpen, module]);

    // 🟢 HÀM ĐỌC CẤU TRÚC TỪ SUPABASE (API TRỰC TIẾP)
    const fetchDbStructure = async () => {
        setLoading(true);
        // Gọi hàm RPC chúng ta vừa tạo ở Bước 1
        const { data, error } = await supabase.rpc('get_table_columns', { table_name: module.bangDuLieu });
        
        if (data) {
            setDbColumns(data);
            // Tự động map cột DB chưa có trong Config
            setColumns(prev => {
                const newCols = [...prev];
                data.forEach((dbCol: any) => {
                    const exists = newCols.find(c => c.key === dbCol.column_name);
                    if (!exists) {
                        // Logic đoán kiểu dữ liệu thông minh
                        let type = 'text';
                        if (dbCol.column_name === 'id') type = 'readonly';
                        else if (dbCol.column_name.includes('hinh_anh')) type = 'image';
                        else if (dbCol.column_name.includes('ngay') || dbCol.column_name.includes('thoi_diem')) type = 'readonly'; // Mặc định readonly cho ngày hệ thống
                        else if (dbCol.column_name.includes('nguoi_tao')) type = 'readonly';
                        else if (dbCol.data_type === 'boolean') type = 'boolean';
                        else if (dbCol.data_type === 'ARRAY') type = 'link_array';

                        newCols.push({
                            key: dbCol.column_name,
                            label: dbCol.column_name, // Tạm lấy tên cột làm nhãn
                            kieuDuLieu: type,
                            hienThiList: true,
                            hienThiDetail: true,
                            tuDong: ['id', 'created_at'].includes(dbCol.column_name)
                        });
                    }
                });
                return newCols;
            });
        } else {
            console.error("Lỗi lấy cấu trúc bảng:", error);
        }
        setLoading(false);
    };

    const handleSave = () => {
        const newModule = { ...module, danhSachCot: columns };
        onSave(newModule);
        onClose();
    };

    const updateColumn = (index: number, field: keyof CotHienThi, value: any) => {
        const newCols = [...columns];
        newCols[index] = { ...newCols[index], [field]: value };
        setColumns(newCols);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <div className="w-full max-w-5xl bg-[#110d0c] border border-[#8B5E3C] rounded-xl flex flex-col max-h-[90vh]">
                
                {/* HEADER */}
                <div className="p-4 border-b border-[#8B5E3C]/30 flex justify-between items-center bg-[#1a120f]">
                    <div className="flex items-center gap-3">
                        <Settings className="text-[#C69C6D]" />
                        <div>
                            <h2 className="text-lg font-bold text-[#F5E6D3] uppercase">Cấu Hình Cột Dữ Liệu</h2>
                            <p className="text-xs text-[#8B5E3C]">Bảng dữ liệu: <span className="text-white font-mono">{module.bangDuLieu}</span></p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                         <button onClick={fetchDbStructure} className="p-2 text-[#C69C6D] hover:bg-[#C69C6D]/10 rounded" title="Quét lại DB">
                            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                        </button>
                        <button onClick={onClose} className="p-2 text-red-400 hover:bg-red-900/20 rounded"><X size={20}/></button>
                    </div>
                </div>

                {/* BODY: TABLE CONFIG EDITOR */}
                <div className="flex-1 overflow-auto p-4">
                    <table className="w-full text-left text-sm text-[#F5E6D3]">
                        <thead className="bg-[#2a1e1b] text-[#8B5E3C] uppercase text-xs sticky top-0 z-10">
                            <tr>
                                <th className="p-3">Tên Cột (DB)</th>
                                <th className="p-3">Nhãn Hiển Thị (Label)</th>
                                <th className="p-3">Kiểu Dữ Liệu (App)</th>
                                <th className="p-3 text-center">Hiện List</th>
                                <th className="p-3 text-center">Tự Động</th>
                                <th className="p-3 text-center">Bắt Buộc</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#8B5E3C]/10">
                            {columns.map((col, idx) => {
                                // Tìm info thực tế từ DB để đối chiếu
                                const dbInfo = dbColumns.find(d => d.column_name === col.key);
                                const dbType = dbInfo ? dbInfo.data_type : '???';

                                return (
                                    <tr key={idx} className="hover:bg-[#C69C6D]/5 transition-colors">
                                        <td className="p-3 font-mono text-gray-400">
                                            {col.key}
                                            <div className="text-[10px] text-[#5D4037]">{dbType}</div>
                                        </td>
                                        
                                        <td className="p-3">
                                            <input 
                                                type="text" 
                                                value={col.label} 
                                                onChange={(e) => updateColumn(idx, 'label', e.target.value)}
                                                className="w-full bg-[#110d0c] border border-[#8B5E3C]/30 rounded px-2 py-1 focus:border-[#C69C6D] outline-none"
                                            />
                                        </td>

                                        <td className="p-3">
                                            <select 
                                                value={col.kieuDuLieu}
                                                onChange={(e) => updateColumn(idx, 'kieuDuLieu', e.target.value)}
                                                className="w-full bg-[#110d0c] border border-[#8B5E3C]/30 rounded px-2 py-1 focus:border-[#C69C6D] outline-none cursor-pointer"
                                            >
                                                {TYPE_OPTIONS.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </td>

                                        <td className="p-3 text-center">
                                            <input type="checkbox" checked={col.hienThiList} onChange={(e) => updateColumn(idx, 'hienThiList', e.target.checked)} className="accent-[#C69C6D] w-4 h-4"/>
                                        </td>

                                        <td className="p-3 text-center">
                                            <input type="checkbox" checked={col.tuDong} onChange={(e) => updateColumn(idx, 'tuDong', e.target.checked)} className="accent-[#C69C6D] w-4 h-4"/>
                                        </td>

                                        <td className="p-3 text-center">
                                            <input type="checkbox" checked={col.batBuoc} onChange={(e) => updateColumn(idx, 'batBuoc', e.target.checked)} className="accent-[#C69C6D] w-4 h-4"/>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* FOOTER */}
                <div className="p-4 border-t border-[#8B5E3C]/30 flex justify-end bg-[#1a120f]">
                    <button 
                        onClick={handleSave}
                        className="flex items-center gap-2 px-6 py-2 bg-[#C69C6D] hover:bg-[#b08b5e] text-[#1a120f] font-bold uppercase rounded shadow-lg transition-transform active:scale-95"
                    >
                        <Save size={18} /> Lưu Cấu Hình
                    </button>
                </div>
            </div>
        </div>
    );
}