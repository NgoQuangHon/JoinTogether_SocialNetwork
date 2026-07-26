import { BaoCaoViPhamRepository } from "../../repositories/group6-admin/baoCaoViPham.repository";
import { LoaiViPhamRepository } from "../../repositories/group6-admin/loaiViPham.repository";
import { BangChungViPhamRepository } from "../../repositories/group6-admin/bangChungViPham.repository";
import { QuyetDinhXuLyRepository } from "../../repositories/group6-admin/quyetDinhXuLy.repository";
import { DiemUyTinRepository } from "../../repositories/group5-review/diemUyTin.repository";
import { LichSuDiemUyTinRepository } from "../../repositories/group5-review/lichSuDiemUyTin.repository";
import { NhatKyQuanTriRepository } from "../../repositories/group6-admin/nhatKyQuanTri.repository";
import { ThongBaoRepository } from "../../repositories/group4-interaction/thongBao.repository";
import { NguoiDungRepository } from "../../repositories/group1-user/nguoiDung.repository";
import { BadRequestError, ConflictError, NotFoundError } from "../../utils/AppError";

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
      bangChung?: Array<{ loaiBangChung?: string; duongDan: string }>;
    },
  ): Promise<any> {
    if (nguoiBaoCaoId === data.nguoiBiBaoCaoId) {
      throw new BadRequestError("Không thể báo cáo chính mình.");
    }

    // Kiểm tra người bị báo cáo tồn tại
    const reportedUser = await this.nguoiDungRepo.findById(data.nguoiBiBaoCaoId);
    if (!reportedUser) {
      throw new NotFoundError("Người dùng bị báo cáo không tồn tại.");
    }

    // Kiểm tra loại vi phạm
    const loaiViPham = await this.loaiViPhamRepo.findById(data.loaiViPhamId);
    if (!loaiViPham) {
      throw new NotFoundError("Loại vi phạm không tồn tại.");
    }

    const baoCao = await this.baoCaoRepo.create({
      nguoiBaoCaoId,
      nguoiBiBaoCaoId: data.nguoiBiBaoCaoId,
      loaiViPhamId: data.loaiViPhamId,
      noiDung: data.noiDung === undefined || data.noiDung === null ? null : data.noiDung,
    });

    // Thêm bằng chứng nếu có
    if (data.bangChung && data.bangChung.length > 0) {
      for (const bc of data.bangChung) {
        await this.bangChungRepo.create({
          baoCaoId: baoCao.baoCaoId!,
          loaiBangChung: bc.loaiBangChung === undefined || bc.loaiBangChung === null ? null : bc.loaiBangChung,
          duongDan: bc.duongDan,
        });
      }
    }

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

    // Kiểm tra đã xử lý chưa
    const existingDecision = await this.quyetDinhRepo.findByBaoCaoId(baoCaoId);
    if (existingDecision) {
      throw new ConflictError("Báo cáo này đã được xử lý trước đó.");
    }

    // Tạo quyết định xử lý
    const quyetDinh = await this.quyetDinhRepo.create({
      baoCaoId,
      nguoiXuLyId,
      ketQua: data.ketQua,
    });

    // Trừ điểm uy tín nếu cần (hành vi vi phạm)
    if (data.truDiem && baoCao.nguoiBiBaoCaoId) {
      const updatedDiem = await this.diemUyTinRepo.tangSoLanCanhBao(baoCao.nguoiBiBaoCaoId);
      if (updatedDiem) {
        const diemUyTinId = updatedDiem.diemUyTinId!;
        await this.lichSuRepo.create({
          diemUyTinId,
          diemThayDoi: -20,
          lyDoThayDoi: `Bị xử phạt từ báo cáo #${baoCaoId}`,
        });
      }

      // Thông báo cho người bị xử lý
      await this.thongBaoRepo.create({
        nguoiNhanId: baoCao.nguoiBiBaoCaoId,
        tieuDe: "Đã bị xử lý vi phạm",
        noiDung: `Báo cáo vi phạm của bạn đã được xử lý: ${data.ketQua}.`,
        loaiThongBao: "XULYVIPHAM",
      });
    }

    // Ghi nhật ký quản trị
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

  async createLoaiViPham(data: { tenLoai: string; moTa?: string; mucDo?: string }): Promise<any> {
    return await this.loaiViPhamRepo.create(data);
  }

  // ==================== UC6.3: QUẢN LÝ VI PHẠM ====================

  async updateLoaiViPham(id: number, data: { tenLoai?: string; moTa?: string; mucDo?: string }): Promise<any> {
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
    const totalReports = stats.reduce((sum: number, item: any) => sum + item.soLuongBaoCao, 0);
    return { total: totalReports, details: stats };
  }
}

