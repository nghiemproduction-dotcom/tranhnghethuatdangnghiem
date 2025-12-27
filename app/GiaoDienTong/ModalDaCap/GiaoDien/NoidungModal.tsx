'use client';
import React from 'react';

interface Props {
    children: React.ReactNode;
}

export default function NoidungModal({ children }: Props) {
    return (
        <div className="fixed top-[85px] bottom-[100px] left-0 right-0 z-[2000] flex flex-col bg-transparent animate-in fade-in zoom-in-95 duration-500 ease-out overflow-hidden shadow-none">
            
            {/* 🟢 ĐÃ XÓA: Phần div gradient h-12 tại đây */}
            
            <div className="flex-1 w-full overflow-y-auto custom-scroll p-4 md:p-6 relative z-0">
                <div className="w-full min-h-full pb-8"> 
                    {children}
                </div>
            </div>
        </div>
    );
}