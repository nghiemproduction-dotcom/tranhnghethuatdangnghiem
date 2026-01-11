import { FieldConfig } from "@/app/types/core";
import { GenericDisplayConfig } from "../GenericChucNang/GenericList";
import TabThanhTich from './TabThanhTich'


export const NHANSU3_FIELDS: FieldConfig[] = [
  { key: "id", label: "Id", type: "text", showInList: false, showInForm: false,  },
  { key: "tao_luc", label: "Taoluc", type: "text", showInList: true, showInForm: false,  },
  { key: "ho_ten", label: "Hoten", type: "text", showInList: true, showInForm: true,  },
  { key: "so_dien_thoai", label: "Sodienthoai", type: "text", showInList: true, showInForm: true,  },
  { key: "email", label: "Email", type: "text", showInList: true, showInForm: true,  },
  { key: "phan_loai", label: "Phanloai", type: "text", showInList: true, showInForm: true,  },
  { key: "madangnhap", label: "Madangnhap", type: "text", showInList: true, showInForm: true,  },
  { key: "hinh_anh", label: "Hinhanh", type: "image", showInList: true, showInForm: true,  },
  { key: "trang_thai", label: "Trangthai", type: "select", showInList: true, showInForm: true,  },
  { key: "ngan_hang", label: "Nganhang", type: "text", showInList: true, showInForm: true,  },
  { key: "so_tai_khoan", label: "Sotaikhoan", type: "text", showInList: true, showInForm: true,  },
  { key: "diem_cong_hien", label: "Diemconghien", type: "number", showInList: true, showInForm: true,  },
  { key: "cap_bac_game", label: "Capbacgame", type: "text", showInList: true, showInForm: true,  },
];

export const NHANSU3_DISPLAY_CONFIG: GenericDisplayConfig & { storageBucket?: string } = {
    colTitle: 'ho_ten',
    colSubTitle: 'so_dien_thoai',
    colImage: 'hinh_anh',
    tabFilterKey: 'trang_thai',
    storageBucket: 'avatar',
    gamification: { hasRank: true, rankKey: 'cap_bac_game', scoreKey: 'diem_cong_hien' },
};

export const NHANSU3_TABS = (item: any) => [
  { id: 'TabThanhTich', label: 'THÀNH TÍCH', icon: null, content: <TabThanhTich item={item} /> },

];