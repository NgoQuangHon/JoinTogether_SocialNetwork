import { SoThichValidator } from '../../validators/group2-profile/soThich.validator';

export interface SoThich {
    soThichId?: number | null;
    danhMucSoThichId?: number | null;
    tenSoThich: string;
    moTa?: string | null;
}

export class SoThichModel {
    private readonly _soThichId?: number | null;
    private _danhMucSoThichId?: number | null;
    private _tenSoThich: string;
    private _moTa?: string | null;

    constructor(data: Partial<SoThich> = {}) {
        this._soThichId = data.soThichId === undefined || data.soThichId === null ? null : data.soThichId;
        this._danhMucSoThichId = data.danhMucSoThichId === undefined || data.danhMucSoThichId === null ? null : data.danhMucSoThichId;
        this._tenSoThich = SoThichValidator.validateRequiredString(data.tenSoThich, 'Tên sở thích');
        this._moTa = data.moTa === undefined || data.moTa === null ? null : data.moTa;
    }

    get soThichId(): number | null | undefined {
        return this._soThichId;
    }

    get danhMucSoThichId(): number | null | undefined {
        return this._danhMucSoThichId;
    }

    get tenSoThich(): string {
        return this._tenSoThich;
    }

    get moTa(): string | null | undefined {
        return this._moTa;
    }

    updateTenSoThich(newTenSoThich: string): void {
        this._tenSoThich = SoThichValidator.validateRequiredString(newTenSoThich, 'Tên sở thích');
    }

    updateMoTa(newMoTa: string | null | undefined): void {
        this._moTa = newMoTa === undefined || newMoTa === null ? null : newMoTa;
    }

    static createSoThichModel(data: Partial<SoThich>): SoThichModel {
        return new SoThichModel(data);
    }

    static createSoThichPayload(data: Partial<SoThich>): Partial<SoThich> {
        return {
            danhMucSoThichId: data.danhMucSoThichId === undefined || data.danhMucSoThichId === null ? null : data.danhMucSoThichId,
            tenSoThich: data.tenSoThich === undefined || data.tenSoThich === null ? '' : data.tenSoThich,
            moTa: data.moTa === undefined || data.moTa === null ? null : data.moTa,
        };
    }
}
