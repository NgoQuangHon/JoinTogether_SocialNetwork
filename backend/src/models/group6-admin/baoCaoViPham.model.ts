import { BaoCaoViPhamValidator } from '../../validators/group6-admin/baoCaoViPham.validator';

export interface BaoCaoViPham {
    baoCaoId?: number | null;
    nguoiBaoCaoId?: number | null;
    nguoiBiBaoCaoId?: number | null;
    loaiViPhamId?: number | null;
    noiDung?: string | null;
}

export class BaoCaoViPhamModel {
    private readonly _baoCaoId?: number | null;
    private _nguoiBaoCaoId?: number | null;
    private _nguoiBiBaoCaoId?: number | null;
    private _loaiViPhamId?: number | null;
    private _noiDung?: string | null;

    constructor(data: Partial<BaoCaoViPham> = {}) {
        this._baoCaoId = data.baoCaoId ?? null;
        this._nguoiBaoCaoId = data.nguoiBaoCaoId ?? null;
        this._nguoiBiBaoCaoId = data.nguoiBiBaoCaoId ?? null;
        this._loaiViPhamId = data.loaiViPhamId ?? null;
        this._noiDung = data.noiDung ?? null;
    }

    get baoCaoId(): number | null | undefined {
        return this._baoCaoId;
    }

    get nguoiBaoCaoId(): number | null | undefined {
        return this._nguoiBaoCaoId;
    }

    get nguoiBiBaoCaoId(): number | null | undefined {
        return this._nguoiBiBaoCaoId;
    }

    get loaiViPhamId(): number | null | undefined {
        return this._loaiViPhamId;
    }

    get noiDung(): string | null | undefined {
        return this._noiDung;
    }

    updateNoiDung(newNoiDung: string | null | undefined): void {
        this._noiDung = newNoiDung ?? null;
    }

    static createBaoCaoViPhamModel(data: Partial<BaoCaoViPham>): BaoCaoViPhamModel {
        return new BaoCaoViPhamModel(data);
    }

    static createBaoCaoViPhamPayload(data: Partial<BaoCaoViPham>): Partial<BaoCaoViPham> {
        return {
            nguoiBaoCaoId: data.nguoiBaoCaoId ?? null,
            nguoiBiBaoCaoId: data.nguoiBiBaoCaoId ?? null,
            loaiViPhamId: data.loaiViPhamId ?? null,
            noiDung: data.noiDung ?? null,
        };
    }
}

