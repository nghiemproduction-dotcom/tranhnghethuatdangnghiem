'use client';

import React from 'react';
import { Loader2, PackageOpen } from 'lucide-react';
import MSP_Card from './MSP_Card';

interface Props {
    data: any[];
    loading: boolean;
    onEdit: (item: any) => void;
    onDelete: (id: string) => void;
}

export default function MSP_Gallery({ data, loading, onEdit, onDelete }: Props) {
    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center text-[#C69C6D]">
                <Loader2 className="animate-spin mr-2"/> Đang tải dữ liệu...
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-[#5D4037] opacity-70">
                <PackageOpen size={48} strokeWidth={1} className="mb-2"/>
                <p className="text-sm uppercase tracking-widest">Chưa có mẫu sản phẩm nào</p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-6 custom-scroll">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {data.map((item) => (
                    <MSP_Card 
                        key={item.id} 
                        item={item} 
                        onEdit={() => onEdit(item)} 
                        onDelete={() => onDelete(item.id)} 
                    />
                ))}
            </div>
        </div>
    );
}