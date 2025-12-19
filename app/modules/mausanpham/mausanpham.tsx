'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import MSP_Header from './MSP_Header';
import MSP_Gallery from './MSP_Gallery';
import MSP_Form from './MSP_Form';

interface Props {
    config?: any; 
}

export default function MauSanPham({ config }: Props) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterLoai, setFilterLoai] = useState('');
    
    // State cho Modal Form (Lớp 3)
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);

    // Load Dữ Liệu
    const fetchData = async () => {
        setLoading(true);
        let query = supabase.from('mau_san_pham').select('*').order('thoi_diem_dang_mau', { ascending: false });
        
        if (searchTerm) query = query.ilike('mo_ta', `%${searchTerm}%`);
        if (filterLoai) query = query.eq('the_loai', filterLoai);

        const { data: result, error } = await query;
        if (result) setData(result);
        if (error) console.error("Lỗi load mẫu:", error);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [searchTerm, filterLoai]);

    // Hành động mở Lớp 3 (Chi tiết Form)
    const handleEdit = (item: any) => {
        setEditingItem(item);
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa mẫu này?')) return;
        const { error } = await supabase.from('mau_san_pham').delete().eq('id', id);
        if (!error) fetchData();
        else alert('Lỗi xóa: ' + error.message);
    };

    return (
        <div className="flex flex-col h-full bg-[#0a0807] overflow-hidden">
            {/* Header: Tìm kiếm, Lọc, Thêm Mới */}
            <MSP_Header 
                onSearch={setSearchTerm} 
                onFilter={setFilterLoai} 
                onAdd={() => { setEditingItem(null); setIsFormOpen(true); }}
                onRefresh={fetchData}
            />

            {/* Content: Gallery Grid (Lớp 2) */}
            <MSP_Gallery 
                data={data} 
                loading={loading} 
                onEdit={handleEdit} 
                onDelete={handleDelete} 
            />

            {/* Modal: Form Thêm/Sửa (Lớp 3) */}
            <MSP_Form 
                isOpen={isFormOpen} 
                onClose={() => setIsFormOpen(false)} 
                onSuccess={fetchData} 
                initialData={editingItem} 
            />
        </div>
    );
}