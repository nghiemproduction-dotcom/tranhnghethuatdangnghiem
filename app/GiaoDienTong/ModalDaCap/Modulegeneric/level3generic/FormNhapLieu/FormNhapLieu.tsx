'use client';
import React from 'react';
import { ModuleConfig, CotHienThi } from '@/app/GiaoDienTong/DashboardBuilder/KieuDuLieuModule';
import FormGeneric from './FormGeneric';

interface Props {
    config: ModuleConfig;
    formData: any;          
    onSubmit: () => void;   
    onCancel: () => void;   
    isCreateMode: boolean; 
    setFormData?: any;
    loading?: boolean;
    columns?: CotHienThi[];
}

export default function FormNhapLieu(props: Props) {
    // 🟢 100% GENERIC: Mọi bảng đều dùng chung FormGeneric
    // Map props cũ sang props mới
    return (
        <FormGeneric 
            config={props.config}
            initialData={props.formData} 
            onSuccess={props.onSubmit}
            onCancel={props.onCancel}
            isCreateMode={props.isCreateMode}
        />
    );
}