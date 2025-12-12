'use client';
import React from 'react';
import { NhanSu } from './KieuDuLieu';
import { dinhDangTien } from './TienIch';

interface Props {
    data: NhanSu[];
}

export default function NoiDungBang({ data }: Props) {
  return (
    <div className="flex-1 overflow-auto scrollbar-hover p-0">
        <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-[#111] text-xs uppercase font-medium text-gray-500 sticky top-0 z-10 shadow-sm">
                <tr>
                    <th className="px-6 py-4">Nhân viên</th>
                    <th className="px-6 py-4">Vị trí</th>
                    <th className="px-6 py-4">Liên hệ</th>
                    <th className="px-6 py-4 text-right">Lương / Công</th>
                    <th className="px-6 py-4 text-right">Thưởng</th>
                    <th className="px-6 py-4">Trạng thái</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
                {data.map((nv) => (
                    <tr key={nv.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                            <div className="flex flex-col">
                                <span className="font-medium text-white text-base">{nv.ten_day_du}</span>
                                <span className="text-xs text-gray-500">{nv.ten_hien_thi}</span>
                                <div className="mt-1 text-xs text-blue-400/80">{nv.ngan_hang} • {nv.so_tai_khoan}</div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                                <span className={`inline-flex w-fit items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                    ${nv.vi_tri === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 
                                    nv.vi_tri === 'quanly' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                                    nv.vi_tri === 'sales' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                    'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                                    {nv.vi_tri.toUpperCase()}
                                </span>
                                <span className="text-xs text-gray-600 pl-1">{nv.hop_dong}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-gray-300">{nv.so_dien_thoai}</span>
                                <span className="text-xs text-gray-500">{nv.email}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex flex-col gap-1">
                                {nv.luong_thang > 0 && <span className="text-white font-medium">{dinhDangTien(nv.luong_thang)}</span>}
                                {nv.tien_cong > 0 && <span className="text-xs text-green-400">+ {dinhDangTien(nv.tien_cong)} /sp</span>}
                                {nv.luong_thang === 0 && nv.tien_cong === 0 && <span className="text-xs text-gray-600">--</span>}
                            </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                            {nv.thuong_doanh_thu > 0 ? <span className="text-yellow-500 font-medium">{dinhDangTien(nv.thuong_doanh_thu)}</span> : <span className="text-gray-600">-</span>}
                        </td>
                        <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium
                                ${nv.trang_thai === 'Đang hoạt động' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${nv.trang_thai === 'Đang hoạt động' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                {nv.trang_thai}
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  );
}