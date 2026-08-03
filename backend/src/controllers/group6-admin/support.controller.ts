import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { SupportService } from "../../services/group6-admin/support.service";

export class SupportController {
  private supportService = new SupportService();

  // POST /api/support – Người dùng gửi yêu cầu hỗ trợ
  public createSupportRequest = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const nguoiGuiId = req.user!.nguoiDungId;
      const { loaiHoTro, tieuDe, moTa } = req.body;

      if (!tieuDe || !moTa) {
        res.status(400).json({
          success: false,
          message: "Vui lòng cung cấp tiêu đề và mô tả chi tiết.",
        });
        return;
      }

      const result = await this.supportService.createSupportRequest(
        nguoiGuiId,
        { loaiHoTro, tieuDe, moTa },
      );

      res.status(201).json({
        success: true,
        message: "Đã gửi yêu cầu hỗ trợ thành công.",
        data: result,
      });
    },
  );

  // GET /api/support – Admin xem danh sách
  public getSupportRequests = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const trangThai = req.query.trangThai as string | undefined;
      const result = await this.supportService.getSupportRequests(trangThai);
      res.status(200).json({ success: true, data: result });
    },
  );

  // GET /api/support/:id – Admin xem chi tiết
  public getSupportRequestById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        res
          .status(400)
          .json({ success: false, message: "ID yêu cầu không hợp lệ." });
        return;
      }
      const result = await this.supportService.getSupportRequestById(id);
      res.status(200).json({ success: true, data: result });
    },
  );

  // PUT /api/support/:id/process – Admin xử lý
  public processSupportRequest = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const nguoiXuLyId = req.user!.nguoiDungId;
      const id = parseInt(req.params.id as string, 10);
      const { trangThai, ghiChuAdmin } = req.body;

      if (isNaN(id)) {
        res
          .status(400)
          .json({ success: false, message: "ID yêu cầu không hợp lệ." });
        return;
      }
      if (!trangThai) {
        res.status(400).json({
          success: false,
          message: "Vui lòng cung cấp trạng thái xử lý.",
        });
        return;
      }

      const result = await this.supportService.processSupportRequest(
        id,
        nguoiXuLyId,
        { trangThai, ghiChuAdmin },
      );
      res.status(200).json({
        success: true,
        message: "Đã xử lý yêu cầu hỗ trợ.",
        data: result,
      });
    },
  );
}
