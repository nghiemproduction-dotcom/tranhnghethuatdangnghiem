"use client";

// 1. Export Config (Trong này đã bao gồm Type NhanSu và Permissions)
export * from './config';

// 2. Export DAL (CHỈ export các hàm API, KHÔNG dùng * để tránh trùng NhanSu)
export { 
    getNhanSuList, 
    createNhanSu, 
    updateNhanSu, 
    deleteNhanSu,
    getDistinctViTri
} from './dal';

// 3. Export Component chính
export { default as NhanSuChucNang } from './NhanSuChucNang';