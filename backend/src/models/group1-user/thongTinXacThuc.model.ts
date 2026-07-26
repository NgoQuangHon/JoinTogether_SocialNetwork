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
        this._xacThucId = data.xacThucId === undefined || data.xacThucId === null ? null : data.xacThucId;
        this._taiKhoanId = ThongTinXacThucValidator.validatePositiveNumber(data.taiKhoanId, 'TaiKhoanId');
        this._loaiXacThuc = data.loaiXacThuc === undefined || data.loaiXacThuc === null ? null : data.loaiXacThuc;
        this._maXacThuc = data.maXacThuc === undefined || data.maXacThuc === null ? null : data.maXacThuc;
        this._thoiGianHetHan = data.thoiGianHetHan === undefined || data.thoiGianHetHan === null ? null : data.thoiGianHetHan;
        this._daSuDung = data.daSuDung === undefined || data.daSuDung === null ? false : data.daSuDung;
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
        this._maXacThuc = newMaXacThuc === undefined || newMaXacThuc === null ? null : newMaXacThuc;
    }

    updateLoaiXacThuc(newLoaiXacThuc: string | null | undefined): void {
        this._loaiXacThuc = newLoaiXacThuc === undefined || newLoaiXacThuc === null ? null : newLoaiXacThuc;
    }

    markAsUsed(daSuDung: boolean): void {
        this._daSuDung = daSuDung;
    }

    static createThongTinXacThucModel(data: Partial<ThongTinXacThuc>): ThongTinXacThucModel {
        return new ThongTinXacThucModel(data);
    }

    static createThongTinXacThucPayload(data: Partial<ThongTinXacThuc>): Partial<ThongTinXacThuc> {
        return {
            taiKhoanId: data.taiKhoanId === undefined || data.taiKhoanId === null ? 0 : data.taiKhoanId,
            loaiXacThuc: data.loaiXacThuc === undefined || data.loaiXacThuc === null ? null : data.loaiXacThuc,
            maXacThuc: data.maXacThuc === undefined || data.maXacThuc === null ? null : data.maXacThuc,
            thoiGianHetHan: data.thoiGianHetHan === undefined || data.thoiGianHetHan === null ? null : data.thoiGianHetHan,
            daSuDung: data.daSuDung === undefined || data.daSuDung === null ? false : data.daSuDung,
        };
    }
}
