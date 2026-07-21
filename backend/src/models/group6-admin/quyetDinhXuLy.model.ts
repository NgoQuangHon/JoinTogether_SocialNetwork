import { QuyetDinhXuLyValidator } from '../../validators/group6-admin/quyetDinhXuLy.validator';

export interface QuyetDinhXuLy {
    quyetDinhId?: number | null;
    baoCaoId: number;
    nguoiXuLyId?: number | null;
    ketQua?: string | null;
    ngayXuLy?: Date | string | null;
}

export class QuyetDinhXuLyModel {
    private readonly _quyetDinhId?: number | null;
    private _baoCaoId: number;
    private _nguoiXuLyId?: number | null;
    private _ketQua?: string | null;
    private readonly _ngayXuLy?: Date | string | null;

    constructor(data: Partial<QuyetDinhXuLy> = {}) {
        this._quyetDinhId = data.quyetDinhId ?? null;
        this._baoCaoId = QuyetDinhXuLyValidator.validatePositiveNumber(data.baoCaoId, 'BaoCaoId');
        this._nguoiXuLyId = data.nguoiXuLyId ?? null;
        this._ketQua = data.ketQua ?? null;
        this._ngayXuLy = data.ngayXuLy ?? null;
    }

    get quyetDinhId(): number | null | undefined {
        return this._quyetDinhId;
    }

    get baoCaoId(): number {
        return this._baoCaoId;
    }

    get nguoiXuLyId(): number | null | undefined {
        return this._nguoiXuLyId;
    }

    get ketQua(): string | null | undefined {
        return this._ketQua;
    }

    get ngayXuLy(): Date | string | null | undefined {
        return this._ngayXuLy;
    }

    updateKetQua(newKetQua: string | null | undefined): void {
        this._ketQua = newKetQua ?? null;
    }

    static createQuyetDinhXuLyModel(data: Partial<QuyetDinhXuLy>): QuyetDinhXuLyModel {
        return new QuyetDinhXuLyModel(data);
    }

    static createQuyetDinhXuLyPayload(data: Partial<QuyetDinhXuLy>): Partial<QuyetDinhXuLy> {
        return {
            baoCaoId: data.baoCaoId ?? 0,
            nguoiXuLyId: data.nguoiXuLyId ?? null,
            ketQua: data.ketQua ?? null,
            ngayXuLy: data.ngayXuLy ?? null,
        };
    }
}

