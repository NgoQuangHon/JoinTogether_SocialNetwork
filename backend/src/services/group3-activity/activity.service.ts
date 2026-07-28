import { pool } from "../../config/db";
import { HoatDongRepository } from "../../repositories/group3-activity/hoatDong.repository";
import { DanhMucHoatDongRepository } from "../../repositories/group3-activity/danhMucHoatDong.repository";
import { DiaDiemRepository } from "../../repositories/group3-activity/diaDiem.repository";
import { HinhAnhHoatDongRepository } from "../../repositories/group3-activity/hinhAnhHoatDong.repository";
import { TieuChiThamGiaRepository } from "../../repositories/group3-activity/tieuChiThamGia.repository";
import { HoatDongModel } from "../../models/group3-activity/hoatDong.model";
import { DanhMucHoatDongModel } from "../../models/group3-activity/danhMucHoatDong.model";
import { DiaDiemModel } from "../../models/group3-activity/diaDiem.model";
import { HinhAnhHoatDongModel } from "../../models/group3-activity/hinhAnhHoatDong.model";
import { NotFoundError } from "../../utils/AppError";

export class ActivityService {
  private hoatDongRepo = new HoatDongRepository();
  private danhMucRepo = new DanhMucHoatDongRepository();
  private diaDiemRepo = new DiaDiemRepository();
  private hinhAnhRepo = new HinhAnhHoatDongRepository();
  private tieuChiRepo = new TieuChiThamGiaRepository();

  // ==================== ACTIVITIES ====================

  async getFeaturedActivities(): Promise<any[]> {
    const activities = await this.hoatDongRepo.findFeatured();
    for (const activity of activities) {
      const images = await this.hinhAnhRepo.findByHoatDongId(activity.hoatDongId);
      activity.hinhAnh = images;
    }
    return activities;
  }

  async getMyActivities(nguoiDungId: number): Promise<any[]> {
    const activities = await this.hoatDongRepo.findByNguoiToChucId(nguoiDungId);
    for (const activity of activities) {
      const images = await this.hinhAnhRepo.findByHoatDongId(activity.hoatDongId);
      activity.hinhAnh = images;
    }
    return activities;
  }

  async cancelActivity(id: number, nguoiDungId: number, lyDoHuy?: string): Promise<any> {
    const activity = await this.hoatDongRepo.findById(id);
    if (!activity) {
      throw new NotFoundError("Hoạt động không tồn tại.");
    }
    if (activity.nguoiToChucId !== nguoiDungId) {
      throw new Error("Bạn không có quyền hủy hoạt động này.");
    }
    return await this.hoatDongRepo.cancelActivity(id, lyDoHuy);
  }

  async createActivity(nguoiToChucId: number, data: any): Promise<any> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // 1. Create location if provided
      let diaDiemId = null;
      if (data.tenDiaDiem || data.diaChi) {
        const location = await this.diaDiemRepo.create({
          tenDiaDiem: data.tenDiaDiem || null,
          diaChi: data.diaChi || null,
          hinhThuc: data.hinhThuc || null,
          duongDanTrucTuyen: null,
        });
        diaDiemId = location.diaDiemId;
      }

      // 2. Create activity
      const payload = HoatDongModel.createHoatDongPayload({ ...data, nguoiToChucId, diaDiemId });
      const activity = await this.hoatDongRepo.create({
        ...payload,
        thoiGianBatDau: payload.thoiGianBatDau ? new Date(payload.thoiGianBatDau) : null,
        thoiGianKetThuc: payload.thoiGianKetThuc ? new Date(payload.thoiGianKetThuc) : null,
      });

      const hoatDongId = activity.hoatDongId!;

      if (data.thumbnail) {
        await this.hinhAnhRepo.create({
          hoatDongId: hoatDongId,
          duongDan: data.thumbnail,
          moTa: "Ảnh đại diện",
          laAnhDaiDien: true,
        });
      }

      if (data.hinhAnh && Array.isArray(data.hinhAnh)) {
        for (const url of data.hinhAnh.slice(0, 5)) {
          await this.hinhAnhRepo.create({
            hoatDongId: hoatDongId,
            duongDan: url,
            moTa: null,
            laAnhDaiDien: false,
          });
        }
      }

      if (data.soLuongToiDa) {
        await this.tieuChiRepo.create({
          hoatDongId: hoatDongId,
          tenTieuChi: "Số lượng tối đa",
          giaTriYeuCau: String(data.soLuongToiDa),
          batBuoc: true,
        });
      }
      if (data.doTuoiTu || data.doTuoiDen) {
        await this.tieuChiRepo.create({
          hoatDongId: hoatDongId,
          tenTieuChi: "Độ tuổi phù hợp",
          giaTriYeuCau: `${data.doTuoiTu || 0} - ${data.doTuoiDen || 99}`,
          batBuoc: false,
        });
      }
      if (data.gioiTinhPhuHop) {
        await this.tieuChiRepo.create({
          hoatDongId: hoatDongId,
          tenTieuChi: "Giới tính phù hợp",
          giaTriYeuCau: data.gioiTinhPhuHop,
          batBuoc: false,
        });
      }
      if (data.mucDoKinhNghiem) {
        await this.tieuChiRepo.create({
          hoatDongId: hoatDongId,
          tenTieuChi: "Mức độ kinh nghiệm",
          giaTriYeuCau: data.mucDoKinhNghiem,
          batBuoc: false,
        });
      }
      if (data.yeuCauKhac) {
        await this.tieuChiRepo.create({
          hoatDongId: hoatDongId,
          tenTieuChi: "Yêu cầu khác",
          giaTriYeuCau: data.yeuCauKhac,
          batBuoc: false,
        });
      }

      await client.query("COMMIT");

      return await this.hoatDongRepo.findById(hoatDongId);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async getAllActivities(): Promise<any[]> {
    return await this.hoatDongRepo.findAll();
  }

  async getActivityById(id: number): Promise<any> {
    const activity = await this.hoatDongRepo.findById(id);
    if (!activity) {
      throw new NotFoundError("Hoạt động không tồn tại.");
    }

    const images = await this.hinhAnhRepo.findByHoatDongId(id);
    return { ...activity, hinhAnh: images };
  }

  async updateActivity(id: number, data: any): Promise<any> {
    const existing = await this.hoatDongRepo.findById(id);
    if (!existing) {
      throw new NotFoundError("Hoạt động không tồn tại.");
    }

    const { tenHoatDong, moTa, danhMucHoatDongId, diaDiemId, thoiGianBatDau, thoiGianKetThuc } = data;
    const updated = await this.hoatDongRepo.update(id, {
      tenHoatDong,
      moTa,
      danhMucHoatDongId,
      diaDiemId,
      thoiGianBatDau: thoiGianBatDau ? new Date(thoiGianBatDau) : existing.thoiGianBatDau,
      thoiGianKetThuc: thoiGianKetThuc ? new Date(thoiGianKetThuc) : existing.thoiGianKetThuc,
    });

    return updated;
  }

  async deleteActivity(id: number): Promise<void> {
    const existing = await this.hoatDongRepo.findById(id);
    if (!existing) {
      throw new NotFoundError("Hoạt động không tồn tại.");
    }
    await this.hoatDongRepo.delete(id);
  }

  // ==================== CATEGORIES ====================

  async getAllCategories(): Promise<any[]> {
    return await this.danhMucRepo.findAll();
  }

  async createCategory(data: any): Promise<any> {
    const payload = DanhMucHoatDongModel.createDanhMucHoatDongPayload(data);
    return await this.danhMucRepo.create(payload);
  }

  async updateCategory(id: number, data: any): Promise<any> {
    const existing = await this.danhMucRepo.findById(id);
    if (!existing) {
      throw new NotFoundError("Danh mục không tồn tại.");
    }
    return await this.danhMucRepo.update(id, data);
  }

  async deleteCategory(id: number): Promise<void> {
    const existing = await this.danhMucRepo.findById(id);
    if (!existing) {
      throw new NotFoundError("Danh mục không tồn tại.");
    }
    await this.danhMucRepo.delete(id);
  }

  // ==================== LOCATIONS ====================

  async getAllLocations(): Promise<any[]> {
    return await this.diaDiemRepo.findAll();
  }

  async createLocation(data: any): Promise<any> {
    const payload = DiaDiemModel.createDiaDiemPayload(data);
    return await this.diaDiemRepo.create(payload);
  }

  async updateLocation(id: number, data: any): Promise<any> {
    const existing = await this.diaDiemRepo.findById(id);
    if (!existing) {
      throw new NotFoundError("Địa điểm không tồn tại.");
    }
    return await this.diaDiemRepo.update(id, data);
  }

  async deleteLocation(id: number): Promise<void> {
    const existing = await this.diaDiemRepo.findById(id);
    if (!existing) {
      throw new NotFoundError("Địa điểm không tồn tại.");
    }
    await this.diaDiemRepo.delete(id);
  }

  // ==================== IMAGES ====================

  async addImage(hoatDongId: number, data: any): Promise<any> {
    const activity = await this.hoatDongRepo.findById(hoatDongId);
    if (!activity) {
      throw new NotFoundError("Hoạt động không tồn tại.");
    }
    const payload = HinhAnhHoatDongModel.createHinhAnhHoatDongPayload({ ...data, hoatDongId });
    return await this.hinhAnhRepo.create(payload);
  }

  async deleteImage(id: number): Promise<void> {
    const image = await this.hinhAnhRepo.findById(id);
    if (!image) {
      throw new NotFoundError("Hình ảnh không tồn tại.");
    }
    await this.hinhAnhRepo.delete(id);
  }
}
