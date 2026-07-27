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
        this._yeuCauId = data.yeuCauId === undefined || data.yeuCauId === null ? null : data.yeuCauId;
        this._hoatDongId = YeuCauThamGiaValidator.validatePositiveNumber(data.hoatDongId, 'HoatDongId');
        this._nguoiDungId = YeuCauThamGiaValidator.validatePositiveNumber(data.nguoiDungId, 'NguoiDungId');
        this._trangThai = data.trangThai === undefined || data.trangThai === null ? null : data.trangThai;
        this._thoiGianGui = data.thoiGianGui === undefined || data.thoiGianGui === null ? null : data.thoiGianGui;
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
        this._trangThai = newTrangThai === undefined || newTrangThai === null ? null : newTrangThai;
    }

    sendRequest(thoiGianGui: Date | string | null | undefined): void {
        this._thoiGianGui = thoiGianGui === undefined || thoiGianGui === null ? null : thoiGianGui;
    }

    static createYeuCauThamGiaModel(data: Partial<YeuCauThamGia>): YeuCauThamGiaModel {
        return new YeuCauThamGiaModel(data);
    }

    static createYeuCauThamGiaPayload(data: Partial<YeuCauThamGia>): Partial<YeuCauThamGia> {
        return {
            hoatDongId: data.hoatDongId === undefined || data.hoatDongId === null ? 0 : data.hoatDongId,
            nguoiDungId: data.nguoiDungId === undefined || data.nguoiDungId === null ? 0 : data.nguoiDungId,
            trangThai: data.trangThai === undefined || data.trangThai === null ? null : data.trangThai,
            thoiGianGui: data.thoiGianGui === undefined || data.thoiGianGui === null ? null : data.thoiGianGui,
        };
    }
}
