import { BaoCaoViPhamRepository } from "../../repositories/group6-admin/baoCaoViPham.repository";
import { LoaiViPhamRepository } from "../../repositories/group6-admin/loaiViPham.repository";
import { BangChungViPhamRepository } from "../../repositories/group6-admin/bangChungViPham.repository";
import { QuyetDinhXuLyRepository } from "../../repositories/group6-admin/quyetDinhXuLy.repository";
import { DiemUyTinRepository } from "../../repositories/group5-review/diemUyTin.repository";
import { LichSuDiemUyTinRepository } from "../../repositories/group5-review/lichSuDiemUyTin.repository";
import { NhatKyQuanTriRepository } from "../../repositories/group6-admin/nhatKyQuanTri.repository";
import { ThongBaoRepository } from "../../repositories/group4-interaction/thongBao.repository";
import { NguoiDungRepository } from "../../repositories/group1-user/nguoiDung.repository";
import { pool } from "../../config/db";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../../utils/AppError";

const ALLOWED_EVIDENCE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "pdf"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export class ReportService {
  private baoCaoRepo = new BaoCaoViPhamRepository();
  private loaiViPhamRepo = new LoaiViPhamRepository();
  private bangChungRepo = new BangChungViPhamRepository();
  private quyetDinhRepo = new QuyetDinhXuLyRepository();
  private diemUyTinRepo = new DiemUyTinRepository();
  private lichSuRepo = new LichSuDiemUyTinRepository();
  private nhatKyRepo = new NhatKyQuanTriRepository();
  private thongBaoRepo = new ThongBaoRepository();
  private nguoiDungRepo = new NguoiDungRepository();

  // ==================== UC6.1: BÁO CÁO VI PHẠM ====================

  async createReport(
    nguoiBaoCaoId: number,
    data: {
      nguoiBiBaoCaoId: number;
      loaiViPhamId: number;
      noiDung?: string;
      bangChung?: Array<{ loaiBangChung?: string; duongDan: string; kichThuoc?: number }>;
    },
  ): Promise<any> {
    if (nguoiBaoCaoId === data.nguoiBiBaoCaoId) {
      throw new BadRequestError("Bạn không thể tự báo cáo chính mình.");
    }

    // Luồng 4a: Kiểm tra tính đầy đủ của thông tin bắt buộc
    if (!data.loaiViPhamId) {
      throw new BadRequestError("Vui lòng chọn loại vi phạm.");
    }
    if (!data.noiDung || data.noiDung.trim().length === 0) {
      throw new BadRequestError("Vui lòng nhập nội dung mô tả chi tiết vi phạm.");
    }

    // Kiểm tra loại vi phạm tồn tại
    const loaiViPham = await this.loaiViPhamRepo.findById(data.loaiViPhamId);
    if (!loaiViPham) {
      throw new NotFoundError("Loại vi phạm chọn không tồn tại.");
    }

    // Luồng 4b: Kiểm tra định dạng và kích thước tệp bằng chứng
    if (data.bangChung && data.bangChung.length > 0) {
      for (const bc of data.bangChung) {
        if (!bc.duongDan) continue;
        const lowerUrl = bc.duongDan.toLowerCase();
        const isBase64 = lowerUrl.startsWith("data:");

        let isExtensionValid = false;
        if (isBase64) {
          isExtensionValid = ALLOWED_EVIDENCE_EXTENSIONS.some((ext) =>
            lowerUrl.includes(`image/${ext}`) || lowerUrl.includes(`application/${ext}`)
          );
          // Check size of base64
          if (bc.duongDan.length > MAX_FILE_SIZE_BYTES * 1.37) {
            throw new BadRequestError("Tệp bằng chứng đính kèm vượt quá kích thước tối đa 5MB.");
          }
        } else {
          isExtensionValid = ALLOWED_EVIDENCE_EXTENSIONS.some((ext) =>
            lowerUrl.endsWith(`.${ext}`) || lowerUrl.includes(`.${ext}?`)
          );
        }

        if (bc.kichThuoc && bc.kichThuoc > MAX_FILE_SIZE_BYTES) {
          throw new BadRequestError("Tệp bằng chứng đính kèm vượt quá kích thước tối đa 5MB.");
        }

        if (!isExtensionValid && !isBase64) {
          throw new BadRequestError("Tệp bằng chứng không đúng định dạng hợp lệ (chỉ chấp nhận JPG, PNG, WebP, PDF).");
        }
      }
    }

    // Luồng 5b: Đối tượng bị báo cáo không còn tồn tại -> Lưu thông tin tham chiếu
    let finalTargetUserId: number | null = data.nguoiBiBaoCaoId;
    let finalNoiDung = data.noiDung.trim();

    const reportedUser = await this.nguoiDungRepo.findById(data.nguoiBiBaoCaoId);
    if (!reportedUser) {
      finalTargetUserId = null;
      finalNoiDung = `[Hệ thống: Đối tượng bị báo cáo (ID #${data.nguoiBiBaoCaoId}) không còn tồn tại trong hệ thống. Thông tin tham chiếu đã được ghi nhận để phục vụ điều tra]. Nội dung: ${finalNoiDung}`;
    }

    // Luồng 5a: Kiểm tra báo cáo trùng lặp trong thời gian ngắn (10 phút)
    if (finalTargetUserId) {
      const duplicateCheck = await pool.query(
        `SELECT bao_cao_id FROM bao_cao_vi_pham
         WHERE nguoi_bao_cao_id = $1 AND nguoi_bi_bao_cao_id = $2
         AND thoi_gian_tao > NOW() - INTERVAL '10 minutes'
         LIMIT 1`,
        [nguoiBaoCaoId, finalTargetUserId]
      ).catch(() => ({ rows: [] }));

      if (duplicateCheck.rows.length > 0) {
        throw new ConflictError("Bạn vừa gửi báo cáo đối tượng này trong vòng 10 phút qua. Báo cáo mới đã được tự động liên kết với báo cáo trước đó.");
      }
    }

    // Luồng 5 & 6: Tạo báo cáo và đưa vào danh sách chờ xử lý (CHO_XU_LY)
    const baoCao = await this.baoCaoRepo.create({
      nguoiBaoCaoId,
      nguoiBiBaoCaoId: finalTargetUserId ?? null,
      loaiViPhamId: data.loaiViPhamId,
      noiDung: finalNoiDung,
    });

    // Lưu các tệp bằng chứng đính kèm
    if (data.bangChung && data.bangChung.length > 0) {
      for (const bc of data.bangChung) {
        await this.bangChungRepo.create({
          baoCaoId: baoCao.baoCaoId!,
          loaiBangChung: bc.loaiBangChung || "HÌNH_ẢNH",
          duongDan: bc.duongDan,
        });
      }
    }

    // Luồng 7: Thông báo hệ thống đã tiếp nhận báo cáo thành công
    await this.thongBaoRepo.create({
      nguoiNhanId: nguoiBaoCaoId,
      tieuDe: "Đã tiếp nhận báo cáo vi phạm",
      noiDung: `Hệ thống đã tiếp nhận báo cáo vi phạm của bạn (#${baoCao.baoCaoId}). Ban quản trị sẽ tiến hành xác minh và phản hồi trong thời gian sớm nhất.`,
      loaiThongBao: "TIEP_NHAN_BAO_CAO",
    });

    return baoCao;
  }

  // ==================== XEM DANH SÁCH VI PHẠM ====================

  async getReports(trangThai?: string): Promise<any[]> {
    return await this.baoCaoRepo.findAll(trangThai);
  }

  async getReportById(baoCaoId: number): Promise<any> {
    const baoCao = await this.baoCaoRepo.findById(baoCaoId);
    if (!baoCao) {
      throw new NotFoundError("Báo cáo không tồn tại.");
    }

    const bangChung = await this.bangChungRepo.findByBaoCaoId(baoCaoId);
    const quyetDinh = await this.quyetDinhRepo.findByBaoCaoId(baoCaoId);

    return { ...baoCao, bangChung, quyetDinh };
  }

  // ==================== UC6.2: XỬ LÝ BÁO CÁO ====================

  async processReport(
    baoCaoId: number,
    nguoiXuLyId: number,
    data: { ketQua: string; truDiem?: boolean },
  ): Promise<any> {
    const baoCao = await this.baoCaoRepo.findById(baoCaoId);
    if (!baoCao) {
      throw new NotFoundError("Báo cáo không tồn tại.");
    }

    const existingDecision = await this.quyetDinhRepo.findByBaoCaoId(baoCaoId);
    if (existingDecision) {
      throw new ConflictError("Báo cáo này đã được xử lý trước đó.");
    }

    const quyetDinh = await this.quyetDinhRepo.create({
      baoCaoId,
      nguoiXuLyId,
      ketQua: data.ketQua,
    });

    if (data.truDiem && baoCao.nguoiBiBaoCaoId) {
      const updatedDiem = await this.diemUyTinRepo.tangSoLanCanhBao(
        baoCao.nguoiBiBaoCaoId,
      );
      if (updatedDiem) {
        const diemUyTinId = updatedDiem.diemUyTinId!;
        await this.lichSuRepo.create({
          diemUyTinId,
          diemThayDoi: -20,
          lyDoThayDoi: `Bị xử phạt từ báo cáo #${baoCaoId}`,
        });
      }

      await this.thongBaoRepo.create({
        nguoiNhanId: baoCao.nguoiBiBaoCaoId,
        tieuDe: "Đã bị xử lý vi phạm",
        noiDung: `Báo cáo vi phạm của bạn đã được xử lý: ${data.ketQua}.`,
        loaiThongBao: "XULYVIPHAM",
      });
    }

    await this.nhatKyRepo.create({
      nguoiQuanTriId: nguoiXuLyId,
      hanhDong: `XỬ_LÝ_BÁO_CÁO #${baoCaoId}: ${data.ketQua}`,
      doiTuongTacDong: `BaoCao_${baoCaoId}`,
    });

    return quyetDinh;
  }

  // ==================== LOẠI VI PHẠM ====================

  async getLoaiViPham(): Promise<any[]> {
    return await this.loaiViPhamRepo.findAll();
  }

  async createLoaiViPham(data: {
    tenLoai: string;
    moTa?: string;
    mucDo?: string;
  }): Promise<any> {
    return await this.loaiViPhamRepo.create(data);
  }

  // ==================== UC6.3: QUẢN LÝ VI PHẠM ====================

  async updateLoaiViPham(
    id: number,
    data: { tenLoai?: string; moTa?: string; mucDo?: string },
  ): Promise<any> {
    const existing = await this.loaiViPhamRepo.findById(id);
    if (!existing) {
      throw new NotFoundError("Loại vi phạm không tồn tại.");
    }
    return await this.loaiViPhamRepo.update(id, data);
  }

  async deleteLoaiViPham(id: number): Promise<void> {
    const existing = await this.loaiViPhamRepo.findById(id);
    if (!existing) {
      throw new NotFoundError("Loại vi phạm không tồn tại.");
    }
    await this.loaiViPhamRepo.delete(id);
  }

  async getViolationStats(): Promise<any> {
    const stats = await this.loaiViPhamRepo.getStats();
    const totalReports = stats.reduce(
      (sum: number, item: any) => sum + item.soLuongBaoCao,
      0,
    );
    return { total: totalReports, details: stats };
  }
}
