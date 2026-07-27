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
        this._baoCaoId = data.baoCaoId === undefined || data.baoCaoId === null ? null : data.baoCaoId;
        this._nguoiBaoCaoId = data.nguoiBaoCaoId === undefined || data.nguoiBaoCaoId === null ? null : data.nguoiBaoCaoId;
        this._nguoiBiBaoCaoId = data.nguoiBiBaoCaoId === undefined || data.nguoiBiBaoCaoId === null ? null : data.nguoiBiBaoCaoId;
        this._loaiViPhamId = data.loaiViPhamId === undefined || data.loaiViPhamId === null ? null : data.loaiViPhamId;
        this._noiDung = data.noiDung === undefined || data.noiDung === null ? null : data.noiDung;
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
        this._noiDung = newNoiDung === undefined || newNoiDung === null ? null : newNoiDung;
    }

    static createBaoCaoViPhamModel(data: Partial<BaoCaoViPham>): BaoCaoViPhamModel {
        return new BaoCaoViPhamModel(data);
    }

    static createBaoCaoViPhamPayload(data: Partial<BaoCaoViPham>): Partial<BaoCaoViPham> {
        return {
            nguoiBaoCaoId: data.nguoiBaoCaoId === undefined || data.nguoiBaoCaoId === null ? null : data.nguoiBaoCaoId,
            nguoiBiBaoCaoId: data.nguoiBiBaoCaoId === undefined || data.nguoiBiBaoCaoId === null ? null : data.nguoiBiBaoCaoId,
            loaiViPhamId: data.loaiViPhamId === undefined || data.loaiViPhamId === null ? null : data.loaiViPhamId,
            noiDung: data.noiDung === undefined || data.noiDung === null ? null : data.noiDung,
        };
    }
}

