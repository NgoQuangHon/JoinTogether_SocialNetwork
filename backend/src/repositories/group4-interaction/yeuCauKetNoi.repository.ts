import { pool, Queryable } from "../../config/db";
import { YeuCauKetNoi } from "../../models/group4-interaction/yeuCauKetNoi.model";

export class YeuCauKetNoiRepository {
  async create(data: Partial<YeuCauKetNoi>): Promise<YeuCauKetNoi> {
    const query = `
      INSERT INTO yeu_cau_ket_noi (nguoi_gui_id, nguoi_nhan_id, loi_nhan, trang_thai)
      VALUES ($1, $2, $3, $4)
      RETURNING
        yeu_cau_ket_noi_id AS "yeuCauKetNoiId",
        nguoi_gui_id AS "nguoiGuiId",
        nguoi_nhan_id AS "nguoiNhanId",
        loi_nhan AS "loiNhan",
        trang_thai AS "trangThai"
    `;
    const result = await pool.query(query, [
      data.nguoiGuiId,
      data.nguoiNhanId,
      data.loiNhan === undefined || data.loiNhan === null ? null : data.loiNhan,
      data.trangThai === undefined || data.trangThai === null ? 'PENDING' : data.trangThai,
    ]);
    return result.rows[0];
  }

  async findById(id: number): Promise<YeuCauKetNoi | null> {
    const query = `
      SELECT
        yeu_cau_ket_noi_id AS "yeuCauKetNoiId",
        nguoi_gui_id AS "nguoiGuiId",
        nguoi_nhan_id AS "nguoiNhanId",
        loi_nhan AS "loiNhan",
        trang_thai AS "trangThai"
      FROM yeu_cau_ket_noi
      WHERE yeu_cau_ket_noi_id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async findPendingByUser(nguoiDungId: number): Promise<any[]> {
    const query = `
      SELECT
        yc.yeu_cau_ket_noi_id AS "yeuCauKetNoiId",
        yc.nguoi_gui_id AS "nguoiGuiId",
        ng.ho_ten AS "nguoiGui",
        yc.nguoi_nhan_id AS "nguoiNhanId",
        nn.ho_ten AS "nguoiNhan",
        yc.loi_nhan AS "loiNhan",
        yc.trang_thai AS "trangThai"
      FROM yeu_cau_ket_noi yc
      LEFT JOIN nguoi_dung ng ON yc.nguoi_gui_id = ng.nguoi_dung_id
      LEFT JOIN nguoi_dung nn ON yc.nguoi_nhan_id = nn.nguoi_dung_id
      WHERE (yc.nguoi_nhan_id = $1 OR yc.nguoi_gui_id = $1)
        AND yc.trang_thai = 'PENDING'
      ORDER BY yc.yeu_cau_ket_noi_id DESC
    `;
    const result = await pool.query(query, [nguoiDungId]);
    return result.rows;
  }

  async findExistingRequest(nguoiGuiId: number, nguoiNhanId: number): Promise<YeuCauKetNoi | null> {
    const query = `
      SELECT
        yeu_cau_ket_noi_id AS "yeuCauKetNoiId",
        nguoi_gui_id AS "nguoiGuiId",
        nguoi_nhan_id AS "nguoiNhanId",
        loi_nhan AS "loiNhan",
        trang_thai AS "trangThai"
      FROM yeu_cau_ket_noi
      WHERE ((nguoi_gui_id = $1 AND nguoi_nhan_id = $2) OR (nguoi_gui_id = $2 AND nguoi_nhan_id = $1))
        AND trang_thai = 'PENDING'
    `;
    const result = await pool.query(query, [nguoiGuiId, nguoiNhanId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async updateStatus(id: number, trangThai: string, executor: Queryable = pool): Promise<YeuCauKetNoi | null> {
    const query = `
      UPDATE yeu_cau_ket_noi
      SET trang_thai = $1
      WHERE yeu_cau_ket_noi_id = $2
      RETURNING
        yeu_cau_ket_noi_id AS "yeuCauKetNoiId",
        nguoi_gui_id AS "nguoiGuiId",
        nguoi_nhan_id AS "nguoiNhanId",
        loi_nhan AS "loiNhan",
        trang_thai AS "trangThai"
    `;
    const result = await executor.query(query, [trangThai, id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async delete(id: number): Promise<boolean> {
    const query = `DELETE FROM yeu_cau_ket_noi WHERE yeu_cau_ket_noi_id = $1`;
    const result = await pool.query(query, [id]);
    return (result.rowCount === undefined || result.rowCount === null ? 0 : result.rowCount) > 0;
  }
}
