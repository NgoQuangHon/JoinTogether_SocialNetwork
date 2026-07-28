CREATE TABLE IF NOT EXISTS bai_viet (
    bai_viet_id BIGSERIAL PRIMARY KEY,
    nguoi_dung_id BIGINT NOT NULL REFERENCES nguoi_dung(nguoi_dung_id) ON DELETE CASCADE,
    hoat_dong_id BIGINT REFERENCES hoat_dong(hoat_dong_id) ON DELETE SET NULL,
    noi_dung TEXT NOT NULL,
    hinh_anh TEXT,
    so_luot_thich INTEGER DEFAULT 0,
    so_binh_luan INTEGER DEFAULT 0,
    so_luot_chia_se INTEGER DEFAULT 0,
    thoi_gian_tao TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
