import { pool } from "../../config/db";
import { NguoiDung } from "../../models/group1-user/nguoiDung.model";

export class NguoiDungRepository {
  async create(nguoiDung: Partial<NguoiDung>): Promise<NguoiDung> {
    const query = `
            INSERT INTO nguoi_dung (ho_ten, email, so_dien_thoai, trang_thai)
            VALUES ($1, $2, $3, $4)
            RETURNING nguoi_dung_id as "nguoiDungId", ho_ten as "hoTen", email, so_dien_thoai as "soDienThoai", trang_thai as "trangThai", ngay_tao as "ngayTao"
        `;
    const values = [
      nguoiDung.hoTen,
      nguoiDung.email,
      nguoiDung.soDienThoai,
      nguoiDung.trangThai || "ACTIVE",
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async findById(nguoiDungId: number): Promise<NguoiDung | null> {
    const query = `
            SELECT nguoi_dung_id as "nguoiDungId", ho_ten as "hoTen", email, so_dien_thoai as "soDienThoai", trang_thai as "trangThai", ngay_tao as "ngayTao"
            FROM nguoi_dung
            WHERE nguoi_dung_id = $1
        `;
    const result = await pool.query(query, [nguoiDungId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async findByEmail(email: string): Promise<NguoiDung | null> {
    const query = `
            SELECT nguoi_dung_id as "nguoiDungId", ho_ten as "hoTen", email, so_dien_thoai as "soDienThoai", trang_thai as "trangThai", ngay_tao as "ngayTao"
            FROM nguoi_dung
            WHERE email = $1
        `;
    const result = await pool.query(query, [email]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }
}
