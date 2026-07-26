import { DanhMucSoThichValidator } from '../../validators/group2-profile/danhMucSoThich.validator';

export interface DanhMucSoThich {
    danhMucSoThichId?: number | null;
    tenDanhMuc: string;
    moTa?: string | null;
}

export class DanhMucSoThichModel {
    private readonly _danhMucSoThichId?: number | null;
    private _tenDanhMuc: string;
    private _moTa?: string | null;

    constructor(data: Partial<DanhMucSoThich> = {}) {
        this._danhMucSoThichId = data.danhMucSoThichId === undefined || data.danhMucSoThichId === null ? null : data.danhMucSoThichId;
        this._tenDanhMuc = DanhMucSoThichValidator.validateRequiredString(data.tenDanhMuc, 'Tên danh mục sở thích');
        this._moTa = data.moTa === undefined || data.moTa === null ? null : data.moTa;
    }

    get danhMucSoThichId(): number | null | undefined {
        return this._danhMucSoThichId;
    }

    get tenDanhMuc(): string {
        return this._tenDanhMuc;
    }

    get moTa(): string | null | undefined {
        return this._moTa;
    }

    updateTenDanhMuc(newTenDanhMuc: string): void {
        this._tenDanhMuc = DanhMucSoThichValidator.validateRequiredString(newTenDanhMuc, 'Tên danh mục sở thích');
    }

    updateMoTa(newMoTa: string | null | undefined): void {
        this._moTa = newMoTa === undefined || newMoTa === null ? null : newMoTa;
    }

    static createDanhMucSoThichModel(data: Partial<DanhMucSoThich>): DanhMucSoThichModel {
        return new DanhMucSoThichModel(data);
    }

    static createDanhMucSoThichPayload(data: Partial<DanhMucSoThich>): Partial<DanhMucSoThich> {
        return {
            tenDanhMuc: data.tenDanhMuc === undefined || data.tenDanhMuc === null ? '' : data.tenDanhMuc,
            moTa: data.moTa === undefined || data.moTa === null ? null : data.moTa,
        };
    }
}
