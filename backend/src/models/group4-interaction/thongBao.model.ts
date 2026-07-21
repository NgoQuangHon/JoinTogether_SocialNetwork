import { ThongBaoValidator } from '../../validators/group4-interaction/thongBao.validator';

export interface ThongBao {
    thongBaoId?: number | null;
    nguoiNhanId: number;
    tieuDe?: string | null;
    noiDung?: string | null;
    loaiThongBao?: string | null;
}

export class ThongBaoModel {
    private readonly _thongBaoId?: number | null;
    private _nguoiNhanId: number;
    private _tieuDe?: string | null;
    private _noiDung?: string | null;
    private _loaiThongBao?: string | null;

    constructor(data: Partial<ThongBao> = {}) {
        this._thongBaoId = data.thongBaoId ?? null;
        this._nguoiNhanId = ThongBaoValidator.validatePositiveNumber(data.nguoiNhanId, 'NguoiNhanId');
        this._tieuDe = data.tieuDe ?? null;
        this._noiDung = data.noiDung ?? null;
        this._loaiThongBao = data.loaiThongBao ?? null;
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

    updateTieuDe(newTieuDe: string | null | undefined): void {
        this._tieuDe = newTieuDe ?? null;
    }

    updateNoiDung(newNoiDung: string | null | undefined): void {
        this._noiDung = newNoiDung ?? null;
    }

    updateLoaiThongBao(newLoaiThongBao: string | null | undefined): void {
        this._loaiThongBao = newLoaiThongBao ?? null;
    }

    static createThongBaoModel(data: Partial<ThongBao>): ThongBaoModel {
        return new ThongBaoModel(data);
    }

    static createThongBaoPayload(data: Partial<ThongBao>): Partial<ThongBao> {
        return {
            nguoiNhanId: data.nguoiNhanId ?? 0,
            tieuDe: data.tieuDe ?? null,
            noiDung: data.noiDung ?? null,
            loaiThongBao: data.loaiThongBao ?? null,
        };
    }
}

