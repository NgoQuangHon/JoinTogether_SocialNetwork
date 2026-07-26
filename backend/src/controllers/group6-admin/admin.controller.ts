import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { AdminService } from "../../services/group6-admin/admin.service";

export class AdminController {
  private adminService = new AdminService();

  // ==================== UC6.3/UC7.3: NHẬT KÝ QUẢN TRỊ ====================

  public getAuditLogs = asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const limit = parseInt(req.query.limit as string, 10) || 50;
      const offset = parseInt(req.query.offset as string, 10) || 0;
      const hanhDong = req.query.hanhDong as string | undefined;
      const nguoiDungIdParam = req.query.nguoiDungId as string | undefined;
      const tuNgay = req.query.tuNgay as string | undefined;
      const denNgay = req.query.denNgay as string | undefined;

      const filters: any = {};
      if (hanhDong) filters.hanhDong = hanhDong;
      if (nguoiDungIdParam) filters.nguoiDungId = parseInt(nguoiDungIdParam, 10);
      if (tuNgay) filters.tuNgay = tuNgay;
      if (denNgay) filters.denNgay = denNgay;

const result = await this.adminService.getAuditLogs(limit, offset, Object.keys(filters).length > 0 ? filters : undefined);
      res.status(200).json({ success: true, data: result });
    });
}

