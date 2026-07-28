export class DiemUyTinValidator {
    static validatePositiveNumber(value: number | string | null | undefined, fieldName: string): number {
        const num = typeof value === 'string' ? Number(value) : value;
        if (typeof num !== 'number' || isNaN(num) || num <= 0) {
            throw new Error(`${fieldName} phải là số dương.`);
        }
        return num;
    }
}