import { BangChungViPhamValidator } from '../../validators/group6-admin/bangChungViPham.validator';

export interface BangChungViPham {
    bangChungId?: number | null;
    baoCaoId: number;
    loaiBangChung?: string | null;
    duongDan: string;
}

export class BangChungViPhamModel {
    private readonly _bangChungId?: number | null;
    private _baoCaoId: number;
    private _loaiBangChung?: string | null;
    private _duongDan: string;

    constructor(data: Partial<BangChungViPham> = {}) {
        this._bangChungId = data.bangChungId ?? null;
        this._baoCaoId = BangChungViPhamValidator.validatePositiveNumber(data.baoCaoId, 'BaoCaoId');
        this._loaiBangChung = data.loaiBangChung ?? null;
        this._duongDan = BangChungViPhamValidator.validateRequiredString(data.duongDan, 'Đường dẫn');
    }

    get bangChungId(): number | null | undefined {
        return this._bangChungId;
    }

    get baoCaoId(): number {
        return this._baoCaoId;
    }

    get loaiBangChung(): string | null | undefined {
        return this._loaiBangChung;
    }

    get duongDan(): string {
        return this._duongDan;
    }

    updateLoaiBangChung(newLoaiBangChung: string | null | undefined): void {
        this._loaiBangChung = newLoaiBangChung ?? null;
    }

    updateDuongDan(newDuongDan: string): void {
        this._duongDan = BangChungViPhamValidator.validateRequiredString(newDuongDan, 'Đường dẫn');
    }

    static createBangChungViPhamModel(data: Partial<BangChungViPham>): BangChungViPhamModel {
        return new BangChungViPhamModel(data);
    }

    static createBangChungViPhamPayload(data: Partial<BangChungViPham>): Partial<BangChungViPham> {
        return {
            baoCaoId: data.baoCaoId ?? 0,
            loaiBangChung: data.loaiBangChung ?? null,
            duongDan: data.duongDan ?? '',
        };
    }
}

