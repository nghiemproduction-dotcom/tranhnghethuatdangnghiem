// app/components/cacchucnang/ChucNangGeneric/lib/types.ts

import { FieldConfig } from "@/app/types/core";

export interface GenericTableConfig<T = any> {
  tableName: string;        // Tên bảng trong DB (VD: 'nhan_su')
  entityName: string;       // Tên hiển thị (VD: 'Nhân sự')
  
  // Cấu hình cột hiển thị & Form
  fields: FieldConfig[];
  
  // Hàm chuyển đổi dữ liệu (DTO)
  dtoMapper?: (row: any) => T;
  
  // Quyền hạn (Optional)
  permissions?: {
    canCreate?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
  };

  // Cấu hình upload (nếu có ảnh)
  uploadConfig?: {
    bucket: string;
    fileNamePrefix?: string;
  };
}

export interface GenericResponse<T> {
  data: T[];
  count: number;
  error?: string | null;
}