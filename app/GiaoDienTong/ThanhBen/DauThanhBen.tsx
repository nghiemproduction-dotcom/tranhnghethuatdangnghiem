'use client';

import React from 'react';
import { Menu } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export default function DauThanhBen({ onClose }: Props) {
  return (
    <div className="flex-none px-4 pt-4 pb-2"> 
        <div className="flex items-center gap-3">
            <button 
               onClick={onClose} 
               className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-300 lg:hidden"
            >
               <Menu size={24} />
            </button>
            
            <span className="text-xl font-medium tracking-tight text-white select-none">
               Tranh Nghệ Thuật Đăng Nghiêm
            </span>
        </div>
    </div>
  );
}