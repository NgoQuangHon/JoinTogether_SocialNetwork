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
  hoatDongId?: number;
  thanhVienId?: number;
}

export interface BaoCaoViPham {
  baoCaoId: number;
  nguoiBaoCaoId: number;
  nguoiBiBaoCaoId: number;
  loaiViPhamId: number;
  tenLoaiViPham?: string;
  noiDung?: string;
  trangThai?: string;
  thoiGianTao?: string;
  hoatDongId?: number;
  thanhVienId?: number;
  tenHoatDong?: string;
  nguoiBaoCao?: { hoTen: string } | string;
  nguoiBiBaoCao?: { hoTen: string } | string;
  loaiViPham?: LoaiViPham;
  bangChung?: { bangChungId: number; loaiBangChung: string; duongDan: string }[];
  quyetDinh?: { ketQua: string; ngayXuLy?: string; nguoiXuLyId?: number };
}

export interface ProcessReportRequest {
  ketQua: string;
  truDiem?: boolean | number;
}
