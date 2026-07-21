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
        this._thanhVienId = data.thanhVienId ?? null;
        this._hoatDongId = ThanhVienHoatDongValidator.validatePositiveNumber(data.hoatDongId, 'HoatDongId');
        this._nguoiDungId = ThanhVienHoatDongValidator.validatePositiveNumber(data.nguoiDungId, 'NguoiDungId');
        this._yeuCauId = data.yeuCauId ?? null;
        this._ngayThamGia = data.ngayThamGia ?? null;
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
        this._yeuCauId = newYeuCauId ?? null;
    }

    static createThanhVienHoatDongModel(data: Partial<ThanhVienHoatDong>): ThanhVienHoatDongModel {
        return new ThanhVienHoatDongModel(data);
    }

    static createThanhVienHoatDongPayload(data: Partial<ThanhVienHoatDong>): Partial<ThanhVienHoatDong> {
        return {
            hoatDongId: data.hoatDongId ?? 0,
            nguoiDungId: data.nguoiDungId ?? 0,
            yeuCauId: data.yeuCauId ?? null,
            ngayThamGia: data.ngayThamGia ?? null,
        };
    }
}
