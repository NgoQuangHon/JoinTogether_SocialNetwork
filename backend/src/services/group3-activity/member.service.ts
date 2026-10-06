import { YeuCauThamGiaRepository } from "../../repositories/group3-activity/yeuCauThamGia.repository";
import { ThanhVienHoatDongRepository } from "../../repositories/group3-activity/thanhVienHoatDong.repository";
import { XacNhanThamDuRepository } from "../../repositories/group3-activity/xacNhanThamDu.repository";
import { HoatDongRepository } from "../../repositories/group3-activity/hoatDong.repository";
import { ThongBaoRepository } from "../../repositories/group4-interaction/thongBao.repository";
import { pool } from "../../config/db";
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "../../utils/AppError";

export class MemberService {
  private yeuCauRepo = new YeuCauThamGiaRepository();
  private thanhVienRepo = new ThanhVienHoatDongRepository();
  private xacNhanRepo = new XacNhanThamDuRepository();
  private hoatDongRepo = new HoatDongRepository();
  private thongBaoRepo = new ThongBaoRepository();

  // ==================== UC4.1: GỬI YÊU CẦU THAM GIA ====================

  async sendJoinRequest(nguoiDungId: number, hoatDongId: number): Promise<any> {
    const activity = await this.hoatDongRepo.findById(hoatDongId);
    if (!activity) {
      throw new NotFoundError("Hoạt động không tồn tại.");
    }

    // Yêu cầu 4: Validate tuổi tham gia hoạt động
    let profileRes: any;
    try {
      profileRes = await pool.query(
        `SELECT ngay_sinh FROM ho_so_nguoi_dung WHERE nguoi_dung_id = $1`,
        [nguoiDungId]
      );
    } catch {}
    const ngaySinh = profileRes?.rows?.[0]?.ngay_sinh;

    let userAge: number | null = null;
    if (ngaySinh) {
      const dob = new Date(ngaySinh);
      if (!isNaN(dob.getTime())) {
        const today = new Date();
        userAge = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
          userAge--;
        }
      }
    }

    const minAge = activity.doTuoiTu != null ? Number(activity.doTuoiTu) : null;
    const maxAge = activity.doTuoiDen != null ? Number(activity.doTuoiDen) : null;

    if (minAge !== null || maxAge !== null) {
      if (userAge === null) {
        throw new BadRequestError("Bạn cần cập nhật ngày sinh trong hồ sơ để xác thực tuổi trước khi tham gia hoạt động.");
      }
      if (minAge !== null && userAge < minAge) {
        throw new BadRequestError(`Tuổi của bạn (${userAge}) nhỏ hơn độ tuổi tối thiểu cho phép (${minAge}) của hoạt động này.`);
      }
      if (maxAge !== null && userAge > maxAge) {
        throw new BadRequestError(`Tuổi của bạn (${userAge}) lớn hơn độ tuổi tối đa cho phép (${maxAge}) của hoạt động này.`);
      }
    }

    // Kiểm tra đã là thành viên chưa
    const isMember = await this.thanhVienRepo.isMember(nguoiDungId, hoatDongId);
    if (isMember) {
      throw new ConflictError("Bạn đã là thành viên của hoạt động này.");
    }

    // Kiểm tra đã gửi yêu cầu trước đó chưa
    const existingRequest = await this.yeuCauRepo.findExistingRequest(hoatDongId, nguoiDungId);
    if (existingRequest) {
      if (existingRequest.trangThai === 'PENDING') {
        throw new ConflictError("Yêu cầu tham gia của bạn đang chờ xử lý.");
      }
      if (existingRequest.trangThai === 'APPROVED') {
        throw new ConflictError("Bạn đã được duyệt tham gia hoạt động này.");
      }
      if (existingRequest.trangThai === 'REJECTED') {
        throw new ConflictError("Yêu cầu tham gia của bạn đã bị từ chối trước đó.");
      }
    }





    // Đếm số thành viên hiện tại của hoạt động
    const memberCountRes = await pool.query(
      `SELECT COUNT(*) FROM thanh_vien_hoat_dong WHERE hoat_dong_id = $1`,
      [hoatDongId]
    );
    const currentMembers = parseInt(memberCountRes.rows[0].count, 10);
    if (activity.soLuongToiDa && currentMembers >= Number(activity.soLuongToiDa)) {
      throw new BadRequestError("Hoạt động đã đạt số lượng thành viên tối đa.");
    }




    
    // Nếu hoạt động bật "tự động chấp nhận" → duyệt ngay, không cần chờ người tổ chức
    const tuDongChapNhan = activity.tuDongChapNhan !== false;
    if (tuDongChapNhan) {
      const yeuCau = await this.yeuCauRepo.create({
        hoatDongId,
        nguoiDungId,
        trangThai: 'APPROVED',
      });
      await this.thanhVienRepo.create({
        hoatDongId,
        nguoiDungId,
        yeuCauId: yeuCau.yeuCauId!,
      });
      await this.thongBaoRepo.create({
        nguoiNhanId: nguoiDungId,
        tieuDe: "Đã tham gia hoạt động",
        noiDung: `Bạn đã được tự động chấp nhận tham gia hoạt động "${activity.tenHoatDong}".`,
        loaiThongBao: "DUYETTHAMGIA",
      });
      return { ...yeuCau, daThamGia: true };
    }

    const yeuCau = await this.yeuCauRepo.create({
      hoatDongId,
      nguoiDungId,
      trangThai: 'PENDING',
    });

    // Thông báo cho người tổ chức
    if (activity.nguoiToChucId) {
      await this.thongBaoRepo.create({
        nguoiNhanId: activity.nguoiToChucId,
        tieuDe: "Yêu cầu tham gia mới",
        noiDung: `Có yêu cầu tham gia hoạt động "${activity.tenHoatDong}".`,
        loaiThongBao: "YEUTHAMGIA",
      });
    }

    return yeuCau;
  }

  // ==================== UC4.3: XÁC NHẬN/DANH SÁCH YÊU CẦU ====================

  async getPendingRequests(hoatDongId: number): Promise<any[]> {
    return await this.yeuCauRepo.findPendingByActivity(hoatDongId);
  }

  async approveRequest(yeuCauId: number, nguoiToChucId: number): Promise<any> {
    const request = await this.yeuCauRepo.findById(yeuCauId);
    if (!request) {
      throw new NotFoundError("Yêu cầu không tồn tại.");
    }

    const hoatDongId = request.hoatDongId!;
    const nguoiDungId = request.nguoiDungId!;

    // Kiểm tra người duyệt có phải chủ hoạt động không
    const activity = await this.hoatDongRepo.findById(hoatDongId);
    if (!activity || activity.nguoiToChucId !== nguoiToChucId) {
      throw new ForbiddenError("Bạn không có quyền duyệt yêu cầu này.");
    }

    if (request.trangThai !== 'PENDING') {
      throw new ConflictError("Yêu cầu này đã được xử lý trước đó.");
    }

    // Chấp nhận: tạo thành viên
    await this.yeuCauRepo.updateStatus(yeuCauId, 'APPROVED');
    const thanhVien = await this.thanhVienRepo.create({
      hoatDongId,
      nguoiDungId,
      yeuCauId,
    });

    // Thông báo cho người được duyệt
    await this.thongBaoRepo.create({
      nguoiNhanId: nguoiDungId,
      tieuDe: "Yêu cầu tham gia được chấp nhận",
      noiDung: `Yêu cầu tham gia hoạt động "${activity.tenHoatDong}" của bạn đã được chấp nhận.`,
      loaiThongBao: "DUYETTHAMGIA",
    });

    return thanhVien;
  }

  async rejectRequest(yeuCauId: number, nguoiToChucId: number): Promise<any> {
    const request = await this.yeuCauRepo.findById(yeuCauId);
    if (!request) {
      throw new NotFoundError("Yêu cầu không tồn tại.");
    }

    const hoatDongId = request.hoatDongId!;
    const nguoiDungId = request.nguoiDungId!;

    const activity = await this.hoatDongRepo.findById(hoatDongId);
    if (!activity || activity.nguoiToChucId !== nguoiToChucId) {
      throw new ForbiddenError("Bạn không có quyền từ chối yêu cầu này.");
    }

    if (request.trangThai !== 'PENDING') {
      throw new ConflictError("Yêu cầu này đã được xử lý trước đó.");
    }

    await this.yeuCauRepo.updateStatus(yeuCauId, 'REJECTED');

    // Thông báo cho người bị từ chối
    await this.thongBaoRepo.create({
      nguoiNhanId: nguoiDungId,
      tieuDe: "Yêu cầu tham gia bị từ chối",
      noiDung: `Yêu cầu tham gia hoạt động "${activity.tenHoatDong}" của bạn đã bị từ chối.`,
      loaiThongBao: "TUCHOITHAMGIA",
    });

    return { message: "Đã từ chối yêu cầu." };
  }

  // ==================== QUẢN LÝ THÀNH VIÊN ====================

  async getMembers(hoatDongId: number): Promise<any[]> {
    const members = await this.thanhVienRepo.findByHoatDongId(hoatDongId);
    const activity = await this.hoatDongRepo.findById(hoatDongId);
    if (activity && activity.nguoiToChucId) {
      const orgId = Number(activity.nguoiToChucId);
      const hasOrganizer = members.some((m: any) => Number(m.nguoiDungId) === orgId);
      if (!hasOrganizer) {
        try {
          const orgRes = await pool.query(
            `SELECT nd.nguoi_dung_id AS "nguoiDungId", nd.ho_ten AS "hoTen", nd.email, hs.anh_dai_dien AS "anhDaiDien"
             FROM nguoi_dung nd
             LEFT JOIN ho_so_nguoi_dung hs ON nd.nguoi_dung_id = hs.nguoi_dung_id
             WHERE nd.nguoi_dung_id = $1`,
            [orgId]
          );
          if (orgRes.rows.length > 0) {
            members.unshift({
              thanhVienId: 0,
              hoatDongId,
              nguoiDungId: orgId,
              hoTen: orgRes.rows[0].hoTen + ' (Người tổ chức)',
              email: orgRes.rows[0].email,
              anhDaiDien: orgRes.rows[0].anhDaiDien,
              trangThaiThamDu: 'DA_DIEM_DANH',
            });
          }
        } catch {}
      }
    }
    return members;
  }

  async removeMember(thanhVienId: number, nguoiToChucId: number): Promise<void> {
    const member = await this.thanhVienRepo.findById(thanhVienId);
    if (!member) {
      throw new NotFoundError("Thành viên không tồn tại.");
    }

    const hoatDongId = member.hoatDongId!;
    const nguoiDungId = member.nguoiDungId!;

    const activity = await this.hoatDongRepo.findById(hoatDongId);
    if (!activity || activity.nguoiToChucId !== nguoiToChucId) {
      throw new ForbiddenError("Bạn không có quyền xóa thành viên này.");
    }

    await this.thanhVienRepo.delete(thanhVienId);

    // Thông báo cho thành viên bị xóa
    await this.thongBaoRepo.create({
      nguoiNhanId: nguoiDungId,
      tieuDe: "Bị xóa khỏi hoạt động",
      noiDung: `Bạn đã bị xóa khỏi hoạt động "${activity.tenHoatDong}".`,
      loaiThongBao: "XOATHANHVIEN",
    });
  }

  async leaveActivity(nguoiDungId: number, hoatDongId: number): Promise<void> {
    const activity = await this.hoatDongRepo.findById(hoatDongId);
    if (!activity) {
      throw new NotFoundError("Hoạt động không tồn tại.");
    }

    // Không cho chủ hoạt động rời — chỉ có thể xóa hoạt động
    if (activity.nguoiToChucId === nguoiDungId) {
      throw new BadRequestError("Bạn là người tổ chức, không thể tự rời. Vui lòng xóa hoạt động nếu muốn.");
    }

    const deleted = await this.thanhVienRepo.deleteByUserAndActivity(nguoiDungId, hoatDongId);
    if (!deleted) {
      throw new ForbiddenError("Bạn không phải là thành viên của hoạt động này.");
    }
  }

  // ==================== XÁC NHẬN THAM DỰ (CHECK-IN) ====================

  async confirmAttendance(thanhVienId: number, nguoiToChucId: number): Promise<any> {
    const member = await this.thanhVienRepo.findById(thanhVienId);
    if (!member) {
      throw new NotFoundError("Thành viên không tồn tại.");
    }

    const hoatDongId = member.hoatDongId!;
    const activity = await this.hoatDongRepo.findById(hoatDongId);
    if (!activity || activity.nguoiToChucId !== nguoiToChucId) {
      throw new ForbiddenError("Chỉ người tổ chức mới có thể xác nhận tham dự.");
    }

    // Kiểm tra đã có xác nhận chưa
    const existing = await this.xacNhanRepo.findByThanhVienId(thanhVienId);
    if (existing) {
      if (existing.trangThaiThamDu === 'DA_DIEM_DANH') {
        throw new ConflictError("Thành viên này đã được xác nhận tham dự trước đó.");
      }
      // Cập nhật lại
      const xacNhanId = existing.xacNhanId!;
      return await this.xacNhanRepo.update(xacNhanId, {
        trangThaiThamDu: 'DA_DIEM_DANH',
        thoiGianCheckIn: new Date(),
      });
    }

    return await this.xacNhanRepo.create({
      thanhVienId,
      trangThaiThamDu: 'DA_DIEM_DANH',
      thoiGianCheckIn: new Date(),
    });
  }

  async getAttendanceList(hoatDongId: number): Promise<any[]> {
    return await this.xacNhanRepo.findByHoatDongId(hoatDongId);
  }

  // ==================== CHECK-IN VÀ XÁC NHẬN THAM GIA NÂNG CAO ====================

  async userCheckIn(nguoiDungId: number, hoatDongId: number, maCheckIn?: string): Promise<any> {
    const activity = await this.hoatDongRepo.findById(hoatDongId);
    if (!activity) {
      throw new NotFoundError("Hoạt động không tồn tại.");
    }

    const members = await this.thanhVienRepo.findByHoatDongId(hoatDongId);
    const member = members.find((m: any) => m.nguoiDungId === nguoiDungId);
    if (!member) {
      throw new ForbiddenError("Bạn không phải là thành viên chính thức của hoạt động này.");
    }

    // Luồng 3b: Mã check-in không hợp lệ
    const validCode = `CHECKIN-${hoatDongId}`;
    if (maCheckIn && maCheckIn.trim().toUpperCase() !== validCode && maCheckIn.trim() !== String(hoatDongId)) {
      throw new BadRequestError("Mã check-in không hợp lệ. Vui lòng kiểm tra lại mã xác nhận.");
    }

    const now = new Date();
    const startTime = activity.thoiGianBatDau ? new Date(activity.thoiGianBatDau) : new Date();
    const endTime = activity.thoiGianKetThuc ? new Date(activity.thoiGianKetThuc) : new Date(startTime.getTime() + 86400000);
    const allowedStartWindow = new Date(startTime.getTime() - 30 * 60 * 1000);

    // Luồng 3a: Kiểm tra khung thời gian cho phép
    let status = 'DA_DIEM_DANH';
    let message = 'Check-in thành công! Bạn đã hoàn tất xác nhận tham gia.';
    if (now < allowedStartWindow || now > endTime) {
      status = 'CHO_XAC_MINH';
      message = 'Bạn đã check-in ngoài khung thời gian quy định. Yêu cầu đã được chuyển sang trạng thái "Chờ xác minh".';
    }

    const thanhVienId = member.thanhVienId!;
    const existing = await this.xacNhanRepo.findByThanhVienId(thanhVienId);
    let record;
    if (existing) {
      record = await this.xacNhanRepo.update(existing.xacNhanId!, {
        trangThaiThamDu: status,
        thoiGianCheckIn: now,
      });
    } else {
      record = await this.xacNhanRepo.create({
        thanhVienId,
        trangThaiThamDu: status,
        thoiGianCheckIn: now,
      });
    }

    if (activity.nguoiToChucId) {
      await this.thongBaoRepo.create({
        nguoiNhanId: activity.nguoiToChucId,
        tieuDe: "Thông báo check-in mới",
        noiDung: `Thành viên #${nguoiDungId} vừa thực hiện check-in cho hoạt động "${activity.tenHoatDong}". Trạng thái: ${status}.`,
        loaiThongBao: "CHECKIN",
      });
    }

    return { record, message, status };
  }

  // Luồng 2a: Người dùng hủy tham gia hoạt động trước khi diễn ra
  async cancelParticipation(nguoiDungId: number, hoatDongId: number, lyDo?: string): Promise<any> {
    const activity = await this.hoatDongRepo.findById(hoatDongId);
    if (!activity) {
      throw new NotFoundError("Hoạt động không tồn tại.");
    }

    const members = await this.thanhVienRepo.findByHoatDongId(hoatDongId);
    const member = members.find((m: any) => m.nguoiDungId === nguoiDungId);
    if (!member) {
      throw new ForbiddenError("Bạn không phải là thành viên của hoạt động này.");
    }

    await this.thanhVienRepo.deleteByUserAndActivity(nguoiDungId, hoatDongId);

    if (activity.nguoiToChucId) {
      await this.thongBaoRepo.create({
        nguoiNhanId: activity.nguoiToChucId,
        tieuDe: "Thành viên hủy tham gia",
        noiDung: `Thành viên #${nguoiDungId} đã hủy tham gia hoạt động "${activity.tenHoatDong}". Lý do: ${lyDo || 'Không có'}.`,
        loaiThongBao: "HUY_THAM_GIA",
      });
    }

    return { message: "Đã hủy tham gia hoạt động thành công." };
  }

  // Luồng 1: Nhắc lịch trước hoạt động
  async sendReminder(hoatDongId: number, nguoiToChucId: number): Promise<any> {
    const activity = await this.hoatDongRepo.findById(hoatDongId);
    if (!activity || activity.nguoiToChucId !== nguoiToChucId) {
      throw new ForbiddenError("Bạn không có quyền gửi thông báo nhắc lịch cho hoạt động này.");
    }

    const members = await this.thanhVienRepo.findByHoatDongId(hoatDongId);
    let count = 0;
    for (const m of members) {
      if (m.nguoiDungId && m.nguoiDungId !== nguoiToChucId) {
        await this.thongBaoRepo.create({
          nguoiNhanId: m.nguoiDungId,
          tieuDe: `⏰ Nhắc lịch: ${activity.tenHoatDong}`,
          noiDung: `Hoạt động "${activity.tenHoatDong}" sẽ diễn ra sớm. Vui lòng chuẩn bị sẵn sàng và thực hiện check-in đúng giờ!`,
          loaiThongBao: "NHAC_LICH",
        });
        count++;
      }
    }
    return { message: `Đã gửi thông báo nhắc lịch tới ${count} thành viên.` };
  }

  // Luồng 6 & 6a: Cập nhật điểm danh thực tế (Đã điểm danh / Vắng mặt)
  async updateAttendanceStatus(thanhVienId: number, nguoiToChucId: number, status: 'DA_DIEM_DANH' | 'VANG_MAT' | 'CHO_XAC_MINH'): Promise<any> {
    const member = await this.thanhVienRepo.findById(thanhVienId);
    if (!member) {
      throw new NotFoundError("Thành viên không tồn tại.");
    }

    const activity = await this.hoatDongRepo.findById(member.hoatDongId!);
    if (!activity || activity.nguoiToChucId !== nguoiToChucId) {
      throw new ForbiddenError("Chỉ người tổ chức mới có quyền cập nhật trạng thái điểm danh.");
    }

    const existing = await this.xacNhanRepo.findByThanhVienId(thanhVienId);
    if (existing) {
      return await this.xacNhanRepo.update(existing.xacNhanId!, {
        trangThaiThamDu: status,
        thoiGianCheckIn: status === 'DA_DIEM_DANH' ? new Date() : (existing.thoiGianCheckIn ?? null),
      });
    }

    return await this.xacNhanRepo.create({
      thanhVienId,
      trangThaiThamDu: status,
      thoiGianCheckIn: status === 'DA_DIEM_DANH' ? new Date() : null,
    });
  }
}

