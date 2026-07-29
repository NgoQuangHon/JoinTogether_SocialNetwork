export interface ViolationType {
    loai_vi_pham_id: number;

    ten_loai_vi_pham: string;

    mo_ta: string;
}

export interface CreateReportRequest {
    nguoi_bi_bao_cao_id: number;

    loai_vi_pham_id: number;

    mo_ta: string;

    hinh_anh?: string[];
}

export interface Report {
    bao_cao_id: number;

    trang_thai: string;

    ngay_tao: string;

    mo_ta: string;
}
