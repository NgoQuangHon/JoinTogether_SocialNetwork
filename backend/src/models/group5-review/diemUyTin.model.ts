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
        this._diemUyTinId = data.diemUyTinId ?? null;
        this._nguoiDungId = DiemUyTinValidator.validatePositiveNumber(data.nguoiDungId, 'NguoiDungId');
        this._diemHienTai = data.diemHienTai ?? null;
        this._soLuotDanhGia = data.soLuotDanhGia ?? null;
        this._soLanCanhBao = data.soLanCanhBao ?? null;
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
        this._diemHienTai = newDiemHienTai ?? null;
    }

    updateSoLuotDanhGia(newSoLuotDanhGia: number | null | undefined): void {
        this._soLuotDanhGia = newSoLuotDanhGia ?? null;
    }

    updateSoLanCanhBao(newSoLanCanhBao: number | null | undefined): void {
        this._soLanCanhBao = newSoLanCanhBao ?? null;
    }

    static createDiemUyTinModel(data: Partial<DiemUyTin>): DiemUyTinModel {
        return new DiemUyTinModel(data);
    }

    static createDiemUyTinPayload(data: Partial<DiemUyTin>): Partial<DiemUyTin> {
        return {
            nguoiDungId: data.nguoiDungId ?? 0,
            diemHienTai: data.diemHienTai ?? null,
            soLuotDanhGia: data.soLuotDanhGia ?? null,
            soLanCanhBao: data.soLanCanhBao ?? null,
        };
    }
}

