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

  async removeConnection(nguoiDungId: number, connectedUserId: number): Promise<void> {
    const removed = await this.quanHeRepo.delete(nguoiDungId, connectedUserId);
    if (!removed) {
      throw new NotFoundError("Không tìm thấy kết nối với người dùng này.");
    }
  }
}
