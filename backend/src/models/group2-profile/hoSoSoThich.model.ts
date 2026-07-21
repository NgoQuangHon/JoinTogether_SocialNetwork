import { HoSoSoThichValidator } from '../../validators/group2-profile/hoSoSoThich.validator';

export interface HoSoSoThich {
    hoSoId: number;
    soThichId: number;
    mucDoQuanTam?: number | null;
}

export class HoSoSoThichModel {
    private _hoSoId: number;
    private _soThichId: number;
    private _mucDoQuanTam?: number | null;

    constructor(data: Partial<HoSoSoThich> = {}) {
        this._hoSoId = HoSoSoThichValidator.validatePositiveNumber(data.hoSoId, 'HoSoId');
        this._soThichId = HoSoSoThichValidator.validatePositiveNumber(data.soThichId, 'SoThichId');
        this._mucDoQuanTam = data.mucDoQuanTam ?? null;
    }

    get hoSoId(): number {
        return this._hoSoId;
    }

    get soThichId(): number {
        return this._soThichId;
    }

    get mucDoQuanTam(): number | null | undefined {
        return this._mucDoQuanTam;
    }

    updateMucDoQuanTam(newMucDoQuanTam: number | null | undefined): void {
        this._mucDoQuanTam = newMucDoQuanTam ?? null;
    }

    static createHoSoSoThichModel(data: Partial<HoSoSoThich>): HoSoSoThichModel {
        return new HoSoSoThichModel(data);
    }

    static createHoSoSoThichPayload(data: Partial<HoSoSoThich>): Partial<HoSoSoThich> {
        return {
            hoSoId: data.hoSoId ?? 0,
            soThichId: data.soThichId ?? 0,
            mucDoQuanTam: data.mucDoQuanTam ?? null,
        };
    }
}
