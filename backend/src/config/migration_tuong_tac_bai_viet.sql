CREATE TABLE IF NOT EXISTS thich_bai_viet (
    nguoi_dung_id BIGINT NOT NULL REFERENCES nguoi_dung(nguoi_dung_id) ON DELETE CASCADE,
    bai_viet_id BIGINT NOT NULL REFERENCES bai_viet(bai_viet_id) ON DELETE CASCADE,
    thoi_gian_tao TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (nguoi_dung_id, bai_viet_id)
);

CREATE TABLE IF NOT EXISTS binh_luan_bai_viet (
    binh_luan_id BIGSERIAL PRIMARY KEY,
    bai_viet_id BIGINT NOT NULL REFERENCES bai_viet(bai_viet_id) ON DELETE CASCADE,
    nguoi_dung_id BIGINT NOT NULL REFERENCES nguoi_dung(nguoi_dung_id) ON DELETE CASCADE,
    noi_dung TEXT NOT NULL,
    thoi_gian_tao TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chia_se_bai_viet (
    chia_se_id BIGSERIAL PRIMARY KEY,
    bai_viet_id BIGINT NOT NULL REFERENCES bai_viet(bai_viet_id) ON DELETE CASCADE,
    nguoi_dung_id BIGINT NOT NULL REFERENCES nguoi_dung(nguoi_dung_id) ON DELETE CASCADE,
    thoi_gian_tao TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
