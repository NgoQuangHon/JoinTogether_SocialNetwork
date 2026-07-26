import { pool } from "../../config/db";
import { TieuChiDanhGia } from "../../models/group5-review/tieuChiDanhGia.model";

export class TieuChiDanhGiaRepository {
  async create(data: Partial<TieuChiDanhGia>): Promise<TieuChiDanhGia> {
    const query = `
      INSERT INTO tieu_chi_danh_gia (ten_tieu_chi, trong_so, diem_toi_da)
      VALUES ($1, $2, $3)
      RETURNING
        tieu_chi_danh_gia_id AS "tieuChiDanhGiaId",
        ten_tieu_chi AS "tenTieuChi",
        trong_so AS "trongSo",
        diem_toi_da AS "diemToiDa"
    `;
    const result = await pool.query(query, [
      data.tenTieuChi,
      data.trongSo ?? null,
      data.diemToiDa ?? null,
    ]);
    return result.rows[0];
  }

  async findAll(): Promise<TieuChiDanhGia[]> {
    const query = `
      SELECT
        tieu_chi_danh_gia_id AS "tieuChiDanhGiaId",
        ten_tieu_chi AS "tenTieuChi",
        trong_so AS "trongSo",
        diem_toi_da AS "diemToiDa"
      FROM tieu_chi_danh_gia
      ORDER BY ten_tieu_chi ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  async findById(id: number): Promise<TieuChiDanhGia | null> {
    const query = `
      SELECT
        tieu_chi_danh_gia_id AS "tieuChiDanhGiaId",
        ten_tieu_chi AS "tenTieuChi",
        trong_so AS "trongSo",
        diem_toi_da AS "diemToiDa"
      FROM tieu_chi_danh_gia
      WHERE tieu_chi_danh_gia_id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async update(id: number, data: Partial<TieuChiDanhGia>): Promise<TieuChiDanhGia | null> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.tenTieuChi !== undefined) {
      setClauses.push(`ten_tieu_chi = $${paramIndex++}`);
      values.push(data.tenTieuChi);
    }
    if (data.trongSo !== undefined) {
      setClauses.push(`trong_so = $${paramIndex++}`);
      values.push(data.trongSo);
    }
    if (data.diemToiDa !== undefined) {
      setClauses.push(`diem_toi_da = $${paramIndex++}`);
      values.push(data.diemToiDa);
    }

    if (setClauses.length === 0) return this.findById(id);

    values.push(id);
    const query = `
      UPDATE tieu_chi_danh_gia
      SET ${setClauses.join(", ")}
      WHERE tieu_chi_danh_gia_id = $${paramIndex}
      RETURNING
        tieu_chi_danh_gia_id AS "tieuChiDanhGiaId",
        ten_tieu_chi AS "tenTieuChi",
        trong_so AS "trongSo",
        diem_toi_da AS "diemToiDa"
    `;
    const result = await pool.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async delete(id: number): Promise<boolean> {
    const query = `DELETE FROM tieu_chi_danh_gia WHERE tieu_chi_danh_gia_id = $1`;
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}

