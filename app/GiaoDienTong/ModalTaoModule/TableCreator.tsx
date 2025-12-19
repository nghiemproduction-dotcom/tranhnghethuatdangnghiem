'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Save, X, Key, AlignLeft, Hash, Calendar, Code, Cpu, Loader2, Eye, Edit, Trash, CheckSquare, AlertTriangle, ChevronDown, Check, Unlock } from 'lucide-react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { manageTableStructureAction, unlockTableAction } from '@/app/actions/admindb';

// --- CONSTANTS: KIỂU DỮ LIỆU ---
const SUPABASE_TYPES = [
    {
        group: '1. Định danh & Khóa chính',
        types: [
            { value: 'uuid', label: 'UUID (Khóa chính chuẩn)' },
            { value: 'int8', label: 'BigInt (Số nguyên lớn)' },
            { value: 'int4', label: 'Integer (Số nguyên thường)' },
        ]
    },
    {
        group: '2. Chuỗi & Văn bản',
        types: [
            { value: 'text', label: 'Text (Văn bản dài)' },
            { value: 'varchar', label: 'Varchar (Có giới hạn)' },
            { value: 'char', label: 'Char (Cố định)' },
        ]
    },
    {
        group: '3. Số học & Tiền tệ',
        types: [
            { value: 'numeric', label: 'Numeric (Tiền tệ/Chính xác)' },
            { value: 'float8', label: 'Float8 (Số thực lớn)' },
            { value: 'float4', label: 'Float4 (Số thực nhỏ)' },
            { value: 'int2', label: 'SmallInt (Số rất nhỏ)' },
        ]
    },
    {
        group: '4. Thời gian & Ngày tháng',
        types: [
            { value: 'timestamptz', label: 'Datetime (Có múi giờ)' },
            { value: 'timestamp', label: 'Timestamp (Không múi giờ)' },
            { value: 'date', label: 'Date (Ngày tháng)' },
            { value: 'time', label: 'Time (Giờ phút)' },
        ]
    },
    {
        group: '5. Logic & Dữ liệu phức tạp',
        types: [
            { value: 'boolean', label: 'Boolean (Đúng/Sai)' },
            { value: 'jsonb', label: 'JSONB (Dữ liệu động/NoSQL)' },
            { value: 'json', label: 'JSON (Lưu text thuần)' },
            { value: 'text[]', label: 'Array (Mảng Link/Tag)' },
            { value: 'vector', label: 'Vector (AI Embeddings)' },
        ]
    }
];

// --- INTERFACES ---
interface ColumnDef {
    id: string; // ID duy nhất cho UI render
    name: string;
    // ĐÃ BỎ: label (Tên hiển thị)
    type: string;
    isPk: boolean;
    isRequired: boolean; // UI dùng Required, DB dùng Nullable (ngược lại)
    defaultValue: string;
    
    // Phân quyền chi tiết 3 lớp
    permRead: string[];   // Vị trí được xem
    permEdit: string[];   // Vị trí được sửa
    permDelete: string[]; // Vị trí được xóa
    
    logicCode?: string;   // Mã kiểm tra logic
}

interface Props {
    onClose?: () => void;
    onSuccess: (tableName: string) => void;
    initialTable?: string;
    isEmbedded?: boolean; // Chế độ nhúng
}

export default function TableCreator({ onClose, onSuccess, initialTable, isEmbedded = false }: Props) {
    // --- STATE QUẢN LÝ DỮ LIỆU ---
    const [tableName, setTableName] = useState('');
    const [loading, setLoading] = useState(false);
    const [positions, setPositions] = useState<string[]>([]); // Danh sách vị trí (Role)
    
    // State danh sách cột (Khởi tạo mặc định chỉ có ID và Created_At, không có data rác)
    const [columns, setColumns] = useState<ColumnDef[]>([
        { 
            id: 'col_default_1', 
            name: 'id', 
            type: 'uuid', 
            isPk: true, 
            isRequired: true, 
            defaultValue: 'gen_random_uuid()', 
            permRead: ['all'], 
            permEdit: [], 
            permDelete: [], 
            logicCode: '' 
        },
        { 
            id: 'col_default_2', 
            name: 'created_at', 
            type: 'timestamptz', 
            isPk: false, 
            isRequired: true, 
            defaultValue: 'now()', 
            permRead: ['all'], 
            permEdit: [], 
            permDelete: [], 
            logicCode: '' 
        },
    ]);

    // --- STATE GIAO DIỆN & RESIZE ---
    // Độ rộng mặc định cho các cột (Đã bỏ AutoFit, chỉnh rộng ra cho dễ nhìn)
    const [colWidths, setColWidths] = useState<number[]>([250, 180, 180, 100, 100, 100, 80, 120, 60]);
    const resizingCol = useRef<number | null>(null);
    const startX = useRef<number>(0);
    const startWidth = useRef<number>(0);

    // --- STATE CODE EDITOR ---
    const [isCodeEditorOpen, setIsCodeEditorOpen] = useState(false);
    const [currentCodeColIndex, setCurrentCodeColIndex] = useState<number | null>(null);
    const [tempCode, setTempCode] = useState('');
    const [codeError, setCodeError] = useState<string | null>(null);

    // --- LOAD DATA BAN ĐẦU ---
    useEffect(() => {
        const initData = async () => {
            // 1. Lấy danh sách vị trí từ bảng nhan_su
            const { data: posData } = await supabase.rpc('get_unique_positions');
            if (posData && posData.length > 0) {
                setPositions(['all', ...posData.map((p: any) => p.vi_tri)]);
            } else {
                setPositions(['all', 'admin', 'quanly', 'nhanvien', 'ketoan', 'kho', 'sale']); // Fallback
            }

            // 2. Nếu đang sửa bảng cũ -> Load Schema
            if (initialTable) {
                setTableName(initialTable);
                setLoading(true);
                // Gọi RPC lấy chi tiết cấu trúc bảng
                const { data: schema, error } = await supabase.rpc('get_table_schema_details', { table_name_input: initialTable });
                setLoading(false);
                
                if (error) {
                    console.error("Lỗi load schema:", error);
                    return;
                }

                if (schema && schema.length > 0) {
                    const loadedCols = schema.map((c: any, idx: number) => ({
                        id: `col_loaded_${idx}`,
                        name: c.column_name,
                        // Bỏ label khi load từ DB
                        type: c.data_type,
                        isPk: c.column_default?.includes('gen_random_uuid') || c.column_name === 'id',
                        isRequired: !c.is_nullable,
                        defaultValue: c.column_default || '',
                        // Mặc định quyền cho bảng cũ (vì DB không lưu quyền UI)
                        permRead: ['all'], 
                        permEdit: ['admin', 'quanly'], 
                        permDelete: ['admin'],
                        logicCode: ''
                    }));
                    setColumns(loadedCols);
                }
            } else {
                // Nếu tạo mới -> Reset về mặc định
                setTableName('');
            }
        };
        initData();
    }, [initialTable]);

    // --- LOGIC 2: KÉO THẢ RESIZE CỘT (GIỮ LẠI ĐỂ USER KÉO TAY) ---
    const handleMouseDown = (idx: number, e: React.MouseEvent) => {
        resizingCol.current = idx;
        startX.current = e.clientX;
        startWidth.current = colWidths[idx];
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'col-resize'; // Đổi con trỏ toàn màn hình
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (resizingCol.current === null) return;
        const diff = e.clientX - startX.current;
        const newWidth = Math.max(50, startWidth.current + diff); // Min width 50px
        setColWidths(prev => {
            const next = [...prev];
            next[resizingCol.current!] = newWidth;
            return next;
        });
    };

    const handleMouseUp = () => {
        resizingCol.current = null;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'default';
    };

    // --- LOGIC 3: CRUD CỘT (THÊM, SỬA, XÓA) ---
    const addColumn = () => {
        const newId = `new_${Date.now()}`;
        setColumns([...columns, { 
            id: newId, 
            name: '', 
            // Bỏ label
            type: 'text', 
            isPk: false, 
            isRequired: false, 
            defaultValue: '', 
            permRead: ['all'], 
            permEdit: [], 
            permDelete: [], 
            logicCode: '' 
        }]);
    };

    const removeColumn = (index: number) => {
        if (columns.length <= 1) {
            alert("Bảng phải có ít nhất 1 cột!");
            return;
        }
        if (confirm("Bạn có chắc chắn muốn xóa cột này không?")) {
            setColumns(prev => prev.filter((_, i) => i !== index));
        }
    };

    const updateColumn = (index: number, field: keyof ColumnDef, value: any) => {
        const newCols = [...columns];
        newCols[index] = { ...newCols[index], [field]: value };
        
        // Logic phụ: Nếu là PK thì bắt buộc Required
        if (field === 'isPk' && value === true) {
            newCols[index].isRequired = true;
        }
        
        setColumns(newCols);
    };

    // --- LOGIC 4: XỬ LÝ QUYỀN (TOGGLE ARRAY) ---
    const togglePermission = (colIndex: number, type: 'permRead' | 'permEdit' | 'permDelete', role: string) => {
        const col = columns[colIndex];
        let newPerms = col[type] || [];
        
        if (role === 'all') {
            // Nếu chọn 'all' -> Xóa hết các cái khác, chỉ giữ 'all'
            newPerms = newPerms.includes('all') ? [] : ['all'];
        } else {
            // Nếu chọn role cụ thể -> Bỏ 'all'
            newPerms = newPerms.filter(p => p !== 'all');
            
            if (newPerms.includes(role)) {
                newPerms = newPerms.filter(p => p !== role);
            } else {
                newPerms = [...newPerms, role];
            }
        }
        updateColumn(colIndex, type, newPerms);
    };

    // --- LOGIC 5: CODE EDITOR & VALIDATE ---
    const openCodeEditor = (index: number) => {
        setCurrentCodeColIndex(index);
        setTempCode(columns[index].logicCode || '');
        setCodeError(null);
        setIsCodeEditorOpen(true);
    };

    const validateAndSaveCode = () => {
        // Kiểm tra cú pháp cơ bản
        try {
            if (tempCode.trim()) {
                new Function('value', 'row', 'utils', tempCode); 
            }
            if (currentCodeColIndex !== null) {
                updateColumn(currentCodeColIndex, 'logicCode', tempCode);
            }
            setIsCodeEditorOpen(false);
        } catch (e: any) {
            setCodeError("Lỗi cú pháp: " + e.message);
        }
    };

    // --- LOGIC 6: LƯU VÀO SUPABASE (GỌI SERVER ACTION) ---
    const handleSave = async () => {
        if (!tableName) return alert('Vui lòng nhập tên bảng!');
        
        // Validate cơ bản
        const invalidCols = columns.filter(c => !c.name || !c.type);
        if (invalidCols.length > 0) return alert('Có cột chưa nhập tên hoặc kiểu dữ liệu!');

        setLoading(true);
        
        // Chuẩn bị dữ liệu để gửi lên Server Action
        const cleanTableName = tableName.toLowerCase().replace(/\s+/g, '_');
        
        // Map lại object, bỏ các trường không cần thiết như permRead/Edit (vì DB không lưu)
        const columnsPayload = columns.map(c => ({
            name: c.name.toLowerCase().replace(/\s+/g, '_'),
            type: c.type,
            isPk: c.isPk,
            isNullable: !c.isRequired, // Required = NOT Nullable
            defaultValue: c.defaultValue
        }));

        // Gọi Server Action (Trực tiếp, không qua RPC)
        const result = await manageTableStructureAction(cleanTableName, columnsPayload);

        setLoading(false);

        if (result.success) {
            alert(initialTable ? 'Cập nhật bảng thành công!' : 'Tạo bảng mới thành công!');
            onSuccess(cleanTableName);
        } else {
            alert('Lỗi khi lưu bảng: ' + result.error);
        }
    };

    // --- LOGIC 7: MỞ KHÓA BẢNG (DISABLE RLS) ---
    const handleUnlockTable = async () => {
        if (!tableName) return alert('Vui lòng nhập/chọn tên bảng cần mở khóa!');
        if (!confirm(`CẢNH BÁO AN TOÀN:\n\nBạn có chắc chắn muốn TẮT BẢO MẬT (Disable RLS) cho bảng '${tableName}' không?\n\nHành động này sẽ cho phép mọi người dùng (kể cả chưa đăng nhập) có thể xem và chỉnh sửa dữ liệu.`)) {
            return;
        }

        setLoading(true);
        const result = await unlockTableAction(tableName.toLowerCase().replace(/\s+/g, '_'));
        setLoading(false);

        if (result.success) {
            alert(`Đã mở khóa thành công!\nBảng: ${tableName}\nTrạng thái: RLS Disabled (Full Access)`);
        } else {
            alert('Lỗi mở khóa: ' + result.error);
        }
    };

    // --- HELPER: RENDER TYPE DROPDOWN (NỀN TỐI) ---
    const renderTypeDropdown = (colIdx: number) => {
        const currentType = columns[colIdx].type;
        return (
            <div className="relative group/type h-full w-full">
                <div className="w-full h-full flex items-center px-2 text-xs text-[#F5E6D3] cursor-pointer hover:bg-[#C69C6D]/10">
                    <span className="truncate flex-1">{currentType}</span>
                    <ChevronDown size={10} className="opacity-50 ml-1"/>
                </div>
                {/* Dropdown Content - NỀN TỐI */}
                <div className="absolute top-[80%] left-0 w-[200px] bg-[#1a120f] border border-[#8B5E3C] rounded-lg shadow-xl z-[100] hidden group-hover/type:block max-h-[300px] overflow-y-auto custom-scroll">
                    {SUPABASE_TYPES.map((group, gIdx) => (
                        <div key={gIdx} className="border-b border-[#8B5E3C]/20 last:border-0">
                            <div className="px-2 py-1.5 bg-[#2a1e1b] text-[10px] font-bold text-[#C69C6D] uppercase">{group.group}</div>
                            {group.types.map(t => (
                                <div 
                                    key={t.value}
                                    onClick={() => updateColumn(colIdx, 'type', t.value)}
                                    className={`px-3 py-2 text-xs cursor-pointer hover:bg-[#C69C6D] hover:text-[#1a120f] flex justify-between ${currentType === t.value ? 'text-[#C69C6D] font-bold' : 'text-[#8B5E3C]'}`}
                                >
                                    <span>{t.label}</span>
                                    {currentType === t.value && <Check size={12}/>}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // --- HELPER: RENDER DROPDOWN QUYỀN ---
    const renderPermDropdown = (colIdx: number, type: 'permRead' | 'permEdit' | 'permDelete', label: string) => {
        const selected = columns[colIdx][type];
        const isAll = selected.includes('all');
        const count = selected.length;
        
        return (
            <div className="relative group/perm h-full w-full">
                {/* Trigger */}
                <div className={`w-full h-full flex items-center px-3 text-xs cursor-pointer hover:bg-[#C69C6D]/10 transition-colors border-l border-transparent hover:border-[#C69C6D]/30 ${count > 0 ? 'text-[#F5E6D3]' : 'text-gray-500'}`}>
                    <span className="truncate flex-1">
                        {isAll ? 'Tất cả' : (count > 0 ? `${count} vị trí` : 'Chưa set')}
                    </span>
                    <ChevronDown size={10} className="opacity-50 ml-1"/>
                </div>

                {/* Dropdown Content */}
                <div className="absolute top-[90%] left-0 w-[220px] bg-[#1a120f] border border-[#8B5E3C] rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-[100] hidden group-hover/perm:flex flex-col max-h-[300px] overflow-hidden">
                    <div className="p-2 bg-[#161210] border-b border-[#8B5E3C]/20 text-[10px] font-bold text-[#C69C6D] uppercase tracking-wider sticky top-0">
                        {label}
                    </div>
                    <div className="overflow-y-auto custom-scroll p-1">
                        {positions.map(role => {
                            const isChecked = selected.includes(role);
                            return (
                                <label key={role} className="flex items-center gap-3 p-2 hover:bg-[#2a1e1b] rounded cursor-pointer transition-colors select-none">
                                    <div className={`w-4 h-4 border rounded flex items-center justify-center transition-all ${isChecked ? 'bg-[#C69C6D] border-[#C69C6D]' : 'border-[#8B5E3C]/50 hover:border-[#C69C6D]'}`}>
                                        {isChecked && <Check size={12} className="text-[#1a120f] stroke-[3]"/>}
                                    </div>
                                    <input type="checkbox" checked={isChecked} onChange={() => togglePermission(colIdx, type, role)} className="hidden"/>
                                    <span className={`text-xs uppercase font-medium ${isChecked ? 'text-[#F5E6D3]' : 'text-gray-500'}`}>{role}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    // --- CONFIG HEADER (BỎ CỘT LABEL) ---
    const HEADER_COLS = [
        { name: 'Tên Cột (DB)', width: colWidths[0] },
        // ĐÃ BỎ CỘT: Tên Hiển Thị
        { name: 'Kiểu Dữ Liệu', width: colWidths[1] },
        { name: 'Giá Trị Mặc Định', width: colWidths[2] },
        { name: 'Quyền Xem', width: colWidths[3], icon: <Eye size={12}/> },
        { name: 'Quyền Sửa', width: colWidths[4], icon: <Edit size={12}/> },
        { name: 'Quyền Xóa', width: colWidths[5], icon: <Trash size={12}/> },
        { name: 'Bắt Buộc', width: colWidths[6] },
        { name: 'Logic Code', width: colWidths[7] },
        { name: 'Xóa', width: colWidths[8] },
    ];

    return (
        <div className="flex flex-col h-full w-full bg-[#1a120f] overflow-hidden">
            
            {/* 1. TOOLBAR TRÊN CÙNG */}
            <div className="h-14 flex items-center justify-between px-4 bg-[#161210] border-b border-[#8B5E3C]/20 shrink-0">
                {/* Left: Tên Bảng */}
                <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-2 bg-[#0a0807] px-3 py-1.5 rounded border border-[#8B5E3C]/20">
                        <span className="text-[10px] font-bold text-[#8B5E3C] uppercase whitespace-nowrap">Tên Bảng (DB):</span>
                        <input 
                            type="text" 
                            value={tableName} 
                            onChange={(e) => setTableName(e.target.value)} 
                            disabled={!!initialTable}
                            className="bg-transparent text-[#F5E6D3] font-bold text-sm w-[200px] outline-none placeholder-[#5D4037]"
                            placeholder="nhap_ten_bang_khong_dau"
                        />
                    </div>
                    
                    {/* Nút Mở Khóa */}
                    <button 
                        onClick={handleUnlockTable} 
                        className="flex items-center gap-2 px-3 py-1.5 text-[#8B5E3C] hover:text-[#C69C6D] border border-[#8B5E3C]/20 hover:border-[#C69C6D] rounded bg-[#0a0807] transition-all text-xs font-bold uppercase"
                        title="Mở khóa quyền truy cập (Disable RLS)"
                    >
                        <Unlock size={14}/> Mở Khóa
                    </button>
                </div>

                {/* Right: Save Button */}
                <button 
                    onClick={handleSave} 
                    disabled={loading} 
                    className="flex items-center gap-2 px-6 py-2 bg-[#C69C6D] text-[#1a120f] font-bold text-xs uppercase rounded hover:bg-[#b08b5e] shadow-lg disabled:opacity-50 transition-all active:scale-95"
                >
                    {loading ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>}
                    <span>{initialTable ? 'Lưu Cấu Trúc' : 'Khởi Tạo Bảng'}</span>
                </button>
            </div>

            {/* 2. GRID TABLE EDITOR (MAIN AREA) */}
            <div className="flex-1 overflow-auto custom-scroll bg-[#0a0807] relative">
                
                {/* Header Row (Sticky) */}
                <div className="flex sticky top-0 z-20 bg-[#1e1715] border-b border-[#8B5E3C]/30 h-10 shadow-md">
                    <div className="w-10 shrink-0 border-r border-[#8B5E3C]/20 flex items-center justify-center text-[#8B5E3C] font-mono text-[10px] bg-[#2a1e1b]">#</div>
                    {HEADER_COLS.map((col, idx) => (
                        <div 
                            key={idx} 
                            className="relative flex items-center justify-center font-bold text-[#C69C6D] text-[10px] uppercase border-r border-[#8B5E3C]/20 shrink-0 group select-none hover:bg-[#2a1e1b]" 
                            style={{width: col.width}}
                        >
                            <span className="flex items-center gap-1.5">{col.icon} {col.name}</span>
                            {/* Resizer Handle */}
                            <div 
                                className="absolute right-0 top-0 bottom-0 w-[4px] cursor-col-resize hover:bg-[#C69C6D] z-30 opacity-0 group-hover:opacity-100 transition-opacity"
                                onMouseDown={(e) => handleMouseDown(idx, e)}
                            ></div>
                        </div>
                    ))}
                </div>

                {/* Data Rows */}
                <div className="flex flex-col pb-20">
                    {columns.map((col, idx) => (
                        <div key={col.id} className="flex border-b border-[#8B5E3C]/10 h-11 hover:bg-[#C69C6D]/5 transition-colors group relative">
                            {/* Index */}
                            <div className="w-10 shrink-0 border-r border-[#8B5E3C]/10 flex items-center justify-center text-[#5D4037] text-xs font-mono bg-[#1a120f]/50">{idx + 1}</div>
                            
                            {/* 1. Name */}
                            <div className="border-r border-[#8B5E3C]/10 shrink-0" style={{width: colWidths[0]}}>
                                <input type="text" value={col.name} onChange={(e) => updateColumn(idx, 'name', e.target.value)} className="w-full h-full bg-transparent px-3 text-sm text-[#F5E6D3] font-mono outline-none placeholder-[#5D4037]" placeholder="col_name"/>
                            </div>

                            {/* 2. Type */}
                            <div className="border-r border-[#8B5E3C]/10 shrink-0" style={{width: colWidths[1]}}>
                                {renderTypeDropdown(idx)}
                            </div>

                            {/* 3. Default */}
                            <div className="border-r border-[#8B5E3C]/10 shrink-0" style={{width: colWidths[2]}}>
                                <input type="text" value={col.defaultValue} onChange={(e) => updateColumn(idx, 'defaultValue', e.target.value)} className="w-full h-full bg-transparent px-3 text-xs text-gray-400 font-mono outline-none placeholder-gray-700" placeholder="NULL"/>
                            </div>

                            {/* 4, 5, 6. Permissions */}
                            <div className="border-r border-[#8B5E3C]/10 shrink-0" style={{width: colWidths[3]}}>{renderPermDropdown(idx, 'permRead', 'Quyền Xem')}</div>
                            <div className="border-r border-[#8B5E3C]/10 shrink-0" style={{width: colWidths[4]}}>{renderPermDropdown(idx, 'permEdit', 'Quyền Sửa')}</div>
                            <div className="border-r border-[#8B5E3C]/10 shrink-0" style={{width: colWidths[5]}}>{renderPermDropdown(idx, 'permDelete', 'Quyền Xóa')}</div>

                            {/* 7. Required/PK */}
                            <div className="border-r border-[#8B5E3C]/10 shrink-0 flex items-center justify-center gap-2" style={{width: colWidths[6]}}>
                                <div title="Khóa chính (Primary Key)" className={`w-5 h-5 flex items-center justify-center rounded cursor-pointer transition-all ${col.isPk ? 'bg-[#C69C6D] text-[#1a120f]' : 'bg-[#2a1e1b] text-[#5D4037]'}`} onClick={() => updateColumn(idx, 'isPk', !col.isPk)}>
                                    <Key size={10}/>
                                </div>
                                <div title="Bắt buộc nhập (Required)" className={`w-5 h-5 flex items-center justify-center rounded cursor-pointer border transition-all ${col.isRequired ? 'bg-red-900/30 border-red-500 text-red-400' : 'border-[#8B5E3C]/20 text-[#5D4037]'}`} onClick={() => !col.isPk && updateColumn(idx, 'isRequired', !col.isRequired)}>
                                    <span className="text-[9px] font-bold">*</span>
                                </div>
                            </div>

                            {/* 8. Logic Code */}
                            <div className="border-r border-[#8B5E3C]/10 shrink-0 p-1.5" style={{width: colWidths[7]}}>
                                <div 
                                    onClick={() => openCodeEditor(idx)} 
                                    className={`w-full h-full flex items-center px-2 cursor-pointer rounded border border-transparent hover:border-[#C69C6D]/30 transition-all ${col.logicCode ? 'bg-green-900/20 text-green-400' : 'text-[#5D4037] hover:bg-[#2a1e1b]'}`}
                                >
                                    <Code size={12} className="mr-1.5"/>
                                    <span className="truncate text-[10px] font-mono">{col.logicCode ? '{ JS }' : 'Trống'}</span>
                                </div>
                            </div>

                            {/* 9. Delete */}
                            <div className="shrink-0 flex items-center justify-center" style={{width: colWidths[8]}}>
                                <button onClick={() => removeColumn(idx)} className="p-1.5 text-[#5D4037] hover:text-red-500 hover:bg-red-900/10 rounded transition-all">
                                    <Trash2 size={14}/>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add Button */}
                <button 
                    onClick={addColumn} 
                    className="ml-10 mt-2 flex items-center gap-2 text-[10px] font-bold text-[#8B5E3C] hover:text-[#C69C6D] px-4 py-2 border border-[#8B5E3C]/20 hover:border-[#C69C6D] rounded border-dashed transition-all"
                >
                    <Plus size={14}/> THÊM DÒNG MỚI
                </button>
            </div>

            {/* 3. MODAL CODE EDITOR (FIXED OVERLAY) */}
            {isCodeEditorOpen && (
                <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-3xl bg-[#1a120f] border border-[#8B5E3C] rounded-xl shadow-2xl flex flex-col overflow-hidden">
                        {/* Header Editor */}
                        <div className="h-12 border-b border-[#8B5E3C]/20 flex justify-between items-center px-4 bg-[#161210]">
                            <div className="flex items-center gap-2 font-bold text-[#C69C6D]">
                                <Code size={18}/>
                                <span className="text-sm uppercase tracking-wider">Logic Script Editor</span>
                            </div>
                            <button onClick={() => setIsCodeEditorOpen(false)} className="text-[#8B5E3C] hover:text-white"><X size={20}/></button>
                        </div>

                        {/* Editor Area */}
                        <div className="h-[400px] relative bg-[#0a0807]">
                            <textarea 
                                value={tempCode} 
                                onChange={(e) => setTempCode(e.target.value)} 
                                className="w-full h-full bg-transparent text-[#F5E6D3] font-mono text-xs p-4 outline-none resize-none leading-relaxed" 
                                placeholder={`// Viết mã Javascript tại đây...\n// Ví dụ Validate:\nif (value < 0) return "Giá trị không được âm";\n\n// Ví dụ Formula:\nreturn row.don_gia * row.so_luong;`}
                                spellCheck={false}
                            />
                        </div>

                        {/* Footer Editor */}
                        <div className="p-3 border-t border-[#8B5E3C]/20 bg-[#161210] flex justify-between items-center">
                            <div className="text-xs text-red-400 flex items-center gap-2">
                                {codeError && <><AlertTriangle size={14}/> {codeError}</>}
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setIsCodeEditorOpen(false)} className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-white uppercase">Hủy</button>
                                <button onClick={validateAndSaveCode} className="px-6 py-2 bg-[#C69C6D] text-[#1a120f] font-bold text-xs rounded uppercase hover:bg-[#b08b5e] flex items-center gap-2">
                                    <CheckSquare size={14}/> Lưu & Kiểm Tra
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}