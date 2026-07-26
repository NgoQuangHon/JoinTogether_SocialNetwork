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
        this._danhGiaId = data.danhGiaId === undefined || data.danhGiaId === null ? null : data.danhGiaId;
        this._hoatDongId = data.hoatDongId === undefined || data.hoatDongId === null ? null : data.hoatDongId;
        this._nguoiDanhGiaId = data.nguoiDanhGiaId === undefined || data.nguoiDanhGiaId === null ? null : data.nguoiDanhGiaId;
        this._nguoiDuocDanhGiaId = data.nguoiDuocDanhGiaId === undefined || data.nguoiDuocDanhGiaId === null ? null : data.nguoiDuocDanhGiaId;
        this._nhanXet = data.nhanXet === undefined || data.nhanXet === null ? null : data.nhanXet;
        this._diemTong = data.diemTong === undefined || data.diemTong === null ? null : data.diemTong;
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
        this._nhanXet = newNhanXet === undefined || newNhanXet === null ? null : newNhanXet;
    }

    updateDiemTong(newDiemTong: number | null | undefined): void {
        this._diemTong = newDiemTong === undefined || newDiemTong === null ? null : newDiemTong;
    }

    static createDanhGiaModel(data: Partial<DanhGia>): DanhGiaModel {
        return new DanhGiaModel(data);
    }

    static createDanhGiaPayload(data: Partial<DanhGia>): Partial<DanhGia> {
        return {
            hoatDongId: data.hoatDongId === undefined || data.hoatDongId === null ? null : data.hoatDongId,
            nguoiDanhGiaId: data.nguoiDanhGiaId === undefined || data.nguoiDanhGiaId === null ? null : data.nguoiDanhGiaId,
            nguoiDuocDanhGiaId: data.nguoiDuocDanhGiaId === undefined || data.nguoiDuocDanhGiaId === null ? null : data.nguoiDuocDanhGiaId,
            nhanXet: data.nhanXet === undefined || data.nhanXet === null ? null : data.nhanXet,
            diemTong: data.diemTong === undefined || data.diemTong === null ? null : data.diemTong,
        };
    }
}

