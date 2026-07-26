import { pool } from "../../config/db";
import { HinhAnhHoatDong } from "../../models/group3-activity/hinhAnhHoatDong.model";

export class HinhAnhHoatDongRepository {
  async findByHoatDongId(hoatDongId: number): Promise<HinhAnhHoatDong[]> {
    const query = `
      SELECT
        hinh_anh_id AS "hinhAnhId",
        hoat_dong_id AS "hoatDongId",
        duong_dan AS "duongDan",
        mo_ta AS "moTa",
        la_anh_dai_dien AS "laAnhDaiDien"
      FROM hinh_anh_hoat_dong
      WHERE hoat_dong_id = $1
      ORDER BY la_anh_dai_dien DESC, hinh_anh_id
    `;
    const result = await pool.query(query, [hoatDongId]);
    return result.rows;
  }

  async findById(id: number): Promise<HinhAnhHoatDong | null> {
    const query = `
      SELECT
        hinh_anh_id AS "hinhAnhId",
        hoat_dong_id AS "hoatDongId",
        duong_dan AS "duongDan",
        mo_ta AS "moTa",
        la_anh_dai_dien AS "laAnhDaiDien"
      FROM hinh_anh_hoat_dong
      WHERE hinh_anh_id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async create(data: Partial<HinhAnhHoatDong>): Promise<HinhAnhHoatDong> {
    const query = `
      INSERT INTO hinh_anh_hoat_dong (hoat_dong_id, duong_dan, mo_ta, la_anh_dai_dien)
      VALUES ($1, $2, $3, $4)
      RETURNING
        hinh_anh_id AS "hinhAnhId",
        hoat_dong_id AS "hoatDongId",
        duong_dan AS "duongDan",
        mo_ta AS "moTa",
        la_anh_dai_dien AS "laAnhDaiDien"
    `;
    const result = await pool.query(query, [
      data.hoatDongId,
      data.duongDan,
      data.moTa === undefined || data.moTa === null ? null : data.moTa,
      data.laAnhDaiDien === undefined || data.laAnhDaiDien === null ? false : data.laAnhDaiDien,
    ]);
    return result.rows[0];
  }

  async delete(id: number): Promise<boolean> {
    const query = `DELETE FROM hinh_anh_hoat_dong WHERE hinh_anh_id = $1`;
    const result = await pool.query(query, [id]);
    return (result.rowCount === undefined || result.rowCount === null ? 0 : result.rowCount) > 0;
  }

  async setPrimaryImage(hoatDongId: number, hinhAnhId: number): Promise<void> {
    await pool.query(`UPDATE hinh_anh_hoat_dong SET la_anh_dai_dien = false WHERE hoat_dong_id = $1`, [hoatDongId]);
    await pool.query(`UPDATE hinh_anh_hoat_dong SET la_anh_dai_dien = true WHERE hinh_anh_id = $1`, [hinhAnhId]);
  }
}
