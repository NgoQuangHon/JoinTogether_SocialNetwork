import { pool } from "../../config/db";
import { TaiKhoan } from "../../models/group1-user/taiKhoan.model";

const RETURN_COLUMNS = `
  tai_khoan_id as "taiKhoanId",
  nguoi_dung_id as "nguoiDungId",
  ten_dang_nhap as "tenDangNhap",
  mat_khau_ma_hoa as "matKhauMaHoa",
  trang_thai as "trangThai",
  da_xac_thuc as "daXacThuc",
  so_lan_dang_nhap_sai as "soLanDangNhapSai",
  khoa_den_luc as "khoaDenLuc"
`;

export class TaiKhoanRepository {
  async create(taiKhoan: Partial<TaiKhoan>): Promise<TaiKhoan> {
    const query = `
            INSERT INTO tai_khoan (nguoi_dung_id, ten_dang_nhap, mat_khau_ma_hoa, trang_thai, da_xac_thuc)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING ${RETURN_COLUMNS}
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
            SELECT ${RETURN_COLUMNS}
            FROM tai_khoan
            WHERE ten_dang_nhap = $1
        `;
    const result = await pool.query(query, [tenDangNhap]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async findByLoginIdentifier(identifier: string): Promise<TaiKhoan | null> {
    const query = `
      SELECT tk.tai_khoan_id as "taiKhoanId",
             tk.nguoi_dung_id as "nguoiDungId",
             tk.ten_dang_nhap as "tenDangNhap",
             tk.mat_khau_ma_hoa as "matKhauMaHoa",
             tk.trang_thai as "trangThai",
             tk.da_xac_thuc as "daXacThuc",
             tk.so_lan_dang_nhap_sai as "soLanDangNhapSai",
             tk.khoa_den_luc as "khoaDenLuc"
      FROM tai_khoan tk
      LEFT JOIN nguoi_dung nd ON tk.nguoi_dung_id = nd.nguoi_dung_id
      WHERE tk.ten_dang_nhap = $1 OR nd.email = $1 OR nd.so_dien_thoai = $1
      LIMIT 1
    `;
    const result = await pool.query(query, [identifier]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async incrementLoginAttempts(taiKhoanId: number): Promise<void> {
    await pool.query(
      `UPDATE tai_khoan
       SET so_lan_dang_nhap_sai = so_lan_dang_nhap_sai + 1,
           khoa_den_luc = CASE
             WHEN so_lan_dang_nhap_sai + 1 >= 5 THEN NOW() + INTERVAL '15 minutes'
             ELSE khoa_den_luc
           END
       WHERE tai_khoan_id = $1`,
      [taiKhoanId],
    );
  }

  async resetLoginAttempts(taiKhoanId: number): Promise<void> {
    await pool.query(
      `UPDATE tai_khoan SET so_lan_dang_nhap_sai = 0, khoa_den_luc = NULL WHERE tai_khoan_id = $1`,
      [taiKhoanId],
    );
  }

  // ==================== UC7.1: QUẢN LÝ TÀI KHOẢN ====================

  async findById(taiKhoanId: number): Promise<TaiKhoan | null> {
    const query = `
      SELECT ${RETURN_COLUMNS}
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
        tk.da_xac_thuc AS "daXacThuc",
        tk.so_lan_dang_nhap_sai AS "soLanDangNhapSai",
        tk.khoa_den_luc AS "khoaDenLuc"
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
      RETURNING ${RETURN_COLUMNS}
    `;
    const result = await pool.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async updateTrangThai(id: number, trangThai: string): Promise<TaiKhoan | null> {
    const query = `
      UPDATE tai_khoan
      SET trang_thai = $1
      WHERE tai_khoan_id = $2
      RETURNING ${RETURN_COLUMNS}
    `;
    const result = await pool.query(query, [trangThai, id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }
}
