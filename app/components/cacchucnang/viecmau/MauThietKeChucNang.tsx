"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Trash2 } from "lucide-react";
import { KhungDanhSach } from "@/app/components/cacchucnang/KhungGiaoDienChucNang";
import ConfirmDialog from "@/app/components/ConfirmDialog";
import {
  MauThietKe,
  MauThietKePermissions,
  createMauThietKeConfig,
} from "./config";

// IMPORT 3 THÀNH PHẦN ĐÃ TÁCH
import MauThietKeList from "./MauThietKeList";
import MauThietKeForm from "./MauThietKeForm";
import MauThietKeDetail from "./MauThietKeDetail";

interface Props {
  permissions?: MauThietKePermissions;
  className?: string;
}

const toNonAccent = (str: string) =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .toLowerCase();

export default function MauThietKeChucNang({
  permissions = {},
  className = "",
}: Props) {
  const config = createMauThietKeConfig(permissions);
  const {
    allowEdit = true,
    allowDelete = false,
    allowBulk = false,
  } = permissions;

  // --- STATE QUẢN LÝ ---
  const [items, setItems] = useState<MauThietKe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // View State
  const [viewMode, setViewMode] = useState<"list" | "detail" | "form">("list");
  const [selectedItem, setSelectedItem] = useState<MauThietKe | null>(null);

  // Action State
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<{
    show: boolean;
    ids: string[];
  }>({ show: false, ids: [] });
  const [saving, setSaving] = useState(false);

  // --- FETCH DATA ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (config.dataSource?.fetchList) {
        const res = await config.dataSource.fetchList(1, 100, "", "");
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

  // --- FILTER & SORT LOGIC ---
  const filteredList = useMemo(() => {
    let result = items;

    // 1. LOGIC LỌC MỚI (Xử lý tab 'ĐÃ CÓ FILE')
    if (activeTab === "has_file") {
      result = result.filter((i) => {
        // Kiểm tra xem có file thiết kế không (Array hoặc JSON string)
        const files = i.file_thiet_ke;
        if (Array.isArray(files) && files.length > 0) return true;
        if (typeof files === "string") {
          try {
            const parsed = JSON.parse(files);
            return Array.isArray(parsed) && parsed.length > 0;
          } catch {
            return false;
          }
        }
        return false;
      });
    }
    // Lọc theo phân loại thông thường
    else if (activeTab !== "all") {
      result = result.filter((i) => i.phan_loai_normalized === activeTab);
    }

    // Tìm kiếm
    if (searchTerm) {
      const term = toNonAccent(searchTerm);
      result = result.filter((i) => toNonAccent(i.mo_ta).includes(term));
    }

    // Sắp xếp
    const sortOpt = config.sortOptions?.find((s) => s.key === sortBy);
    if (sortOpt?.sortFn) {
      result = [...result].sort(sortOpt.sortFn);
    }
    return result;
  }, [items, activeTab, searchTerm, sortBy, config.sortOptions]);

  const tabs = useMemo(() => {
    const counts: Record<string, number> = { all: items.length };

    config.filterTabs?.forEach((tab) => {
      // 2. LOGIC ĐẾM SỐ LƯỢNG MỚI CHO TAB 'HAS_FILE'
      if (tab.id === "has_file") {
        counts[tab.id] = items.filter((i) => {
          const files = i.file_thiet_ke;
          if (Array.isArray(files) && files.length > 0) return true;
          if (typeof files === "string") {
            try {
              const parsed = JSON.parse(files);
              return Array.isArray(parsed) && parsed.length > 0;
            } catch {
              return false;
            }
          }
          return false;
        }).length;
      }
      // Đếm cho các tab phân loại bình thường
      else if (tab.id && tab.filterField) {
        counts[tab.id] = items.filter(
          (i) => (i as any)[tab.filterField!] === tab.id
        ).length;
      }
    });

    const dynamicTabs =
      config.filterTabs?.map((t) => ({
        id: t.id || "",
        label: t.label,
        count: t.id ? counts[t.id] || 0 : 0,
      })) || [];
    return [{ id: "all", label: "TẤT CẢ", count: counts.all }, ...dynamicTabs];
  }, [items, config.filterTabs]);

  // --- ACTION HANDLERS ---
  const handleOpenDetail = (item: MauThietKe) => {
    setSelectedItem(item);
    setViewMode("detail");
  };

  const handleOpenForm = (item?: MauThietKe) => {
    setSelectedItem(item || null);
    setViewMode("form");
  };

  // --- [UPDATED] LOGIC CHECK KẾT QUẢ TRẢ VỀ TỪ BACKEND ---
  const handleSave = async (formData: any) => {
    setSaving(true);
    try {
      let res; // Biến hứng kết quả

      if (selectedItem?.id) {
        if (config.dataSource?.update) {
          res = await config.dataSource.update(selectedItem.id, formData);
        }
      } else {
        if (config.dataSource?.create) {
          res = await config.dataSource.create(formData);
        }
      }

      // KIỂM TRA: Nếu Backend trả về success: false (do không có quyền sửa, lỗi logic...)
      if (res && !res.success) {
        // Hiện thông báo lỗi và KHÔNG đóng form
        alert(
          res.error || "Thao tác thất bại. Vui lòng kiểm tra lại quyền hạn!"
        );
        return; // Dừng hàm tại đây
      }

      // Nếu thành công -> Tải lại dữ liệu và đóng form
      await fetchData();
      setViewMode("list");
      setSelectedItem(null);
    } catch (e) {
      console.error(e);
      alert("Đã có lỗi hệ thống xảy ra!");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (ids: string[]) => {
    if (config.dataSource?.delete) {
      // Logic xóa cũng nên có try/catch tương tự nhưng tạm thời giữ nguyên theo code gốc
      // để tránh ảnh hưởng logic delete hàng loạt
      for (const id of ids) await config.dataSource.delete(id);
      await fetchData();
      setSelectedIds(new Set());
      setConfirmDelete({ show: false, ids: [] });
      setViewMode("list");
    }
  };

  const handleBulkSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  // --- RENDER ---
  return (
    <div className={`h-full ${className}`}>
      {/* 1. LIST VIEW */}
      {viewMode === "list" && (
        <KhungDanhSach
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSearch={setSearchTerm}
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
          <MauThietKeList
            items={filteredList}
            bulkMode={bulkMode}
            selectedIds={selectedIds}
            onToggleSelect={handleBulkSelect}
            onClickItem={handleOpenDetail}
          />
        </KhungDanhSach>
      )}

      {/* 2. FORM VIEW */}
      {viewMode === "form" && (
        <MauThietKeForm
          data={selectedItem}
          onClose={() => {
            setViewMode("list");
            setSelectedItem(null);
          }}
          onSubmit={handleSave}
          loading={saving}
        />
      )}

      {/* 3. DETAIL VIEW */}
      {viewMode === "detail" && selectedItem && (
        <MauThietKeDetail
          data={selectedItem}
          onClose={() => {
            setViewMode("list");
            setSelectedItem(null);
          }}
          allowEdit={allowEdit}
          allowDelete={allowDelete}
          onEdit={() => handleOpenForm(selectedItem)}
          onDelete={() =>
            setConfirmDelete({ show: true, ids: [selectedItem.id] })
          }
        />
      )}

      <ConfirmDialog
        isOpen={confirmDelete.show}
        title="XÁC NHẬN XÓA"
        message={`Bạn có chắc muốn xóa ${confirmDelete.ids.length} mẫu thiết kế?`}
        onConfirm={() => handleDelete(confirmDelete.ids)}
        onCancel={() => setConfirmDelete({ show: false, ids: [] })}
      />
    </div>
  );
}
