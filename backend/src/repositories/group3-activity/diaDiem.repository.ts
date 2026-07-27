import { pool } from "../../config/db";
import { DiaDiem } from "../../models/group3-activity/diaDiem.model";

export class DiaDiemRepository {
  async findAll(): Promise<DiaDiem[]> {
    const query = `
      SELECT
        dia_diem_id AS "diaDiemId",
        ten_dia_diem AS "tenDiaDiem",
        dia_chi AS "diaChi",
        hinh_thuc AS "hinhThuc",
        duong_dan_truc_tuyen AS "duongDanTrucTuyen"
      FROM dia_diem
      ORDER BY ten_dia_diem
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  async findById(id: number): Promise<DiaDiem | null> {
    const query = `
      SELECT
        dia_diem_id AS "diaDiemId",
        ten_dia_diem AS "tenDiaDiem",
        dia_chi AS "diaChi",
        hinh_thuc AS "hinhThuc",
        duong_dan_truc_tuyen AS "duongDanTrucTuyen"
      FROM dia_diem
      WHERE dia_diem_id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async create(data: Partial<DiaDiem>): Promise<DiaDiem> {
    const query = `
      INSERT INTO dia_diem (ten_dia_diem, dia_chi, hinh_thuc, duong_dan_truc_tuyen)
      VALUES ($1, $2, $3, $4)
      RETURNING
        dia_diem_id AS "diaDiemId",
        ten_dia_diem AS "tenDiaDiem",
        dia_chi AS "diaChi",
        hinh_thuc AS "hinhThuc",
        duong_dan_truc_tuyen AS "duongDanTrucTuyen"
    `;
    const result = await pool.query(query, [
      data.tenDiaDiem === undefined || data.tenDiaDiem === null ? null : data.tenDiaDiem,
      data.diaChi === undefined || data.diaChi === null ? null : data.diaChi,
      data.hinhThuc === undefined || data.hinhThuc === null ? null : data.hinhThuc,
      data.duongDanTrucTuyen === undefined || data.duongDanTrucTuyen === null ? null : data.duongDanTrucTuyen,
    ]);
    return result.rows[0];
  }

  async update(id: number, data: Partial<DiaDiem>): Promise<DiaDiem | null> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.tenDiaDiem !== undefined) { setClauses.push(`ten_dia_diem = $${paramIndex++}`); values.push(data.tenDiaDiem); }
    if (data.diaChi !== undefined) { setClauses.push(`dia_chi = $${paramIndex++}`); values.push(data.diaChi); }
    if (data.hinhThuc !== undefined) { setClauses.push(`hinh_thuc = $${paramIndex++}`); values.push(data.hinhThuc); }
    if (data.duongDanTrucTuyen !== undefined) { setClauses.push(`duong_dan_truc_tuyen = $${paramIndex++}`); values.push(data.duongDanTrucTuyen); }

    if (setClauses.length === 0) return this.findById(id);

    values.push(id);
    const query = `
      UPDATE dia_diem
      SET ${setClauses.join(', ')}
      WHERE dia_diem_id = $${paramIndex}
      RETURNING
        dia_diem_id AS "diaDiemId",
        ten_dia_diem AS "tenDiaDiem",
        dia_chi AS "diaChi",
        hinh_thuc AS "hinhThuc",
        duong_dan_truc_tuyen AS "duongDanTrucTuyen"
    `;
    const result = await pool.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async delete(id: number): Promise<boolean> {
    const query = `DELETE FROM dia_diem WHERE dia_diem_id = $1`;
    const result = await pool.query(query, [id]);
    return (result.rowCount === undefined || result.rowCount === null ? 0 : result.rowCount) > 0;
  }
}
