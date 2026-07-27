import { pool } from "../../config/db";
import { NhatKyQuanTri } from "../../models/group6-admin/nhatKyQuanTri.model";

export class NhatKyQuanTriRepository {
  async create(data: Partial<NhatKyQuanTri>): Promise<NhatKyQuanTri> {
    const query = `
      INSERT INTO nhat_ky_quan_tri (nguoi_quan_tri_id, hanh_dong, doi_tuong_tac_dong)
      VALUES ($1, $2, $3)
      RETURNING
        nhat_ky_id AS "nhatKyId",
        nguoi_quan_tri_id AS "nguoiQuanTriId",
        hanh_dong AS "hanhDong",
        doi_tuong_tac_dong AS "doiTuongTacDong",
        thoi_gian_thuc_hien AS "thoiGianThucHien"
    `;
    const result = await pool.query(query, [
      data.nguoiQuanTriId,
      data.hanhDong,
      data.doiTuongTacDong === undefined || data.doiTuongTacDong === null ? null : data.doiTuongTacDong,
    ]);
    return result.rows[0];
  }

  async findAll(
    limit: number = 50,
    offset: number = 0,
    filters?: { hanhDong?: string; nguoiDungId?: number; tuNgay?: string; denNgay?: string }
  ): Promise<any[]> {
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (filters?.hanhDong) {
      conditions.push(`nk.hanh_dong ILIKE $${paramIndex++}`);
      values.push(`%${filters.hanhDong}%`);
    }
    if (filters?.nguoiDungId) {
      conditions.push(`nk.nguoi_quan_tri_id = $${paramIndex++}`);
      values.push(filters.nguoiDungId);
    }
    if (filters?.tuNgay) {
      conditions.push(`nk.thoi_gian_thuc_hien >= $${paramIndex++}`);
      values.push(filters.tuNgay);
    }
    if (filters?.denNgay) {
      conditions.push(`nk.thoi_gian_thuc_hien <= $${paramIndex++}`);
      values.push(filters.denNgay);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const query = `
      SELECT
        nk.nhat_ky_id AS "nhatKyId",
        nk.nguoi_quan_tri_id AS "nguoiQuanTriId",
        nd.ho_ten AS "nguoiQuanTri",
        nk.hanh_dong AS "hanhDong",
        nk.doi_tuong_tac_dong AS "doiTuongTacDong",
        nk.thoi_gian_thuc_hien AS "thoiGianThucHien"
      FROM nhat_ky_quan_tri nk
      LEFT JOIN nguoi_dung nd ON nk.nguoi_quan_tri_id = nd.nguoi_dung_id
      ${whereClause}
      ORDER BY nk.thoi_gian_thuc_hien DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    values.push(limit, offset);
    const result = await pool.query(query, values);
    return result.rows;
  }
}

