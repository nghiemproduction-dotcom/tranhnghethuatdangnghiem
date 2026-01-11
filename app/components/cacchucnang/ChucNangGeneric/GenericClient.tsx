// app/components/ChucNangGeneric/GenericClient.tsx
"use client";

import React, { useState } from 'react';
import KhungDanhSach from '../KhungGiaoDienChucNang/KhungDanhSach';
import KhungForm from '../KhungGiaoDienChucNang/KhungForm';
import { GenericTableConfig } from './lib/types';
import { createGenericItem, updateGenericItem, deleteGenericItem } from './actions';
import { usePathname } from 'next/navigation';

interface Props<T> {
  config: GenericTableConfig<T>;
  initialData: T[];
  count: number;
}

export default function GenericClient<T extends { id: string }>({ 
  config, 
  initialData,
  count 
}: Props<T>) {
  const pathname = usePathname(); // Lấy đường dẫn hiện tại để revalidate
  
  // State quản lý UI
  const [dataList, setDataList] = useState<T[]>(initialData);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [formData, setFormData] = useState<Partial<T>>({});
  const [loading, setLoading] = useState(false);

  // --- ACTIONS ---
  
  const handleCreate = () => {
    setEditingItem(null);
    setFormData({});
    setShowForm(true);
  };

  const handleEdit = (item: T) => {
    setEditingItem(item);
    setFormData(item);
    setShowForm(true);
  };

  const handleDelete = async (item: T) => {
    if (!confirm('Bạn có chắc muốn xóa?')) return;
    setLoading(true);
    
    const res = await deleteGenericItem(config.tableName, item.id, pathname);
    
    if (res.success) {
      // Optimistic Update: Xóa ngay trên UI cho mượt
      setDataList(prev => prev.filter(i => i.id !== item.id));
    } else {
      alert(res.error);
    }
    setLoading(false);
  };

  const handleSave = async (data: any) => {
    const res = editingItem
      ? await updateGenericItem(config.tableName, editingItem.id, data, pathname)
      : await createGenericItem(config.tableName, data, pathname);

    if (!res.success) {
      alert(res.error);
      return { success: false };
    }
    return { success: true };
  };

  // --- RENDER ---

  return (
    <>
      <KhungDanhSach<T>
        data={dataList}
        fields={config.fields} // Smart Table tự vẽ
        tabDefs={[{ id: 'all', label: 'Tất cả' }]} // Mặc định 1 tab
        
        onAdd={handleCreate}
        showAddButton={true}
        
        onRowClick={handleEdit} // Click dòng để sửa
        
        // Custom Action Xóa nhanh (nếu cần)
        extraActions={null}
        loading={loading}
      />

      {showForm && (
        <div className="absolute inset-0 z-50 bg-[#050505]">
          <KhungForm
            title={editingItem ? `Cập nhật ${config.entityName}` : `Thêm mới ${config.entityName}`}
            isEditing={!!editingItem}
            onClose={() => setShowForm(false)}
            
            fields={config.fields}
            formData={formData}
            onDataChange={(key, val) => setFormData(prev => ({ ...prev, [key]: val }))}
            
            action={{
              onSave: handleSave,
              onSuccess: () => setShowForm(false) // Server Action tự revalidate, chỉ cần đóng form
            }}
            
            uploadBucket={config.uploadConfig?.bucket}
            // Logic upload ảnh sẽ tích hợp trong KhungForm
          />
        </div>
      )}
    </>
  );
}