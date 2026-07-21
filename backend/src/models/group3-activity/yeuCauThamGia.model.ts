import { YeuCauThamGiaValidator } from '../../validators/group3-activity/yeuCauThamGia.validator';

export interface YeuCauThamGia {
    yeuCauId?: number | null;
    hoatDongId: number;
    nguoiDungId: number;
    trangThai?: string | null;
    thoiGianGui?: Date | string | null;
}

export class YeuCauThamGiaModel {
    private readonly _yeuCauId?: number | null;
    private _hoatDongId: number;
    private _nguoiDungId: number;
    private _trangThai?: string | null;
    private _thoiGianGui?: Date | string | null;

    constructor(data: Partial<YeuCauThamGia> = {}) {
        this._yeuCauId = data.yeuCauId ?? null;
        this._hoatDongId = YeuCauThamGiaValidator.validatePositiveNumber(data.hoatDongId, 'HoatDongId');
        this._nguoiDungId = YeuCauThamGiaValidator.validatePositiveNumber(data.nguoiDungId, 'NguoiDungId');
        this._trangThai = data.trangThai ?? null;
        this._thoiGianGui = data.thoiGianGui ?? null;
    }

    get yeuCauId(): number | null | undefined {
        return this._yeuCauId;
    }

    get hoatDongId(): number {
        return this._hoatDongId;
    }

    get nguoiDungId(): number {
        return this._nguoiDungId;
    }

    get trangThai(): string | null | undefined {
        return this._trangThai;
    }

    get thoiGianGui(): Date | string | null | undefined {
        return this._thoiGianGui;
    }

    updateTrangThai(newTrangThai: string | null | undefined): void {
        this._trangThai = newTrangThai ?? null;
    }

    sendRequest(thoiGianGui: Date | string | null | undefined): void {
        this._thoiGianGui = thoiGianGui ?? null;
    }

    static createYeuCauThamGiaModel(data: Partial<YeuCauThamGia>): YeuCauThamGiaModel {
        return new YeuCauThamGiaModel(data);
    }

    static createYeuCauThamGiaPayload(data: Partial<YeuCauThamGia>): Partial<YeuCauThamGia> {
        return {
            hoatDongId: data.hoatDongId ?? 0,
            nguoiDungId: data.nguoiDungId ?? 0,
            trangThai: data.trangThai ?? null,
            thoiGianGui: data.thoiGianGui ?? null,
        };
    }
}
