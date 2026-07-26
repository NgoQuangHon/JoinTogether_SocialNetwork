import { VaiTroValidator } from '../../validators/group1-user/vaiTro.validator';

export interface VaiTro {
    vaiTroId?: number | null;
    tenVaiTro: string;
    moTa?: string | null;
}

export class VaiTroModel {
    private readonly _vaiTroId?: number | null;
    private _tenVaiTro: string;
    private _moTa?: string | null;

    constructor(data: Partial<VaiTro> = {}) {
        this._vaiTroId = data.vaiTroId === undefined || data.vaiTroId === null ? null : data.vaiTroId;
        this._tenVaiTro = VaiTroValidator.validateRequiredString(data.tenVaiTro, 'Tên vai trò');
        this._moTa = data.moTa === undefined || data.moTa === null ? null : data.moTa;
    }

    get vaiTroId(): number | null | undefined {
        return this._vaiTroId;
    }

    get tenVaiTro(): string {
        return this._tenVaiTro;
    }

    get moTa(): string | null | undefined {
        return this._moTa;
    }

    updateTenVaiTro(newTenVaiTro: string): void {
        this._tenVaiTro = VaiTroValidator.validateRequiredString(newTenVaiTro, 'Tên vai trò');
    }

    updateMoTa(newMoTa: string | null | undefined): void {
        this._moTa = newMoTa === undefined || newMoTa === null ? null : newMoTa;
    }

    static createVaiTroModel(data: Partial<VaiTro>): VaiTroModel {
        return new VaiTroModel(data);
    }

    static createVaiTroPayload(data: Partial<VaiTro>): Partial<VaiTro> {
        return {
            tenVaiTro: data.tenVaiTro === undefined || data.tenVaiTro === null ? '' : data.tenVaiTro,
            moTa: data.moTa === undefined || data.moTa === null ? null : data.moTa,
        };
    }
}
