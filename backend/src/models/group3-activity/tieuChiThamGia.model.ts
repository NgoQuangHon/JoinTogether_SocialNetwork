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
        this._tieuChiId = data.tieuChiId ?? null;
        this._hoatDongId = TieuChiThamGiaValidator.validatePositiveNumber(data.hoatDongId, 'HoatDongId');
        this._tenTieuChi = TieuChiThamGiaValidator.validateRequiredString(data.tenTieuChi, 'Tên tiêu chí');
        this._giaTriYeuCau = data.giaTriYeuCau ?? null;
        this._batBuoc = data.batBuoc ?? false;
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
        this._giaTriYeuCau = newGiaTriYeuCau ?? null;
    }

    setRequired(batBuoc: boolean): void {
        this._batBuoc = batBuoc;
    }

    static createTieuChiThamGiaModel(data: Partial<TieuChiThamGia>): TieuChiThamGiaModel {
        return new TieuChiThamGiaModel(data);
    }

    static createTieuChiThamGiaPayload(data: Partial<TieuChiThamGia>): Partial<TieuChiThamGia> {
        return {
            hoatDongId: data.hoatDongId ?? 0,
            tenTieuChi: data.tenTieuChi ?? '',
            giaTriYeuCau: data.giaTriYeuCau ?? null,
            batBuoc: data.batBuoc ?? false,
        };
    }
}
