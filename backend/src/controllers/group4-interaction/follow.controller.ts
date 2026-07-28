import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ConnectionService } from "../../services/group4-interaction/connection.service";

export class FollowController {
  private connectionService = new ConnectionService();

  public follow = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const nguoiTheoDoiId = req.user!.nguoiDungId;
    const nguoiDuocTheoDoiId = parseInt(req.params.id as string, 10);
    if (isNaN(nguoiDuocTheoDoiId)) {
      res.status(400).json({ success: false, message: "ID người dùng không hợp lệ." });
      return;
    }
    const result = await this.connectionService.follow(nguoiTheoDoiId, nguoiDuocTheoDoiId);
    res.status(201).json({ success: true, data: result, message: "Đã theo dõi." });
  });

  public unfollow = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const nguoiTheoDoiId = req.user!.nguoiDungId;
    const nguoiDuocTheoDoiId = parseInt(req.params.id as string, 10);
    if (isNaN(nguoiDuocTheoDoiId)) {
      res.status(400).json({ success: false, message: "ID người dùng không hợp lệ." });
      return;
    }
    await this.connectionService.unfollow(nguoiTheoDoiId, nguoiDuocTheoDoiId);
    res.status(200).json({ success: true, message: "Đã bỏ theo dõi." });
  });

  public checkFollowing = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const nguoiTheoDoiId = req.user!.nguoiDungId;
    const nguoiDuocTheoDoiId = parseInt(req.params.id as string, 10);
    if (isNaN(nguoiDuocTheoDoiId)) {
      res.status(400).json({ success: false, message: "ID người dùng không hợp lệ." });
      return;
    }
    const result = await this.connectionService.isFollowing(nguoiTheoDoiId, nguoiDuocTheoDoiId);
    res.status(200).json({ success: true, data: { isFollowing: result } });
  });
}
