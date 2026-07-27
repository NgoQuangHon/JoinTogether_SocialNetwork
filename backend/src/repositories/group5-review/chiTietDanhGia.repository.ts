import { pool, Queryable } from "../../config/db";
import { ChiTietDanhGia } from "../../models/group5-review/chiTietDanhGia.model";

export class ChiTietDanhGiaRepository {
  async create(data: Partial<ChiTietDanhGia>, executor: Queryable = pool): Promise<ChiTietDanhGia> {
    const query = `
      INSERT INTO chi_tiet_danh_gia (danh_gia_id, tieu_chi_danh_gia_id, diem)
      VALUES ($1, $2, $3)
      RETURNING
        danh_gia_id AS "danhGiaId",
        tieu_chi_danh_gia_id AS "tieuChiDanhGiaId",
        diem
    `;
    const result = await pool.query(query, [
      data.danhGiaId,
      data.tieuChiDanhGiaId,
      data.diem === undefined || data.diem === null ? null : data.diem,
    ]);
    return result.rows[0];
  }

  async findByDanhGiaId(danhGiaId: number): Promise<any[]> {
    const query = `
      SELECT
        ct.danh_gia_id AS "danhGiaId",
        ct.tieu_chi_danh_gia_id AS "tieuChiDanhGiaId",
        tc.ten_tieu_chi AS "tenTieuChi",
        ct.diem
      FROM chi_tiet_danh_gia ct
      JOIN tieu_chi_danh_gia tc ON ct.tieu_chi_danh_gia_id = tc.tieu_chi_danh_gia_id
      WHERE ct.danh_gia_id = $1
    `;
    const result = await pool.query(query, [danhGiaId]);
    return result.rows;
  }

  async deleteByDanhGiaId(danhGiaId: number): Promise<boolean> {
    const query = `DELETE FROM chi_tiet_danh_gia WHERE danh_gia_id = $1`;
    const result = await pool.query(query, [danhGiaId]);
    return (result.rowCount === undefined || result.rowCount === null ? 0 : result.rowCount) > 0;
  }
}

