import { pool } from "../../config/db";
import { TieuChiThamGiaRepository } from "../../repositories/group3-activity/tieuChiThamGia.repository";
import { HoatDongRepository } from "../../repositories/group3-activity/hoatDong.repository";
import { TieuChiThamGiaModel } from "../../models/group3-activity/tieuChiThamGia.model";
import { NotFoundError, BadRequestError, ForbiddenError } from "../../utils/AppError";

export class CriteriaService {
  private tieuChiRepo = new TieuChiThamGiaRepository();
  private hoatDongRepo = new HoatDongRepository();

  private async checkActivityModifiable(hoatDongId: number): Promise<any> {
    const activity = await this.hoatDongRepo.findById(hoatDongId);
    if (!activity) {
      throw new NotFoundError("Hoạt động không tồn tại.");
    }
    if (activity.trangThai === 'dang_dien_ra' || activity.trangThai === 'da_ket_thuc') {
      throw new ForbiddenError("Không thể thay đổi tiêu chí khi hoạt động đã bắt đầu hoặc đã kết thúc.");
    }
    if (activity.trangThai === 'da_huy') {
      throw new ForbiddenError("Không thể thay đổi tiêu chí khi hoạt động đã bị hủy.");
    }
    return activity;
  }

  private async checkDuplicate(hoatDongId: number, tenTieuChi: string, excludeId?: number): Promise<void> {
    const existing = await this.tieuChiRepo.findByHoatDongId(hoatDongId);
    const duplicate = existing.find(
      (c) => c.tenTieuChi.toLowerCase() === tenTieuChi.toLowerCase() && c.tieuChiId !== excludeId,
    );
    if (duplicate) {
      throw new BadRequestError(`Tiêu chí "${tenTieuChi}" đã tồn tại trong hoạt động này.`);
    }
  }

  private async checkActiveRequests(hoatDongId: number): Promise<boolean> {
    const result = await pool.query(
      `SELECT COUNT(*) AS cnt FROM yeu_cau_tham_gia WHERE hoat_dong_id = $1 AND trang_thai = 'dang_xu_ly'`,
      [hoatDongId],
    );
    return parseInt(result.rows[0].cnt, 10) > 0;
  }

  async getCriteriaByActivity(hoatDongId: number): Promise<any[]> {
    const activity = await this.hoatDongRepo.findById(hoatDongId);
    if (!activity) {
      throw new NotFoundError("Hoạt động không tồn tại.");
    }
    return await this.tieuChiRepo.findByHoatDongId(hoatDongId);
  }

  async addCriteria(hoatDongId: number, data: any): Promise<any> {
    await this.checkActivityModifiable(hoatDongId);

    const tenTieuChi = data.tenTieuChi ? data.tenTieuChi.trim() : '';
    if (!tenTieuChi) {
      throw new BadRequestError("Tên tiêu chí không được để trống.");
    }

    const batBuoc = Boolean(data.batBuoc);
    let giaTriYeuCau = data.giaTriYeuCau ? data.giaTriYeuCau.trim() : null;
    if (batBuoc && !giaTriYeuCau) {
      giaTriYeuCau = "Bắt buộc";
    }

    await this.checkDuplicate(hoatDongId, tenTieuChi);

    return await this.tieuChiRepo.create({
      hoatDongId,
      tenTieuChi,
      giaTriYeuCau,
      batBuoc,
    });
  }

  async updateCriteria(id: number, data: any): Promise<any> {
    const existing = await this.tieuChiRepo.findById(id);
    if (!existing) {
      throw new NotFoundError("Tiêu chí không tồn tại.");
    }

    await this.checkActivityModifiable(existing.hoatDongId);

    const tenTieuChi = data.tenTieuChi !== undefined ? data.tenTieuChi.trim() : existing.tenTieuChi;
    if (!tenTieuChi) {
      throw new BadRequestError("Tên tiêu chí không được để trống.");
    }

    const batBuocVal: boolean = data.batBuoc !== undefined ? Boolean(data.batBuoc) : (existing.batBuoc ?? true);
    let giaTriYeuCauVal: string | null = data.giaTriYeuCau !== undefined
      ? (data.giaTriYeuCau ? String(data.giaTriYeuCau).trim() : null)
      : (existing.giaTriYeuCau ?? null);

    if (batBuocVal && !giaTriYeuCauVal) {
      giaTriYeuCauVal = "Bắt buộc";
    }

    await this.checkDuplicate(existing.hoatDongId, tenTieuChi, id);

    return await this.tieuChiRepo.update(id, {
      tenTieuChi,
      giaTriYeuCau: giaTriYeuCauVal,
      batBuoc: batBuocVal,
    });
  }

  async deleteCriteria(id: number): Promise<void> {
    const existing = await this.tieuChiRepo.findById(id);
    if (!existing) {
      throw new NotFoundError("Tiêu chí không tồn tại.");
    }

    await this.checkActivityModifiable(existing.hoatDongId);
    await this.tieuChiRepo.delete(id);
  }
}
