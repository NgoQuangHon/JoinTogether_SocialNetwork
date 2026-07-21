export class TaiKhoanValidator {
    static validateRequiredString(value: string | null | undefined, fieldName: string): string {
        const normalizedValue = value?.trim();
        if (!normalizedValue) {
            throw new Error(`${fieldName} không được để trống.`);
        }

        return normalizedValue;
    }

    static validatePositiveNumber(value: number | null | undefined, fieldName: string): number {
        if (typeof value !== 'number' || value <= 0) {
            throw new Error(`${fieldName} phải là số dương.`);
        }

        return value;
    }
}
