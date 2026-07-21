-- ============================================================
-- 1. NHÓM NGƯỜI DÙNG & TÀI KHOẢN
-- ============================================================

CREATE TABLE nguoi_dung (
    nguoi_dung_id BIGSERIAL PRIMARY KEY,
    ho_ten VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    so_dien_thoai VARCHAR(20) UNIQUE,
    trang_thai VARCHAR(50),
    ngay_tao TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tai_khoan (
    tai_khoan_id BIGSERIAL PRIMARY KEY,
    nguoi_dung_id BIGINT UNIQUE NOT NULL REFERENCES nguoi_dung(nguoi_dung_id) ON DELETE CASCADE,
    ten_dang_nhap VARCHAR(100) UNIQUE NOT NULL,
    mat_khau_ma_hoa VARCHAR(255) NOT NULL,
    trang_thai VARCHAR(50),
    da_xac_thuc BOOLEAN DEFAULT FALSE
);

CREATE TABLE thong_tin_xac_thuc (
    xac_thuc_id BIGSERIAL PRIMARY KEY,
    tai_khoan_id BIGINT NOT NULL REFERENCES tai_khoan(tai_khoan_id) ON DELETE CASCADE,
    loai_xac_thuc VARCHAR(50),
    ma_xac_thuc VARCHAR(255),
    thoi_gian_het_han TIMESTAMPTZ,
    da_su_dung BOOLEAN DEFAULT FALSE
);

CREATE TABLE vai_tro (
    vai_tro_id BIGSERIAL PRIMARY KEY,
    ten_vai_tro VARCHAR(100) UNIQUE NOT NULL,
    mo_ta TEXT
);

CREATE TABLE quyen_han (
    quyen_han_id BIGSERIAL PRIMARY KEY,
    ten_quyen VARCHAR(100) UNIQUE NOT NULL,
    mo_ta TEXT
);

-- ============================================================
-- 2. NHÓM HỒ SƠ & SỞ THÍCH
-- ============================================================

CREATE TABLE ho_so_nguoi_dung (
    ho_so_id BIGSERIAL PRIMARY KEY,
    nguoi_dung_id BIGINT UNIQUE NOT NULL REFERENCES nguoi_dung(nguoi_dung_id) ON DELETE CASCADE,
    tieu_su TEXT,
    ngay_sinh DATE,
    khu_vuc VARCHAR(255),
    muc_tieu_tham_gia TEXT,
    thoi_gian_ranh VARCHAR(255),
    anh_dai_dien VARCHAR(500)
);

CREATE TABLE danh_muc_so_thich (
    danh_muc_so_thich_id BIGSERIAL PRIMARY KEY,
    ten_danh_muc VARCHAR(255) NOT NULL,
    mo_ta TEXT
);

CREATE TABLE so_thich (
    so_thich_id BIGSERIAL PRIMARY KEY,
    danh_muc_so_thich_id BIGINT REFERENCES danh_muc_so_thich(danh_muc_so_thich_id) ON DELETE SET NULL,
    ten_so_thich VARCHAR(255) NOT NULL,
    mo_ta TEXT
);

CREATE TABLE ho_so_so_thich (
    ho_so_id BIGINT REFERENCES ho_so_nguoi_dung(ho_so_id) ON DELETE CASCADE,
    so_thich_id BIGINT REFERENCES so_thich(so_thich_id) ON DELETE CASCADE,
    muc_do_quan_tam INT,
    PRIMARY KEY (ho_so_id, so_thich_id)
);

-- ============================================================
-- 3. NHÓM HOẠT ĐỘNG, ĐỊA ĐIỂM & THÀNH VIÊN
-- ============================================================

CREATE TABLE danh_muc_hoat_dong (
    danh_muc_hoat_dong_id BIGSERIAL PRIMARY KEY,
    ten_danh_muc VARCHAR(255) NOT NULL,
    mo_ta TEXT
);

CREATE TABLE dia_diem (
    dia_diem_id BIGSERIAL PRIMARY KEY,
    ten_dia_diem VARCHAR(255),
    dia_chi TEXT,
    hinh_thuc VARCHAR(50),
    duong_dan_truc_tuyen VARCHAR(500)
);

CREATE TABLE hoat_dong (
    hoat_dong_id BIGSERIAL PRIMARY KEY,
    nguoi_to_chuc_id BIGINT REFERENCES nguoi_dung(nguoi_dung_id) ON DELETE SET NULL,
    danh_muc_hoat_dong_id BIGINT REFERENCES danh_muc_hoat_dong(danh_muc_hoat_dong_id) ON DELETE SET NULL,
    dia_diem_id BIGINT REFERENCES dia_diem(dia_diem_id) ON DELETE SET NULL,
    ten_hoat_dong VARCHAR(255) NOT NULL,
    mo_ta TEXT,
    thoi_gian_bat_dau TIMESTAMPTZ,
    thoi_gian_ket_thuc TIMESTAMPTZ
);

CREATE TABLE tieu_chi_tham_gia (
    tieu_chi_id BIGSERIAL PRIMARY KEY,
    hoat_dong_id BIGINT NOT NULL REFERENCES hoat_dong(hoat_dong_id) ON DELETE CASCADE,
    ten_tieu_chi VARCHAR(255) NOT NULL,
    gia_tri_yeu_cau VARCHAR(255),
    bat_buoc BOOLEAN DEFAULT FALSE
);

CREATE TABLE hinh_anh_hoat_dong (
    hinh_anh_id BIGSERIAL PRIMARY KEY,
    hoat_dong_id BIGINT NOT NULL REFERENCES hoat_dong(hoat_dong_id) ON DELETE CASCADE,
    duong_dan VARCHAR(500) NOT NULL,
    mo_ta TEXT,
    la_anh_dai_dien BOOLEAN DEFAULT FALSE
);

CREATE TABLE yeu_cau_tham_gia (
    yeu_cau_id BIGSERIAL PRIMARY KEY,
    hoat_dong_id BIGINT NOT NULL REFERENCES hoat_dong(hoat_dong_id) ON DELETE CASCADE,
    nguoi_dung_id BIGINT NOT NULL REFERENCES nguoi_dung(nguoi_dung_id) ON DELETE CASCADE,
    trang_thai VARCHAR(50),
    thoi_gian_gui TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE thanh_vien_hoat_dong (
    thanh_vien_id BIGSERIAL PRIMARY KEY,
    hoat_dong_id BIGINT NOT NULL REFERENCES hoat_dong(hoat_dong_id) ON DELETE CASCADE,
    nguoi_dung_id BIGINT NOT NULL REFERENCES nguoi_dung(nguoi_dung_id) ON DELETE CASCADE,
    yeu_cau_id BIGINT REFERENCES yeu_cau_tham_gia(yeu_cau_id) ON DELETE SET NULL,
    ngay_tham_gia TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE xac_nhan_tham_du (
    xac_nhan_id BIGSERIAL PRIMARY KEY,
    thanh_vien_id BIGINT UNIQUE NOT NULL REFERENCES thanh_vien_hoat_dong(thanh_vien_id) ON DELETE CASCADE,
    trang_thai_tham_du VARCHAR(50),
    thoi_gian_check_in TIMESTAMPTZ
);

-- ============================================================
-- 4. NHÓM TƯƠNG TÁC, KẾT NỐI & TRÒ CHUYỆN
-- ============================================================

CREATE TABLE lich_su_tim_kiem (
    lich_su_id BIGSERIAL PRIMARY KEY,
    nguoi_dung_id BIGINT NOT NULL REFERENCES nguoi_dung(nguoi_dung_id) ON DELETE CASCADE,
    tu_khoa_tim_kiem VARCHAR(255),
    bo_loc_tim_kiem TEXT,
    thoi_gian_tim_kiem TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE yeu_cau_ket_noi (
    yeu_cau_ket_noi_id BIGSERIAL PRIMARY KEY,
    nguoi_gui_id BIGINT NOT NULL REFERENCES nguoi_dung(nguoi_dung_id) ON DELETE CASCADE,
    nguoi_nhan_id BIGINT NOT NULL REFERENCES nguoi_dung(nguoi_dung_id) ON DELETE CASCADE,
    loi_nhan TEXT,
    trang_thai VARCHAR(50)
);

CREATE TABLE quan_he_ket_noi (
    quan_he_id BIGSERIAL PRIMARY KEY,
    nguoi_dung_id_1 BIGINT NOT NULL REFERENCES nguoi_dung(nguoi_dung_id) ON DELETE CASCADE,
    nguoi_dung_id_2 BIGINT NOT NULL REFERENCES nguoi_dung(nguoi_dung_id) ON DELETE CASCADE,
    ngay_ket_noi TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    trang_thai VARCHAR(50)
);

CREATE TABLE phong_tro_chuyen (
    phong_id BIGSERIAL PRIMARY KEY,
    hoat_dong_id BIGINT UNIQUE REFERENCES hoat_dong(hoat_dong_id) ON DELETE CASCADE,
    ten_phong VARCHAR(255),
    trang_thai VARCHAR(50),
    ngay_tao TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tin_nhan (
    tin_nhan_id BIGSERIAL PRIMARY KEY,
    phong_id BIGINT NOT NULL REFERENCES phong_tro_chuyen(phong_id) ON DELETE CASCADE,
    nguoi_gui_id BIGINT REFERENCES nguoi_dung(nguoi_dung_id) ON DELETE SET NULL,
    noi_dung TEXT NOT NULL,
    thoi_gian_gui TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE thong_bao (
    thong_bao_id BIGSERIAL PRIMARY KEY,
    nguoi_nhan_id BIGINT NOT NULL REFERENCES nguoi_dung(nguoi_dung_id) ON DELETE CASCADE,
    tieu_de VARCHAR(255),
    noi_dung TEXT,
    loai_thong_bao VARCHAR(50)
);

-- ============================================================
-- 5. NHÓM ĐÁNH GIÁ & ĐIỂM UY TÍN
-- ============================================================

CREATE TABLE danh_gia (
    danh_gia_id BIGSERIAL PRIMARY KEY,
    hoat_dong_id BIGINT REFERENCES hoat_dong(hoat_dong_id) ON DELETE CASCADE,
    nguoi_danh_gia_id BIGINT REFERENCES nguoi_dung(nguoi_dung_id) ON DELETE SET NULL,
    nguoi_duoc_danh_gia_id BIGINT REFERENCES nguoi_dung(nguoi_dung_id) ON DELETE SET NULL,
    nhan_xet TEXT,
    diem_tong NUMERIC(3, 1)
);

CREATE TABLE tieu_chi_danh_gia (
    tieu_chi_danh_gia_id BIGSERIAL PRIMARY KEY,
    ten_tieu_chi VARCHAR(255) NOT NULL,
    trong_so NUMERIC(5, 2),
    diem_toi_da INT
);

CREATE TABLE chi_tiet_danh_gia (
    danh_gia_id BIGINT REFERENCES danh_gia(danh_gia_id) ON DELETE CASCADE,
    tieu_chi_danh_gia_id BIGINT REFERENCES tieu_chi_danh_gia(tieu_chi_danh_gia_id) ON DELETE CASCADE,
    diem NUMERIC(3, 1),
    PRIMARY KEY (danh_gia_id, tieu_chi_danh_gia_id)
);

CREATE TABLE diem_uy_tin (
    diem_uy_tin_id BIGSERIAL PRIMARY KEY,
    nguoi_dung_id BIGINT UNIQUE NOT NULL REFERENCES nguoi_dung(nguoi_dung_id) ON DELETE CASCADE,
    diem_hien_tai INT DEFAULT 100,
    so_luot_danh_gia INT DEFAULT 0,
    so_lan_canh_bao INT DEFAULT 0
);

CREATE TABLE lich_su_diem_uy_tin (
    lich_su_id BIGSERIAL PRIMARY KEY,
    diem_uy_tin_id BIGINT NOT NULL REFERENCES diem_uy_tin(diem_uy_tin_id) ON DELETE CASCADE,
    diem_thay_doi INT NOT NULL,
    ly_do_thay_doi VARCHAR(255),
    thoi_gian_cap_nhat TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 6. NHÓM BÁO CÁO VI PHẠM & QUẢN TRỊ
-- ============================================================

CREATE TABLE loai_vi_pham (
    loai_vi_pham_id BIGSERIAL PRIMARY KEY,
    ten_loai VARCHAR(255) NOT NULL,
    mo_ta TEXT,
    muc_do VARCHAR(50)
);

CREATE TABLE bao_cao_vi_pham (
    bao_cao_id BIGSERIAL PRIMARY KEY,
    nguoi_bao_cao_id BIGINT REFERENCES nguoi_dung(nguoi_dung_id) ON DELETE SET NULL,
    nguoi_bi_bao_cao_id BIGINT REFERENCES nguoi_dung(nguoi_dung_id) ON DELETE SET NULL,
    loai_vi_pham_id BIGINT REFERENCES loai_vi_pham(loai_vi_pham_id) ON DELETE SET NULL,
    noi_dung TEXT
);

CREATE TABLE bang_chung_vi_pham (
    bang_chung_id BIGSERIAL PRIMARY KEY,
    bao_cao_id BIGINT NOT NULL REFERENCES bao_cao_vi_pham(bao_cao_id) ON DELETE CASCADE,
    loai_bang_chung VARCHAR(50),
    duong_dan VARCHAR(500) NOT NULL
);

CREATE TABLE quyet_dinh_xu_ly (
    quyet_dinh_id BIGSERIAL PRIMARY KEY,
    bao_cao_id BIGINT UNIQUE NOT NULL REFERENCES bao_cao_vi_pham(bao_cao_id) ON DELETE CASCADE,
    nguoi_xu_ly_id BIGINT REFERENCES nguoi_dung(nguoi_dung_id) ON DELETE SET NULL,
    ket_qua TEXT,
    ngay_xu_ly TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE nhat_ky_quan_tri (
    nhat_ky_id BIGSERIAL PRIMARY KEY,
    nguoi_quan_tri_id BIGINT REFERENCES nguoi_dung(nguoi_dung_id) ON DELETE SET NULL,
    hanh_dong VARCHAR(255) NOT NULL,
    doi_tuong_tac_dong VARCHAR(100),
    thoi_gian_thuc_hien TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);