import { QuyenHanValidator } from '../../validators/group1-user/quyenHan.validator';

export interface QuyenHan {
    quyenHanId?: number | null;
    tenQuyen: string;
    moTa?: string | null;
}

export class QuyenHanModel {
    private readonly _quyenHanId?: number | null;
    private _tenQuyen: string;
    private _moTa?: string | null;

    constructor(data: Partial<QuyenHan> = {}) {
        this._quyenHanId = data.quyenHanId === undefined || data.quyenHanId === null ? null : data.quyenHanId;
        this._tenQuyen = QuyenHanValidator.validateRequiredString(data.tenQuyen, 'Tên quyền');
        this._moTa = data.moTa === undefined || data.moTa === null ? null : data.moTa;
    }

    get quyenHanId(): number | null | undefined {
        return this._quyenHanId;
    }

    get tenQuyen(): string {
        return this._tenQuyen;
    }

    get moTa(): string | null | undefined {
        return this._moTa;
    }

    updateTenQuyen(newTenQuyen: string): void {
        this._tenQuyen = QuyenHanValidator.validateRequiredString(newTenQuyen, 'Tên quyền');
    }

    updateMoTa(newMoTa: string | null | undefined): void {
        this._moTa = newMoTa === undefined || newMoTa === null ? null : newMoTa;
    }

    static createQuyenHanModel(data: Partial<QuyenHan>): QuyenHanModel {
        return new QuyenHanModel(data);
    }

    static createQuyenHanPayload(data: Partial<QuyenHan>): Partial<QuyenHan> {
        return {
            tenQuyen: data.tenQuyen === undefined || data.tenQuyen === null ? '' : data.tenQuyen,
            moTa: data.moTa === undefined || data.moTa === null ? null : data.moTa,
        };
    }
}
