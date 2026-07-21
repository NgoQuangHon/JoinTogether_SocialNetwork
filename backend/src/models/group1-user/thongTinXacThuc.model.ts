import { ThongTinXacThucValidator } from '../../validators/group1-user/thongTinXacThuc.validator';

export interface ThongTinXacThuc {
    xacThucId?: number | null;
    taiKhoanId: number;
    loaiXacThuc?: string | null;
    maXacThuc?: string | null;
    thoiGianHetHan?: Date | string | null;
    daSuDung?: boolean | null;
}

export class ThongTinXacThucModel {
    private readonly _xacThucId?: number | null;
    private _taiKhoanId: number;
    private _loaiXacThuc?: string | null;
    private _maXacThuc?: string | null;
    private _thoiGianHetHan?: Date | string | null;
    private _daSuDung?: boolean | null;

    constructor(data: Partial<ThongTinXacThuc> = {}) {
        this._xacThucId = data.xacThucId ?? null;
        this._taiKhoanId = ThongTinXacThucValidator.validatePositiveNumber(data.taiKhoanId, 'TaiKhoanId');
        this._loaiXacThuc = data.loaiXacThuc ?? null;
        this._maXacThuc = data.maXacThuc ?? null;
        this._thoiGianHetHan = data.thoiGianHetHan ?? null;
        this._daSuDung = data.daSuDung ?? false;
    }

    get xacThucId(): number | null | undefined {
        return this._xacThucId;
    }

    get taiKhoanId(): number {
        return this._taiKhoanId;
    }

    get loaiXacThuc(): string | null | undefined {
        return this._loaiXacThuc;
    }

    get maXacThuc(): string | null | undefined {
        return this._maXacThuc;
    }

    get thoiGianHetHan(): Date | string | null | undefined {
        return this._thoiGianHetHan;
    }

    get daSuDung(): boolean | null | undefined {
        return this._daSuDung;
    }

    updateMaXacThuc(newMaXacThuc: string | null | undefined): void {
        this._maXacThuc = newMaXacThuc ?? null;
    }

    updateLoaiXacThuc(newLoaiXacThuc: string | null | undefined): void {
        this._loaiXacThuc = newLoaiXacThuc ?? null;
    }

    markAsUsed(daSuDung: boolean): void {
        this._daSuDung = daSuDung;
    }

    static createThongTinXacThucModel(data: Partial<ThongTinXacThuc>): ThongTinXacThucModel {
        return new ThongTinXacThucModel(data);
    }

    static createThongTinXacThucPayload(data: Partial<ThongTinXacThuc>): Partial<ThongTinXacThuc> {
        return {
            taiKhoanId: data.taiKhoanId ?? 0,
            loaiXacThuc: data.loaiXacThuc ?? null,
            maXacThuc: data.maXacThuc ?? null,
            thoiGianHetHan: data.thoiGianHetHan ?? null,
            daSuDung: data.daSuDung ?? false,
        };
    }
}
