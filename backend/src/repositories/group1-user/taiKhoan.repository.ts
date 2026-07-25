import { pool } from "../../config/db";
import { TaiKhoan } from "../../models/group1-user/taiKhoan.model";

export class TaiKhoanRepository {
  async create(taiKhoan: Partial<TaiKhoan>): Promise<TaiKhoan> {
    const query = `
            INSERT INTO tai_khoan (nguoi_dung_id, ten_dang_nhap, mat_khau_ma_hoa, trang_thai, da_xac_thuc)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING tai_khoan_id as "taiKhoanId", nguoi_dung_id as "nguoiDungId", ten_dang_nhap as "tenDangNhap", mat_khau_ma_hoa as "matKhauMaHoa", trang_thai as "trangThai", da_xac_thuc as "daXacThuc"
        `;
    const values = [
      taiKhoan.nguoiDungId,
      taiKhoan.tenDangNhap,
      taiKhoan.matKhauMaHoa,
      taiKhoan.trangThai || "ACTIVE",
      taiKhoan.daXacThuc || false,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async findByUsername(tenDangNhap: string): Promise<TaiKhoan | null> {
    const query = `
            SELECT tai_khoan_id as "taiKhoanId", nguoi_dung_id as "nguoiDungId", ten_dang_nhap as "tenDangNhap", mat_khau_ma_hoa as "matKhauMaHoa", trang_thai as "trangThai", da_xac_thuc as "daXacThuc"
            FROM tai_khoan
            WHERE ten_dang_nhap = $1
        `;
    const result = await pool.query(query, [tenDangNhap]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // ==================== UC7.1: QUẢN LÝ TÀI KHOẢN ====================

  async findById(taiKhoanId: number): Promise<TaiKhoan | null> {
    const query = `
      SELECT
        tai_khoan_id AS "taiKhoanId",
        nguoi_dung_id AS "nguoiDungId",
        ten_dang_nhap AS "tenDangNhap",
        mat_khau_ma_hoa AS "matKhauMaHoa",
        trang_thai AS "trangThai",
        da_xac_thuc AS "daXacThuc"
      FROM tai_khoan
      WHERE tai_khoan_id = $1
    `;
    const result = await pool.query(query, [taiKhoanId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async findAll(): Promise<any[]> {
    const query = `
      SELECT
        tk.tai_khoan_id AS "taiKhoanId",
        tk.nguoi_dung_id AS "nguoiDungId",
        nd.ho_ten AS "hoTen",
        nd.email,
        tk.ten_dang_nhap AS "tenDangNhap",
        tk.trang_thai AS "trangThai",
        tk.da_xac_thuc AS "daXacThuc"
      FROM tai_khoan tk
      LEFT JOIN nguoi_dung nd ON tk.nguoi_dung_id = nd.nguoi_dung_id
      ORDER BY tk.tai_khoan_id DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  async update(id: number, data: Partial<TaiKhoan>): Promise<TaiKhoan | null> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.trangThai !== undefined) {
      setClauses.push(`trang_thai = $${paramIndex++}`);
      values.push(data.trangThai);
    }
    if (data.daXacThuc !== undefined) {
      setClauses.push(`da_xac_thuc = $${paramIndex++}`);
      values.push(data.daXacThuc);
    }
    if (data.tenDangNhap !== undefined) {
      setClauses.push(`ten_dang_nhap = $${paramIndex++}`);
      values.push(data.tenDangNhap);
    }
    if (data.matKhauMaHoa !== undefined) {
      setClauses.push(`mat_khau_ma_hoa = $${paramIndex++}`);
      values.push(data.matKhauMaHoa);
    }

    if (setClauses.length === 0) return this.findById(id);

    values.push(id);
    const query = `
      UPDATE tai_khoan
      SET ${setClauses.join(", ")}
      WHERE tai_khoan_id = $${paramIndex}
      RETURNING
        tai_khoan_id AS "taiKhoanId",
        nguoi_dung_id AS "nguoiDungId",
        ten_dang_nhap AS "tenDangNhap",
        mat_khau_ma_hoa AS "matKhauMaHoa",
        trang_thai AS "trangThai",
        da_xac_thuc AS "daXacThuc"
    `;
    const result = await pool.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async updateTrangThai(id: number, trangThai: string): Promise<TaiKhoan | null> {
    const query = `
      UPDATE tai_khoan
      SET trang_thai = $1
      WHERE tai_khoan_id = $2
      RETURNING
        tai_khoan_id AS "taiKhoanId",
        nguoi_dung_id AS "nguoiDungId",
        ten_dang_nhap AS "tenDangNhap",
        mat_khau_ma_hoa AS "matKhauMaHoa",
        trang_thai AS "trangThai",
        da_xac_thuc AS "daXacThuc"
    `;
    const result = await pool.query(query, [trangThai, id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }
}
