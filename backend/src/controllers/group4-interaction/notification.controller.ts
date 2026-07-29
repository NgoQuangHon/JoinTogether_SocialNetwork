import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { NotificationService } from "../../services/group4-interaction/notification.service";

export class NotificationController {
  private notificationService = new NotificationService();

  public getNotifications = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const nguoiDungId = req.user!.nguoiDungId;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const offset = parseInt(req.query.offset as string, 10) || 0;

      const result = await this.notificationService.getNotifications(nguoiDungId, limit, offset);
      res.status(200).json({ success: true, data: result });
    },
  );

  public deleteNotification = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const nguoiDungId = req.user!.nguoiDungId;
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: "ID thông báo không hợp lệ." });
        return;
      }

      await this.notificationService.deleteNotification(id, nguoiDungId);
      res.status(200).json({ success: true, message: "Đã xóa thông báo." });
    },
  );
}
