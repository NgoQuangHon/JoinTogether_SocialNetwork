export class TieuChiDanhGiaValidator {
    static validateRequiredString(value: string | null | undefined, fieldName: string): string {
        const normalizedValue = value?.trim();
        if (!normalizedValue) {
            throw new Error(`${fieldName} không được để trống.`);
        }

        return normalizedValue;
    }
}

