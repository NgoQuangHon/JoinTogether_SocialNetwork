import { HoatDongRepository } from "../../repositories/group3-activity/hoatDong.repository";
import { ThanhVienHoatDongRepository } from "../../repositories/group3-activity/thanhVienHoatDong.repository";
import { YeuCauThamGiaRepository } from "../../repositories/group3-activity/yeuCauThamGia.repository";
import { LichSuTimKiemRepository } from "../../repositories/group4-interaction/lichSuTimKiem.repository";
import { pool } from "../../config/db";

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

  async searchUsers(currentUserId: number, keyword: string): Promise<any[]> {
    if (!keyword || !keyword.trim()) return [];

    const searchPattern = `%${keyword.trim()}%`;
    const query = `
      SELECT DISTINCT
        nd.nguoi_dung_id AS "nguoiDungId",
        nd.ho_ten AS "hoTen",
        nd.email,
        hs.anh_dai_dien AS "anhDaiDien",
        hs.khu_vuc AS "khuVuc",
        hs.tieu_su AS "tieuSu",
        COALESCE(
          (SELECT trang_thai FROM yeu_cau_ket_noi WHERE (nguoi_gui_id = $1 AND nguoi_nhan_id = nd.nguoi_dung_id) OR (nguoi_gui_id = nd.nguoi_dung_id AND nguoi_nhan_id = $1) ORDER BY yeu_cau_ket_noi_id DESC LIMIT 1),
          'NONE'
        ) AS "trangThaiYeuCau",
        EXISTS (
          SELECT 1 FROM quan_he_ket_noi WHERE ((nguoi_dung_id_1 = $1 AND nguoi_dung_id_2 = nd.nguoi_dung_id) OR (nguoi_dung_id_1 = nd.nguoi_dung_id AND nguoi_dung_id_2 = $1)) AND trang_thai = 'ACTIVE'
        ) AS "isFriend"
      FROM nguoi_dung nd
      LEFT JOIN ho_so_nguoi_dung hs ON nd.nguoi_dung_id = hs.nguoi_dung_id
      WHERE nd.nguoi_dung_id != $1
        AND (nd.ho_ten ILIKE $2 OR nd.email ILIKE $2 OR hs.khu_vuc ILIKE $2 OR hs.tieu_su ILIKE $2)
      ORDER BY nd.ho_ten ASC
      LIMIT 10
    `;
    const result = await pool.query(query, [currentUserId, searchPattern]);
    return result.rows;
  }

  async getSearchHistory(nguoiDungId: number): Promise<any[]> {
    return await this.lichSuRepo.findByNguoiDungId(nguoiDungId);
  }

  async clearSearchHistory(nguoiDungId: number): Promise<void> {
    await this.lichSuRepo.deleteByNguoiDungId(nguoiDungId);
  }
}
