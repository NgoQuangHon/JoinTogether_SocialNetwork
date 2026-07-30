export interface TieuChiDanhGia {
  tieuChiDanhGiaId: number;
  tenTieuChi: string;
  trongSo: number;
  diemToiDa: number;
}

export interface ChiTietDanhGiaInput {
  tieuChiDanhGiaId: number;
  diem: number;
}

export interface CreateReviewRequest {
  hoatDongId: number;
  nguoiDuocDanhGiaId?: number | null;
  nhanXet?: string;
  diemTong?: number;
  chiTiet?: ChiTietDanhGiaInput[];
  loaiDanhGia?: 'USER' | 'HOAT_DONG';
}

export interface DanhGia {
  danhGiaId: number;
  hoatDongId: number;
  nguoiDanhGiaId: number;
  nguoiDuocDanhGiaId?: number | null;
  nguoiDanhGia?: string;
  anhDaiDienNguoiDanhGia?: string;
  nguoiDuocDanhGia?: string;
  nhanXet?: string;
  diemTong?: number;
  loaiDanhGia?: 'USER' | 'HOAT_DONG' | string;
  chiTiet?: { tieuChiDanhGiaId: number; diem: number; tenTieuChi?: string }[];
}

export interface DiemUyTin {
  diemUyTinId: number;
  nguoiDungId: number;
  diemHienTai: number;
  soLuotDanhGia: number;
  soLanCanhBao: number;
}

export interface LichSuDiemUyTin {
  lichSuId: number;
  diemUyTinId: number;
  diemThayDoi: number;
  lyDoThayDoi: string;
  thoiGianCapNhat: string;
}
