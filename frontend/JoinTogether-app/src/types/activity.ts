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
  hinhAnh?: { duongDan: string; laAnhDaiDien: boolean }[];
  soLuongThanhVien?: number;
  trangThai?: string;
}
