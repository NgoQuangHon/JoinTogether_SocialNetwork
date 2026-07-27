import { QuanHeKetNoiValidator } from '../../validators/group4-interaction/quanHeKetNoi.validator';

export interface QuanHeKetNoi {
    quanHeId?: number | null;
    nguoiDungId1: number;
    nguoiDungId2: number;
    ngayKetNoi?: Date | string | null;
    trangThai?: string | null;
}

export class QuanHeKetNoiModel {
    private readonly _quanHeId?: number | null;
    private _nguoiDungId1: number;
    private _nguoiDungId2: number;
    private _ngayKetNoi?: Date | string | null;
    private _trangThai?: string | null;

    constructor(data: Partial<QuanHeKetNoi> = {}) {
        this._quanHeId = data.quanHeId === undefined || data.quanHeId === null ? null : data.quanHeId;
        this._nguoiDungId1 = QuanHeKetNoiValidator.validatePositiveNumber(data.nguoiDungId1, 'NguoiDungId1');
        this._nguoiDungId2 = QuanHeKetNoiValidator.validatePositiveNumber(data.nguoiDungId2, 'NguoiDungId2');
        this._ngayKetNoi = data.ngayKetNoi === undefined || data.ngayKetNoi === null ? null : data.ngayKetNoi;
        this._trangThai = data.trangThai === undefined || data.trangThai === null ? null : data.trangThai;
    }

    get quanHeId(): number | null | undefined {
        return this._quanHeId;
    }

    get nguoiDungId1(): number {
        return this._nguoiDungId1;
    }

    get nguoiDungId2(): number {
        return this._nguoiDungId2;
    }

    get ngayKetNoi(): Date | string | null | undefined {
        return this._ngayKetNoi;
    }

    get trangThai(): string | null | undefined {
        return this._trangThai;
    }

    updateTrangThai(newTrangThai: string | null | undefined): void {
        this._trangThai = newTrangThai === undefined || newTrangThai === null ? null : newTrangThai;
    }

    static createQuanHeKetNoiModel(data: Partial<QuanHeKetNoi>): QuanHeKetNoiModel {
        return new QuanHeKetNoiModel(data);
    }

    static createQuanHeKetNoiPayload(data: Partial<QuanHeKetNoi>): Partial<QuanHeKetNoi> {
        return {
            nguoiDungId1: data.nguoiDungId1 === undefined || data.nguoiDungId1 === null ? 0 : data.nguoiDungId1,
            nguoiDungId2: data.nguoiDungId2 === undefined || data.nguoiDungId2 === null ? 0 : data.nguoiDungId2,
            ngayKetNoi: data.ngayKetNoi === undefined || data.ngayKetNoi === null ? null : data.ngayKetNoi,
            trangThai: data.trangThai === undefined || data.trangThai === null ? null : data.trangThai,
        };
    }
}

