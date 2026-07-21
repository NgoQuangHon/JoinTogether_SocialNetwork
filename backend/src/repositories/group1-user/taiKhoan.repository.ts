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
}
