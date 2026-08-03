import { YeuCauHoTroRepository } from "../../repositories/group6-admin/yeuCauHoTro.repository";
import { ThongBaoRepository } from "../../repositories/group4-interaction/thongBao.repository";
import { NhatKyQuanTriRepository } from "../../repositories/group6-admin/nhatKyQuanTri.repository";
import { BadRequestError, NotFoundError } from "../../utils/AppError";

export class SupportService {
  private hoTroRepo = new YeuCauHoTroRepository();
  private thongBaoRepo = new ThongBaoRepository();
  private nhatKyRepo = new NhatKyQuanTriRepository();

  async createSupportRequest(
    nguoiGuiId: number,
    data: { loaiHoTro: string; tieuDe: string; moTa: string },
  ): Promise<any> {
    if (!data.tieuDe || data.tieuDe.trim().length === 0) {
      throw new BadRequestError("Vui lòng nhập tiêu đề yêu cầu hỗ trợ.");
    }
    if (!data.moTa || data.moTa.trim().length === 0) {
      throw new BadRequestError("Vui lòng mô tả chi tiết vấn đề cần hỗ trợ.");
    }

    const hoTro = await this.hoTroRepo.create({
      nguoiGuiId,
      loaiHoTro: data.loaiHoTro || "KHAC",
      tieuDe: data.tieuDe.trim(),
      moTa: data.moTa.trim(),
    });

    // Thông báo xác nhận cho người gửi
    await this.thongBaoRepo.create({
      nguoiNhanId: nguoiGuiId,
      tieuDe: "Đã tiếp nhận yêu cầu hỗ trợ",
      noiDung: `Hệ thống đã ghi nhận yêu cầu hỗ trợ #${hoTro.hoTroId} của bạn. Chúng tôi sẽ phản hồi trong thời gian sớm nhất.`,
      loaiThongBao: "TIEP_NHAN_HO_TRO",
    });

    return hoTro;
  }

  async getSupportRequests(trangThai?: string): Promise<any[]> {
    return await this.hoTroRepo.findAll(trangThai);
  }

  async getSupportRequestById(id: number): Promise<any> {
    const hoTro = await this.hoTroRepo.findById(id);
    if (!hoTro) {
      throw new NotFoundError("Yêu cầu hỗ trợ không tồn tại.");
    }
    return hoTro;
  }

  async processSupportRequest(
    id: number,
    nguoiXuLyId: number,
    data: { trangThai: string; ghiChuAdmin?: string },
  ): Promise<any> {
    const hoTro = await this.hoTroRepo.findById(id);
    if (!hoTro) {
      throw new NotFoundError("Yêu cầu hỗ trợ không tồn tại.");
    }

    const updated = await this.hoTroRepo.process(id, {
      trangThai: data.trangThai,
      ...(data.ghiChuAdmin !== undefined ? { ghiChuAdmin: data.ghiChuAdmin } : {}),
    });

    // Thông báo cho người dùng về kết quả xử lý
    const statusLabel =
      data.trangThai === "DA_XU_LY"
        ? "đã được xử lý"
        : data.trangThai === "DA_DONG"
          ? "đã được đóng"
          : "đang được xử lý";

    await this.thongBaoRepo.create({
      nguoiNhanId: hoTro.nguoiGuiId,
      tieuDe: "Cập nhật yêu cầu hỗ trợ",
      noiDung: `Yêu cầu hỗ trợ #${id} của bạn ${statusLabel}.${data.ghiChuAdmin ? ` Ghi chú: ${data.ghiChuAdmin}` : ""}`,
      loaiThongBao: "CAP_NHAT_HO_TRO",
    });

    // Ghi nhật ký quản trị
    await this.nhatKyRepo.create({
      nguoiQuanTriId: nguoiXuLyId,
      hanhDong: `XỬ_LÝ_HỖ_TRỢ #${id}: ${data.trangThai}`,
      doiTuongTacDong: `YeuCauHoTro_${id}`,
    });

    return updated;
  }
}
