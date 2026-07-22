import { pool } from "../../config/db";
import { HoSoSoThich } from "../../models/group2-profile/hoSoSoThich.model";

export class HoSoSoThichRepository {
  async addInterest(hoSoId: number, soThichId: number, mucDoQuanTam?: number | null): Promise<HoSoSoThich | null> {
    const query = `
      INSERT INTO ho_so_so_thich (ho_so_id, so_thich_id, muc_do_quan_tam)
      VALUES ($1, $2, $3)
      ON CONFLICT (ho_so_id, so_thich_id) DO NOTHING
      RETURNING
        ho_so_id as "hoSoId",
        so_thich_id as "soThichId",
        muc_do_quan_tam as "mucDoQuanTam"
    `;
    const result = await pool.query(query, [hoSoId, soThichId, mucDoQuanTam ?? null]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async removeInterest(hoSoId: number, soThichId: number): Promise<boolean> {
    const query = `
      DELETE FROM ho_so_so_thich
      WHERE ho_so_id = $1 AND so_thich_id = $2
    `;
    const result = await pool.query(query, [hoSoId, soThichId]);
    return (result.rowCount ?? 0) > 0;
  }

  async findByHoSoIdAndSoThichId(hoSoId: number, soThichId: number): Promise<HoSoSoThich | null> {
    const query = `
      SELECT
        ho_so_id as "hoSoId",
        so_thich_id as "soThichId",
        muc_do_quan_tam as "mucDoQuanTam"
      FROM ho_so_so_thich
      WHERE ho_so_id = $1 AND so_thich_id = $2
    `;
    const result = await pool.query(query, [hoSoId, soThichId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async updateMucDoQuanTam(hoSoId: number, soThichId: number, mucDoQuanTam: number | null): Promise<HoSoSoThich | null> {
    const query = `
      UPDATE ho_so_so_thich
      SET muc_do_quan_tam = $1
      WHERE ho_so_id = $2 AND so_thich_id = $3
      RETURNING
        ho_so_id as "hoSoId",
        so_thich_id as "soThichId",
        muc_do_quan_tam as "mucDoQuanTam"
    `;
    const result = await pool.query(query, [mucDoQuanTam, hoSoId, soThichId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }
}

