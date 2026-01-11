'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import GenericList, { GenericDisplayConfig } from './GenericList'
import { FieldConfig } from '@/app/types/core'

interface GenericRelationTabProps {
  tableName: string;       // Tên bảng con (vd: nhan_su)
  foreignKey: string;      // Cột khóa ngoại (vd: phong_ban_id)
  parentId: string;        // ID của cha (vd: ID của phòng ban hiện tại)
  fields: FieldConfig[];   // Cấu hình trường của bảng con
  displayConfig: GenericDisplayConfig; // Cấu hình hiển thị của bảng con
}

export default function GenericRelationTab({ 
  tableName, foreignKey, parentId, fields, displayConfig 
}: GenericRelationTabProps) {
  
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      if (!parentId || !tableName || !foreignKey) return;
      
      setLoading(true);
      // Fetch dữ liệu bảng con có foreignKey = parentId
      const { data: result, error } = await supabase
        .from(tableName)
        .select('*')
        .eq(foreignKey, parentId)
        .order('created_at', { ascending: false });

      if (!error && result) {
        setData(result);
      } else {
        console.error("Relation Fetch Error:", error);
      }
      setLoading(false);
    };

    fetchData();
  }, [tableName, foreignKey, parentId]);

  if (loading) return <div className="p-8 text-center text-gray-500 text-xs uppercase animate-pulse">Đang tải dữ liệu liên kết...</div>;

  return (
    <div className="h-[600px] w-full bg-[#0a0a0a] border border-white/5 rounded-lg overflow-hidden">
        <GenericList 
            data={data}
            fields={fields}
            config={displayConfig}
            // Tắt các tính năng sửa/xóa sâu để tránh phức tạp, chỉ cho xem
            onView={() => {}} 
            onEdit={() => {}} 
            onDelete={() => {}} 
            onCloseParent={() => {}} 
            onCreate={() => {}}
        />
    </div>
  )
}