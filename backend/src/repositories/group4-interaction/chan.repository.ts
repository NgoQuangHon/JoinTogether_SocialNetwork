import { pool } from "../../config/db";

export interface Chan {
  nguoiChanId: number;
  nguoiBiChanId: number;
  thoiGian?: Date | string;
}

export class ChanRepository {
  async create(nguoiChanId: number, nguoiBiChanId: number): Promise<Chan | null> {
    const result = await pool.query(
      `INSERT INTO chan (nguoi_chan_id, nguoi_bi_chan_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING
       RETURNING nguoi_chan_id AS "nguoiChanId",
                 nguoi_bi_chan_id AS "nguoiBiChanId",
                 thoi_gian AS "thoiGian"`,
      [nguoiChanId, nguoiBiChanId],
    );
    return result.rows[0] || null;
  }

  async delete(nguoiChanId: number, nguoiBiChanId: number): Promise<boolean> {
    const result = await pool.query(
      `DELETE FROM chan WHERE nguoi_chan_id = $1 AND nguoi_bi_chan_id = $2`,
      [nguoiChanId, nguoiBiChanId],
    );
    return (result.rowCount ?? 0) > 0;
  }

  async isBlocked(nguoiChanId: number, nguoiBiChanId: number): Promise<boolean> {
    const result = await pool.query(
      `SELECT 1 FROM chan WHERE nguoi_chan_id = $1 AND nguoi_bi_chan_id = $2`,
      [nguoiChanId, nguoiBiChanId],
    );
    return result.rows.length > 0;
  }
}
