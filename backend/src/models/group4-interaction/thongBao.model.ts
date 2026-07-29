import { ThongBaoValidator } from '../../validators/group4-interaction/thongBao.validator';

export interface ThongBao {
    thongBaoId?: number | null;
    nguoiNhanId: number;
    tieuDe?: string | null;
    noiDung?: string | null;
    loaiThongBao?: string | null;
    duongDan?: string | null;
}

export class ThongBaoModel {
    private readonly _thongBaoId?: number | null;
    private _nguoiNhanId: number;
    private _tieuDe?: string | null;
    private _noiDung?: string | null;
    private _loaiThongBao?: string | null;
    private _duongDan?: string | null;

    constructor(data: Partial<ThongBao> = {}) {
        this._thongBaoId = data.thongBaoId === undefined || data.thongBaoId === null ? null : data.thongBaoId;
        this._nguoiNhanId = ThongBaoValidator.validatePositiveNumber(data.nguoiNhanId, 'NguoiNhanId');
        this._tieuDe = data.tieuDe === undefined || data.tieuDe === null ? null : data.tieuDe;
        this._noiDung = data.noiDung === undefined || data.noiDung === null ? null : data.noiDung;
        this._loaiThongBao = data.loaiThongBao === undefined || data.loaiThongBao === null ? null : data.loaiThongBao;
        this._duongDan = data.duongDan === undefined || data.duongDan === null ? null : data.duongDan;
    }

    get thongBaoId(): number | null | undefined {
        return this._thongBaoId;
    }

    get nguoiNhanId(): number {
        return this._nguoiNhanId;
    }

    get tieuDe(): string | null | undefined {
        return this._tieuDe;
    }

    get noiDung(): string | null | undefined {
        return this._noiDung;
    }

    get loaiThongBao(): string | null | undefined {
        return this._loaiThongBao;
    }

    get duongDan(): string | null | undefined {
        return this._duongDan;
    }

    updateTieuDe(newTieuDe: string | null | undefined): void {
        this._tieuDe = newTieuDe === undefined || newTieuDe === null ? null : newTieuDe;
    }

    updateNoiDung(newNoiDung: string | null | undefined): void {
        this._noiDung = newNoiDung === undefined || newNoiDung === null ? null : newNoiDung;
    }

    updateLoaiThongBao(newLoaiThongBao: string | null | undefined): void {
        this._loaiThongBao = newLoaiThongBao === undefined || newLoaiThongBao === null ? null : newLoaiThongBao;
    }

    updateDuongDan(newDuongDan: string | null | undefined): void {
        this._duongDan = newDuongDan === undefined || newDuongDan === null ? null : newDuongDan;
    }

    static createThongBaoModel(data: Partial<ThongBao>): ThongBaoModel {
        return new ThongBaoModel(data);
    }

    static createThongBaoPayload(data: Partial<ThongBao>): Partial<ThongBao> {
        return {
            nguoiNhanId: data.nguoiNhanId === undefined || data.nguoiNhanId === null ? 0 : data.nguoiNhanId,
            tieuDe: data.tieuDe === undefined || data.tieuDe === null ? null : data.tieuDe,
            noiDung: data.noiDung === undefined || data.noiDung === null ? null : data.noiDung,
            loaiThongBao: data.loaiThongBao === undefined || data.loaiThongBao === null ? null : data.loaiThongBao,
            duongDan: data.duongDan === undefined || data.duongDan === null ? null : data.duongDan,
        };
    }
}

