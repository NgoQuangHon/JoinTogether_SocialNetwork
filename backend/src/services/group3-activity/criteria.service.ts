import { TieuChiThamGiaRepository } from "../../repositories/group3-activity/tieuChiThamGia.repository";
import { HoatDongRepository } from "../../repositories/group3-activity/hoatDong.repository";
import { TieuChiThamGiaModel } from "../../models/group3-activity/tieuChiThamGia.model";

export class CriteriaService {
  private tieuChiRepo = new TieuChiThamGiaRepository();
  private hoatDongRepo = new HoatDongRepository();

  async getCriteriaByActivity(hoatDongId: number): Promise<any[]> {
    const activity = await this.hoatDongRepo.findById(hoatDongId);
    if (!activity) {
      throw new Error("Hoạt động không tồn tại.");
    }
    return await this.tieuChiRepo.findByHoatDongId(hoatDongId);
  }

  async addCriteria(hoatDongId: number, data: any): Promise<any> {
    const activity = await this.hoatDongRepo.findById(hoatDongId);
    if (!activity) {
      throw new Error("Hoạt động không tồn tại.");
    }

    const model = new TieuChiThamGiaModel({ ...data, hoatDongId });
    return await this.tieuChiRepo.create({
      hoatDongId: model.hoatDongId,
      tenTieuChi: model.tenTieuChi,
      giaTriYeuCau: model.giaTriYeuCau ?? null,
      batBuoc: model.batBuoc ?? false,
    });
  }

  async updateCriteria(id: number, data: any): Promise<any> {
    const existing = await this.tieuChiRepo.findById(id);
    if (!existing) {
      throw new Error("Tiêu chí không tồn tại.");
    }

    return await this.tieuChiRepo.update(id, data);
  }

  async deleteCriteria(id: number): Promise<void> {
    const existing = await this.tieuChiRepo.findById(id);
    if (!existing) {
      throw new Error("Tiêu chí không tồn tại.");
    }
    await this.tieuChiRepo.delete(id);
  }
}
