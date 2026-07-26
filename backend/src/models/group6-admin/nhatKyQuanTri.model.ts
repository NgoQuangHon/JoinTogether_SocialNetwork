import { NhatKyQuanTriValidator } from '../../validators/group6-admin/nhatKyQuanTri.validator';

export interface NhatKyQuanTri {
    nhatKyId?: number | null;
    nguoiQuanTriId?: number | null;
    hanhDong: string;
    doiTuongTacDong?: string | null;
    thoiGianThucHien?: Date | string | null;
}

export class NhatKyQuanTriModel {
    private readonly _nhatKyId?: number | null;
    private _nguoiQuanTriId?: number | null;
    private _hanhDong: string;
    private _doiTuongTacDong?: string | null;
    private readonly _thoiGianThucHien?: Date | string | null;

    constructor(data: Partial<NhatKyQuanTri> = {}) {
        this._nhatKyId = data.nhatKyId === undefined || data.nhatKyId === null ? null : data.nhatKyId;
        this._nguoiQuanTriId = data.nguoiQuanTriId === undefined || data.nguoiQuanTriId === null ? null : data.nguoiQuanTriId;
        this._hanhDong = NhatKyQuanTriValidator.validateRequiredString(data.hanhDong, 'Hành động');
        this._doiTuongTacDong = data.doiTuongTacDong === undefined || data.doiTuongTacDong === null ? null : data.doiTuongTacDong;
        this._thoiGianThucHien = data.thoiGianThucHien === undefined || data.thoiGianThucHien === null ? null : data.thoiGianThucHien;
    }

    get nhatKyId(): number | null | undefined {
        return this._nhatKyId;
    }

    get nguoiQuanTriId(): number | null | undefined {
        return this._nguoiQuanTriId;
    }

    get hanhDong(): string {
        return this._hanhDong;
    }

    get doiTuongTacDong(): string | null | undefined {
        return this._doiTuongTacDong;
    }

    get thoiGianThucHien(): Date | string | null | undefined {
        return this._thoiGianThucHien;
    }

    updateHanhDong(newHanhDong: string): void {
        this._hanhDong = NhatKyQuanTriValidator.validateRequiredString(newHanhDong, 'Hành động');
    }

    updateDoiTuongTacDong(newDoiTuongTacDong: string | null | undefined): void {
        this._doiTuongTacDong = newDoiTuongTacDong === undefined || newDoiTuongTacDong === null ? null : newDoiTuongTacDong;
    }

    static createNhatKyQuanTriModel(data: Partial<NhatKyQuanTri>): NhatKyQuanTriModel {
        return new NhatKyQuanTriModel(data);
    }

    static createNhatKyQuanTriPayload(data: Partial<NhatKyQuanTri>): Partial<NhatKyQuanTri> {
        return {
            nguoiQuanTriId: data.nguoiQuanTriId === undefined || data.nguoiQuanTriId === null ? null : data.nguoiQuanTriId,
            hanhDong: data.hanhDong === undefined || data.hanhDong === null ? '' : data.hanhDong,
            doiTuongTacDong: data.doiTuongTacDong === undefined || data.doiTuongTacDong === null ? null : data.doiTuongTacDong,
            thoiGianThucHien: data.thoiGianThucHien === undefined || data.thoiGianThucHien === null ? null : data.thoiGianThucHien,
        };
    }
}

