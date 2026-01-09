'use client';

import React from 'react';
import { MapPin } from 'lucide-react';

const TieuDe = () => {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 text-[10px] md:text-xs font-bold tracking-[0.3em] text-white uppercase mb-1 drop-shadow-md">
        <MapPin size={12} className="text-yellow-500" />
        <span>CẦN THƠ / VIỆT NAM</span>
      </div>

      <h1 className="text-4xl md:text-6xl font-thin tracking-widest leading-none text-white super-text-shadow">ĐĂNG NGHIÊM</h1>
      <p className="text-lg md:text-2xl font-serif italic text-yellow-500 mt-1 tracking-wide font-medium drop-shadow-md">Art Gallery</p>
    </div>
  );
};

export default TieuDe;
