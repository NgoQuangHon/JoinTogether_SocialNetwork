import { HoSoNguoiDungValidator } from '../../validators/group2-profile/hoSoNguoiDung.validator';

export interface HoSoNguoiDung {
    hoSoId?: number | null;
    nguoiDungId: number;
    tieuSu?: string | null;
    ngaySinh?: Date | string | null;
    khuVuc?: string | null;
    gioiTinh?: string | null;
    mucTieuThamGia?: string | null;
    thoiGianRanh?: string | null;
    anhDaiDien?: string | null;
    banKinhMongMuon?: number | null;
}

export class HoSoNguoiDungModel {
    private readonly _hoSoId?: number | null;
    private _nguoiDungId: number;
    private _tieuSu?: string | null;
    private _ngaySinh?: Date | string | null;
    private _khuVuc?: string | null;
    private _gioiTinh?: string | null;
    private _mucTieuThamGia?: string | null;
    private _thoiGianRanh?: string | null;
    private _anhDaiDien?: string | null;
    private _banKinhMongMuon?: number | null;

    constructor(data: Partial<HoSoNguoiDung> = {}) {
        this._hoSoId = data.hoSoId === undefined || data.hoSoId === null ? null : data.hoSoId;
        this._nguoiDungId = HoSoNguoiDungValidator.validatePositiveNumber(data.nguoiDungId, 'NguoiDungId');
        this._tieuSu = data.tieuSu === undefined || data.tieuSu === null ? null : data.tieuSu;
        this._ngaySinh = data.ngaySinh === undefined || data.ngaySinh === null ? null : data.ngaySinh;
        this._khuVuc = data.khuVuc === undefined || data.khuVuc === null ? null : data.khuVuc;
        this._gioiTinh = data.gioiTinh === undefined || data.gioiTinh === null ? null : data.gioiTinh;
        this._mucTieuThamGia = data.mucTieuThamGia === undefined || data.mucTieuThamGia === null ? null : data.mucTieuThamGia;
        this._thoiGianRanh = data.thoiGianRanh === undefined || data.thoiGianRanh === null ? null : data.thoiGianRanh;
        this._anhDaiDien = data.anhDaiDien === undefined || data.anhDaiDien === null ? null : data.anhDaiDien;
        this._banKinhMongMuon = data.banKinhMongMuon === undefined || data.banKinhMongMuon === null ? null : data.banKinhMongMuon;
    }

    get hoSoId(): number | null | undefined { return this._hoSoId; }
    get nguoiDungId(): number { return this._nguoiDungId; }
    get tieuSu(): string | null | undefined { return this._tieuSu; }
    get ngaySinh(): Date | string | null | undefined { return this._ngaySinh; }
    get khuVuc(): string | null | undefined { return this._khuVuc; }
    get gioiTinh(): string | null | undefined { return this._gioiTinh; }
    get mucTieuThamGia(): string | null | undefined { return this._mucTieuThamGia; }
    get thoiGianRanh(): string | null | undefined { return this._thoiGianRanh; }
    get anhDaiDien(): string | null | undefined { return this._anhDaiDien; }
    get banKinhMongMuon(): number | null | undefined { return this._banKinhMongMuon; }

    updateTieuSu(newTieuSu: string | null | undefined): void {
        this._tieuSu = newTieuSu === undefined || newTieuSu === null ? null : newTieuSu;
    }

    updateNgaySinh(newNgaySinh: Date | string | null | undefined): void {
        this._ngaySinh = newNgaySinh === undefined || newNgaySinh === null ? null : newNgaySinh;
    }

    updateKhuVuc(newKhuVuc: string | null | undefined): void {
        this._khuVuc = newKhuVuc === undefined || newKhuVuc === null ? null : newKhuVuc;
    }

    updateGioiTinh(newGioiTinh: string | null | undefined): void {
        this._gioiTinh = newGioiTinh === undefined || newGioiTinh === null ? null : newGioiTinh;
    }

    updateMucTieuThamGia(newMucTieuThamGia: string | null | undefined): void {
        this._mucTieuThamGia = newMucTieuThamGia === undefined || newMucTieuThamGia === null ? null : newMucTieuThamGia;
    }

    updateThoiGianRanh(newThoiGianRanh: string | null | undefined): void {
        this._thoiGianRanh = newThoiGianRanh === undefined || newThoiGianRanh === null ? null : newThoiGianRanh;
    }

    updateAnhDaiDien(newAnhDaiDien: string | null | undefined): void {
        this._anhDaiDien = newAnhDaiDien === undefined || newAnhDaiDien === null ? null : newAnhDaiDien;
    }

    updateBanKinhMongMuon(newBanKinhMongMuon: number | null | undefined): void {
        this._banKinhMongMuon = newBanKinhMongMuon === undefined || newBanKinhMongMuon === null ? null : newBanKinhMongMuon;
    }

    static createHoSoNguoiDungModel(data: Partial<HoSoNguoiDung>): HoSoNguoiDungModel {
        return new HoSoNguoiDungModel(data);
    }

    static createHoSoNguoiDungPayload(data: Partial<HoSoNguoiDung>): Partial<HoSoNguoiDung> {
        return {
            nguoiDungId: data.nguoiDungId === undefined || data.nguoiDungId === null ? 0 : data.nguoiDungId,
            tieuSu: data.tieuSu === undefined || data.tieuSu === null ? null : data.tieuSu,
            ngaySinh: data.ngaySinh === undefined || data.ngaySinh === null ? null : data.ngaySinh,
            khuVuc: data.khuVuc === undefined || data.khuVuc === null ? null : data.khuVuc,
            gioiTinh: data.gioiTinh === undefined || data.gioiTinh === null ? null : data.gioiTinh,
            mucTieuThamGia: data.mucTieuThamGia === undefined || data.mucTieuThamGia === null ? null : data.mucTieuThamGia,
            thoiGianRanh: data.thoiGianRanh === undefined || data.thoiGianRanh === null ? null : data.thoiGianRanh,
            anhDaiDien: data.anhDaiDien === undefined || data.anhDaiDien === null ? null : data.anhDaiDien,
            banKinhMongMuon: data.banKinhMongMuon === undefined || data.banKinhMongMuon === null ? null : data.banKinhMongMuon,
        };
    }
}
