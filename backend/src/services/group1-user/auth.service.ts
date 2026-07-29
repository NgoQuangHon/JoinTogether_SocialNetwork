import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NguoiDungRepository } from "../../repositories/group1-user/nguoiDung.repository";
import { TaiKhoanRepository } from "../../repositories/group1-user/taiKhoan.repository";
import { VaiTroRepository } from "../../repositories/group1-user/vaiTro.repository";
import { NguoiDungModel } from "../../models/group1-user/nguoiDung.model";
import { TaiKhoanModel } from "../../models/group1-user/taiKhoan.model";
import { pool } from "../../config/db";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../../config/jwt";
import { sendVerificationEmail } from "../../config/email";
import { AppError, ConflictError, UnauthorizedError } from "../../utils/AppError";

const MIN_PASSWORD_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;

export class AuthService {
  async resendVerificationCode(taiKhoanId: number): Promise<any> {
    const checkQuery = `
      SELECT tai_khoan_id as "taiKhoanId", trang_thai, da_xac_thuc as "daXacThuc"
      FROM tai_khoan WHERE tai_khoan_id = $1
    `;
    const checkResult = await pool.query(checkQuery, [taiKhoanId]);
    const tk = checkResult.rows[0];
    if (!tk) {
      throw new AppError("Tài khoản không tồn tại.", 404);
    }
    if (tk.daXacThuc) {
      throw new AppError("Tài khoản đã được xác thực.", 400);
    }

    const ndQuery = `
      SELECT nd.email FROM nguoi_dung nd
      JOIN tai_khoan tk ON nd.nguoi_dung_id = tk.nguoi_dung_id
      WHERE tk.tai_khoan_id = $1
    `;
    const ndResult = await pool.query(ndQuery, [taiKhoanId]);
    const email = ndResult.rows[0]?.email;
    if (!email) {
      throw new AppError("Không tìm thấy email của tài khoản.", 400);
    }

    const maXacThuc = crypto.randomInt(100000, 999999).toString();

    await pool.query(
      `INSERT INTO thong_tin_xac_thuc (tai_khoan_id, loai_xac_thuc, ma_xac_thuc, thoi_gian_het_han, da_su_dung)
       VALUES ($1, 'EMAIL_VERIFICATION', $2, NOW() + INTERVAL '${OTP_EXPIRY_MINUTES} minutes', false)`,
      [taiKhoanId, maXacThuc],
    );

    sendVerificationEmail(email, maXacThuc).catch((err) =>
      console.error("Failed to resend verification email:", err),
    );

    return { message: "Mã xác thực mới đã được gửi đến email của bạn." };
  }
  private nguoiDungRepo = new NguoiDungRepository();
  private taiKhoanRepo = new TaiKhoanRepository();
  private vaiTroRepo = new VaiTroRepository();

  async register(data: any): Promise<any> {
    const { hoTen, email, soDienThoai, tenDangNhap, matKhau } = data;

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

    const existingEmail = await this.nguoiDungRepo.findByEmail(email);
    if (existingEmail) {
      throw new ConflictError(
        "Email đã được sử dụng. Vui lòng đăng nhập hoặc khôi phục mật khẩu.",
      );
    }

    if (soDienThoai) {
      const existingPhone = await this.nguoiDungRepo.findByPhone(soDienThoai);
      if (existingPhone) {
        throw new ConflictError(
          "Số điện thoại đã được sử dụng. Vui lòng đăng nhập hoặc khôi phục mật khẩu.",
        );
      }
    }

    const existingUsername = await this.taiKhoanRepo.findByUsername(tenDangNhap);
    if (existingUsername) {
      throw new ConflictError("Tên đăng nhập đã được sử dụng. Vui lòng chọn tên khác.");
    }

    const maXacThuc = crypto.randomInt(100000, 999999).toString();

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
        "PENDING",
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
        "PENDING",
        false,
      ]);
      const taiKhoanId = taiKhoanResult.rows[0].taiKhoanId;

      await this.vaiTroRepo.assignRoleToTaiKhoan(taiKhoanId, "USER", client);

      const xacThucQuery = `
        INSERT INTO thong_tin_xac_thuc (tai_khoan_id, loai_xac_thuc, ma_xac_thuc, thoi_gian_het_han, da_su_dung)
        VALUES ($1, $2, $3, NOW() + INTERVAL '${OTP_EXPIRY_MINUTES} minutes', false)
      `;
      await client.query(xacThucQuery, [taiKhoanId, "EMAIL_VERIFICATION", maXacThuc]);

      await client.query("COMMIT");

      // Send email AFTER commit — no rollback if email fails (user can resend)
      sendVerificationEmail(email, maXacThuc).catch((err) =>
        console.error("Failed to send verification email:", err),
      );

      return { message: "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.", data: { taiKhoanId } };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async verifyEmail(taiKhoanId: number, maXacThuc: string): Promise<any> {
    const xacThucQuery = `
      SELECT xac_thuc_id as "xacThucId", ma_xac_thuc as "maXacThuc", thoi_gian_het_han as "thoiGianHetHan", da_su_dung as "daSuDung"
      FROM thong_tin_xac_thuc
      WHERE tai_khoan_id = $1 AND loai_xac_thuc = 'EMAIL_VERIFICATION'
      ORDER BY thoi_gian_het_han DESC
      LIMIT 1
    `;
    const result = await pool.query(xacThucQuery, [taiKhoanId]);
    const record = result.rows[0];

    if (!record) {
      throw new AppError("Không tìm thấy mã xác thực cho tài khoản này.", 400);
    }

    if (record.daSuDung) {
      throw new AppError("Mã xác thực đã được sử dụng.", 400);
    }

    if (new Date(record.thoiGianHetHan) < new Date()) {
      throw new AppError("Mã xác thực đã hết hạn. Vui lòng yêu cầu gửi lại mã.", 400);
    }

    if (record.maXacThuc !== maXacThuc) {
      throw new AppError("Mã xác thực không chính xác.", 400);
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      await client.query(
        `UPDATE thong_tin_xac_thuc SET da_su_dung = true WHERE xac_thuc_id = $1`,
        [record.xacThucId],
      );

      await client.query(
        `UPDATE tai_khoan SET da_xac_thuc = true, trang_thai = 'ACTIVE' WHERE tai_khoan_id = $1`,
        [taiKhoanId],
      );

      await client.query(
        `UPDATE nguoi_dung SET trang_thai = 'ACTIVE' WHERE nguoi_dung_id = (SELECT nguoi_dung_id FROM tai_khoan WHERE tai_khoan_id = $1)`,
        [taiKhoanId],
      );

      await client.query("COMMIT");

      const taiKhoanQuery = `
        SELECT tai_khoan_id as "taiKhoanId", nguoi_dung_id as "nguoiDungId"
        FROM tai_khoan WHERE tai_khoan_id = $1
      `;
      const tkResult = await pool.query(taiKhoanQuery, [taiKhoanId]);
      const tk = tkResult.rows[0];

      const roles = await this.vaiTroRepo.findRolesByTaiKhoanId(taiKhoanId);
      const userRoles = roles.length > 0 ? roles : ["USER"];
      const primaryRole = userRoles[0];

      const token = jwt.sign(
        {
          taiKhoanId: tk.taiKhoanId,
          nguoiDungId: tk.nguoiDungId,
          roles: userRoles,
          role: primaryRole,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions,
      );

      return {
        message: "Tài khoản đã được kích hoạt thành công.",
        token,
        nguoiDungId: tk.nguoiDungId,
        roles: userRoles,
        role: primaryRole,
      };
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
      throw new AppError("Vui lòng cung cấp tên đăng nhập / email / số điện thoại và mật khẩu.", 400);
    }

    const taiKhoan = await this.taiKhoanRepo.findByLoginIdentifier(tenDangNhap);
    if (!taiKhoan) {
      throw new UnauthorizedError("Tên đăng nhập / email / số điện thoại hoặc mật khẩu không chính xác.");
    }

    // Kiểm tra tài khoản có bị khóa tạm thời không
    if (taiKhoan.khoaDenLuc && new Date(taiKhoan.khoaDenLuc) > new Date()) {
      const conLai = Math.ceil((new Date(taiKhoan.khoaDenLuc).getTime() - Date.now()) / 60000);
      throw new AppError(`Tài khoản tạm thời bị khóa do đăng nhập sai nhiều lần. Vui lòng thử lại sau ${conLai} phút.`, 423);
    }

    const isMatch = await bcrypt.compare(matKhau, taiKhoan.matKhauMaHoa);
    if (!isMatch) {
      await this.taiKhoanRepo.incrementLoginAttempts(taiKhoan.taiKhoanId!);
      throw new UnauthorizedError("Tên đăng nhập / email / số điện thoại hoặc mật khẩu không chính xác.");
    }

    // Reset số lần đăng nhập sai khi thành công
    await this.taiKhoanRepo.resetLoginAttempts(taiKhoan.taiKhoanId!);

    // Kiểm tra trạng thái tài khoản — ưu tiên kiểm tra xác thực trước
    if (!taiKhoan.daXacThuc && taiKhoan.trangThai !== "ACTIVE") {
      throw new UnauthorizedError(
        "Tài khoản chưa được xác thực. Vui lòng kiểm tra email để hoàn tất xác thực.",
        { taiKhoanId: taiKhoan.taiKhoanId }
      );
    }

    if (taiKhoan.trangThai !== "ACTIVE") {
      throw new UnauthorizedError(
        "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.",
      );
    }

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

  async requestPasswordReset(email: string): Promise<any> {
    if (!email) {
      throw new AppError("Vui lòng cung cấp email.", 400);
    }
    const checkQuery = `SELECT nguoi_dung_id FROM nguoi_dung WHERE email = $1`;
    const checkRes = await pool.query(checkQuery, [email]);
    const user = checkRes.rows[0];
    if (!user) {
      // Vì bảo mật, không báo lộ email không tồn tại
      return { message: "Nếu email tồn tại trong hệ thống, mã OTP khôi phục mật khẩu đã được gửi." };
    }
    const tkRes = await pool.query(`SELECT tai_khoan_id FROM tai_khoan WHERE nguoi_dung_id = $1`, [user.nguoi_dung_id]);
    const tk = tkRes.rows[0];
    if (!tk) {
      return { message: "Nếu email tồn tại trong hệ thống, mã OTP khôi phục mật khẩu đã được gửi." };
    }

    const maXacThuc = crypto.randomInt(100000, 999999).toString();
    await pool.query(
      `INSERT INTO thong_tin_xac_thuc (tai_khoan_id, loai_xac_thuc, ma_xac_thuc, thoi_gian_het_han, da_su_dung)
       VALUES ($1, 'PASSWORD_RESET', $2, NOW() + INTERVAL '${OTP_EXPIRY_MINUTES} minutes', false)`,
      [tk.tai_khoan_id, maXacThuc]
    );

    sendVerificationEmail(email, maXacThuc).catch((err) =>
      console.error("Failed to send reset password email:", err)
    );

    return { message: "Mã xác thực khôi phục mật khẩu đã được gửi đến email của bạn.", taiKhoanId: tk.tai_khoan_id };
  }

  async resetPassword(data: { email: string; maXacThuc: string; matKhauMoi: string }): Promise<any> {
    const { email, maXacThuc, matKhauMoi } = data;
    if (!email || !maXacThuc || !matKhauMoi) {
      throw new AppError("Vui lòng cung cấp đầy đủ email, mã xác thực và mật khẩu mới.", 400);
    }
    if (matKhauMoi.length < MIN_PASSWORD_LENGTH) {
      throw new AppError(`Mật khẩu tối thiểu ${MIN_PASSWORD_LENGTH} ký tự.`, 400);
    }

    const checkQuery = `SELECT nd.nguoi_dung_id, tk.tai_khoan_id 
                        FROM nguoi_dung nd 
                        JOIN tai_khoan tk ON nd.nguoi_dung_id = tk.nguoi_dung_id 
                        WHERE nd.email = $1`;
    const checkRes = await pool.query(checkQuery, [email]);
    const row = checkRes.rows[0];
    if (!row) {
      throw new AppError("Thông tin xác thực không chính xác.", 400);
    }

    const otpQuery = `
      SELECT thong_tin_xac_thuc_id 
      FROM thong_tin_xac_thuc 
      WHERE tai_khoan_id = $1 AND loai_xac_thuc = 'PASSWORD_RESET' AND ma_xac_thuc = $2 AND da_su_dung = false AND thoi_gian_het_han > NOW()
      ORDER BY tao_luc DESC LIMIT 1
    `;
    const otpRes = await pool.query(otpQuery, [row.tai_khoan_id, maXacThuc]);
    const otpRecord = otpRes.rows[0];
    if (!otpRecord) {
      throw new AppError("Mã xác thực không hợp lệ hoặc đã hết hạn.", 400);
    }

    const matKhauMaHoa = await bcrypt.hash(matKhauMoi, 10);
    await pool.query(`UPDATE tai_khoan SET mat_khau_ma_hoa = $1 WHERE tai_khoan_id = $2`, [matKhauMaHoa, row.tai_khoan_id]);
    await pool.query(`UPDATE thong_tin_xac_thuc SET da_su_dung = true WHERE thong_tin_xac_thuc_id = $1`, [otpRecord.thong_tin_xac_thuc_id]);

    return { message: "Khôi phục mật khẩu thành công. Vui lòng đăng nhập bằng mật khẩu mới." };
  }
}
