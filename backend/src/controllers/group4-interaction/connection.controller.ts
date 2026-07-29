import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ConnectionService } from "../../services/group4-interaction/connection.service";

export class ConnectionController {
  private connectionService = new ConnectionService();

  public sendRequest = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const nguoiGuiId = req.user!.nguoiDungId;
      const { nguoiNhanId, loiNhan } = req.body;

      if (!nguoiNhanId) {
        res.status(400).json({
          success: false,
          message: "Vui lòng cung cấp ID người nhận.",
        });
        return;
      }

      const result = await this.connectionService.sendRequest(
        nguoiGuiId,
        nguoiNhanId,
        loiNhan,
      );
      res.status(201).json({
        success: true,
        message: "Gửi yêu cầu kết nối thành công.",
        data: result,
      });
    },
  );

  public respondToRequest = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const nguoiDungId = req.user!.nguoiDungId;
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        throw new Error("ID yêu cầu không hợp lệ.");
      }

      const { accept } = req.body;
      if (accept === undefined) {
        res.status(400).json({
          success: false,
          message: "Vui lòng cung cấp giá trị accept (true/false).",
        });
        return;
      }

      const result = await this.connectionService.respondToRequest(
        id,
        nguoiDungId,
        accept,
      );
      res.status(200).json({
        success: true,
        message: accept
          ? "Đã chấp nhận yêu cầu kết nối."
          : "Đã từ chối yêu cầu kết nối.",
        data: result,
      });
    },
  );

  public getPendingRequests = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const nguoiDungId = req.user!.nguoiDungId;
      const result =
        await this.connectionService.getPendingRequests(nguoiDungId);
      res.status(200).json({ success: true, data: result });
    },
  );

  public getConnections = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const nguoiDungId = req.user!.nguoiDungId;
      const result = await this.connectionService.getConnections(nguoiDungId);
      res.status(200).json({ success: true, data: result });
    },
  );

  public getSuggestions = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const nguoiDungId = req.user!.nguoiDungId;
      const result = await this.connectionService.getSuggestions(nguoiDungId);
      res.status(200).json({ success: true, data: result });
    },
  );

  public removeConnection = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const nguoiDungId = req.user!.nguoiDungId;
      const connectedUserId = parseInt(req.params.id as string, 10);
      if (isNaN(connectedUserId)) {
        throw new Error("ID người dùng không hợp lệ.");
      }

      await this.connectionService.removeConnection(
        nguoiDungId,
        connectedUserId,
      );
      res
        .status(200)
        .json({ success: true, message: "Đã hủy kết nối thành công." });
    },
  );

  public getConnectionStatus = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const nguoiDungId = req.user!.nguoiDungId;
      const targetUserId = parseInt(req.params.id as string, 10);
      if (isNaN(targetUserId)) {
        res.status(400).json({ success: false, message: "ID người dùng không hợp lệ." });
        return;
      }
      const result = await this.connectionService.getConnectionStatus(nguoiDungId, targetUserId);
      res.status(200).json({ success: true, data: result });
    },
  );

  public blockUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const nguoiChanId = req.user!.nguoiDungId;
      const nguoiBiChanId = parseInt(req.params.id as string, 10);
      if (isNaN(nguoiBiChanId)) {
        res.status(400).json({ success: false, message: "ID người dùng không hợp lệ." });
        return;
      }
      await this.connectionService.blockUser(nguoiChanId, nguoiBiChanId);
      res.status(200).json({ success: true, message: "Đã chặn người dùng." });
    },
  );

  public unblockUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const nguoiChanId = req.user!.nguoiDungId;
      const nguoiBiChanId = parseInt(req.params.id as string, 10);
      if (isNaN(nguoiBiChanId)) {
        res.status(400).json({ success: false, message: "ID người dùng không hợp lệ." });
        return;
      }
      await this.connectionService.unblockUser(nguoiChanId, nguoiBiChanId);
      res.status(200).json({ success: true, message: "Đã bỏ chặn người dùng." });
    },
  );

  public checkBlocked = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const nguoiChanId = req.user!.nguoiDungId;
      const nguoiBiChanId = parseInt(req.params.id as string, 10);
      if (isNaN(nguoiBiChanId)) {
        res.status(400).json({ success: false, message: "ID người dùng không hợp lệ." });
        return;
      }
      const blocked = await this.connectionService.isBlocked(nguoiChanId, nguoiBiChanId);
      res.status(200).json({ success: true, data: { blocked } });
    },
  );
}
