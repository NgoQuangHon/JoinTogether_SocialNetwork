import { Request, Response } from "express";
import { ChatService } from "../../services/group4-interaction/chat.service";
import { NotificationService } from "../../services/group4-interaction/notification.service";

export class ChatController {
  private chatService = new ChatService();
  private notificationService = new NotificationService();

  // ==================== PHÒNG TRÒ CHUYỆN ====================

  public getOrCreateRoom = async (req: Request, res: Response): Promise<void> => {
    try {
      const hoatDongId = parseInt(req.params.hoatDongId as string, 10);

      if (isNaN(hoatDongId)) {
        res.status(400).json({ success: false, message: "ID hoạt động không hợp lệ." });
        return;
      }

      const result = await this.chatService.getOrCreateRoom(hoatDongId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  public getUserRooms = async (req: Request, res: Response): Promise<void> => {
    try {
      const nguoiDungId = (req as any).user.nguoiDungId;
      const result = await this.chatService.getUserRooms(nguoiDungId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  // ==================== TIN NHẮN ====================

  public sendMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const nguoiGuiId = (req as any).user.nguoiDungId;
      const phongId = parseInt(req.params.phongId as string, 10);
      const { noiDung } = req.body;

      if (isNaN(phongId)) {
        res.status(400).json({ success: false, message: "ID phòng không hợp lệ." });
        return;
      }

      if (!noiDung) {
        res.status(400).json({ success: false, message: "Nội dung tin nhắn không được để trống." });
        return;
      }

      const result = await this.chatService.sendMessage(phongId, nguoiGuiId, noiDung);
      res.status(201).json({ success: true, message: "Đã gửi tin nhắn.", data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  public getMessages = async (req: Request, res: Response): Promise<void> => {
    try {
      const phongId = parseInt(req.params.phongId as string, 10);
      const limit = parseInt(req.query.limit as string, 10) || 50;
      const offset = parseInt(req.query.offset as string, 10) || 0;

      if (isNaN(phongId)) {
        res.status(400).json({ success: false, message: "ID phòng không hợp lệ." });
        return;
      }

      const result = await this.chatService.getMessages(phongId, limit, offset);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  public deleteMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const nguoiDungId = (req as any).user.nguoiDungId;
      const tinNhanId = parseInt(req.params.tinNhanId as string, 10);

      if (isNaN(tinNhanId)) {
        res.status(400).json({ success: false, message: "ID tin nhắn không hợp lệ." });
        return;
      }

      await this.chatService.deleteMessage(tinNhanId, nguoiDungId);
      res.status(200).json({ success: true, message: "Đã xóa tin nhắn." });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  // ==================== THÔNG BÁO ====================

  public getNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
      const nguoiNhanId = (req as any).user.nguoiDungId;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const offset = parseInt(req.query.offset as string, 10) || 0;

      const result = await this.notificationService.getNotifications(nguoiNhanId, limit, offset);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  public deleteNotification = async (req: Request, res: Response): Promise<void> => {
    try {
      const thongBaoId = parseInt(req.params.thongBaoId as string, 10);

      if (isNaN(thongBaoId)) {
        res.status(400).json({ success: false, message: "ID thông báo không hợp lệ." });
        return;
      }

      await this.notificationService.deleteNotification(thongBaoId, (req as any).user.nguoiDungId);
      res.status(200).json({ success: true, message: "Đã xóa thông báo." });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };
}

