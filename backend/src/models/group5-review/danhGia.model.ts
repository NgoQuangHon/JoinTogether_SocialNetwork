import { DanhGiaValidator } from '../../validators/group5-review/danhGia.validator';

export interface DanhGia {
    danhGiaId?: number | null;
    hoatDongId?: number | null;
    nguoiDanhGiaId?: number | null;
    nguoiDuocDanhGiaId?: number | null;
    nhanXet?: string | null;
    diemTong?: number | null;
}

export class DanhGiaModel {
    private readonly _danhGiaId?: number | null;
    private _hoatDongId?: number | null;
    private _nguoiDanhGiaId?: number | null;
    private _nguoiDuocDanhGiaId?: number | null;
    private _nhanXet?: string | null;
    private _diemTong?: number | null;

    constructor(data: Partial<DanhGia> = {}) {
        this._danhGiaId = data.danhGiaId ?? null;
        this._hoatDongId = data.hoatDongId ?? null;
        this._nguoiDanhGiaId = data.nguoiDanhGiaId ?? null;
        this._nguoiDuocDanhGiaId = data.nguoiDuocDanhGiaId ?? null;
        this._nhanXet = data.nhanXet ?? null;
        this._diemTong = data.diemTong ?? null;
    }

    get danhGiaId(): number | null | undefined {
        return this._danhGiaId;
    }

    get hoatDongId(): number | null | undefined {
        return this._hoatDongId;
    }

    get nguoiDanhGiaId(): number | null | undefined {
        return this._nguoiDanhGiaId;
    }

    get nguoiDuocDanhGiaId(): number | null | undefined {
        return this._nguoiDuocDanhGiaId;
    }

    get nhanXet(): string | null | undefined {
        return this._nhanXet;
    }

    get diemTong(): number | null | undefined {
        return this._diemTong;
    }

    updateNhanXet(newNhanXet: string | null | undefined): void {
        this._nhanXet = newNhanXet ?? null;
    }

    updateDiemTong(newDiemTong: number | null | undefined): void {
        this._diemTong = newDiemTong ?? null;
    }

    static createDanhGiaModel(data: Partial<DanhGia>): DanhGiaModel {
        return new DanhGiaModel(data);
    }

    static createDanhGiaPayload(data: Partial<DanhGia>): Partial<DanhGia> {
        return {
            hoatDongId: data.hoatDongId ?? null,
            nguoiDanhGiaId: data.nguoiDanhGiaId ?? null,
            nguoiDuocDanhGiaId: data.nguoiDuocDanhGiaId ?? null,
            nhanXet: data.nhanXet ?? null,
            diemTong: data.diemTong ?? null,
        };
    }
}

