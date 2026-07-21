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
        this._lichSuId = data.lichSuId ?? null;
        this._nguoiDungId = LichSuTimKiemValidator.validatePositiveNumber(data.nguoiDungId, 'NguoiDungId');
        this._tuKhoaTimKiem = data.tuKhoaTimKiem ?? null;
        this._boLocTimKiem = data.boLocTimKiem ?? null;
        this._thoiGianTimKiem = data.thoiGianTimKiem ?? null;
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
        this._tuKhoaTimKiem = newTuKhoaTimKiem ?? null;
    }

    updateBoLocTimKiem(newBoLocTimKiem: string | null | undefined): void {
        this._boLocTimKiem = newBoLocTimKiem ?? null;
    }

    static createLichSuTimKiemModel(data: Partial<LichSuTimKiem>): LichSuTimKiemModel {
        return new LichSuTimKiemModel(data);
    }

    static createLichSuTimKiemPayload(data: Partial<LichSuTimKiem>): Partial<LichSuTimKiem> {
        return {
            nguoiDungId: data.nguoiDungId ?? 0,
            tuKhoaTimKiem: data.tuKhoaTimKiem ?? null,
            boLocTimKiem: data.boLocTimKiem ?? null,
            thoiGianTimKiem: data.thoiGianTimKiem ?? null,
        };
    }
}

