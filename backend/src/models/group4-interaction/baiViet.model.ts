export interface BaiViet {
    baiVietId?: number | null;
    nguoiDungId: number;
    hoatDongId?: number | null;
    noiDung: string;
    hinhAnh?: string | null;
    soLuotThich?: number | null;
    soBinhLuan?: number | null;
    soLuotChiaSe?: number | null;
    thoiGianTao?: Date | string | null;
    nguoiDung?: { hoTen?: string; anhDaiDien?: string } | null;
    hoatDongLienQuan?: string | null;
}
