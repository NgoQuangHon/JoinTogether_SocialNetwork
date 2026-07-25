import { pool } from "../../config/db";
import { QuyetDinhXuLy } from "../../models/group6-admin/quyetDinhXuLy.model";

export class QuyetDinhXuLyRepository {
  async create(data: Partial<QuyetDinhXuLy>): Promise<QuyetDinhXuLy> {
    const query = `
      INSERT INTO quyet_dinh_xu_ly (bao_cao_id, nguoi_xu_ly_id, ket_qua)
      VALUES ($1, $2, $3)
      RETURNING
        quyet_dinh_id AS "quyetDinhId",
        bao_cao_id AS "baoCaoId",
        nguoi_xu_ly_id AS "nguoiXuLyId",
        ket_qua AS "ketQua",
        ngay_xu_ly AS "ngayXuLy"
    `;
    const result = await pool.query(query, [
      data.baoCaoId,
      data.nguoiXuLyId,
      data.ketQua ?? null,
    ]);
    return result.rows[0];
  }

  async findByBaoCaoId(baoCaoId: number): Promise<QuyetDinhXuLy | null> {
    const query = `
      SELECT
        quyet_dinh_id AS "quyetDinhId",
        bao_cao_id AS "baoCaoId",
        nguoi_xu_ly_id AS "nguoiXuLyId",
        ket_qua AS "ketQua",
        ngay_xu_ly AS "ngayXuLy"
      FROM quyet_dinh_xu_ly
      WHERE bao_cao_id = $1
    `;
    const result = await pool.query(query, [baoCaoId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }
}

