| ?column? |
| -------- |

| # DATABASE SCHEMA DOCUMENTATION

## Table: bang_luong

| Column | Type | Nullable | Default | Extra |\n|---|---|---|---|---|\n| id | uuid | NO | gen_random_uuid()... | 🔑 PK |
| nhan_su_id | uuid | YES | - | |
| thang | integer | YES | - | |
| nam | integer | YES | - | |
| tong_thu_nhap | numeric | YES | 0... | |
| trang_thai | text | YES | 'chua_chot'::text... | |
| created_at | timestamp with time zone | YES | now()... | |

> Constraints:

- CHECK: 27491_54977_1_not_null

## Table: cac_buoc_mau

| Column | Type | Nullable | Default | Extra |\n|---|---|---|---|---|\n| id | uuid | NO | gen_random_uuid()... | 🔑 PK |
| quy_trinh_id | uuid | YES | - | 🔗 FK -> quy_trinh_mau.id |
| ten_buoc | text | YES | - | |
| thu_tu | integer | YES | - | |
| thoi_gian_chuan | integer | YES | - | |
| huong_dan_ky_thuat | text | YES | - | |
| video_huong_dan | text | YES | - | |
| diem_thuong | integer | YES | 10... | |

> Constraints:

- FOREIGN KEY: cac_buoc_mau_quy_trinh_id_fkey
- CHECK: 27491_53195_1_not_null

## Table: cau_hinh_hop_qua

| Column | Type | Nullable | Default | Extra |\n|---|---|---|---|---|\n| id | text | NO | - | 🔑 PK |
| ten_qua | text | YES | - | |
| ti_le_roi | double precision | YES | - | |
| loai_qua | text | YES | - | |
| gia_tri | numeric | YES | - | |
| hinh_anh | text | YES | - | |

> Constraints:

- CHECK: 27491_53393_1_not_null

## Table: dinh_muc

| Column | Type | Nullable | Default | Extra |\n|---|---|---|---|---|\n| id | uuid | NO | gen_random_uuid()... | 🔑 PK |
| thanh_pham_id | uuid | YES | - | 🔗 FK -> vat_tu.id |
| nguyen_lieu_id | uuid | YES | - | 🔗 FK -> vat_tu.id |
| so_luong_can | numeric | YES | - | |

> Constraints:

- FOREIGN KEY: dinh_muc_nguyen_lieu_id_fkey
- FOREIGN KEY: dinh_muc_thanh_pham_id_fkey
- CHECK: 27491_53209_1_not_null

## Table: don_hang

| Column | Type | Nullable | Default | Extra |\n|---|---|---|---|---|\n| id | uuid | NO | gen_random_uuid()... | 🔑 PK |
| organization_id | uuid | YES | - | |
| ma_don | text | YES | - | |
| khach_hang_id | uuid | YES | - | 🔗 FK -> khach_hang.id |
| sales_phu_trach_id | uuid | YES | - | 🔗 FK -> nhan_su.id |
| nguoi_tao_id | uuid | YES | - | 🔗 FK -> nhan_su.id |
| trang_thai | text | YES | 'moi'::text... | |
| tong_tien | numeric | YES | 0... | |
| da_thanh_toan | numeric | YES | 0... | |
| kenh_ban_hang | text | YES | - | |
| ghi_chu | text | YES | - | |
| thong_tin_giao_hang | jsonb | YES | - | |
| tao_luc | timestamp with time zone | YES | now()... | |
| cap_nhat_luc | timestamp with time zone | YES | now()... | |

> Constraints:

- FOREIGN KEY: don_hang_khach_hang_id_fkey
- UNIQUE: don_hang_ma_don_key
- FOREIGN KEY: don_hang_nguoi_tao_id_fkey
- FOREIGN KEY: don_hang_sales_phu_trach_id_fkey
- CHECK: 27491_53227_1_not_null

## Table: don_hang_chi_tiet

| Column | Type | Nullable | Default | Extra |\n|---|---|---|---|---|\n| id | uuid | NO | gen_random_uuid()... | 🔑 PK |
| don_hang_id | uuid | YES | - | 🔗 FK -> don_hang.id |
| vat_tu_id | uuid | YES | - | 🔗 FK -> vat_tu.id |
| ten_item_hien_thi | text | YES | - | |
| so_luong | integer | YES | - | |
| don_gia | numeric | YES | - | |
| thanh_tien | numeric | YES | - | |
| quy_trinh_id | uuid | YES | - | 🔗 FK -> quy_trinh_mau.id |
| yeu_cau_rieng | jsonb | YES | - | |

> Constraints:

- FOREIGN KEY: don_hang_chi_tiet_don_hang_id_fkey
- FOREIGN KEY: don_hang_chi_tiet_quy_trinh_id_fkey
- FOREIGN KEY: don_hang_chi_tiet_vat_tu_id_fkey
- CHECK: 27491_53257_1_not_null

## Table: khach_hang

| Column | Type | Nullable | Default | Extra |\n|---|---|---|---|---|\n| id | uuid | NO | gen_random_uuid()... | 🔑 PK |
| ho_ten | text | YES | - | |
| so_dien_thoai | text | YES | - | |
| nguoi_tao | uuid | YES | - | 🔗 FK -> nhan_su.id |
| tao_luc | timestamp with time zone | YES | now()... | |
| email | text | YES | - | |
| phan_loai | text | YES | - | |
| phan_loai_normalized | text | YES | - | |
| hinh_anh | text | YES | - | |
| dia_chi | text | YES | - | |
| organization_id | uuid | YES | '00000000-0000-0000-... | |
| art_coin | integer | YES | 0... | |
| hang_thanh_vien | text | YES | 'Newbie'::text... | |
| tong_chi_tieu_tich_luy | numeric | YES | 0... | |
| nguoi_gioi_thieu_id | uuid | YES | - | 🔗 FK -> nhan_su.id |
| metadata_so_thich | jsonb | YES | '{}'::jsonb... | |
| vi_blockchain | text | YES | - | |

> Constraints:

- FOREIGN KEY: fk_khachhang_nhansu_chinh
- FOREIGN KEY: khach_hang_nguoi_gioi_thieu_id_fkey
- CHECK: 27491_43793_1_not_null

## Table: lenh_san_xuat

| Column | Type | Nullable | Default | Extra |\n|---|---|---|---|---|\n| id | uuid | NO | gen_random_uuid()... | 🔑 PK |
| organization_id | uuid | YES | - | |
| ma_lenh | text | YES | - | |
| don_hang_chi_tiet_id | uuid | YES | - | 🔗 FK -> don_hang_chi_tiet.id |
| quy_trinh_id | uuid | YES | - | 🔗 FK -> quy_trinh_mau.id |
| trang_thai | text | YES | 'moi'::text... | |
| tien_do | integer | YES | 0... | |
| nguoi_phu_trach | uuid | YES | - | 🔗 FK -> nhan_su.id |
| ma_qr_san_pham | text | YES | - | |
| bat_dau_luc | timestamp with time zone | YES | - | |
| ket_thuc_luc | timestamp with time zone | YES | - | |

> Constraints:

- FOREIGN KEY: lenh_san_xuat_don_hang_chi_tiet_id_fkey
- UNIQUE: lenh_san_xuat_ma_lenh_key
- FOREIGN KEY: lenh_san_xuat_nguoi_phu_trach_fkey
- FOREIGN KEY: lenh_san_xuat_quy_trinh_id_fkey
- CHECK: 27491_53280_1_not_null

## Table: lich_su_trung_thuong

| Column | Type | Nullable | Default | Extra |\n|---|---|---|---|---|\n| id | uuid | NO | gen_random_uuid()... | 🔑 PK |
| nhan_su_id | uuid | YES | - | 🔗 FK -> nhan_su.id |
| qua_id | text | YES | - | 🔗 FK -> cau_hinh_hop_qua.id |
| ngay_trung | timestamp with time zone | YES | now()... | |

> Constraints:

- FOREIGN KEY: lich_su_trung_thuong_nhan_su_id_fkey
- FOREIGN KEY: lich_su_trung_thuong_qua_id_fkey
- CHECK: 27491_53400_1_not_null

## Table: lich_su_vi_pham

| Column | Type | Nullable | Default | Extra |\n|---|---|---|---|---|\n| id | uuid | NO | gen_random_uuid()... | 🔑 PK |
| nhan_su_id | uuid | YES | - | 🔗 FK -> nhan_su.id |
| loai | text | YES | - | |
| ly_do | text | YES | - | |
| so_tien | numeric | YES | - | |
| ngay_ghi_nhan | timestamp with time zone | YES | now()... | |

> Constraints:

- FOREIGN KEY: lich_su_vi_pham_nhan_su_id_fkey
- CHECK: 27491_53366_1_not_null

## Table: mau_thiet_ke

| Column | Type | Nullable | Default | Extra |\n|---|---|---|---|---|\n| id | uuid | NO | gen_random_uuid()... | 🔑 PK |
| mo_ta | text | YES | - | |
| phan_loai | text | YES | - | |
| phan_loai_normalized | text | YES | - | |
| hinh_anh | text | YES | - | |
| nguoi_tao | uuid | YES | - | 🔗 FK -> nhan_su.id |
| tao_luc | timestamp with time zone | YES | now()... | |
| file_thiet_ke | jsonb | YES | '[]'::jsonb... | |

> Constraints:

- FOREIGN KEY: mau_thiet_ke_nguoi_tao_fkey
- CHECK: 27491_55088_1_not_null

## Table: nhan_su

| Column | Type | Nullable | Default | Extra |\n|---|---|---|---|---|\n| id | uuid | NO | gen_random_uuid()... | 🔑 PK |
| vi_tri | text | YES | - | |
| email | text | YES | - | |
| so_dien_thoai | text | YES | - | |
| so_tai_khoan | text | YES | - | |
| ngan_hang | text | YES | - | |
| luong_thang | bigint | YES | 0... | |
| thuong_doanh_thu | bigint | YES | 0... | |
| hinh_anh | text | YES | - | |
| ho_ten | text | YES | - | |
| luong_theo_gio | numeric | YES | - | |
| nguoi_tao | uuid | YES | auth.uid()... | 🔗 FK -> nhan_su.id |
| tao_luc | timestamp with time zone | YES | now()... | |
| trang_thai | text | YES | 'Đang hoạt động'::te... | |
| vi_tri_normalized | text | YES | - | |
| organization_id | uuid | YES | '00000000-0000-0000-... | |
| ma_qr_dinh_danh | text | YES | - | |
| diem_cong_hien | integer | YES | 0... | |
| cap_bac_game | text | YES | 'Học việc'::text... | |
| so_sao_tin_nhiem | numeric | YES | 5.0... | |
| metadata_hanh_vi | jsonb | YES | '{}'::jsonb... | |
| luong_co_ban | numeric | YES | 0... | |

> Constraints:

- FOREIGN KEY: fk_nhan_su_nguoi_tao
- UNIQUE: nhan_su_email_unique
- UNIQUE: nhan_su_ma_qr_dinh_danh_key
- CHECK: 27491_27601_1_not_null

## Table: nhat_ky_san_xuat

| Column | Type | Nullable | Default | Extra |\n|---|---|---|---|---|\n| id | uuid | NO | gen_random_uuid()... | 🔑 PK |
| lenh_san_xuat_id | uuid | YES | - | 🔗 FK -> lenh_san_xuat.id |
| buoc_mau_id | uuid | YES | - | 🔗 FK -> cac_buoc_mau.id |
| nhan_su_thuc_hien | uuid | YES | - | 🔗 FK -> nhan_su.id |
| thoi_gian_bat_dau | timestamp with time zone | YES | - | |
| thoi_gian_ket_thuc | timestamp with time zone | YES | - | |
| ket_qua | text | YES | - | |
| so_luong_hoan_thanh | integer | YES | - | |
| anh_thanh_pham | text | YES | - | |
| diem_thuong_nhan_duoc | integer | YES | 0... | |
| qua_tang_random | jsonb | YES | - | |

> Constraints:

- FOREIGN KEY: nhat_ky_san_xuat_buoc_mau_id_fkey
- FOREIGN KEY: nhat_ky_san_xuat_lenh_san_xuat_id_fkey
- FOREIGN KEY: nhat_ky_san_xuat_nhan_su_thuc_hien_fkey
- CHECK: 27491_53307_1_not_null

## Table: nhom_vat_tu

| Column | Type | Nullable | Default | Extra |\n|---|---|---|---|---|\n| id | uuid | NO | gen_random_uuid()... | 🔑 PK |
| ten_nhom | text | YES | - | |
| organization_id | uuid | YES | - | |

> Constraints:

- CHECK: 27491_53159_1_not_null

## Table: notifications

| Column | Type | Nullable | Default | Extra |\n|---|---|---|---|---|\n| id | uuid | NO | gen_random_uuid()... | 🔑 PK |
| user_id | uuid | NO | - | |
| type | text | NO | - | |
| category | text | NO | - | |
| title | text | NO | - | |
| message | text | YES | - | |
| from_user_id | uuid | YES | - | |
| from_user_name | text | YES | - | |
| from_user_avatar | text | YES | - | |
| related_id | text | YES | - | |
| action_url | text | YES | - | |
| is_read | boolean | YES | false... | |
| created_at | timestamp with time zone | YES | now()... | |
| updated_at | timestamp with time zone | YES | now()... | |

> Constraints:

- CHECK: 27491_54947_1_not_null
- CHECK: 27491_54947_2_not_null
- CHECK: 27491_54947_3_not_null
- CHECK: 27491_54947_4_not_null
- CHECK: 27491_54947_5_not_null

## Table: push_subscriptions

| Column | Type | Nullable | Default | Extra |\n|---|---|---|---|---|\n| id | uuid | NO | gen_random_uuid()... | 🔑 PK |
| user_id | uuid | NO | - | |
| endpoint | text | NO | - | |
| p256dh | text | NO | - | |
| auth | text | NO | - | |
| user_agent | text | YES | - | |
| created_at | timestamp with time zone | YES | now()... | |

> Constraints:

- CHECK: 27491_54968_1_not_null
- CHECK: 27491_54968_2_not_null
- CHECK: 27491_54968_3_not_null
- CHECK: 27491_54968_4_not_null
- CHECK: 27491_54968_5_not_null

## Table: quy_trinh_mau

| Column | Type | Nullable | Default | Extra |\n|---|---|---|---|---|\n| id | uuid | NO | gen_random_uuid()... | 🔑 PK |
| ten_quy_trinh | text | YES | - | |
| loai_ap_dung | text | YES | - | |
| organization_id | uuid | YES | - | |

> Constraints:

- CHECK: 27491_53187_1_not_null

## Table: routing_permissions

| Column | Type | Nullable | Default | Extra |\n|---|---|---|---|---|\n| id | integer | NO | nextval('routing_per... | 🔑 PK |
| user_type | character varying | NO | - | |
| role_normalized | character varying | NO | - | |
| allowed_routes | ARRAY | NO | - | |
| default_route | character varying | NO | - | |
| created_at | timestamp with time zone | YES | now()... | |

> Constraints:

- CHECK: 27491_49689_1_not_null
- CHECK: 27491_49689_2_not_null
- CHECK: 27491_49689_3_not_null
- CHECK: 27491_49689_4_not_null
- CHECK: 27491_49689_5_not_null

## Table: slider_data

| Column | Type | Nullable | Default | Extra |\n|---|---|---|---|---|\n| id | bigint | NO | - | 🔑 PK |
| loai_slider | text | NO | - | |
| tieu_de | text | YES | - | |
| mo_ta | text | YES | - | |
| hinh_anh | text | YES | - | |
| thu_tu | integer | YES | 0... | |
| tao_luc | timestamp with time zone | YES | now()... | |

> Constraints:

- CHECK: 27491_54911_1_not_null
- CHECK: 27491_54911_2_not_null

## Table: so_cai_tai_chinh

| Column | Type | Nullable | Default | Extra |\n|---|---|---|---|---|\n| id | uuid | NO | gen_random_uuid()... | 🔑 PK |
| organization_id | uuid | YES | - | |
| loai_giao_dich | text | YES | - | |
| so_tien | numeric | YES | - | |
| mo_ta | text | YES | - | |
| tham_chieu_id | uuid | YES | - | |
| hinh_anh_chung_tu | text | YES | - | |
| nguoi_thuc_hien | uuid | YES | - | 🔗 FK -> nhan_su.id |
| tao_luc | timestamp with time zone | YES | now()... | |

> Constraints:

- FOREIGN KEY: so_cai_tai_chinh_nguoi_thuc_hien_fkey
- CHECK: 27491_53331_1_not_null

## Table: to_chuc

| Column | Type | Nullable | Default | Extra |\n|---|---|---|---|---|\n| id | uuid | NO | gen_random_uuid()... | 🔑 PK |
| ten_to_chuc | text | NO | - | |
| ma_so_thue | text | YES | - | |
| cau_hinh | jsonb | YES | '{"theme": "dark", "... | |
| tao_luc | timestamp with time zone | YES | now()... | |

> Constraints:

- CHECK: 27491_53148_1_not_null
- CHECK: 27491_53148_2_not_null

## Table: tu_van_messages

| Column | Type | Nullable | Default | Extra |\n|---|---|---|---|---|\n| id | uuid | NO | gen_random_uuid()... | 🔑 PK |
| session_id | uuid | YES | - | 🔗 FK -> tu_van_sessions.id |
| nguoi_gui_id | text | YES | - | |
| la_nhan_vien | boolean | YES | false... | |
| noi_dung | text | YES | - | |
| hinh_anh | text | YES | - | |
| tao_luc | timestamp with time zone | YES | now()... | |

> Constraints:

- FOREIGN KEY: tu_van_messages_session_id_fkey
- CHECK: 27491_54932_1_not_null

## Table: tu_van_sessions

| Column | Type | Nullable | Default | Extra |\n|---|---|---|---|---|\n| id | uuid | NO | gen_random_uuid()... | 🔑 PK |
| khach_hang_id | uuid | YES | - | |
| khach_vang_lai_id | text | YES | - | |
| ten_hien_thi | text | YES | - | |
| sdt_lien_he | text | YES | - | |
| loai_khach | text | YES | 'vang_lai'::text... | |
| trang_thai | text | YES | 'cho_tu_van'::text... | |
| nhan_su_phu_trach_id | uuid | YES | - | |
| tin_nhan_cuoi | text | YES | - | |
| cap_nhat_luc | timestamp with time zone | YES | now()... | |
| tao_luc | timestamp with time zone | YES | now()... | |
| ho_tro_vien_ids | ARRAY | YES | '{}'::uuid[]... | |
| is_read | boolean | YES | true... | |
| last_sender_type | text | YES | 'staff'::text... | |

> Constraints:

- CHECK: 27491_54920_1_not_null

## Table: user_devices

| Column | Type | Nullable | Default | Extra |\n|---|---|---|---|---|\n| id | uuid | NO | gen_random_uuid()... | 🔑 PK |
| user_id | uuid | YES | - | 🔗 FK -> nhan_su.id |
| fcm_token | text | NO | - | |
| platform | text | YES | - | |
| last_active | timestamp with time zone | YES | now()... | |

> Constraints:

- UNIQUE: user_devices_user_id_fcm_token_key
- FOREIGN KEY: user_devices_user_id_fkey
- CHECK: 27491_56281_1_not_null
- CHECK: 27491_56281_3_not_null

## Table: user_registrations

| Column | Type | Nullable | Default | Extra |\n|---|---|---|---|---|\n| id | uuid | NO | gen_random_uuid()... | 🔑 PK |
| auth_user_id | uuid | YES | - | |
| ho_ten | text | YES | - | |
| email | text | YES | - | |
| so_dien_thoai | text | YES | - | |
| user_type | text | YES | - | |
| requested_vi_tri | text | YES | - | |
| requested_phan_loai | text | YES | - | |
| status | text | YES | 'pending'::text... | |
| created_at | timestamp with time zone | YES | now()... | |
| hinh_anh | text | YES | - | |
| details | jsonb | YES | - | |

> Constraints:

- CHECK: 27491_54958_1_not_null

## Table: vat_tu

| Column | Type | Nullable | Default | Extra |\n|---|---|---|---|---|\n| id | uuid | NO | gen_random_uuid()... | 🔑 PK |
| organization_id | uuid | YES | - | |
| ma_sku | text | YES | - | |
| ten_vat_tu | text | NO | - | |
| loai_vat_tu | text | YES | - | |
| don_vi_tinh | text | YES | - | |
| gia_von | numeric | YES | 0... | |
| gia_ban | numeric | YES | 0... | |
| ton_kho | numeric | YES | 0... | |
| canh_bao_toi_thieu | numeric | YES | 10... | |
| nhom_id | uuid | YES | - | 🔗 FK -> nhom_vat_tu.id |
| bo_suu_tap | text | YES | - | |
| hinh_anh | text | YES | - | |
| metadata | jsonb | YES | '{}'::jsonb... | |

> Constraints:

- UNIQUE: vat_tu_ma_sku_key
- FOREIGN KEY: vat_tu_nhom_id_fkey
- CHECK: 27491_53167_1_not_null
- CHECK: 27491_53167_4_not_null

## Table: yeu_cau_ho_tro

| Column | Type | Nullable | Default | Extra |\n|---|---|---|---|---|\n| id | uuid | NO | gen_random_uuid()... | 🔑 PK |
| nguoi_gui_id | uuid | YES | - | 🔗 FK -> nhan_su.id |
| loai_yeu_cau | text | YES | - | |
| noi_dung | text | YES | - | |
| trang_thai | text | YES | 'moi'::text... | |
| nguoi_nhan_id | uuid | YES | - | 🔗 FK -> nhan_su.id |
| hinh_anh_dinh_kem | text | YES | - | |
| diem_thuong | integer | YES | 5... | |
| tao_luc | timestamp with time zone | YES | now()... | |

> Constraints:

- FOREIGN KEY: yeu_cau_ho_tro_nguoi_gui_id_fkey
- FOREIGN KEY: yeu_cau_ho_tro_nguoi_nhan_id_fkey
- CHECK: 27491_53345_1_not_null

|
