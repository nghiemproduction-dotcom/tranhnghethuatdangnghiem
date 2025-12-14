'use client';
import React from 'react';

interface Props {
    data: any[];
    groupBy: string;
    titleCol: string;
    onSelectItem: (item: any) => void;
}

// 🟢 CHUYỂN THÀNH NAMED EXPORT
export function KanbanView({ data, groupBy, titleCol, onSelectItem }: Props) {
    const groups: Record<string, any[]> = {};
    data.forEach(item => { 
        const k = String(item[groupBy] || 'Khác'); 
        if(!groups[k]) groups[k]=[]; 
        groups[k].push(item); 
    });

    return (
        <div className="flex gap-6 p-6 h-full overflow-x-auto">
            {Object.keys(groups).map(key => (
                <div key={key} className="w-80 flex-shrink-0 flex flex-col bg-[#161616] rounded-xl border border-white/5 h-full">
                    <div className="p-4 border-b border-white/5 bg-[#1A1A1A] rounded-t-xl sticky top-0 font-bold text-gray-300 uppercase text-xs flex justify-between">
                        <span>{key}</span><span className="bg-white/10 px-2 rounded text-white">{groups[key].length}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-dark-scrollbar">
                        {groups[key].map(item => (
                            <div key={item.id} onClick={() => onSelectItem(item)} className="p-3 bg-[#202020] rounded-lg border border-white/5 hover:border-blue-500/50 hover:shadow-lg cursor-pointer transition-all">
                                <span className="text-sm font-medium text-gray-200 line-clamp-2">{item[titleCol]}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}