import { query } from '../config/database.js';

export class Holiday {
    /**
     * ดึงวันหยุดทั้งหมด
     */
    static async getAll(year) {
        let sql = 'SELECT * FROM holidays';
        let params = [];

        if (year) {
            sql += ' WHERE EXTRACT(YEAR FROM date) = $1';
            params.push(year);
        }

        sql += ' ORDER BY date ASC';
        const result = await query(sql, params);
        return result.rows;
    }

    /**
     * ดึงวันหยุดในช่วงวันที่
     */
    static async getInRange(startDate, endDate) {
        const sql = 'SELECT * FROM holidays WHERE date BETWEEN $1 AND $2 ORDER BY date ASC';
        const result = await query(sql, [startDate, endDate]);
        return result.rows;
    }

    /**
     * สร้างวันหยุดใหม่
     */
    static async create(data) {
        const sql = `
      INSERT INTO holidays (date, name, holiday_type, is_paid)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
        const params = [data.date, data.name, data.holiday_type || 'public', data.is_paid !== undefined ? data.is_paid : true];
        const result = await query(sql, params);
        return result.rows[0];
    }

    /**
     * ลบวันหยุด
     */
    static async delete(id) {
        const sql = 'DELETE FROM holidays WHERE id = $1 RETURNING *';
        const result = await query(sql, [id]);
        return result.rows[0];
    }

    /**
     * อัพเดทวันหยุด
     */
    static async update(id, data) {
        const fields = [];
        const params = [];
        let paramIndex = 1;

        if (data.date) {
            fields.push(`date = $${paramIndex++}`);
            params.push(data.date);
        }
        if (data.name) {
            fields.push(`name = $${paramIndex++}`);
            params.push(data.name);
        }
        if (data.holiday_type) {
            fields.push(`holiday_type = $${paramIndex++}`);
            params.push(data.holiday_type);
        }
        if (data.is_paid !== undefined) {
            fields.push(`is_paid = $${paramIndex++}`);
            params.push(data.is_paid);
        }

        if (fields.length === 0) return null;

        params.push(id);
        const sql = `UPDATE holidays SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
        const result = await query(sql, params);
        return result.rows[0];
    }
}

export default Holiday;
