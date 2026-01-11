import { ReactNode, ElementType } from "react";

// 1. FIELD TYPES (Cho Form & Hiển thị)
export type FieldType = 
  | 'text' | 'number' | 'email' | 'phone' 
  | 'money' | 'date' | 'select' | 'image' | 'boolean' | 'textarea'
  | 'select-add' | 'readonly' | 'percent' | 'tel';

export interface FieldOption {
  value: string | number;
  label: string;
  color?: string; 
}

export interface FieldConfig {
  key: string;            
  label: string;          
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  options?: FieldOption[]; 
  optionsLoader?: () => Promise<string[] | any[]>; 
  colSpan?: 1 | 2;         
  showInList?: boolean;
  showInForm?: boolean;
  showInDetail?: boolean;
  computeFrom?: string;
  computeFn?: (val: any) => any;
  icon?: any;
  highlight?: boolean;
  maxValue?: number;
}

// 2. LIST TYPES (Cho KhungDanhSach)
export interface ListTabDef {
  id: string;
  label: string;
  filterField?: string; 
  matchValue?: any;     
  count?: number; 
}

// 3. DETAIL TYPES (Cho KhungChiTiet)
export interface DetailTabDef {
  id: string;
  label: string;
  icon?: ElementType; // Dùng ElementType cho icon
  checkFields?: string[]; 
  count?: number; 
  searchable?: boolean;
  sortable?: boolean;
  sortOptions?: { key: string; label: string }[];
  showAddButton?: boolean;
}