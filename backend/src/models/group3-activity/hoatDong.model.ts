import { HoatDongValidator } from '../../validators/group3-activity/hoatDong.validator';

export interface HoatDong {
    hoatDongId?: number | null;
    nguoiToChucId?: number | null;
    danhMucHoatDongId?: number | null;
    diaDiemId?: number | null;
    tenHoatDong: string;
    moTa?: string | null;
    thoiGianBatDau?: Date | string | null;
    thoiGianKetThuc?: Date | string | null;
}

export class HoatDongModel {
    private readonly _hoatDongId?: number | null;
    private _nguoiToChucId?: number | null;
    private _danhMucHoatDongId?: number | null;
    private _diaDiemId?: number | null;
    private _tenHoatDong: string;
    private _moTa?: string | null;
    private _thoiGianBatDau?: Date | string | null;
    private _thoiGianKetThuc?: Date | string | null;

    constructor(data: Partial<HoatDong> = {}) {
        this._hoatDongId = data.hoatDongId === undefined || data.hoatDongId === null ? null : data.hoatDongId;
        this._nguoiToChucId = data.nguoiToChucId === undefined || data.nguoiToChucId === null ? null : data.nguoiToChucId;
        this._danhMucHoatDongId = data.danhMucHoatDongId === undefined || data.danhMucHoatDongId === null ? null : data.danhMucHoatDongId;
        this._diaDiemId = data.diaDiemId === undefined || data.diaDiemId === null ? null : data.diaDiemId;
        this._tenHoatDong = HoatDongValidator.validateRequiredString(data.tenHoatDong, 'Tên hoạt động');
        this._moTa = data.moTa === undefined || data.moTa === null ? null : data.moTa;
        this._thoiGianBatDau = data.thoiGianBatDau === undefined || data.thoiGianBatDau === null ? null : data.thoiGianBatDau;
        this._thoiGianKetThuc = data.thoiGianKetThuc === undefined || data.thoiGianKetThuc === null ? null : data.thoiGianKetThuc;
    }

    get hoatDongId(): number | null | undefined {
        return this._hoatDongId;
    }

    get nguoiToChucId(): number | null | undefined {
        return this._nguoiToChucId;
    }

    get danhMucHoatDongId(): number | null | undefined {
        return this._danhMucHoatDongId;
    }

    get diaDiemId(): number | null | undefined {
        return this._diaDiemId;
    }

    get tenHoatDong(): string {
        return this._tenHoatDong;
    }

    get moTa(): string | null | undefined {
        return this._moTa;
    }

    get thoiGianBatDau(): Date | string | null | undefined {
        return this._thoiGianBatDau;
    }

    get thoiGianKetThuc(): Date | string | null | undefined {
        return this._thoiGianKetThuc;
    }

    updateTenHoatDong(newTenHoatDong: string): void {
        this._tenHoatDong = HoatDongValidator.validateRequiredString(newTenHoatDong, 'Tên hoạt động');
    }

    updateMoTa(newMoTa: string | null | undefined): void {
        this._moTa = newMoTa === undefined || newMoTa === null ? null : newMoTa;
    }

    updateThoiGianBatDau(newThoiGianBatDau: Date | string | null | undefined): void {
        this._thoiGianBatDau = newThoiGianBatDau === undefined || newThoiGianBatDau === null ? null : newThoiGianBatDau;
    }

    updateThoiGianKetThuc(newThoiGianKetThuc: Date | string | null | undefined): void {
        this._thoiGianKetThuc = newThoiGianKetThuc === undefined || newThoiGianKetThuc === null ? null : newThoiGianKetThuc;
    }

    static createHoatDongModel(data: Partial<HoatDong>): HoatDongModel {
        return new HoatDongModel(data);
    }

    static createHoatDongPayload(data: Partial<HoatDong>): Partial<HoatDong> {
        return {
            nguoiToChucId: data.nguoiToChucId === undefined || data.nguoiToChucId === null ? null : data.nguoiToChucId,
            danhMucHoatDongId: data.danhMucHoatDongId === undefined || data.danhMucHoatDongId === null ? null : data.danhMucHoatDongId,
            diaDiemId: data.diaDiemId === undefined || data.diaDiemId === null ? null : data.diaDiemId,
            tenHoatDong: data.tenHoatDong === undefined || data.tenHoatDong === null ? '' : data.tenHoatDong,
            moTa: data.moTa === undefined || data.moTa === null ? null : data.moTa,
            thoiGianBatDau: data.thoiGianBatDau === undefined || data.thoiGianBatDau === null ? null : data.thoiGianBatDau,
            thoiGianKetThuc: data.thoiGianKetThuc === undefined || data.thoiGianKetThuc === null ? null : data.thoiGianKetThuc,
        };
    }
}
