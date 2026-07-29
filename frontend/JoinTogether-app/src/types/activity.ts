export interface SearchFilters {
  keyword?: string;
  danhMucHoatDongId?: number;
  diaDiemId?: number;
  tuNgay?: string;
  denNgay?: string;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  rows: HoatDongResponse[];
  total: number;
}

export interface TieuChiThamGia {
  tieuChiId: number;
  hoatDongId: number;
  tenTieuChi: string;
  giaTriYeuCau?: string | null;
  batBuoc: boolean;
}

export interface CreateActivityRequest {
  tenHoatDong: string;
  danhMucHoatDongId: number;
  moTa: string;
  thumbnail?: string;
  thoiGianBatDau: string;
  thoiGianKetThuc: string;
  tenDiaDiem?: string;
  diaChi?: string;
  hinhThuc?: string;
  viTriKinhDo?: number;
  viTriViDo?: number;
  soLuongToiDa?: number;
  doTuoiTu?: number;
  doTuoiDen?: number;
  gioiTinhPhuHop?: string;
  mucDoKinhNghiem?: string;
  yeuCauKhac?: string;
  hinhAnh?: string[];
  noiQuyChung?: string;
  luuYDatBiet?: string;
  doDungCanMang?: string;
  hanDangKy?: string;
}

export interface DanhMucHoatDong {
  danhMucHoatDongId: number;
  tenDanhMuc: string;
  moTa?: string;
}

export interface HoatDongResponse {
  hoatDongId: number;
  nguoiToChucId: number;
  nguoiToChuc?: string;
  danhMucHoatDongId?: number;
  tenDanhMuc?: string;
  diaDiemId?: number;
  tenDiaDiem?: string;
  diaChi?: string;
  hinhThuc?: string;
  tenHoatDong: string;
  moTa?: string;
  thoiGianBatDau?: string;
  thoiGianKetThuc?: string;
  soLuongToiDa?: number;
  doTuoiTu?: number;
  doTuoiDen?: number;
  gioiTinhPhuHop?: string;
  mucDoKinhNghiem?: string;
  yeuCauKhac?: string;
  noiQuyChung?: string;
  luuYDatBiet?: string;
  doDungCanMang?: string;
  hanDangKy?: string;
  hinhAnh?: { duongDan: string; laAnhDaiDien: boolean }[];
  soLuongThanhVien?: number;
  trangThai?: string;
  lyDoHuy?: string;
}
