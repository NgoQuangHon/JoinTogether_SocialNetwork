import { pool } from "../../config/db";
import { TieuChiThamGia } from "../../models/group3-activity/tieuChiThamGia.model";

export class TieuChiThamGiaRepository {
  async findByHoatDongId(hoatDongId: number): Promise<TieuChiThamGia[]> {
    const query = `
      SELECT
        tieu_chi_id AS "tieuChiId",
        hoat_dong_id AS "hoatDongId",
        ten_tieu_chi AS "tenTieuChi",
        gia_tri_yeu_cau AS "giaTriYeuCau",
        bat_buoc AS "batBuoc"
      FROM tieu_chi_tham_gia
      WHERE hoat_dong_id = $1
      ORDER BY tieu_chi_id
    `;
    const result = await pool.query(query, [hoatDongId]);
    return result.rows;
  }

  async findById(id: number): Promise<TieuChiThamGia | null> {
    const query = `
      SELECT
        tieu_chi_id AS "tieuChiId",
        hoat_dong_id AS "hoatDongId",
        ten_tieu_chi AS "tenTieuChi",
        gia_tri_yeu_cau AS "giaTriYeuCau",
        bat_buoc AS "batBuoc"
      FROM tieu_chi_tham_gia
      WHERE tieu_chi_id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async create(data: Partial<TieuChiThamGia>): Promise<TieuChiThamGia> {
    const query = `
      INSERT INTO tieu_chi_tham_gia (hoat_dong_id, ten_tieu_chi, gia_tri_yeu_cau, bat_buoc)
      VALUES ($1, $2, $3, $4)
      RETURNING
        tieu_chi_id AS "tieuChiId",
        hoat_dong_id AS "hoatDongId",
        ten_tieu_chi AS "tenTieuChi",
        gia_tri_yeu_cau AS "giaTriYeuCau",
        bat_buoc AS "batBuoc"
    `;
    const result = await pool.query(query, [
      data.hoatDongId,
      data.tenTieuChi,
      data.giaTriYeuCau === undefined || data.giaTriYeuCau === null ? null : data.giaTriYeuCau,
      data.batBuoc === undefined || data.batBuoc === null ? false : data.batBuoc,
    ]);
    return result.rows[0];
  }

  async update(id: number, data: Partial<TieuChiThamGia>): Promise<TieuChiThamGia | null> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.tenTieuChi !== undefined) { setClauses.push(`ten_tieu_chi = $${paramIndex++}`); values.push(data.tenTieuChi); }
    if (data.giaTriYeuCau !== undefined) { setClauses.push(`gia_tri_yeu_cau = $${paramIndex++}`); values.push(data.giaTriYeuCau); }
    if (data.batBuoc !== undefined) { setClauses.push(`bat_buoc = $${paramIndex++}`); values.push(data.batBuoc); }

    if (setClauses.length === 0) return this.findById(id);

    values.push(id);
    const query = `
      UPDATE tieu_chi_tham_gia
      SET ${setClauses.join(', ')}
      WHERE tieu_chi_id = $${paramIndex}
      RETURNING
        tieu_chi_id AS "tieuChiId",
        hoat_dong_id AS "hoatDongId",
        ten_tieu_chi AS "tenTieuChi",
        gia_tri_yeu_cau AS "giaTriYeuCau",
        bat_buoc AS "batBuoc"
    `;
    const result = await pool.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async delete(id: number): Promise<boolean> {
    const query = `DELETE FROM tieu_chi_tham_gia WHERE tieu_chi_id = $1`;
    const result = await pool.query(query, [id]);
    return (result.rowCount === undefined || result.rowCount === null ? 0 : result.rowCount) > 0;
  }

  async deleteByHoatDongId(hoatDongId: number): Promise<boolean> {
    const query = `DELETE FROM tieu_chi_tham_gia WHERE hoat_dong_id = $1`;
    const result = await pool.query(query, [hoatDongId]);
    return (result.rowCount === undefined || result.rowCount === null ? 0 : result.rowCount) > 0;
  }
}
