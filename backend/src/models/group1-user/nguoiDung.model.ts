import { NguoiDungValidator } from '../../validators/group1-user/nguoiDung.validator';

export interface NguoiDung {
    nguoiDungId?: number | null;
    hoTen: string;
    email: string;
    soDienThoai?: string | null;
    trangThai?: string | null;
    ngayTao?: Date | string | null;
}

export class NguoiDungModel {
    private readonly _nguoiDungId?: number | null;
    private _hoTen: string;
    private _email: string;
    private _soDienThoai?: string | null;
    private _trangThai?: string | null;
    private readonly _ngayTao?: Date | string | null;

    constructor(data: Partial<NguoiDung> = {}) {
        this._nguoiDungId = data.nguoiDungId ?? null;
        this._hoTen = NguoiDungValidator.validateRequiredString(data.hoTen, 'Họ tên');
        this._email = NguoiDungValidator.validateEmail(data.email);
        this._soDienThoai = data.soDienThoai ?? null;
        this._trangThai = data.trangThai ?? null;
        this._ngayTao = data.ngayTao ?? null;
    }

    get nguoiDungId(): number | null | undefined {
        return this._nguoiDungId;
    }

    get hoTen(): string {
        return this._hoTen;
    }

    get email(): string {
        return this._email;
    }

    get soDienThoai(): string | null | undefined {
        return this._soDienThoai;
    }

    get trangThai(): string | null | undefined {
        return this._trangThai;
    }

    get ngayTao(): Date | string | null | undefined {
        return this._ngayTao;
    }

    updateHoTen(newHoTen: string): void {
        this._hoTen = NguoiDungValidator.validateRequiredString(newHoTen, 'Họ tên');
    }

    updateEmail(newEmail: string): void {
        this._email = NguoiDungValidator.validateEmail(newEmail);
    }

    updateSoDienThoai(newSoDienThoai: string | null | undefined): void {
        this._soDienThoai = newSoDienThoai ?? null;
    }

    updateTrangThai(newTrangThai: string | null | undefined): void {
        this._trangThai = newTrangThai ?? null;
    }

    static createNguoiDungModel(data: Partial<NguoiDung>): NguoiDungModel {
        return new NguoiDungModel(data);
    }

    static createNguoiDungPayload(data: Partial<NguoiDung>): Partial<NguoiDung> {
        return {
            hoTen: data.hoTen ?? '',
            email: data.email ?? '',
            soDienThoai: data.soDienThoai ?? null,
            trangThai: data.trangThai ?? null,
            ngayTao: data.ngayTao ?? null,
        };
    }
}
