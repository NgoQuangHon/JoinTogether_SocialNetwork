import { PhongTroChuyenRepository } from "../../repositories/group4-interaction/phongTroChuyen.repository";
import { TinNhanRepository } from "../../repositories/group4-interaction/tinNhan.repository";
import { HoatDongRepository } from "../../repositories/group3-activity/hoatDong.repository";
import { ThanhVienHoatDongRepository } from "../../repositories/group3-activity/thanhVienHoatDong.repository";
import { NotificationService } from "./notification.service";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../utils/AppError";
import { pool } from "../../config/db";

const BANNED_KEYWORDS = [
  "cờ bạc", "lừa đảo", "hack", "crack", "spam", "chửi", "xúc phạm", "tục tĩu", "dâm ô"
];

export class ChatService {
  private phongRepo = new PhongTroChuyenRepository();
  private tinNhanRepo = new TinNhanRepository();
  private hoatDongRepo = new HoatDongRepository();
  private thanhVienRepo = new ThanhVienHoatDongRepository();
  private notificationService = new NotificationService();

  // ==================== PHÒNG TRÒ CHUYỆN ====================

  async getOrCreateRoom(hoatDongId: number): Promise<any> {
    const activity = await this.hoatDongRepo.findById(hoatDongId);
    if (!activity) {
      throw new NotFoundError("Hoạt động không tồn tại.");
    }

    const existingRoom = await this.phongRepo.findByHoatDongId(hoatDongId);
    if (existingRoom) {
      return { ...existingRoom, activityStatus: activity.trangThai };
    }

    const newRoom = await this.phongRepo.create({
      hoatDongId,
      tenPhong: activity.tenHoatDong,
      trangThai: activity.trangThai === 'da_huy' || activity.trangThai === 'da_ket_thuc' ? 'CLOSED' : 'ACTIVE',
    });

    return { ...newRoom, activityStatus: activity.trangThai };
  }

  async getRoomById(phongId: number): Promise<any> {
    const room = await this.phongRepo.findById(phongId);
    if (!room) {
      throw new NotFoundError("Phòng trò chuyện không tồn tại.");
    }
    return room;
  }

  async getUserRooms(nguoiDungId: number): Promise<any[]> {
    return await this.phongRepo.findRoomsByUser(nguoiDungId);
  }

  // ==================== TIN NHẮN ====================

  async sendMessage(phongId: number, nguoiGuiId: number, noiDung: string): Promise<any> {
    const room = await this.phongRepo.findById(phongId);
    if (!room) {
      throw new NotFoundError("Phòng trò chuyện không tồn tại.");
    }

    const hoatDongId = room.hoatDongId!;
    const activity = await this.hoatDongRepo.findById(hoatDongId);

    // Luồng 5a: Kiểm tra trạng thái phòng & hoạt động
    if (room.trangThai === 'CLOSED' || activity?.trangThai === 'da_huy' || activity?.trangThai === 'da_ket_thuc') {
      throw new BadRequestError("Phòng trò chuyện đã đóng hoặc hoạt động đã kết thúc/hủy, không thể gửi tin nhắn mới.");
    }

    // Luồng 2a: Kiểm tra quyền gửi tin nhắn (Chỉ thành viên hiện tại mới được gửi)
    const isOrganizer = await this.isOrganizer(hoatDongId, nguoiGuiId);
    const isMember = await this.thanhVienRepo.isMember(nguoiGuiId, hoatDongId);

    if (!isOrganizer && !isMember) {
      throw new ForbiddenError("Bạn không còn là thành viên của hoạt động này (chế độ chỉ đọc).");
    }

    if (!noiDung || noiDung.trim().length === 0) {
      throw new BadRequestError("Nội dung tin nhắn không được để trống.");
    }

    // Luồng 5b: Kiểm tra từ cấm / nội dung vi phạm
    const lowerContent = noiDung.toLowerCase();
    const hasBannedWord = BANNED_KEYWORDS.some((kw) => lowerContent.includes(kw));
    if (hasBannedWord) {
      throw new BadRequestError("Tin nhắn chứa nội dung không phù hợp với quy định cộng đồng và đã bị hệ thống từ chối.");
    }

    // Luồng 6: Lưu tin nhắn
    const newMessage = await this.tinNhanRepo.create({
      phongId,
      nguoiGuiId,
      noiDung: noiDung.trim(),
    });

    // Luồng 7: Thông báo đến các thành viên liên quan
    try {
      const senderRes = await pool.query("SELECT ho_ten FROM nguoi_dung WHERE nguoi_dung_id = $1", [nguoiGuiId]);
      const senderName = senderRes.rows[0]?.ho_ten || `Thành viên #${nguoiGuiId}`;

      const membersRes = await pool.query(
        "SELECT nguoi_dung_id FROM thanh_vien_hoat_dong WHERE hoat_dong_id = $1 AND trang_thai = 'DA_THAM_GIA' AND nguoi_dung_id != $2",
        [hoatDongId, nguoiGuiId]
      );

      for (const row of membersRes.rows) {
        await this.notificationService.sendNotification(
          row.nguoi_dung_id,
          `Tin nhắn mới trong ${room.tenPhong}`,
          `${senderName}: ${noiDung.trim().slice(0, 50)}...`,
          "CHAT",
          `/dashboard`
        );
      }
    } catch {}

    return newMessage;
  }

  async getMessages(phongId: number, limit: number = 50, offset: number = 0): Promise<any[]> {
    const room = await this.phongRepo.findById(phongId);
    if (!room) {
      throw new NotFoundError("Phòng trò chuyện không tồn tại.");
    }

    return await this.tinNhanRepo.findByPhongId(phongId, limit, offset);
  }

  async deleteMessage(tinNhanId: number, nguoiDungId: number): Promise<void> {
    const message = await this.tinNhanRepo.findById(tinNhanId);
    if (!message) {
      throw new NotFoundError("Tin nhắn không tồn tại.");
    }

    if (message.nguoiGuiId !== nguoiDungId) {
      throw new ForbiddenError("Bạn không có quyền xóa tin nhắn này.");
    }

    await this.tinNhanRepo.delete(tinNhanId);
  }

  // ==================== HELPER ====================

  private async isOrganizer(hoatDongId: number, nguoiDungId: number): Promise<boolean> {
    const activity = await this.hoatDongRepo.findById(hoatDongId);
    return activity?.nguoiToChucId === nguoiDungId;
  }
}
