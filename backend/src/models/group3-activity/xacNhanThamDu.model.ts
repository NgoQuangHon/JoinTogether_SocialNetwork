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
        this._xacNhanId = data.xacNhanId ?? null;
        this._thanhVienId = XacNhanThamDuValidator.validatePositiveNumber(data.thanhVienId, 'ThanhVienId');
        this._trangThaiThamDu = data.trangThaiThamDu ?? null;
        this._thoiGianCheckIn = data.thoiGianCheckIn ?? null;
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
        this._trangThaiThamDu = newTrangThaiThamDu ?? null;
    }

    checkIn(thoiGianCheckIn: Date | string | null | undefined): void {
        this._thoiGianCheckIn = thoiGianCheckIn ?? null;
    }

    static createXacNhanThamDuModel(data: Partial<XacNhanThamDu>): XacNhanThamDuModel {
        return new XacNhanThamDuModel(data);
    }

    static createXacNhanThamDuPayload(data: Partial<XacNhanThamDu>): Partial<XacNhanThamDu> {
        return {
            thanhVienId: data.thanhVienId ?? 0,
            trangThaiThamDu: data.trangThaiThamDu ?? null,
            thoiGianCheckIn: data.thoiGianCheckIn ?? null,
        };
    }
}
