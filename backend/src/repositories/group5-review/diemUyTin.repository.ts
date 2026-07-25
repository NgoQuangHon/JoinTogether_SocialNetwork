import { pool } from "../../config/db";
import { DiemUyTin } from "../../models/group5-review/diemUyTin.model";

export class DiemUyTinRepository {
  async findOrCreate(nguoiDungId: number): Promise<DiemUyTin> {
    const query = `
      INSERT INTO diem_uy_tin (nguoi_dung_id, diem_hien_tai, so_luot_danh_gia, so_lan_canh_bao)
      VALUES ($1, 100, 0, 0)
      ON CONFLICT (nguoi_dung_id) DO UPDATE
        SET nguoi_dung_id = EXCLUDED.nguoi_dung_id
      RETURNING
        diem_uy_tin_id AS "diemUyTinId",
        nguoi_dung_id AS "nguoiDungId",
        diem_hien_tai AS "diemHienTai",
        so_luot_danh_gia AS "soLuotDanhGia",
        so_lan_canh_bao AS "soLanCanhBao"
    `;
    const result = await pool.query(query, [nguoiDungId]);
    return result.rows[0];
  }

  async findByNguoiDungId(nguoiDungId: number): Promise<DiemUyTin | null> {
    const query = `
      SELECT
        diem_uy_tin_id AS "diemUyTinId",
        nguoi_dung_id AS "nguoiDungId",
        diem_hien_tai AS "diemHienTai",
        so_luot_danh_gia AS "soLuotDanhGia",
        so_lan_canh_bao AS "soLanCanhBao"
      FROM diem_uy_tin
      WHERE nguoi_dung_id = $1
    `;
    const result = await pool.query(query, [nguoiDungId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async updateDiem(nguoiDungId: number, diemThayDoi: number): Promise<DiemUyTin | null> {
    const query = `
      UPDATE diem_uy_tin
      SET
        diem_hien_tai = GREATEST(0, diem_hien_tai + $1),
        so_luot_danh_gia = so_luot_danh_gia + 1
      WHERE nguoi_dung_id = $2
      RETURNING
        diem_uy_tin_id AS "diemUyTinId",
        nguoi_dung_id AS "nguoiDungId",
        diem_hien_tai AS "diemHienTai",
        so_luot_danh_gia AS "soLuotDanhGia",
        so_lan_canh_bao AS "soLanCanhBao"
    `;
    const result = await pool.query(query, [diemThayDoi, nguoiDungId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async tangSoLanCanhBao(nguoiDungId: number): Promise<DiemUyTin | null> {
    const query = `
      UPDATE diem_uy_tin
      SET
        so_lan_canh_bao = so_lan_canh_bao + 1,
        diem_hien_tai = GREATEST(0, diem_hien_tai - 20)
      WHERE nguoi_dung_id = $1
      RETURNING
        diem_uy_tin_id AS "diemUyTinId",
        nguoi_dung_id AS "nguoiDungId",
        diem_hien_tai AS "diemHienTai",
        so_luot_danh_gia AS "soLuotDanhGia",
        so_lan_canh_bao AS "soLanCanhBao"
    `;
    const result = await pool.query(query, [nguoiDungId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }
}

