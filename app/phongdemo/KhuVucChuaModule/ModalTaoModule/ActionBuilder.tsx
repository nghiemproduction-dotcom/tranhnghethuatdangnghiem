'use client';
import React, { useState } from 'react';
// 🟢 ĐÃ THÊM 'List' VÀO IMPORT
import { PlayCircle, Plus, Trash2, RefreshCcw, LayoutTemplate, Table, FileText, List } from 'lucide-react';
// 🟢 ĐÃ SỬA ĐƯỜNG DẪN THÀNH '../'
import { ModuleConfig, CustomAction } from '../KieuDuLieuModule';

interface Props {
    config: Partial<ModuleConfig>;
    setConfig: (val: any) => void;
    columns: string[];
}

export function ActionBuilder({ config, setConfig, columns }: Props) {
    const [newAction, setNewAction] = useState<Partial<CustomAction>>({ 
        color: 'blue', 
        location: 'detail_footer', 
        icon: 'check', 
        label: '', 
        targetField: '', 
        targetValue: '' 
    });

    const handleAddAction = () => {
        if (!newAction.label || !newAction.targetField || !newAction.targetValue) return alert("Vui lòng điền đủ thông tin!");
        
        const action: CustomAction = {
            id: `act_${Date.now()}`,
            label: newAction.label!,
            icon: newAction.icon || 'check',
            color: newAction.color || 'blue',
            location: newAction.location as any,
            actionType: 'update_status',
            targetField: newAction.targetField!,
            targetValue: newAction.targetValue!
        };

        setConfig({ ...config, customActions: [...(config.customActions || []), action] });
        handleReset();
    };

    const handleRemoveAction = (id: string) => {
        // Thêm kiểu dữ liệu tường minh cho a
        setConfig({ ...config, customActions: config.customActions?.filter((a: CustomAction) => a.id !== id) });
    };

    const handleReset = () => {
        setNewAction({ color: 'blue', location: 'detail_footer', icon: 'check', targetField: '', targetValue: '', label: '' });
    };

    return (
        <div className="p-6 h-full overflow-y-auto  ">
            <h4 className="text-[12px] text-purple-500 font-bold uppercase mb-4 flex items-center gap-2">
                <PlayCircle size={16}/> 3. Thiết lập Nút Tác Vụ
            </h4>

            {/* Form tạo nút */}
            <div className="bg-[#151515] p-5 rounded-xl border border-white/10 space-y-4 shadow-inner">
                
                {/* 1. Chọn vị trí (3 Cấp độ) */}
                <div>
                    <label className="block text-[10px] text-gray-400 mb-2 font-bold uppercase">Bước 1: Chọn vị trí đặt nút</label>
                    <div className="grid grid-cols-1 gap-2">
                        {/* Cấp 1 */}
                        <button onClick={()=>setNewAction({...newAction, location: 'widget'})} className={`p-3 rounded-lg border flex items-center gap-3 transition-all ${newAction.location==='widget' ? 'bg-purple-900/40 border-purple-500 text-white' : 'border-white/10 text-gray-500 hover:bg-white/5'}`}>
                            <LayoutTemplate size={16}/> 
                            <div className="text-left">
                                <div className="text-xs font-bold">Cấp 1: Widget Dashboard</div>
                                <div className="text-[9px] opacity-60">Hiển thị ngay bên ngoài ô lưới</div>
                            </div>
                        </button>
                        
                        {/* Cấp 2 */}
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={()=>setNewAction({...newAction, location: 'list_header'})} className={`p-2 rounded-lg border flex items-center gap-2 transition-all ${newAction.location==='list_header' ? 'bg-blue-900/40 border-blue-500 text-white' : 'border-white/10 text-gray-500 hover:bg-white/5'}`}>
                                <Table size={14}/> <div className="text-left"><div className="text-[10px] font-bold">Cấp 2: Đầu Bảng</div><div className="text-[8px] opacity-60">Thao tác nhiều dòng</div></div>
                            </button>
                            <button onClick={()=>setNewAction({...newAction, location: 'row_action'})} className={`p-2 rounded-lg border flex items-center gap-2 transition-all ${newAction.location==='row_action' ? 'bg-blue-900/40 border-blue-500 text-white' : 'border-white/10 text-gray-500 hover:bg-white/5'}`}>
                                <List size={14}/> <div className="text-left"><div className="text-[10px] font-bold">Cấp 2: Từng Dòng</div><div className="text-[8px] opacity-60">Nút nhỏ trên dòng</div></div>
                            </button>
                        </div>

                        {/* Cấp 3 */}
                        <button onClick={()=>setNewAction({...newAction, location: 'detail_footer'})} className={`p-3 rounded-lg border flex items-center gap-3 transition-all ${newAction.location==='detail_footer' ? 'bg-green-900/40 border-green-500 text-white' : 'border-white/10 text-gray-500 hover:bg-white/5'}`}>
                            <FileText size={16}/>
                            <div className="text-left">
                                <div className="text-xs font-bold">Cấp 3: Form Chi Tiết</div>
                                <div className="text-[9px] opacity-60">Nút lớn nằm dưới cùng form</div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* 2. Thông tin nút */}
                <div className="pt-2 border-t border-white/5">
                    <label className="block text-[10px] text-gray-400 mb-2 font-bold uppercase">Bước 2: Thông tin hiển thị</label>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[9px] text-gray-600 mb-1">Tên nút</label>
                            <input type="text" className="w-full bg-black border border-white/10 p-2 text-xs text-white rounded focus:border-purple-500 outline-none" placeholder="Vd: Duyệt" value={newAction.label} onChange={e=>setNewAction({...newAction, label: e.target.value})}/>
                        </div>
                        <div>
                            <label className="block text-[9px] text-gray-600 mb-1">Màu sắc</label>
                            <select className="w-full bg-black border border-white/10 p-2 text-xs text-white rounded" value={newAction.color} onChange={e=>setNewAction({...newAction, color: e.target.value})}>
                                <option value="blue">Xanh dương</option><option value="green">Xanh lá</option><option value="red">Đỏ</option><option value="yellow">Vàng</option><option value="purple">Tím</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                {/* 3. Logic */}
                <div className="pt-2 border-t border-white/5">
                    <label className="block text-[10px] text-gray-400 mb-2 font-bold uppercase">Bước 3: Hành động khi bấm</label>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[9px] text-gray-600 mb-1">Cập nhật cột</label>
                            <select className="w-full bg-black border border-white/10 p-2 text-xs text-white rounded" value={newAction.targetField} onChange={e=>setNewAction({...newAction, targetField: e.target.value})}>
                                <option value="">-- Chọn cột --</option>
                                {columns.map(c=><option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[9px] text-gray-600 mb-1">Giá trị mới (=)</label>
                            <input type="text" className="w-full bg-black border border-white/10 p-2 text-xs text-white rounded" placeholder="Vd: da_duyet" value={newAction.targetValue} onChange={e=>setNewAction({...newAction, targetValue: e.target.value})}/>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 pt-2">
                    <button onClick={handleReset} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded transition-all" title="Làm mới">
                        <RefreshCcw size={16}/>
                    </button>
                    <button onClick={handleAddAction} className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded shadow-lg transition-all flex items-center justify-center gap-2">
                        <Plus size={16}/> THÊM NÚT NÀY
                    </button>
                </div>
            </div>

            {/* Danh sách nút */}
            <div className="mt-6">
                <label className="block text-[10px] text-gray-500 mb-2 font-bold uppercase">Danh sách nút đã tạo</label>
                <div className="space-y-2">
                    {config.customActions?.length === 0 && <div className="p-4 border border-dashed border-white/10 rounded text-center text-[10px] text-gray-600">Chưa có nút nào.</div>}
                    
                    {/* Thêm kiểu dữ liệu cho act */}
                    {config.customActions?.map((act: CustomAction) => (
                        <div key={act.id} className="flex items-center justify-between p-3 bg-[#1A1A1A] border border-white/5 rounded hover:border-purple-500/30 transition-all group">
                            <div className="flex items-center gap-3">
                                <span className={`w-3 h-3 rounded-full bg-${act.color}-500 shadow-sm`}></span>
                                <div>
                                    <p className="text-xs font-bold text-white flex items-center gap-2">
                                        {act.label} 
                                        <span className="text-[8px] bg-white/10 px-1.5 py-0.5 rounded text-gray-400 font-normal uppercase">{act.location.replace('_', ' ')}</span>
                                    </p>
                                    <p className="text-[9px] text-gray-500 font-mono mt-0.5">{act.targetField} ➔ '{act.targetValue}'</p>
                                </div>
                            </div>
                            <button onClick={()=>handleRemoveAction(act.id)} className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded transition-all"><Trash2 size={14}/></button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}