import { NhatKyQuanTriRepository } from "../../repositories/group6-admin/nhatKyQuanTri.repository";

export class AdminService {
  private nhatKyRepo = new NhatKyQuanTriRepository();

  // ==================== UC6.3/UC7.3: NHẬT KÝ QUẢN TRỊ ====================

async getAuditLogs(
    limit: number = 50,
    offset: number = 0,
    filters?: { hanhDong?: string; nguoiDungId?: number; tuNgay?: string; denNgay?: string }
  ): Promise<{ logs: any[]; total: number }> {
    const logs = await this.nhatKyRepo.findAll(limit, offset, filters);
    return { logs, total: logs.length };
  }
}

