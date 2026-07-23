import { pool } from "../../config/db";
import { DanhMucHoatDong } from "../../models/group3-activity/danhMucHoatDong.model";

export class DanhMucHoatDongRepository {
  async findAll(): Promise<DanhMucHoatDong[]> {
    const query = `
      SELECT
        danh_muc_hoat_dong_id AS "danhMucHoatDongId",
        ten_danh_muc AS "tenDanhMuc",
        mo_ta AS "moTa"
      FROM danh_muc_hoat_dong
      ORDER BY ten_danh_muc
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  async findById(id: number): Promise<DanhMucHoatDong | null> {
    const query = `
      SELECT
        danh_muc_hoat_dong_id AS "danhMucHoatDongId",
        ten_danh_muc AS "tenDanhMuc",
        mo_ta AS "moTa"
      FROM danh_muc_hoat_dong
      WHERE danh_muc_hoat_dong_id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async create(data: Partial<DanhMucHoatDong>): Promise<DanhMucHoatDong> {
    const query = `
      INSERT INTO danh_muc_hoat_dong (ten_danh_muc, mo_ta)
      VALUES ($1, $2)
      RETURNING
        danh_muc_hoat_dong_id AS "danhMucHoatDongId",
        ten_danh_muc AS "tenDanhMuc",
        mo_ta AS "moTa"
    `;
    const result = await pool.query(query, [data.tenDanhMuc, data.moTa ?? null]);
    return result.rows[0];
  }

  async update(id: number, data: Partial<DanhMucHoatDong>): Promise<DanhMucHoatDong | null> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.tenDanhMuc !== undefined) { setClauses.push(`ten_danh_muc = $${paramIndex++}`); values.push(data.tenDanhMuc); }
    if (data.moTa !== undefined) { setClauses.push(`mo_ta = $${paramIndex++}`); values.push(data.moTa); }

    if (setClauses.length === 0) return this.findById(id);

    values.push(id);
    const query = `
      UPDATE danh_muc_hoat_dong
      SET ${setClauses.join(', ')}
      WHERE danh_muc_hoat_dong_id = $${paramIndex}
      RETURNING
        danh_muc_hoat_dong_id AS "danhMucHoatDongId",
        ten_danh_muc AS "tenDanhMuc",
        mo_ta AS "moTa"
    `;
    const result = await pool.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async delete(id: number): Promise<boolean> {
    const query = `DELETE FROM danh_muc_hoat_dong WHERE danh_muc_hoat_dong_id = $1`;
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
