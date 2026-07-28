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
  nguoiDuocDanhGiaId: number;
  nhanXet?: string;
  diemTong?: number;
  chiTiet?: ChiTietDanhGiaInput[];
}

export interface DanhGia {
  danhGiaId: number;
  hoatDongId: number;
  nguoiDanhGiaId: number;
  nguoiDuocDanhGiaId: number;
  nhanXet?: string;
  diemTong?: number;
  nguoiDanhGia?: { hoTen: string; anhDaiDien?: string };
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
