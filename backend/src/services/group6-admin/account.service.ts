import { NguoiDungRepository } from "../../repositories/group1-user/nguoiDung.repository";
import { TaiKhoanRepository } from "../../repositories/group1-user/taiKhoan.repository";
import { NhatKyQuanTriRepository } from "../../repositories/group6-admin/nhatKyQuanTri.repository";
import { ConflictError, NotFoundError } from "../../utils/AppError";

export class AccountService {
  private nguoiDungRepo = new NguoiDungRepository();
  private taiKhoanRepo = new TaiKhoanRepository();
  private nhatKyRepo = new NhatKyQuanTriRepository();

  // ==================== UC7.1: QUẢN LÝ TÀI KHOẢN ====================

  async getUsers(limit: number = 50, offset: number = 0): Promise<any> {
    const users = await this.nguoiDungRepo.findAll(limit, offset);
    const total = await this.nguoiDungRepo.count();
    return { users, total, limit, offset };
  }

  async getUserById(nguoiDungId: number): Promise<any> {
    const user = await this.nguoiDungRepo.findById(nguoiDungId);
    if (!user) {
      throw new NotFoundError("Người dùng không tồn tại.");
    }
    return user;
  }

  async updateUser(nguoiDungId: number, adminId: number, data: { hoTen?: string; email?: string; soDienThoai?: string; trangThai?: string }): Promise<any> {
    const existing = await this.nguoiDungRepo.findById(nguoiDungId);
    if (!existing) {
      throw new NotFoundError("Người dùng không tồn tại.");
    }

    const updated = await this.nguoiDungRepo.update(nguoiDungId, data);

    // Ghi nhật ký quản trị
    await this.nhatKyRepo.create({
      nguoiQuanTriId: adminId,
      hanhDong: `CẬP_NHẬT_NGƯỜI_DÙNG #${nguoiDungId}`,
      doiTuongTacDong: `NguoiDung_${nguoiDungId}`,
    });

    return updated;
  }

  async lockAccount(nguoiDungId: number, adminId: number): Promise<any> {
    const existing = await this.nguoiDungRepo.findById(nguoiDungId);
    if (!existing) {
      throw new NotFoundError("Người dùng không tồn tại.");
    }

    if (existing.trangThai === 'LOCKED') {
      throw new ConflictError("Tài khoản này đã bị khóa trước đó.");
    }

    const updated = await this.nguoiDungRepo.updateTrangThai(nguoiDungId, 'LOCKED');

    // Ghi nhật ký quản trị
    await this.nhatKyRepo.create({
      nguoiQuanTriId: adminId,
      hanhDong: `KHÓA_TÀI_KHOẢN #${nguoiDungId}`,
      doiTuongTacDong: `NguoiDung_${nguoiDungId}`,
    });

    return updated;
  }

  async unlockAccount(nguoiDungId: number, adminId: number): Promise<any> {
    const existing = await this.nguoiDungRepo.findById(nguoiDungId);
    if (!existing) {
      throw new NotFoundError("Người dùng không tồn tại.");
    }

    if (existing.trangThai !== 'LOCKED') {
      throw new ConflictError("Tài khoản này không bị khóa.");
    }

    const updated = await this.nguoiDungRepo.updateTrangThai(nguoiDungId, 'ACTIVE');

    // Ghi nhật ký quản trị
    await this.nhatKyRepo.create({
      nguoiQuanTriId: adminId,
      hanhDong: `MỞ_KHÓA_TÀI_KHOẢN #${nguoiDungId}`,
      doiTuongTacDong: `NguoiDung_${nguoiDungId}`,
    });

    return updated;
  }
}

