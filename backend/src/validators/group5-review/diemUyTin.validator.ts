export class DiemUyTinValidator {
    static validatePositiveNumber(value: number | null | undefined, fieldName: string): number {
        if (typeof value !== 'number' || value <= 0) {
            throw new Error(`${fieldName} phải là số dương.`);
        }

        return value;
    }
}

