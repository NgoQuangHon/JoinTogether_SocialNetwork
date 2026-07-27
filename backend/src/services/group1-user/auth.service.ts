import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NguoiDungRepository } from "../../repositories/group1-user/nguoiDung.repository";
import { TaiKhoanRepository } from "../../repositories/group1-user/taiKhoan.repository";
import { VaiTroRepository } from "../../repositories/group1-user/vaiTro.repository";
import { NguoiDungModel } from "../../models/group1-user/nguoiDung.model";
import { TaiKhoanModel } from "../../models/group1-user/taiKhoan.model";
import { pool } from "../../config/db";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../../config/jwt";
import { AppError, ConflictError, UnauthorizedError } from "../../utils/AppError";

const MIN_PASSWORD_LENGTH = 6;

export class AuthService {
  private nguoiDungRepo = new NguoiDungRepository();
  private taiKhoanRepo = new TaiKhoanRepository();
  private vaiTroRepo = new VaiTroRepository();

  async register(data: any): Promise<any> {
    const { hoTen, email, soDienThoai, tenDangNhap, matKhau } = data;

    // Validate các trường bắt buộc trước khi đụng tới DB/bcrypt,
    // tránh lỗi khó hiểu như bcrypt.hash(undefined) khi client gửi thiếu field.
    if (!hoTen || !email || !tenDangNhap || !matKhau) {
      throw new AppError(
        "Vui lòng cung cấp đầy đủ họ tên, email, tên đăng nhập và mật khẩu.",
        400,
      );
    }
    if (typeof matKhau !== "string" || matKhau.length < MIN_PASSWORD_LENGTH) {
      throw new AppError(
        `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`,
        400,
      );
    }

    // Check for existing users
    const existingEmail = await this.nguoiDungRepo.findByEmail(email);
    if (existingEmail) {
      throw new ConflictError("Email đã được sử dụng.");
    }

    const existingUsername =
      await this.taiKhoanRepo.findByUsername(tenDangNhap);
    if (existingUsername) {
      throw new ConflictError("Tên đăng nhập đã được sử dụng.");
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
      const taiKhoanResult = await client.query(taiKhoanQuery, [
        taiKhoanModel.nguoiDungId,
        taiKhoanModel.tenDangNhap,
        taiKhoanModel.matKhauMaHoa,
        "ACTIVE",
        false,
      ]);

      const taiKhoanId = taiKhoanResult.rows[0].taiKhoanId;

      // Gán vai trò mặc định USER cho tài khoản mới
      await this.vaiTroRepo.assignRoleToTaiKhoan(taiKhoanId, "USER", client);

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
      throw new AppError("Vui lòng cung cấp tên đăng nhập và mật khẩu.", 400);
    }

    const taiKhoan = await this.taiKhoanRepo.findByUsername(tenDangNhap);
    if (!taiKhoan) {
      throw new UnauthorizedError("Tên đăng nhập hoặc mật khẩu không chính xác.");
    }

    const isMatch = await bcrypt.compare(matKhau, taiKhoan.matKhauMaHoa);
    if (!isMatch) {
      throw new UnauthorizedError("Tên đăng nhập hoặc mật khẩu không chính xác.");
    }

    if (taiKhoan.trangThai !== "ACTIVE") {
      throw new UnauthorizedError("Tài khoản đã bị khóa hoặc chưa kích hoạt.");
    }

    // Lấy danh sách vai trò của tài khoản
    const roles = await this.vaiTroRepo.findRolesByTaiKhoanId(taiKhoan.taiKhoanId!);
    const userRoles = roles.length > 0 ? roles : ["USER"];
    const primaryRole = userRoles[0];

    const token = jwt.sign(
      {
        taiKhoanId: taiKhoan.taiKhoanId,
        nguoiDungId: taiKhoan.nguoiDungId,
        roles: userRoles,
        role: primaryRole,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions,
    );

    return {
      message: "Đăng nhập thành công",
      token,
      nguoiDungId: taiKhoan.nguoiDungId,
      roles: userRoles,
      role: primaryRole,
    };
  }
}
