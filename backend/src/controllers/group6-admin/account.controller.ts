import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { AccountService } from "../../services/group6-admin/account.service";

export class AccountController {
  private accountService = new AccountService();

  // ==================== UC7.1: QUẢN LÝ TÀI KHOẢN ====================

  public getUsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const limit = parseInt(req.query.limit as string, 10) || 50;
      const offset = parseInt(req.query.offset as string, 10) || 0;

      const result = await this.accountService.getUsers(limit, offset);
      res.status(200).json({ success: true, data: result });
    });

  public getUserById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const nguoiDungId = parseInt(req.params.id as string, 10);
      if (isNaN(nguoiDungId)) {
        res.status(400).json({ success: false, message: "ID người dùng không hợp lệ." });
        return;
      }

      const result = await this.accountService.getUserById(nguoiDungId);
      res.status(200).json({ success: true, data: result });
    });

  public updateUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const nguoiDungId = parseInt(req.params.id as string, 10);
      const adminId = req.user!.nguoiDungId;

      if (isNaN(nguoiDungId)) {
        res.status(400).json({ success: false, message: "ID người dùng không hợp lệ." });
        return;
      }

      const { hoTen, email, soDienThoai, trangThai } = req.body;
      const result = await this.accountService.updateUser(nguoiDungId, adminId, { hoTen, email, soDienThoai, trangThai });
      res.status(200).json({ success: true, data: result });
    });

  public lockAccount = asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const nguoiDungId = parseInt(req.params.id as string, 10);
      const adminId = req.user!.nguoiDungId;

      if (isNaN(nguoiDungId)) {
        res.status(400).json({ success: false, message: "ID người dùng không hợp lệ." });
        return;
      }

      const result = await this.accountService.lockAccount(nguoiDungId, adminId);
      res.status(200).json({ success: true, message: "Đã khóa tài khoản.", data: result });
    });

  public unlockAccount = asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const nguoiDungId = parseInt(req.params.id as string, 10);
      const adminId = req.user!.nguoiDungId;

      if (isNaN(nguoiDungId)) {
        res.status(400).json({ success: false, message: "ID người dùng không hợp lệ." });
        return;
      }

      const result = await this.accountService.unlockAccount(nguoiDungId, adminId);
      res.status(200).json({ success: true, message: "Đã mở khóa tài khoản.", data: result });
    });
}

