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
        this._quyetDinhId = data.quyetDinhId === undefined || data.quyetDinhId === null ? null : data.quyetDinhId;
        this._baoCaoId = QuyetDinhXuLyValidator.validatePositiveNumber(data.baoCaoId, 'BaoCaoId');
        this._nguoiXuLyId = data.nguoiXuLyId === undefined || data.nguoiXuLyId === null ? null : data.nguoiXuLyId;
        this._ketQua = data.ketQua === undefined || data.ketQua === null ? null : data.ketQua;
        this._ngayXuLy = data.ngayXuLy === undefined || data.ngayXuLy === null ? null : data.ngayXuLy;
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
        this._ketQua = newKetQua === undefined || newKetQua === null ? null : newKetQua;
    }

    static createQuyetDinhXuLyModel(data: Partial<QuyetDinhXuLy>): QuyetDinhXuLyModel {
        return new QuyetDinhXuLyModel(data);
    }

    static createQuyetDinhXuLyPayload(data: Partial<QuyetDinhXuLy>): Partial<QuyetDinhXuLy> {
        return {
            baoCaoId: data.baoCaoId === undefined || data.baoCaoId === null ? 0 : data.baoCaoId,
            nguoiXuLyId: data.nguoiXuLyId === undefined || data.nguoiXuLyId === null ? null : data.nguoiXuLyId,
            ketQua: data.ketQua === undefined || data.ketQua === null ? null : data.ketQua,
            ngayXuLy: data.ngayXuLy === undefined || data.ngayXuLy === null ? null : data.ngayXuLy,
        };
    }
}

