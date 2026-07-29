export interface LoaiViPham {
  loaiViPhamId: number;
  tenLoai: string;
  moTa?: string;
  mucDo?: string;
}

export interface BangChungInput {
  loaiBangChung: string;
  duongDan: string;
}

export interface CreateReportRequest {
  nguoiBiBaoCaoId: number;
  loaiViPhamId: number;
  noiDung?: string;
  bangChung?: BangChungInput[];
}

export interface BaoCaoViPham {
  baoCaoId: number;
  nguoiBaoCaoId: number;
  nguoiBiBaoCaoId: number;
  loaiViPhamId: number;
  noiDung?: string;
  trangThai?: string;
  thoiGianTao?: string;
  nguoiBaoCao?: { hoTen: string };
  nguoiBiBaoCao?: { hoTen: string };
  loaiViPham?: LoaiViPham;
  bangChung?: { bangChungId: number; loaiBangChung: string; duongDan: string }[];
  quyetDinh?: { ketQua: string; ngayXuLy: string; nguoiXuLyId: number };
}

export interface ProcessReportRequest {
  ketQua: string;
  truDiem?: number;
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
