'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FieldConfig } from '@/app/types/core'
import GenericList, { GenericDisplayConfig } from './GenericList' 
import GenericForm from './GenericForm'
import GenericDetail, { GenericDetailConfig, DetailTab } from './GenericDetail' 
import { genericCreate, genericUpdate, genericDelete } from '@/app/phonglamviec/generic-actions'

interface GenericManagerProps {
  tableName: string        
  fields: FieldConfig[]    
  initialData: any[]       
  title: string            
  basePath: string 
  onClose: () => void
  
  // Cấu hình hiển thị mở rộng
  displayConfig?: GenericDisplayConfig & GenericDetailConfig 

  // Hàm custom tabs cho màn hình chi tiết
  getAdditionalTabs?: (item: any) => DetailTab[] 
}

export default function GenericManager({ 
  tableName, fields, initialData = [], title, basePath, onClose,
  displayConfig,
  getAdditionalTabs 
}: GenericManagerProps) {
  
  const router = useRouter(); // Hook để refresh dữ liệu
  const [view, setView] = useState<'list' | 'form' | 'detail'>('list')
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)

  // -- HANDLERS: Navigation --
  const handleCreate = () => { setSelectedItem({}); setIsEditing(false); setView('form'); }
  const handleEdit = (item: any) => { setSelectedItem(item); setIsEditing(true); setView('form'); }
  const handleViewDetail = (item: any) => { setSelectedItem(item); setView('detail'); }

  // -- HANDLER: Lưu (Create/Update) --
  const handleSave = async (formData: any) => {
    let res
    try {
        if (isEditing && selectedItem?.id) {
          res = await genericUpdate(tableName, selectedItem.id, formData, basePath)
        } else {
          res = await genericCreate(tableName, formData, basePath)
        }
        
        if (!res.success) { 
            alert(res.message); 
            return 
        }
        
        // Refresh lại dữ liệu từ server component và quay về list
        router.refresh(); 
        setView('list')
    } catch (error: any) {
        alert("Lỗi hệ thống: " + error.message);
    }
  }

  // -- HANDLER: Xóa (Delete One) --
  const handleDelete = async (id: string) => {
      if (!confirm("⚠️ CẢNH BÁO: Bạn có chắc chắn muốn xóa dữ liệu này?\nHành động này không thể hoàn tác.")) return;
      
      try {
          const res = await genericDelete(tableName, id, basePath);
          if (res.success) {
              // alert("Đã xóa thành công!"); // Có thể bỏ alert nếu muốn trải nghiệm mượt hơn
              router.refresh();
          } else {
              alert("Lỗi khi xóa: " + res.message);
          }
      } catch (error: any) {
          alert("Lỗi hệ thống: " + error.message);
      }
  }

  // -- HANDLER: Xóa nhiều (Bulk Delete) --
  const handleBulkDelete = async (ids: string[]) => {
      if (!confirm(`⚠️ CẢNH BÁO: Bạn sắp xóa vĩnh viễn ${ids.length} mục.\nTiếp tục?`)) return;

      try {
          // Gọi vòng lặp xóa (Lý tưởng nhất là Backend hỗ trợ API deleteBulk, nhưng tạm thời dùng loop)
          await Promise.all(ids.map(id => genericDelete(tableName, id, basePath)));
          
          alert(`Đã xóa ${ids.length} mục thành công!`);
          router.refresh();
      } catch (e: any) {
          alert("Có lỗi xảy ra trong quá trình xóa: " + e.message);
      }
  }

  // -- RENDER --
  return (
    <div className="w-full h-full bg-[#050505] text-white">
      
      {view === 'list' && (
        <GenericList 
          data={initialData} 
          fields={fields} 
          config={displayConfig} 
          tableName={tableName} // [REALTIME] Truyền tableName xuống để kích hoạt lắng nghe

          onView={handleViewDetail}
          onEdit={handleEdit}
          onDelete={handleDelete}         // Đã kết nối hàm xóa
          onBulkDelete={handleBulkDelete} // Đã kết nối hàm xóa nhiều
          onCloseParent={onClose}
          onCreate={handleCreate}
        />
      )}

      {view === 'form' && (
        <GenericForm 
          fields={fields}
          initialData={selectedItem}
          isEditing={isEditing}
          onSave={handleSave}
          onCancel={() => setView('list')}
        />
      )}

      {view === 'detail' && (
        <GenericDetail 
          item={selectedItem}
          fields={fields}
          tableName={tableName}
          
          additionalTabs={getAdditionalTabs ? getAdditionalTabs(selectedItem) : []}
          config={displayConfig}

          onEdit={() => handleEdit(selectedItem)}
          onBack={() => setView('list')}
        />
      )}
    </div>
  )
}