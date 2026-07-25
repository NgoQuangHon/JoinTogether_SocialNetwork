import { PhongTroChuyenRepository } from "../../repositories/group4-interaction/phongTroChuyen.repository";
import { TinNhanRepository } from "../../repositories/group4-interaction/tinNhan.repository";
import { HoatDongRepository } from "../../repositories/group3-activity/hoatDong.repository";
import { ThanhVienHoatDongRepository } from "../../repositories/group3-activity/thanhVienHoatDong.repository";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../utils/AppError";

export class ChatService {
  private phongRepo = new PhongTroChuyenRepository();
  private tinNhanRepo = new TinNhanRepository();
  private hoatDongRepo = new HoatDongRepository();
  private thanhVienRepo = new ThanhVienHoatDongRepository();

  // ==================== UC4.2: PHÒNG TRÒ CHUYỆN ====================

  async getOrCreateRoom(hoatDongId: number): Promise<any> {
    const activity = await this.hoatDongRepo.findById(hoatDongId);
    if (!activity) {
      throw new NotFoundError("Hoạt động không tồn tại.");
    }

    // Tìm phòng đã tồn tại
    const existingRoom = await this.phongRepo.findByHoatDongId(hoatDongId);
    if (existingRoom) {
      return existingRoom;
    }

    // Tạo phòng mới
    return await this.phongRepo.create({
      hoatDongId,
      tenPhong: activity.tenHoatDong,
      trangThai: 'ACTIVE',
    });
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

  // ==================== UC4.2: TIN NHẮN ====================

  async sendMessage(phongId: number, nguoiGuiId: number, noiDung: string): Promise<any> {
    const room = await this.phongRepo.findById(phongId);
    if (!room) {
      throw new NotFoundError("Phòng trò chuyện không tồn tại.");
    }

    const hoatDongId = room.hoatDongId!;

    // Kiểm tra người gửi có quyền truy cập phòng không
    const isOrganizer = await this.isOrganizer(hoatDongId, nguoiGuiId);
    const isMember = await this.thanhVienRepo.isMember(nguoiGuiId, hoatDongId);

    if (!isOrganizer && !isMember) {
      throw new ForbiddenError("Bạn không phải là thành viên của hoạt động này.");
    }

    if (!noiDung || noiDung.trim().length === 0) {
      throw new BadRequestError("Nội dung tin nhắn không được để trống.");
    }

    return await this.tinNhanRepo.create({
      phongId,
      nguoiGuiId,
      noiDung: noiDung.trim(),
    });
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

    // Chỉ người gửi mới được xóa
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

