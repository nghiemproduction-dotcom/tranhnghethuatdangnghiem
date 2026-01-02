/**
 * ============================================================
 * COMPONENT: NHÂN SỰ
 * ============================================================
 *
 * Sử dụng KhungGiaoDien để đồng bộ giao diện.
 * 3 chế độ view: List | Detail | Form (inline, không popup)
 */

"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { User, Phone, Mail, Banknote, Briefcase, Trash2 } from "lucide-react";
import {
  KhungDanhSach,
  KhungChiTiet,
  KhungForm,
} from "@/app/components/KhungGiaoDien";
import ConfirmDialog from "@/app/components/ConfirmDialog";
import { NhanSu, NhanSuPermissions, createNhanSuConfig } from "./config";

// ============================================================
// PROPS
// ============================================================

interface Props {
  permissions?: NhanSuPermissions;
  className?: string;
}

// ============================================================
// HELPER: Format tiền VNĐ
// ============================================================

const formatMoney = (value: number | undefined) => {
  if (!value) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const toNonAccent = (str: string) =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .toLowerCase();

// ============================================================
// COMPONENT
// ============================================================

export default function NhanSuChucNang({
  permissions = {},
  className = "",
}: Props) {
  console.log("🔴 NhanSuChucNang MOUNTED - new version with KhungDanhSach");
  const config = createNhanSuConfig(permissions);
  const {
    allowView = true,
    allowEdit = true,
    allowDelete = false,
    allowBulk = false,
  } = permissions;

  // ========== STATE ==========
  const [items, setItems] = useState<NhanSu[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  // VIEW STATE: 'list' | 'detail' | 'form'
  const [viewMode, setViewMode] = useState<"list" | "detail" | "form">("list");
  const [selectedItem, setSelectedItem] = useState<NhanSu | null>(null);
  const [detailTab, setDetailTab] = useState("hoso");

  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<{
    show: boolean;
    ids: string[];
  }>({ show: false, ids: [] });

  const [formData, setFormData] = useState<Partial<NhanSu>>({});
  const [saving, setSaving] = useState(false);

  // ========== FETCH DATA ==========
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 🛠️ FIX: Kiểm tra kỹ dataSource.fetchList có tồn tại không
      if (config.dataSource?.fetchList) {
        const res = await config.dataSource.fetchList(1, 50, "", "");
        if (res.success && res.data) setItems(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [config.dataSource]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ========== TABS với COUNT ==========
  const tabs = useMemo(() => {
    const counts: Record<string, number> = { all: items.length };
    config.filterTabs?.forEach((tab) => {
      // Kiểm tra an toàn trước khi truy cập
      if (tab.id && tab.filterField) {
        counts[tab.id] = items.filter(
          (i) => (i as any)[tab.filterField!] === tab.id
        ).length;
      }
    });

    const dynamicTabs =
      config.filterTabs?.map((t) => ({
        id: t.id || "", // Fallback ID rỗng
        label: t.label,
        count: t.id ? counts[t.id] || 0 : 0,
      })) || [];

    return [{ id: "all", label: "TẤT CẢ", count: counts.all }, ...dynamicTabs];
  }, [items, config.filterTabs]);

  // ========== FILTERED & SORTED ==========
  const filteredList = useMemo(() => {
    let result = items;

    // Filter by tab
    if (activeTab !== "all") {
      result = result.filter((i) => i.vi_tri_normalized === activeTab);
    }

    // Search
    if (searchTerm) {
      const term = toNonAccent(searchTerm);
      result = result.filter((i) => {
        const hoTen = toNonAccent(i.ho_ten || "");
        const match =
          hoTen.includes(term) ||
          (i.so_dien_thoai || "").includes(term) ||
          toNonAccent(i.email || "").includes(term);
        return match;
      });
    }

    // Sort
    const sortOpt = config.sortOptions?.find((s) => s.key === sortBy);
    if (sortOpt?.sortFn) {
      result = [...result].sort(sortOpt.sortFn);
    }

    return result;
  }, [items, activeTab, searchTerm, sortBy, config.sortOptions]);

  // ========== HANDLERS ==========
  const handleOpenDetail = (item: NhanSu) => {
    setSelectedItem(item);
    setDetailTab("hoso");
    setViewMode("detail");
  };

  const handleOpenForm = (item?: NhanSu) => {
    setFormData(item ? { ...item } : {});
    setSelectedItem(item || null);
    setViewMode("form");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedItem(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // 🛠️ FIX: Kiểm tra create/update có tồn tại không
      if (selectedItem?.id) {
        if (config.dataSource?.update) {
          await config.dataSource.update(selectedItem.id, formData);
        }
      } else {
        if (config.dataSource?.create) {
          await config.dataSource.create(formData);
        }
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
    // 🛠️ FIX: Kiểm tra delete có tồn tại không
    if (config.dataSource?.delete) {
      for (const id of ids) {
        await config.dataSource.delete(id);
      }
      await fetchData();
      setSelectedIds(new Set());
      setConfirmDelete({ show: false, ids: [] });
      handleBackToList();
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  // ========== DETAIL TABS COUNT ==========
  const detailTabCounts = useMemo(
    () => ({
      hoso: 3,
      luong: 3,
      nganhang: 2,
    }),
    []
  );

  // ========== RENDER ==========
  return (
    <div className={`h-full ${className}`}>
      {/* ====== CHẾ ĐỘ DANH SÁCH ====== */}
      {viewMode === "list" && (
        <KhungDanhSach
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSearch={setSearchTerm} // 🛠️ FIX: Đã xóa searchPlaceholder gây lỗi
          sortOptions={
            config.sortOptions?.map((s) => ({ key: s.key, label: s.label })) ||
            []
          }
          activeSort={sortBy}
          onSortChange={setSortBy}
          showAddButton={allowEdit}
          onAdd={() => handleOpenForm()}
          bulkMode={bulkMode}
          onBulkModeToggle={
            allowBulk ? () => setBulkMode(!bulkMode) : undefined
          }
          selectedCount={selectedIds.size}
          onSelectAll={() =>
            setSelectedIds(new Set(filteredList.map((i) => i.id)))
          }
          onClearSelection={() => setSelectedIds(new Set())}
          bulkActions={
            allowDelete
              ? [
                  {
                    id: "delete",
                    label: "XÓA",
                    icon: Trash2,
                    color: "danger",
                    onClick: () =>
                      setConfirmDelete({
                        show: true,
                        ids: Array.from(selectedIds),
                      }),
                  },
                ]
              : []
          }
          loading={loading}
        >
          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-4">
            {filteredList.map((item) => (
              <div
                key={item.id}
                onClick={() => !bulkMode && handleOpenDetail(item)}
                className={`group relative bg-[#0f0f0f] border rounded-xl overflow-hidden cursor-pointer transition-all hover:border-[#C69C6D]/50 hover:shadow-lg ${
                  selectedIds.has(item.id)
                    ? "border-[#C69C6D] bg-[#C69C6D]/5"
                    : "border-white/10"
                }`}
              >
                {/* Bulk checkbox */}
                {bulkMode && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelect(item.id);
                    }}
                    className="absolute top-3 right-3 z-10"
                  >
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        selectedIds.has(item.id)
                          ? "bg-[#C69C6D] border-[#C69C6D]"
                          : "border-white/30 bg-black/50"
                      }`}
                    >
                      {selectedIds.has(item.id) && (
                        <span className="text-black text-xs">✓</span>
                      )}
                    </div>
                  </div>
                )}

                <div className="p-4 flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-full bg-[#1a1a1a] border-2 border-[#C69C6D]/30 overflow-hidden shrink-0">
                    {item.hinh_anh ? (
                      <img
                        src={item.hinh_anh}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#C69C6D]/50">
                        <User size={24} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white truncate">
                      {item.ho_ten}
                    </h3>
                    <p className="text-xs text-[#C69C6D] truncate">
                      {item.vi_tri}
                    </p>
                    <p className="text-xs text-white/40 truncate mt-1">
                      <Phone size={10} className="inline mr-1" />
                      {item.so_dien_thoai || "---"}
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
      {viewMode === "detail" && selectedItem && (
        <KhungChiTiet
          data={selectedItem}
          onClose={handleBackToList}
          avatar={selectedItem.hinh_anh}
          avatarFallback={<User size={10} className="text-[#C69C6D]/50" />}
          title={selectedItem.ho_ten}
          tabs={[
            { id: "hoso", label: "HỒ SƠ" },
            { id: "luong", label: "LƯƠNG" },
            { id: "nganhang", label: "NGÂN HÀNG" },
          ]}
          activeTab={detailTab}
          onTabChange={setDetailTab}
          tabCounts={detailTabCounts}
          showEditButton={allowEdit}
          showDeleteButton={allowDelete}
          onEdit={() => handleOpenForm(selectedItem)}
          onDelete={() =>
            setConfirmDelete({ show: true, ids: [selectedItem.id] })
          }
        >
          <div className="p-4">
            {detailTab === "hoso" && (
              <div className="space-y-3">
                <InfoRow icon={Mail} label="EMAIL" value={selectedItem.email} />
                <InfoRow
                  icon={Phone}
                  label="SỐ ĐIỆN THOẠI"
                  value={selectedItem.so_dien_thoai}
                />
                <InfoRow
                  icon={Briefcase}
                  label="VỊ TRÍ"
                  value={selectedItem.vi_tri}
                />
              </div>
            )}
            {detailTab === "luong" && (
              <div className="space-y-3">
                <InfoRow
                  icon={Banknote}
                  label="LƯƠNG THÁNG"
                  value={formatMoney(selectedItem.luong_thang)}
                  highlight
                />
                <InfoRow
                  icon={Banknote}
                  label="LƯƠNG THEO GIỜ"
                  value={formatMoney(selectedItem.luong_theo_gio)}
                />
                <InfoRow
                  icon={Banknote}
                  label="THƯỞNG DOANH SỐ"
                  value={`${selectedItem.thuong_doanh_thu || 0}%`}
                />
              </div>
            )}
            {detailTab === "nganhang" && (
              <div className="space-y-3">
                <InfoRow
                  icon={Banknote}
                  label="NGÂN HÀNG"
                  value={selectedItem.ngan_hang}
                />
                <InfoRow
                  icon={Banknote}
                  label="SỐ TÀI KHOẢN"
                  value={selectedItem.so_tai_khoan}
                />
              </div>
            )}
          </div>
        </KhungChiTiet>
      )}

      {/* ====== CHẾ ĐỘ FORM ====== */}
      {viewMode === "form" && (
        <KhungForm
          isEditing={!!selectedItem}
          data={formData}
          onClose={handleBackToList}
          title={selectedItem ? selectedItem.ho_ten : "THÊM NHÂN SỰ"}
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
                value={formData.ho_ten || ""}
                onChange={(e) =>
                  setFormData({ ...formData, ho_ten: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-[#C69C6D]/50 focus:outline-none"
                placeholder="Nhập họ tên..."
              />
            </FormField>

            <FormField label="Vị trí" required>
              <input
                type="text"
                value={formData.vi_tri || ""}
                onChange={(e) =>
                  setFormData({ ...formData, vi_tri: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-[#C69C6D]/50 focus:outline-none"
                placeholder="Nhập vị trí..."
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Email">
                <input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-[#C69C6D]/50 focus:outline-none"
                  placeholder="email@..."
                />
              </FormField>
              <FormField label="Số điện thoại">
                <input
                  type="tel"
                  value={formData.so_dien_thoai || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, so_dien_thoai: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-[#C69C6D]/50 focus:outline-none"
                  placeholder="09..."
                />
              </FormField>
            </div>

            <FormField label="Lương tháng (VNĐ)">
              <input
                type="number"
                value={formData.luong_thang || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    luong_thang: Number(e.target.value),
                  })
                }
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-[#C69C6D]/50 focus:outline-none"
                placeholder="0"
              />
            </FormField>
          </div>
        </KhungForm>
      )}

      {/* ====== CONFIRM DELETE ====== */}
      <ConfirmDialog
        isOpen={confirmDelete.show}
        title="XÁC NHẬN XÓA"
        message={`Bạn có chắc muốn xóa ${confirmDelete.ids.length} nhân sự?`}
        onConfirm={() => handleDelete(confirmDelete.ids)}
        onCancel={() => setConfirmDelete({ show: false, ids: [] })}
      />
    </div>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function InfoRow({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: any;
  label: string;
  value?: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#151515] border border-white/5">
      <div
        className={`p-2 rounded-lg ${
          highlight
            ? "bg-[#C69C6D]/20 text-[#C69C6D]"
            : "bg-black text-[#C69C6D]"
        }`}
      >
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-black uppercase tracking-wider text-white/40 mb-0.5">
          {label}
        </p>
        <p
          className={`text-sm font-bold truncate ${
            highlight ? "text-[#C69C6D]" : "text-gray-200"
          }`}
        >
          {value || "---"}
        </p>
      </div>
    </div>
  );
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}
