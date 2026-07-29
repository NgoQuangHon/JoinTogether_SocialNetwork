import { pool } from "../../config/db";
import { ThongBao } from "../../models/group4-interaction/thongBao.model";

export class ThongBaoRepository {
  async create(data: Partial<ThongBao>): Promise<ThongBao> {
    const query = `
      INSERT INTO thong_bao (nguoi_nhan_id, tieu_de, noi_dung, loai_thong_bao, duong_dan)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        thong_bao_id AS "thongBaoId",
        nguoi_nhan_id AS "nguoiNhanId",
        tieu_de AS "tieuDe",
        noi_dung AS "noiDung",
        loai_thong_bao AS "loaiThongBao",
        duong_dan AS "duongDan"
    `;
    const result = await pool.query(query, [
      data.nguoiNhanId,
      data.tieuDe === undefined || data.tieuDe === null ? null : data.tieuDe,
      data.noiDung === undefined || data.noiDung === null ? null : data.noiDung,
      data.loaiThongBao === undefined || data.loaiThongBao === null ? 'CHUNG' : data.loaiThongBao,
      data.duongDan === undefined || data.duongDan === null ? null : data.duongDan,
    ]);
    return result?.rows?.[0] || (data as ThongBao);
  }

  async findById(id: number): Promise<ThongBao | null> {
    const query = `
      SELECT
        thong_bao_id AS "thongBaoId",
        nguoi_nhan_id AS "nguoiNhanId",
        tieu_de AS "tieuDe",
        noi_dung AS "noiDung",
        loai_thong_bao AS "loaiThongBao",
        duong_dan AS "duongDan"
      FROM thong_bao
      WHERE thong_bao_id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async findByNguoiNhanId(nguoiNhanId: number, limit: number = 20, offset: number = 0): Promise<any[]> {
    const query = `
      SELECT
        thong_bao_id AS "thongBaoId",
        nguoi_nhan_id AS "nguoiNhanId",
        tieu_de AS "tieuDe",
        noi_dung AS "noiDung",
        loai_thong_bao AS "loaiThongBao",
        duong_dan AS "duongDan"
      FROM thong_bao
      WHERE nguoi_nhan_id = $1
      ORDER BY thong_bao_id DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [nguoiNhanId, limit, offset]);
    return result.rows;
  }

  async delete(id: number): Promise<boolean> {
    const query = `DELETE FROM thong_bao WHERE thong_bao_id = $1`;
    const result = await pool.query(query, [id]);
    return (result.rowCount === undefined || result.rowCount === null ? 0 : result.rowCount) > 0;
  }
}
