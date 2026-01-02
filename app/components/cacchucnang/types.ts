/**
 * Types dùng chung cho các config chức năng
 * Định nghĩa cấu trúc data cho danh sách, chi tiết, form
 */

import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

// Cấu hình 1 field hiển thị
export interface FieldConfig {
    key: string;
    label: string;
    icon?: LucideIcon;
    render?: (value: any, item: any) => ReactNode;
    editable?: boolean;
    type?: 'text' | 'number' | 'email' | 'tel' | 'select' | 'textarea' | 'date' | 'image' | 'select-add' | 'phone' | 'money' | 'readonly' | 'percent';
    options?: string[] | { value: string; label: string }[];
    optionsLoader?: () => Promise<string[]>;
    required?: boolean;
    placeholder?: string;
    colSpan?: number;
    showInForm?: boolean;
    showInDetail?: boolean;
    showInCard?: boolean;
    highlight?: boolean;
    computeFrom?: string;
    computeFn?: (value: any) => any;
    maxValue?: number;
}

// Cấu hình 1 tab lọc (trong danh sách)
export interface FilterTabConfig {
    id?: string;
    key?: string;
    label: string;
    filter?: (item: any) => boolean;
    filterField?: string;
    color?: string;
}

// Cấu hình 1 tab chi tiết
export interface TabConfig {
    id?: string;
    key?: string;
    label: string;
    icon?: LucideIcon;
    content?: ReactNode | ((item: any) => ReactNode);
    searchable?: boolean;
    sortable?: boolean;
    sortOptions?: { key: string; label: string }[];
    showAddButton?: boolean;
}

// Cấu hình sort options
export interface SortOption<T = any> {
    key: string;
    label: string;
    sortFn: (a: T, b: T) => number;
}

// Cấu hình chính cho Manager
export interface ManagerConfig<T = any> {
    // Entity info
    entityName: string;
    entityNamePlural: string;
    
    // Table/query
    tableName?: string;
    idField?: string;
    
    // Card display
    getCardTitle?: (item: T) => string;
    getCardSubtitle?: (item: T) => string;
    getCardAvatar?: (item: T) => string | null;
    getCardBadge?: (item: T) => { text: string; color: string } | null;
    
    // Card config
    cardConfig?: {
        titleField?: string;
        subtitleField?: string;
        avatarField?: string;
        badgeField?: string;
        getBadgeColor?: (value: string) => string;
        infoFields?: { field: string; icon?: LucideIcon }[];
    };
    
    // Fields config
    fields: FieldConfig[];
    
    // Tabs config  
    filterTabs: FilterTabConfig[];
    detailTabs: TabConfig[];
    
    // List config
    listConfig?: {
        searchKeys: string[];
        sortOptions: SortOption<T>[];
        defaultSort: string;
    };
    
    // Search fields (for quick search)
    searchFields?: string[];
    
    // Sort options (top level alternative to listConfig.sortOptions)
    sortOptions?: SortOption<T>[];
    
    // Default sort (top level alternative)
    defaultSort?: string;
    
    // Upload config for images
    uploadConfig?: {
        bucket: string;
        fileNamePrefix?: string;
    };
    
    // Permissions
    permissions?: {
        canCreate?: boolean;
        canEdit?: boolean;
        canDelete?: boolean;
        canBulkDelete?: boolean;
    };
    
    // Actions
    actions?: {
        allowView?: boolean;
        allowEdit?: boolean;
        allowDelete?: boolean;
        allowBulkSelect?: boolean;
        allowBulkDelete?: boolean;
        onCardClick?: (item: T) => void;
        onEdit?: (item: T) => void;
        onDelete?: (item: T) => void;
        onBulkDelete?: (items: T[]) => void;
        onCreate?: () => void;
    };
    
    // Data source (flexible để phù hợp với nhiều cách implement)
    dataSource?: {
        fetchList?: (page: number, limit: number, search: string, filter: string) => Promise<{ success: boolean; data: T[] | undefined; error: any }>;
        fetch?: () => Promise<T[]>;
        create?: (item: Partial<T>) => Promise<{ success: boolean; data: T; error: any }>;
        update?: (id: string, item: Partial<T>) => Promise<{ success: boolean; data: T; error: any }>;
        delete?: (id: string) => Promise<{ success: boolean; error: any }>;
    };
}
