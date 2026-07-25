import { pool } from "../../config/db";
import { ThanhVienHoatDong } from "../../models/group3-activity/thanhVienHoatDong.model";

export class ThanhVienHoatDongRepository {
  async create(data: Partial<ThanhVienHoatDong>): Promise<ThanhVienHoatDong> {
    const query = `
      INSERT INTO thanh_vien_hoat_dong (hoat_dong_id, nguoi_dung_id, yeu_cau_id)
      VALUES ($1, $2, $3)
      RETURNING
        thanh_vien_id AS "thanhVienId",
        hoat_dong_id AS "hoatDongId",
        nguoi_dung_id AS "nguoiDungId",
        yeu_cau_id AS "yeuCauId",
        ngay_tham_gia AS "ngayThamGia"
    `;
    const result = await pool.query(query, [
      data.hoatDongId,
      data.nguoiDungId,
      data.yeuCauId ?? null,
    ]);
    return result.rows[0];
  }

  async findById(id: number): Promise<ThanhVienHoatDong | null> {
    const query = `
      SELECT
        thanh_vien_id AS "thanhVienId",
        hoat_dong_id AS "hoatDongId",
        nguoi_dung_id AS "nguoiDungId",
        yeu_cau_id AS "yeuCauId",
        ngay_tham_gia AS "ngayThamGia"
      FROM thanh_vien_hoat_dong
      WHERE thanh_vien_id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async findByHoatDongId(hoatDongId: number): Promise<any[]> {
    const query = `
      SELECT
        tv.thanh_vien_id AS "thanhVienId",
        tv.hoat_dong_id AS "hoatDongId",
        tv.nguoi_dung_id AS "nguoiDungId",
        nd.ho_ten AS "hoTen",
        nd.email,
        hs.anh_dai_dien AS "anhDaiDien",
        tv.yeu_cau_id AS "yeuCauId",
        tv.ngay_tham_gia AS "ngayThamGia",
        xnt.trang_thai_tham_du AS "trangThaiThamDu"
      FROM thanh_vien_hoat_dong tv
      JOIN nguoi_dung nd ON tv.nguoi_dung_id = nd.nguoi_dung_id
      LEFT JOIN ho_so_nguoi_dung hs ON nd.nguoi_dung_id = hs.nguoi_dung_id
      LEFT JOIN xac_nhan_tham_du xnt ON tv.thanh_vien_id = xnt.thanh_vien_id
      WHERE tv.hoat_dong_id = $1
      ORDER BY tv.ngay_tham_gia DESC
    `;
    const result = await pool.query(query, [hoatDongId]);
    return result.rows;
  }

  async findByUserAndActivity(nguoiDungId: number, hoatDongId: number): Promise<ThanhVienHoatDong | null> {
    const query = `
      SELECT
        thanh_vien_id AS "thanhVienId",
        hoat_dong_id AS "hoatDongId",
        nguoi_dung_id AS "nguoiDungId",
        yeu_cau_id AS "yeuCauId",
        ngay_tham_gia AS "ngayThamGia"
      FROM thanh_vien_hoat_dong
      WHERE hoat_dong_id = $1 AND nguoi_dung_id = $2
    `;
    const result = await pool.query(query, [hoatDongId, nguoiDungId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async isMember(nguoiDungId: number, hoatDongId: number): Promise<boolean> {
    const query = `
      SELECT 1 FROM thanh_vien_hoat_dong
      WHERE hoat_dong_id = $1 AND nguoi_dung_id = $2
      LIMIT 1
    `;
    const result = await pool.query(query, [hoatDongId, nguoiDungId]);
    return (result.rowCount ?? 0) > 0;
  }

  async delete(id: number): Promise<boolean> {
    const query = `DELETE FROM thanh_vien_hoat_dong WHERE thanh_vien_id = $1`;
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async deleteByUserAndActivity(nguoiDungId: number, hoatDongId: number): Promise<boolean> {
    const query = `
      DELETE FROM thanh_vien_hoat_dong
      WHERE nguoi_dung_id = $1 AND hoat_dong_id = $2
    `;
    const result = await pool.query(query, [nguoiDungId, hoatDongId]);
    return (result.rowCount ?? 0) > 0;
  }
}

