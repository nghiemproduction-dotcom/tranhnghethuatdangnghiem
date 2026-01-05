"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  User,
  Phone,
  Mail,
  Briefcase,
  Banknote,
  Trash2,
  Clock,     // Thêm icon
  Percent,   // Thêm icon
  CreditCard // Thêm icon
} from "lucide-react";
import {
  KhungDanhSach,
  KhungChiTiet,
  KhungForm,
} from "@/app/components/cacchucnang/KhungGiaoDienChucNang";
import ConfirmDialog from "@/app/components/ConfirmDialog";
import {
  NhanSu,
  NhanSuPermissions,
  createNhanSuConfig,
} from "./config";

// ============================================================
// PROPS
// ============================================================

interface Props {
  permissions?: NhanSuPermissions;
  className?: string;
}

// 🟢 COMPONENT TẠM THỜI (Placeholder) CHO CÁC TAB CHỨC NĂNG KHÁC
// Bạn có thể tách ra file riêng sau này (VD: NhanSuChamCong.tsx)
const GiaoDienChamCong = () => (
  <div className="w-full h-full flex flex-col items-center justify-center text-white/50 space-y-4">
    <Clock size={48} className="text-[#C69C6D] opacity-50" />
    <h3 className="text-lg font-bold uppercase tracking-widest text-[#C69C6D]">Bảng Chấm Công</h3>
    <p className="text-sm">Tính năng đang được phát triển...</p>
  </div>
);

const GiaoDienBangLuong = () => (
  <div className="w-full h-full flex flex-col items-center justify-center text-white/50 space-y-4">
    <Banknote size={48} className="text-green-500 opacity-50" />
    <h3 className="text-lg font-bold uppercase tracking-widest text-green-500">Bảng Tính Lương</h3>
    <p className="text-sm">Tính năng đang được phát triển...</p>
  </div>
);

// ============================================================
// COMPONENT CHÍNH
// ============================================================

export default function NhanSuChucNang({
  permissions = {},
  className = "",
}: Props) {
  const config = createNhanSuConfig(permissions);
  
  const {
    allowView = true,
    allowEdit = true,
    allowDelete = false,
    allowBulkSelect: allowBulk = false,
  } = config.actions || {};

  // --- STATE ---
  const [viewMode, setViewMode] = useState<"list" | "detail" | "form">("list");
  const [listData, setListData] = useState<NhanSu[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedItem, setSelectedItem] = useState<NhanSu | null>(null);
  const [formData, setFormData] = useState<Partial<NhanSu>>({});

  // List State
  const [activeTab, setActiveTab] = useState("all");
  const [activeSort, setSortBy] = useState(config.defaultSort || "name");
  const [searchTerm, setSearchTerm] = useState("");
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Detail State
  const [detailTab, setDetailTab] = useState("hoso");

  // Confirm Dialog
  const [confirmDelete, setConfirmDelete] = useState<{
    show: boolean;
    ids: string[];
  }>({ show: false, ids: [] });

  // --- DATA FETCHING ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await config.dataSource?.fetchList?.(1, 1000, "", ""); 
      if (res?.success && res.data) {
        setListData(res.data);
      }
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  }, [config.dataSource]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- HANDLERS ---

  const handleOpenDetail = (item: NhanSu) => {
    setSelectedItem(item);
    setViewMode("detail");
  };

  const handleOpenForm = (item?: NhanSu) => {
    if (item) {
      setSelectedItem(item);
      setFormData(item);
    } else {
      setSelectedItem(null);
      setFormData({});
    }
    setViewMode("form");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedItem(null);
    setFormData({});
  };

  const handleDelete = async (ids: string[]) => {
    if (ids.length === 0) return;
    try {
      for (const id of ids) {
        await config.dataSource?.delete?.(id);
      }
      setConfirmDelete({ show: false, ids: [] });
      setSelectedIds(new Set());
      setBulkMode(false);
      if (viewMode === "detail") handleBackToList();
      fetchData();
    } catch (e) {
      console.error(e);
      alert("Lỗi khi xóa dữ liệu");
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  // --- FILTER & SORT LOGIC ---
  const filteredList = useMemo(() => {
    let result = listData;

    if (activeTab !== "all") {
      const tabConfig = config.filterTabs.find((t) => t.id === activeTab);
      // Chỉ lọc nếu tab đó CÓ filterField (các tab chức năng như chamcong sẽ ko lọc)
      if (tabConfig && tabConfig.filterField) {
        result = result.filter(
          (item: any) => item[tabConfig.filterField!] === activeTab
        );
      }
    }

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.ho_ten.toLowerCase().includes(lower) ||
          item.so_dien_thoai?.includes(lower) ||
          item.email?.toLowerCase().includes(lower)
      );
    }

    if (config.sortOptions) {
      const sortConfig = config.sortOptions.find((o) => o.key === activeSort);
      if (sortConfig) {
        result = [...result].sort(sortConfig.sortFn);
      }
    }

    return result;
  }, [listData, activeTab, searchTerm, activeSort, config.filterTabs, config.sortOptions]);

  // 🟢 CONFIG LIST TABS
  const listTabDefs = useMemo(() => {
    return config.filterTabs.map((t) => ({
      id: t.id || "",
      label: t.label,
      filterField: t.filterField,
    }));
  }, [config.filterTabs]);

  // 🟢 FIX LỖI TYPE: Map lại mảng tab để đảm bảo `id` luôn là string
  const detailTabDefs = useMemo(() => {
    return (config.detailTabs || []).map(tab => ({
      ...tab,
      id: tab.id || "" // Fallback nếu id bị undefined
    }));
  }, [config.detailTabs]);

  // 🟢 LOGIC MỚI: QUYẾT ĐỊNH RENDER GIAO DIỆN TÙY CHỈNH THEO TAB
  const renderTabContent = (tabId: string) => {
    switch (tabId) {
      case 'chamcong':
        return <GiaoDienChamCong />;
      case 'tinhluong':
        return <GiaoDienBangLuong />;
      default:
        // Trả về null nghĩa là "Hãy hiện danh sách nhân sự mặc định"
        return null; 
    }
  };

  const formatMoney = (val?: number) => {
    if (!val) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);
  };

  if (!allowView) return <div className="p-4 text-white/50">Không có quyền truy cập</div>;

  return (
    <div className={`w-full h-full bg-[#050505] flex flex-col ${className}`}>
      
      {/* ====== CHẾ ĐỘ DANH SÁCH ====== */}
      {viewMode === "list" && (
        <KhungDanhSach
          data={listData}
          tabDefs={listTabDefs}
          
          activeTab={activeTab}
          onTabChange={(id) => {
            setActiveTab(id);
            setBulkMode(false);
            setSelectedIds(new Set());
          }}
          
          // 🟢 TRUYỀN HÀM RENDER CUSTOM VÀO ĐÂY
          renderCustomContent={renderTabContent}

          onSearch={setSearchTerm}
          sortOptions={config.sortOptions}
          activeSort={activeSort}
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
          {/* Cards (Sẽ tự ẩn nếu renderCustomContent trả về nội dung khác null) */}
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
          
          // 🟢 ĐÃ SỬA: Truyền detailTabDefs đã được map
          tabDefs={detailTabDefs}
          
          activeTab={detailTab}
          onTabChange={setDetailTab}
          showEditButton={allowEdit}
          showDeleteButton={allowDelete}
          onEdit={() => handleOpenForm(selectedItem)}
          onDelete={() =>
            setConfirmDelete({ show: true, ids: [selectedItem.id] })
          }
        >
          <div className="p-4">
            {/* 🟢 GIAO DIỆN HỢP NHẤT: Tất cả trong tab HỒ SƠ */}
            {detailTab === "hoso" && (
              <div className="space-y-6">
                
                {/* 1. THÔNG TIN LIÊN HỆ */}
                <div className="space-y-3">
                  <InfoRow icon={Briefcase} label="VỊ TRÍ" value={selectedItem.vi_tri} highlight />
                  <InfoRow icon={Phone} label="SỐ ĐIỆN THOẠI" value={selectedItem.so_dien_thoai} />
                  <InfoRow icon={Mail} label="EMAIL" value={selectedItem.email} />
                </div>

                {/* 2. CHẾ ĐỘ LƯƠNG */}
                <div className="pt-4 border-t border-white/5 space-y-3">
                  <label className="text-[10px] font-bold text-white/40 uppercase pl-1">Chế độ lương</label>
                  <div className="space-y-2">
                    <InfoRow icon={Banknote} label="LƯƠNG THÁNG" value={formatMoney(selectedItem.luong_thang)} highlight />
                    <InfoRow icon={Clock} label="LƯƠNG THEO GIỜ" value={formatMoney(selectedItem.luong_theo_gio)} />
                    <InfoRow icon={Percent} label="THƯỞNG DOANH SỐ" value={selectedItem.thuong_doanh_thu ? `${selectedItem.thuong_doanh_thu}%` : "0%"} />
                  </div>
                </div>

                {/* 3. THANH TOÁN */}
                <div className="pt-4 border-t border-white/5 space-y-3">
                  <label className="text-[10px] font-bold text-white/40 uppercase pl-1">Thanh toán</label>
                  <div className="space-y-2">
                    <InfoRow icon={Banknote} label="NGÂN HÀNG" value={selectedItem.ngan_hang} />
                    <InfoRow icon={CreditCard} label="SỐ TÀI KHOẢN" value={selectedItem.so_tai_khoan} />
                  </div>
                </div>

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
          
          avatar={formData.hinh_anh} 
          avatarFallback={<User size={10} className="text-[#C69C6D]/50" />}
          showAvatarUpload={true}
          uploadBucket="avatar"
          onUploadComplete={(url) => 
              setFormData((prev) => ({ ...prev, hinh_anh: url }))
          }

          // Smart Save
          action={{
            validate: (data) => {
                if (!data.ho_ten || !data.vi_tri) {
                    return "Vui lòng nhập đủ họ tên và vị trí";
                }
                return null;
            },
            onSave: async (data) => {
                if (selectedItem?.id) {
                    return await config.dataSource?.update?.(selectedItem.id, data);
                } else {
                    return await config.dataSource?.create?.(data);
                }
            },
            onSuccess: () => fetchData(),
          }}

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