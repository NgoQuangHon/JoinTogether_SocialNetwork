import { ThongBaoRepository } from "../../repositories/group4-interaction/thongBao.repository";

export class NotificationService {
  private thongBaoRepo = new ThongBaoRepository();

  async getNotifications(nguoiNhanId: number, limit: number = 20, offset: number = 0): Promise<any[]> {
    return await this.thongBaoRepo.findByNguoiNhanId(nguoiNhanId, limit, offset);
  }

  async deleteNotification(thongBaoId: number, nguoiDungId: number): Promise<void> {
    const notification = await this.thongBaoRepo.findById(thongBaoId);
    if (!notification) {
      throw new Error("Thông báo không tồn tại.");
    }

    // Chỉ người nhận mới được xóa thông báo
    if (notification.nguoiNhanId !== nguoiDungId) {
      throw new Error("Bạn không có quyền xóa thông báo này.");
    }

    await this.thongBaoRepo.delete(thongBaoId);
  }

  async sendNotification(
    nguoiNhanId: number,
    tieuDe: string,
    noiDung: string,
    loaiThongBao?: string,
  ): Promise<any> {
    return await this.thongBaoRepo.create({
      nguoiNhanId,
      tieuDe,
      noiDung,
      loaiThongBao: loaiThongBao ?? 'CHUNG',
    });
  }
}

