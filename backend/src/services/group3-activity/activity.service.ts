import { HoatDongRepository } from "../../repositories/group3-activity/hoatDong.repository";
import { DanhMucHoatDongRepository } from "../../repositories/group3-activity/danhMucHoatDong.repository";
import { DiaDiemRepository } from "../../repositories/group3-activity/diaDiem.repository";
import { HinhAnhHoatDongRepository } from "../../repositories/group3-activity/hinhAnhHoatDong.repository";
import { HoatDongModel } from "../../models/group3-activity/hoatDong.model";

export class ActivityService {
  private hoatDongRepo = new HoatDongRepository();
  private danhMucRepo = new DanhMucHoatDongRepository();
  private diaDiemRepo = new DiaDiemRepository();
  private hinhAnhRepo = new HinhAnhHoatDongRepository();

  // ==================== ACTIVITIES ====================

  async createActivity(nguoiToChucId: number, data: any): Promise<any> {
    const hoatDongModel = new HoatDongModel({
      ...data,
      nguoiToChucId,
    });

    const thoiGianBatDau = hoatDongModel.thoiGianBatDau
      ? new Date(hoatDongModel.thoiGianBatDau)
      : null;
    const thoiGianKetThuc = hoatDongModel.thoiGianKetThuc
      ? new Date(hoatDongModel.thoiGianKetThuc)
      : null;

    return await this.hoatDongRepo.create({
      ...data,
      nguoiToChucId,
      thoiGianBatDau,
      thoiGianKetThuc,
    });
  }

  async getAllActivities(): Promise<any[]> {
    return await this.hoatDongRepo.findAll();
  }

  async getActivityById(id: number): Promise<any> {
    const activity = await this.hoatDongRepo.findById(id);
    if (!activity) {
      throw new Error("Hoạt động không tồn tại.");
    }

    const images = await this.hinhAnhRepo.findByHoatDongId(id);
    return { ...activity, hinhAnh: images };
  }

  async updateActivity(id: number, data: any): Promise<any> {
    const existing = await this.hoatDongRepo.findById(id);
    if (!existing) {
      throw new Error("Hoạt động không tồn tại.");
    }

    const updated = await this.hoatDongRepo.update(id, {
      ...data,
      thoiGianBatDau: data.thoiGianBatDau ? new Date(data.thoiGianBatDau) : existing.thoiGianBatDau,
      thoiGianKetThuc: data.thoiGianKetThuc ? new Date(data.thoiGianKetThuc) : existing.thoiGianKetThuc,
    });

    return updated;
  }

  async deleteActivity(id: number): Promise<void> {
    const existing = await this.hoatDongRepo.findById(id);
    if (!existing) {
      throw new Error("Hoạt động không tồn tại.");
    }
    await this.hoatDongRepo.delete(id);
  }

  // ==================== CATEGORIES ====================

  async getAllCategories(): Promise<any[]> {
    return await this.danhMucRepo.findAll();
  }

  async createCategory(data: any): Promise<any> {
    return await this.danhMucRepo.create(data);
  }

  async updateCategory(id: number, data: any): Promise<any> {
    const existing = await this.danhMucRepo.findById(id);
    if (!existing) {
      throw new Error("Danh mục không tồn tại.");
    }
    return await this.danhMucRepo.update(id, data);
  }

  async deleteCategory(id: number): Promise<void> {
    const existing = await this.danhMucRepo.findById(id);
    if (!existing) {
      throw new Error("Danh mục không tồn tại.");
    }
    await this.danhMucRepo.delete(id);
  }

  // ==================== LOCATIONS ====================

  async getAllLocations(): Promise<any[]> {
    return await this.diaDiemRepo.findAll();
  }

  async createLocation(data: any): Promise<any> {
    return await this.diaDiemRepo.create(data);
  }

  async updateLocation(id: number, data: any): Promise<any> {
    const existing = await this.diaDiemRepo.findById(id);
    if (!existing) {
      throw new Error("Địa điểm không tồn tại.");
    }
    return await this.diaDiemRepo.update(id, data);
  }

  async deleteLocation(id: number): Promise<void> {
    const existing = await this.diaDiemRepo.findById(id);
    if (!existing) {
      throw new Error("Địa điểm không tồn tại.");
    }
    await this.diaDiemRepo.delete(id);
  }

  // ==================== IMAGES ====================

  async addImage(hoatDongId: number, data: any): Promise<any> {
    const activity = await this.hoatDongRepo.findById(hoatDongId);
    if (!activity) {
      throw new Error("Hoạt động không tồn tại.");
    }
    return await this.hinhAnhRepo.create({ ...data, hoatDongId });
  }

  async deleteImage(id: number): Promise<void> {
    const image = await this.hinhAnhRepo.findById(id);
    if (!image) {
      throw new Error("Hình ảnh không tồn tại.");
    }
    await this.hinhAnhRepo.delete(id);
  }
}
