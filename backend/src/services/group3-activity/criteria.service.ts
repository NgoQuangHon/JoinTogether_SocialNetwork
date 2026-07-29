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
    const activity = await this.checkActivityModifiable(hoatDongId);

    const model = new TieuChiThamGiaModel({ ...data, hoatDongId });

    if (model.batBuoc && (!model.giaTriYeuCau || !model.giaTriYeuCau.trim())) {
      throw new BadRequestError("Tiêu chí bắt buộc phải có giá trị yêu cầu.");
    }

    await this.checkDuplicate(hoatDongId, model.tenTieuChi);

    const hasRequests = await this.checkActiveRequests(hoatDongId);
    if (hasRequests) {
      console.warn(`[CRITERIA] Activity ${hoatDongId} has pending requests — criteria added while requests exist`);
    }

    return await this.tieuChiRepo.create({
      hoatDongId: model.hoatDongId,
      tenTieuChi: model.tenTieuChi,
      giaTriYeuCau: model.giaTriYeuCau === undefined || model.giaTriYeuCau === null ? null : model.giaTriYeuCau,
      batBuoc: model.batBuoc === undefined || model.batBuoc === null ? false : model.batBuoc,
    });
  }

  async updateCriteria(id: number, data: any): Promise<any> {
    const existing = await this.tieuChiRepo.findById(id);
    if (!existing) {
      throw new NotFoundError("Tiêu chí không tồn tại.");
    }

    await this.checkActivityModifiable(existing.hoatDongId);

    const tenTieuChi = data.tenTieuChi !== undefined ? data.tenTieuChi : existing.tenTieuChi;
    const batBuoc = data.batBuoc !== undefined ? data.batBuoc : existing.batBuoc;
    const giaTriYeuCau = data.giaTriYeuCau !== undefined ? data.giaTriYeuCau : existing.giaTriYeuCau;

    if (batBuoc && (!giaTriYeuCau || !giaTriYeuCau.trim())) {
      throw new BadRequestError("Tiêu chí bắt buộc phải có giá trị yêu cầu.");
    }

    await this.checkDuplicate(existing.hoatDongId, tenTieuChi, id);

    const hasRequests = await this.checkActiveRequests(existing.hoatDongId);
    if (hasRequests) {
      console.warn(`[CRITERIA] Activity ${existing.hoatDongId} has pending requests — criteria #${id} updated while requests exist`);
    }

    return await this.tieuChiRepo.update(id, data);
  }

  async deleteCriteria(id: number): Promise<void> {
    const existing = await this.tieuChiRepo.findById(id);
    if (!existing) {
      throw new NotFoundError("Tiêu chí không tồn tại.");
    }

    await this.checkActivityModifiable(existing.hoatDongId);

    const hasRequests = await this.checkActiveRequests(existing.hoatDongId);
    if (hasRequests) {
      console.warn(`[CRITERIA] Activity ${existing.hoatDongId} has pending requests — criteria #${id} deleted while requests exist`);
    }

    await this.tieuChiRepo.delete(id);
  }
}
