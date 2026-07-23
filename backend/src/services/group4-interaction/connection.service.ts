import { YeuCauKetNoiRepository } from "../../repositories/group4-interaction/yeuCauKetNoi.repository";
import { QuanHeKetNoiRepository } from "../../repositories/group4-interaction/quanHeKetNoi.repository";
import { NguoiDungRepository } from "../../repositories/group1-user/nguoiDung.repository";

export class ConnectionService {
  private yeuCauRepo = new YeuCauKetNoiRepository();
  private quanHeRepo = new QuanHeKetNoiRepository();
  private nguoiDungRepo = new NguoiDungRepository();

  async sendRequest(nguoiGuiId: number, nguoiNhanId: number, loiNhan?: string): Promise<any> {
    if (nguoiGuiId === nguoiNhanId) {
      throw new Error("Không thể gửi yêu cầu kết nối cho chính mình.");
    }

    // Check receiver exists
    const receiver = await this.nguoiDungRepo.findById(nguoiNhanId);
    if (!receiver) {
      throw new Error("Người dùng không tồn tại.");
    }

    // Check if already connected
    const existingConnection = await this.quanHeRepo.findExistingConnection(nguoiGuiId, nguoiNhanId);
    if (existingConnection) {
      throw new Error("Đã kết nối với người dùng này.");
    }

    // Check if request already exists
    const existingRequest = await this.yeuCauRepo.findExistingRequest(nguoiGuiId, nguoiNhanId);
    if (existingRequest) {
      throw new Error("Đã có yêu cầu kết nối đang chờ xử lý.");
    }

    return await this.yeuCauRepo.create({
      nguoiGuiId,
      nguoiNhanId,
      loiNhan: loiNhan ?? null,
      trangThai: 'PENDING',
    });
  }

  async respondToRequest(yeuCauId: number, nguoiDungId: number, accept: boolean): Promise<any> {
    const request = await this.yeuCauRepo.findById(yeuCauId);
    if (!request) {
      throw new Error("Yêu cầu kết nối không tồn tại.");
    }

    if (request.nguoiNhanId !== nguoiDungId) {
      throw new Error("Bạn không có quyền xử lý yêu cầu này.");
    }

    if (request.trangThai !== 'PENDING') {
      throw new Error("Yêu cầu đã được xử lý trước đó.");
    }

    if (accept) {
      // Accept: create connection
      await this.quanHeRepo.create({
        nguoiDungId1: request.nguoiGuiId,
        nguoiDungId2: request.nguoiNhanId,
        trangThai: 'ACTIVE',
      });
      return await this.yeuCauRepo.updateStatus(yeuCauId, 'ACCEPTED');
    } else {
      // Reject
      return await this.yeuCauRepo.updateStatus(yeuCauId, 'REJECTED');
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
      throw new Error("Không tìm thấy kết nối với người dùng này.");
    }
  }
}
