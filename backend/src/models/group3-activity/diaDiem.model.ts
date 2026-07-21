import { DiaDiemValidator } from '../../validators/group3-activity/diaDiem.validator';

export interface DiaDiem {
    diaDiemId?: number | null;
    tenDiaDiem?: string | null;
    diaChi?: string | null;
    hinhThuc?: string | null;
    duongDanTrucTuyen?: string | null;
}

export class DiaDiemModel {
    private readonly _diaDiemId?: number | null;
    private _tenDiaDiem?: string | null;
    private _diaChi?: string | null;
    private _hinhThuc?: string | null;
    private _duongDanTrucTuyen?: string | null;

    constructor(data: Partial<DiaDiem> = {}) {
        this._diaDiemId = data.diaDiemId ?? null;
        this._tenDiaDiem = data.tenDiaDiem ?? null;
        this._diaChi = data.diaChi ?? null;
        this._hinhThuc = data.hinhThuc ?? null;
        this._duongDanTrucTuyen = data.duongDanTrucTuyen ?? null;
    }

    get diaDiemId(): number | null | undefined {
        return this._diaDiemId;
    }

    get tenDiaDiem(): string | null | undefined {
        return this._tenDiaDiem;
    }

    get diaChi(): string | null | undefined {
        return this._diaChi;
    }

    get hinhThuc(): string | null | undefined {
        return this._hinhThuc;
    }

    get duongDanTrucTuyen(): string | null | undefined {
        return this._duongDanTrucTuyen;
    }

    updateTenDiaDiem(newTenDiaDiem: string | null | undefined): void {
        this._tenDiaDiem = newTenDiaDiem
            ? DiaDiemValidator.validateRequiredString(newTenDiaDiem, 'Tên địa điểm')
            : null;
    }

    updateDiaChi(newDiaChi: string | null | undefined): void {
        this._diaChi = newDiaChi ? DiaDiemValidator.validateRequiredString(newDiaChi, 'Địa chỉ') : null;
    }

    updateHinhThuc(newHinhThuc: string | null | undefined): void {
        this._hinhThuc = newHinhThuc ? DiaDiemValidator.validateRequiredString(newHinhThuc, 'Hình thức') : null;
    }

    updateDuongDanTrucTuyen(newDuongDanTrucTuyen: string | null | undefined): void {
        this._duongDanTrucTuyen = newDuongDanTrucTuyen
            ? DiaDiemValidator.validateRequiredString(newDuongDanTrucTuyen, 'Đường dẫn trực tuyến')
            : null;
    }

    static createDiaDiemModel(data: Partial<DiaDiem>): DiaDiemModel {
        return new DiaDiemModel(data);
    }

    static createDiaDiemPayload(data: Partial<DiaDiem>): Partial<DiaDiem> {
        return {
            tenDiaDiem: data.tenDiaDiem ?? null,
            diaChi: data.diaChi ?? null,
            hinhThuc: data.hinhThuc ?? null,
            duongDanTrucTuyen: data.duongDanTrucTuyen ?? null,
        };
    }
}
