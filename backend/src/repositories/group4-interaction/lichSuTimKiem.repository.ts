import { pool } from "../../config/db";
import { LichSuTimKiem } from "../../models/group4-interaction/lichSuTimKiem.model";

export class LichSuTimKiemRepository {
  async create(data: Partial<LichSuTimKiem>): Promise<LichSuTimKiem> {
    const query = `
      INSERT INTO lich_su_tim_kiem (nguoi_dung_id, tu_khoa_tim_kiem, bo_loc_tim_kiem)
      VALUES ($1, $2, $3)
      RETURNING
        lich_su_id AS "lichSuId",
        nguoi_dung_id AS "nguoiDungId",
        tu_khoa_tim_kiem AS "tuKhoaTimKiem",
        bo_loc_tim_kiem AS "boLocTimKiem",
        thoi_gian_tim_kiem AS "thoiGianTimKiem"
    `;
    const result = await pool.query(query, [
      data.nguoiDungId,
      data.tuKhoaTimKiem === undefined || data.tuKhoaTimKiem === null ? null : data.tuKhoaTimKiem,
      data.boLocTimKiem === undefined || data.boLocTimKiem === null ? null : data.boLocTimKiem,
    ]);
    return result.rows[0];
  }

  async findByNguoiDungId(nguoiDungId: number, limit: number = 20): Promise<LichSuTimKiem[]> {
    const query = `
      SELECT
        lich_su_id AS "lichSuId",
        nguoi_dung_id AS "nguoiDungId",
        tu_khoa_tim_kiem AS "tuKhoaTimKiem",
        bo_loc_tim_kiem AS "boLocTimKiem",
        thoi_gian_tim_kiem AS "thoiGianTimKiem"
      FROM lich_su_tim_kiem
      WHERE nguoi_dung_id = $1
      ORDER BY thoi_gian_tim_kiem DESC
      LIMIT $2
    `;
    const result = await pool.query(query, [nguoiDungId, limit]);
    return result.rows;
  }

  async deleteByNguoiDungId(nguoiDungId: number): Promise<boolean> {
    const query = `DELETE FROM lich_su_tim_kiem WHERE nguoi_dung_id = $1`;
    const result = await pool.query(query, [nguoiDungId]);
    return (result.rowCount === undefined || result.rowCount === null ? 0 : result.rowCount) > 0;
  }
}
