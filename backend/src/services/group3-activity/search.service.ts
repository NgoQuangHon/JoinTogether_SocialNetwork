import { HoatDongRepository } from "../../repositories/group3-activity/hoatDong.repository";
import { ThanhVienHoatDongRepository } from "../../repositories/group3-activity/thanhVienHoatDong.repository";
import { YeuCauThamGiaRepository } from "../../repositories/group3-activity/yeuCauThamGia.repository";
import { LichSuTimKiemRepository } from "../../repositories/group4-interaction/lichSuTimKiem.repository";

export class SearchService {
  private hoatDongRepo = new HoatDongRepository();
  private thanhVienRepo = new ThanhVienHoatDongRepository();
  private yeuCauRepo = new YeuCauThamGiaRepository();
  private lichSuRepo = new LichSuTimKiemRepository();

  async searchActivities(
    nguoiDungId: number,
    filters: {
      keyword?: string;
      danhMucHoatDongId?: number;
      diaDiemId?: number;
      tuNgay?: string;
      denNgay?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<any> {
    // Save search history
    const boLoc: any = {};
    if (filters.danhMucHoatDongId) boLoc.danhMucHoatDongId = filters.danhMucHoatDongId;
    if (filters.diaDiemId) boLoc.diaDiemId = filters.diaDiemId;
    if (filters.tuNgay) boLoc.tuNgay = filters.tuNgay;
    if (filters.denNgay) boLoc.denNgay = filters.denNgay;

    await this.lichSuRepo.create({
      nguoiDungId,
      tuKhoaTimKiem: filters.keyword === undefined || filters.keyword === null ? null : filters.keyword,
      boLocTimKiem: Object.keys(boLoc).length > 0 ? JSON.stringify(boLoc) : null,
    });

    const result = await this.hoatDongRepo.search(filters);
    for (const activity of result.rows) {
      activity.isMember = await this.thanhVienRepo.isMember(nguoiDungId, activity.hoatDongId);
      const req = await this.yeuCauRepo.findExistingRequest(activity.hoatDongId, nguoiDungId);
      activity.trangThaiYeuCau = req?.trangThai || null;
    }
    return result;
  }

  async getSearchHistory(nguoiDungId: number): Promise<any[]> {
    return await this.lichSuRepo.findByNguoiDungId(nguoiDungId);
  }

  async clearSearchHistory(nguoiDungId: number): Promise<void> {
    await this.lichSuRepo.deleteByNguoiDungId(nguoiDungId);
  }
}
