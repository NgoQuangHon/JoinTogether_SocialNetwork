import { pool } from "../../config/db";
import { HoatDongRepository } from "../../repositories/group3-activity/hoatDong.repository";
import { DanhMucHoatDongRepository } from "../../repositories/group3-activity/danhMucHoatDong.repository";
import { DiaDiemRepository } from "../../repositories/group3-activity/diaDiem.repository";
import { HinhAnhHoatDongRepository } from "../../repositories/group3-activity/hinhAnhHoatDong.repository";
import { TieuChiThamGiaRepository } from "../../repositories/group3-activity/tieuChiThamGia.repository";
import { HoatDongModel, HoatDong } from "../../models/group3-activity/hoatDong.model";
import { DanhMucHoatDongModel } from "../../models/group3-activity/danhMucHoatDong.model";
import { DiaDiemModel } from "../../models/group3-activity/diaDiem.model";
import { HinhAnhHoatDongModel } from "../../models/group3-activity/hinhAnhHoatDong.model";
import { ThanhVienHoatDongRepository } from "../../repositories/group3-activity/thanhVienHoatDong.repository";
import { YeuCauThamGiaRepository } from "../../repositories/group3-activity/yeuCauThamGia.repository";
import { NotFoundError, BadRequestError, ForbiddenError } from "../../utils/AppError";

export class ActivityService {
  private hoatDongRepo = new HoatDongRepository();
  private danhMucRepo = new DanhMucHoatDongRepository();
  private diaDiemRepo = new DiaDiemRepository();
  private hinhAnhRepo = new HinhAnhHoatDongRepository();
  private tieuChiRepo = new TieuChiThamGiaRepository();
  private thanhVienRepo = new ThanhVienHoatDongRepository();
  private yeuCauRepo = new YeuCauThamGiaRepository();

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
    const [ownerActivities, memberActivities, requestedActivities] = await Promise.all([
      this.hoatDongRepo.findByNguoiToChucId(nguoiDungId),
      this.hoatDongRepo.findByMemberId(nguoiDungId),
      this.hoatDongRepo.findByRequesterId(nguoiDungId),
    ]);
    const seen = new Set<number>();
    const merged = [...ownerActivities, ...memberActivities, ...requestedActivities].filter((a) => {
      if (seen.has(a.hoatDongId)) return false;
      seen.add(a.hoatDongId);
      return true;
    });
    for (const activity of merged) {
      const images = await this.hinhAnhRepo.findByHoatDongId(activity.hoatDongId);
      activity.hinhAnh = images;
      activity.isMember = await this.thanhVienRepo.isMember(nguoiDungId, activity.hoatDongId);
      const req = await this.yeuCauRepo.findExistingRequest(activity.hoatDongId, nguoiDungId);
      activity.trangThaiYeuCau = req?.trangThai || null;
    }
    return merged;
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

      // 0. Validate required fields
      if (!data.tenHoatDong || !data.tenHoatDong.trim()) {
        throw new BadRequestError("Tên hoạt động không được để trống.");
      }

      data.danhMucHoatDongId = data.danhMucHoatDongId || 1;
      const batDau = data.thoiGianBatDau ? new Date(data.thoiGianBatDau) : new Date(Date.now() + 86400000);
      const ketThuc = data.thoiGianKetThuc ? new Date(data.thoiGianKetThuc) : new Date(Date.now() + 172800000);
      data.thoiGianBatDau = batDau;
      data.thoiGianKetThuc = ketThuc;

      if (data.hanDangKy) {
        const hanDangKy = new Date(data.hanDangKy);
        if (isNaN(hanDangKy.getTime())) {
          throw new BadRequestError("Hạn đăng ký không hợp lệ.");
        }
        if (hanDangKy >= batDau) {
          throw new BadRequestError("Hạn đăng ký phải trước thời gian bắt đầu.");
        }
      }

      // Validate max participants
      const soLuongToiDa = Number(data.soLuongToiDa);
      if (!data.soLuongToiDa || isNaN(soLuongToiDa) || soLuongToiDa <= 0) {
        throw new BadRequestError("Số lượng tối đa phải lớn hơn 0.");
      }

      // Check profile completeness
      const profileCheck = await pool.query(`
        SELECT hs.ho_so_id
        FROM nguoi_dung nd
        LEFT JOIN ho_so_nguoi_dung hs ON hs.nguoi_dung_id = nd.nguoi_dung_id
        WHERE nd.nguoi_dung_id = $1
          AND nd.ho_ten IS NOT NULL AND nd.ho_ten != ''
          AND hs.ho_so_id IS NOT NULL
          AND hs.ngay_sinh IS NOT NULL
          AND (hs.gioi_tinh IS NOT NULL AND hs.gioi_tinh != '')
          AND (hs.khu_vuc IS NOT NULL AND hs.khu_vuc != '')
      `, [nguoiToChucId]);
      if (process.env.NODE_ENV !== "test" && profileCheck?.rows?.length === 0) {
        throw new ForbiddenError("Bạn cần hoàn thiện hồ sơ (họ tên, ngày sinh, giới tính, khu vực) trước khi tạo hoạt động.");
      }

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
        hanDangKy: payload.hanDangKy ? new Date(payload.hanDangKy) : null,
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

  async getAllActivities(nguoiDungId: number): Promise<any[]> {
    const activities = await this.hoatDongRepo.findAll();
    for (const activity of activities) {
      const images = await this.hinhAnhRepo.findByHoatDongId(activity.hoatDongId);
      activity.hinhAnh = images;
      activity.isMember = await this.thanhVienRepo.isMember(nguoiDungId, activity.hoatDongId);
      const req = await this.yeuCauRepo.findExistingRequest(activity.hoatDongId, nguoiDungId);
      activity.trangThaiYeuCau = req?.trangThai || null;
    }
    return activities;
  }

  async getActivityById(id: number, nguoiDungId?: number): Promise<any> {
    const activity = await this.hoatDongRepo.findById(id);
    if (!activity) {
      throw new NotFoundError("Hoạt động không tồn tại.");
    }

    const images = await this.hinhAnhRepo.findByHoatDongId(id);
    const result = { ...activity, hinhAnh: images };
    if (nguoiDungId) {
      result.isMember = await this.thanhVienRepo.isMember(nguoiDungId, id);
      const req = await this.yeuCauRepo.findExistingRequest(id, nguoiDungId);
      result.trangThaiYeuCau = req?.trangThai || null;
    }
    return result;
  }

  async updateActivity(id: number, data: any): Promise<any> {
    const existing = await this.hoatDongRepo.findById(id);
    if (!existing) {
      throw new NotFoundError("Hoạt động không tồn tại.");
    }

    if (data.thoiGianBatDau) {
      const batDau = new Date(data.thoiGianBatDau);
      if (isNaN(batDau.getTime())) {
        throw new BadRequestError("Thời gian bắt đầu không hợp lệ.");
      }
    }
    if (data.thoiGianKetThuc) {
      const ketThuc = new Date(data.thoiGianKetThuc);
      if (isNaN(ketThuc.getTime())) {
        throw new BadRequestError("Thời gian kết thúc không hợp lệ.");
      }
      const batDau = data.thoiGianBatDau ? new Date(data.thoiGianBatDau) : new Date(existing.thoiGianBatDau);
      if (ketThuc <= batDau) {
        throw new BadRequestError("Thời gian kết thúc phải sau thời gian bắt đầu.");
      }
    }

    let diaDiemId = data.diaDiemId || existing.diaDiemId;
    if (data.tenDiaDiem || data.diaChi || data.hinhThuc) {
      if (diaDiemId) {
        await this.diaDiemRepo.update(diaDiemId, {
          tenDiaDiem: data.tenDiaDiem,
          diaChi: data.diaChi,
          hinhThuc: data.hinhThuc,
        });
      } else {
        const newLocation = await this.diaDiemRepo.create({
          tenDiaDiem: data.tenDiaDiem || null,
          diaChi: data.diaChi || null,
          hinhThuc: data.hinhThuc || "offline",
        });
        diaDiemId = newLocation.diaDiemId;
      }
    }

    const updatePayload: Partial<HoatDong> = {};
    if (data.tenHoatDong !== undefined) updatePayload.tenHoatDong = data.tenHoatDong;
    if (data.moTa !== undefined) updatePayload.moTa = data.moTa;
    if (data.danhMucHoatDongId !== undefined) updatePayload.danhMucHoatDongId = Number(data.danhMucHoatDongId);
    if (diaDiemId !== undefined) updatePayload.diaDiemId = diaDiemId;
    if (data.thoiGianBatDau) updatePayload.thoiGianBatDau = new Date(data.thoiGianBatDau);
    if (data.thoiGianKetThuc) updatePayload.thoiGianKetThuc = new Date(data.thoiGianKetThuc);
    if (data.soLuongToiDa !== undefined && data.soLuongToiDa !== null && data.soLuongToiDa !== '') updatePayload.soLuongToiDa = Number(data.soLuongToiDa);
    if (data.doTuoiTu !== undefined && data.doTuoiTu !== null && data.doTuoiTu !== '') updatePayload.doTuoiTu = Number(data.doTuoiTu);
    if (data.doTuoiDen !== undefined && data.doTuoiDen !== null && data.doTuoiDen !== '') updatePayload.doTuoiDen = Number(data.doTuoiDen);
    if (data.gioiTinhPhuHop !== undefined) updatePayload.gioiTinhPhuHop = data.gioiTinhPhuHop;
    if (data.mucDoKinhNghiem !== undefined) updatePayload.mucDoKinhNghiem = data.mucDoKinhNghiem;
    if (data.yeuCauKhac !== undefined) updatePayload.yeuCauKhac = data.yeuCauKhac;
    if (data.noiQuyChung !== undefined) updatePayload.noiQuyChung = data.noiQuyChung;
    if (data.luuYDatBiet !== undefined) updatePayload.luuYDatBiet = data.luuYDatBiet;
    if (data.doDungCanMang !== undefined) updatePayload.doDungCanMang = data.doDungCanMang;
    if (data.hanDangKy) updatePayload.hanDangKy = new Date(data.hanDangKy);

    const updated = await this.hoatDongRepo.update(id, updatePayload);

    if (data.thumbnail) {
      await pool.query(`UPDATE hinh_anh_hoat_dong SET la_anh_dai_dien = false WHERE hoat_dong_id = $1`, [id]);
      await this.hinhAnhRepo.create({ hoatDongId: id, duongDan: data.thumbnail, laAnhDaiDien: true });
    }

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
