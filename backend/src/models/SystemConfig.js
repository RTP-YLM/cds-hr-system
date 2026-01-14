import { query } from '../config/database.js';

/**
 * SystemConfig Model
 * จัดการการตั้งค่าระบบ
 */

export class SystemConfig {
  /**
   * ดึงการตั้งค่าทั้งหมด
   */
  static async getAll() {
    const sql = 'SELECT * FROM system_configs ORDER BY key';
    const result = await query(sql);
    return result.rows;
  }

  /**
   * ดึงการตั้งค่าทั้งหมดในรูปแบบ Object { key: value }
   */
  static async getAllAsObject() {
    const configs = await this.getAll();
    const configObj = {};

    configs.forEach(config => {
      // แปลง value ตาม data_type
      let value = config.value;
      if (config.data_type === 'number') {
        value = parseFloat(value);
      } else if (config.data_type === 'json') {
        try {
          value = JSON.parse(value);
        } catch (e) {
          console.error('Error parsing JSON config:', config.key);
        }
      }
      configObj[config.key] = value;
    });

    return configObj;
  }

  /**
   * ดึงการตั้งค่าตาม key
   */
  static async getByKey(key) {
    const sql = 'SELECT * FROM system_configs WHERE key = $1';
    const result = await query(sql, [key]);
    return result.rows[0];
  }

  /**
   * ดึงค่าของการตั้งค่าตาม key
   */
  static async getValue(key, defaultValue = null) {
    const config = await this.getByKey(key);
    if (!config) return defaultValue;

    // แปลง value ตาม data_type
    if (config.data_type === 'number') {
      return parseFloat(config.value);
    } else if (config.data_type === 'json') {
      try {
        return JSON.parse(config.value);
      } catch (e) {
        return defaultValue;
      }
    }

    return config.value;
  }

  /**
   * สร้างการตั้งค่าใหม่
   */
  static async create(data) {
    const sql = `
      INSERT INTO system_configs (key, value, description, data_type)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const params = [
      data.key,
      data.value,
      data.description,
      data.data_type || 'string'
    ];

    const result = await query(sql, params);
    return result.rows[0];
  }

  /**
   * อัพเดทการตั้งค่า
   */
  static async update(key, data) {
    const fields = [];
    const params = [];
    let paramIndex = 1;

    Object.keys(data).forEach(k => {
      if (data[k] !== undefined && k !== 'key') {
        fields.push(`${k} = $${paramIndex}`);
        params.push(data[k]);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    params.push(key);
    const sql = `
      UPDATE system_configs
      SET ${fields.join(', ')}
      WHERE key = $${paramIndex}
      RETURNING *
    `;

    const result = await query(sql, params);
    return result.rows[0];
  }

  /**
   * อัพเดทค่าของการตั้งค่า
   */
  static async setValue(key, value) {
    return await this.update(key, { value: String(value) });
  }

  /**
   * ลบการตั้งค่า
   */
  static async delete(key) {
    const sql = 'DELETE FROM system_configs WHERE key = $1 RETURNING *';
    const result = await query(sql, [key]);
    return result.rows[0];
  }

  /**
   * อัพเดทการตั้งค่าหลายรายการพร้อมกัน
   */
  static async updateMultiple(configs) {
    const results = [];

    for (const config of configs) {
      if (config.key && config.value !== undefined) {
        const result = await this.update(config.key, {
          value: String(config.value),
          description: config.description,
          data_type: config.data_type
        });
        results.push(result);
      }
    }

    return results;
  }

  /**
   * ดึงการตั้งค่าตามประเภท
   */
  static async getByType(dataType) {
    const sql = 'SELECT * FROM system_configs WHERE data_type = $1 ORDER BY key';
    const result = await query(sql, [dataType]);
    return result.rows;
  }

  /**
   * ค้นหาการตั้งค่า
   */
  static async search(keyword) {
    const sql = `
      SELECT * FROM system_configs
      WHERE key ILIKE $1 OR description ILIKE $1
      ORDER BY key
    `;
    const result = await query(sql, [`%${keyword}%`]);
    return result.rows;
  }
}

export default SystemConfig;
