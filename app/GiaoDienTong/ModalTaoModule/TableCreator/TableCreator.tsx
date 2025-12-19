'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Maximize } from 'lucide-react'; // Thêm icon Maximize
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { manageTableStructureAction, unlockTableAction } from '@/app/actions/admindb';
import { ColumnDef } from './types';
import Toolbar from './Toolbar';
import TableGrid from './TableGrid';
import CodeEditor from './CodeEditor';

interface Props { onClose?: () => void; onSuccess: (name: string) => void; initialTable?: string; isEmbedded?: boolean; }

export default function TableCreator(props: Props) {
    const { onSuccess, initialTable } = props;
    const [tableName, setTableName] = useState('');
    const [loading, setLoading] = useState(false);
    const [positions, setPositions] = useState<string[]>([]);
    
    // Mặc định có id và created_at
    const [columns, setColumns] = useState<ColumnDef[]>([
        { id: '1', name: 'id', type: 'uuid', isPk: true, isRequired: true, defaultValue: 'gen_random_uuid()', permRead: ['all'], permEdit: [], permDelete: [], logicCode: '' },
        { id: '2', name: 'created_at', type: 'timestamptz', isPk: false, isRequired: true, defaultValue: 'now()', permRead: ['all'], permEdit: [], permDelete: [], logicCode: '' },
    ]);
    
    const [colWidths, setColWidths] = useState<number[]>([250, 150, 150, 80, 80, 80, 60, 60, 50]);
    const resizingCol = useRef<number | null>(null); const startX = useRef<number>(0); const startWidth = useRef<number>(0);
    const [codeEditor, setCodeEditor] = useState({ isOpen: false, idx: null as number | null, tempCode: '', error: null as string | null });

    useEffect(() => {
        const init = async () => {
            const { data } = await supabase.rpc('get_unique_positions');
            setPositions(['all', ...(data?.map((p: any) => p.vi_tri) || ['admin'])]);
            if (initialTable) {
                setTableName(initialTable); setLoading(true);
                const { data: schema } = await supabase.rpc('get_table_schema_details', { table_name_input: initialTable });
                setLoading(false);
                if (schema?.length) {
                    setColumns(schema.map((c: any, i: number) => ({
                        id: `col_${i}`, name: c.column_name, type: c.data_type,
                        isPk: c.column_default?.includes('gen_random_uuid') || c.column_name === 'id',
                        isRequired: !c.is_nullable, defaultValue: c.column_default || '',
                        permRead: ['all'], permEdit: [], permDelete: [], logicCode: ''
                    })));
                    // Gọi Auto-fit ngay khi load xong
                    setTimeout(() => autoFit(), 100);
                }
            }
        };
        init();
    }, [initialTable]);

    // 🟢 AUTO-FIT LOGIC
    const autoFit = () => {
        const newWidths = [...colWidths];
        // Tính toán độ rộng dựa trên độ dài nội dung (ước lượng)
        // Cột 0: Name (Ưu tiên rộng)
        const maxNameLen = Math.max(120, ...columns.map(c => (c.name?.length || 0) * 8 + 40));
        newWidths[0] = Math.min(300, maxNameLen); 
        // Cột 1: Type
        newWidths[1] = 160; 
        // Cột 2: Default
        const maxDefLen = Math.max(120, ...columns.map(c => (c.defaultValue?.length || 0) * 8 + 40));
        newWidths[2] = Math.min(250, maxDefLen);
        
        setColWidths(newWidths);
    };

    const updateColumn = (i: number, f: keyof ColumnDef, v: any) => setColumns(prev => { const n = [...prev]; n[i] = { ...n[i], [f]: v }; if(f==='isPk'&&v) n[i].isRequired=true; return n; });
    const togglePermission = (i: number, t: 'permRead'|'permEdit'|'permDelete', r: string) => {
        const cur = columns[i][t]; let n = r==='all' ? (cur.includes('all')?[]:['all']) : cur.filter(x=>x!=='all');
        if(r!=='all') n = n.includes(r) ? n.filter(x=>x!==r) : [...n,r];
        updateColumn(i, t, n);
    };
    
    const handleSave = async () => {
        if (!tableName) return alert('Nhập tên bảng!');
        setLoading(true);
        const clean = tableName.toLowerCase().replace(/\s+/g, '_');
        const res = await manageTableStructureAction(clean, columns.map(c => ({
            name: c.name.toLowerCase().replace(/\s+/g, '_'), type: c.type, isPk: c.isPk, isNullable: !c.isRequired, defaultValue: c.defaultValue
        })));
        setLoading(false);
        if (res.success) { alert('Thành công!'); onSuccess(clean); } else alert('Lỗi: ' + res.error);
    };

    const handleUnlock = async () => {
        if(!tableName || !confirm(`Mở khóa bảng ${tableName}?`)) return;
        setLoading(true); const res = await unlockTableAction(tableName); setLoading(false);
        alert(res.success?'Đã mở khóa!':'Lỗi: '+res.error);
    };

    const onMouseDown = (i: number, e: React.MouseEvent) => { resizingCol.current=i; startX.current=e.clientX; startWidth.current=colWidths[i]; window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp); };
    const onMove = (e: MouseEvent) => setColWidths(prev => { const n=[...prev]; n[resizingCol.current!] = Math.max(50, startWidth.current+(e.clientX-startX.current)); return n; });
    const onUp = () => { resizingCol.current=null; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };

    return (
        <div className="flex flex-col h-full w-full bg-[#1a120f] overflow-hidden">
            <Toolbar tableName={tableName} setTableName={setTableName} initialTable={initialTable} onUnlock={handleUnlock} onSave={handleSave} loading={loading}/>
            
            {/* Nút Auto Fit thủ công */}
            <div className="bg-[#161210] px-4 py-1 flex justify-end border-b border-[#8B5E3C]/10">
                <button onClick={autoFit} className="flex items-center gap-1 text-[10px] text-[#8B5E3C] hover:text-[#C69C6D] uppercase font-bold"><Maximize size={10}/> Auto Fit Cột</button>
            </div>

            <TableGrid columns={columns} colWidths={colWidths} onMouseDown={onMouseDown} updateColumn={updateColumn} togglePermission={togglePermission} removeColumn={(i)=>columns.length>1&&setColumns(c=>c.filter((_,idx)=>idx!==i))} openCodeEditor={(i)=>setCodeEditor({isOpen:true, idx:i, tempCode:columns[i].logicCode||'', error:null})} positions={positions}/>
            
            <div className="flex gap-2 p-2">
                <button onClick={()=>setColumns([...columns, {id:`new_${Date.now()}`, name:'', type:'text', isPk:false, isRequired:false, defaultValue:'', permRead:['all'], permEdit:[], permDelete:[], logicCode:''}])} className="flex items-center gap-2 text-[10px] font-bold text-[#8B5E3C] hover:text-[#C69C6D] px-4 py-2 border border-[#8B5E3C]/20 hover:border-[#C69C6D] rounded border-dashed transition-all"><Plus size={14}/> THÊM DÒNG</button>
                {/* Nút thêm nhanh cột đặc biệt */}
                <button onClick={()=>setColumns([...columns, {id:`spec_img_${Date.now()}`, name:'hinh_anh', type:'text', isPk:false, isRequired:false, defaultValue:'', permRead:['all'], permEdit:[], permDelete:[], logicCode:''}])} className="flex items-center gap-2 text-[10px] font-bold text-blue-400 hover:text-blue-300 px-4 py-2 border border-blue-900/30 hover:border-blue-500 rounded border-dashed transition-all">+ Cột Hình Ảnh</button>
                <button onClick={()=>setColumns([...columns, {id:`spec_name_${Date.now()}`, name:'ten_hien_thi', type:'text', isPk:false, isRequired:false, defaultValue:'', permRead:['all'], permEdit:[], permDelete:[], logicCode:''}])} className="flex items-center gap-2 text-[10px] font-bold text-green-400 hover:text-green-300 px-4 py-2 border border-green-900/30 hover:border-green-500 rounded border-dashed transition-all">+ Cột Tên Hiển Thị</button>
            </div>

            <CodeEditor isOpen={codeEditor.isOpen} onClose={()=>setCodeEditor(p=>({...p, isOpen:false}))} code={codeEditor.tempCode} setCode={(c)=>setCodeEditor(p=>({...p, tempCode:c}))} error={codeEditor.error} onSave={()=>{try{if(codeEditor.tempCode.trim())new Function('value','row',codeEditor.tempCode);updateColumn(codeEditor.idx!,'logicCode',codeEditor.tempCode);setCodeEditor(p=>({...p, isOpen:false}));}catch(e:any){setCodeEditor(p=>({...p, error:e.message}));}}}/>
        </div>
    );
}