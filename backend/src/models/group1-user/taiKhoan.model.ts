import { TaiKhoanValidator } from '../../validators/group1-user/taiKhoan.validator';

export interface TaiKhoan {
    taiKhoanId?: number | null;
    nguoiDungId: number;
    tenDangNhap: string;
    matKhauMaHoa: string;
    trangThai?: string | null;
    daXacThuc?: boolean | null;
}

export class TaiKhoanModel {
    private readonly _taiKhoanId?: number | null;
    private _nguoiDungId: number;
    private _tenDangNhap: string;
    private _matKhauMaHoa: string;
    private _trangThai?: string | null;
    private _daXacThuc?: boolean | null;

    constructor(data: Partial<TaiKhoan> = {}) {
        this._taiKhoanId = data.taiKhoanId ?? null;
        this._nguoiDungId = TaiKhoanValidator.validatePositiveNumber(data.nguoiDungId, 'NguoiDungId');
        this._tenDangNhap = TaiKhoanValidator.validateRequiredString(data.tenDangNhap, 'Tên đăng nhập');
        this._matKhauMaHoa = TaiKhoanValidator.validateRequiredString(data.matKhauMaHoa, 'Mật khẩu mã hóa');
        this._trangThai = data.trangThai ?? null;
        this._daXacThuc = data.daXacThuc ?? false;
    }

    get taiKhoanId(): number | null | undefined {
        return this._taiKhoanId;
    }

    get nguoiDungId(): number {
        return this._nguoiDungId;
    }

    get tenDangNhap(): string {
        return this._tenDangNhap;
    }

    get matKhauMaHoa(): string {
        return this._matKhauMaHoa;
    }

    get trangThai(): string | null | undefined {
        return this._trangThai;
    }

    get daXacThuc(): boolean | null | undefined {
        return this._daXacThuc;
    }

    updateTenDangNhap(newTenDangNhap: string): void {
        this._tenDangNhap = TaiKhoanValidator.validateRequiredString(newTenDangNhap, 'Tên đăng nhập');
    }

    updateMatKhauMaHoa(newMatKhauMaHoa: string): void {
        this._matKhauMaHoa = TaiKhoanValidator.validateRequiredString(newMatKhauMaHoa, 'Mật khẩu mã hóa');
    }

    updateTrangThai(newTrangThai: string | null | undefined): void {
        this._trangThai = newTrangThai ?? null;
    }

    markAsVerified(daXacThuc: boolean): void {
        this._daXacThuc = daXacThuc;
    }

    static createTaiKhoanModel(data: Partial<TaiKhoan>): TaiKhoanModel {
        return new TaiKhoanModel(data);
    }

    static createTaiKhoanPayload(data: Partial<TaiKhoan>): Partial<TaiKhoan> {
        return {
            nguoiDungId: data.nguoiDungId ?? 0,
            tenDangNhap: data.tenDangNhap ?? '',
            matKhauMaHoa: data.matKhauMaHoa ?? '',
            trangThai: data.trangThai ?? null,
            daXacThuc: data.daXacThuc ?? false,
        };
    }
}
