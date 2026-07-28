CREATE TABLE IF NOT EXISTS theo_doi (
    nguoi_theo_doi_id BIGINT NOT NULL REFERENCES nguoi_dung(nguoi_dung_id) ON DELETE CASCADE,
    nguoi_duoc_theo_doi_id BIGINT NOT NULL REFERENCES nguoi_dung(nguoi_dung_id) ON DELETE CASCADE,
    thoi_gian_tao TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (nguoi_theo_doi_id, nguoi_duoc_theo_doi_id)
);
