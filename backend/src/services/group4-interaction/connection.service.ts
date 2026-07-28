import { YeuCauKetNoiRepository } from "../../repositories/group4-interaction/yeuCauKetNoi.repository";
import { QuanHeKetNoiRepository } from "../../repositories/group4-interaction/quanHeKetNoi.repository";
import { NguoiDungRepository } from "../../repositories/group1-user/nguoiDung.repository";
import { pool } from "../../config/db";
import { AppError, ConflictError, ForbiddenError, NotFoundError } from "../../utils/AppError";

export class ConnectionService {
  private yeuCauRepo = new YeuCauKetNoiRepository();
  private quanHeRepo = new QuanHeKetNoiRepository();
  private nguoiDungRepo = new NguoiDungRepository();

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
      SELECT DISTINCT
        nd.nguoi_dung_id AS "nguoiDungId",
        nd.ho_ten AS "hoTen",
        hs.anh_dai_dien AS "anhDaiDien",
        hs.khu_vuc AS "khuVuc",
        COUNT(hss.so_thich_id) OVER (PARTITION BY nd.nguoi_dung_id) AS "soSoThichChung"
      FROM nguoi_dung nd
      JOIN ho_so_nguoi_dung hs ON nd.nguoi_dung_id = hs.nguoi_dung_id
      JOIN ho_so_so_thich hss ON hs.ho_so_id = hss.ho_so_id
      WHERE hss.so_thich_id IN (
        SELECT hss2.so_thich_id FROM ho_so_nguoi_dung hs2
        JOIN ho_so_so_thich hss2 ON hs2.ho_so_id = hss2.ho_so_id
        WHERE hs2.nguoi_dung_id = $1
      )
      AND nd.nguoi_dung_id != $1
      ORDER BY "soSoThichChung" DESC
      LIMIT 5
    `;
    const result = await pool.query(query, [nguoiDungId]);
    return result.rows;
  }

  async removeConnection(nguoiDungId: number, connectedUserId: number): Promise<void> {
    const removed = await this.quanHeRepo.delete(nguoiDungId, connectedUserId);
    if (!removed) {
      throw new NotFoundError("Không tìm thấy kết nối với người dùng này.");
    }
  }
}
