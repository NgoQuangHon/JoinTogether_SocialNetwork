export class BangChungViPhamValidator {
    static validateRequiredString(value: string | null | undefined, fieldName: string): string {
        const normalizedValue = value?.trim();
        if (!normalizedValue) {
            throw new Error(`${fieldName} không được để trống.`);
        }
        return normalizedValue;
    }
    static validatePositiveNumber(value: number | string | null | undefined, fieldName: string): number {
        const num = typeof value === 'string' ? Number(value) : value;
        if (typeof num !== 'number' || isNaN(num) || num <= 0) {
            throw new Error(`${fieldName} phải là số dương.`);
        }
        return num;
    }
}