import { query } from '../config/database.js';

/**
 * Position Model
 * จัดการข้อมูลตำแหน่งงาน
 */

export class Position {
  /**
   * ดึงตำแหน่งทั้งหมด
   */
  static async getAll() {
    const sql = `
      SELECT p.*,
        COUNT(e.id) as employee_count
      FROM positions p
      LEFT JOIN employees e ON p.id = e.position_id
      GROUP BY p.id
      ORDER BY p.position_name
    `;
    const result = await query(sql);
    return result.rows;
  }

  /**
   * ดึงตำแหน่งตาม ID
   */
  static async getById(id) {
    const sql = 'SELECT * FROM positions WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  /**
   * ดึงตำแหน่งตามชื่อ
   */
  static async getByName(positionName) {
    const sql = 'SELECT * FROM positions WHERE position_name = $1';
    const result = await query(sql, [positionName]);
    return result.rows[0];
  }

  /**
   * สร้างตำแหน่งใหม่
   */
  static async create(data) {
    const sql = `
      INSERT INTO positions (
        position_name, meal_allowance_per_day, monthly_allowance
      ) VALUES ($1, $2, $3)
      RETURNING *
    `;

    const params = [
      data.position_name,
      data.meal_allowance_per_day || 0,
      data.monthly_allowance || 0
    ];

    const result = await query(sql, params);
    return result.rows[0];
  }

  /**
   * อัพเดทตำแหน่ง
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
      UPDATE positions
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(sql, params);
    return result.rows[0];
  }

  /**
   * ลบตำแหน่ง
   */
  static async delete(id) {
    const sql = 'DELETE FROM positions WHERE id = $1 RETURNING *';
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  /**
   * ดึงพนักงานในตำแหน่ง
   */
  static async getEmployees(positionId) {
    const sql = `
      SELECT * FROM employees
      WHERE position_id = $1
      ORDER BY first_name, last_name
    `;
    const result = await query(sql, [positionId]);
    return result.rows;
  }
}

export default Position;
