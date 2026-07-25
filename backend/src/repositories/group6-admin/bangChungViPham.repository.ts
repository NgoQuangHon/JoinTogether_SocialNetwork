import { pool } from "../../config/db";
import { BangChungViPham } from "../../models/group6-admin/bangChungViPham.model";

export class BangChungViPhamRepository {
  async create(data: Partial<BangChungViPham>): Promise<BangChungViPham> {
    const query = `
      INSERT INTO bang_chung_vi_pham (bao_cao_id, loai_bang_chung, duong_dan)
      VALUES ($1, $2, $3)
      RETURNING
        bang_chung_id AS "bangChungId",
        bao_cao_id AS "baoCaoId",
        loai_bang_chung AS "loaiBangChung",
        duong_dan AS "duongDan"
    `;
    const result = await pool.query(query, [
      data.baoCaoId,
      data.loaiBangChung ?? null,
      data.duongDan,
    ]);
    return result.rows[0];
  }

  async findByBaoCaoId(baoCaoId: number): Promise<BangChungViPham[]> {
    const query = `
      SELECT
        bang_chung_id AS "bangChungId",
        bao_cao_id AS "baoCaoId",
        loai_bang_chung AS "loaiBangChung",
        duong_dan AS "duongDan"
      FROM bang_chung_vi_pham
      WHERE bao_cao_id = $1
    `;
    const result = await pool.query(query, [baoCaoId]);
    return result.rows;
  }
}

