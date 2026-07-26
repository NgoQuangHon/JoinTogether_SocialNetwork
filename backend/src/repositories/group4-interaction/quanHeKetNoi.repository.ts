import { pool, Queryable } from "../../config/db";
import { QuanHeKetNoi } from "../../models/group4-interaction/quanHeKetNoi.model";

export class QuanHeKetNoiRepository {
  async create(data: Partial<QuanHeKetNoi>, executor: Queryable = pool): Promise<QuanHeKetNoi> {
    const query = `
      INSERT INTO quan_he_ket_noi (nguoi_dung_id_1, nguoi_dung_id_2, trang_thai)
      VALUES ($1, $2, $3)
      RETURNING
        quan_he_id AS "quanHeId",
        nguoi_dung_id_1 AS "nguoiDungId1",
        nguoi_dung_id_2 AS "nguoiDungId2",
        ngay_ket_noi AS "ngayKetNoi",
        trang_thai AS "trangThai"
    `;
    const result = await executor.query(query, [
      data.nguoiDungId1,
      data.nguoiDungId2,
      data.trangThai ?? 'ACTIVE',
    ]);
    return result.rows[0];
  }

  async findConnectionsByUser(nguoiDungId: number): Promise<any[]> {
    const query = `
      SELECT
        qh.quan_he_id AS "quanHeId",
        CASE WHEN qh.nguoi_dung_id_1 = $1 THEN qh.nguoi_dung_id_2 ELSE qh.nguoi_dung_id_1 END AS "nguoiDungId",
        nd.ho_ten AS "hoTen",
        nd.email,
        hs.anh_dai_dien AS "anhDaiDien",
        qh.ngay_ket_noi AS "ngayKetNoi",
        qh.trang_thai AS "trangThai"
      FROM quan_he_ket_noi qh
      JOIN nguoi_dung nd ON (CASE WHEN qh.nguoi_dung_id_1 = $1 THEN qh.nguoi_dung_id_2 ELSE qh.nguoi_dung_id_1 END = nd.nguoi_dung_id)
      LEFT JOIN ho_so_nguoi_dung hs ON nd.nguoi_dung_id = hs.nguoi_dung_id
      WHERE (qh.nguoi_dung_id_1 = $1 OR qh.nguoi_dung_id_2 = $1)
        AND qh.trang_thai = 'ACTIVE'
      ORDER BY qh.ngay_ket_noi DESC
    `;
    const result = await pool.query(query, [nguoiDungId]);
    return result.rows;
  }

  async findExistingConnection(nguoiDungId1: number, nguoiDungId2: number): Promise<QuanHeKetNoi | null> {
    const query = `
      SELECT
        quan_he_id AS "quanHeId",
        nguoi_dung_id_1 AS "nguoiDungId1",
        nguoi_dung_id_2 AS "nguoiDungId2",
        ngay_ket_noi AS "ngayKetNoi",
        trang_thai AS "trangThai"
      FROM quan_he_ket_noi
      WHERE ((nguoi_dung_id_1 = $1 AND nguoi_dung_id_2 = $2) OR (nguoi_dung_id_1 = $2 AND nguoi_dung_id_2 = $1))
        AND trang_thai = 'ACTIVE'
    `;
    const result = await pool.query(query, [nguoiDungId1, nguoiDungId2]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async delete(nguoiDungId1: number, nguoiDungId2: number): Promise<boolean> {
    const query = `
      DELETE FROM quan_he_ket_noi
      WHERE ((nguoi_dung_id_1 = $1 AND nguoi_dung_id_2 = $2) OR (nguoi_dung_id_1 = $2 AND nguoi_dung_id_2 = $1))
        AND trang_thai = 'ACTIVE'
    `;
    const result = await pool.query(query, [nguoiDungId1, nguoiDungId2]);
    return (result.rowCount ?? 0) > 0;
  }
}
