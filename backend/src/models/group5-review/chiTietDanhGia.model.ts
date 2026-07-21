import { ChiTietDanhGiaValidator } from '../../validators/group5-review/chiTietDanhGia.validator';

export interface ChiTietDanhGia {
    danhGiaId: number;
    tieuChiDanhGiaId: number;
    diem?: number | null;
}

export class ChiTietDanhGiaModel {
    private _danhGiaId: number;
    private _tieuChiDanhGiaId: number;
    private _diem?: number | null;

    constructor(data: Partial<ChiTietDanhGia> = {}) {
        this._danhGiaId = ChiTietDanhGiaValidator.validatePositiveNumber(data.danhGiaId, 'DanhGiaId');
        this._tieuChiDanhGiaId = ChiTietDanhGiaValidator.validatePositiveNumber(data.tieuChiDanhGiaId, 'TieuChiDanhGiaId');
        this._diem = data.diem ?? null;
    }

    get danhGiaId(): number {
        return this._danhGiaId;
    }

    get tieuChiDanhGiaId(): number {
        return this._tieuChiDanhGiaId;
    }

    get diem(): number | null | undefined {
        return this._diem;
    }

    updateDiem(newDiem: number | null | undefined): void {
        this._diem = newDiem ?? null;
    }

    static createChiTietDanhGiaModel(data: Partial<ChiTietDanhGia>): ChiTietDanhGiaModel {
        return new ChiTietDanhGiaModel(data);
    }

    static createChiTietDanhGiaPayload(data: Partial<ChiTietDanhGia>): Partial<ChiTietDanhGia> {
        return {
            danhGiaId: data.danhGiaId ?? 0,
            tieuChiDanhGiaId: data.tieuChiDanhGiaId ?? 0,
            diem: data.diem ?? null,
        };
    }
}

