'use client'
import { useState, useEffect, useRef } from 'react'
import { 
    fetchDbTables, fetchDbColumns, createFeatureFolder, writeFeatureFile, 
    fetchUserRoles, registerFeatureInClientSmart, 
    fetchExistingFeatures, deleteFeatureFolder, saveFeatureMeta, loadFeatureMeta, scanForTabs,
    deepAnalyzeTable
} from '@/app/phonglamviec/TaoChucNang/generator'
import { 
    Folder, Database, Shield, Layout, CheckCircle, 
    Play, RefreshCw, Terminal, 
    Trash2, PlusCircle, Copy, FileCode, Filter,
    Type, AlignLeft, Image as ImageIcon, ArrowUpDown, Eye, EyeOff, Edit3, Lock, List, Link, 
    Sidebar,
    ChevronRight,
    Home
} from 'lucide-react'
import { useUser } from '@/lib/UserContext'

type PermissionType = 'read' | 'create' | 'update' | 'delete';
type ColumnConfig = {
    key: string; label: string; originalType: string;
    inputType: 'text'|'number'|'date'|'select'|'image'|'textarea'|'checkbox';
    showInList: boolean; showInForm: boolean; required: boolean; placeholder?: string; isOwnerField: boolean;
}
type RoleConfig = { roleName: string; permissions: PermissionType[]; canViewAll: boolean; }
type LinkedModuleConfig = { moduleName: string; label: string; tableName: string; foreignKey: string; }

export default function TaoChucNangPage() {
    const { user } = useUser();
    
    // --- STATE ---
    const [step, setStep] = useState(1);
    const [existingFeatures, setExistingFeatures] = useState<string[]>([]);
    const [logs, setLogs] = useState<string[]>([]);
    const logsEndRef = useRef<HTMLDivElement>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);

    const [meta, setMeta] = useState({
        folderName: '', featureLabel: '', tableName: '',
        columns: [] as ColumnConfig[],
        roles: [] as RoleConfig[],
        actionConfig: { create: true, update: true, delete: true, bulkDelete: true },
        dalConfig: { sortColumn: '', sortOrder: 'desc' as 'asc'|'desc' },
        ownerColumn: '', tabFilterColumn: '',
        displaySettings: { colTitle: '', colSubTitle: '', colImage: '' },
        storageBucket: '',
        isGameMode: false
    });
    
    const [detectedTabs, setDetectedTabs] = useState<any[]>([]);
    // [MỚI] State cho module liên kết
    const [linkedModules, setLinkedModules] = useState<LinkedModuleConfig[]>([]);
    const [dbTables, setDbTables] = useState<string[]>([]);
    const [availableRoles, setAvailableRoles] = useState<string[]>([]);
    
    // Cache danh sách cột của các module khác để chọn foreign key
    const [remoteColumns, setRemoteColumns] = useState<Record<string, string[]>>({});

    const addLog = (msg: string, type: 'info'|'success'|'error' = 'info') => {
        const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
        setLogs(p => [...p, `[${new Date().toLocaleTimeString()}] ${icon} ${msg}`]);
    };

    const generateSqlPrompt = () => {
        if (!meta.tableName) return '-- Chưa chọn bảng dữ liệu';
        return `-- SQL RLS POLICY --\nALTER TABLE "${meta.tableName}" ENABLE ROW LEVEL SECURITY;\nDROP POLICY IF EXISTS "Public Access" ON "${meta.tableName}";\nCREATE POLICY "Public Access" ON "${meta.tableName}" FOR ALL USING (true);`;
    }

    const updateCol = (idx: number, field: keyof ColumnConfig, val: any) => {
        const newCols = [...meta.columns]; (newCols[idx] as any)[field] = val; setMeta(p => ({...p, columns: newCols}));
    }

    useEffect(() => { logsEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);
    useEffect(() => { loadInitData(); }, []);

    const loadInitData = async () => {
        setExistingFeatures(await fetchExistingFeatures());
        setDbTables(await fetchDbTables());
        setAvailableRoles(await fetchUserRoles());
    }

    const handleSelectTable = async (tbl: string) => {
        if (!tbl) { setMeta(p => ({...p, tableName: ''})); return; }
        setMeta(p => ({ ...p, tableName: tbl }));
        addLog(`🕵️‍♀️ Đang soi dữ liệu bảng '${tbl}'...`, 'info');
        try {
            const analysis = await deepAnalyzeTable(tbl);
            const defaultRoles: RoleConfig[] = availableRoles.map(r => ({
                roleName: r,
                permissions: ['admin', 'quanly'].includes(r) ? ['read', 'create', 'update', 'delete'] : ['read'],
                canViewAll: ['admin', 'quanly'].includes(r)
            }));
            setMeta(p => ({ 
                ...p, tableName: tbl, columns: analysis.columns, roles: defaultRoles,
                dalConfig: analysis.dalConfig as any, displaySettings: analysis.displaySettings,
                tabFilterColumn: analysis.tabFilterColumn,
                storageBucket: analysis.displaySettings.colImage ? 'avatar' : '',
                isGameMode: analysis.suggestions.possibleGameMode
            }));
            addLog(`✅ Đã hiểu dữ liệu! (${analysis.columns.length} cột)`, 'success');
        } catch (e: any) { addLog(`Lỗi phân tích: ${e.message}`, 'error'); }
    }

    const handleSelectFeature = async (fname: string) => {
        setIsProcessing(true);
        const savedMeta = await loadFeatureMeta(fname);
        if (savedMeta) {
            setMeta({ ...savedMeta, displaySettings: savedMeta.displaySettings || { colTitle: '', colSubTitle: '', colImage: '' } });
            const currentTabs = await scanForTabs(fname);
            const mergedTabs = currentTabs.map((t: any) => ({ ...t, selected: savedMeta.savedTabSettings?.find((s:any) => s.fileName === t.fileName)?.selected || false }));
            setDetectedTabs(mergedTabs);
            // Load linked modules if saved
            setLinkedModules(savedMeta.linkedModules || []);
            setStep(2);
            addLog(`Đã tải cấu hình: ${fname}`, 'success');
        } else {
            setMeta(prev => ({ ...prev, folderName: fname, featureLabel: fname }));
            setStep(1);
        }
        setIsProcessing(false);
        // Không tự động đóng sidebar trên desktop để giữ bố cục
        if(window.innerWidth < 768) setShowSidebar(false);
    }

    // [MỚI] Hàm thêm module liên kết
    const addLinkedModule = async (moduleName: string) => {
        // 1. Load meta của module đó để lấy tableName
        const targetMeta = await loadFeatureMeta(moduleName);
        if (!targetMeta) { alert("Không đọc được cấu hình module này"); return; }
        
        // 2. Load columns của table đó để chọn Foreign Key
        const cols = await fetchDbColumns(targetMeta.tableName);
        setRemoteColumns(prev => ({...prev, [moduleName]: cols.map((c:any) => c.column_name)}));

        setLinkedModules(prev => [...prev, {
            moduleName,
            label: targetMeta.featureLabel,
            tableName: targetMeta.tableName,
            foreignKey: '' // Người dùng sẽ chọn sau
        }]);
    }

    const handleFinish = async () => {
        setIsProcessing(true);
        addLog("Đang sinh mã nguồn chuẩn...", 'info');
        try {
            await createFeatureFolder(meta.folderName); 
            await writeFeatureFile(meta.folderName, 'dto.ts', await import('./generator').then(m => m.generateDtoContent(meta.folderName, meta)));
            await writeFeatureFile(meta.folderName, 'dal.ts', await import('./generator').then(m => m.generateDalContent(meta.folderName, meta)));
            
            let acts = [`const TABLE = '${meta.tableName}';`, `const PATH = '/phonglamviec';`];
            if(meta.actionConfig.create) acts.push(`export async function create${meta.folderName}(data: any) { return await genericCreate(TABLE, data, PATH); }`);
            if(meta.actionConfig.update) acts.push(`export async function update${meta.folderName}(id: string, data: any) { return await genericUpdate(TABLE, id, data, PATH); }`);
            if(meta.actionConfig.delete) acts.push(`export async function delete${meta.folderName}(id: string) { return await genericDelete(TABLE, id, PATH); }`);
            if(meta.actionConfig.bulkDelete) acts.push(`export async function deleteBulk${meta.folderName}(ids: string[]) {\n  try {\n    await Promise.all(ids.map(id => genericDelete(TABLE, id, PATH)));\n    return { success: true };\n  } catch (e: any) { return { success: false, message: e.message }; }\n}`);
            await writeFeatureFile(meta.folderName, 'actions.ts', `'use server'\nimport { genericCreate, genericUpdate, genericDelete } from '@/app/phonglamviec/generic-actions'\n\n${acts.join('\n')}`);

            let currentSelectedTabs = [...detectedTabs.filter(t=>t.selected)];
            if (meta.isGameMode) {
                await writeFeatureFile(meta.folderName, 'TabThanhTich.tsx', await import('./generator').then(m => m.generateTabThanhTichContent(meta.folderName)));
                currentSelectedTabs.push({ componentName: 'TabThanhTich', importPath: './TabThanhTich', label: 'THÀNH TÍCH' });
            }

            // [MỚI] Truyền linkedModules vào generator
            await writeFeatureFile(meta.folderName, 'config.tsx', await import('./generator').then(m => m.generateConfigContent(meta.folderName, meta, currentSelectedTabs, linkedModules)));
            await saveFeatureMeta(meta.folderName, { ...meta, savedTabSettings: detectedTabs, linkedModules });
            await registerFeatureInClientSmart(meta.folderName, meta.featureLabel, meta.tableName);

            addLog("✅ TRIỂN KHAI THÀNH CÔNG! Hãy F5.", 'success');
        } catch (e: any) { addLog(`Lỗi: ${e.message}`, 'error'); }
        setIsProcessing(false);
    }

    const handleDeleteFeature = async (fname: string) => {
        if(!confirm(`XÓA vĩnh viễn chức năng "${fname}"?`)) return;
        setIsProcessing(true);
        const res = await deleteFeatureFolder(fname);
        if (res.success) {
            addLog(`Đã xóa ${fname}`, 'success');
            await loadInitData();
            if (meta.folderName === fname) setStep(1);
        } else { addLog(`Lỗi xóa: ${res.message}`, 'error'); }
        setIsProcessing(false);
    }

    const handleReset = () => {
        setStep(1); 
        setMeta({ folderName:'', featureLabel:'', tableName:'', columns:[], roles:[], actionConfig:{create:true,update:true,delete:true,bulkDelete:true}, dalConfig:{sortColumn:'tao_luc',sortOrder:'desc'}, ownerColumn: '', tabFilterColumn: '', displaySettings: {colTitle:'', colSubTitle:'', colImage:''}, storageBucket: '', isGameMode: false }); 
        setLinkedModules([]);
    }

    if (user?.phan_loai !== 'admin') return <div className="text-red-500 p-10 font-bold">⛔ ADMIN ACCESS ONLY</div>;
    
    // UI Helpers
    const stepNames = ["Khởi tạo", "Nguồn", "Phân quyền", "Giao diện", "Cột", "Hoàn tất"];
    const cardStyle = "bg-[#111] border border-white/10 p-6 md:p-8 rounded-xl shadow-xl space-y-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-300 w-full";
    const labelStyle = "text-[10px] font-bold text-gray-500 uppercase mb-2 flex items-center gap-2 tracking-widest";
    const inputStyle = "w-full bg-[#050505] border border-white/10 text-white text-sm font-medium p-3 rounded-lg outline-none focus:border-[#C69C6D] transition-colors placeholder:text-gray-700 appearance-none";
    
    return (
        <div className="flex h-screen w-full bg-[#050505] text-white font-sans overflow-hidden selection:bg-[#C69C6D] selection:text-black">

           
            
            {/* COMPACT SIDEBAR - JUST HISTORY */}
            <div className={`transition-all duration-300 ease-in-out border-r border-white/5 bg-[#080808]   pb-20 mt-10 md:mt-20 flex flex-col ${showSidebar ? 'w-64 translate-x-0' : 'w-0 -translate-x-full opacity-0 overflow-hidden'} z-20`}>
                <div className="p-4 border-b border-white/5 bg-[#0a0a0a] sticky top-0 ">
                   <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2"><Folder size={12}/> Đã tạo ({existingFeatures.length})</div>
                </div>
                <div className="flex-1 p-2 space-y-1 overflow-y-auto custom-scrollbar">
                    {existingFeatures.map(f => (
                        <div key={f} onClick={() => handleSelectFeature(f)} className={`p-3 rounded-lg cursor-pointer text-xs font-bold flex justify-between items-center group transition-all ${meta.folderName === f ? 'bg-[#C69C6D]/10 text-[#C69C6D] border border-[#C69C6D]/30' : 'text-gray-400 hover:bg-white/5'}`}>
                            <div className="flex items-center gap-2 truncate"><Folder size={14} className={meta.folderName === f ? "fill-current" : ""}/> {f}</div>
                            <button className="p-1 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); handleDeleteFeature(f); }}><Trash2 size={14}/></button>
                        </div>
                    ))}
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
              <div className="max-w-3xl mx-auto w-full pb-20 mt-10 md:mt-20">
                
                {/* UNIFIED TOP BAR */}
                <div className="h-16 border-b border-white/5 bg-[#0a0a0a]/95 backdrop-blur flex items-center px-4 md:px-8 shrink-0 z-30 justify-between">
                    {/* LEFT: STEP INDICATORS */}
                    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar mask-gradient pr-4">
                        {stepNames.map((name, index) => {
                            const s = index + 1;
                            const isActive = step === s;
                            const isPast = step > s;
                            return (
                                <div key={s} className={`flex items-center gap-2 shrink-0 ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${isActive ? 'bg-[#C69C6D] text-black scale-110 shadow-[0_0_10px_rgba(198,156,109,0.4)]' : isPast ? 'bg-[#222] text-[#C69C6D]' : 'bg-[#151515] text-gray-500'}`}>
                                        {isPast ? <CheckCircle size={12}/> : s}
                                    </div>
                                    {isActive && <span className="text-xs font-bold uppercase text-[#C69C6D] tracking-wider animate-in fade-in slide-in-from-left-2">{name}</span>}
                                    {s < 6 && !isActive && <div className="w-3 h-[2px] bg-white/10 rounded-full"/>}
                                </div>
                            )
                        })}
                    </div>

                    {/* RIGHT: ACTION BUTTONS */}
                    <div className="flex items-center gap-2">
                        <button onClick={handleReset} className="h-9 px-4 rounded-lg bg-[#C69C6D] hover:bg-white text-black font-bold text-xs uppercase transition-colors flex items-center gap-2 shadow-lg shadow-[#C69C6D]/10">
                            <PlusCircle size={14}/> <span className="hidden md:inline">Tạo Mới</span>
                        </button>
                        <div className="w-[1px] h-6 bg-white/10 mx-1"/>
                        <button onClick={()=>setShowSidebar(!showSidebar)} className={`h-9 w-9 rounded-lg flex items-center justify-center transition-colors ${showSidebar ? 'bg-[#222] text-[#C69C6D]' : 'bg-[#151515] text-gray-400 hover:text-white'}`}>
                            {showSidebar ? <Sidebar size={16} className="rotate-180"/> : <Sidebar size={16}/>}
                        </button>
                    </div>
                </div>

                {/* CENTERED SCROLLABLE CONTENT */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
                    <div className="max-w-3xl mx-auto w-full pb-20 ">
                        {step === 1 && (
                            <div className={cardStyle}>
                                <div className="text-center mb-6"><h3 className="text-2xl font-black uppercase tracking-widest text-white">KHỞI TẠO CHỨC NĂNG</h3><p className="text-xs text-gray-500 mt-2">Bắt đầu bằng cách đặt tên định danh cho thư mục và menu</p></div>
                                <div><label className={labelStyle}><FileCode size={14} className="text-[#C69C6D]"/> Mã Chức Năng (Folder Name)</label><input value={meta.folderName} onChange={e => setMeta({...meta, folderName: e.target.value.toLowerCase().replace(/\s/g, '')})} className={inputStyle} placeholder="vd: nhansu_v2"/></div>
                                <div><label className={labelStyle}><Layout size={14} className="text-[#C69C6D]"/> Tên Menu Hiển Thị</label><input value={meta.featureLabel} onChange={e => setMeta({...meta, featureLabel: e.target.value})} className={inputStyle} placeholder="vd: Quản Lý Nhân Sự"/></div>
                                <button onClick={() => { if(meta.folderName) { createFeatureFolder(meta.folderName); setStep(2); } }} className="w-full bg-[#C69C6D] hover:bg-[#e0b88a] text-black font-black text-sm py-4 rounded-lg uppercase mt-6 tracking-widest transition-transform active:scale-[0.99]">TẠO FOLDER & TIẾP TỤC</button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className={cardStyle}>
                                <div className="text-center mb-6"><h3 className="text-2xl font-black uppercase tracking-widest text-white">KẾT NỐI CƠ SỞ DỮ LIỆU</h3></div>
                                <div><label className={labelStyle}><Database size={14} className="text-[#C69C6D]"/> Chọn Bảng Supabase</label><select value={meta.tableName} onChange={e => handleSelectTable(e.target.value)} className={inputStyle}><option value="">-- Chọn bảng dữ liệu --</option>{dbTables.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                                {meta.tableName && (<div className="animate-in slide-in-from-top-2 p-4 bg-[#1a1a1a] rounded-lg border border-white/5 mt-4"><label className={labelStyle}><Shield size={14} className="text-[#C69C6D]"/> Row Level Security (RLS)</label><div className="text-xs text-gray-500 mb-2">Chọn cột xác định chủ sở hữu dữ liệu (nếu có)</div><select value={meta.ownerColumn} onChange={e => setMeta({...meta, ownerColumn: e.target.value})} className={inputStyle}><option value="">-- Dữ liệu công khai (Public) --</option>{meta.columns.map(c => <option key={c.key} value={c.key}>Cột: {c.key}</option>)}</select></div>)}
                                <div className="flex gap-4 pt-6"><button onClick={() => setStep(1)} className="flex-1 bg-[#222] hover:bg-[#333] text-gray-300 font-bold py-3 rounded-lg uppercase text-xs">Quay Lại</button><button onClick={() => setStep(3)} disabled={!meta.tableName} className="flex-[2] bg-[#C69C6D] text-black font-bold py-3 rounded-lg disabled:opacity-50 uppercase text-xs">Tiếp Tục</button></div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className={`${cardStyle} p-0 overflow-hidden`}>
                                <div className="p-8 pb-0 text-center"><h3 className="text-2xl font-black uppercase tracking-widest text-white">PHÂN QUYỀN TRUY CẬP</h3></div>
                                <div className="overflow-x-auto mt-6"><table className="w-full text-xs text-left border-t border-white/5"><thead className="bg-[#151515] text-gray-400 uppercase tracking-wider"><tr><th className="p-4 pl-8">Role</th><th className="p-4">Phạm vi</th><th className="p-4 text-center">Read</th><th className="p-4 text-center">Create</th><th className="p-4 text-center">Update</th><th className="p-4 text-center pr-8">Delete</th></tr></thead><tbody className="divide-y divide-white/5 bg-[#0a0a0a]">{meta.roles.map((r,i) => (<tr key={r.roleName} className="hover:bg-[#111] transition-colors"><td className="p-4 pl-8 font-bold text-[#C69C6D] uppercase">{r.roleName}</td><td className="p-4"><select className="bg-black border border-white/20 rounded px-2 py-1 outline-none focus:border-[#C69C6D]" value={r.canViewAll?'all':'own'} onChange={e=>{const nr=[...meta.roles];nr[i].canViewAll=e.target.value==='all';setMeta({...meta,roles:nr})}} disabled={!meta.ownerColumn && r.roleName!=='admin'}><option value="all">Tất cả</option><option value="own">Chính chủ</option></select></td>{['read','create','update','delete'].map(p => (<td key={p} className="p-4 text-center"><input type="checkbox" checked={r.permissions.includes(p as any)} onChange={e=>{const nr=[...meta.roles];const s=new Set(nr[i].permissions); e.target.checked?s.add(p as any):s.delete(p as any); nr[i].permissions=Array.from(s); setMeta({...meta,roles:nr})}} className="accent-[#C69C6D] w-4 h-4 cursor-pointer"/></td>))}</tr>))}</tbody></table></div>
                                <div className="p-8 flex gap-4 bg-[#111]"><button onClick={()=>setStep(2)} className="flex-1 bg-[#222] hover:bg-[#333] text-gray-300 font-bold py-3 rounded-lg uppercase text-xs">Quay Lại</button><button onClick={()=>setStep(4)} className="flex-[2] bg-[#C69C6D] text-black font-bold py-3 rounded-lg uppercase text-xs">Tiếp Tục</button></div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className={cardStyle}>
                                <div className="text-center"><h3 className="text-2xl font-black uppercase tracking-widest text-white">CẤU HÌNH GIAO DIỆN</h3></div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#0a0a0a] p-4 rounded-xl border border-white/5">
                                    <div><label className={labelStyle}><Type size={14}/> Tiêu đề lớn</label><select value={meta.displaySettings.colTitle} onChange={e => setMeta(p => ({...p, displaySettings: {...p.displaySettings, colTitle: e.target.value}}))} className={inputStyle}>{meta.columns.filter(c=>c.showInList).map(c => <option key={c.key} value={c.key}>{c.label}</option>)}</select></div>
                                    <div><label className={labelStyle}><AlignLeft size={14}/> Tiêu đề phụ</label><select value={meta.displaySettings.colSubTitle} onChange={e => setMeta(p => ({...p, displaySettings: {...p.displaySettings, colSubTitle: e.target.value}}))} className={inputStyle}><option value="">(Trống)</option>{meta.columns.filter(c=>c.showInList).map(c => <option key={c.key} value={c.key}>{c.label}</option>)}</select></div>
                                    <div><label className={labelStyle}><ImageIcon size={14}/> Hình ảnh đại diện</label><select value={meta.displaySettings.colImage} onChange={e => setMeta(p => ({...p, displaySettings: {...p.displaySettings, colImage: e.target.value}}))} className={inputStyle}><option value="">(Trống)</option>{meta.columns.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}</select></div>
                                </div>

                                <div className="mt-8 border-t border-white/5 pt-6">
                                    <label className={labelStyle}><Link size={14} className="text-[#C69C6D]"/> Master-Detail: Tabs Module Liên Kết</label>
                                    <div className="space-y-3 bg-[#0a0a0a] p-4 rounded-xl border border-white/5">
                                        <div className="flex gap-2">
                                            <select id="moduleSelect" className={inputStyle}>
                                                <option value="">-- Chọn module để liên kết --</option>
                                                {existingFeatures.filter(f => f !== meta.folderName).map(f => <option key={f} value={f}>{f}</option>)}
                                            </select>
                                            <button onClick={() => {
                                                const sel = document.getElementById('moduleSelect') as HTMLSelectElement;
                                                if(sel.value) { addLinkedModule(sel.value); sel.value=''; }
                                            }} className="bg-[#222] px-6 rounded-lg font-bold uppercase hover:bg-[#C69C6D] hover:text-black transition-colors text-xs whitespace-nowrap">Thêm Tab</button>
                                        </div>
                                        
                                        {linkedModules.map((lm, idx) => (
                                            <div key={idx} className="bg-[#151515] p-3 rounded-lg border border-white/5 animate-in slide-in-from-right-5 flex flex-col md:flex-row md:items-center gap-3">
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-xs font-bold text-[#C69C6D] uppercase flex items-center gap-2"><Folder size={10}/> {lm.label} <span className="text-gray-600">({lm.moduleName})</span></span>
                                                        <button onClick={()=>{setLinkedModules(prev => prev.filter((_,i)=>i!==idx))}} className="text-gray-500 hover:text-red-500 md:hidden"><Trash2 size={14}/></button>
                                                    </div>
                                                    <div className="text-[10px] text-gray-500">Table nguồn: <strong className="text-gray-400">{lm.tableName}</strong></div>
                                                </div>
                                                <div className="flex-1 border-l border-white/5 pl-0 md:pl-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] text-gray-500 whitespace-nowrap">Khóa ngoại:</span>
                                                        <select value={lm.foreignKey} onChange={e => {
                                                            const newArr = [...linkedModules];
                                                            newArr[idx].foreignKey = e.target.value;
                                                            setLinkedModules(newArr);
                                                        }} className="bg-black border border-white/20 text-xs rounded px-2 py-1 w-full outline-none focus:border-[#C69C6D]">
                                                            <option value="">-- Chọn cột (trong {lm.moduleName}) --</option>
                                                            {(remoteColumns[lm.moduleName] || []).map(col => <option key={col} value={col}>{col}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                                <button onClick={()=>{setLinkedModules(prev => prev.filter((_,i)=>i!==idx))}} className="text-gray-500 hover:text-red-500 hidden md:block"><Trash2 size={14}/></button>
                                            </div>
                                        ))}
                                        {linkedModules.length === 0 && <div className="text-center text-[10px] text-gray-600 italic py-2">Chưa có module nào được liên kết</div>}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/5 mt-6">
                                    <button onClick={async()=>{ setIsProcessing(true); setDetectedTabs(await scanForTabs(meta.folderName)); setIsProcessing(false); }} className="w-full bg-[#151515] border border-white/10 hover:border-[#C69C6D] hover:text-[#C69C6D] text-xs font-bold text-gray-400 py-3 rounded-lg flex items-center justify-center gap-2 transition-all dashed-border">
                                        <RefreshCw size={14} className={isProcessing?'animate-spin':''}/> QUÉT TABS TÙY CHỈNH NỘI BỘ (File Tab*.tsx)
                                    </button>
                                    {detectedTabs.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-4 justify-center">
                                            {detectedTabs.map((t,i) => (
                                                <label key={i} className={`flex items-center gap-2 px-4 py-2 rounded-full border cursor-pointer text-[10px] font-bold uppercase transition-all ${t.selected ? 'bg-[#C69C6D] text-black border-[#C69C6D]' : 'bg-[#050505] border-white/10 text-gray-500 hover:border-gray-500'}`}>
                                                    <input type="checkbox" checked={t.selected} onChange={e=>{const nt=[...detectedTabs];nt[i].selected=e.target.checked;setDetectedTabs(nt)}} className="hidden"/>
                                                    {t.selected ? <CheckCircle size={12}/> : <div className="w-3 h-3 rounded-full border border-gray-600"/>} {t.label}
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-4 mt-8"><button onClick={()=>setStep(3)} className="flex-1 bg-[#222] hover:bg-[#333] text-gray-300 font-bold py-3 rounded-lg uppercase text-xs">Quay Lại</button><button onClick={()=>setStep(5)} className="flex-[2] bg-[#C69C6D] text-black font-bold py-3 rounded-lg uppercase text-xs">Cấu Hình Cột</button></div>
                            </div>
                        )}

                        {step === 5 && (
                            <div className={cardStyle}>
                                <div className="text-center mb-4"><h3 className="text-2xl font-black uppercase tracking-widest text-white">CHI TIẾT TRƯỜNG DỮ LIỆU</h3></div>
                                <div className="space-y-3 relative z-10 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                    {meta.columns.map((col, idx) => {
                                        if (col.key === 'id') return null;
                                        const isMain = [meta.displaySettings.colTitle, meta.displaySettings.colSubTitle, meta.displaySettings.colImage].includes(col.key);
                                        return (
                                            <div key={col.key} className={`border p-4 rounded-lg transition-all ${isMain ? 'bg-[#1a1a1a] border-[#C69C6D]/50 shadow-[0_0_15px_rgba(198,156,109,0.1)]' : 'bg-[#0a0a0a] border-white/5'}`}>
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className={`text-xs font-bold flex items-center gap-2 uppercase ${isMain ? 'text-[#C69C6D]' : 'text-gray-400'}`}><Database size={12}/> {col.key}</span>
                                                    <select value={col.inputType} onChange={e=>updateCol(idx,'inputType',e.target.value)} className="bg-[#111] border border-white/10 rounded px-2 py-1 text-[10px] text-gray-300 uppercase outline-none cursor-pointer focus:border-[#C69C6D]">{['text','number','date','select','image','textarea','checkbox'].map(t=><option key={t} value={t}>{t}</option>)}</select>
                                                </div>
                                                <input value={col.label} onChange={e=>updateCol(idx,'label',e.target.value)} className="w-full bg-[#151515] border border-white/10 p-2.5 rounded text-xs text-white mb-3 outline-none focus:border-[#C69C6D] transition-colors" placeholder={`Nhập tên hiển thị cho ${col.key}...`}/>
                                                <div className="flex gap-2">
                                                    <button onClick={()=>updateCol(idx,'showInList',!col.showInList)} className={`flex-1 py-2 rounded text-[10px] font-bold uppercase border flex items-center justify-center gap-1.5 transition-all ${col.showInList ? 'bg-[#C69C6D]/20 text-[#C69C6D] border-[#C69C6D]/50' : 'bg-[#151515] text-gray-600 border-transparent hover:bg-[#222]'}`}>{col.showInList ? <Eye size={12}/> : <EyeOff size={12}/>} List</button>
                                                    <button onClick={()=>updateCol(idx,'showInForm',!col.showInForm)} className={`flex-1 py-2 rounded text-[10px] font-bold uppercase border flex items-center justify-center gap-1.5 transition-all ${col.showInForm ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'bg-[#151515] text-gray-600 border-transparent hover:bg-[#222]'}`}>{col.showInForm ? <Edit3 size={12}/> : <Lock size={12}/>} Form</button>
                                                    <button onClick={()=>updateCol(idx,'required',!col.required)} className={`w-16 py-2 rounded text-[10px] font-bold uppercase border flex items-center justify-center gap-1.5 transition-all ${col.required ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-[#151515] text-gray-600 border-transparent hover:bg-[#222]'}`}>Req</button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                                <div className="flex gap-4 pt-6 border-t border-white/5"><button onClick={()=>setStep(4)} className="flex-1 bg-[#222] hover:bg-[#333] text-gray-300 font-bold py-3 rounded-lg uppercase text-xs">Quay Lại</button><button onClick={()=>setStep(6)} className="flex-[2] bg-[#C69C6D] text-black font-bold py-3 rounded-lg uppercase text-xs">Sẵn Sàng Deploy</button></div>
                            </div>
                        )}
                        
                        {step === 6 && (
                            <div className={cardStyle + " text-center"}>
                                <div className="p-6 bg-[#111] border border-white/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(198,156,109,0.2)] mb-8"><CheckCircle size={40} className="text-[#C69C6D]"/></div>
                                <h2 className="text-3xl font-black uppercase tracking-widest mb-2 text-white">XÁC NHẬN</h2>
                                <p className="text-gray-500 text-sm mb-8">Kiểm tra mã SQL RLS trước khi triển khai</p>
                                
                                <div className="bg-[#050505] border border-white/10 rounded-lg text-left overflow-hidden shadow-2xl relative group">
                                    <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={()=>navigator.clipboard.writeText(generateSqlPrompt())} className="bg-[#222] hover:bg-[#C69C6D] hover:text-black text-white p-2 rounded"><Copy size={14}/></button>
                                    </div>
                                    <div className="p-3 bg-[#0a0a0a] border-b border-white/5 flex items-center gap-2"><Terminal size={12} className="text-gray-500"/><span className="text-[10px] font-bold text-gray-500 uppercase">Database Script</span></div>
                                    <div className="p-4 text-xs font-mono text-green-500 overflow-auto max-h-40 whitespace-pre-wrap">{generateSqlPrompt()}</div>
                                </div>
                                <div className="flex justify-center gap-4 pt-8">
                                    <button onClick={()=>setStep(5)} className="bg-[#222] hover:bg-[#333] text-gray-400 font-bold uppercase px-6 py-4 rounded-lg border border-white/5 text-xs tracking-wider">Xem lại</button>
                                    <button onClick={handleFinish} disabled={isProcessing} className="bg-green-600 hover:bg-green-500 text-white font-black text-sm uppercase px-10 py-4 rounded-lg shadow-lg flex items-center gap-3 tracking-widest transition-transform hover:scale-105">
                                        {isProcessing ? <RefreshCw className="animate-spin" size={18}/> : <Play fill="currentColor" size={18}/>} TRIỂN KHAI NGAY
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* LOGS FOOTER */}
                <div className="h-16 bg-[#0a0a0a] border-t border-white/5 p-4 font-mono text-[10px] md:text-xs overflow-y-auto shrink-0 flex flex-col justify-end">
                    {logs.slice(-3).map((l,i)=><div key={i} className="text-gray-500 truncate">{l}</div>)}
                    <div ref={logsEndRef}/>
                </div>
            </div>
        </div>
    )
}