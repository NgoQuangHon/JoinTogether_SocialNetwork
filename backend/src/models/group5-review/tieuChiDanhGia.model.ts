import { TieuChiDanhGiaValidator } from '../../validators/group5-review/tieuChiDanhGia.validator';

export interface TieuChiDanhGia {
    tieuChiDanhGiaId?: number | null;
    tenTieuChi: string;
    trongSo?: number | null;
    diemToiDa?: number | null;
}

export class TieuChiDanhGiaModel {
    private readonly _tieuChiDanhGiaId?: number | null;
    private _tenTieuChi: string;
    private _trongSo?: number | null;
    private _diemToiDa?: number | null;

    constructor(data: Partial<TieuChiDanhGia> = {}) {
        this._tieuChiDanhGiaId = data.tieuChiDanhGiaId ?? null;
        this._tenTieuChi = TieuChiDanhGiaValidator.validateRequiredString(data.tenTieuChi, 'Tên tiêu chí');
        this._trongSo = data.trongSo ?? null;
        this._diemToiDa = data.diemToiDa ?? null;
    }

    get tieuChiDanhGiaId(): number | null | undefined {
        return this._tieuChiDanhGiaId;
    }

    get tenTieuChi(): string {
        return this._tenTieuChi;
    }

    get trongSo(): number | null | undefined {
        return this._trongSo;
    }

    get diemToiDa(): number | null | undefined {
        return this._diemToiDa;
    }

    updateTenTieuChi(newTenTieuChi: string): void {
        this._tenTieuChi = TieuChiDanhGiaValidator.validateRequiredString(newTenTieuChi, 'Tên tiêu chí');
    }

    updateTrongSo(newTrongSo: number | null | undefined): void {
        this._trongSo = newTrongSo ?? null;
    }

    updateDiemToiDa(newDiemToiDa: number | null | undefined): void {
        this._diemToiDa = newDiemToiDa ?? null;
    }

    static createTieuChiDanhGiaModel(data: Partial<TieuChiDanhGia>): TieuChiDanhGiaModel {
        return new TieuChiDanhGiaModel(data);
    }

    static createTieuChiDanhGiaPayload(data: Partial<TieuChiDanhGia>): Partial<TieuChiDanhGia> {
        return {
            tenTieuChi: data.tenTieuChi ?? '',
            trongSo: data.trongSo ?? null,
            diemToiDa: data.diemToiDa ?? null,
        };
    }
}

