import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NguoiDungRepository } from "../../repositories/group1-user/nguoiDung.repository";
import { TaiKhoanRepository } from "../../repositories/group1-user/taiKhoan.repository";
import { NguoiDungModel } from "../../models/group1-user/nguoiDung.model";
import { TaiKhoanModel } from "../../models/group1-user/taiKhoan.model";
import { pool } from "../../config/db";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

export class AuthService {
  private nguoiDungRepo = new NguoiDungRepository();
  private taiKhoanRepo = new TaiKhoanRepository();

  async register(data: any): Promise<any> {
    const { hoTen, email, soDienThoai, tenDangNhap, matKhau } = data;

    // Check for existing users
    const existingEmail = await this.nguoiDungRepo.findByEmail(email);
    if (existingEmail) {
      throw new Error("Email đã được sử dụng.");
    }

    const existingUsername =
      await this.taiKhoanRepo.findByUsername(tenDangNhap);
    if (existingUsername) {
      throw new Error("Tên đăng nhập đã được sử dụng.");
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const nguoiDungModel = new NguoiDungModel({ hoTen, email, soDienThoai });

      const nguoiDungQuery = `
                INSERT INTO nguoi_dung (ho_ten, email, so_dien_thoai, trang_thai)
                VALUES ($1, $2, $3, $4)
                RETURNING nguoi_dung_id as "nguoiDungId"
            `;
      const nguoiDungResult = await client.query(nguoiDungQuery, [
        nguoiDungModel.hoTen,
        nguoiDungModel.email,
        nguoiDungModel.soDienThoai,
        "ACTIVE",
      ]);
      const nguoiDungId = nguoiDungResult.rows[0].nguoiDungId;

      const saltRounds = 10;
      const matKhauMaHoa = await bcrypt.hash(matKhau, saltRounds);

      const taiKhoanModel = new TaiKhoanModel({
        nguoiDungId,
        tenDangNhap,
        matKhauMaHoa,
      });

      const taiKhoanQuery = `
                INSERT INTO tai_khoan (nguoi_dung_id, ten_dang_nhap, mat_khau_ma_hoa, trang_thai, da_xac_thuc)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING tai_khoan_id as "taiKhoanId"
            `;
      await client.query(taiKhoanQuery, [
        taiKhoanModel.nguoiDungId,
        taiKhoanModel.tenDangNhap,
        taiKhoanModel.matKhauMaHoa,
        "ACTIVE",
        false,
      ]);

      await client.query("COMMIT");

      return { message: "Đăng ký thành công." };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async login(data: any): Promise<any> {
    const { tenDangNhap, matKhau } = data;

    if (!tenDangNhap || !matKhau) {
      throw new Error("Vui lòng cung cấp tên đăng nhập và mật khẩu.");
    }

    const taiKhoan = await this.taiKhoanRepo.findByUsername(tenDangNhap);
    if (!taiKhoan) {
      throw new Error("Tên đăng nhập hoặc mật khẩu không chính xác.");
    }

    const isMatch = await bcrypt.compare(matKhau, taiKhoan.matKhauMaHoa);
    if (!isMatch) {
      throw new Error("Tên đăng nhập hoặc mật khẩu không chính xác.");
    }

    if (taiKhoan.trangThai !== "ACTIVE") {
      throw new Error("Tài khoản đã bị khóa hoặc chưa kích hoạt.");
    }

    const token = jwt.sign(
      { taiKhoanId: taiKhoan.taiKhoanId, nguoiDungId: taiKhoan.nguoiDungId },
      JWT_SECRET,
      { expiresIn: "1d" },
    );

    return {
      message: "Đăng nhập thành công",
      token,
      nguoiDungId: taiKhoan.nguoiDungId,
    };
  }
}
