import { pool } from "../../config/db";
import { SoThich } from "../../models/group2-profile/soThich.model";
import { DanhMucSoThich } from "../../models/group2-profile/danhMucSoThich.model";

export class SoThichRepository {
  async findAllCategories(): Promise<DanhMucSoThich[]> {
    const query = `
      SELECT
        danh_muc_so_thich_id as "danhMucSoThichId",
        ten_danh_muc as "tenDanhMuc",
        mo_ta as "moTa"
      FROM danh_muc_so_thich
      ORDER BY ten_danh_muc
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  async findAllInterestsByCategory(): Promise<any[]> {
    const query = `
      SELECT
        s.so_thich_id as "soThichId",
        s.danh_muc_so_thich_id as "danhMucSoThichId",
        s.ten_so_thich as "tenSoThich",
        s.mo_ta as "moTa",
        dm.ten_danh_muc as "tenDanhMuc"
      FROM so_thich s
      LEFT JOIN danh_muc_so_thich dm ON s.danh_muc_so_thich_id = dm.danh_muc_so_thich_id
      ORDER BY dm.ten_danh_muc, s.ten_so_thich
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  async findById(soThichId: number): Promise<SoThich | null> {
    const query = `
      SELECT
        so_thich_id as "soThichId",
        danh_muc_so_thich_id as "danhMucSoThichId",
        ten_so_thich as "tenSoThich",
        mo_ta as "moTa"
      FROM so_thich
      WHERE so_thich_id = $1
    `;
    const result = await pool.query(query, [soThichId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async findInterestsByProfileId(hoSoId: number): Promise<any[]> {
    const query = `
      SELECT
        s.so_thich_id as "soThichId",
        s.ten_so_thich as "tenSoThich",
        s.mo_ta as "moTa",
        dm.ten_danh_muc as "tenDanhMuc",
        hss.muc_do_quan_tam as "mucDoQuanTam"
      FROM ho_so_so_thich hss
      JOIN so_thich s ON hss.so_thich_id = s.so_thich_id
      LEFT JOIN danh_muc_so_thich dm ON s.danh_muc_so_thich_id = dm.danh_muc_so_thich_id
      WHERE hss.ho_so_id = $1
      ORDER BY dm.ten_danh_muc, s.ten_so_thich
    `;
    const result = await pool.query(query, [hoSoId]);
    return result.rows;
  }
}
