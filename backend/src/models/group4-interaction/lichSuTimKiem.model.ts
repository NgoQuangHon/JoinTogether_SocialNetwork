import { LichSuTimKiemValidator } from '../../validators/group4-interaction/lichSuTimKiem.validator';

export interface LichSuTimKiem {
    lichSuId?: number | null;
    nguoiDungId: number;
    tuKhoaTimKiem?: string | null;
    boLocTimKiem?: string | null;
    thoiGianTimKiem?: Date | string | null;
}

export class LichSuTimKiemModel {
    private readonly _lichSuId?: number | null;
    private _nguoiDungId: number;
    private _tuKhoaTimKiem?: string | null;
    private _boLocTimKiem?: string | null;
    private readonly _thoiGianTimKiem?: Date | string | null;

    constructor(data: Partial<LichSuTimKiem> = {}) {
        this._lichSuId = data.lichSuId === undefined || data.lichSuId === null ? null : data.lichSuId;
        this._nguoiDungId = LichSuTimKiemValidator.validatePositiveNumber(data.nguoiDungId, 'NguoiDungId');
        this._tuKhoaTimKiem = data.tuKhoaTimKiem === undefined || data.tuKhoaTimKiem === null ? null : data.tuKhoaTimKiem;
        this._boLocTimKiem = data.boLocTimKiem === undefined || data.boLocTimKiem === null ? null : data.boLocTimKiem;
        this._thoiGianTimKiem = data.thoiGianTimKiem === undefined || data.thoiGianTimKiem === null ? null : data.thoiGianTimKiem;
    }

    get lichSuId(): number | null | undefined {
        return this._lichSuId;
    }

    get nguoiDungId(): number {
        return this._nguoiDungId;
    }

    get tuKhoaTimKiem(): string | null | undefined {
        return this._tuKhoaTimKiem;
    }

    get boLocTimKiem(): string | null | undefined {
        return this._boLocTimKiem;
    }

    get thoiGianTimKiem(): Date | string | null | undefined {
        return this._thoiGianTimKiem;
    }

    updateTuKhoaTimKiem(newTuKhoaTimKiem: string | null | undefined): void {
        this._tuKhoaTimKiem = newTuKhoaTimKiem === undefined || newTuKhoaTimKiem === null ? null : newTuKhoaTimKiem;
    }

    updateBoLocTimKiem(newBoLocTimKiem: string | null | undefined): void {
        this._boLocTimKiem = newBoLocTimKiem === undefined || newBoLocTimKiem === null ? null : newBoLocTimKiem;
    }

    static createLichSuTimKiemModel(data: Partial<LichSuTimKiem>): LichSuTimKiemModel {
        return new LichSuTimKiemModel(data);
    }

    static createLichSuTimKiemPayload(data: Partial<LichSuTimKiem>): Partial<LichSuTimKiem> {
        return {
            nguoiDungId: data.nguoiDungId === undefined || data.nguoiDungId === null ? 0 : data.nguoiDungId,
            tuKhoaTimKiem: data.tuKhoaTimKiem === undefined || data.tuKhoaTimKiem === null ? null : data.tuKhoaTimKiem,
            boLocTimKiem: data.boLocTimKiem === undefined || data.boLocTimKiem === null ? null : data.boLocTimKiem,
            thoiGianTimKiem: data.thoiGianTimKiem === undefined || data.thoiGianTimKiem === null ? null : data.thoiGianTimKiem,
        };
    }
}

