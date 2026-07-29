export interface SoThich {
  soThichId: number;
  tenSoThich: string;
  moTa?: string;
  tenDanhMuc: string;
  mucDoQuanTam?: number;
}

export interface HoSoNguoiDung {
  hoSoId: number;
  nguoiDungId: number;
  tieuSu?: string | null;
  ngaySinh?: string | null;
  khuVuc?: string | null;
  gioiTinh?: string | null;
  mucTieuThamGia?: string | null;
  thoiGianRanh?: string | null;
  anhDaiDien?: string | null;
  soThich: SoThich[];
  user?: NguoiDungInfo;
  daXacThuc?: boolean;
}

export interface NguoiDungInfo {
  hoTen: string;
  email: string;
  soDienThoai?: string;
}

export interface ProfileData {
  profile: HoSoNguoiDung;
  user: NguoiDungInfo;
}
