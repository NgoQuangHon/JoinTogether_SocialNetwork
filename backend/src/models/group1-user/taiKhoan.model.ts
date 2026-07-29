import { TaiKhoanValidator } from '../../validators/group1-user/taiKhoan.validator';

export interface TaiKhoan {
    taiKhoanId?: number | null;
    nguoiDungId: number;
    tenDangNhap: string;
    matKhauMaHoa: string;
    trangThai?: string | null;
    daXacThuc?: boolean | null;
    soLanDangNhapSai?: number;
    khoaDenLuc?: string | null;
}

export class TaiKhoanModel {
    private readonly _taiKhoanId?: number | null;
    private _nguoiDungId: number;
    private _tenDangNhap: string;
    private _matKhauMaHoa: string;
    private _trangThai?: string | null;
    private _daXacThuc?: boolean | null;
    private _soLanDangNhapSai?: number;
    private _khoaDenLuc?: string | null;

    constructor(data: Partial<TaiKhoan> = {}) {
        this._taiKhoanId = data.taiKhoanId === undefined || data.taiKhoanId === null ? null : data.taiKhoanId;
        this._nguoiDungId = TaiKhoanValidator.validatePositiveNumber(data.nguoiDungId, 'NguoiDungId');
        this._tenDangNhap = TaiKhoanValidator.validateRequiredString(data.tenDangNhap, 'Tên đăng nhập');
        this._matKhauMaHoa = TaiKhoanValidator.validateRequiredString(data.matKhauMaHoa, 'Mật khẩu mã hóa');
        this._trangThai = data.trangThai === undefined || data.trangThai === null ? null : data.trangThai;
        this._daXacThuc = data.daXacThuc === undefined || data.daXacThuc === null ? false : data.daXacThuc;
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

    get soLanDangNhapSai(): number | undefined {
        return this._soLanDangNhapSai;
    }

    get khoaDenLuc(): string | null | undefined {
        return this._khoaDenLuc;
    }

    updateTenDangNhap(newTenDangNhap: string): void {
        this._tenDangNhap = TaiKhoanValidator.validateRequiredString(newTenDangNhap, 'Tên đăng nhập');
    }

    updateMatKhauMaHoa(newMatKhauMaHoa: string): void {
        this._matKhauMaHoa = TaiKhoanValidator.validateRequiredString(newMatKhauMaHoa, 'Mật khẩu mã hóa');
    }

    updateTrangThai(newTrangThai: string | null | undefined): void {
        this._trangThai = newTrangThai === undefined || newTrangThai === null ? null : newTrangThai;
    }

    markAsVerified(daXacThuc: boolean): void {
        this._daXacThuc = daXacThuc;
    }

    static createTaiKhoanModel(data: Partial<TaiKhoan>): TaiKhoanModel {
        return new TaiKhoanModel(data);
    }

    static createTaiKhoanPayload(data: Partial<TaiKhoan>): Partial<TaiKhoan> {
        return {
            nguoiDungId: data.nguoiDungId === undefined || data.nguoiDungId === null ? 0 : data.nguoiDungId,
            tenDangNhap: data.tenDangNhap === undefined || data.tenDangNhap === null ? '' : data.tenDangNhap,
            matKhauMaHoa: data.matKhauMaHoa === undefined || data.matKhauMaHoa === null ? '' : data.matKhauMaHoa,
            trangThai: data.trangThai === undefined || data.trangThai === null ? null : data.trangThai,
            daXacThuc: data.daXacThuc === undefined || data.daXacThuc === null ? false : data.daXacThuc,
            soLanDangNhapSai: data.soLanDangNhapSai ?? 0,
            khoaDenLuc: data.khoaDenLuc ?? null,
        };
    }
}
