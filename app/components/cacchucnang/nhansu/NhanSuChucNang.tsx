"use client";

import React, { useState, useEffect, useMemo } from "react";

// 🟢 FIX ĐƯỜNG DẪN IMPORT: Đảm bảo trỏ đúng thư mục chứa các Khung
import KhungDanhSach from "@/app/components/cacchucnang/KhungGiaoDienChucNang/KhungDanhSach";
import KhungForm from "@/app/components/cacchucnang/KhungGiaoDienChucNang/KhungForm";
import KhungChiTiet from "@/app/components/cacchucnang/KhungGiaoDienChucNang/KhungChiTiet";

// Import Cấu hình & Logic (DAL)
import { createNhanSuConfig, NhanSu } from "./config"; 

export default function NhanSuChucNang() {
  // 1. Lấy cấu hình
  const config = useMemo(() => createNhanSuConfig({ allowDelete: true, allowBulk: true }), []);
  
  // 2. States List
  const [dataList, setDataList] = useState<NhanSu[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentSort, setCurrentSort] = useState(config.defaultSort);

  // States Form & Detail
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<NhanSu | null>(null);
  const [selectedItem, setSelectedItem] = useState<NhanSu | null>(null);
  
  // 🟢 State cho Tab con trong Chi tiết (Hồ sơ, Lương...)
  const [detailTab, setDetailTab] = useState("hoso");

  // State Form Data
  const [formData, setFormData] = useState<Partial<NhanSu>>({});

  // 3. Load Data
  const loadData = async () => {
    if (!config.dataSource?.fetchList) return;
    setLoading(true);
    try {
      const res = await config.dataSource.fetchList(1, 1000, searchTerm, currentTab);
      if (res.success && res.data) {
        setDataList(res.data);
      }
    } catch (error) {
      console.error("Load error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentTab, searchTerm]);

  // 4. Actions
  const handleCreate = () => {
    setEditingItem(null);
    setFormData({});
    setShowForm(true);
  };

  const handleEdit = (item: NhanSu) => {
    setEditingItem(item);
    setFormData({ ...item });
    setShowForm(true);
    setSelectedItem(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa nhân sự này?")) return;
    if (!config.dataSource?.delete) return;

    const res = await config.dataSource.delete(id);
    if (res.success) {
      loadData();
      setSelectedItem(null);
    } else {
      alert("Xóa thất bại: " + res.error);
    }
  };

  const handleSave = async (submitData: any) => {
    if (editingItem) {
      if (!config.dataSource?.update) return { success: false };
      return await config.dataSource.update(editingItem.id, submitData);
    } else {
      if (!config.dataSource?.create) return { success: false };
      return await config.dataSource.create(submitData);
    }
  };

  // 5. Render
  return (
    <div className="w-full h-full relative bg-[#0a0a0a]">
      
      {/* --- LEVEL 1: DANH SÁCH (SMART TABLE MODE) --- */}
      <KhungDanhSach<NhanSu>
        data={dataList}
        tabDefs={config.filterTabs}
        activeTab={currentTab}
        onTabChange={setCurrentTab}
        onSearch={setSearchTerm}
        
        // 🔥 QUAN TRỌNG: Truyền fields để kích hoạt chế độ Bảng (Table)
        fields={config.fields}
        
        sortOptions={config.sortOptions}
        activeSort={currentSort}
        onSortChange={setCurrentSort}
        
        // Xử lý khi click vào dòng trong bảng
        onRowClick={(item) => { 
             setSelectedItem(item); 
             setDetailTab("hoso"); 
        }}
        
        showAddButton={config.actions?.allowEdit}
        onAdd={handleCreate}
        loading={loading}
      >
         {/* 🔴 ĐÃ XÓA CODE GRID CŨ ĐỂ KHUNG TỰ VẼ BẢNG */}
      </KhungDanhSach>

      {/* --- LEVEL 2: FORM --- */}
      {showForm && (
        <div className="absolute inset-0 z-50 bg-[#050505]">
           <KhungForm
              title={editingItem ? "Cập nhật Nhân sự" : "Thêm mới Nhân sự"}
              isEditing={!!editingItem}
              onClose={() => setShowForm(false)}
              
              fields={config.fields} 
              formData={formData}
              onDataChange={(key, val) => setFormData((prev: any) => ({ ...prev, [key]: val }))}
              
              action={{
                 onSave: handleSave,
                 onSuccess: () => {
                    loadData();
                    setShowForm(false);
                 }
              }}

              showAvatarUpload={true}
              uploadBucket={config.uploadConfig?.bucket}
              avatar={formData.hinh_anh}
              onUploadComplete={(url) => setFormData((prev: any) => ({ ...prev, hinh_anh: url }))}
           />
        </div>
      )}

      {/* --- LEVEL 3: CHI TIẾT --- */}
      {selectedItem && (
        <div className="absolute inset-0 z-40 bg-[#050505]">
           <KhungChiTiet
              title={selectedItem.ho_ten}
              data={selectedItem}
              onClose={() => setSelectedItem(null)}
              
              fields={config.fields} 
              avatar={selectedItem.hinh_anh}
              
              showEditButton={true}
              onEdit={() => handleEdit(selectedItem)}
              
              showDeleteButton={true}
              onDelete={() => handleDelete(selectedItem.id)}

              tabDefs={config.detailTabs} 
              activeTab={detailTab} 
              onTabChange={setDetailTab}
           />
        </div>
      )}

    </div>
  );
}