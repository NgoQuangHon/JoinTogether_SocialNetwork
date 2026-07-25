import { pool } from "../../config/db";
import { LichSuDiemUyTin } from "../../models/group5-review/lichSuDiemUyTin.model";

export class LichSuDiemUyTinRepository {
  async create(data: Partial<LichSuDiemUyTin>): Promise<LichSuDiemUyTin> {
    const query = `
      INSERT INTO lich_su_diem_uy_tin (diem_uy_tin_id, diem_thay_doi, ly_do_thay_doi)
      VALUES ($1, $2, $3)
      RETURNING
        lich_su_id AS "lichSuId",
        diem_uy_tin_id AS "diemUyTinId",
        diem_thay_doi AS "diemThayDoi",
        ly_do_thay_doi AS "lyDoThayDoi",
        thoi_gian_cap_nhat AS "thoiGianCapNhat"
    `;
    const result = await pool.query(query, [
      data.diemUyTinId,
      data.diemThayDoi,
      data.lyDoThayDoi ?? null,
    ]);
    return result.rows[0];
  }

  async findByDiemUyTinId(diemUyTinId: number): Promise<LichSuDiemUyTin[]> {
    const query = `
      SELECT
        lich_su_id AS "lichSuId",
        diem_uy_tin_id AS "diemUyTinId",
        diem_thay_doi AS "diemThayDoi",
        ly_do_thay_doi AS "lyDoThayDoi",
        thoi_gian_cap_nhat AS "thoiGianCapNhat"
      FROM lich_su_diem_uy_tin
      WHERE diem_uy_tin_id = $1
      ORDER BY thoi_gian_cap_nhat DESC
    `;
    const result = await pool.query(query, [diemUyTinId]);
    return result.rows;
  }

  async findByNguoiDungId(nguoiDungId: number): Promise<any[]> {
    const query = `
      SELECT
        ls.lich_su_id AS "lichSuId",
        ls.diem_uy_tin_id AS "diemUyTinId",
        ls.diem_thay_doi AS "diemThayDoi",
        ls.ly_do_thay_doi AS "lyDoThayDoi",
        ls.thoi_gian_cap_nhat AS "thoiGianCapNhat"
      FROM lich_su_diem_uy_tin ls
      JOIN diem_uy_tin dut ON ls.diem_uy_tin_id = dut.diem_uy_tin_id
      WHERE dut.nguoi_dung_id = $1
      ORDER BY ls.thoi_gian_cap_nhat DESC
    `;
    const result = await pool.query(query, [nguoiDungId]);
    return result.rows;
  }
}

