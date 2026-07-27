import { pool } from "../../config/db";
import { TinNhan } from "../../models/group4-interaction/tinNhan.model";

export class TinNhanRepository {
  async create(data: Partial<TinNhan>): Promise<TinNhan> {
    const query = `
      INSERT INTO tin_nhan (phong_id, nguoi_gui_id, noi_dung)
      VALUES ($1, $2, $3)
      RETURNING
        tin_nhan_id AS "tinNhanId",
        phong_id AS "phongId",
        nguoi_gui_id AS "nguoiGuiId",
        noi_dung AS "noiDung",
        thoi_gian_gui AS "thoiGianGui"
    `;
    const result = await pool.query(query, [
      data.phongId,
      data.nguoiGuiId === undefined || data.nguoiGuiId === null ? null : data.nguoiGuiId,
      data.noiDung,
    ]);
    return result.rows[0];
  }

  async findById(id: number): Promise<TinNhan | null> {
    const query = `
      SELECT
        tin_nhan_id AS "tinNhanId",
        phong_id AS "phongId",
        nguoi_gui_id AS "nguoiGuiId",
        noi_dung AS "noiDung",
        thoi_gian_gui AS "thoiGianGui"
      FROM tin_nhan
      WHERE tin_nhan_id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async findByPhongId(phongId: number, limit: number = 50, offset: number = 0): Promise<any[]> {
    const query = `
      SELECT
        tn.tin_nhan_id AS "tinNhanId",
        tn.phong_id AS "phongId",
        tn.nguoi_gui_id AS "nguoiGuiId",
        nd.ho_ten AS "nguoiGui",
        tn.noi_dung AS "noiDung",
        tn.thoi_gian_gui AS "thoiGianGui"
      FROM tin_nhan tn
      LEFT JOIN nguoi_dung nd ON tn.nguoi_gui_id = nd.nguoi_dung_id
      WHERE tn.phong_id = $1
      ORDER BY tn.thoi_gian_gui DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [phongId, limit, offset]);
    return result.rows;
  }

  async delete(id: number): Promise<boolean> {
    const query = `DELETE FROM tin_nhan WHERE tin_nhan_id = $1`;
    const result = await pool.query(query, [id]);
    return (result.rowCount === undefined || result.rowCount === null ? 0 : result.rowCount) > 0;
  }

  async deleteByPhongId(phongId: number): Promise<boolean> {
    const query = `DELETE FROM tin_nhan WHERE phong_id = $1`;
    const result = await pool.query(query, [phongId]);
    return (result.rowCount === undefined || result.rowCount === null ? 0 : result.rowCount) > 0;
  }
}

