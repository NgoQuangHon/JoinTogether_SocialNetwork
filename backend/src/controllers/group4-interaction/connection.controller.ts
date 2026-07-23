import { Request, Response } from "express";
import { ConnectionService } from "../../services/group4-interaction/connection.service";

export class ConnectionController {
  private connectionService = new ConnectionService();

  public sendRequest = async (req: Request, res: Response): Promise<void> => {
    try {
      const nguoiGuiId = (req as any).user.nguoiDungId;
      const { nguoiNhanId, loiNhan } = req.body;

      if (!nguoiNhanId) {
        res.status(400).json({ success: false, message: "Vui lòng cung cấp ID người nhận." });
        return;
      }

      const result = await this.connectionService.sendRequest(nguoiGuiId, nguoiNhanId, loiNhan);
      res.status(201).json({ success: true, message: "Gửi yêu cầu kết nối thành công.", data: result });
    } catch (error: any) {
      const statusCode = error.message.includes("đã") ? 409 : 400;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  };

  public respondToRequest = async (req: Request, res: Response): Promise<void> => {
    try {
      const nguoiDungId = (req as any).user.nguoiDungId;
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) { throw new Error("ID yêu cầu không hợp lệ."); }

      const { accept } = req.body;
      if (accept === undefined) {
        res.status(400).json({ success: false, message: "Vui lòng cung cấp giá trị accept (true/false)." });
        return;
      }

      const result = await this.connectionService.respondToRequest(id, nguoiDungId, accept);
      res.status(200).json({
        success: true,
        message: accept ? "Đã chấp nhận yêu cầu kết nối." : "Đã từ chối yêu cầu kết nối.",
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  public getPendingRequests = async (req: Request, res: Response): Promise<void> => {
    try {
      const nguoiDungId = (req as any).user.nguoiDungId;
      const result = await this.connectionService.getPendingRequests(nguoiDungId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  public getConnections = async (req: Request, res: Response): Promise<void> => {
    try {
      const nguoiDungId = (req as any).user.nguoiDungId;
      const result = await this.connectionService.getConnections(nguoiDungId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  public removeConnection = async (req: Request, res: Response): Promise<void> => {
    try {
      const nguoiDungId = (req as any).user.nguoiDungId;
      const connectedUserId = parseInt(req.params.id as string, 10);
      if (isNaN(connectedUserId)) { throw new Error("ID người dùng không hợp lệ."); }

      await this.connectionService.removeConnection(nguoiDungId, connectedUserId);
      res.status(200).json({ success: true, message: "Đã hủy kết nối thành công." });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };
}
