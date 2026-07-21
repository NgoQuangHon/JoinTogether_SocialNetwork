export class NguoiDungValidator {
    static validateRequiredString(value: string | null | undefined, fieldName: string): string {
        const normalizedValue = value?.trim();
        if (!normalizedValue) {
            throw new Error(`${fieldName} không được để trống.`);
        }

        return normalizedValue;
    }

    static validateEmail(value: string | null | undefined): string {
        const normalizedValue = this.validateRequiredString(value, 'Email');
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(normalizedValue)) {
            throw new Error('Email không hợp lệ.');
        }

        return normalizedValue;
    }
}
