-- Migration: Add new columns to hoat_dong table
-- Run this if you already have the database created

ALTER TABLE hoat_dong
ADD COLUMN IF NOT EXISTS so_luong_toi_da INTEGER,
ADD COLUMN IF NOT EXISTS do_tuoi_tu INTEGER,
ADD COLUMN IF NOT EXISTS do_tuoi_den INTEGER,
ADD COLUMN IF NOT EXISTS gioi_tinh_phu_hop VARCHAR(50),
ADD COLUMN IF NOT EXISTS muc_do_kinh_nghiem VARCHAR(100),
ADD COLUMN IF NOT EXISTS yeu_cau_khac TEXT,
ADD COLUMN IF NOT EXISTS noi_quy_chung TEXT,
ADD COLUMN IF NOT EXISTS luu_y_dac_biet TEXT,
ADD COLUMN IF NOT EXISTS do_dung_can_mang TEXT;
