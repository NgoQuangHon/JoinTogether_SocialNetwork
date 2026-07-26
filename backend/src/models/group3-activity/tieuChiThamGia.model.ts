import { TieuChiThamGiaValidator } from '../../validators/group3-activity/tieuChiThamGia.validator';

export interface TieuChiThamGia {
    tieuChiId?: number | null;
    hoatDongId: number;
    tenTieuChi: string;
    giaTriYeuCau?: string | null;
    batBuoc?: boolean | null;
}

export class TieuChiThamGiaModel {
    private readonly _tieuChiId?: number | null;
    private _hoatDongId: number;
    private _tenTieuChi: string;
    private _giaTriYeuCau?: string | null;
    private _batBuoc?: boolean | null;

    constructor(data: Partial<TieuChiThamGia> = {}) {
        this._tieuChiId = data.tieuChiId === undefined || data.tieuChiId === null ? null : data.tieuChiId;
        this._hoatDongId = TieuChiThamGiaValidator.validatePositiveNumber(data.hoatDongId, 'HoatDongId');
        this._tenTieuChi = TieuChiThamGiaValidator.validateRequiredString(data.tenTieuChi, 'Tên tiêu chí');
        this._giaTriYeuCau = data.giaTriYeuCau === undefined || data.giaTriYeuCau === null ? null : data.giaTriYeuCau;
        this._batBuoc = data.batBuoc === undefined || data.batBuoc === null ? false : data.batBuoc;
    }

    get tieuChiId(): number | null | undefined {
        return this._tieuChiId;
    }

    get hoatDongId(): number {
        return this._hoatDongId;
    }

    get tenTieuChi(): string {
        return this._tenTieuChi;
    }

    get giaTriYeuCau(): string | null | undefined {
        return this._giaTriYeuCau;
    }

    get batBuoc(): boolean | null | undefined {
        return this._batBuoc;
    }

    updateTenTieuChi(newTenTieuChi: string): void {
        this._tenTieuChi = TieuChiThamGiaValidator.validateRequiredString(newTenTieuChi, 'Tên tiêu chí');
    }

    updateGiaTriYeuCau(newGiaTriYeuCau: string | null | undefined): void {
        this._giaTriYeuCau = newGiaTriYeuCau === undefined || newGiaTriYeuCau === null ? null : newGiaTriYeuCau;
    }

    setRequired(batBuoc: boolean): void {
        this._batBuoc = batBuoc;
    }

    static createTieuChiThamGiaModel(data: Partial<TieuChiThamGia>): TieuChiThamGiaModel {
        return new TieuChiThamGiaModel(data);
    }

    static createTieuChiThamGiaPayload(data: Partial<TieuChiThamGia>): Partial<TieuChiThamGia> {
        return {
            hoatDongId: data.hoatDongId === undefined || data.hoatDongId === null ? 0 : data.hoatDongId,
            tenTieuChi: data.tenTieuChi === undefined || data.tenTieuChi === null ? '' : data.tenTieuChi,
            giaTriYeuCau: data.giaTriYeuCau === undefined || data.giaTriYeuCau === null ? null : data.giaTriYeuCau,
            batBuoc: data.batBuoc === undefined || data.batBuoc === null ? false : data.batBuoc,
        };
    }
}
