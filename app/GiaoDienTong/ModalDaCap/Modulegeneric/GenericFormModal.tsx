'use client';
import React from 'react';
import { X } from 'lucide-react';
import { ModuleConfig } from '@/app/GiaoDienTong/DashboardBuilder/KieuDuLieuModule';
import GenericForm from './GenericForm';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (data: any) => void;
    config: ModuleConfig;
    initialData?: any;
    isCreateMode: boolean;
    userRole?: string;
    userEmail?: string;
    parentTitle?: string;
}

export default function GenericFormModal({
    isOpen,
    onClose,
    onSuccess,
    config,
    initialData,
    isCreateMode,
    userRole = 'user',
    userEmail = '',
    parentTitle = ''
}: Props) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[4000] bg-black/80 backdrop-blur-sm flex flex-col shadow-none animate-in fade-in zoom-in-95 duration-300 overflow-hidden pointer-events-none">
            <div className="w-full h-full pointer-events-auto flex flex-col">
                <div className="flex-1 relative w-full h-[100dvh] overflow-hidden">
                    <div className="absolute inset-0 bg-black/80 pointer-events-auto backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
                    <div className="relative pointer-events-auto overflow-hidden flex flex-col md:flex-row bg-[#0f0c0b] w-full h-full animate-in zoom-in-95 duration-300">

                        <div className="flex-1 flex flex-col bg-black/40 backdrop-blur-md relative overflow-hidden min-h-0">
                            <div className="flex-1 overflow-y-auto custom-scroll p-6 bg-[#161210]">
                                <GenericForm
                                    config={config}
                                    initialData={initialData}
                                    onSubmit={(data) => {
                                        onSuccess(data);
                                        onClose();
                                    }}
                                    onCancel={onClose}
                                    isCreateMode={isCreateMode}
                                    userRole={userRole}
                                    userEmail={userEmail}
                                    parentTitle={parentTitle}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}