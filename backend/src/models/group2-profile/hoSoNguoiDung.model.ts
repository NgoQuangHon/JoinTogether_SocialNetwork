import { HoSoNguoiDungValidator } from '../../validators/group2-profile/hoSoNguoiDung.validator';

export interface HoSoNguoiDung {
    hoSoId?: number | null;
    nguoiDungId: number;
    tieuSu?: string | null;
    ngaySinh?: Date | string | null;
    khuVuc?: string | null;
    mucTieuThamGia?: string | null;
    thoiGianRanh?: string | null;
    anhDaiDien?: string | null;
}

export class HoSoNguoiDungModel {
    private readonly _hoSoId?: number | null;
    private _nguoiDungId: number;
    private _tieuSu?: string | null;
    private _ngaySinh?: Date | string | null;
    private _khuVuc?: string | null;
    private _mucTieuThamGia?: string | null;
    private _thoiGianRanh?: string | null;
    private _anhDaiDien?: string | null;

    constructor(data: Partial<HoSoNguoiDung> = {}) {
        this._hoSoId = data.hoSoId ?? null;
        this._nguoiDungId = HoSoNguoiDungValidator.validatePositiveNumber(data.nguoiDungId, 'NguoiDungId');
        this._tieuSu = data.tieuSu ?? null;
        this._ngaySinh = data.ngaySinh ?? null;
        this._khuVuc = data.khuVuc ?? null;
        this._mucTieuThamGia = data.mucTieuThamGia ?? null;
        this._thoiGianRanh = data.thoiGianRanh ?? null;
        this._anhDaiDien = data.anhDaiDien ?? null;
    }

    get hoSoId(): number | null | undefined {
        return this._hoSoId;
    }

    get nguoiDungId(): number {
        return this._nguoiDungId;
    }

    get tieuSu(): string | null | undefined {
        return this._tieuSu;
    }

    get ngaySinh(): Date | string | null | undefined {
        return this._ngaySinh;
    }

    get khuVuc(): string | null | undefined {
        return this._khuVuc;
    }

    get mucTieuThamGia(): string | null | undefined {
        return this._mucTieuThamGia;
    }

    get thoiGianRanh(): string | null | undefined {
        return this._thoiGianRanh;
    }

    get anhDaiDien(): string | null | undefined {
        return this._anhDaiDien;
    }

    updateTieuSu(newTieuSu: string | null | undefined): void {
        this._tieuSu = newTieuSu ?? null;
    }

    updateNgaySinh(newNgaySinh: Date | string | null | undefined): void {
        this._ngaySinh = newNgaySinh ?? null;
    }

    updateKhuVuc(newKhuVuc: string | null | undefined): void {
        this._khuVuc = newKhuVuc ?? null;
    }

    updateMucTieuThamGia(newMucTieuThamGia: string | null | undefined): void {
        this._mucTieuThamGia = newMucTieuThamGia ?? null;
    }

    updateThoiGianRanh(newThoiGianRanh: string | null | undefined): void {
        this._thoiGianRanh = newThoiGianRanh ?? null;
    }

    updateAnhDaiDien(newAnhDaiDien: string | null | undefined): void {
        this._anhDaiDien = newAnhDaiDien ?? null;
    }

    static createHoSoNguoiDungModel(data: Partial<HoSoNguoiDung>): HoSoNguoiDungModel {
        return new HoSoNguoiDungModel(data);
    }

    static createHoSoNguoiDungPayload(data: Partial<HoSoNguoiDung>): Partial<HoSoNguoiDung> {
        return {
            nguoiDungId: data.nguoiDungId ?? 0,
            tieuSu: data.tieuSu ?? null,
            ngaySinh: data.ngaySinh ?? null,
            khuVuc: data.khuVuc ?? null,
            mucTieuThamGia: data.mucTieuThamGia ?? null,
            thoiGianRanh: data.thoiGianRanh ?? null,
            anhDaiDien: data.anhDaiDien ?? null,
        };
    }
}
