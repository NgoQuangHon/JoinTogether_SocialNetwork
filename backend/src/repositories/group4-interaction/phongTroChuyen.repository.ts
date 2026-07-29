import { pool } from "../../config/db";
import { PhongTroChuyen } from "../../models/group4-interaction/phongTroChuyen.model";

export class PhongTroChuyenRepository {
  async create(data: Partial<PhongTroChuyen>): Promise<PhongTroChuyen> {
    const query = `
      INSERT INTO phong_tro_chuyen (hoat_dong_id, ten_phong, loai_phong, trang_thai)
      VALUES ($1, $2, $3, $4)
      RETURNING
        phong_id AS "phongId",
        hoat_dong_id AS "hoatDongId",
        ten_phong AS "tenPhong",
        loai_phong AS "loaiPhong",
        trang_thai AS "trangThai",
        ngay_tao AS "ngayTao"
    `;
    const result = await pool.query(query, [
      data.hoatDongId,
      data.tenPhong === undefined || data.tenPhong === null ? null : data.tenPhong,
      data.loaiPhong === undefined || data.loaiPhong === null ? 'NHOM' : data.loaiPhong,
      data.trangThai === undefined || data.trangThai === null ? 'ACTIVE' : data.trangThai,
    ]);
    return result.rows[0];
  }

  async findById(id: number): Promise<PhongTroChuyen | null> {
    const query = `
      SELECT
        phong_id AS "phongId",
        hoat_dong_id AS "hoatDongId",
        ten_phong AS "tenPhong",
        loai_phong AS "loaiPhong",
        trang_thai AS "trangThai",
        ngay_tao AS "ngayTao"
      FROM phong_tro_chuyen
      WHERE phong_id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async findByHoatDongId(hoatDongId: number): Promise<PhongTroChuyen | null> {
    const query = `
      SELECT
        phong_id AS "phongId",
        hoat_dong_id AS "hoatDongId",
        ten_phong AS "tenPhong",
        loai_phong AS "loaiPhong",
        trang_thai AS "trangThai",
        ngay_tao AS "ngayTao"
      FROM phong_tro_chuyen
      WHERE hoat_dong_id = $1
    `;
    const result = await pool.query(query, [hoatDongId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async findRoomsByUser(nguoiDungId: number): Promise<any[]> {
    const query = `
      SELECT DISTINCT
        pt.phong_id AS "phongId",
        pt.hoat_dong_id AS "hoatDongId",
        hd.ten_hoat_dong AS "tenHoatDong",
        pt.ten_phong AS "tenPhong",
        pt.loai_phong AS "loaiPhong",
        pt.trang_thai AS "trangThai",
        pt.ngay_tao AS "ngayTao",
        (SELECT COUNT(*) FROM tin_nhan tn WHERE tn.phong_id = pt.phong_id) AS "soLuongTinNhan"
      FROM phong_tro_chuyen pt
      LEFT JOIN hoat_dong hd ON pt.hoat_dong_id = hd.hoat_dong_id
      LEFT JOIN thanh_vien_hoat_dong tv ON tv.hoat_dong_id = pt.hoat_dong_id
      LEFT JOIN thanh_vien_phong tvp ON tvp.phong_id = pt.phong_id
      WHERE (hd.nguoi_to_chuc_id = $1 OR tv.nguoi_dung_id = $1 OR tvp.nguoi_dung_id = $1)
        AND pt.trang_thai = 'ACTIVE'
      ORDER BY pt.ngay_tao DESC
    `;
    const result = await pool.query(query, [nguoiDungId]);
    return result.rows;
  }

  async update(id: number, data: Partial<PhongTroChuyen>): Promise<PhongTroChuyen | null> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.tenPhong !== undefined) {
      setClauses.push(`ten_phong = $${paramIndex++}`);
      values.push(data.tenPhong);
    }
    if (data.loaiPhong !== undefined) {
      setClauses.push(`loai_phong = $${paramIndex++}`);
      values.push(data.loaiPhong);
    }
    if (data.trangThai !== undefined) {
      setClauses.push(`trang_thai = $${paramIndex++}`);
      values.push(data.trangThai);
    }

    if (setClauses.length === 0) return this.findById(id);

    values.push(id);
    const query = `
      UPDATE phong_tro_chuyen
      SET ${setClauses.join(", ")}
      WHERE phong_id = $${paramIndex}
      RETURNING
        phong_id AS "phongId",
        hoat_dong_id AS "hoatDongId",
        ten_phong AS "tenPhong",
        loai_phong AS "loaiPhong",
        trang_thai AS "trangThai",
        ngay_tao AS "ngayTao"
    `;
    const result = await pool.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }
}
