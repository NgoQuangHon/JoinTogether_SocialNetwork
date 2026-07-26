import { pool } from "../../config/db";
import { VaiTro } from "../../models/group1-user/vaiTro.model";

export class VaiTroRepository {
  async create(data: Partial<VaiTro>): Promise<VaiTro> {
    const query = `
      INSERT INTO vai_tro (ten_vai_tro, mo_ta)
      VALUES ($1, $2)
      RETURNING
        vai_tro_id AS "vaiTroId",
        ten_vai_tro AS "tenVaiTro",
        mo_ta AS "moTa"
    `;
    const result = await pool.query(query, [
      data.tenVaiTro,
      data.moTa === undefined || data.moTa === null ? null : data.moTa,
    ]);
    return result.rows[0];
  }

  async findAll(): Promise<VaiTro[]> {
    const query = `
      SELECT
        vai_tro_id AS "vaiTroId",
        ten_vai_tro AS "tenVaiTro",
        mo_ta AS "moTa"
      FROM vai_tro
      ORDER BY ten_vai_tro ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  async findById(id: number): Promise<VaiTro | null> {
    const query = `
      SELECT
        vai_tro_id AS "vaiTroId",
        ten_vai_tro AS "tenVaiTro",
        mo_ta AS "moTa"
      FROM vai_tro
      WHERE vai_tro_id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async update(id: number, data: Partial<VaiTro>): Promise<VaiTro | null> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.tenVaiTro !== undefined) {
      setClauses.push(`ten_vai_tro = $${paramIndex++}`);
      values.push(data.tenVaiTro);
    }
    if (data.moTa !== undefined) {
      setClauses.push(`mo_ta = $${paramIndex++}`);
      values.push(data.moTa);
    }

    if (setClauses.length === 0) return this.findById(id);

    values.push(id);
    const query = `
      UPDATE vai_tro
      SET ${setClauses.join(", ")}
      WHERE vai_tro_id = $${paramIndex}
      RETURNING
        vai_tro_id AS "vaiTroId",
        ten_vai_tro AS "tenVaiTro",
        mo_ta AS "moTa"
    `;
    const result = await pool.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async delete(id: number): Promise<boolean> {
    const query = `DELETE FROM vai_tro WHERE vai_tro_id = $1`;
    const result = await pool.query(query, [id]);
    return (result.rowCount === undefined || result.rowCount === null ? 0 : result.rowCount) > 0;
  }
}

