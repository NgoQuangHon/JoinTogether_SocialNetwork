import { pool } from "../../config/db";
import { YeuCauThamGia } from "../../models/group3-activity/yeuCauThamGia.model";

export class YeuCauThamGiaRepository {
  async create(data: Partial<YeuCauThamGia>): Promise<YeuCauThamGia> {
    const query = `
      INSERT INTO yeu_cau_tham_gia (hoat_dong_id, nguoi_dung_id, trang_thai)
      VALUES ($1, $2, $3)
      RETURNING
        yeu_cau_id AS "yeuCauId",
        hoat_dong_id AS "hoatDongId",
        nguoi_dung_id AS "nguoiDungId",
        trang_thai AS "trangThai",
        thoi_gian_gui AS "thoiGianGui"
    `;
    const result = await pool.query(query, [
      data.hoatDongId,
      data.nguoiDungId,
      data.trangThai === undefined || data.trangThai === null ? 'PENDING' : data.trangThai,
    ]);
    return result.rows[0];
  }

  async findById(id: number): Promise<YeuCauThamGia | null> {
    const query = `
      SELECT
        yeu_cau_id AS "yeuCauId",
        hoat_dong_id AS "hoatDongId",
        nguoi_dung_id AS "nguoiDungId",
        trang_thai AS "trangThai",
        thoi_gian_gui AS "thoiGianGui"
      FROM yeu_cau_tham_gia
      WHERE yeu_cau_id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async findPendingByActivity(hoatDongId: number): Promise<any[]> {
    const query = `
      SELECT
        yc.yeu_cau_id AS "yeuCauId",
        yc.hoat_dong_id AS "hoatDongId",
        yc.nguoi_dung_id AS "nguoiDungId",
        nd.ho_ten AS "hoTen",
        nd.email,
        yc.trang_thai AS "trangThai",
        yc.thoi_gian_gui AS "thoiGianGui"
      FROM yeu_cau_tham_gia yc
      JOIN nguoi_dung nd ON yc.nguoi_dung_id = nd.nguoi_dung_id
      WHERE yc.hoat_dong_id = $1 AND yc.trang_thai = 'PENDING'
      ORDER BY yc.thoi_gian_gui ASC
    `;
    const result = await pool.query(query, [hoatDongId]);
    return result.rows;
  }

  async findExistingRequest(hoatDongId: number, nguoiDungId: number): Promise<YeuCauThamGia | null> {
    const query = `
      SELECT
        yeu_cau_id AS "yeuCauId",
        hoat_dong_id AS "hoatDongId",
        nguoi_dung_id AS "nguoiDungId",
        trang_thai AS "trangThai",
        thoi_gian_gui AS "thoiGianGui"
      FROM yeu_cau_tham_gia
      WHERE hoat_dong_id = $1 AND nguoi_dung_id = $2
    `;
    const result = await pool.query(query, [hoatDongId, nguoiDungId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async updateStatus(id: number, trangThai: string): Promise<YeuCauThamGia | null> {
    const query = `
      UPDATE yeu_cau_tham_gia
      SET trang_thai = $1
      WHERE yeu_cau_id = $2
      RETURNING
        yeu_cau_id AS "yeuCauId",
        hoat_dong_id AS "hoatDongId",
        nguoi_dung_id AS "nguoiDungId",
        trang_thai AS "trangThai",
        thoi_gian_gui AS "thoiGianGui"
    `;
    const result = await pool.query(query, [trangThai, id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }
}

