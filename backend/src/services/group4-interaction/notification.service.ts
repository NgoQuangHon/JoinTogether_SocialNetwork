import { ThongBaoRepository } from "../../repositories/group4-interaction/thongBao.repository";
import { ForbiddenError, NotFoundError } from "../../utils/AppError";

export class NotificationService {
  private thongBaoRepo = new ThongBaoRepository();

  async getNotifications(nguoiNhanId: number, limit: number = 20, offset: number = 0): Promise<any[]> {
    return await this.thongBaoRepo.findByNguoiNhanId(nguoiNhanId, limit, offset);
  }

  async deleteNotification(thongBaoId: number, nguoiDungId: number): Promise<void> {
    const notification = await this.thongBaoRepo.findById(thongBaoId);
    if (!notification) {
      throw new NotFoundError("Thông báo không tồn tại.");
    }

    // Chỉ người nhận mới được xóa thông báo
    if (notification.nguoiNhanId !== nguoiDungId) {
      throw new ForbiddenError("Bạn không có quyền xóa thông báo này.");
    }

    await this.thongBaoRepo.delete(thongBaoId);
  }

  async sendNotification(
    nguoiNhanId: number,
    tieuDe: string,
    noiDung: string,
    loaiThongBao?: string,
    duongDan?: string,
  ): Promise<any> {
    try {
      return await this.thongBaoRepo.create({
        nguoiNhanId,
        tieuDe,
        noiDung,
        loaiThongBao: loaiThongBao === undefined || loaiThongBao === null ? 'CHUNG' : loaiThongBao,
        duongDan: duongDan === undefined || duongDan === null ? null : duongDan,
      });
    } catch (err) {
      console.warn("Could not persist notification:", err);
      return null;
    }
  }
}

