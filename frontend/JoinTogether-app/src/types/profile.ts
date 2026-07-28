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
  mucTieuThamGia?: string | null;
  thoiGianRanh?: string | null;
  anhDaiDien?: string | null;
  soThich: SoThich[];
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
