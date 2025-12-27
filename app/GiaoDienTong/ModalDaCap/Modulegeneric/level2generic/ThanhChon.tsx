import React from 'react';
import { CheckSquare, Trash2, XCircle } from 'lucide-react';

interface Props {
    count: number;
    canDelete: boolean;
    onDelete: () => void;
    onCancel: () => void;
}

export default function ThanhChon({ count, canDelete, onDelete, onCancel }: Props) {
    if (count === 0) return null;

    return (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[3000] animate-in slide-in-from-bottom-5 duration-300">
            <div className="bg-[#1a120f] border border-[#8B5E3C] shadow-[0_0_20px_rgba(0,0,0,0.8)] rounded-full px-6 py-2 flex items-center gap-4">
                <div className="flex items-center gap-2 border-r border-[#8B5E3C]/30 pr-4">
                    <CheckSquare size={18} className="text-[#C69C6D]" />
                    <span className="text-[#C69C6D] font-bold text-sm">{count} đã chọn</span>
                </div>
                {canDelete && (
                    <button onClick={onDelete} className="flex items-center gap-2 text-red-500 hover:text-red-400 font-bold text-sm transition-colors">
                        <Trash2 size={16} /><span>Xóa</span>
                    </button>
                )}
                <button onClick={onCancel} className="flex items-center gap-1 text-gray-500 hover:text-gray-300 text-xs uppercase font-semibold ml-2">
                    <XCircle size={14} />Hủy
                </button>
            </div>
        </div>
    );
}