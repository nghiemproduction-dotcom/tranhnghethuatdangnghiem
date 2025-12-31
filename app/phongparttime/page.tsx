'use client';

import React, { useState, useEffect } from 'react';
import KhungTrangChuan from '@/app/components/KhungTrangChuan';
import BanLamViec from '@/app/phongparttime/BanLamViec'; // 🟢 Import component mới

// 🟢 GIỮ INTERFACE CHO PROPS
interface Props {
    isChildComponent?: boolean;
}

export default function PhongPartTime({ isChildComponent = false }: Props) {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isChildComponent) {
            setLoading(false);
            setUser({ ho_ten: 'Nhân viên' }); 
            return;
        }

        const userInfo = localStorage.getItem('USER_INFO');
        if (userInfo) {
            try {
                const parsedUser = JSON.parse(userInfo);
                setUser(parsedUser);
                setLoading(false);
            } catch (e) { setLoading(false); }
        } else { setLoading(false); }
    }, [isChildComponent]);

    if (loading && !isChildComponent) {
        return <div className="min-h-screen bg-black flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C69C6D]"></div></div>;
    }

    // 🟢 RENDER NỘI DUNG GỌN GÀNG HƠN
    if (isChildComponent) {
        return (
            <div className="w-full h-full overflow-y-auto custom-scrollbar p-6">
                <BanLamViec />
            </div>
        );
    }

    if (!user) return null;

    return (
        <KhungTrangChuan nguoiDung={user} loiChao={`Xin chào, ${user.ho_ten}`}>
            <div className="w-full h-full overflow-y-auto custom-scrollbar">
                <BanLamViec />
            </div>
        </KhungTrangChuan>
    );
}