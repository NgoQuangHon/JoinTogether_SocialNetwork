import { PhongTroChuyenValidator } from '../../validators/group4-interaction/phongTroChuyen.validator';

export interface PhongTroChuyen {
    phongId?: number | null;
    hoatDongId?: number | null;
    tenPhong?: string | null;
    loaiPhong?: string | null;
    trangThai?: string | null;
    ngayTao?: Date | string | null;
    hetHanLuc?: Date | string | null;
}

export class PhongTroChuyenModel {
    private readonly _phongId?: number | null;
    private _hoatDongId?: number | null;
    private _tenPhong?: string | null;
    private _trangThai?: string | null;
    private readonly _ngayTao?: Date | string | null;

    constructor(data: Partial<PhongTroChuyen> = {}) {
        this._phongId = data.phongId === undefined || data.phongId === null ? null : data.phongId;
        this._hoatDongId = data.hoatDongId === undefined || data.hoatDongId === null ? null : data.hoatDongId;
        this._tenPhong = data.tenPhong === undefined || data.tenPhong === null ? null : data.tenPhong;
        this._trangThai = data.trangThai === undefined || data.trangThai === null ? null : data.trangThai;
        this._ngayTao = data.ngayTao === undefined || data.ngayTao === null ? null : data.ngayTao;
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
        this._tenPhong = newTenPhong === undefined || newTenPhong === null ? null : newTenPhong;
    }

    updateTrangThai(newTrangThai: string | null | undefined): void {
        this._trangThai = newTrangThai === undefined || newTrangThai === null ? null : newTrangThai;
    }

    static createPhongTroChuyenModel(data: Partial<PhongTroChuyen>): PhongTroChuyenModel {
        return new PhongTroChuyenModel(data);
    }

    static createPhongTroChuyenPayload(data: Partial<PhongTroChuyen>): Partial<PhongTroChuyen> {
        return {
            hoatDongId: data.hoatDongId === undefined || data.hoatDongId === null ? null : data.hoatDongId,
            tenPhong: data.tenPhong === undefined || data.tenPhong === null ? null : data.tenPhong,
            trangThai: data.trangThai === undefined || data.trangThai === null ? null : data.trangThai,
            ngayTao: data.ngayTao === undefined || data.ngayTao === null ? null : data.ngayTao,
        };
    }
}

