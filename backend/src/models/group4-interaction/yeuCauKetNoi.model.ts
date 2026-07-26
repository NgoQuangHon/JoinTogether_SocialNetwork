import { YeuCauKetNoiValidator } from '../../validators/group4-interaction/yeuCauKetNoi.validator';

export interface YeuCauKetNoi {
    yeuCauKetNoiId?: number | null;
    nguoiGuiId: number;
    nguoiNhanId: number;
    loiNhan?: string | null;
    trangThai?: string | null;
}

export class YeuCauKetNoiModel {
    private readonly _yeuCauKetNoiId?: number | null;
    private _nguoiGuiId: number;
    private _nguoiNhanId: number;
    private _loiNhan?: string | null;
    private _trangThai?: string | null;

    constructor(data: Partial<YeuCauKetNoi> = {}) {
        this._yeuCauKetNoiId = data.yeuCauKetNoiId === undefined || data.yeuCauKetNoiId === null ? null : data.yeuCauKetNoiId;
        this._nguoiGuiId = YeuCauKetNoiValidator.validatePositiveNumber(data.nguoiGuiId, 'NguoiGuiId');
        this._nguoiNhanId = YeuCauKetNoiValidator.validatePositiveNumber(data.nguoiNhanId, 'NguoiNhanId');
        this._loiNhan = data.loiNhan === undefined || data.loiNhan === null ? null : data.loiNhan;
        this._trangThai = data.trangThai === undefined || data.trangThai === null ? null : data.trangThai;
    }

    get yeuCauKetNoiId(): number | null | undefined {
        return this._yeuCauKetNoiId;
    }

    get nguoiGuiId(): number {
        return this._nguoiGuiId;
    }

    get nguoiNhanId(): number {
        return this._nguoiNhanId;
    }

    get loiNhan(): string | null | undefined {
        return this._loiNhan;
    }

    get trangThai(): string | null | undefined {
        return this._trangThai;
    }

    updateLoiNhan(newLoiNhan: string | null | undefined): void {
        this._loiNhan = newLoiNhan === undefined || newLoiNhan === null ? null : newLoiNhan;
    }

    updateTrangThai(newTrangThai: string | null | undefined): void {
        this._trangThai = newTrangThai === undefined || newTrangThai === null ? null : newTrangThai;
    }

    static createYeuCauKetNoiModel(data: Partial<YeuCauKetNoi>): YeuCauKetNoiModel {
        return new YeuCauKetNoiModel(data);
    }

    static createYeuCauKetNoiPayload(data: Partial<YeuCauKetNoi>): Partial<YeuCauKetNoi> {
        return {
            nguoiGuiId: data.nguoiGuiId === undefined || data.nguoiGuiId === null ? 0 : data.nguoiGuiId,
            nguoiNhanId: data.nguoiNhanId === undefined || data.nguoiNhanId === null ? 0 : data.nguoiNhanId,
            loiNhan: data.loiNhan === undefined || data.loiNhan === null ? null : data.loiNhan,
            trangThai: data.trangThai === undefined || data.trangThai === null ? null : data.trangThai,
        };
    }
}

