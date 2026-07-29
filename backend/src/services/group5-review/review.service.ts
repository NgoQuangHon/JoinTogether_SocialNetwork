import { DanhGiaRepository } from "../../repositories/group5-review/danhGia.repository";
import { ChiTietDanhGiaRepository } from "../../repositories/group5-review/chiTietDanhGia.repository";
import { TieuChiDanhGiaRepository } from "../../repositories/group5-review/tieuChiDanhGia.repository";
import { DiemUyTinRepository } from "../../repositories/group5-review/diemUyTin.repository";
import { LichSuDiemUyTinRepository } from "../../repositories/group5-review/lichSuDiemUyTin.repository";
import { HoatDongRepository } from "../../repositories/group3-activity/hoatDong.repository";
import { ThanhVienHoatDongRepository } from "../../repositories/group3-activity/thanhVienHoatDong.repository";
import { ThongBaoRepository } from "../../repositories/group4-interaction/thongBao.repository";
import { pool } from "../../config/db";
import { AppError, ConflictError, NotFoundError, BadRequestError, ForbiddenError } from "../../utils/AppError";

const BANNED_KEYWORDS = [
  "cờ bạc", "lừa đảo", "hack", "crack", "spam", "chửi", "xúc phạm", "tục tĩu", "dâm ô"
];

export class ReviewService {
  private danhGiaRepo = new DanhGiaRepository();
  private chiTietRepo = new ChiTietDanhGiaRepository();
  private tieuChiRepo = new TieuChiDanhGiaRepository();
  private diemUyTinRepo = new DiemUyTinRepository();
  private lichSuRepo = new LichSuDiemUyTinRepository();
  private hoatDongRepo = new HoatDongRepository();
  private thanhVienRepo = new ThanhVienHoatDongRepository();
  private thongBaoRepo = new ThongBaoRepository();

  // ==================== UC5.1: GỬI ĐÁNH GIÁ ====================

  async createReview(
    nguoiDanhGiaId: number,
    hoatDongId: number,
    nguoiDuocDanhGiaId: number,
    data: { nhanXet?: string; diemTong?: number; chiTiet?: Array<{ tieuChiDanhGiaId: number; diem: number }> },
  ): Promise<any> {
    // Luồng 5c: Tự đánh giá chính mình
    if (nguoiDanhGiaId === nguoiDuocDanhGiaId) {
      throw new AppError("Bạn không được phép tự đánh giá chính mình.", 400);
    }

    const activity = await this.hoatDongRepo.findById(hoatDongId);
    if (!activity) {
      throw new NotFoundError("Hoạt động không tồn tại.");
    }

    // Luồng 5a: Kiểm tra người đánh giá đã được xác nhận tham dự chưa
    const attendanceCheck = await pool.query(
      `SELECT xnt.trang_thai_tham_du
       FROM thanh_vien_hoat_dong tv
       LEFT JOIN xac_nhan_tham_du xnt ON tv.thanh_vien_id = xnt.thanh_vien_id
       WHERE tv.hoat_dong_id = $1 AND tv.nguoi_dung_id = $2`,
      [hoatDongId, nguoiDanhGiaId]
    );

    const isOrganizer = activity.nguoiToChucId === nguoiDanhGiaId;
    const isAttended = isOrganizer || (attendanceCheck.rows.length > 0 && (attendanceCheck.rows[0].trang_thai_tham_du === 'DA_DIEM_DANH' || attendanceCheck.rows[0].trang_thai_tham_du === 'DA_CHECKIN'));

    if (!isAttended) {
      throw new AppError("Bạn chưa được xác nhận tham dự thực tế cho hoạt động này nên chưa đủ điều kiện gửi đánh giá.", 403);
    }

    const reviewedIsMember =
      (await this.thanhVienRepo.isMember(nguoiDuocDanhGiaId, hoatDongId)) ||
      activity.nguoiToChucId === nguoiDuocDanhGiaId;

    if (!reviewedIsMember) {
      throw new AppError("Người được đánh giá không tham gia hoạt động này.", 403);
    }

    // Luồng 5b: Đã tồn tại đánh giá của người dùng với cùng đối tượng trong hoạt động
    const existing = await this.danhGiaRepo.findExistingReview(hoatDongId, nguoiDanhGiaId, nguoiDuocDanhGiaId);
    if (existing) {
      throw new ConflictError("Đã tồn tại đánh giá của bạn đối với người dùng này trong hoạt động này.");
    }

    // Luồng 5d: Nội dung nhận xét có dấu hiệu vi phạm
    if (data.nhanXet) {
      const lowerContent = data.nhanXet.toLowerCase();
      const hasBannedWord = BANNED_KEYWORDS.some((kw) => lowerContent.includes(kw));
      if (hasBannedWord) {
        throw new AppError("Nội dung nhận xét chứa từ ngữ vi phạm quy định cộng đồng và đã bị từ chối.", 400);
      }
    }

    // Luồng 6, 7 & 8: Lưu đánh giá và tính lại điểm uy tín trong Transaction
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const danhGia = await this.danhGiaRepo.create(
        {
          hoatDongId,
          nguoiDanhGiaId,
          nguoiDuocDanhGiaId,
          nhanXet: data.nhanXet === undefined || data.nhanXet === null ? null : data.nhanXet,
          diemTong: data.diemTong === undefined || data.diemTong === null ? null : data.diemTong,
        },
        client,
      );

      if (data.chiTiet && data.chiTiet.length > 0) {
        for (const ct of data.chiTiet) {
          await this.chiTietRepo.create(
            {
              danhGiaId: danhGia.danhGiaId!,
              tieuChiDanhGiaId: ct.tieuChiDanhGiaId,
              diem: ct.diem,
            },
            client,
          );
        }
      }

      // Cập nhật điểm uy tín dựa trên điểm số
      const score = data.diemTong || 5;
      const diemThayDoi = Math.round((score / 5) * 10 - 5);
      const updatedDiem = await this.diemUyTinRepo.updateDiem(nguoiDuocDanhGiaId, diemThayDoi, client);

      if (updatedDiem) {
        await this.lichSuRepo.create(
          {
            diemUyTinId: updatedDiem.diemUyTinId!,
            diemThayDoi,
            lyDoThayDoi: `Nhận đánh giá ${score}/5★ từ hoạt động #${hoatDongId}`,
          },
          client,
        );
      }

      await client.query("COMMIT");

      // Gửi thông báo cho người nhận đánh giá
      await this.thongBaoRepo.create({
        nguoiNhanId: nguoiDuocDanhGiaId,
        tieuDe: "Bạn có 1 đánh giá mới",
        noiDung: `Bạn vừa nhận được đánh giá ${score}/5★ từ hoạt động "${activity.tenHoatDong}".`,
        loaiThongBao: "DANH_GIA",
      });

      return {
        ...danhGia,
        diemThayDoi,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  // Luồng 1: Gửi yêu cầu đánh giá sau hoạt động
  async sendReviewRequestNotification(hoatDongId: number): Promise<void> {
    const activity = await this.hoatDongRepo.findById(hoatDongId);
    if (!activity) return;

    const membersRes = await pool.query(
      `SELECT tv.nguoi_dung_id
       FROM thanh_vien_hoat_dong tv
       JOIN xac_nhan_tham_du xnt ON tv.thanh_vien_id = xnt.thanh_vien_id
       WHERE tv.hoat_dong_id = $1 AND (xnt.trang_thai_tham_du = 'DA_DIEM_DANH' OR xnt.trang_thai_tham_du = 'DA_CHECKIN')`,
      [hoatDongId]
    );

    for (const row of membersRes.rows) {
      await this.thongBaoRepo.create({
        nguoiNhanId: row.nguoi_dung_id,
        tieuDe: `⭐ Đánh giá sau hoạt động: ${activity.tenHoatDong}`,
        noiDung: `Hoạt động "${activity.tenHoatDong}" đã kết thúc. Hãy gửi đánh giá cho những người cùng tham gia để tích lũy điểm uy tín!`,
        loaiThongBao: "YEU_CAU_DANH_GIA",
      });
    }
  }

  // ==================== XEM ĐÁNH GIÁ ====================

  async getReviewsByActivity(hoatDongId: number): Promise<any[]> {
    return await this.danhGiaRepo.findByHoatDongId(hoatDongId);
  }

  async getReviewsForUser(nguoiDuocDanhGiaId: number): Promise<any[]> {
    return await this.danhGiaRepo.findByNguoiDuocDanhGia(nguoiDuocDanhGiaId);
  }

  async getReviewDetail(danhGiaId: number): Promise<any> {
    const danhGia = await this.danhGiaRepo.findById(danhGiaId);
    if (!danhGia) {
      throw new NotFoundError("Đánh giá không tồn tại.");
    }

    const chiTiet = await this.chiTietRepo.findByDanhGiaId(danhGiaId);
    return { ...danhGia, chiTiet };
  }

  // ==================== TIÊU CHÍ ĐÁNH GIÁ ====================

  async getAllTieuChi(): Promise<any[]> {
    return await this.tieuChiRepo.findAll();
  }

  // ==================== XEM ĐIỂM UY TÍN NÂNG CAO ====================

  async getReputation(targetUserId: number, requesterId?: number): Promise<any> {
    // 1. Luồng 2a: Kiểm tra quyền riêng tư hồ sơ
    const profileRes = await pool.query(
      `SELECT quyen_rieng_tu FROM ho_so_nguoi_dung WHERE nguoi_dung_id = $1`,
      [targetUserId]
    ).catch(() => ({ rows: [] }));

    const isPrivate = profileRes.rows.length > 0 && profileRes.rows[0].quyen_rieng_tu === 'PRIVATE';
    if (isPrivate && requesterId && requesterId !== targetUserId) {
      return {
        isPrivate: true,
        message: "Hồ sơ này bị giới hạn quyền xem theo thiết lập quyền riêng tư của người dùng.",
      };
    }

    // 2. Tải bản ghi điểm uy tín
    let diemRecord = await this.diemUyTinRepo.findByNguoiDungId(targetUserId);
    if (!diemRecord) {
      diemRecord = await this.diemUyTinRepo.findOrCreate(targetUserId);
    }

    // Đếm số lượng đánh giá thực tế và điểm trung bình
    const countRes = await pool.query(
      `SELECT COUNT(*) AS total, AVG(diem_tong) AS avg_score FROM danh_gia WHERE nguoi_duoc_danh_gia_id = $1`,
      [targetUserId]
    );
    const reviewCount = parseInt(countRes.rows[0].total || '0', 10);
    const avgScore = countRes.rows[0].avg_score ? parseFloat(countRes.rows[0].avg_score).toFixed(1) : null;

    // 3. Luồng 3b: Điểm uy tín đang được xem xét do khiếu nại hoặc kiểm duyệt
    const reportCheck = await pool.query(
      `SELECT COUNT(*) AS total FROM bao_cao_vi_pham WHERE nguoi_bi_bao_cao_id = $1 AND trang_thai = 'CHO_XU_LY'`,
      [targetUserId]
    ).catch(() => ({ rows: [{ total: '0' }] }));

    const isUnderReview = parseInt(reportCheck.rows[0]?.total || '0', 10) >= 3;
    if (isUnderReview) {
      return {
        ...diemRecord,
        reviewCount,
        avgScore,
        status: 'DANG_KIEM_DUYET',
        rankLabel: 'Đang xem xét khiếu nại',
        message: 'Điểm uy tín đang được hệ thống xem xét do có khiếu nại hoặc kiểm duyệt (tạm thời không sử dụng để xếp hạng).',
      };
    }

    // 4. Luồng 3a: Chưa đủ số lượng đánh giá (< 3 lượt)
    if (reviewCount < 3) {
      return {
        ...diemRecord,
        reviewCount,
        avgScore,
        status: 'CHUA_DU_DU_LIEU',
        rankLabel: 'Chưa đủ dữ liệu',
        message: 'Hồ sơ chưa có đủ số lượng đánh giá (tối thiểu 3 lượt) để tính điểm uy tín chính thức.',
      };
    }

    // 5. Luồng 4: Tính mức xếp hạng và cảnh báo công khai
    const score = diemRecord.diemHienTai ?? 100;
    let rankLabel = 'Uy tín tốt';
    if (score >= 90) rankLabel = 'Rất uy tín (Xuất sắc)';
    else if (score >= 70) rankLabel = 'Uy tín tốt';
    else if (score >= 50) rankLabel = 'Uy tín trung bình';
    else rankLabel = 'Cần cải thiện (Điểm thấp)';

    let canhBaoCongKhai = null;
    if ((diemRecord.soLanCanhBao ?? 0) > 0) {
      canhBaoCongKhai = `Tài khoản đã nhận ${diemRecord.soLanCanhBao} lần cảnh báo vi phạm quy định cộng đồng.`;
    }

    // Thống kê chi tiết từng tiêu chí
    const criteriaBreakdown = await pool.query(
      `SELECT tc.ten_tieu_chi AS "tenTieuChi", ROUND(AVG(ct.diem)::numeric, 1) AS "diemTrungBinh"
       FROM chi_tiet_danh_gia ct
       JOIN danh_gia dg ON ct.danh_gia_id = dg.danh_gia_id
       JOIN tieu_chi_danh_gia tc ON ct.tieu_chi_danh_gia_id = tc.tieu_chi_danh_gia_id
       WHERE dg.nguoi_duoc_danh_gia_id = $1
       GROUP BY tc.tieu_chi_danh_gia_id, tc.ten_tieu_chi`,
      [targetUserId]
    ).catch(() => ({ rows: [] }));

    return {
      ...diemRecord,
      reviewCount,
      avgScore,
      status: 'HOAN_THANH',
      rankLabel,
      canhBaoCongKhai,
      criteriaBreakdown: criteriaBreakdown.rows,
    };
  }

  async getReputationHistory(nguoiDungId: number): Promise<any[]> {
    return await this.lichSuRepo.findByNguoiDungId(nguoiDungId);
  }

  // ==================== PHẢN HỒI ĐÁNH GIÁ ====================

  async replyToReview(danhGiaId: number, currentUserId: number, noiDungPhanHoi: string): Promise<any> {
    const review = await this.danhGiaRepo.findById(danhGiaId);
    if (!review) {
      throw new NotFoundError("Đánh giá không tồn tại.");
    }

    // Luồng 5a: Người dùng không phải là đối tượng của đánh giá
    if (review.nguoiDuocDanhGiaId !== currentUserId) {
      throw new ForbiddenError("Bạn không phải là đối tượng của đánh giá này nên không có quyền phản hồi.");
    }

    // Luồng 5b: Đánh giá đã bị ẩn hoặc đang ở trạng thái chờ kiểm duyệt
    if (review.trangThai === 'DA_AN' || review.trangThai === 'DANG_KIEM_DUYET') {
      throw new BadRequestError("Đánh giá này đã bị ẩn hoặc đang ở trạng thái chờ kiểm duyệt nên không thể phản hồi.");
    }

    // Luồng 5c: Đánh giá đã có phản hồi từ trước (chính sách 1 phản hồi)
    if (review.phanHoi && review.phanHoi.trim().length > 0) {
      throw new ConflictError("Đánh giá này đã có phản hồi từ trước. Mỗi đánh giá chỉ cho phép một phản hồi duy nhất.");
    }

    if (!noiDungPhanHoi || noiDungPhanHoi.trim().length === 0) {
      throw new BadRequestError("Nội dung phản hồi không được để trống.");
    }

    // Luồng 5d: Nội dung phản hồi có dấu hiệu vi phạm quy định
    const lowerContent = noiDungPhanHoi.toLowerCase();
    const hasBannedWord = BANNED_KEYWORDS.some((kw) => lowerContent.includes(kw));
    if (hasBannedWord) {
      throw new BadRequestError("Nội dung phản hồi có chứa từ ngữ vi phạm quy định cộng đồng và đã bị từ chối.");
    }

    // Luồng 6: Lưu phản hồi gắn với đánh giá
    const updated = await this.danhGiaRepo.updateReply(danhGiaId, noiDungPhanHoi.trim());

    // Luồng 7: Thông báo cho người đánh giá
    const activity = await this.hoatDongRepo.findById(review.hoatDongId);
    const revieweeNameRes = await pool.query("SELECT ho_ten FROM nguoi_dung WHERE nguoi_dung_id = $1", [currentUserId]);
    const revieweeName = revieweeNameRes.rows[0]?.ho_ten || `Thành viên #${currentUserId}`;

    await this.thongBaoRepo.create({
      nguoiNhanId: review.nguoiDanhGiaId,
      tieuDe: "Phản hồi đánh giá mới",
      noiDung: `${revieweeName} vừa phản hồi đánh giá của bạn trong hoạt động "${activity?.tenHoatDong || ''}": "${noiDungPhanHoi.trim().slice(0, 50)}..."`,
      loaiThongBao: "PHAN_HOI_DANH_GIA",
    });

    return updated;
  }
}
