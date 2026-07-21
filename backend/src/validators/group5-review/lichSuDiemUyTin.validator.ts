export class LichSuDiemUyTinValidator {
    static validatePositiveNumber(value: number | null | undefined, fieldName: string): number {
        if (typeof value !== 'number' || value <= 0) {
            throw new Error(`${fieldName} phải là số dương.`);
        }

        return value;
    }

    static validateRequiredNumber(value: number | null | undefined, fieldName: string): number {
        if (typeof value !== 'number') {
            throw new Error(`${fieldName} là bắt buộc và phải là số.`);
        }

        return value;
    }
}

