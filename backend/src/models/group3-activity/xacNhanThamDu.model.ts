import { XacNhanThamDuValidator } from '../../validators/group3-activity/xacNhanThamDu.validator';

export interface XacNhanThamDu {
    xacNhanId?: number | null;
    thanhVienId: number;
    trangThaiThamDu?: string | null;
    thoiGianCheckIn?: Date | string | null;
}

export class XacNhanThamDuModel {
    private readonly _xacNhanId?: number | null;
    private _thanhVienId: number;
    private _trangThaiThamDu?: string | null;
    private _thoiGianCheckIn?: Date | string | null;

    constructor(data: Partial<XacNhanThamDu> = {}) {
        this._xacNhanId = data.xacNhanId === undefined || data.xacNhanId === null ? null : data.xacNhanId;
        this._thanhVienId = XacNhanThamDuValidator.validatePositiveNumber(data.thanhVienId, 'ThanhVienId');
        this._trangThaiThamDu = data.trangThaiThamDu === undefined || data.trangThaiThamDu === null ? null : data.trangThaiThamDu;
        this._thoiGianCheckIn = data.thoiGianCheckIn === undefined || data.thoiGianCheckIn === null ? null : data.thoiGianCheckIn;
    }

    get xacNhanId(): number | null | undefined {
        return this._xacNhanId;
    }

    get thanhVienId(): number {
        return this._thanhVienId;
    }

    get trangThaiThamDu(): string | null | undefined {
        return this._trangThaiThamDu;
    }

    get thoiGianCheckIn(): Date | string | null | undefined {
        return this._thoiGianCheckIn;
    }

    updateTrangThaiThamDu(newTrangThaiThamDu: string | null | undefined): void {
        this._trangThaiThamDu = newTrangThaiThamDu === undefined || newTrangThaiThamDu === null ? null : newTrangThaiThamDu;
    }

    checkIn(thoiGianCheckIn: Date | string | null | undefined): void {
        this._thoiGianCheckIn = thoiGianCheckIn === undefined || thoiGianCheckIn === null ? null : thoiGianCheckIn;
    }

    static createXacNhanThamDuModel(data: Partial<XacNhanThamDu>): XacNhanThamDuModel {
        return new XacNhanThamDuModel(data);
    }

    static createXacNhanThamDuPayload(data: Partial<XacNhanThamDu>): Partial<XacNhanThamDu> {
        return {
            thanhVienId: data.thanhVienId === undefined || data.thanhVienId === null ? 0 : data.thanhVienId,
            trangThaiThamDu: data.trangThaiThamDu === undefined || data.trangThaiThamDu === null ? null : data.trangThaiThamDu,
            thoiGianCheckIn: data.thoiGianCheckIn === undefined || data.thoiGianCheckIn === null ? null : data.thoiGianCheckIn,
        };
    }
}
