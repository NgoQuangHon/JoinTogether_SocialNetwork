import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { MemberService } from "../../services/group3-activity/member.service";

export class MemberController {
  private memberService = new MemberService();

  // ==================== UC4.1: GỬI YÊU CẦU THAM GIA ====================

  public sendJoinRequest = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const nguoiDungId = req.user!.nguoiDungId;
      const hoatDongId = parseInt(req.params.id as string, 10);

      if (isNaN(hoatDongId)) {
        res
          .status(400)
          .json({ success: false, message: "ID hoạt động không hợp lệ." });
        return;
      }

      const result = await this.memberService.sendJoinRequest(
        nguoiDungId,
        hoatDongId,
      );
      res
        .status(201)
        .json({
          success: true,
          message: "Đã gửi yêu cầu tham gia.",
          data: result,
        });
    },
  );

  // ==================== UC4.3: XÁC NHẬN THAM GIA ====================

  public getPendingRequests = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const hoatDongId = parseInt(req.params.id as string, 10);

      if (isNaN(hoatDongId)) {
        res
          .status(400)
          .json({ success: false, message: "ID hoạt động không hợp lệ." });
        return;
      }

      const result = await this.memberService.getPendingRequests(hoatDongId);
      res.status(200).json({ success: true, data: result });
    },
  );

  public approveRequest = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const nguoiToChucId = req.user!.nguoiDungId;
      const yeuCauId = parseInt(req.params.yeuCauId as string, 10);

      if (isNaN(yeuCauId)) {
        res
          .status(400)
          .json({ success: false, message: "ID yêu cầu không hợp lệ." });
        return;
      }

      const result = await this.memberService.approveRequest(
        yeuCauId,
        nguoiToChucId,
      );
      res
        .status(200)
        .json({
          success: true,
          message: "Đã chấp nhận yêu cầu tham gia.",
          data: result,
        });
    },
  );

  public rejectRequest = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const nguoiToChucId = req.user!.nguoiDungId;
      const yeuCauId = parseInt(req.params.yeuCauId as string, 10);

      if (isNaN(yeuCauId)) {
        res
          .status(400)
          .json({ success: false, message: "ID yêu cầu không hợp lệ." });
        return;
      }

      const result = await this.memberService.rejectRequest(
        yeuCauId,
        nguoiToChucId,
      );
      res
        .status(200)
        .json({
          success: true,
          message: "Đã từ chối yêu cầu tham gia.",
          data: result,
        });
    },
  );

  // ==================== QUẢN LÝ THÀNH VIÊN ====================

  public getMembers = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const hoatDongId = parseInt(req.params.id as string, 10);

      if (isNaN(hoatDongId)) {
        res
          .status(400)
          .json({ success: false, message: "ID hoạt động không hợp lệ." });
        return;
      }

      const result = await this.memberService.getMembers(hoatDongId);
      res.status(200).json({ success: true, data: result });
    },
  );

  public removeMember = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const nguoiToChucId = req.user!.nguoiDungId;
      const thanhVienId = parseInt(req.params.thanhVienId as string, 10);

      if (isNaN(thanhVienId)) {
        res
          .status(400)
          .json({ success: false, message: "ID thành viên không hợp lệ." });
        return;
      }

      await this.memberService.removeMember(thanhVienId, nguoiToChucId);
      res
        .status(200)
        .json({ success: true, message: "Đã xóa thành viên khỏi hoạt động." });
    },
  );

  public leaveActivity = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const nguoiDungId = req.user!.nguoiDungId;
      const hoatDongId = parseInt(req.params.id as string, 10);

      if (isNaN(hoatDongId)) {
        res
          .status(400)
          .json({ success: false, message: "ID hoạt động không hợp lệ." });
        return;
      }

      await this.memberService.leaveActivity(nguoiDungId, hoatDongId);
      res
        .status(200)
        .json({ success: true, message: "Đã rời khỏi hoạt động." });
    },
  );

  // ==================== XÁC NHẬN THAM DỰ ====================

  public confirmAttendance = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const nguoiToChucId = req.user!.nguoiDungId;
      const thanhVienId = parseInt(req.params.thanhVienId as string, 10);

      if (isNaN(thanhVienId)) {
        res
          .status(400)
          .json({ success: false, message: "ID thành viên không hợp lệ." });
        return;
      }

      const result = await this.memberService.confirmAttendance(
        thanhVienId,
        nguoiToChucId,
      );
      res
        .status(200)
        .json({ success: true, message: "Đã xác nhận tham dự.", data: result });
    },
  );

  public getAttendanceList = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const hoatDongId = parseInt(req.params.id as string, 10);

      if (isNaN(hoatDongId)) {
        res
          .status(400)
          .json({ success: false, message: "ID hoạt động không hợp lệ." });
        return;
      }

      const result = await this.memberService.getAttendanceList(hoatDongId);
      res.status(200).json({ success: true, data: result });
    },
  );
}
