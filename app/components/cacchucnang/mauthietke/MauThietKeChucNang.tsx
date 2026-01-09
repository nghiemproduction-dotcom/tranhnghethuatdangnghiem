"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Trash2 } from "lucide-react";
import { KhungDanhSach } from "@/app/components/cacchucnang/KhungGiaoDienChucNang";
import ConfirmDialog from "@/components/ConfirmDialog";
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

    if (activeTab === "has_file") {
      result = result.filter((i) => {
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
    } else if (activeTab !== "all") {
      result = result.filter((i) => i.phan_loai_normalized === activeTab);
    }

    if (searchTerm) {
      const term = toNonAccent(searchTerm);
      result = result.filter((i) => toNonAccent(i.mo_ta).includes(term));
    }

    const sortOpt = config.sortOptions?.find((s) => s.key === sortBy);
    if (sortOpt?.sortFn) {
      result = [...result].sort(sortOpt.sortFn);
    }
    return result;
  }, [items, activeTab, searchTerm, sortBy, config.sortOptions]);

  // 🟢 ĐÃ CẬP NHẬT: Tính toán count thủ công cho tab "has_file"
  const listTabDefs = useMemo(() => {
    return config.filterTabs?.map((t) => {
      // Nếu là tab đặc biệt "has_file" - cần đếm phức tạp
      if (t.id === 'has_file') {
        const count = items.filter((i) => {
          const files = i.file_thiet_ke;
          if (Array.isArray(files) && files.length > 0) return true;
          if (typeof files === "string") {
            try {
              const parsed = JSON.parse(files);
              return Array.isArray(parsed) && parsed.length > 0;
            } catch { return false; }
          }
          return false;
        }).length;

        return {
          id: t.id,
          label: t.label,
          count: count, //  Truyền số lượng đã tính vào để KhungDanhSach hiển thị
          filterField: undefined, // Bỏ filterField để KhungDanhSach ưu tiên dùng count này
        };
      }

      // Các tab bình thường -> Để KhungDanhSach tự đếm
      return {
        id: t.id || "",
        label: t.label,
        filterField: t.filterField,
      };
    }) || [];
  }, [config.filterTabs, items]);

  // --- ACTION HANDLERS ---
  const handleOpenDetail = (item: MauThietKe) => {
    setSelectedItem(item);
    setViewMode("detail");
  };

  const handleOpenForm = (item?: MauThietKe) => {
    setSelectedItem(item || null);
    setViewMode("form");
  };

  const handleDelete = async (ids: string[]) => {
    if (config.dataSource?.delete) {
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
          // 🟢 ĐÃ SỬA: Truyền data gốc và tabDefs (đã có count thủ công)
          data={items}
          tabDefs={listTabDefs}
          
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
          onSuccess={() => {
              fetchData();
              setViewMode("list");
              setSelectedItem(null);
          }}
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