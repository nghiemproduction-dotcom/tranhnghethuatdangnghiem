'use client';

import React, { useState, useEffect } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { 
    Code, Save, X, FileCode, RefreshCw, FolderOpen, Link2, 
    Loader2, ChevronRight, ChevronDown, Folder, 
    FilePlus, FolderPlus, Edit3, Trash2, ExternalLink, Copy, AlertTriangle, ArrowLeft
} from 'lucide-react';

// --- TYPES & HELPER ---
interface FileNode { id: string; name: string; type: 'file' | 'folder'; children?: FileNode[]; }
interface Props { roomName?: string; }

const buildFileTree = (paths: string[]): FileNode[] => {
    const root: FileNode[] = [];
    paths.forEach(path => {
        const parts = path.split('/');
        let currentLevel = root;
        parts.forEach((part, index) => {
            const isFile = index === parts.length - 1;
            const existingNode = currentLevel.find(n => n.name === part);
            if (existingNode) { if (!isFile) currentLevel = existingNode.children || []; } 
            else {
                const newNode: FileNode = { id: parts.slice(0, index + 1).join('/'), name: part, type: isFile ? 'file' : 'folder', children: isFile ? undefined : [] };
                currentLevel.push(newNode);
                if (!isFile) currentLevel = newNode.children || [];
            }
        });
    });
    const sortNodes = (nodes: FileNode[]) => {
        nodes.sort((a, b) => {
            if (a.type === b.type) return a.name.localeCompare(b.name);
            return a.type === 'folder' ? -1 : 1;
        });
        nodes.forEach(n => { if (n.children) sortNodes(n.children); });
    };
    sortNodes(root);
    return root;
};

// --- COMPONENT NODE ---
const FileTreeNode = ({ node, level, selectedFile, onSelect, onContextMenu }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    useEffect(() => { if (level < 2) setIsOpen(true); }, []);
    const paddingLeft = level * 12 + 12;

    const handleRightClick = (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        onContextMenu(e, node);
    };

    if (node.type === 'folder') {
        return (
            <div>
                <div 
                    onClick={() => setIsOpen(!isOpen)}
                    onContextMenu={handleRightClick}
                    className="flex items-center py-2 md:py-1 cursor-pointer hover:bg-[#2a2d2e] text-gray-400 hover:text-white transition-colors select-none text-xs md:text-[11px] group border-b border-white/5 md:border-none"
                    style={{ paddingLeft }}
                >
                    {isOpen ? <ChevronDown size={14} className="mr-1"/> : <ChevronRight size={14} className="mr-1"/>}
                    <Folder size={14} className={`mr-1.5 ${isOpen ? 'text-gray-200' : 'text-gray-500'}`} fill="currentColor" fillOpacity={0.2}/>
                    <span className="font-bold truncate">{node.name}</span>
                </div>
                {isOpen && node.children?.map((child: any) => <FileTreeNode key={child.id} node={child} level={level + 1} selectedFile={selectedFile} onSelect={onSelect} onContextMenu={onContextMenu}/>)}
            </div>
        );
    }
    const isSelected = selectedFile === node.id;
    return (
        <div 
            onClick={() => onSelect(node.id)}
            onContextMenu={handleRightClick}
            className={`flex items-center py-2 md:py-1 cursor-pointer select-none text-xs md:text-[11px] border-l-2 mb-[1px] ${isSelected ? 'bg-[#37373d] text-white border-blue-500' : 'text-gray-400 hover:bg-[#2a2d2e] hover:text-white border-transparent'}`} 
            style={{ paddingLeft }} 
            title={node.id}
        >
            <FileCode size={14} className={`mr-1.5 ${node.name.endsWith('tsx') ? 'text-blue-400' : 'text-yellow-400'}`} />
            <span className="truncate">{node.name}</span>
        </div>
    );
};

// --- COMPONENT CHÍNH ---
export default function TrinhSuaCodeNhanh({ roomName = 'phongdemo' }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [privateTree, setPrivateTree] = useState<FileNode[]>([]);
    const [sharedTree, setSharedTree] = useState<FileNode[]>([]);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [code, setCode] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingList, setIsLoadingList] = useState(false);
    const [errors, setErrors] = useState<any[]>([]); 
    const [contextMenu, setContextMenu] = useState<{ visible: boolean, x: number, y: number, node: FileNode | null }>({ visible: false, x: 0, y: 0, node: null });

    // Responsive Mobile State
    const [showFileListMobile, setShowFileListMobile] = useState(true);

    // 🟢 HÀM CẤU HÌNH MONACO: Fix lỗi đỏ lòm do thiếu thư viện
    const handleEditorWillMount = (monaco: any) => {
        // Cấu hình compiler để hiểu JSX/React
        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            jsx: monaco.languages.typescript.JsxEmit.React,
            jsxFactory: 'React.createElement',
            reactNamespace: 'React',
            allowNonTsExtensions: true,
            allowJs: true,
            target: monaco.languages.typescript.ScriptTarget.Latest,
            
        });
        monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: false, 
});

        // QUAN TRỌNG: Tắt Semantic Validation (Lỗi import, lỗi type)
        // Chỉ giữ Syntax Validation (Lỗi cú pháp)
        monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: true, 
            noSyntaxValidation: false, 
        });
    };

    const fetchRelatedFiles = async () => {
        setIsLoadingList(true);
        try {
            const res = await fetch('/api/fs/list');
            const data = await res.json();
            if (data.files) {
                const allFiles: string[] = data.files;
                const pFiles = allFiles.filter(f => f.includes(`/${roomName}/`));
                const sFiles = allFiles.filter(f => {
                    if (f.includes(`/${roomName}/`)) return false;
                    return (
                        f.startsWith('app/GiaoDienTong') || 
                        f.startsWith('app/components') || 
                        f.startsWith('app/ThuVien') ||
                        (f.startsWith('app/') && f.split('/').length === 2)
                    );
                });
                setPrivateTree(buildFileTree(pFiles));
                setSharedTree(buildFileTree(sFiles));
            }
        } catch (e) { console.error("Lỗi lấy file:", e); } finally { setIsLoadingList(false); }
    };

    useEffect(() => { if (isOpen) fetchRelatedFiles(); }, [isOpen]);

    useEffect(() => {
        const handleClick = () => setContextMenu({ ...contextMenu, visible: false });
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [contextMenu]);

    const handleSelectFile = async (filePath: string) => {
        setSelectedFile(filePath);
        setErrors([]);
        setShowFileListMobile(false); 
        try {
            const res = await fetch('/api/fs/content', { method: 'POST', body: JSON.stringify({ filePath }) });
            const data = await res.json();
            setCode(data.content || '// Trống');
        } catch (e) { setCode('// Lỗi đọc file'); }
    };

    const handleEditorValidation = (markers: any[]) => {
        // Lọc lỗi (Severity = 8 là Error)
        const errorMarkers = markers.filter(marker => marker.severity === 8);
        setErrors(errorMarkers);
    };

    const handleDualSave = async () => {
        if (!selectedFile) return;
        
        // Chặn lưu nếu có lỗi CÚ PHÁP (còn lỗi thiếu thư viện đã bị tắt ở trên rồi)
        if (errors.length > 0) {
            alert(`⛔ KHÔNG THỂ UPLOAD!\n\nFile đang có ${errors.length} lỗi CÚ PHÁP.\n(Ví dụ: Thiếu dấu ngoặc, sai từ khóa...)\nVui lòng sửa hết lỗi đỏ.`);
            return;
        }

        setIsSaving(true);
        try {
            const saveDisk = await fetch('/api/fs/content', { method: 'POST', body: JSON.stringify({ filePath: selectedFile, content: code }) });
            const diskResult = await saveDisk.json();
            if (!diskResult.success) throw new Error("Lỗi ghi ổ cứng!");

            const cloudFilePath = `[${roomName}] ${selectedFile}`;
            const now = new Date();
            const versionString = `${String(now.getDate()).padStart(2, '0')}_${String(now.getMonth() + 1).padStart(2, '0')}_${now.getFullYear()}_${String(now.getHours()).padStart(2, '0')}_${String(now.getMinutes()).padStart(2, '0')}`;

            const { error } = await supabase.from('vn_code_store').insert({
                file_path: cloudFilePath, content: code, version: versionString, ghi_chu: `Sửa bởi ${roomName}`
            });
            if (error) throw error;
            alert(`✅ Đã lưu thành công!\nPhiên bản: ${versionString}`);
        } catch (err: any) { alert("❌ Lỗi: " + (err.message || JSON.stringify(err))); } finally { setIsSaving(false); }
    };

    const handleContextMenu = (e: React.MouseEvent, node: FileNode) => {
        const menuHeight = 220; 
        const windowHeight = window.innerHeight;
        let y = e.clientY;
        if (y + menuHeight > windowHeight) { y = y - menuHeight; }
        setContextMenu({ visible: true, x: e.clientX, y: y, node: node });
    };

    const handleCopyContent = async () => {
        if (!contextMenu.node) return;
        const filePath = contextMenu.node.id;
        try {
            const res = await fetch('/api/fs/content', { method: 'POST', body: JSON.stringify({ filePath }) });
            const data = await res.json();
            if (data.content) {
                await navigator.clipboard.writeText(data.content);
                alert(`📋 Đã copy nội dung file: ${contextMenu.node.name}`);
            } else { alert("❌ Không đọc được nội dung file"); }
        } catch (error) { console.error(error); alert("❌ Lỗi khi copy"); }
    };

    const runFileAction = async (action: 'create' | 'rename' | 'delete' | 'open', extraData?: any) => {
        if (!contextMenu.node) return;
        const targetPath = contextMenu.node.id;
        if (action === 'open') { await fetch('/api/fs/open', { method: 'POST', body: JSON.stringify({ filePath: targetPath }) }); return; }
        let payload: any = { action, path: targetPath };
        if (action === 'create') {
            const type = extraData;
            const name = prompt(`Nhập tên ${type === 'file' ? 'File' : 'Folder'} mới:`);
            if (!name) return;
            const basePath = contextMenu.node.type === 'file' ? targetPath.split('/').slice(0, -1).join('/') : targetPath;
            payload.path = `${basePath}/${name}`; payload.type = type; payload.action = 'create';
        }
        if (action === 'rename') {
            const newName = prompt("Nhập tên mới:", contextMenu.node.name);
            if (!newName || newName === contextMenu.node.name) return;
            payload.newName = newName;
        }
        if (action === 'delete') { if (!confirm(`Bạn có chắc muốn xóa: ${contextMenu.node.name}?`)) return; }
        const res = await fetch('/api/fs/manage', { method: 'POST', body: JSON.stringify(payload) });
        const resData = await res.json();
        if (resData.success) { fetchRelatedFiles(); } else { alert("Lỗi: " + resData.error); }
    };

    return (
        <>
            <button onClick={() => setIsOpen(true)} className="fixed bottom-20 left-4 z-[99999] flex items-center gap-2 bg-[#007acc] text-white px-4 py-3 rounded-full shadow-[0_0_20px_rgba(0,122,204,0.5)] border-2 border-white/20 hover:scale-110 active:scale-95 font-bold animate-in slide-in-from-left-10">
                <div className="relative"><Code size={20} /><div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div></div>
                <span className="text-xs uppercase tracking-wide hidden md:inline">Code: {roomName}</span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-sm flex items-center justify-center md:p-4">
                    <div className="w-full h-full md:max-w-[95vw] md:h-[90vh] bg-[#1e1e1e] border border-white/10 md:rounded-xl shadow-2xl flex overflow-hidden animate-in zoom-in-95 duration-200 flex-col md:flex-row">
                        
                        {/* CỘT TRÁI (LIST) */}
                        <div className={`${showFileListMobile ? 'flex' : 'hidden'} md:flex w-full md:w-80 bg-[#252526] flex-col border-r border-white/10 h-full`}>
                            <div className="h-12 flex items-center justify-between px-4 border-b border-white/10 bg-[#333]">
                                <span className="font-bold text-white text-xs uppercase tracking-wider">Explorer</span>
                                <div className="flex gap-3">
                                    <button onClick={fetchRelatedFiles}><RefreshCw size={16} className={`text-gray-400 hover:text-white ${isLoadingList ? 'animate-spin':''}`}/></button>
                                    <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-400"><X size={20}/></button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar relative pb-20">
                                <div className="px-3 py-2 bg-[#2d2d2d] text-[10px] font-bold text-blue-400 uppercase flex items-center gap-1 sticky top-0 z-10 border-b border-black/20"><FolderOpen size={12}/> Hồ sơ {roomName}</div>
                                <div className="py-1">
                                    {privateTree.map(node => <FileTreeNode key={node.id} node={node} level={0} selectedFile={selectedFile} onSelect={handleSelectFile} onContextMenu={handleContextMenu} />)}
                                </div>
                                <div className="px-3 py-2 bg-[#2d2d2d] text-[10px] font-bold text-orange-400 uppercase flex items-center gap-1 sticky top-0 z-10 border-y border-black/20 mt-2"><Link2 size={12}/> Module Liên Kết</div>
                                <div className="py-1 pb-10">
                                    {sharedTree.map(node => <FileTreeNode key={node.id} node={node} level={0} selectedFile={selectedFile} onSelect={handleSelectFile} onContextMenu={handleContextMenu} />)}
                                </div>
                            </div>
                        </div>

                        {/* CỘT PHẢI (EDITOR) */}
                        <div className={`${!showFileListMobile ? 'flex' : 'hidden'} md:flex flex-1 flex-col h-full bg-[#1e1e1e]`}>
                            <div className="h-14 md:h-12 flex items-center justify-between px-2 md:px-4 border-b border-white/10 bg-[#1e1e1e]">
                                <div className="flex items-center gap-2 text-xs font-mono text-gray-400 overflow-hidden">
                                    <button onClick={() => setShowFileListMobile(true)} className="md:hidden p-2 mr-1 bg-white/10 rounded-full text-white"><ArrowLeft size={16}/></button>
                                    <FileCode size={14} className="text-blue-500 shrink-0"/>
                                    <span className="truncate max-w-[120px] md:max-w-none">{selectedFile || 'Chọn file...'}</span>
                                    {selectedFile && (
                                        <div className="flex items-center gap-1 ml-1">
                                            <button onClick={() => fetch('/api/fs/open', { method: 'POST', body: JSON.stringify({ filePath: selectedFile }) })} className="hidden md:block p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white"><ExternalLink size={14}/></button>
                                            <button onClick={() => { setContextMenu({visible: false, x:0, y:0, node: {id: selectedFile, name: '', type: 'file'}}); handleCopyContent(); }} className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white"><Copy size={14}/></button>
                                            {errors.length > 0 && (
                                                <div className="flex items-center gap-1 text-red-500 text-[10px] font-bold px-2 py-0.5 bg-red-500/10 rounded border border-red-500/30 animate-pulse">
                                                    <AlertTriangle size={12} /> <span className="hidden md:inline">{errors.length} Lỗi</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={handleDualSave} disabled={!selectedFile || isSaving} className={`flex items-center gap-1 md:gap-2 px-3 py-1.5 rounded text-xs font-bold text-white transition-all ${isSaving ? 'bg-yellow-600' : (errors.length > 0 ? 'bg-red-600/80 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500')} disabled:opacity-50`}>
                                        {isSaving ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>} 
                                        <span className="hidden md:inline">{isSaving ? 'Đang Xử Lý...' : 'LƯU & ĐỒNG BỘ'}</span>
                                        <span className="md:hidden">LƯU</span>
                                    </button>
                                    <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded text-gray-400 hover:text-white"><X size={20}/></button>
                                </div>
                            </div>
                            <div className="flex-1 relative">
                                {selectedFile ? (
                                    <Editor 
                                        height="100%" 
                                        theme="vs-dark" 
                                        path={selectedFile} 
                                        value={code} 
                                        onChange={(val) => setCode(val || '')} 
                                        // 🟢 KÍCH HOẠT CẤU HÌNH FIX LỖI
                                        beforeMount={handleEditorWillMount}
                                        onValidate={handleEditorValidation}
                                        options={{ fontSize: 13, fontFamily: "'Fira Code', monospace", minimap: { enabled: false }, automaticLayout: true, wordWrap: 'on' }} 
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 select-none text-center px-4">
                                        <Code size={48} className="opacity-10 mb-4"/>
                                        <p className="text-sm">Chọn file từ danh sách để sửa</p>
                                        <button onClick={() => setShowFileListMobile(true)} className="mt-4 md:hidden px-4 py-2 bg-blue-600 text-white rounded-full text-xs font-bold">Mở danh sách file</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* CONTEXT MENU */}
                    {contextMenu.visible && (
                        <div className="fixed z-[100000] bg-[#252526] border border-white/10 rounded shadow-2xl py-1 text-white text-xs w-48 animate-in fade-in zoom-in-95 duration-75" style={{ top: contextMenu.y, left: contextMenu.x }} onClick={(e) => e.stopPropagation()}>
                            <div className="px-3 py-1.5 text-gray-500 font-bold border-b border-white/10 mb-1 truncate">{contextMenu.node?.name}</div>
                            {contextMenu.node?.type === 'file' && (
                                <>
                                    <button onClick={handleCopyContent} className="w-full text-left px-3 py-2 hover:bg-[#007acc] flex items-center gap-2 font-medium text-blue-200"><Copy size={14} className="text-blue-400"/> Copy nội dung</button>
                                    <div className="h-[1px] bg-white/10 my-1"></div>
                                </>
                            )}
                            <button onClick={() => runFileAction('open')} className="w-full text-left px-3 py-2 hover:bg-[#007acc] flex items-center gap-2"><ExternalLink size={14} className="text-gray-400"/> Mở trên máy tính</button>
                            <div className="h-[1px] bg-white/10 my-1"></div>
                            <button onClick={() => runFileAction('create', 'file')} className="w-full text-left px-3 py-2 hover:bg-[#007acc] flex items-center gap-2"><FilePlus size={14} className="text-green-400"/> Tạo File Mới</button>
                            <button onClick={() => runFileAction('create', 'folder')} className="w-full text-left px-3 py-2 hover:bg-[#007acc] flex items-center gap-2"><FolderPlus size={14} className="text-yellow-400"/> Tạo Thư Mục</button>
                            <div className="h-[1px] bg-white/10 my-1"></div>
                            <button onClick={() => runFileAction('rename')} className="w-full text-left px-3 py-2 hover:bg-[#007acc] flex items-center gap-2"><Edit3 size={14} className="text-orange-400"/> Đổi tên</button>
                            <button onClick={() => runFileAction('delete')} className="w-full text-left px-3 py-2 hover:bg-red-900/50 hover:text-red-200 text-red-400 flex items-center gap-2"><Trash2 size={14}/> Xóa</button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}