import { LichSuDiemUyTinValidator } from '../../validators/group5-review/lichSuDiemUyTin.validator';

export interface LichSuDiemUyTin {
    lichSuId?: number | null;
    diemUyTinId: number;
    diemThayDoi: number;
    lyDoThayDoi?: string | null;
    thoiGianCapNhat?: Date | string | null;
}

export class LichSuDiemUyTinModel {
    private readonly _lichSuId?: number | null;
    private _diemUyTinId: number;
    private _diemThayDoi: number;
    private _lyDoThayDoi?: string | null;
    private readonly _thoiGianCapNhat?: Date | string | null;

    constructor(data: Partial<LichSuDiemUyTin> = {}) {
        this._lichSuId = data.lichSuId ?? null;
        this._diemUyTinId = LichSuDiemUyTinValidator.validatePositiveNumber(data.diemUyTinId, 'DiemUyTinId');
        this._diemThayDoi = LichSuDiemUyTinValidator.validateRequiredNumber(data.diemThayDoi, 'DiemThayDoi');
        this._lyDoThayDoi = data.lyDoThayDoi ?? null;
        this._thoiGianCapNhat = data.thoiGianCapNhat ?? null;
    }

    get lichSuId(): number | null | undefined {
        return this._lichSuId;
    }

    get diemUyTinId(): number {
        return this._diemUyTinId;
    }

    get diemThayDoi(): number {
        return this._diemThayDoi;
    }

    get lyDoThayDoi(): string | null | undefined {
        return this._lyDoThayDoi;
    }

    get thoiGianCapNhat(): Date | string | null | undefined {
        return this._thoiGianCapNhat;
    }

    updateLyDoThayDoi(newLyDoThayDoi: string | null | undefined): void {
        this._lyDoThayDoi = newLyDoThayDoi ?? null;
    }

    static createLichSuDiemUyTinModel(data: Partial<LichSuDiemUyTin>): LichSuDiemUyTinModel {
        return new LichSuDiemUyTinModel(data);
    }

    static createLichSuDiemUyTinPayload(data: Partial<LichSuDiemUyTin>): Partial<LichSuDiemUyTin> {
        return {
            diemUyTinId: data.diemUyTinId ?? 0,
            diemThayDoi: data.diemThayDoi ?? 0,
            lyDoThayDoi: data.lyDoThayDoi ?? null,
            thoiGianCapNhat: data.thoiGianCapNhat ?? null,
        };
    }
}

