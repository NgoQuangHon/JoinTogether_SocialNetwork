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
}
