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

  constructor() {
    this.ensureSchema();
  }

  private async ensureSchema() {
    try {
      await pool.query(`
        ALTER TABLE phong_tro_chuyen ADD COLUMN IF NOT EXISTS loai_phong VARCHAR(50) DEFAULT 'NHOM';
        CREATE TABLE IF NOT EXISTS thanh_vien_phong (
          phong_id BIGINT REFERENCES phong_tro_chuyen(phong_id) ON DELETE CASCADE,
          nguoi_dung_id BIGINT REFERENCES nguoi_dung(nguoi_dung_id) ON DELETE CASCADE,
          PRIMARY KEY (phong_id, nguoi_dung_id)
        );
      `);
    } catch {}
  }

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

  // Khởi tạo/Lấy phòng chat riêng 1-on-1 giữa 2 người bạn đã kết nối
  async getOrCreatePrivateRoom(userA: number, userB: number): Promise<any> {
    if (userA === userB) {
      throw new BadRequestError("Không thể tạo phòng nhắn tin với chính mình.");
    }

    // Kiểm tra mối quan hệ bạn bè/đã kết nối
    const isConnectedRes = await pool.query(
      `SELECT quan_he_id FROM quan_he_ket_noi
       WHERE (nguoi_dung_id_1 = $1 AND nguoi_dung_id_2 = $2)
          OR (nguoi_dung_id_1 = $2 AND nguoi_dung_id_2 = $1)`,
      [userA, userB]
    );

    if (isConnectedRes.rows.length === 0) {
      throw new ForbiddenError("Bạn cần gửi yêu cầu kết nối và được người dùng này chấp nhận (trở thành bạn bè) mới có thể nhắn tin riêng.");
    }

    // Tìm phòng chat riêng đã tồn tại
    const existingRoomRes = await pool.query(
      `SELECT p.phong_id AS "phongId", p.ten_phong AS "tenPhong", p.trang_thai AS "trangThai"
       FROM phong_tro_chuyen p
       JOIN thanh_vien_phong tv1 ON p.phong_id = tv1.phong_id
       JOIN thanh_vien_phong tv2 ON p.phong_id = tv2.phong_id
       WHERE p.loai_phong = 'RIENG_TU' AND tv1.nguoi_dung_id = $1 AND tv2.nguoi_dung_id = $2`,
      [userA, userB]
    ).catch(() => ({ rows: [] }));

    if (existingRoomRes.rows.length > 0) {
      return existingRoomRes.rows[0];
    }

    const userBRes = await pool.query("SELECT ho_ten FROM nguoi_dung WHERE nguoi_dung_id = $1", [userB]);
    const userBName = userBRes.rows[0]?.ho_ten || `Người dùng #${userB}`;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const insertRoom = await client.query(
        `INSERT INTO phong_tro_chuyen (ten_phong, loai_phong, trang_thai)
         VALUES ($1, 'RIENG_TU', 'ACTIVE')
         RETURNING phong_id AS "phongId", ten_phong AS "tenPhong", trang_thai AS "trangThai"`,
        [`Trò chuyện với ${userBName}`]
      );

      const roomId = insertRoom.rows[0].phongId;

      await client.query(
        `INSERT INTO thanh_vien_phong (phong_id, nguoi_dung_id) VALUES ($1, $2), ($1, $3)`,
        [roomId, userA, userB]
      );

      await client.query("COMMIT");
      return insertRoom.rows[0];
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
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

    if (room.trangThai === 'CLOSED') {
      throw new BadRequestError("Phòng trò chuyện này đã đóng.");
    }

    if (room.hetHanLuc && new Date(room.hetHanLuc) < new Date()) {
      throw new ForbiddenError("Đã hết thời gian 10 phút trò chuyện tạm thời. Vui lòng kết bạn để tiếp tục trò chuyện.");
    }

    const isPrivate = room.loaiPhong === 'RIENG_TU';

    if (isPrivate) {
      // Chat riêng: kiểm tra là thành viên phòng
      const memberCheck = await pool.query(
        `SELECT 1 FROM thanh_vien_phong WHERE phong_id = $1 AND nguoi_dung_id = $2`,
        [phongId, nguoiGuiId]
      );
      if (memberCheck.rows.length === 0) {
        throw new ForbiddenError("Bạn không có quyền gửi tin nhắn trong phòng trò chuyện riêng này.");
      }
    } else {
      // Chat nhóm hoạt động
      const hoatDongId = room.hoatDongId!;
      const activity = await this.hoatDongRepo.findById(hoatDongId);

      // Kiểm tra trạng thái phòng & hoạt động
      if (room.trangThai === 'CLOSED' || activity?.trangThai === 'da_huy' || activity?.trangThai === 'da_ket_thuc') {
        throw new BadRequestError("Phòng trò chuyện nhóm đã đóng do hoạt động đã kết thúc hoặc bị hủy.");
      }

      const isOrganizer = await this.isOrganizer(hoatDongId, nguoiGuiId);
      const isMember = await this.thanhVienRepo.isMember(nguoiGuiId, hoatDongId);

      if (!isOrganizer && !isMember) {
        throw new ForbiddenError("Bạn không phải thành viên của hoạt động này (chế độ chỉ đọc).");
      }
    }

    if (!noiDung || noiDung.trim().length === 0) {
      throw new BadRequestError("Nội dung tin nhắn không được để trống.");
    }

    // Kiểm tra từ cấm
    const lowerContent = noiDung.toLowerCase();
    const hasBannedWord = BANNED_KEYWORDS.some((kw) => lowerContent.includes(kw));
    if (hasBannedWord) {
      throw new BadRequestError("Tin nhắn chứa nội dung không phù hợp với quy định cộng đồng và đã bị hệ thống từ chối.");
    }

    // Lưu tin nhắn
    const newMessage = await this.tinNhanRepo.create({
      phongId,
      nguoiGuiId,
      noiDung: noiDung.trim(),
    });

    // Bắn thông báo
    try {
      const senderRes = await pool.query("SELECT ho_ten FROM nguoi_dung WHERE nguoi_dung_id = $1", [nguoiGuiId]);
      const senderName = senderRes.rows[0]?.ho_ten || `Thành viên #${nguoiGuiId}`;

      if (room.hoatDongId) {
        const membersRes = await pool.query(
          "SELECT nguoi_dung_id FROM thanh_vien_hoat_dong WHERE hoat_dong_id = $1 AND trang_thai = 'DA_THAM_GIA' AND nguoi_dung_id != $2",
          [room.hoatDongId, nguoiGuiId]
        );

        for (const row of membersRes.rows) {
          await this.notificationService.sendNotification(
            row.nguoi_dung_id,
            `Tin nhắn mới trong ${room.tenPhong}`,
            `${senderName}: ${noiDung.trim().slice(0, 50)}...`,
            "CHAT",
            `/chat`
          );
        }
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

  private async isOrganizer(hoatDongId: number, nguoiDungId: number): Promise<boolean> {
    const activity = await this.hoatDongRepo.findById(hoatDongId);
    return activity?.nguoiToChucId === nguoiDungId;
  }
}
