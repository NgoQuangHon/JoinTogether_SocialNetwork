import { TinNhanValidator } from '../../validators/group4-interaction/tinNhan.validator';

export interface TinNhan {
    tinNhanId?: number | null;
    phongId: number;
    nguoiGuiId?: number | null;
    noiDung: string;
    thoiGianGui?: Date | string | null;
}

export class TinNhanModel {
    private readonly _tinNhanId?: number | null;
    private _phongId: number;
    private _nguoiGuiId?: number | null;
    private _noiDung: string;
    private readonly _thoiGianGui?: Date | string | null;

    constructor(data: Partial<TinNhan> = {}) {
        this._tinNhanId = data.tinNhanId ?? null;
        this._phongId = TinNhanValidator.validatePositiveNumber(data.phongId, 'PhongId');
        this._nguoiGuiId = data.nguoiGuiId ?? null;
        this._noiDung = TinNhanValidator.validateRequiredString(data.noiDung, 'Nội dung');
        this._thoiGianGui = data.thoiGianGui ?? null;
    }

    get tinNhanId(): number | null | undefined {
        return this._tinNhanId;
    }

    get phongId(): number {
        return this._phongId;
    }

    get nguoiGuiId(): number | null | undefined {
        return this._nguoiGuiId;
    }

    get noiDung(): string {
        return this._noiDung;
    }

    get thoiGianGui(): Date | string | null | undefined {
        return this._thoiGianGui;
    }

    updateNoiDung(newNoiDung: string): void {
        this._noiDung = TinNhanValidator.validateRequiredString(newNoiDung, 'Nội dung');
    }

    static createTinNhanModel(data: Partial<TinNhan>): TinNhanModel {
        return new TinNhanModel(data);
    }

    static createTinNhanPayload(data: Partial<TinNhan>): Partial<TinNhan> {
        return {
            phongId: data.phongId ?? 0,
            nguoiGuiId: data.nguoiGuiId ?? null,
            noiDung: data.noiDung ?? '',
            thoiGianGui: data.thoiGianGui ?? null,
        };
    }
}

