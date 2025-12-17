'use client';

import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { 
    Save, FileCode, ChevronRight, ChevronDown, 
    Search,   Settings,  Folder, 
    X,  RefreshCw
} from 'lucide-react';

// --- TYPES & HELPER (Giữ nguyên logic Tree View xịn xò cũ) ---
interface FileNode {
    id: string;
    name: string;
    path: string;
    type: 'file' | 'folder';
    children?: FileNode[];
    isOpen?: boolean;
}

const buildFileTree = (paths: string[]): FileNode[] => {
    const root: FileNode[] = [];
    paths.forEach(path => {
        const parts = path.split('/');
        let currentLevel = root;
        parts.forEach((part, index) => {
            const isFile = index === parts.length - 1;
            const existingPath = currentLevel.find(n => n.name === part);
            if (existingPath) {
                if (!isFile) currentLevel = existingPath.children || [];
            } else {
                const newNode: FileNode = {
                    id: path,
                    name: part,
                    path: parts.slice(0, index + 1).join('/'),
                    type: isFile ? 'file' : 'folder',
                    children: isFile ? undefined : [],
                    isOpen: false 
                };
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

// --- TREE COMPONENT ---
const TreeItem = ({ node, level, selectedFile, onSelect, onToggleFolder }: any) => {
    const isSelected = selectedFile === node.path;
    const paddingLeft = level * 12 + 10;

    if (node.type === 'folder') {
        return (
            <div>
                <div onClick={() => onToggleFolder(node)} className="flex items-center py-1 cursor-pointer hover:bg-[#2a2d2e] text-gray-400 hover:text-white transition-colors select-none" style={{ paddingLeft }}>
                    {node.isOpen ? <ChevronDown size={14} className="mr-1"/> : <ChevronRight size={14} className="mr-1"/>}
                    <Folder size={14} className={`mr-1.5 ${node.isOpen ? 'text-gray-200' : 'text-gray-500'}`} fill="currentColor" fillOpacity={0.2}/>
                    <span className="text-xs font-bold truncate">{node.name}</span>
                </div>
                {node.isOpen && node.children?.map((child: any) => (
                    <TreeItem key={child.path} node={child} level={level + 1} selectedFile={selectedFile} onSelect={onSelect} onToggleFolder={onToggleFolder} />
                ))}
            </div>
        );
    }
    return (
        <div onClick={() => onSelect(node.path)} className={`flex items-center py-1 cursor-pointer select-none border-l-2 ${isSelected ? 'bg-[#37373d] text-white border-blue-500' : 'text-gray-400 hover:bg-[#2a2d2e] hover:text-white border-transparent'}`} style={{ paddingLeft }}>
            <FileCode size={14} className={`mr-2 ${node.name.endsWith('tsx') ? 'text-blue-400' : node.name.endsWith('css') ? 'text-blue-300' : 'text-yellow-400'}`} />
            <span className="text-xs truncate">{node.name}</span>
        </div>
    );
};

export default function PhongCode() {
    const [fileTree, setFileTree] = useState<FileNode[]>([]);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [code, setCode] = useState<string>('// Chọn file để bắt đầu code thực...');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // 1. QUÉT FILE TỪ HỆ THỐNG THẬT (API)
    useEffect(() => {
        fetchSystemFiles();
    }, []);

    const fetchSystemFiles = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/fs/list');
            const data = await res.json();
            if (data.files) {
                setFileTree(buildFileTree(data.files));
            }
        } catch (error) {
            console.error("Lỗi đọc file:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleFolder = (nodeToToggle: FileNode) => {
        const updateTree = (nodes: FileNode[]): FileNode[] => {
            return nodes.map(node => {
                if (node.path === nodeToToggle.path) return { ...node, isOpen: !node.isOpen };
                if (node.children) return { ...node, children: updateTree(node.children) };
                return node;
            });
        };
        setFileTree(prev => updateTree(prev));
    };

    // 2. ĐỌC NỘI DUNG FILE THẬT
    const handleSelectFile = async (filePath: string) => {
        setSelectedFile(filePath);
        try {
            const res = await fetch('/api/fs/content', {
                method: 'POST',
                body: JSON.stringify({ filePath }) // Chỉ gửi path để đọc
            });
            const data = await res.json();
            if (data.content !== undefined) {
                setCode(data.content);
            }
        } catch (error) {
            alert("Không thể đọc file này!");
        }
    };

    // 3. GHI FILE THẬT VÀO Ổ CỨNG
    const handleSave = async () => {
        if (!selectedFile) return;
        setIsSaving(true);
        try {
            const res = await fetch('/api/fs/content', {
                method: 'POST',
                body: JSON.stringify({ filePath: selectedFile, content: code }) // Gửi cả content để ghi
            });
            const data = await res.json();
            if (data.success) {
                // Hiệu ứng Visual: Nháy nhẹ editor để báo đã lưu
                alert(`Đã lưu file: ${selectedFile} vào ổ cứng!`);
            }
        } catch (error) {
            alert("Lỗi khi lưu file!");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="w-full h-screen flex bg-[#1e1e1e] text-[#cccccc] font-sans overflow-hidden">
            {/* Activity Bar */}
            <div className="w-12 bg-[#333333] flex flex-col items-center py-2 shrink-0 z-20">
                <div className="p-3 border-l-2 border-white text-white mb-2 cursor-pointer"><FileCode size={24}/></div>
                <div className="p-3 text-gray-500 hover:text-white mb-2 cursor-pointer"><Search size={24}/></div>
                <div className="mt-auto p-3 text-gray-500 hover:text-white cursor-pointer"><Settings size={24}/></div>
            </div>

            {/* Sidebar Explorer */}
            <div className="w-72 bg-[#252526] flex flex-col border-r border-black/20 shrink-0">
                <div className="h-9 px-4 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    <span>Explorer (Localhost)</span>
                    <button onClick={fetchSystemFiles} title="Refresh File List"><RefreshCw size={14} className={isLoading ? 'animate-spin' : ''}/></button>
                </div>
                <div className="px-2 py-1 flex items-center bg-[#383b3d]/50 cursor-pointer font-bold text-xs text-white">
                    <ChevronDown size={14} /> <span className="uppercase ml-1">MY PROJECT</span>
                </div>
                <div className="flex-1 overflow-y-auto mt-1 custom-scrollbar">
                    {fileTree.map(node => (
                        <TreeItem key={node.path} node={node} level={0} selectedFile={selectedFile} onSelect={handleSelectFile} onToggleFolder={toggleFolder} />
                    ))}
                </div>
            </div>

            {/* Editor */}
            <div className="flex-1 flex flex-col bg-[#1e1e1e]">
                {selectedFile ? (
                    <>
                        <div className="h-9 bg-[#2d2d2d] flex items-center">
                            <div className="h-full px-3 flex items-center gap-2 bg-[#1e1e1e] border-t-2 border-blue-500 text-white min-w-[150px] text-xs">
                                <FileCode size={14} className="text-blue-400"/>
                                <span>{selectedFile.split('/').pop()}</span>
                                <button className="ml-auto hover:bg-gray-700 rounded-sm p-0.5"><X size={12}/></button>
                            </div>
                        </div>
                        
                        <div className="h-8 flex items-center justify-between px-4 bg-[#1e1e1e] border-b border-black/20 text-xs">
                            <span className="text-gray-500">{selectedFile}</span>
                            <button 
                                onClick={handleSave} 
                                className={`flex items-center gap-2 px-3 py-1 rounded ${isSaving ? 'bg-yellow-600' : 'bg-blue-600 hover:bg-blue-500'} text-white transition-all`}
                            >
                                <Save size={14}/> {isSaving ? 'Đang lưu...' : 'Lưu File (Ctrl+S)'}
                            </button>
                        </div>

                        <div className="flex-1 relative">
                            <Editor
                                height="100%"
                                theme="vs-dark"
                                path={selectedFile}
                                value={code}
                                onChange={(val) => setCode(val || '')}
                                options={{
                                    fontSize: 14,
                                    fontFamily: "'Fira Code', Consolas, monospace",
                                    minimap: { enabled: true },
                                    automaticLayout: true,
                                }}
                            />
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-600">
                        <FileCode size={64} className="opacity-20 mb-4"/>
                        <p>Chọn một file từ Explorer để chỉnh sửa trực tiếp.</p>
                        <p className="text-xs mt-2 text-yellow-500">⚠ Chú ý: Đây là file hệ thống thật. Cẩn thận khi sửa!</p>
                    </div>
                )}
            </div>
        </div>
    );
}