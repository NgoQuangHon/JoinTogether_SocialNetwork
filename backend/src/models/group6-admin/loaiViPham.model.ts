import { LoaiViPhamValidator } from '../../validators/group6-admin/loaiViPham.validator';

export interface LoaiViPham {
    loaiViPhamId?: number | null;
    tenLoai: string;
    moTa?: string | null;
    mucDo?: string | null;
}

export class LoaiViPhamModel {
    private readonly _loaiViPhamId?: number | null;
    private _tenLoai: string;
    private _moTa?: string | null;
    private _mucDo?: string | null;

    constructor(data: Partial<LoaiViPham> = {}) {
        this._loaiViPhamId = data.loaiViPhamId ?? null;
        this._tenLoai = LoaiViPhamValidator.validateRequiredString(data.tenLoai, 'Tên loại');
        this._moTa = data.moTa ?? null;
        this._mucDo = data.mucDo ?? null;
    }

    get loaiViPhamId(): number | null | undefined {
        return this._loaiViPhamId;
    }

    get tenLoai(): string {
        return this._tenLoai;
    }

    get moTa(): string | null | undefined {
        return this._moTa;
    }

    get mucDo(): string | null | undefined {
        return this._mucDo;
    }

    updateTenLoai(newTenLoai: string): void {
        this._tenLoai = LoaiViPhamValidator.validateRequiredString(newTenLoai, 'Tên loại');
    }

    updateMoTa(newMoTa: string | null | undefined): void {
        this._moTa = newMoTa ?? null;
    }

    updateMucDo(newMucDo: string | null | undefined): void {
        this._mucDo = newMucDo ?? null;
    }

    static createLoaiViPhamModel(data: Partial<LoaiViPham>): LoaiViPhamModel {
        return new LoaiViPhamModel(data);
    }

    static createLoaiViPhamPayload(data: Partial<LoaiViPham>): Partial<LoaiViPham> {
        return {
            tenLoai: data.tenLoai ?? '',
            moTa: data.moTa ?? null,
            mucDo: data.mucDo ?? null,
        };
    }
}

