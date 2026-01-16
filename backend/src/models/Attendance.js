import { query } from '../config/database.js';

/**
 * Attendance Model
 * จัดการข้อมูลการเข้างาน
 */

export class Attendance {
  /**
   * ดึงข้อมูลการเข้างานทั้งหมด
   */
  static async getAll(filters = {}) {
    let sql = `
      SELECT a.*, e.first_name, e.last_name, e.employment_type, p.position_name
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      LEFT JOIN positions p ON e.position_id = p.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (filters.employee_id) {
      sql += ` AND a.employee_id = $${paramIndex}`;
      params.push(filters.employee_id);
      paramIndex++;
    }

    if (filters.date) {
      sql += ` AND a.date = $${paramIndex}`;
      params.push(filters.date);
      paramIndex++;
    }

    if (filters.start_date && filters.end_date) {
      sql += ` AND a.date BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
      params.push(filters.start_date, filters.end_date);
      paramIndex += 2;
    }

    sql += ' ORDER BY a.date DESC, a.employee_id';

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * ดึงข้อมูลการเข้างานตาม ID
   */
  static async getById(id) {
    const sql = `
      SELECT a.*, e.first_name, e.last_name, e.employment_type,
             e.base_salary_or_wage, p.position_name, p.meal_allowance_per_day,
             p.monthly_allowance
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      LEFT JOIN positions p ON e.position_id = p.id
      WHERE a.id = $1
    `;
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  /**
   * ดึงข้อมูลการเข้างานของพนักงานในเดือนที่กำหนด
   */
  static async getByEmployeeMonth(employeeId, month) {
    // month format: YYYY-MM
    const sql = `
      SELECT a.*, e.first_name, e.last_name, e.employment_type,
             e.base_salary_or_wage, p.meal_allowance_per_day, p.monthly_allowance
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      LEFT JOIN positions p ON e.position_id = p.id
      WHERE a.employee_id = $1
      AND TO_CHAR(a.date, 'YYYY-MM') = $2
      ORDER BY a.date ASC
    `;
    const result = await query(sql, [employeeId, month]);
    return result.rows;
  }

  /**
   * ดึงข้อมูลการเข้างานของพนักงานในวันที่กำหนด
   */
  static async getByEmployeeDate(employeeId, date) {
    const sql = `
      SELECT * FROM attendance
      WHERE employee_id = $1 AND date = $2
    `;
    const result = await query(sql, [employeeId, date]);
    return result.rows[0];
  }

  /**
   * สร้างบันทึกการเข้างาน
   */
  static async create(data) {
    const sql = `
      INSERT INTO attendance (
        employee_id, date, check_in_time, check_out_time,
        ot_hours, ot_amount, late_minutes, is_leave, leave_type,
        calculated_wage_daily, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const params = [
      data.employee_id,
      data.date,
      data.check_in_time,
      data.check_out_time,
      data.ot_hours || 0,
      data.ot_amount || 0,
      data.late_minutes || 0,
      data.is_leave || false,
      data.leave_type,
      data.calculated_wage_daily || 0,
      data.notes
    ];

    const result = await query(sql, params);
    return result.rows[0];
  }

  /**
   * อัพเดทข้อมูลการเข้างาน
   */
  static async update(id, data) {
    const fields = [];
    const params = [];
    let paramIndex = 1;

    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        params.push(data[key]);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    params.push(id);
    const sql = `
      UPDATE attendance
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(sql, params);
    return result.rows[0];
  }

  /**
   * Upsert (Create or Update) ข้อมูลการเข้างาน
   */
  static async upsert(data) {
    const sql = `
      INSERT INTO attendance (
        employee_id, date, check_in_time, check_out_time,
        ot_hours, ot_amount, late_minutes, is_leave, leave_type,
        calculated_wage_daily, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (employee_id, date) 
      DO UPDATE SET
        check_in_time = EXCLUDED.check_in_time,
        check_out_time = EXCLUDED.check_out_time,
        ot_hours = EXCLUDED.ot_hours,
        ot_amount = EXCLUDED.ot_amount,
        late_minutes = EXCLUDED.late_minutes,
        is_leave = EXCLUDED.is_leave,
        leave_type = EXCLUDED.leave_type,
        calculated_wage_daily = EXCLUDED.calculated_wage_daily,
        notes = EXCLUDED.notes,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const params = [
      data.employee_id,
      data.date,
      data.check_in_time,
      data.check_out_time,
      data.ot_hours || 0,
      data.ot_amount || 0,
      data.late_minutes || 0,
      data.is_leave || false,
      data.leave_type,
      data.calculated_wage_daily || 0,
      data.notes
    ];

    const result = await query(sql, params);
    return result.rows[0];
  }

  /**
   * ลบบันทึกการเข้างาน
   */
  static async delete(id) {
    const sql = 'DELETE FROM attendance WHERE id = $1 RETURNING *';
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  /**
   * สรุปการเข้างานของพนักงานในเดือนที่กำหนด
   */
  static async getSummaryByMonth(employeeId, month) {
    const sql = `
      SELECT
        COUNT(*) as total_days,
        COUNT(*) FILTER (WHERE is_leave = false) as days_attended,
        COUNT(*) FILTER (WHERE is_leave = true) as days_leave,
        SUM(ot_hours) as total_ot_hours,
        SUM(ot_amount) as total_ot_amount,
        SUM(late_minutes) as total_late_minutes,
        SUM(calculated_wage_daily) as total_wage
      FROM attendance
      WHERE employee_id = $1
      AND TO_CHAR(date, 'YYYY-MM') = $2
    `;
    const result = await query(sql, [employeeId, month]);
    return result.rows[0];
  }

  /**
   * ดึงข้อมูลการเข้างานย้อนหลัง N วัน
   */
  static async getRecentByEmployee(employeeId, days = 30) {
    const sql = `
      SELECT * FROM attendance
      WHERE employee_id = $1
      AND date >= CURRENT_DATE - INTERVAL '${days} days'
      ORDER BY date DESC
    `;
    const result = await query(sql, [employeeId]);
    return result.rows;
  }
}

export default Attendance;
