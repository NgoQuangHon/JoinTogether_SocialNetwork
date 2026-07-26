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
        this._diaDiemId = data.diaDiemId === undefined || data.diaDiemId === null ? null : data.diaDiemId;
        this._tenDiaDiem = data.tenDiaDiem === undefined || data.tenDiaDiem === null ? null : data.tenDiaDiem;
        this._diaChi = data.diaChi === undefined || data.diaChi === null ? null : data.diaChi;
        this._hinhThuc = data.hinhThuc === undefined || data.hinhThuc === null ? null : data.hinhThuc;
        this._duongDanTrucTuyen = data.duongDanTrucTuyen === undefined || data.duongDanTrucTuyen === null ? null : data.duongDanTrucTuyen;
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
            tenDiaDiem: data.tenDiaDiem === undefined || data.tenDiaDiem === null ? null : data.tenDiaDiem,
            diaChi: data.diaChi === undefined || data.diaChi === null ? null : data.diaChi,
            hinhThuc: data.hinhThuc === undefined || data.hinhThuc === null ? null : data.hinhThuc,
            duongDanTrucTuyen: data.duongDanTrucTuyen === undefined || data.duongDanTrucTuyen === null ? null : data.duongDanTrucTuyen,
        };
    }
}
