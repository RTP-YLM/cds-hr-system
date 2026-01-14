import { query } from '../config/database.js';

/**
 * Employee Model
 * จัดการข้อมูลพนักงาน
 */

export class Employee {
  /**
   * ดึงพนักงานทั้งหมด
   */
  static async getAll(filters = {}) {
    let sql = `
      SELECT e.*, p.position_name, p.meal_allowance_per_day, p.monthly_allowance,
             e.work_start_time, e.work_end_time
      FROM employees e
      LEFT JOIN positions p ON e.position_id = p.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (filters.status) {
      sql += ` AND e.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.employment_type) {
      sql += ` AND e.employment_type = $${paramIndex}`;
      params.push(filters.employment_type);
      paramIndex++;
    }

    if (filters.position_id) {
      sql += ` AND e.position_id = $${paramIndex}`;
      params.push(filters.position_id);
      paramIndex++;
    }

    if (filters.search) {
      sql += ` AND (e.first_name ILIKE $${paramIndex} OR e.last_name ILIKE $${paramIndex} OR e.id_card_number ILIKE $${paramIndex})`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    sql += ' ORDER BY e.created_at DESC';

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * ดึงพนักงานตาม ID
   */
  static async getById(id) {
    const sql = `
      SELECT e.*, p.position_name, p.meal_allowance_per_day, p.monthly_allowance,
             e.work_start_time, e.work_end_time
      FROM employees e
      LEFT JOIN positions p ON e.position_id = p.id
      WHERE e.id = $1
    `;
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  /**
   * ดึงพนักงานตามเลขบัตรประชาชน
   */
  static async getByIdCard(idCardNumber) {
    const sql = 'SELECT * FROM employees WHERE id_card_number = $1';
    const result = await query(sql, [idCardNumber]);
    return result.rows[0];
  }

  /**
   * สร้างพนักงานใหม่
   */
  static async create(data) {
    const sql = `
      INSERT INTO employees (
        prefix, first_name, last_name, id_card_number, address, phone,
        nationality, birth_date, hired_date, position_id, status,
        employment_type, base_salary_or_wage, bank_name, bank_account_no,
        profile_image_url, contract_file_url, work_start_time, work_end_time
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *
    `;

    const params = [
      data.prefix,
      data.first_name,
      data.last_name,
      data.id_card_number,
      data.address,
      data.phone,
      data.nationality || 'ไทย',
      data.birth_date,
      data.hired_date,
      data.position_id,
      data.status || 'probation',
      data.employment_type,
      data.base_salary_or_wage,
      data.bank_name,
      data.bank_account_no,
      data.profile_image_url,
      data.contract_file_url,
      data.work_start_time || '08:00:00',
      data.work_end_time || '17:00:00'
    ];

    const result = await query(sql, params);
    return result.rows[0];
  }

  /**
   * อัพเดทข้อมูลพนักงาน
   */
  static async update(id, data) {
    const fields = [];
    const params = [];
    let paramIndex = 1;

    // Build dynamic update query
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
      UPDATE employees
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(sql, params);
    return result.rows[0];
  }

  /**
   * ลบพนักงาน
   */
  static async delete(id) {
    const sql = 'DELETE FROM employees WHERE id = $1 RETURNING *';
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  /**
   * นับจำนวนพนักงานตามสถานะ
   */
  static async countByStatus() {
    const sql = `
      SELECT status, COUNT(*) as count
      FROM employees
      GROUP BY status
    `;
    const result = await query(sql);
    return result.rows;
  }

  /**
   * นับจำนวนพนักงานตามประเภท
   */
  static async countByEmploymentType() {
    const sql = `
      SELECT employment_type, COUNT(*) as count
      FROM employees
      GROUP BY employment_type
    `;
    const result = await query(sql);
    return result.rows;
  }
}

export default Employee;
