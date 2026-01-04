import { Palette, Image as ImageIcon, Tag, User } from "lucide-react";
import {
  ManagerConfig,
  FieldConfig,
  FilterTabConfig,
  TabConfig,
} from "../types";
import {
  getMauThietKeDataAction,
  createMauThietKeAction,
  updateMauThietKeAction,
  deleteMauThietKeAction,
} from "@/app/actions/QuyenHanThietKe";

// 1. CẬP NHẬT INTERFACE (Thêm file_thiet_ke)
export interface MauThietKe {
  id: string;
  mo_ta: string;
  phan_loai: string;
  phan_loai_normalized: string;
  hinh_anh: string;
  // Thêm trường này để lưu danh sách link
  file_thiet_ke?: string[];
  nguoi_tao: string;
  ten_nguoi_tao?: string;
  tao_luc: string;
}

export interface MauThietKePermissions {
  allowView?: boolean;
  allowEdit?: boolean;
  allowDelete?: boolean;
  allowBulk?: boolean;
}

// Các loại phân loại chuẩn hóa
const PHAN_LOAI_OPTIONS = [
  "Tranh chân dung gạo In UV + Vẽ mặt",
  "Tranh phong cảnh Gạo - Tấm - Cám",
  "Đĩa Tranh Gạo",
  "Tranh gạo In UV",
  "Tranh In Để Bàn",
  "Nón lá gạo",
  "Tranh gạo in UV có đồng hồ",
  "Tranh chân dung thủ công 100%",
];

const fields: FieldConfig[] = [
  {
    key: "hinh_anh",
    label: "Hình ảnh mẫu",
    type: "image",
    showInForm: true,
    showInDetail: false,
    showInCard: true,
  },
  {
    key: "mo_ta",
    label: "Mô tả / Tên mẫu",
    type: "text",
    placeholder: "Nhập tên mẫu thiết kế...",
    required: true,
    icon: Palette,
  },
  {
    key: "phan_loai",
    label: "Phân loại",
    type: "select",
    options: PHAN_LOAI_OPTIONS,
    required: true,
    icon: Tag,
  },
  {
    key: "ten_nguoi_tao",
    label: "Người thiết kế",
    type: "readonly",
    icon: User,
    showInForm: false,
  },
];

// 2. CẬP NHẬT BỘ LỌC (Thêm tab lọc File Thiết Kế)
const filterTabs: FilterTabConfig[] = [
  // Tab mới: Lọc những mẫu đã có file
  {
    id: "has_file",
    label: "ĐÃ CÓ FILE",
    filterField: "file_thiet_ke", // Trường này sẽ được xử lý logic riêng ở Controller
  },
  {
    id: "tranhchandunggaoinuv+vemat",
    label: "CHÂN DUNG UV",
    filterField: "phan_loai_normalized",
  },
  {
    id: "tranhphongcanhgao-tam-cam",
    label: "PHONG CẢNH",
    filterField: "phan_loai_normalized",
  },
  { id: "tranhgaoinuv", label: "IN UV", filterField: "phan_loai_normalized" },
  {
    id: "diatranhgao",
    label: "ĐĨA TRANH",
    filterField: "phan_loai_normalized",
  },
  { id: "tranhindeban", label: "ĐỂ BÀN", filterField: "phan_loai_normalized" },
];

const detailTabs: TabConfig[] = [{ id: "thongtin", label: "CHI TIẾT" }];

const dataSource = {
  fetchList: async (
    page: number,
    limit: number,
    search: string,
    filter: string
  ) => {
    const res = await getMauThietKeDataAction(page, limit, search, filter);
    return {
      success: res.success,
      data: res.data as MauThietKe[] | undefined,
      error: res.error,
    };
  },
  create: async (data: Partial<MauThietKe>) => {
    const res = await createMauThietKeAction(data);
    return { success: res.success, data: (res as any)?.data, error: res.error };
  },
  update: async (id: string, data: Partial<MauThietKe>) => {
    const res = await updateMauThietKeAction(id, data);
    return { success: res.success, data: (res as any)?.data, error: res.error };
  },
  delete: async (id: string) => {
    const res = await deleteMauThietKeAction(id);
    return { success: res.success, error: res.error };
  },
};

export function createMauThietKeConfig(
  permissions: MauThietKePermissions = {}
): ManagerConfig<MauThietKe> {
  const {
    allowView = true,
    allowEdit = true,
    allowDelete = false,
    allowBulk = false,
  } = permissions;

  return {
    entityName: "mẫu thiết kế",
    entityNamePlural: "mẫu thiết kế",
    idField: "id",
    fields,
    cardConfig: {
      avatarField: "hinh_anh",
      titleField: "mo_ta",
      subtitleField: "phan_loai",
      infoFields: [{ field: "ten_nguoi_tao", icon: User }],
    },
    filterTabs,
    detailTabs,
    actions: {
      allowView,
      allowEdit,
      allowDelete,
      allowBulkSelect: allowBulk,
      allowBulkDelete: allowBulk && allowDelete,
    },
    dataSource,
    searchFields: ["mo_ta"],
    sortOptions: [
      {
        key: "newest",
        label: "MỚI NHẤT",
        sortFn: (a: MauThietKe, b: MauThietKe) =>
          new Date(b.tao_luc).getTime() - new Date(a.tao_luc).getTime(),
      },
      {
        key: "name",
        label: "TÊN A-Z",
        sortFn: (a: MauThietKe, b: MauThietKe) =>
          a.mo_ta.localeCompare(b.mo_ta),
      },
    ],
    defaultSort: "newest",
    uploadConfig: { bucket: "images", fileNamePrefix: "mau" }, // Đã chuẩn hóa về 'images'
  };
}
