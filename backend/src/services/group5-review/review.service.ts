import { DanhGiaRepository } from "../../repositories/group5-review/danhGia.repository";
import { ChiTietDanhGiaRepository } from "../../repositories/group5-review/chiTietDanhGia.repository";
import { TieuChiDanhGiaRepository } from "../../repositories/group5-review/tieuChiDanhGia.repository";
import { DiemUyTinRepository } from "../../repositories/group5-review/diemUyTin.repository";
import { LichSuDiemUyTinRepository } from "../../repositories/group5-review/lichSuDiemUyTin.repository";
import { HoatDongRepository } from "../../repositories/group3-activity/hoatDong.repository";
import { ThanhVienHoatDongRepository } from "../../repositories/group3-activity/thanhVienHoatDong.repository";

export class ReviewService {
  private danhGiaRepo = new DanhGiaRepository();
  private chiTietRepo = new ChiTietDanhGiaRepository();
  private tieuChiRepo = new TieuChiDanhGiaRepository();
  private diemUyTinRepo = new DiemUyTinRepository();
  private lichSuRepo = new LichSuDiemUyTinRepository();
  private hoatDongRepo = new HoatDongRepository();
  private thanhVienRepo = new ThanhVienHoatDongRepository();

  // ==================== UC5.1: GỬI ĐÁNH GIÁ ====================

  async createReview(
    nguoiDanhGiaId: number,
    hoatDongId: number,
    nguoiDuocDanhGiaId: number,
    data: { nhanXet?: string; diemTong?: number; chiTiet?: Array<{ tieuChiDanhGiaId: number; diem: number }> },
  ): Promise<any> {
    if (nguoiDanhGiaId === nguoiDuocDanhGiaId) {
      throw new Error("Không thể tự đánh giá chính mình.");
    }

    // Kiểm tra hoạt động tồn tại
    const activity = await this.hoatDongRepo.findById(hoatDongId);
    if (!activity) {
      throw new Error("Hoạt động không tồn tại.");
    }

    // Kiểm tra cả 2 đều tham gia hoạt động
    const reviewerIsMember =
      (await this.thanhVienRepo.isMember(nguoiDanhGiaId, hoatDongId)) ||
      activity.nguoiToChucId === nguoiDanhGiaId;
    const reviewedIsMember =
      (await this.thanhVienRepo.isMember(nguoiDuocDanhGiaId, hoatDongId)) ||
      activity.nguoiToChucId === nguoiDuocDanhGiaId;

    if (!reviewerIsMember) {
      throw new Error("Bạn không tham gia hoạt động này.");
    }
    if (!reviewedIsMember) {
      throw new Error("Người được đánh giá không tham gia hoạt động này.");
    }

    // Kiểm tra đã đánh giá trước đó
    const existing = await this.danhGiaRepo.findExistingReview(hoatDongId, nguoiDanhGiaId, nguoiDuocDanhGiaId);
    if (existing) {
      throw new Error("Bạn đã đánh giá người dùng này trong hoạt động này rồi.");
    }

// Tạo đánh giá
    const danhGia = await this.danhGiaRepo.create({
      hoatDongId,
      nguoiDanhGiaId,
      nguoiDuocDanhGiaId,
      nhanXet: data.nhanXet ?? null,
      diemTong: data.diemTong ?? null,
    });

    // Tạo chi tiết đánh giá nếu có
    if (data.chiTiet && data.chiTiet.length > 0) {
      for (const ct of data.chiTiet) {
        await this.chiTietRepo.create({
          danhGiaId: danhGia.danhGiaId!,
          tieuChiDanhGiaId: ct.tieuChiDanhGiaId,
          diem: ct.diem,
        });
      }
    }

    // Cập nhật điểm uy tín cho người được đánh giá
    const diemThayDoi = data.diemTong ? Math.round((data.diemTong / 5) * 10 - 5) : 0;
    const updatedDiem = await this.diemUyTinRepo.updateDiem(nguoiDuocDanhGiaId, diemThayDoi);

    if (updatedDiem) {
      await this.lichSuRepo.create({
        diemUyTinId: updatedDiem.diemUyTinId!,
        diemThayDoi,
        lyDoThayDoi: `Nhận đánh giá từ hoạt động #${hoatDongId}`,
      });
    }

    return {
      ...danhGia,
      diemThayDoi,
    };
  }

  // ==================== UC5.2: PHẢN HỒI ĐÁNH GIÁ (XEM) ====================

  async getReviewsByActivity(hoatDongId: number): Promise<any[]> {
    return await this.danhGiaRepo.findByHoatDongId(hoatDongId);
  }

  async getReviewsForUser(nguoiDuocDanhGiaId: number): Promise<any[]> {
    return await this.danhGiaRepo.findByNguoiDuocDanhGia(nguoiDuocDanhGiaId);
  }

  async getReviewDetail(danhGiaId: number): Promise<any> {
    const danhGia = await this.danhGiaRepo.findById(danhGiaId);
    if (!danhGia) {
      throw new Error("Đánh giá không tồn tại.");
    }

    const chiTiet = await this.chiTietRepo.findByDanhGiaId(danhGiaId);
    return { ...danhGia, chiTiet };
  }

  // ==================== TIÊU CHÍ ĐÁNH GIÁ ====================

  async getAllTieuChi(): Promise<any[]> {
    return await this.tieuChiRepo.findAll();
  }

  // ==================== UC5.3: XEM ĐIỂM UY TÍN ====================

  async getReputation(nguoiDungId: number): Promise<any> {
    const diem = await this.diemUyTinRepo.findByNguoiDungId(nguoiDungId);
    if (!diem) {
      // Tạo mới nếu chưa có
      return await this.diemUyTinRepo.findOrCreate(nguoiDungId);
    }
    return diem;
  }

  async getReputationHistory(nguoiDungId: number): Promise<any[]> {
    return await this.lichSuRepo.findByNguoiDungId(nguoiDungId);
  }
}

