import { PhongTroChuyenValidator } from '../../validators/group4-interaction/phongTroChuyen.validator';

export interface PhongTroChuyen {
    phongId?: number | null;
    hoatDongId?: number | null;
    tenPhong?: string | null;
    trangThai?: string | null;
    ngayTao?: Date | string | null;
}

export class PhongTroChuyenModel {
    private readonly _phongId?: number | null;
    private _hoatDongId?: number | null;
    private _tenPhong?: string | null;
    private _trangThai?: string | null;
    private readonly _ngayTao?: Date | string | null;

    constructor(data: Partial<PhongTroChuyen> = {}) {
        this._phongId = data.phongId ?? null;
        this._hoatDongId = data.hoatDongId ?? null;
        this._tenPhong = data.tenPhong ?? null;
        this._trangThai = data.trangThai ?? null;
        this._ngayTao = data.ngayTao ?? null;
    }

    get phongId(): number | null | undefined {
        return this._phongId;
    }

    get hoatDongId(): number | null | undefined {
        return this._hoatDongId;
    }

    get tenPhong(): string | null | undefined {
        return this._tenPhong;
    }

    get trangThai(): string | null | undefined {
        return this._trangThai;
    }

    get ngayTao(): Date | string | null | undefined {
        return this._ngayTao;
    }

    updateTenPhong(newTenPhong: string | null | undefined): void {
        this._tenPhong = newTenPhong ?? null;
    }

    updateTrangThai(newTrangThai: string | null | undefined): void {
        this._trangThai = newTrangThai ?? null;
    }

    static createPhongTroChuyenModel(data: Partial<PhongTroChuyen>): PhongTroChuyenModel {
        return new PhongTroChuyenModel(data);
    }

    static createPhongTroChuyenPayload(data: Partial<PhongTroChuyen>): Partial<PhongTroChuyen> {
        return {
            hoatDongId: data.hoatDongId ?? null,
            tenPhong: data.tenPhong ?? null,
            trangThai: data.trangThai ?? null,
            ngayTao: data.ngayTao ?? null,
        };
    }
}

