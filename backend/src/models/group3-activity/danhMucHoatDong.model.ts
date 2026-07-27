import { DanhMucHoatDongValidator } from '../../validators/group3-activity/danhMucHoatDong.validator';

export interface DanhMucHoatDong {
    danhMucHoatDongId?: number | null;
    tenDanhMuc: string;
    moTa?: string | null;
}

export class DanhMucHoatDongModel {
    private readonly _danhMucHoatDongId?: number | null;
    private _tenDanhMuc: string;
    private _moTa?: string | null;

    constructor(data: Partial<DanhMucHoatDong> = {}) {
        this._danhMucHoatDongId = data.danhMucHoatDongId === undefined || data.danhMucHoatDongId === null ? null : data.danhMucHoatDongId;
        this._tenDanhMuc = DanhMucHoatDongValidator.validateRequiredString(data.tenDanhMuc, 'Tên danh mục hoạt động');
        this._moTa = data.moTa === undefined || data.moTa === null ? null : data.moTa;
    }

    get danhMucHoatDongId(): number | null | undefined {
        return this._danhMucHoatDongId;
    }

    get tenDanhMuc(): string {
        return this._tenDanhMuc;
    }

    get moTa(): string | null | undefined {
        return this._moTa;
    }

    updateTenDanhMuc(newTenDanhMuc: string): void {
        this._tenDanhMuc = DanhMucHoatDongValidator.validateRequiredString(newTenDanhMuc, 'Tên danh mục hoạt động');
    }

    updateMoTa(newMoTa: string | null | undefined): void {
        this._moTa = newMoTa === undefined || newMoTa === null ? null : newMoTa;
    }

    static createDanhMucHoatDongModel(data: Partial<DanhMucHoatDong>): DanhMucHoatDongModel {
        return new DanhMucHoatDongModel(data);
    }

    static createDanhMucHoatDongPayload(data: Partial<DanhMucHoatDong>): Partial<DanhMucHoatDong> {
        return {
            tenDanhMuc: data.tenDanhMuc === undefined || data.tenDanhMuc === null ? '' : data.tenDanhMuc,
            moTa: data.moTa === undefined || data.moTa === null ? null : data.moTa,
        };
    }
}
