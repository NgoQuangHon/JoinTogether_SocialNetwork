import { DiemUyTinValidator } from '../../validators/group5-review/diemUyTin.validator';

export interface DiemUyTin {
    diemUyTinId?: number | null;
    nguoiDungId: number;
    diemHienTai?: number | null;
    soLuotDanhGia?: number | null;
    soLanCanhBao?: number | null;
}

export class DiemUyTinModel {
    private readonly _diemUyTinId?: number | null;
    private _nguoiDungId: number;
    private _diemHienTai?: number | null;
    private _soLuotDanhGia?: number | null;
    private _soLanCanhBao?: number | null;

    constructor(data: Partial<DiemUyTin> = {}) {
        this._diemUyTinId = data.diemUyTinId === undefined || data.diemUyTinId === null ? null : data.diemUyTinId;
        this._nguoiDungId = DiemUyTinValidator.validatePositiveNumber(data.nguoiDungId, 'NguoiDungId');
        this._diemHienTai = data.diemHienTai === undefined || data.diemHienTai === null ? null : data.diemHienTai;
        this._soLuotDanhGia = data.soLuotDanhGia === undefined || data.soLuotDanhGia === null ? null : data.soLuotDanhGia;
        this._soLanCanhBao = data.soLanCanhBao === undefined || data.soLanCanhBao === null ? null : data.soLanCanhBao;
    }

    get diemUyTinId(): number | null | undefined {
        return this._diemUyTinId;
    }

    get nguoiDungId(): number {
        return this._nguoiDungId;
    }

    get diemHienTai(): number | null | undefined {
        return this._diemHienTai;
    }

    get soLuotDanhGia(): number | null | undefined {
        return this._soLuotDanhGia;
    }

    get soLanCanhBao(): number | null | undefined {
        return this._soLanCanhBao;
    }

    updateDiemHienTai(newDiemHienTai: number | null | undefined): void {
        this._diemHienTai = newDiemHienTai === undefined || newDiemHienTai === null ? null : newDiemHienTai;
    }

    updateSoLuotDanhGia(newSoLuotDanhGia: number | null | undefined): void {
        this._soLuotDanhGia = newSoLuotDanhGia === undefined || newSoLuotDanhGia === null ? null : newSoLuotDanhGia;
    }

    updateSoLanCanhBao(newSoLanCanhBao: number | null | undefined): void {
        this._soLanCanhBao = newSoLanCanhBao === undefined || newSoLanCanhBao === null ? null : newSoLanCanhBao;
    }

    static createDiemUyTinModel(data: Partial<DiemUyTin>): DiemUyTinModel {
        return new DiemUyTinModel(data);
    }

    static createDiemUyTinPayload(data: Partial<DiemUyTin>): Partial<DiemUyTin> {
        return {
            nguoiDungId: data.nguoiDungId === undefined || data.nguoiDungId === null ? 0 : data.nguoiDungId,
            diemHienTai: data.diemHienTai === undefined || data.diemHienTai === null ? null : data.diemHienTai,
            soLuotDanhGia: data.soLuotDanhGia === undefined || data.soLuotDanhGia === null ? null : data.soLuotDanhGia,
            soLanCanhBao: data.soLanCanhBao === undefined || data.soLanCanhBao === null ? null : data.soLanCanhBao,
        };
    }
}

