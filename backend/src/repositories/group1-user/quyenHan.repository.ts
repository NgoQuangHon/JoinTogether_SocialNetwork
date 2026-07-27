import { pool } from "../../config/db";
import { QuyenHan } from "../../models/group1-user/quyenHan.model";

export class QuyenHanRepository {
  async create(data: Partial<QuyenHan>): Promise<QuyenHan> {
    const query = `
      INSERT INTO quyen_han (ten_quyen, mo_ta)
      VALUES ($1, $2)
      RETURNING
        quyen_han_id AS "quyenHanId",
        ten_quyen AS "tenQuyen",
        mo_ta AS "moTa"
    `;
    const result = await pool.query(query, [
      data.tenQuyen,
      data.moTa === undefined || data.moTa === null ? null : data.moTa,
    ]);
    return result.rows[0];
  }

  async findAll(): Promise<QuyenHan[]> {
    const query = `
      SELECT
        quyen_han_id AS "quyenHanId",
        ten_quyen AS "tenQuyen",
        mo_ta AS "moTa"
      FROM quyen_han
      ORDER BY ten_quyen ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  async findById(id: number): Promise<QuyenHan | null> {
    const query = `
      SELECT
        quyen_han_id AS "quyenHanId",
        ten_quyen AS "tenQuyen",
        mo_ta AS "moTa"
      FROM quyen_han
      WHERE quyen_han_id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async update(id: number, data: Partial<QuyenHan>): Promise<QuyenHan | null> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.tenQuyen !== undefined) {
      setClauses.push(`ten_quyen = $${paramIndex++}`);
      values.push(data.tenQuyen);
    }
    if (data.moTa !== undefined) {
      setClauses.push(`mo_ta = $${paramIndex++}`);
      values.push(data.moTa);
    }

    if (setClauses.length === 0) return this.findById(id);

    values.push(id);
    const query = `
      UPDATE quyen_han
      SET ${setClauses.join(", ")}
      WHERE quyen_han_id = $${paramIndex}
      RETURNING
        quyen_han_id AS "quyenHanId",
        ten_quyen AS "tenQuyen",
        mo_ta AS "moTa"
    `;
    const result = await pool.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async delete(id: number): Promise<boolean> {
    const query = `DELETE FROM quyen_han WHERE quyen_han_id = $1`;
    const result = await pool.query(query, [id]);
    return (result.rowCount === undefined || result.rowCount === null ? 0 : result.rowCount) > 0;
  }
}

