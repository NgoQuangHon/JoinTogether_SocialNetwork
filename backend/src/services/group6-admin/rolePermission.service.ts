import { VaiTroRepository } from "../../repositories/group1-user/vaiTro.repository";
import { QuyenHanRepository } from "../../repositories/group1-user/quyenHan.repository";
import { NhatKyQuanTriRepository } from "../../repositories/group6-admin/nhatKyQuanTri.repository";

export class RolePermissionService {
  private vaiTroRepo = new VaiTroRepository();
  private quyenHanRepo = new QuyenHanRepository();
  private nhatKyRepo = new NhatKyQuanTriRepository();

  // ==================== UC7.2: QUẢN LÝ VAI TRÒ ====================

  async getRoles(): Promise<any[]> {
    return await this.vaiTroRepo.findAll();
  }

  async getRoleById(id: number): Promise<any> {
    const role = await this.vaiTroRepo.findById(id);
    if (!role) {
      throw new Error("Vai trò không tồn tại.");
    }
    return role;
  }

  async createRole(adminId: number, data: { tenVaiTro: string; moTa?: string }): Promise<any> {
    const role = await this.vaiTroRepo.create(data);

    // Ghi nhật ký quản trị
    await this.nhatKyRepo.create({
      nguoiQuanTriId: adminId,
      hanhDong: `TẠO_VAI_TRÒ: ${data.tenVaiTro}`,
      doiTuongTacDong: `VaiTro_${role.vaiTroId}`,
    });

    return role;
  }

  async updateRole(id: number, adminId: number, data: { tenVaiTro?: string; moTa?: string }): Promise<any> {
    const existing = await this.vaiTroRepo.findById(id);
    if (!existing) {
      throw new Error("Vai trò không tồn tại.");
    }

    const updated = await this.vaiTroRepo.update(id, data);

    // Ghi nhật ký quản trị
    await this.nhatKyRepo.create({
      nguoiQuanTriId: adminId,
      hanhDong: `CẬP_NHẬT_VAI_TRÒ #${id}`,
      doiTuongTacDong: `VaiTro_${id}`,
    });

    return updated;
  }

  async deleteRole(id: number, adminId: number): Promise<void> {
    const existing = await this.vaiTroRepo.findById(id);
    if (!existing) {
      throw new Error("Vai trò không tồn tại.");
    }

    await this.vaiTroRepo.delete(id);

    // Ghi nhật ký quản trị
    await this.nhatKyRepo.create({
      nguoiQuanTriId: adminId,
      hanhDong: `XÓA_VAI_TRÒ #${id}: ${existing.tenVaiTro}`,
      doiTuongTacDong: `VaiTro_${id}`,
    });
  }

  // ==================== UC7.2: QUẢN LÝ QUYỀN HẠN ====================

  async getPermissions(): Promise<any[]> {
    return await this.quyenHanRepo.findAll();
  }

  async getPermissionById(id: number): Promise<any> {
    const permission = await this.quyenHanRepo.findById(id);
    if (!permission) {
      throw new Error("Quyền hạn không tồn tại.");
    }
    return permission;
  }

  async createPermission(adminId: number, data: { tenQuyen: string; moTa?: string }): Promise<any> {
    const permission = await this.quyenHanRepo.create(data);

    // Ghi nhật ký quản trị
    await this.nhatKyRepo.create({
      nguoiQuanTriId: adminId,
      hanhDong: `TẠO_QUYỀN_HẠN: ${data.tenQuyen}`,
      doiTuongTacDong: `QuyenHan_${permission.quyenHanId}`,
    });

    return permission;
  }

  async updatePermission(id: number, adminId: number, data: { tenQuyen?: string; moTa?: string }): Promise<any> {
    const existing = await this.quyenHanRepo.findById(id);
    if (!existing) {
      throw new Error("Quyền hạn không tồn tại.");
    }

    const updated = await this.quyenHanRepo.update(id, data);

    // Ghi nhật ký quản trị
    await this.nhatKyRepo.create({
      nguoiQuanTriId: adminId,
      hanhDong: `CẬP_NHẬT_QUYỀN_HẠN #${id}`,
      doiTuongTacDong: `QuyenHan_${id}`,
    });

    return updated;
  }

  async deletePermission(id: number, adminId: number): Promise<void> {
    const existing = await this.quyenHanRepo.findById(id);
    if (!existing) {
      throw new Error("Quyền hạn không tồn tại.");
    }

    await this.quyenHanRepo.delete(id);

    // Ghi nhật ký quản trị
    await this.nhatKyRepo.create({
      nguoiQuanTriId: adminId,
      hanhDong: `XÓA_QUYỀN_HẠN #${id}: ${existing.tenQuyen}`,
      doiTuongTacDong: `QuyenHan_${id}`,
    });
  }
}

