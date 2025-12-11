'use client';
import React from 'react';
import { Sparkles } from 'lucide-react';

interface Props {
  isRegistering: boolean;
}

export default function TieuDe({ isRegistering }: Props) {
  return (
    <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
             <Sparkles className="text-yellow-600/60" size={20} strokeWidth={1} />
        </div>
        <h1 className="text-2xl font-light tracking-[0.2em] uppercase text-white">
            {isRegistering ? 'ĐĂNG KÝ' : 'ĐĂNG NGHIÊM'}
        </h1>
        <p className="font-serif italic text-yellow-600/80 text-sm tracking-wide">
            {isRegistering ? 'Join the Gallery' : 'Internal Access'}
        </p>
    </div>
  );
}