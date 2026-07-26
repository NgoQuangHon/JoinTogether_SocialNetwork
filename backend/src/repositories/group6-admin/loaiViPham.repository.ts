import { pool } from "../../config/db";
import { LoaiViPham } from "../../models/group6-admin/loaiViPham.model";

export class LoaiViPhamRepository {
  async findAll(): Promise<LoaiViPham[]> {
    const query = `
      SELECT
        loai_vi_pham_id AS "loaiViPhamId",
        ten_loai AS "tenLoai",
        mo_ta AS "moTa",
        muc_do AS "mucDo"
      FROM loai_vi_pham
      ORDER BY muc_do ASC, ten_loai ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  async findById(id: number): Promise<LoaiViPham | null> {
    const query = `
      SELECT
        loai_vi_pham_id AS "loaiViPhamId",
        ten_loai AS "tenLoai",
        mo_ta AS "moTa",
        muc_do AS "mucDo"
      FROM loai_vi_pham
      WHERE loai_vi_pham_id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async create(data: Partial<LoaiViPham>): Promise<LoaiViPham> {
    const query = `
      INSERT INTO loai_vi_pham (ten_loai, mo_ta, muc_do)
      VALUES ($1, $2, $3)
      RETURNING
        loai_vi_pham_id AS "loaiViPhamId",
        ten_loai AS "tenLoai",
        mo_ta AS "moTa",
        muc_do AS "mucDo"
    `;
    const result = await pool.query(query, [
      data.tenLoai,
      data.moTa ?? null,
      data.mucDo ?? null,
    ]);
    return result.rows[0];
  }

  // ==================== UC6.3: QUẢN LÝ VI PHẠM ====================

  async update(id: number, data: Partial<LoaiViPham>): Promise<LoaiViPham | null> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.tenLoai !== undefined) {
      setClauses.push(`ten_loai = $${paramIndex++}`);
      values.push(data.tenLoai);
    }
    if (data.moTa !== undefined) {
      setClauses.push(`mo_ta = $${paramIndex++}`);
      values.push(data.moTa);
    }
    if (data.mucDo !== undefined) {
      setClauses.push(`muc_do = $${paramIndex++}`);
      values.push(data.mucDo);
    }

    if (setClauses.length === 0) return this.findById(id);

    values.push(id);
    const query = `
      UPDATE loai_vi_pham
      SET ${setClauses.join(", ")}
      WHERE loai_vi_pham_id = $${paramIndex}
      RETURNING
        loai_vi_pham_id AS "loaiViPhamId",
        ten_loai AS "tenLoai",
        mo_ta AS "moTa",
        muc_do AS "mucDo"
    `;
    const result = await pool.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async delete(id: number): Promise<boolean> {
    const query = `DELETE FROM loai_vi_pham WHERE loai_vi_pham_id = $1`;
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async getStats(): Promise<any> {
    const query = `
      SELECT
        lvp.loai_vi_pham_id AS "loaiViPhamId",
        lvp.ten_loai AS "tenLoai",
        COUNT(bcvp.bao_cao_id)::int AS "soLuongBaoCao"
      FROM loai_vi_pham lvp
      LEFT JOIN bao_cao_vi_pham bcvp ON lvp.loai_vi_pham_id = bcvp.loai_vi_pham_id
      GROUP BY lvp.loai_vi_pham_id, lvp.ten_loai
      ORDER BY "soLuongBaoCao" DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }
}

