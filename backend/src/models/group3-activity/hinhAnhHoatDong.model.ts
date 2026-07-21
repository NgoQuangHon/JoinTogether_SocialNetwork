import { HinhAnhHoatDongValidator } from '../../validators/group3-activity/hinhAnhHoatDong.validator';

export interface HinhAnhHoatDong {
    hinhAnhId?: number | null;
    hoatDongId: number;
    duongDan: string;
    moTa?: string | null;
    laAnhDaiDien?: boolean | null;
}

export class HinhAnhHoatDongModel {
    private readonly _hinhAnhId?: number | null;
    private _hoatDongId: number;
    private _duongDan: string;
    private _moTa?: string | null;
    private _laAnhDaiDien?: boolean | null;

    constructor(data: Partial<HinhAnhHoatDong> = {}) {
        this._hinhAnhId = data.hinhAnhId ?? null;
        this._hoatDongId = HinhAnhHoatDongValidator.validatePositiveNumber(data.hoatDongId, 'HoatDongId');
        this._duongDan = HinhAnhHoatDongValidator.validateRequiredString(data.duongDan, 'Đường dẫn hình ảnh');
        this._moTa = data.moTa ?? null;
        this._laAnhDaiDien = data.laAnhDaiDien ?? false;
    }

    get hinhAnhId(): number | null | undefined {
        return this._hinhAnhId;
    }

    get hoatDongId(): number {
        return this._hoatDongId;
    }

    get duongDan(): string {
        return this._duongDan;
    }

    get moTa(): string | null | undefined {
        return this._moTa;
    }

    get laAnhDaiDien(): boolean | null | undefined {
        return this._laAnhDaiDien;
    }

    updateDuongDan(newDuongDan: string): void {
        this._duongDan = HinhAnhHoatDongValidator.validateRequiredString(newDuongDan, 'Đường dẫn hình ảnh');
    }

    updateMoTa(newMoTa: string | null | undefined): void {
        this._moTa = newMoTa ?? null;
    }

    markAsPrimaryImage(laAnhDaiDien: boolean): void {
        this._laAnhDaiDien = laAnhDaiDien;
    }

    static createHinhAnhHoatDongModel(data: Partial<HinhAnhHoatDong>): HinhAnhHoatDongModel {
        return new HinhAnhHoatDongModel(data);
    }

    static createHinhAnhHoatDongPayload(data: Partial<HinhAnhHoatDong>): Partial<HinhAnhHoatDong> {
        return {
            hoatDongId: data.hoatDongId ?? 0,
            duongDan: data.duongDan ?? '',
            moTa: data.moTa ?? null,
            laAnhDaiDien: data.laAnhDaiDien ?? false,
        };
    }
}
