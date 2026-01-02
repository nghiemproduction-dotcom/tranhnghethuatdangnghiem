/**
 * ============================================================
 * COMPONENT: KHÁCH HÀNG
 * ============================================================
 * 
 * Sử dụng KhungGiaoDien để đồng bộ giao diện.
 * 3 chế độ view: List | Detail | Form (inline, không popup)
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { User, Phone, Mail, MapPin, ShoppingBag, Calendar, Trash2 } from 'lucide-react';
import { KhungDanhSach, KhungChiTiet, KhungForm } from '@/app/components/KhungGiaoDien';
import ConfirmDialog from '@/app/components/ConfirmDialog';
import { KhachHang, KhachHangPermissions, createKhachHangConfig, PHAN_LOAI_OPTIONS } from './config';

// ============================================================
// PROPS
// ============================================================

interface Props {
    permissions?: KhachHangPermissions;
    className?: string;
}

// ============================================================
// HELPER
// ============================================================

const toNonAccent = (str: string) => 
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "").toLowerCase();

const getPhanLoaiStyle = (phanLoai?: string) => {
    const styles: Record<string, string> = {
        'Tiềm năng': 'bg-blue-500/20 text-blue-400 border-blue-500/40',
        'Mới': 'bg-green-500/20 text-green-400 border-green-500/40',
        'Thân thiết': 'bg-purple-500/20 text-purple-400 border-purple-500/40',
        'VIP': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
        'Không hoạt động': 'bg-gray-500/20 text-gray-400 border-gray-500/40',
    };
    return styles[phanLoai || ''] || 'bg-gray-500/20 text-gray-400 border-gray-500/40';
};

// ============================================================
// COMPONENT
// ============================================================

export default function KhachHangChucNang({ 
    permissions = {}, 
    className = '' 
}: Props) {
    const config = createKhachHangConfig(permissions);
    const { allowView = true, allowEdit = true, allowDelete = false, allowBulk = false } = permissions;

    // ========== STATE ==========
    const [items, setItems] = useState<KhachHang[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [sortBy, setSortBy] = useState('name');

    // VIEW STATE: 'list' | 'detail' | 'form'
    const [viewMode, setViewMode] = useState<'list' | 'detail' | 'form'>('list');
    const [selectedItem, setSelectedItem] = useState<KhachHang | null>(null);
    const [detailTab, setDetailTab] = useState('thongtin');

    const [bulkMode, setBulkMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; ids: string[] }>({ show: false, ids: [] });

    const [formData, setFormData] = useState<Partial<KhachHang>>({});
    const [saving, setSaving] = useState(false);

    // ========== FETCH DATA ==========
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await config.dataSource.fetchList(1, 1000, '', '');
            if (res.success && res.data) setItems(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [config.dataSource]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ========== TABS với COUNT ==========
    const tabs = useMemo(() => {
        const counts: Record<string, number> = { all: items.length };
        config.filterTabs?.forEach(tab => {
            counts[tab.id] = items.filter(i => (i as any)[tab.filterField] === tab.id).length;
        });
        return [
            { id: 'all', label: 'TẤT CẢ', count: counts.all },
            ...(config.filterTabs?.map(t => ({ id: t.id, label: t.label, count: counts[t.id] || 0 })) || [])
        ];
    }, [items, config.filterTabs]);

    // ========== FILTERED & SORTED ==========
    const filteredList = useMemo(() => {
        let result = items;

        // Filter by tab
        if (activeTab !== 'all') {
            result = result.filter(i => i.phan_loai_normalized === activeTab);
        }

        // Search
        if (searchTerm) {
            const term = toNonAccent(searchTerm);
            console.log('[KhachHang] searchTerm:', searchTerm, '| term (non-accent):', term);
            result = result.filter(i => {
                const hoTen = toNonAccent(i.ho_ten || '');
                const match = hoTen.includes(term) ||
                    (i.so_dien_thoai || '').includes(term) ||
                    toNonAccent(i.email || '').includes(term);
                console.log('[KhachHang] Checking:', i.ho_ten, '| hoTen normalized:', hoTen, '| match:', match);
                return match;
            });
        }

        // Sort
        const sortOpt = config.sortOptions?.find(s => s.key === sortBy);
        if (sortOpt?.sortFn) {
            result = [...result].sort(sortOpt.sortFn);
        }

        return result;
    }, [items, activeTab, searchTerm, sortBy, config.sortOptions]);

    // ========== HANDLERS ==========
    const handleOpenDetail = (item: KhachHang) => {
        setSelectedItem(item);
        setDetailTab('thongtin');
        setViewMode('detail');
    };

    const handleOpenForm = (item?: KhachHang) => {
        setFormData(item ? { ...item } : {});
        setSelectedItem(item || null);
        setViewMode('form');
    };

    const handleBackToList = () => {
        setViewMode('list');
        setSelectedItem(null);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (selectedItem?.id) {
                await config.dataSource.update(selectedItem.id, formData);
            } else {
                await config.dataSource.create(formData);
            }
            await fetchData();
            handleBackToList();
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (ids: string[]) => {
        for (const id of ids) {
            await config.dataSource.delete(id);
        }
        await fetchData();
        setSelectedIds(new Set());
        setConfirmDelete({ show: false, ids: [] });
        handleBackToList();
    };

    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    // ========== DETAIL TABS COUNT ==========
    const detailTabCounts = useMemo(() => ({
        thongtin: 4,
        donhang: 0,
        ghichu: selectedItem?.ghi_chu ? 1 : 0
    }), [selectedItem]);

    // ========== RENDER ==========
    return (
        <div className={`h-full ${className}`}>
            
            {/* ====== CHẾ ĐỘ DANH SÁCH ====== */}
            {viewMode === 'list' && (
                <KhungDanhSach
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    searchPlaceholder="Tìm tên, SĐT, email..."
                    onSearch={setSearchTerm}
                    sortOptions={config.sortOptions?.map(s => ({ key: s.key, label: s.label })) || []}
                    activeSort={sortBy}
                    onSortChange={setSortBy}
                    showAddButton={allowEdit}
                    onAdd={() => handleOpenForm()}
                    bulkMode={bulkMode}
                    onBulkModeToggle={allowBulk ? () => setBulkMode(!bulkMode) : undefined}
                    selectedCount={selectedIds.size}
                    onSelectAll={() => setSelectedIds(new Set(filteredList.map(i => i.id)))}
                    onClearSelection={() => setSelectedIds(new Set())}
                    bulkActions={allowDelete ? [
                        { id: 'delete', label: 'XÓA', icon: Trash2, color: 'danger', onClick: () => setConfirmDelete({ show: true, ids: Array.from(selectedIds) }) }
                    ] : []}
                    loading={loading}
                >
                    {/* Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-4">
                        {filteredList.map(item => (
                            <div
                                key={item.id}
                                onClick={() => !bulkMode && handleOpenDetail(item)}
                                className={`group relative bg-[#0f0f0f] border rounded-xl overflow-hidden cursor-pointer transition-all hover:border-[#C69C6D]/50 hover:shadow-lg ${
                                    selectedIds.has(item.id) ? 'border-[#C69C6D] bg-[#C69C6D]/5' : 'border-white/10'
                                }`}
                            >
                                {/* Bulk checkbox */}
                                {bulkMode && (
                                    <div
                                        onClick={(e) => { e.stopPropagation(); toggleSelect(item.id); }}
                                        className="absolute top-3 right-3 z-10"
                                    >
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                            selectedIds.has(item.id) ? 'bg-[#C69C6D] border-[#C69C6D]' : 'border-white/30 bg-black/50'
                                        }`}>
                                            {selectedIds.has(item.id) && <span className="text-black text-xs">✓</span>}
                                        </div>
                                    </div>
                                )}

                                <div className="p-4 flex items-center gap-4">
                                    {/* Avatar */}
                                    <div className="w-14 h-14 rounded-full bg-[#1a1a1a] border-2 border-[#C69C6D]/30 overflow-hidden shrink-0">
                                        {item.hinh_anh ? (
                                            <img src={item.hinh_anh} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[#C69C6D]/50">
                                                <User size={24} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-white truncate">{item.ho_ten}</h3>
                                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getPhanLoaiStyle(item.phan_loai)}`}>
                                            {item.phan_loai || 'Chưa phân loại'}
                                        </span>
                                        <p className="text-xs text-white/40 truncate mt-1">
                                            <Phone size={10} className="inline mr-1" />
                                            {item.so_dien_thoai || '---'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {filteredList.length === 0 && !loading && (
                            <div className="col-span-full py-20 text-center text-white/30">
                                Không có dữ liệu
                            </div>
                        )}
                    </div>
                </KhungDanhSach>
            )}

            {/* ====== CHẾ ĐỘ CHI TIẾT ====== */}
            {viewMode === 'detail' && selectedItem && (
                <KhungChiTiet
                    data={selectedItem}
                    onClose={handleBackToList}
                    avatar={selectedItem.hinh_anh}
                    avatarFallback={<User size={10} className="text-[#C69C6D]/50" />}
                    title={selectedItem.ho_ten}
                    tabs={[
                        { id: 'thongtin', label: 'THÔNG TIN' },
                        { id: 'donhang', label: 'ĐƠN HÀNG' },
                        { id: 'ghichu', label: 'GHI CHÚ' },
                    ]}
                    activeTab={detailTab}
                    onTabChange={setDetailTab}
                    tabCounts={detailTabCounts}
                    showEditButton={allowEdit}
                    showDeleteButton={allowDelete}
                    onEdit={() => handleOpenForm(selectedItem)}
                    onDelete={() => setConfirmDelete({ show: true, ids: [selectedItem.id] })}
                >
                    <div className="p-4">
                        {detailTab === 'thongtin' && (
                            <div className="space-y-3">
                                <InfoRow icon={Phone} label="SỐ ĐIỆN THOẠI" value={selectedItem.so_dien_thoai} action={() => window.open(`tel:${selectedItem.so_dien_thoai}`)} />
                                <InfoRow icon={Mail} label="EMAIL" value={selectedItem.email} />
                                <InfoRow icon={MapPin} label="ĐỊA CHỈ" value={selectedItem.dia_chi} />
                                <InfoRow icon={Calendar} label="NGÀY THAM GIA" value={selectedItem.tao_luc ? new Date(selectedItem.tao_luc).toLocaleDateString('vi-VN') : undefined} />
                            </div>
                        )}
                        {detailTab === 'donhang' && (
                            <div className="flex flex-col items-center justify-center py-10 text-white/30">
                                <ShoppingBag size={40} className="mb-3 opacity-30" />
                                <p className="text-sm">Chưa có đơn hàng</p>
                            </div>
                        )}
                        {detailTab === 'ghichu' && (
                            <div className="p-4 bg-[#151515] rounded-xl border border-white/5 min-h-[100px]">
                                <p className="text-sm text-white/60 whitespace-pre-wrap">
                                    {selectedItem.ghi_chu || 'Chưa có ghi chú'}
                                </p>
                            </div>
                        )}
                    </div>
                </KhungChiTiet>
            )}

            {/* ====== CHẾ ĐỘ FORM ====== */}
            {viewMode === 'form' && (
                <KhungForm
                    isEditing={!!selectedItem}
                    data={formData}
                    onClose={handleBackToList}
                    title={selectedItem ? selectedItem.ho_ten : 'THÊM KHÁCH HÀNG'}
                    avatar={selectedItem?.hinh_anh}
                    avatarFallback={<User size={10} className="text-[#C69C6D]/50" />}
                    showAvatarUpload={true}
                    onSubmit={handleSave}
                    loading={saving}
                    isDirty={Object.keys(formData).length > 0}
                >
                    <div className="space-y-4">
                        <FormField label="Họ và Tên" required>
                            <input
                                type="text"
                                value={formData.ho_ten || ''}
                                onChange={e => setFormData({ ...formData, ho_ten: e.target.value })}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-[#C69C6D]/50 focus:outline-none"
                                placeholder="Nhập họ tên..."
                            />
                        </FormField>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField label="Số điện thoại" required>
                                <input
                                    type="tel"
                                    value={formData.so_dien_thoai || ''}
                                    onChange={e => setFormData({ ...formData, so_dien_thoai: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-[#C69C6D]/50 focus:outline-none"
                                    placeholder="09..."
                                />
                            </FormField>
                            <FormField label="Email">
                                <input
                                    type="email"
                                    value={formData.email || ''}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-[#C69C6D]/50 focus:outline-none"
                                    placeholder="email@..."
                                />
                            </FormField>
                        </div>

                        <FormField label="Phân loại">
                            <select
                                value={formData.phan_loai || ''}
                                onChange={e => setFormData({ ...formData, phan_loai: e.target.value })}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#C69C6D]/50 focus:outline-none"
                            >
                                <option value="">Chọn phân loại...</option>
                                {PHAN_LOAI_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </FormField>

                        <FormField label="Địa chỉ">
                            <textarea
                                value={formData.dia_chi || ''}
                                onChange={e => setFormData({ ...formData, dia_chi: e.target.value })}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-[#C69C6D]/50 focus:outline-none resize-none"
                                rows={2}
                                placeholder="Nhập địa chỉ..."
                            />
                        </FormField>

                        <FormField label="Ghi chú">
                            <textarea
                                value={formData.ghi_chu || ''}
                                onChange={e => setFormData({ ...formData, ghi_chu: e.target.value })}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-[#C69C6D]/50 focus:outline-none resize-none"
                                rows={3}
                                placeholder="Ghi chú thêm..."
                            />
                        </FormField>
                    </div>
                </KhungForm>
            )}

            {/* ====== CONFIRM DELETE ====== */}
            <ConfirmDialog
                isOpen={confirmDelete.show}
                title="XÁC NHẬN XÓA"
                message={`Bạn có chắc muốn xóa ${confirmDelete.ids.length} khách hàng?`}
                onConfirm={() => handleDelete(confirmDelete.ids)}
                onCancel={() => setConfirmDelete({ show: false, ids: [] })}
            />
        </div>
    );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function InfoRow({ icon: Icon, label, value, action }: { icon: any; label: string; value?: string; action?: () => void }) {
    return (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#151515] border border-white/5 hover:border-[#C69C6D]/30 transition-colors">
            <div className="p-2 rounded-lg bg-black text-[#C69C6D]">
                <Icon size={16} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black uppercase tracking-wider text-white/40 mb-0.5">{label}</p>
                <p className="text-sm font-bold text-gray-200 truncate">{value || '---'}</p>
            </div>
            {action && value && (
                <button onClick={action} className="px-3 py-1 text-[10px] font-bold uppercase bg-[#C69C6D]/20 text-[#C69C6D] rounded hover:bg-[#C69C6D]/30">
                    GỌI
                </button>
            )}
        </div>
    );
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            {children}
        </div>
    );
}