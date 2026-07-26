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

  // ==================== UC7.1: QUẢN LÝ TÀI KHOẢN ====================

  async findAll(limit: number = 50, offset: number = 0): Promise<any[]> {
    const query = `
      SELECT
        nd.nguoi_dung_id AS "nguoiDungId",
        nd.ho_ten AS "hoTen",
        nd.email,
        nd.so_dien_thoai AS "soDienThoai",
        nd.trang_thai AS "trangThai",
        nd.ngay_tao AS "ngayTao",
        tk.tai_khoan_id AS "taiKhoanId",
        tk.ten_dang_nhap AS "tenDangNhap",
        tk.da_xac_thuc AS "daXacThuc",
        tk.trang_thai AS "trangThaiTaiKhoan"
      FROM nguoi_dung nd
      LEFT JOIN tai_khoan tk ON nd.nguoi_dung_id = tk.nguoi_dung_id
      ORDER BY nd.nguoi_dung_id DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  async update(id: number, data: Partial<NguoiDung>): Promise<NguoiDung | null> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.hoTen !== undefined) {
      setClauses.push(`ho_ten = $${paramIndex++}`);
      values.push(data.hoTen);
    }
    if (data.email !== undefined) {
      setClauses.push(`email = $${paramIndex++}`);
      values.push(data.email);
    }
    if (data.soDienThoai !== undefined) {
      setClauses.push(`so_dien_thoai = $${paramIndex++}`);
      values.push(data.soDienThoai);
    }
    if (data.trangThai !== undefined) {
      setClauses.push(`trang_thai = $${paramIndex++}`);
      values.push(data.trangThai);
    }

    if (setClauses.length === 0) return this.findById(id);

    values.push(id);
    const query = `
      UPDATE nguoi_dung
      SET ${setClauses.join(", ")}
      WHERE nguoi_dung_id = $${paramIndex}
      RETURNING
        nguoi_dung_id AS "nguoiDungId",
        ho_ten AS "hoTen",
        email,
        so_dien_thoai AS "soDienThoai",
        trang_thai AS "trangThai",
        ngay_tao AS "ngayTao"
    `;
    const result = await pool.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async updateTrangThai(id: number, trangThai: string): Promise<NguoiDung | null> {
    const query = `
      UPDATE nguoi_dung
      SET trang_thai = $1
      WHERE nguoi_dung_id = $2
      RETURNING
        nguoi_dung_id AS "nguoiDungId",
        ho_ten AS "hoTen",
        email,
        so_dien_thoai AS "soDienThoai",
        trang_thai AS "trangThai",
        ngay_tao AS "ngayTao"
    `;
    const result = await pool.query(query, [trangThai, id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async count(): Promise<number> {
    const query = `SELECT COUNT(*)::int AS "total" FROM nguoi_dung`;
    const result = await pool.query(query);
    return result.rows[0].total;
  }
}
