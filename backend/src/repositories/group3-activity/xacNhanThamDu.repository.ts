import { pool } from "../../config/db";
import { XacNhanThamDu } from "../../models/group3-activity/xacNhanThamDu.model";

export class XacNhanThamDuRepository {
  async create(data: Partial<XacNhanThamDu>): Promise<XacNhanThamDu> {
    const query = `
      INSERT INTO xac_nhan_tham_du (thanh_vien_id, trang_thai_tham_du, thoi_gian_check_in)
      VALUES ($1, $2, $3)
      RETURNING
        xac_nhan_id AS "xacNhanId",
        thanh_vien_id AS "thanhVienId",
        trang_thai_tham_du AS "trangThaiThamDu",
        thoi_gian_check_in AS "thoiGianCheckIn"
    `;
    const result = await pool.query(query, [
      data.thanhVienId,
      data.trangThaiThamDu === undefined || data.trangThaiThamDu === null ? 'CHUA_DIEM_DANH' : data.trangThaiThamDu,
      data.thoiGianCheckIn === undefined || data.thoiGianCheckIn === null ? null : data.thoiGianCheckIn,
    ]);
    return result.rows[0];
  }

  async findById(id: number): Promise<XacNhanThamDu | null> {
    const query = `
      SELECT
        xac_nhan_id AS "xacNhanId",
        thanh_vien_id AS "thanhVienId",
        trang_thai_tham_du AS "trangThaiThamDu",
        thoi_gian_check_in AS "thoiGianCheckIn"
      FROM xac_nhan_tham_du
      WHERE xac_nhan_id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async findByThanhVienId(thanhVienId: number): Promise<XacNhanThamDu | null> {
    const query = `
      SELECT
        xac_nhan_id AS "xacNhanId",
        thanh_vien_id AS "thanhVienId",
        trang_thai_tham_du AS "trangThaiThamDu",
        thoi_gian_check_in AS "thoiGianCheckIn"
      FROM xac_nhan_tham_du
      WHERE thanh_vien_id = $1
    `;
    const result = await pool.query(query, [thanhVienId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async update(id: number, data: Partial<XacNhanThamDu>): Promise<XacNhanThamDu | null> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.trangThaiThamDu !== undefined) {
      setClauses.push(`trang_thai_tham_du = $${paramIndex++}`);
      values.push(data.trangThaiThamDu);
    }
    if (data.thoiGianCheckIn !== undefined) {
      setClauses.push(`thoi_gian_check_in = $${paramIndex++}`);
      values.push(data.thoiGianCheckIn);
    }

    if (setClauses.length === 0) return this.findById(id);

    values.push(id);
    const query = `
      UPDATE xac_nhan_tham_du
      SET ${setClauses.join(", ")}
      WHERE xac_nhan_id = $${paramIndex}
      RETURNING
        xac_nhan_id AS "xacNhanId",
        thanh_vien_id AS "thanhVienId",
        trang_thai_tham_du AS "trangThaiThamDu",
        thoi_gian_check_in AS "thoiGianCheckIn"
    `;
    const result = await pool.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async findByHoatDongId(hoatDongId: number): Promise<any[]> {
    const query = `
      SELECT
        xnt.xac_nhan_id AS "xacNhanId",
        xnt.thanh_vien_id AS "thanhVienId",
        tv.nguoi_dung_id AS "nguoiDungId",
        nd.ho_ten AS "hoTen",
        xnt.trang_thai_tham_du AS "trangThaiThamDu",
        xnt.thoi_gian_check_in AS "thoiGianCheckIn"
      FROM xac_nhan_tham_du xnt
      JOIN thanh_vien_hoat_dong tv ON xnt.thanh_vien_id = tv.thanh_vien_id
      JOIN nguoi_dung nd ON tv.nguoi_dung_id = nd.nguoi_dung_id
      WHERE tv.hoat_dong_id = $1
      ORDER BY xnt.thoi_gian_check_in DESC NULLS LAST
    `;
    const result = await pool.query(query, [hoatDongId]);
    return result.rows;
  }
}

