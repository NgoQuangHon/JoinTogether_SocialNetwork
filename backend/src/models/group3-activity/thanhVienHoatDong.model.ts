import { ThanhVienHoatDongValidator } from '../../validators/group3-activity/thanhVienHoatDong.validator';

export interface ThanhVienHoatDong {
    thanhVienId?: number | null;
    hoatDongId: number;
    nguoiDungId: number;
    yeuCauId?: number | null;
    ngayThamGia?: Date | string | null;
}

export class ThanhVienHoatDongModel {
    private readonly _thanhVienId?: number | null;
    private _hoatDongId: number;
    private _nguoiDungId: number;
    private _yeuCauId?: number | null;
    private _ngayThamGia?: Date | string | null;

    constructor(data: Partial<ThanhVienHoatDong> = {}) {
        this._thanhVienId = data.thanhVienId === undefined || data.thanhVienId === null ? null : data.thanhVienId;
        this._hoatDongId = ThanhVienHoatDongValidator.validatePositiveNumber(data.hoatDongId, 'HoatDongId');
        this._nguoiDungId = ThanhVienHoatDongValidator.validatePositiveNumber(data.nguoiDungId, 'NguoiDungId');
        this._yeuCauId = data.yeuCauId === undefined || data.yeuCauId === null ? null : data.yeuCauId;
        this._ngayThamGia = data.ngayThamGia === undefined || data.ngayThamGia === null ? null : data.ngayThamGia;
    }

    get thanhVienId(): number | null | undefined {
        return this._thanhVienId;
    }

    get hoatDongId(): number {
        return this._hoatDongId;
    }

    get nguoiDungId(): number {
        return this._nguoiDungId;
    }

    get yeuCauId(): number | null | undefined {
        return this._yeuCauId;
    }

    get ngayThamGia(): Date | string | null | undefined {
        return this._ngayThamGia;
    }

    updateYeuCauId(newYeuCauId: number | null | undefined): void {
        this._yeuCauId = newYeuCauId === undefined || newYeuCauId === null ? null : newYeuCauId;
    }

    static createThanhVienHoatDongModel(data: Partial<ThanhVienHoatDong>): ThanhVienHoatDongModel {
        return new ThanhVienHoatDongModel(data);
    }

    static createThanhVienHoatDongPayload(data: Partial<ThanhVienHoatDong>): Partial<ThanhVienHoatDong> {
        return {
            hoatDongId: data.hoatDongId === undefined || data.hoatDongId === null ? 0 : data.hoatDongId,
            nguoiDungId: data.nguoiDungId === undefined || data.nguoiDungId === null ? 0 : data.nguoiDungId,
            yeuCauId: data.yeuCauId === undefined || data.yeuCauId === null ? null : data.yeuCauId,
            ngayThamGia: data.ngayThamGia === undefined || data.ngayThamGia === null ? null : data.ngayThamGia,
        };
    }
}
