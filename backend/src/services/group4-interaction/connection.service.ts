import { YeuCauKetNoiRepository } from "../../repositories/group4-interaction/yeuCauKetNoi.repository";
import { QuanHeKetNoiRepository } from "../../repositories/group4-interaction/quanHeKetNoi.repository";
import { TheoDoiRepository } from "../../repositories/group4-interaction/theoDoi.repository";
import { NguoiDungRepository } from "../../repositories/group1-user/nguoiDung.repository";
import { pool } from "../../config/db";
import { AppError, ConflictError, ForbiddenError, NotFoundError } from "../../utils/AppError";

export class ConnectionService {
  private yeuCauRepo = new YeuCauKetNoiRepository();
  private quanHeRepo = new QuanHeKetNoiRepository();
  private nguoiDungRepo = new NguoiDungRepository();
  private theoDoiRepo = new TheoDoiRepository();

  async sendRequest(nguoiGuiId: number, nguoiNhanId: number, loiNhan?: string): Promise<any> {
    if (nguoiGuiId === nguoiNhanId) {
      throw new AppError("Không thể gửi yêu cầu kết nối cho chính mình.", 400);
    }

    // Check receiver exists
    const receiver = await this.nguoiDungRepo.findById(nguoiNhanId);
    if (!receiver) {
      throw new NotFoundError("Người dùng không tồn tại.");
    }

    // Check if already connected
    const existingConnection = await this.quanHeRepo.findExistingConnection(nguoiGuiId, nguoiNhanId);
    if (existingConnection) {
      throw new ConflictError("Đã kết nối với người dùng này.");
    }

    // Check if request already exists
    const existingRequest = await this.yeuCauRepo.findExistingRequest(nguoiGuiId, nguoiNhanId);
    if (existingRequest) {
      throw new ConflictError("Đã có yêu cầu kết nối đang chờ xử lý.");
    }

    return await this.yeuCauRepo.create({
      nguoiGuiId,
      nguoiNhanId,
      loiNhan: loiNhan === undefined || loiNhan === null ? null : loiNhan,
      trangThai: 'PENDING',
    });
  }

  async respondToRequest(yeuCauId: number, nguoiDungId: number, accept: boolean): Promise<any> {
    const request = await this.yeuCauRepo.findById(yeuCauId);
    if (!request) {
      throw new NotFoundError("Yêu cầu kết nối không tồn tại.");
    }

    if (request.nguoiNhanId !== nguoiDungId) {
      throw new ForbiddenError("Bạn không có quyền xử lý yêu cầu này.");
    }

    if (request.trangThai !== 'PENDING') {
      throw new ConflictError("Yêu cầu đã được xử lý trước đó.");
    }

    if (!accept) {
      // Reject: chỉ 1 lệnh ghi, không cần transaction
      return await this.yeuCauRepo.updateStatus(yeuCauId, 'REJECTED');
    }

    // Accept: tạo quan hệ kết nối + cập nhật trạng thái yêu cầu phải cùng
    // thành công hoặc cùng thất bại, nên bọc trong 1 transaction.
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      await this.quanHeRepo.create(
        {
          nguoiDungId1: request.nguoiGuiId,
          nguoiDungId2: request.nguoiNhanId,
          trangThai: 'ACTIVE',
        },
        client,
      );
      const updated = await this.yeuCauRepo.updateStatus(yeuCauId, 'ACCEPTED', client);

      await client.query("COMMIT");
      return updated;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async getPendingRequests(nguoiDungId: number): Promise<any[]> {
    return await this.yeuCauRepo.findPendingByUser(nguoiDungId);
  }

  async getConnections(nguoiDungId: number): Promise<any[]> {
    return await this.quanHeRepo.findConnectionsByUser(nguoiDungId);
  }

  async getSuggestions(nguoiDungId: number): Promise<any[]> {
    const query = `
      SELECT
        nd.nguoi_dung_id AS "nguoiDungId",
        nd.ho_ten AS "hoTen",
        hs.anh_dai_dien AS "anhDaiDien",
        hs.khu_vuc AS "khuVuc",
        (
          CASE WHEN hs.tieu_su IS NOT NULL AND hs.tieu_su != '' THEN 1 ELSE 0 END +
          CASE WHEN hs.ngay_sinh IS NOT NULL THEN 1 ELSE 0 END +
          CASE WHEN hs.khu_vuc IS NOT NULL AND hs.khu_vuc != '' THEN 1 ELSE 0 END +
          CASE WHEN hs.gioi_tinh IS NOT NULL AND hs.gioi_tinh != '' THEN 1 ELSE 0 END +
          CASE WHEN hs.muc_tieu_tham_gia IS NOT NULL AND hs.muc_tieu_tham_gia != '' THEN 1 ELSE 0 END +
          CASE WHEN hs.thoi_gian_ranh IS NOT NULL AND hs.thoi_gian_ranh != '' THEN 1 ELSE 0 END +
          CASE WHEN hs.anh_dai_dien IS NOT NULL AND hs.anh_dai_dien != '' THEN 1 ELSE 0 END
        ) AS "soTruongHoanThanh"
      FROM nguoi_dung nd
      JOIN ho_so_nguoi_dung hs ON nd.nguoi_dung_id = hs.nguoi_dung_id
      WHERE nd.nguoi_dung_id != $1
        AND NOT EXISTS (
          SELECT 1 FROM theo_doi WHERE nguoi_theo_doi_id = $1 AND nguoi_duoc_theo_doi_id = nd.nguoi_dung_id
        )
      ORDER BY "soTruongHoanThanh" DESC, RANDOM()
      LIMIT 5
    `;
    const result = await pool.query(query, [nguoiDungId]);
    const rows = result.rows.map((r: any) => ({
      ...r,
      hoanThanhPhanTram: Math.round((r.soTruongHoanThanh / 7) * 100),
    }));
    return rows;
  }

  async follow(nguoiTheoDoiId: number, nguoiDuocTheoDoiId: number): Promise<any> {
    if (nguoiTheoDoiId === nguoiDuocTheoDoiId) {
      throw new AppError("Không thể theo dõi chính mình.", 400);
    }
    const existing = await this.theoDoiRepo.isFollowing(nguoiTheoDoiId, nguoiDuocTheoDoiId);
    if (existing) {
      throw new ConflictError("Bạn đã theo dõi người dùng này rồi.");
    }
    return await this.theoDoiRepo.create(nguoiTheoDoiId, nguoiDuocTheoDoiId);
  }

  async unfollow(nguoiTheoDoiId: number, nguoiDuocTheoDoiId: number): Promise<void> {
    const deleted = await this.theoDoiRepo.delete(nguoiTheoDoiId, nguoiDuocTheoDoiId);
    if (!deleted) {
      throw new NotFoundError("Bạn chưa theo dõi người dùng này.");
    }
  }

  async isFollowing(nguoiTheoDoiId: number, nguoiDuocTheoDoiId: number): Promise<boolean> {
    return await this.theoDoiRepo.isFollowing(nguoiTheoDoiId, nguoiDuocTheoDoiId);
  }

  async removeConnection(nguoiDungId: number, connectedUserId: number): Promise<void> {
    const removed = await this.quanHeRepo.delete(nguoiDungId, connectedUserId);
    if (!removed) {
      throw new NotFoundError("Không tìm thấy kết nối với người dùng này.");
    }
  }
}
