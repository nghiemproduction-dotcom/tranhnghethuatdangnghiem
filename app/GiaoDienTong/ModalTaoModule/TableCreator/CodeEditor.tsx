'use client';

import React from 'react';
import { Code, X, AlertTriangle, CheckSquare } from 'lucide-react';

interface CodeEditorProps {
    isOpen: boolean;
    onClose: () => void;
    code: string;
    setCode: (code: string) => void;
    onSave: () => void;
    error: string | null;
}

export default function CodeEditor({ isOpen, onClose, code, setCode, onSave, error }: CodeEditorProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-3xl bg-[#1a120f] border border-[#8B5E3C] rounded-xl shadow-2xl flex flex-col overflow-hidden">
                <div className="h-12 border-b border-[#8B5E3C]/20 flex justify-between items-center px-4 bg-[#161210]">
                    <div className="flex items-center gap-2 font-bold text-[#C69C6D]">
                        <Code size={18}/>
                        <span className="text-sm uppercase tracking-wider">Logic Script Editor</span>
                    </div>
                    <button onClick={onClose} className="text-[#8B5E3C] hover:text-white"><X size={20}/></button>
                </div>

                <div className="h-[400px] relative bg-[#0a0807]">
                    <textarea 
                        value={code} 
                        onChange={(e) => setCode(e.target.value)} 
                        className="w-full h-full bg-transparent text-[#F5E6D3] font-mono text-xs p-4 outline-none resize-none leading-relaxed" 
                        placeholder={`// Viết mã Javascript tại đây...\n// Ví dụ Validate:\nif (value < 0) return "Giá trị không được âm";`}
                        spellCheck={false}
                    />
                </div>

                <div className="p-3 border-t border-[#8B5E3C]/20 bg-[#161210] flex justify-between items-center">
                    <div className="text-xs text-red-400 flex items-center gap-2">
                        {error && <><AlertTriangle size={14}/> {error}</>}
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-white uppercase">Hủy</button>
                        <button onClick={onSave} className="px-6 py-2 bg-[#C69C6D] text-[#1a120f] font-bold text-xs rounded uppercase hover:bg-[#b08b5e] flex items-center gap-2">
                            <CheckSquare size={14}/> Lưu & Kiểm Tra
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}