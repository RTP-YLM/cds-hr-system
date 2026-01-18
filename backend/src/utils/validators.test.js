import { employeeSchema, employeeUpdateSchema } from './validators.js';

describe('Employee Schema Validation', () => {
    const validData = {
        prefix: 'นาย',
        first_name: 'สมชาย',
        last_name: 'สายเสมอ',
        id_card_number: '1234567890121', // Checksum valid for this
        phone: '0812345678',
        nationality: 'ไทย',
        birth_date: '1990-01-01',
        hired_date: '2023-01-01',
        position_id: 1,
        status: 'permanent',
        employment_type: 'monthly',
        base_salary_or_wage: 30000,
    };

    test('should validate correct employee data', () => {
        const result = employeeSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    test('should fail when id_card_number is invalid', () => {
        const data = { ...validData, id_card_number: '1234567890123' }; // Wrong checksum
        const result = employeeSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
            const error = result.error.format();
            expect(error.id_card_number?._errors).toContain('เลขบัตรประชาชนไม่ถูกต้อง');
        }
    });

    test('should fail when dates are in wrong format', () => {
        const data = {
            ...validData,
            birth_date: '01/01/1990',
            hired_date: '01-01-2023'
        };
        const result = employeeSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
            const error = result.error.format();
            expect(error.birth_date?._errors).toContain('รูปแบบวันที่ต้องเป็น YYYY-MM-DD');
            expect(error.hired_date?._errors).toContain('รูปแบบวันที่ต้องเป็น YYYY-MM-DD และเป็นวันที่ที่ถูกต้อง');
        }
    });

    test('should succeed when numeric fields receive numeric strings (coercion)', () => {
        const data = {
            ...validData,
            position_id: '1',
            base_salary_or_wage: '30000'
        };
        const result = employeeSchema.safeParse(data);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.position_id).toBe(1);
            expect(result.data.base_salary_or_wage).toBe(30000);
        }
    });

    test('should handle partial update with empty strings in optional fields', () => {
        const data = {
            first_name: 'สมชาย',
            birth_date: '',
            phone: '',
        };
        const result = employeeUpdateSchema.safeParse(data);
        expect(result.success).toBe(true);
    });

    test('should succeed when dates are in ISO format (database compatibility)', () => {
        const data = {
            ...validData,
            birth_date: '1990-01-01T00:00:00.000Z',
            hired_date: '2023-01-01T00:00:00.000Z'
        };
        const result = employeeSchema.safeParse(data);
        expect(result.success).toBe(true);
    });
});
