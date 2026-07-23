import { HoatDongRepository } from "../../repositories/group3-activity/hoatDong.repository";
import { LichSuTimKiemRepository } from "../../repositories/group4-interaction/lichSuTimKiem.repository";

export class SearchService {
  private hoatDongRepo = new HoatDongRepository();
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
      tuKhoaTimKiem: filters.keyword ?? null,
      boLocTimKiem: Object.keys(boLoc).length > 0 ? JSON.stringify(boLoc) : null,
    });

    return await this.hoatDongRepo.search(filters);
  }

  async getSearchHistory(nguoiDungId: number): Promise<any[]> {
    return await this.lichSuRepo.findByNguoiDungId(nguoiDungId);
  }

  async clearSearchHistory(nguoiDungId: number): Promise<void> {
    await this.lichSuRepo.deleteByNguoiDungId(nguoiDungId);
  }
}
